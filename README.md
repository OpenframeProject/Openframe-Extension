# Openframe Extension

[![Build Status](https://travis-ci.org/OpenframeProject/Openframe-Extension.svg?branch=master)](https://travis-ci.org/OpenframeProject/Openframe-Extension) [![Coverage Status](https://coveralls.io/repos/github/OpenframeProject/Openframe-Extension/badge.svg?branch=master)](https://coveralls.io/github/OpenframeProject/Openframe-Extension?branch=master)

A base module used to create extensions for Openframe.

[Openframe](http://openframe.io) is an open source platform for displaying art. Frames running the [Openframe controller](https://github.com/OpenframeProject/Openframe) software can load extensions which add functionality.

## Developing an Extension

An extension is simply a node module which exports an instance of the Extension class. The Extension class constructor takes a single argument, a properties object which can be used to specify the extension's functionality.

The Extension class provides instance properties which give access to the REST API client (`this.rest`), the global event system (`this.pubsub`), and the frame model object (`this.frame`).

```javascript
...

module.exports = new Extension({
    // props
});

...
```

### Adding support for a new artwork format

An extension can add support for a new artwork 'format'. Conceptually, a format can be thought of as the 'media type' of the artwork, e.g. 'an image' or 'a shader'. A format defines how the frame controller should start and stop an artwork of its media type, and installs any dependencies that the media type needs in order to run.

Each artwork specifies exactly one format, and each frame can support any number of formats. Artworks can specify a config object which formats can use when determining how to display the artwork.

Each extension can define a single format.

To add a format, define a `format` property on the extension properties object:

```javascript
...

module.exports = new Extension({
    format: {
        // the name should be the same as the npm package name
        'name': pjson.name,
        // displayed to the user, perhaps?
        'display_name': 'Image',
        // does this type of artwork need to be downloaded to the frame?
        'download': true,
        // how do start this type of artwork? currently two token replacements, $filepath and $url
        'start_command': function(config) {
            debug('Artwork config: ', config);
            var command = 'image-player';
            config = config || {};
            if (config.display_mode) {
                switch (config.display_mode) {
                    case 'contain':
                        command += ' --contain';
                        break;
                    case 'cover':
                        command += ' --cover';
                        break;
                }
            }
            command += ' $filepath';
            return command;
        },
        // how do we stop this type of artwork?
        'end_command': 'pkill image-player'
    }
});

...
```

#### The format definition object

To define a format, we need to specify five values:

**name** {String}
A unique format name used by artworks to specify this format. We *highly* recommend using the npm package name in order to enforce uniqueness. E.g. 'openframe-glslviewer'

**display_name** {String}
A human-friendly name for the format, e.g. 'Shader'

**download** {Boolean}
Does the artwork need to be downloaded in order to run?

**start_command** {String | Function}
A string command or function returning a string command which will be executed when starting an artwork. If a function, it will be passed a config object optionally defined on the artwork being started. The output command can contain two tokens, '$filepath' and '$url', which will be replaced by their respective values.

**end_command** {String}
A string command executed when stopping an artwork.


For an example a format extension, see [Openframe-glslViewer](https://github.com/OpenframeProject/Openframe-glslViewer).

### Adding hardware extensions to the frame

An extension can also add functionality to the frame itself. Extensions might be used to interact with the frame hardware, for example allowing for a custom input device to be used via GPIO. In other cases, an extension might add functionality that interacts directly with artworks, for example by sending OSC messages.

```javascript
...

var gpio = require('onoff').Gpio;

module.exports = new Extension({
    init: function() {

        var button = new gpio(17, 'in', 'both'),    // add a button via GPIO
            pubsub = this.pubsub;                   // access to the global event system

        // when the button changes, publish an event
        button.watch(function(err, state) {
            if (err) debug(err);
            pubsub.publish('/openframe-gpio/17', state);
        });
    }
});

...
```

For an example frame extension, ~~see [Openframe-GPIOExample](https://github.com/jmwohl/Openframe-GPIO)~~ (we need to update this to the most recent extension structure).

### Installing dependencies

If a extension requires NPM packages, they should be included in the package.json `dependencies` (as with any other npm package).

Some extensions may need to install other types of dependencies, or run other types of non-nodejs installation processes. We recommend using [npm scripts](https://docs.npmjs.com/misc/scripts) to execute the install.sh shell script upon install. As a best practice, extensions that modify the system using install.sh should take care of undoing those changes using an uninstall.sh script, which is executed when the npm module is removed. See package.json, install.sh, and uninstall.sh.
