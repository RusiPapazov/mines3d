/*global define */
define(function () {
    "use strict";
    var EventListener = function EventListener(object) {
        var handlers = {};
        object.on = function (event, handler) {
            if (!handlers[event]) {
                handlers[event] = [];
            }
            handlers[event].push(handler);
            return object;
        };
        object.trigger = function trigger(event, data) {
            if (!handlers[event]) {
//                console.warn('Event [' + event + '] not handled');
                return;
            }
            handlers[event].forEach(function (handler) {
                if (typeof handler === 'function') {
                    handler(data);
                }
            });
            return object;
        };
        return this;
    };
    EventListener.subscribe = function subscribe(object) {
        return new EventListener(object);
    };
    return EventListener;
});