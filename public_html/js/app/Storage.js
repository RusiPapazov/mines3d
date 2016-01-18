/*global define */
/*jslint browser: true */
define(function () {
    "use strict";
    return function Storage() {
        var that = this, data = {},
            localStorage = window.localStorage;
        that.setItem = function setItem(key, item) {
            if (localStorage) {
                localStorage.setItem(key, item);
            } else {
                data[key] = item;
            }
        };
        that.getItem = function getItem(key) {
            if (localStorage) {
                return localStorage.getItem(key);
            }
            return data[key];
        };
        return that;
    };
});