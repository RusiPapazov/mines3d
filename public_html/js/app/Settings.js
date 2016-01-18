/*jslint browser: true */
/*global define */
define(['./Storage', 'utils'], function (Storage, utils) {
    "use strict";
    var Settings = function Settings() {
        var elements = {},
            storage = new Storage(),
            get = utils.get;
        this.init = function () {
            elements.x = get(Settings.CSS_ID_X);
            elements.y = get(Settings.CSS_ID_Y);
            elements.z = get(Settings.CSS_ID_Z);
            elements.mines = get(Settings.CSS_ID_MINES);
            return this;
        };
        this.get = function get(source) {
            var result = {
                    x: Settings.DEFAULT_X,
                    y: Settings.DEFAULT_Y,
                    z: Settings.DEFAULT_Z,
                    mines: Settings.DEFAULT_MINES
                },
                keys = Object.keys(result),
                add = function add(key, value) {
                    if (value) {
                        result[key] = parseInt(value, 10);
                    }
                };
            if (source === Settings.SOURCE_STORAGE) {
                keys.forEach(function (key) {
                    add(key, storage.getItem(key));
                });
            } else if (source === Settings.SOURCE_INPUT) {
                keys.forEach(function (key) {
                    add(key, elements[key].value);
                });
            }
            return result;
        };
        this.set = function set(source, obj) {
            var keys = Object.keys(obj);
            if (source === Settings.SOURCE_STORAGE) {
                keys.forEach(function (key) {
                    storage.setItem(key, parseInt(obj[key], 10));
                });
            } else if (source === Settings.SOURCE_INPUT) {
                keys.forEach(function (key) {
                    elements[key].value = parseInt(obj[key], 10);
                });
            }
            return this;
        };
        this.deserialize = function deserialize(source, string) {
            var arr = string.split(':');
            if (arr.length === 4) {
                return this.set(source, {
                    x: arr[0],
                    y: arr[1],
                    z: arr[2],
                    mines: arr[3]
                });
            }
            return this;
        };
        return this.init();
    };
    Settings.SOURCE_STORAGE = 'storage';
    Settings.SOURCE_INPUT = 'input';
    Settings.DEFAULT_X = 10;
    Settings.DEFAULT_Y = 10;
    Settings.DEFAULT_Z = 10;
    Settings.DEFAULT_MINES = 10;
    Settings.CSS_ID_X = 'x';
    Settings.CSS_ID_Y = 'y';
    Settings.CSS_ID_Z = 'z';
    Settings.CSS_ID_MINES = 'm';
    return Settings;
});