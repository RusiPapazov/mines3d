/*global define */
define(['EventListener'], function (EventListener) {
    "use strict";
    var Cell = function Cell(o) {
        var x, y, z, number, mine, revealed, flagged,
            that = this,
            init = function init() {
                EventListener.subscribe(that);
                x = o.x;
                y = o.y;
                z = o.z;
                mine = o.mine || false;
                revealed = o.revealed || false;
                flagged = o.flagged || false;
                number = o.number || 0;
//                EventListener.subscribe(that);
                return that;
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
        this.isMine = function isMine() {
            return mine;
        };
        this.setMine = function setMine(newMine, silent) {
            /*jslint unparam: true */
            mine = newMine;
            return this;
        };
        this.setNumber = function setNumber(newNumber) {
            number = newNumber;
            return this;
        };
        this.getNumber = function getNumber() {
            return number;
        };
        this.setRevealed = function setRevealed(newRevealed, silent) {
            revealed = newRevealed;
            if (!silent) {
                this.trigger(Cell.EVENT_REVEAL, revealed);
            }
            return this;
        };
        this.isRevealed = function isRevealed() {
            return revealed;
        };
        this.getPosition = function getPosition() {
            return {
                x: x,
                y: y,
                z: z
            };
        };
        this.setFlagged = function setFlagged(newFlagged, silent) {
            flagged = newFlagged;
            if (!silent) {
                this.trigger(Cell.EVENT_FLAG, flagged);
            }
            return this;
        };
        this.isFlagged = function isFlagged() {
            return flagged;
        };
        this.toJSON = function toJSON() {
            return {
                mine: mine,
                x: x,
                y: y,
                z: z,
                revealed: revealed,
                flagged: flagged,
                number: number
            };
        };
        return init();
    };
    Cell.EVENT_FLAG = 'flag';
    Cell.EVENT_REVEAL = 'reveal';
    return Cell;
});