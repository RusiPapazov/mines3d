/*global define */
/*jslint browser: true */
define(function () {
    "use strict";
    var KEY = 'scores',
        MAX_POSITION = 10,
        POPULAR_RESULTS = 10,
        storage = {
            load: function () {
                return JSON.parse(localStorage.getItem(KEY));
            },
            save: function (value) {
                localStorage.setItem(KEY, JSON.stringify(value));
            }
        },
        getScores = function getScores(size) {
            var s = storage.load();
            if (!s) {
                s = [];
            }
            return s.filter(function (score) {
                return score.x === size.x && score.y === size.y && score.z === size.z && score.mines === size.mines;
            }).map(function (score, index) {
                score.position = index + 1;
                return score;
            }).slice(0, MAX_POSITION);
        },
        insertScores = function insertScores(size, score) {
            var s = getScores(size);
            s.push(score);
            s.sort(function (a, b) {
                if (a.time < b.time) {
                    return -1;
                }
                if (a.time > b.time) {
                    return 1;
                }
                if (a.timestamp < b.timestamp) {
                    return -1;
                }
                if (a.timestamp > b.timestamp) {
                    return 1;
                }
            });
            storage.save(s);
        },
        getPopular = function getPopular() {
            var popular = {},
                scores = storage.load() || [],
                key = function key(score) {
                    return [score.x, score.y, score.z, score.mines].join('.');
                };
            scores.forEach(function (score) {
                var k = key(score);
                if (!popular[k]) {
                    popular[k] = 0;
                }
                popular[k] += 1;
            });
            scores.sort(function (a, b) {
                var keyA = key(a),
                    keyB = key(b);
                if (popular[keyA] > popular[keyB]) {
                    return -1;
                }
                return 1;
            });
            return scores;
        },
        validateScoresObj = function validateScoresObj(obj) {
            return ['name', 'time', 'timestamp', 'x', 'y', 'z', 'mines'].every(function (k) {
                return obj.hasOwnProperty(k);
            });
        },
        Api = function Api() {
            this.gameOver = function gameOver(data) {
                if (!validateScoresObj(data)) {
                    return false;
                }
                insertScores(data, data);
                return this.scores(data);
            };
            this.popular = function popular() {
                return {
                    then: function then(cb) {
                        cb({
                            success: true,
                            popular: getPopular()
                        });
                    }
                };
            };
            this.scores = function scores(data) {
                return {
                    then: function then(cb) {
                        cb({
                            success: true,
                            x: data.x,
                            y: data.y,
                            z: data.z,
                            mines: data.mines,
                            leaderBoard: getScores(data)
                        });
                    }
                };
            };
        };
    return Api;
});
