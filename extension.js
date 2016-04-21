var pjson = require('./package.json'),
    debug = require('debug')('openframe:extension'),
    Extension;

/**
 * Extension class.
 *
 * @param {Object} props User-defined properties of the extension.
 */
module.exports = Extension = function(props) {
    this.props = props;
    // this.frame = null;
    // this.pubsub = null;
    // this.rest = null;
    this._initialized = false;

    if (!this.props.init && !this.props.format) {
        throw new Error('Extensions must define an init method or a format definition object.');
    }
};

// Called by the frame controller
Extension.prototype._init = function(OF) {
    if (this._initialized) return;

    this.frame = OF.getFrame();
    this.pubsub = OF.getPubsub();
    this.rest = OF.getRest();

    // if the extension props contains a format, add it
    if (this.props.format) {
        OF.addFormat(this.props.format);
    }

    // if the extension props define an init method, call it
    if (typeof this.props.init === 'function') {
        this.props.init.call(this, OF);
    }

    this._initialized = true;
};