/*global define */
define(['./Cell', '../EventListener'], function (Cell, EventListener) {
    "use strict";
    var Grid = function Grid(o) {
        var x, y, z, mines,
            cells = [],
            that = this,
            init = function init() {
                var i, j, k, cell;
                that
                    .setDimensions(o, true)
                    .setMines(o.mines, true);
                for (i = 0; i < x; i += 1) {
                    for (j = 0; j < y; j += 1) {
                        for (k = 0; k < z; k += 1) {
                            cell = new Cell({
                                x: i,
                                y: j,
                                z: k
                            });
                            cells.push(cell);
                        }
                    }
                }
                EventListener.subscribe(that);
                return that;
            };
        this.getX = function getX() {
            return x;
        };
        this.setX = function setX(newX, silent) {
            x = newX;
            if (!silent) {
                this.trigger(Grid.EVENT_RESIZE, {
                    x: x
                });
            }
            return this;
        };
        this.getY = function getY() {
            return y;
        };
        this.setY = function setY(newY, silent) {
            y = newY;
            if (!silent) {
                this.trigger(Grid.EVENT_RESIZE, {
                    y: y
                });
            }
            return this;
        };
        this.getZ = function getZ() {
            return z;
        };
        this.setZ = function setZ(newZ, silent) {
            z = newZ;
            if (!silent) {
                this.trigger(Grid.EVENT_RESIZE, {
                    z: z
                });
            }
            return this;
        };
        this.getMines = function getMines() {
        //        mines = Math.min(mines, Math.ceil(that.getX() * that.getY() * that.getZ() * MINE_DENSITY));
            return mines;
        };
        this.setMines = function setMines(newMines, silent) {
            mines = newMines;
            if (!silent) {
                this.trigger(Grid.EVENT_CHANGE_MINES, newMines);
            }
        };
        this.setDimensions = function setDimensions(dimensions, silent) {
            this.setX(dimensions.x, true)
                .setY(dimensions.y, true)
                .setZ(dimensions.z, true);
            if (!silent) {
                this.trigger(Grid.EVENT_RESIZE, this.getDimensions());
            }
            return this;
        };
        this.getDimentions = function getDimentions() {
            return {
                x: this.getX(),
                y: this.getY(),
                z: this.getZ()
            };
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
        return init();
    };
    Grid.EVENT_RESIZE = 'resize';
    Grid.EVENT_CHANGE_MINES = 'change-mines';
    Grid.DEFAULT_X = 3;
    Grid.DEFAULT_Y = 3;
    Grid.DEFAULT_Z = 3;
    return Grid;
});