/*global define */
/*jslint browser: true */
define(function () {
    "use strict";
    return function Storage() {
        const data = {};

        const getStorage = () => {
            try {
                return window.localStorage;
            } catch (e) {
                if (e instanceof DOMException) {
                    return null;
                }
            }
        };

        const localStorage = getStorage();

        this.setItem = function setItem(key, item) {
            if (localStorage) {
                localStorage.setItem(key, item);
            } else {
                data[key] = item;
            }
        };

        this.getItem = function getItem(key) {
            if (localStorage) {
                return localStorage.getItem(key);
            }

            return data[key];
        };
    };
});