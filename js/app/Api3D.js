/*global define */
/*jslint nomen: true */
define(['./config', 'reqwest'], function (config, reqwest) {
    "use strict";
    var Api = function Api(_t) {
        var updateToken = function updateToken(response) {
            if (response.success && response._t) {
                _t = response._t;
            }
            return response;
        };
        return {
            token: function () {
                return reqwest({
                    data: {
                        _t: _t
                    },
                    url: config.api.root + config.api.urls.token
                }).then(updateToken);
            },
            gameOver: function (data) {
                data._t = _t;
                return reqwest({
                    data: data,
                    method: 'POST',
                    url: config.api.root + config.api.urls.gameOver
                }).then(updateToken);
            },
            popular: function () {
                return reqwest({
                    url: config.api.root + config.api.urls.popular
                }).then(updateToken);
            },
            scores: function (data) {
                return reqwest({
                    data: data,
                    url: config.api.root + config.api.urls.scores
                }).then(updateToken);
            }
        };
    };
    return Api;
});