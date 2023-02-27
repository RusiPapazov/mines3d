/*jslint browser: true */
/*global define */
define(['Settings', 'Storage', 'dialog', 'EventListener', 'utils'], function (Settings, Storage, dialog, EventListener, utils) {
    "use strict";
    var UI = function UI() {
        var favIcon,
            that = this,
            get = utils.get,
            elements = {},
            bind = function bind() {
                if (elements.flags) {
                    elements.flags.addEventListener('change', function (e) {
                        e.preventDefault();
                        that.trigger(UI.EVENT_TOGGLE_FLAGS, this.checked);
                    }, true);
                }
                if (elements.pause) {
                    elements.pause.addEventListener('change', function (e) {
                        e.preventDefault();
                        that.trigger(UI.EVENT_PAUSE, this.checked);
                    });
                }
                if (elements.score) {
                    elements.score.addEventListener('click', function (e) {
                        e.preventDefault();
                        that.trigger(UI.EVENT_SHOW_SCORE);
                    });
                }
                if (elements.newGame) {
                    elements.newGame.addEventListener('click', function (e) {
                        that.trigger(UI.EVENT_NEW_GAME);
                        e.preventDefault();
                    });
                }
                // if (elements.toggler && elements.settings) {
                //     elements.toggler.addEventListener('click', function (e) {
                //         e.preventDefault();
                //         elements.settings.classList.toggle(UI.CSS_CLASS_VISIBLE);
                //     }, true);
                // }
                if (elements.popular) {
                    elements.popular.addEventListener('click', function (e) {
                        var target = e.target;
                        if (target.nodeName === 'A') {
                            that.settings.deserialize(Settings.SOURCE_INPUT, target.dataset.settings);
                            e.preventDefault();
                        }
                    });
                }
                if (elements.help) {
                    elements.help.addEventListener('click', function (e) {
                        e.preventDefault();
                        that.trigger(UI.EVENT_HELP);
                    });
                }
                if (elements.name) {
                    elements.name.addEventListener('change', function (e) {
                        var val = elements.name.value;
                        that.trigger(UI.EVENT_NAME_CHANGE, val);
                        that.storage.setItem('name', val);
                    });
                }
                return that;
            },
            init = function init() {
                EventListener.subscribe(that);
                that.settings = new Settings();
                that.storage = new Storage();
                elements.timer = get(UI.CSS_ID_TIMER);
                elements.minesLeft = get(UI.CSS_ID_MINES_LEFT);
                elements.flags = get(UI.CSS_ID_FLAGS);
                elements.pause = get(UI.CSS_ID_PAUSE);
                elements.score = get(UI.CSS_ID_SCORE);
                elements.newGame = get(UI.CSS_ID_NEW_GAME);
                elements.settings = get(UI.CSS_ID_SETTINGS);
                // elements.toggler = get(UI.CSS_ID_TOGGLER);
                elements.popular = get(UI.CSS_ID_POPULAR);
                elements.help = get(UI.CSS_ID_HELP);
                elements.name = get(UI.CSS_ID_NAME);
                elements.name.value = that.storage.getItem('name') || 'Annonymous';
                return bind();
            };

        this.setFavicon = function setFavIcon(icon) {
            /*jslint unparam: true */
            if (favIcon) {
                favIcon.parentNode.removeChild(favIcon);
//                favIcon.href = icon;
//                return;
            }
            favIcon = document.createElement('link');
            favIcon.type = 'image/x-icon';
            favIcon.rel = 'shortcut icon';
            favIcon.href = 'http://www.stackoverflow.com/favicon.ico';
            document.getElementsByTagName('head')[0].appendChild(favIcon);
        };
        this.displayScore = function displayScore(response) {
            var i,
                text = 'Highscores for ' + response.x + 'x' + response.y + 'x' + response.z + ', ' + response.mines + ' mines:\n',
                leaderBoard = response.leaderBoard,
                l = leaderBoard.length;
            if (!l) {
                dialog.alert('No results for this settings yet');
            } else {
                for (i = 0; i < l; i += 1) {
                    text += leaderBoard[i].position + ')' + ' ' + leaderBoard[i].name + ' - ' + leaderBoard[i].time + '\n';
                }
                dialog.alert(text);
            }
        };
        this.getPause = function getPause() {
            return elements.pause;
        };
        this.getFlags = function getFlags() {
            return elements.flags;
        };
        this.setMinesLeft = function setMinesLeft(minesLeft) {
            if (typeof minesLeft === 'number') {
                minesLeft = utils.pad(minesLeft);
            }
            elements.minesLeft.innerHTML = minesLeft;
            return this;
        };
        this.setTime = function setTime(time) {
            if (typeof time === 'number') {
                time = utils.pad(time);
            }
            elements.timer.innerHTML = time;
            return this;
        };
        this.populatePopular = function populatePopular(response) {
            var i, l, row, serialized,
                html = [];
            if (response.success && response.popular) {
                for (i = 0, l = response.popular.length; i < l; i += 1) {
                    row = response.popular[i];
                    serialized = row.x + ':' + row.y + ':' + row.z + ':' + row.mines;
                    html.push('<li><a href="#" data-settings="' + serialized + '">' + row.x + 'x' + row.y + 'x' + row.z + ' ' + row.mines + ' mines</a></li>');
                }
                elements.popular.innerHTML = html.join('');
            }
        };
        return init();
    };

    UI.CSS_ID_TIMER = 'timer';
    UI.CSS_ID_MINES_LEFT = 'mines-left';
    UI.CSS_ID_FLAGS = 'flags';
    UI.CSS_ID_PAUSE = 'pause';
    UI.CSS_ID_SCORE = 'score';
    UI.CSS_ID_NEW_GAME = 'new-game';
    UI.CSS_ID_SETTINGS = 'settings';
    UI.EVENT_TOGGLE_FLAGS = 'toggle-flags';
    UI.EVENT_PAUSE = 'pause';
    UI.EVENT_SHOW_SCORE = 'show-score';
    UI.EVENT_NEW_GAME = 'new-game';
    UI.EVENT_HELP = 'help';
    UI.EVENT_NAME_CHANGE = 'name-change';
    UI.CSS_CLASS_VISIBLE = 'visible';
    // UI.CSS_ID_TOGGLER = 'g';
    UI.CSS_ID_POPULAR = 'popular-games';
    UI.CSS_ID_HELP = 'help';
    UI.CSS_ID_NAME = 'name';
    return UI;
});