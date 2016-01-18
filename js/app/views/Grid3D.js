/*global define */
define(['three', 'utils', 'views/Cell3D', 'EventListener'], function (THREE, utils, Cell, EventListener) {
    "use strict";
    var Grid = function Grid(o) {
        var cells = [],
            that = this,
            el = new THREE.Object3D(),
            paused = false,
            active = true,
            inited = false,
            placingFlags = false,
            mines = o.mines || Grid.DEFAULT_MINES,
            x = o.width || o.x || Grid.DEFAULT_X,
            y = o.y || Grid.DEFAULT_Y,
            z = o.z || Grid.DEFAULT_Z,
            empty = function empty() {
                that.getCells().forEach(function (cell) {
                    el.remove(cell.getEl());
                });
                return that;
            },
            bind = function bind() {
                var clk = function clk(cell) {
                    var mine = cell.isMine();
                    if (cell.isFlagged()) {
                        return;
                    }
                    cell.setRevealed(true);
                    if (mine) {
                        that.revealMines(cell).setActive(false);
                        that.trigger(Grid.EVENT_GAME_OVER, {
                            cell: cell,
                            status: Grid.STATUS_LOSS
                        });
                    } else if (!cell.getNumber()) {
                        that.getNeighbouringCells(cell).forEach(function (n) {
                            if (!n.isRevealed()) {
                                clk(n);
                            }
                        });
                    }
                };
                that.on(Grid.EVENT_MOUSE_CLICK, function (e) {
                    var cell = e.cell;
                    if (!that.isActive() || that.isPaused()) {
                        return;
                    }
                    if (e.which === Grid.MOUSE_LEFT && !that.isPlacingFlags()) {
                        if (!that.isInited()) {
                            that
                                .generateMines(cell)
                                .setInited(true);
                        }
                        clk(cell);
                        that.victoryCheck();
                    } else {
                        cell.setFlagged(!cell.isFlagged());
                        that.trigger(Grid.EVENT_MINES_LEFT_CHANGE, that.getMinesLeft());
                    }
                }).on(Grid.EVENT_MOUSE_ENTER, function (cell) {
                    cell.trigger(Cell.EVENT_MOUSE_OVER);
                }).on(Grid.EVENT_MOUSE_OUT, function (cell) {
                    cell.trigger(Cell.EVENT_MOUSE_OUT);
                });
            },
            init = function init() {
                EventListener.subscribe(that);
                bind();
                return that.reset(o);
            };
        this.getX = function getX() {
            return x;
        };
        this.getY = function getY() {
            return y;
        };
        this.getZ = function getZ() {
            return z;
        };
        this.getEl = function getEl() {
            return el;
        };
        this.getCells = function getCells() {
            return cells;
        };
        this.getCell = function getCell(o) {
            if (o.x !== undefined && o.y !== undefined && o.z !== undefined) {
                return this.getCells().filter(function (cell) {
                    return cell.getX() === o.x
                        && cell.getY() === o.y
                        && cell.getZ() === o.z;
                })[0];
            }
        };
        this.setMines =  function setMines(newMines) {
            mines = newMines;
            return this;
        };
        this.getMines = function getMines() {
            return mines;
        };
        this.generateMines = function generateMines(cell) {
            var c,
                placedMines = 0;
            while (placedMines < mines) {
                c = that.getCell({
                    x: utils.random(x - 1),
                    y: utils.random(y - 1),
                    z: utils.random(z - 1)
                });
                if (!c.isMine() && c !== cell) {
                    c.setMine(true);
                    placedMines += 1;
                }
            }
            this.getCells().forEach(function (c) {
                var neighbours = that.getNeighbouringCells(c);
                if (!c.isMine()) {
                    c.setNumber(neighbours.reduce(function (prev, c1) {
                        return prev + c1.isMine();
                    }, 0));
                }
            });
            return this;
        };
        this.randomizeMines = function randomizeMines() {
            var cell,
                placedMines = 0;
            while (placedMines < mines) {
                cell = this.getCell({
                    x: utils.random(x - 1),
                    y: utils.random(y - 1),
                    z: utils.random(z - 1)
                });
                if (!cell.isMine()) {
                    cell.setMine(true);
                    placedMines += 1;
                }
            }
            return this;
        };
        this.getBoxes = function getBoxes() {
            return cells.map(function (cell) {
                return cell.getBox();
            });
        };
        this.getNeighbouringCells = function getNeighbouringCell(o) {
            var opos = o.getPosition();
            return this.getCells().filter(function (cell) {
                var pos = cell.getPosition();
                return cell !== o
                    && Math.abs(opos.x - pos.x) <= 1
                    && Math.abs(opos.y - pos.y) <= 1
                    && Math.abs(opos.z - pos.z) <= 1;
            });
        };
        this.getMinesLeft = function getMinesLeft() {
            var markedMines = that.getCells().reduce(function (prev, cell) {
                    return prev + cell.isFlagged();
                }, 0);
            return Math.max(0, that.getMines() - markedMines);
        };
        this.revealMines = function revealMines(cell) {
            that.getCells().forEach(function (c) {
                if (c === cell) {
                    c.setSteppedMine(true).setRevealed(true);
                } else if (c.isMine() && !c.isFlagged()) {
                    c.setRevealed(true);
                }
            });
            return this;
        };
        this.victoryCheck = function victoryCheck() {
            var unrevealedEmpty = that.getCells().reduce(function (prev, cell) {
                /*jslint unparam: true */
                return prev + (!cell.isRevealed() && !cell.isMine());
            }, 0);
            if (!unrevealedEmpty) {
                that.setActive(false);
                that.trigger(Grid.EVENT_GAME_OVER, {
                    status: Grid.STATUS_VICTORY
                });
            }
        };

        this.setX = function setX(newX) {
            x = newX;
            return this;
        };
        this.setY = function setY(newY) {
            y = newY;
            return this;
        };
        this.setZ = function setZ(newZ) {
            z = newZ;
            return this;
        };
        this.reset = function reset(newConfig) {
            var i, j, k, cell, cellEl, pos,
                cellSize = Cell.SIZE,
                d = Cell.DISTANCE;
            empty()
                .setX(newConfig.x)
                .setY(newConfig.y)
                .setZ(newConfig.z)
                .setMines(newConfig.mines)
                .setInited(false)
                .setActive(true)
                .setPaused(false);
            cells = [];
            for (i = 0; i < x; i += 1) {
                for (j = 0; j < y; j += 1) {
                    for (k = 0; k < z; k += 1) {
                        cell = new Cell({
                            x: i,
                            y: j,
                            z: k,
                            mine: false,
                            number: 0
                        });
                        pos = {
                            x: (d + cellSize) * (i - x / 2 + 0.5),
                            y: (d + cellSize) * (y / 2 - j - 0.5),
                            z: (d + cellSize) * (z / 2 - k - 0.5)
                        };
                        cellEl = cell.getEl();
                        cellEl.position.set(pos.x, pos.y, pos.z);
                        cells.push(cell);
                        el.add(cellEl);
                    }
                }
            }
            return this;
        };
        this.isActive = function isActive() {
            return active;
        };
        this.setActive = function setActive(newActive) {
            active = newActive;
            return this;
        };
        this.isInited = function isInited() {
            return inited;
        };
        this.setInited = function setInited(newInited) {
            inited = newInited;
            that.trigger(Grid.EVENT_INIT, inited);
            return this;
        };
        this.isPaused = function isPaused() {
            return paused;
        };
        this.setPaused = function setPaused(newPaused) {
            paused = newPaused;
            return this;
        };
        this.setPlacingFlags = function setPlacingFlags(newPlacingFlags) {
            placingFlags = newPlacingFlags;
            return this;
        };
        this.isPlacingFlags = function isPlacingFlags() {
            return placingFlags;
        };
        return init();
    };
    Grid.DEFAULT_Z = 10;
    Grid.DEFAULT_X = 10;
    Grid.DEFAULT_Y = 10;
    Grid.DEFAULT_MINES = 10;
    Grid.STATUS_VICTORY = 'victory';
    Grid.STATUS_LOSS = 'loss';
    Grid.EVENT_MOUSE_ENTER = 'mouse-enter';
    Grid.EVENT_MOUSE_OUT = 'mouse-out';
    Grid.EVENT_MOUSE_CLICK = 'mouse-click';
    Grid.EVENT_GAME_OVER = 'game-over';
    Grid.EVENT_MINES_LEFT_CHANGE = 'mines-left-change';
    Grid.EVENT_INIT = 'init';
    Grid.MOUSE_LEFT = 0;
    Grid.MOUSE_RIGHT = 2;
    return Grid;
});