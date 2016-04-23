var assert = require('assert'),
    sinon = require('sinon'),
    Extension = require('../extension'),
    noop = function() {},
    OF;

beforeEach(function() {
    OF = {
        getPubsub: sinon.spy(),
        getRest: sinon.spy(),
        getFrame: sinon.spy(),
        addFormat: sinon.spy()
    };
});

describe('instantiation', function() {
    it('should throw an exception if format or init not defined', function() {
        try {
            new Extension({});
        } catch(e) {
            assert.equal(e.message, 'Extensions must define an init method or a format definition object.');
        }
    });
});

describe('_init', function() {
    it('should set _initialized to true when _init is called', function() {
        var extension = new Extension({
            init: noop
        });

        assert(!extension._initialized);

        extension._init(OF);

        assert(extension._initialized);
    });

    it('should attach API references from the frame controller for pubsub, rest, and frame model', function() {
        var extension = new Extension({
            init: noop
        });

        extension._init(OF);

        assert(OF.getPubsub.called);
        assert(OF.getRest.called);
        assert(OF.getFrame.called);
    });

    it('should not re-initialize if init called more than once', function() {
        var extension = new Extension({
            init: noop
        });

        extension._init(OF);
        extension._init(OF);

        console.log('---- ', OF.getPubsub.callCount);

        assert(OF.getPubsub.calledOnce);

    });
});

describe('init', function() {
    it('should call the supplied init function', function() {
        var init = sinon.spy(),
            extension = new Extension({
                init: init
            });

        extension._init(OF);

        assert(init.called);
    });
});

describe('format', function() {
    it('should call addFormat if a format object is specified', function() {
        var extension = new Extension({
            // TODO: no validation on format object at present
            format: {}
        });

        extension._init(OF);

        assert(OF.addFormat.called);
    });
});
