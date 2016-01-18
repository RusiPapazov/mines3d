/*global define, Detector */
/*jslint browser: true */
(function () {
    "use strict";
    var env,
        webglAvailable = function webglAvailable() {
            var canvas;
            try {
                canvas = document.createElement('canvas');
                return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
            } catch (e) {
                return false;
            }
        };
    env = Detector.webgl && webglAvailable() ? 3 : 2;
    define(['./app' + env + 'D'], function () {
        var head  = document.getElementsByTagName('head')[0],
            link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = './css/styles' + env + 'd.css';
        link.media = 'all';
        head.appendChild(link);
    });
}());