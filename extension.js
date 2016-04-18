var pjson = require('./package.json'),
    debug = require('debug')('openframe:baseextension'),
    Extension = module.exports;


Extension = function(props) {
    this.props = props;
    this._initialized = false;

    if (!this.props.init) {
        throw new Error('Extensions must define an init method.');
    }
};

// Called by the frame controller
Extension.prototype._init = function(OF) {
    if (this._initialized) return;

    this.frame = OF.getFrame();
    this.pubsub = OF.getPubsub();
    this.rest = OF.getRest();

    this.props.init();
};
