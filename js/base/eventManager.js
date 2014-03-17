(function() {

    var eventListeners = {};

    var addListener = function(eventType, listener) {
        var listeners = eventListeners[eventType] = eventListeners[eventType] || [];
        listeners.push(listener);
    };

    var removeListener = function(eventType, listener) {
        var i;
        var listeners = eventListeners[eventType];
        var lLen = listeners.length;
        var removeIndex;
        if(!listeners) {
            throw new Error('Illegal eventType : ' + eventType);
        }
        for(i=0; i<lLen; i++) {
            if(listener === listeners[i]) {
                removeIndex = i;
                break;
            }
        }
        removeIndex && listeners.splice(removeIndex, 1);
    };

    var fireEvent = function(eventType, data) {
        var i, e, lLen;
        var listeners = eventListeners[eventType];
        if(!listeners) {
            return;
        }
        lLen = listeners.length;
        for(i=0; i<lLen; i++) {
            e = {
                type : eventType,
                data : data
            };
            listeners[i](e);
        }
    };

    var fireEventCocoonJSWrapper = function(eventType, data) {
        fireEvent.apply(btg.eventManager, arguments);
        if(window.CocoonJS) {
            var code = 'btg.eventManager._fireEvent("' + eventType + '", ' + JSON.stringify(data) + ');';
            console.log(code);
            CocoonJS.App.forwardAsync(code);
        }
    };

    btg = btg || {};
    btg.eventManager = {
        addListener : addListener,
        removeListener : removeListener,
        fireEvent : fireEventCocoonJSWrapper,
        _fireEvent : fireEvent
    };


})();