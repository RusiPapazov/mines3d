/*global define */
define(['jquery', 'models/Cell', 'EventListener'], function ($, Model, EventListener) {
    "use strict";
    var Cell = function Cell(settings, game) {
            var that = this,
                prvt = {},
                bind = function bind() {
                    that.model.on(Model.EVENT_FLAG, function (flagged) {
                        that.$el.toggleClass(Cell.CSS_CLASS_FLAGGED, flagged);
                    });
                },
                init = function init() {
                    that.model = new Model(settings);
                    bind();
                    EventListener.subscribe(that);
                    return that
                        .setX(settings.x)
                        .setY(settings.y)
                        .setZ(settings.z)
                        .initDom();
                };
            this.setX = function setX(x) {
                prvt.x = x;
                return this;
            };
            this.getX = function getX() {
                return prvt.x;
            };
            this.setY = function setY(y) {
                prvt.y = y;
                return this;
            };
            this.getY = function getY() {
                return prvt.y;
            };
            this.setZ = function setZ(z) {
                prvt.z = z;
                return this;
            };
            this.getZ = function getZ() {
                return prvt.z;
            };
            this.initDom = function initDom() {
                this.el = $('<span class="' + Cell.CSS_CLASS + ' ' + Cell.CSS_CLASS_UNREVEALED + '" data-x="' + this.model.getX() + '" data-y="' + this.model.getY() + '" data-z="' + this.model.getZ() + '">');
                this.$el = $(this.el);
                return this;
            };
            this.isMarkedAsMine = function () {
                return this.model.isFlagged();
            };
            this.setMine = function setMine(mine) {
                this.model.setMine(mine);
                return this;
            };
            this.isMine = function isMine() {
                return this.model.isMine();
            };
            this.getNeighbouringCells = function getNeighbouringCell() {
                var cell, i, j, k, c1, c2, c3,
                    cells = [],
                    x = this.getX(),
                    y = this.getY(),
                    z = this.getZ();
                for (i = -1; i <= 1; i += 1) {
                    for (j = -1; j <= 1; j += 1) {
                        for (k = -1; k <= 1; k += 1) {
                            c1 = x + i;
                            c2 = y + j;
                            c3 = z + k;
                            if (i || j || k) {
                                //skip current
                                cell = game.getCell(c1, c2, c3);
                                if (cell) {
                                    cells.push(cell);
                                }
                            }
                        }
                    }
                }
                return cells;
            };
            this.setRevealed = function setRevealed(revealed) {
                var i, l, neighbours,
                    mines = 0;
                this.model.setRevealed(revealed);
                if (revealed) {
                    this.$el
                        .removeClass(Cell.CSS_CLASS_UNREVEALED);
                    neighbours = this.getNeighbouringCells();
                    for (i = 0, l = neighbours.length; i < l; i += 1) {
                        if (neighbours[i].isMine()) {
                            mines += 1;
                        }
                    }
                    if (mines) {
                        this.$el
                            .addClass(Cell.CSS_CLASS_EMPTY + ' ' + Cell.CSS_CLASS_VALUE + '-' + mines);
                    } else {
                        this.$el.addClass(Cell.CSS_CLASS_EMPTY);
                        //no mines, open all
                        for (i = 0, l = neighbours.length; i < l; i += 1) {
                            neighbours[i].click(false);
                        }
                    }
                }
                return this;
            };
            this.isRevealed = function isRevealed() {
                return this.model.isRevealed();
            };
            this.click = function click() {
                if (this.model.isFlagged() || this.isRevealed()) {
                    return this;
                }
                if (this.isMine()) {
                    return this.mouseleave();
                }
                this.setRevealed(true);
                return this;
            };
            this.mouseenter = function mouseenter() {
                var i, l, neighbours;
                if (!game.isPaused()) {
                    neighbours = this.getNeighbouringCells();
                    for (i = 0, l = neighbours.length; i < l; i += 1) {
                        neighbours[i].$el.addClass(Cell.CSS_CLASS_HIGHLIGHT);
                    }
                }
                return this;
            };
            this.mouseleave = function mouseleave() {
                var i, l, neighbours;
                if (!game.isPaused()) {
                    neighbours = this.getNeighbouringCells();
                    for (i = 0, l = neighbours.length; i < l; i += 1) {
                        neighbours[i].$el.removeClass(Cell.CSS_CLASS_HIGHLIGHT);
                    }
                }
                return this;
            };
            this.rightclick = function rightClick() {
                this.model.setFlagged(!this.model.isFlagged());
                return this;
            };

            /**
             * 
             * @deprecated grid's view adds a class to hide all mines
             * @param {boolean} show
             * @returns {Cell}
             */
            this.toggle = function toggle(show) {
                //shows/hides status (css classname
                if (show) {
                    this.$el
                        .removeClass().addClass(prvt.clsBack)
                        .text(prvt.textBack);
                } else {
                    prvt.clsBack = this.$el.attr('class');
                    prvt.textBack = this.$el.text();
                    this.$el
                        .empty()
                        .removeClass().addClass(Cell.CSS_CLASS + ' ' + Cell.CSS_CLASS_HIDDEN);
                }
                return this;
            };
            return init();
        };
    Cell.CSS_CLASS = 'cell';
    Cell.CSS_CLASS_EMPTY = 'empty';
    Cell.CSS_CLASS_UNREVEALED = 'unrevealed';
    Cell.CSS_CLASS_FLAGGED = 'flagged';
    Cell.CSS_CLASS_VALUE = 'value';
    Cell.CSS_CLASS_HIGHLIGHT = 'highlighted';
    Cell.CSS_CLASS_HIDDEN = 'hidden';
    return Cell;
});