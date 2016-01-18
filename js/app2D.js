/*global define, require */
/*jslint browser: true */
/*author rusi@papazov.pro */
require.config({
    urlArgs: 'v=' + Date.now(),
    baseUrl: '/js/app',
    paths: {
        jquery: '/js/vendor/jquery-2.1.3.min',
        jqueryui: '/js/vendor/jquery-ui.min',
        Detector: '/js/vendor/Detector',
        ApiRemote: '/js/app/Api3D',
        nanoModal: '/js/vendor/nanomodal.min',
        reqwest: '/js/vendor/reqwest'
    },
    shim: {
        jquery: {
            exports: '$'
        },
        jqueryui: {
            depts: ['jquery']
        },
        Detector: {
            exports: 'Detector'
        }
    }
});
define(['views/Grid2D', 'Api', 'displayScore', 'utils', 'UI', 'Settings', 'Storage', 'dialog'], function (Grid, Api, displayScore, utils, UI, Settings, Storage, dialog) {
    "use strict";
    var timer,
        timerStarted = false,
        time = 0,
        storage = new Storage(),
        ui = new UI(),
        grid = new Grid(ui.settings.get(Settings.SOURCE_STORAGE)),
        nextSecond = function nextSecond() {
            time += 1;
            ui.setTime(utils.pad(time));
        },
        api = new Api();
    ui.setMinesLeft(grid.model.getMines());
    ui.on(UI.EVENT_NEW_GAME, function () {
        var o = ui.settings.get(Settings.SOURCE_INPUT);
        ui.settings.set(Settings.SOURCE_STORAGE, o);
        grid.reset(o);
    }).on(UI.EVENT_HELP, function () {
        dialog.alert(document.getElementById('help-message').innerHTML);
    });
    ui.settings.set(Settings.SOURCE_INPUT, ui.settings.get(Settings.SOURCE_STORAGE));
    api.popular().then(ui.populatePopular);
    grid.on(Grid.EVENT_GAME_OVER, function (status) {
        var name = storage.getItem('name'),
            timestamp = parseInt(Date.now() / 1000, 10);
        clearInterval(timer);
        if (status === Grid.STATUS_VICTORY) {
            while (!name) {
                name = window.prompt('You won, please enter your name', 'Anonymous');
            }
            storage.setItem('name', name);
            api.gameOver({
                status: status,
                name: name,
                time: time,
                timestamp: timestamp,
                x: grid.model.getX(),
                y: grid.model.getY(),
                z: grid.model.getZ(),
                mines: grid.model.getMines()
            }).then(function (response) {
                if (response.success) {
                    displayScore(response);
                } else {
                    require(['dialog'], function (dialog) {
                        dialog(response.message);
                    });
                }
            });
        }
    }).on(Grid.EVENT_INIT, function (inited) {
        if (inited && !timerStarted) {
            timerStarted = true;
            timer = setInterval(nextSecond, 1000);
        }
    }).on(Grid.EVENT_MINES_LEFT_CHANGE, function (minesLeft) {
        ui.setMinesLeft(utils.pad(minesLeft));
    });
    ui
        .on(UI.EVENT_SHOW_SCORE, function () {
            api.scores({
                x: grid.model.getX(),
                y: grid.model.getY(),
                z: grid.model.getZ(),
                mines: grid.model.getMines()
            }).then(function (response) {
                displayScore(response);
            });
        })
        .on(UI.EVENT_PAUSE, function (paused) {
            grid.setPaused(paused);
            if (paused) {
                clearInterval(timer);
            } else {
                timer = setInterval(nextSecond, 1000);
            }
        })
        .on(UI.EVENT_NEW_GAME, function () {
            var settings = ui.settings.get(Settings.SOURCE_INPUT);
            ui.settings.set(settings, Settings.SOURCE_STORAGE);
            clearInterval(timer);
            time = 0;
            timerStarted = false;
            ui.setTime(time);
            grid.reset(settings);
        })
        .on(UI.EVENT_TOGGLE_FLAGS, grid.setPlacingFlags);
});
//        MINE_DENSITY = 99 / (16 * 30),//taken from original minesweeper game, hardest setting