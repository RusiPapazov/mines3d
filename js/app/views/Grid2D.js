/*global define, require */
define(['jquery', 'models/Grid', 'views/Cell2D', 'utils', 'EventListener'], function ($, Model, Cell, utils, EventListener) {
    "use strict";
    var Grid = function Grid(settings) {
        var el, $el, model,
            that = this,
            cells = [],
            placingFlags = false,
            paused = false,
            active = true,
            inited = false,
            bind = function bind() {
                $el
                    .on('contextmenu', function (e) {
                        e.preventDefault();
                    })
                    .on('mouseup', '.' + Grid.CSS_CLASS_CELL, function (e) {
                        var cell,
                            $this = $(this),
                            cellX = $this.data('x'),
                            cellY = $this.data('y'),
                            cellZ = $this.data('z');
                        e.preventDefault();
                        if (!that.isActive() || that.isPaused()) {
                            return;
                        }
                        cell = that.getCell(cellX, cellY, cellZ);
                        if (!cell) {
                            return;
                        }
                        if (e.button === 2 || that.isPlacingFlags()) {
                            cell.rightclick();
                            that.trigger(Grid.EVENT_MINES_LEFT_CHANGE, that.getMinesLeft());
                        } else {
                            that.setInited(true);
                            cell.click();
                            if (cell.isMine()) {
                                that.revealMines(cellX, cellY, cellZ).setActive(false);
                                that.trigger(Grid.EVENT_GAME_OVER, Grid.STATUS_LOSS).setActive(false);
                            } else {
                                that.victoryCheck();
                            }
                        }
                    })
                    .on('mouseenter', '.' + Grid.CSS_CLASS_CELL, function () {
                        var cell,
                            $this = $(this),
                            cellX = $this.data('x'),
                            cellY = $this.data('y'),
                            cellZ = $this.data('z');
                        if (that.isActive()) {
                            cell = that.getCell(cellX, cellY, cellZ);
                            if (cell) {
                                cell.mouseenter();
                            }
                        }
                    })
                    .on('mouseleave', '.' + Grid.CSS_CLASS_CELL, function () {
                        var cell,
                            $this = $(this),
                            c1 = $this.data('x'),
                            c2 = $this.data('y'),
                            c3 = $this.data('z');
                        if (that.isActive()) {
                            cell = that.getCell(c1, c2, c3);
                            if (cell) {
                                cell.mouseleave();
                            }
                        }
                    });
            },
            init = function init() {
                EventListener.subscribe(that);
                that.model = model = new Model(settings);
                that.el = el;
                that
                    .initGrid()
                    .randomizeMines()
                    .setActive(true);
                bind();
                return that;
            };
        this.setPlacingFlags = function setPlacingFlags(newPlacingFlags) {
            placingFlags = newPlacingFlags;
            return this;
        };
        this.isPlacingFlags = function isPlacingFlags() {
            return placingFlags;
        };
        this.initGrid = function initGrid() {
            var i, j, k,
                layers = [];
            el = utils.get(Grid.CSS_ID_CONTAINER);
            $el = $(el);
            for (i = 0; i < model.getZ(); i += 1) {
                layers[i] = $('<div class="' + Grid.CSS_CLASS_LAYER + '">').appendTo(el)
                    .css({
                        width: model.getX() * Grid.CELL_SIZE,
                        height: model.getY() * Grid.CELL_SIZE
                    });
            }
            for (i = 0; i < model.getX(); i += 1) {
                cells[i] = [];
                for (j = 0; j < model.getY(); j += 1) {
                    cells[i][j] = [];
                    for (k = 0; k < model.getZ(); k += 1) {
                        cells[i][j][k] = new Cell({
                            x: i,
                            y: j,
                            z: k
                        }, that);
                        cells[i][j][k].$el.appendTo(layers[k]);
                    }
                }
            }
            return this;
        };
        this.getGrid = function getGrid() {
            return cells;
        };
        this.getCell = function getCell(c1, c2, c3) {
            if (cells[c1] && cells[c1][c2] && cells[c1][c2][c3]) {
                return cells[c1][c2][c3];
            }
            return null;
        };
        this.randomizeMines = function randomizeMines() {
            var cellX, cellY, cellZ, cell,
                placedMines = 0;
            while (placedMines < model.getMines()) {
                cellX = utils.random(0, model.getX() - 1);
                cellY = utils.random(0, model.getY() - 1);
                cellZ = utils.random(0, model.getZ() - 1);
                cell = that.getCell(cellX, cellY, cellZ);
                if (!cell.isMine()) {
                    cell.setMine(true);
                    placedMines += 1;
                }
            }
            return this;
        };
        this.setPaused = function setPaused(newPaused) {
            paused = newPaused;
            $el.toggleClass('paused', paused);
            return this;
        };
        this.isPaused = function isPaused() {
            return paused;
        };
        this.revealMines = function revealMines(c1, c2, c3) {
            var i, j, k, cell;
            for (i = 0; i < model.getX(); i += 1) {
                for (j = 0; j < model.getY(); j += 1) {
                    for (k = 0; k < model.getZ(); k += 1) {
                        cell = that.getCell(i, j, k);
                        if (i === c1 && j === c2 && k === c3) {
                            cell.$el.addClass(Grid.CSS_CLASS_STEPPED_MINE);
                        } else {
                            if (cell.isMine() && !cell.isMarkedAsMine()) {
                                cell.$el.addClass(Grid.CSS_CLASS_MINE);
                            } else if (!cell.isMine() && cell.isMarkedAsMine()) {
                                cell.$el.addClass(Grid.CSS_CLASS_WRONG_MINE);
                            }
                        }
                    }
                }
            }
            return this;
        };
        this.getMinesLeft = function getMinesLeft() {
            var i, j, k, cell,
                markedMines = 0;
            for (i = 0; i < model.getX(); i += 1) {
                for (j = 0; j < model.getY(); j += 1) {
                    for (k = 0; k < model.getZ(); k += 1) {
                        cell = that.getCell(i, j, k);
                        if (cell && cell.isMarkedAsMine()) {
                            markedMines += 1;
                        }
                    }
                }
            }
            return Math.max(0, model.getMines() - markedMines);
        };
        this.victoryCheck = function victoryCheck() {
            var i, j, k, cell,
                unrevealedEmpty = 0;
            for (i = 0; i < model.getX(); i += 1) {
                for (j = 0; j < model.getY(); j += 1) {
                    for (k = 0; k < model.getZ(); k += 1) {
                        cell = that.getCell(i, j, k);
                        if (!cell.isRevealed() && !cell.isMine()) {
                            unrevealedEmpty += 1;
                        }
                    }
                }
            }
            if (!unrevealedEmpty) {
                that.trigger(Grid.EVENT_GAME_OVER, Grid.STATUS_VICTORY).setActive(false);
            }
        };
        this.setActive = function setActive(newActive) {
            active = newActive;
            return this;
        };
        this.isActive = function isActive() {
            return active;
        };
        this.setInited = function setInited(newInited) {
            inited = newInited;
            that.trigger(Grid.EVENT_INIT, newInited);
            return this;
        };
        this.isInited = function isInited() {
            return inited;
        };
        this.reset = function reset(newConfig) {
            $el.empty();
            this.model = model = new Model(newConfig);
            return that
                    .initGrid()
                    .randomizeMines()
                    .setActive(true);
//            return this.model
//                .setX(newConfig.x)
//                .setY(newConfig.y)
//                .setZ(newConfig.z)
//                .setMines(newConfig.mines)
//                .initGrid()
//                .randomizeMines()
//                .setInited(false)
//                .setActive(true);
        };
        return init();
    };

    Grid.MIN_X = 3;
    Grid.MIN_Y = 3;
    Grid.MIN_Z = 3;
    Grid.MIN_MINES = 1;
    Grid.CSS_CLASS_CELL = 'cell';
    Grid.CSS_CLASS_LAYER = 'layer';
    Grid.CSS_CLASS_STEPPED_MINE = 'stepped-mine';
    Grid.CSS_CLASS_MINE = 'mine';
    Grid.CSS_CLASS_WRONG_MINE = 'wrong-mine';
    Grid.CSS_ID_TIMER = 'timer';
    Grid.CSS_ID_MINES_LEFT = 'mines-left';
    Grid.CSS_ID_CONTAINER = 'board';
    Grid.CELL_SIZE = 20;
    Grid.STATUS_VICTORY = 'victory';
    Grid.STATUS_LOSS = 'loss';
    Grid.EVENT_GAME_OVER = 'game-over';
    Grid.EVENT_INIT = 'init';
    Grid.EVENT_MINES_LEFT_CHANGE = 'mines-left-change';
    return Grid;
});