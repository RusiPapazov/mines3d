/*global define */
/* @deprecated change both versions to use Api3D, rename it to Api, internally check for config.api.local etc.. */
define(['./config', 'jquery'], function (config, $) {
    "use strict";
    var Api = function Api() {
        this.gameOver = function (data) {
            return $.ajax({
                data: data,
                method: 'POST',
                url: config.api.root + config.api.urls.gameOver
            });
        };
        this.popular = function () {
            return $.ajax({
                url: config.api.root + config.api.urls.popular
            });
        };
        this.scores = function (data) {
            return $.ajax({
                data: data,
                url: config.api.root + config.api.urls.scores
            });
        };
    };
    return Api;
});