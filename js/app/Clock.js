/*jslint browser: true */
/*global define */
define(function () {
    "use strict";
    var Clock = function Clock(autoStart) {
        var now = function now() {
            return window.performance && window.performance.now ? window.performance.now() : Date.now();
        };
        this.autoStart = autoStart !== undefined ? autoStart : true;
        this.startTime = 0;
        this.oldTime = 0;
        this.elapsedTime = 0;
        this.running = false;

        this.reset = function reset() {
            this.elapsedTime = 0;
            return this.start();
        };

        this.start = function () {
            this.startTime = now();
            this.oldTime = this.startTime;
            this.running = true;
            return this;
        };

        this.stop = function () {
            this.getElapsedTime();
            this.running = false;
            return this;
        };

        this.getElapsedTime = function () {
            this.getDelta();
            return this.elapsedTime;
        };

        this.getDelta = function () {
            var newTime, diff = 0;
//            if (this.autoStart && !this.running) {
//                this.start();
//            }
            if (this.running) {
                newTime = now();
                diff = 0.001 * (newTime - this.oldTime);
                this.oldTime = newTime;
                this.elapsedTime += diff;
            }
            return diff;
        };
        return this;
    };
    return Clock;
});