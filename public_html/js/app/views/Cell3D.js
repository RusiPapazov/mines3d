/*global define */
define(['models/Cell', 'EventListener', 'three', 'Geometries/Flag', 'Geometries/Mine'], function (Model, EventListener, THREE) {
    "use strict";
    var colorMap = [
        0xffffff,//0 is white
        0x0000ff,//1 is blue
        0x00ff00,//2 is green
        0xff0000,//3 is red
        0x00008B,//4 is darkblue
        0x8B0000,//5 is darkred
        0x008080,//6 is teal
        0x800080,//7 is purple
        0x000000,//8 is black
        0xA52A2A//9 is brown
    ],
        config = {
            material: {
                color: 0xbdbdbd,
                transparent: true,
                opacity: 1,
                vertexColors: THREE.VertexColors
    //                    shading: THREE.FlatShading
            },
            text: {
                geometry: {
                    height: 1,
                    width: 1,
                    size: 5,
                    curveSegments: 4,
                    font: 'optimer', // helvetiker, optimer, gentilis, droid sans, droid serif
                    weight: 'bold', // normal bold
                    style: 'normal',
                    bevelThickness: 1,
                    bevelSize: 0.5,
                    bevelEnabled: true,
                    material: 0,
                    extrudeMaterial: 1
                }
            },
            flag: {
                geometry: {
                    height: 10,
                    thickness: 2,
                    base: 5,
                    flag: 5
                },
                materials: [{
                    type: 'MeshLambertMaterial',
                    color: 0x000000
                }, {
                    type: 'MeshLambertMaterial',
                    color: 0xff0000
                }]
            }
        },
        createTextMaterial = function createTextMaterial(number) {
            var c = [{
                //front
                color: colorMap[number % colorMap.length],
                shading: THREE.FlatShading
            }, {
                //side
                color: 0x000000,
                shading: THREE.FlatShading
            }];
            return new THREE.MeshFaceMaterial([
                new THREE.MeshPhongMaterial(c[0]), // front
                new THREE.MeshPhongMaterial(c[1]) // side
            ]);
        },
        createText = function createText(number) {
            var geometry = new THREE.TextGeometry(number, config.text.geometry),
                text = new THREE.Mesh(geometry, createTextMaterial(number));
            geometry.computeBoundingBox();
            geometry.computeVertexNormals();
            text.updateMatrix();
            text.matrixAutoUpdate =  false;
            return text;
        },
        Cell = function Cell(o) {
            var that = this,
                steppedMine = false,
                model = o instanceof Model ? o : new Model(o),
                el = new THREE.Object3D(),
                meshes = {},
                geometries = {},
                materials = {},
                init = function init() {
                    el.add(that.getBox());
    //                el.add(mesh);
    //                el.add(textMesh);
                    EventListener.subscribe(that);
                    that.on(Cell.EVENT_MOUSE_OVER, function () {
                        that.getBox().material.color.setHex(0xff0000);
                    }).on(Cell.EVENT_MOUSE_OUT, function () {
                        that.getBox().material.color.setHex(config.material.color);
                    });
                    return that;
                };
            this.getEl = function getEl() {
                return el;
            };
            this.getX = function getX() {
                return model.getX();
            };
            this.getY = function getY() {
                return model.getY();
            };
            this.getZ = function getZ() {
                return model.getZ();
            };
            this.isMine = function isMine() {
                return model.isMine();
            };
            this.setMine = function setMine(mine) {
                model.setMine(mine);
    //            if (mine) {
    //                el.remove();
    //            }
                return this;
            };
            this.setNumber = function setNumber(number) {
                model.setNumber(number);
                if (number && this.isRevealed()) {
                    el.add(this.getText());
                }
                return this;
            };
            this.getNumber = function getNumber() {
                return model.getNumber();
            };
            this.getMesh = function getMesh(i) {
                return meshes[i];
            };
            this.getBox = function getBox() {
                var color = new THREE.Color(0xffffff);
                if (meshes.box) {
                    return meshes.box;
                }
                geometries.box = new THREE.BoxGeometry(Cell.SIZE, Cell.SIZE, Cell.SIZE);
    //            for (i = 0; i < geometries.box.vertices; i += 1) {
    //                geometries.box.vertexColors[i] = new THREE.Color(0xffffff);
    //            }
                geometries.box.faces.forEach(function (face) {
                    var i, l;
                    for (i = 0, l = face instanceof THREE.Face3 ? 3 : 4; i < l; i += 1) {
                        face.vertexColors[i] = color;
                    }
                });
                geometries.box.verticesNeedUpdate = true;
                materials.box = new THREE.MeshLambertMaterial(config.material);
                meshes.box = new THREE.Mesh(geometries.box, materials.box);
                meshes.box.updateMatrix();
                meshes.box.matrixAutoUpdate = false;
                meshes.box.cell = that;
                return meshes.box;
            };
            this.getText = function getText() {
                if (!meshes.text) {
                    meshes.text = createText(model.getNumber());
                }
                return meshes.text;
            };
            this.getFlag = function getFlag() {
                var geometry;
                if (meshes.flag) {
                    return meshes.flag;
                }
                geometry = config.flag.geometry;
                geometries.flag = new THREE.FlagGeometry(geometry.height, geometry.thickness, geometry.base, geometry.flag);
                materials.flag = new THREE.MeshFaceMaterial(config.flag.materials.map(function (material) {
                    return new THREE[material.type]({
                        color: material.color
                    });
                }));
                meshes.flag = new THREE.Mesh(geometries.flag, materials.flag);
                geometries.flag.computeBoundingBox();
                geometries.flag.computeVertexNormals();
                meshes.flag.updateMatrix();
                meshes.flag.matrixAutoUpdate = false;
                return meshes.flag;
            };
            this.getMine = function getMine() {
                if (meshes.mine) {
                    return meshes.mine;
                }
                meshes.mine = new THREE.MineGeometry(Cell.SIZE);
                return meshes.mine;
            };
            this.setRevealed = function setRevealed(revealed) {
                model.setRevealed(revealed);
                if (revealed) {
                    materials.box.opacity = 0;
                    if (model.getNumber()) {
//                        if (this.isFlagged() && !this.isMine()) {
//                            //show a wrong mine. crossed through or something
//                        }
                        el.add(this.getText());
                    } else if (model.isMine()) {
                        if (this.isSteppedMine()) {
                            that.getBox().material.opacity = 0.75;
                            that.getBox().material.color.setHex(0xff0000);
                        }
                        el.add(this.getMine());
                    }
                }
                return this;
            };
            this.isRevealed = function isRevealed() {
                return model.isRevealed();
            };
            this.getPosition = function getPosition() {
                return {
                    x: model.getX(),
                    y: model.getY(),
                    z: model.getZ()
                };
            };
            this.setFlagged = function setFlagged(flagged) {
                model.setFlagged(flagged);
                if (!this.isRevealed()) {
                    if (flagged) {
                        el.add(this.getFlag());
                    } else if (meshes.flag) {
                        el.remove(meshes.flag);
                    }
                }
                this.getBox().material.opacity = flagged ? 0.1 : 1;
                return this;
            };
            this.isFlagged = function isFlagged() {
                return model.isFlagged();
            };
            this.toJSON = function toJSON() {
                return {
                    mine: model.isMine(),
                    x: model.getX(),
                    y: model.getY(),
                    z: model.getZ(),
                    revealed: model.isRevealed(),
                    flagged: model.isFlagged(),
                    number: model.getNumber()
                };
            };
            this.setSteppedMine = function setSteppedMine(newSteppedMine) {
                steppedMine = newSteppedMine;
                return this;
            };
            this.isSteppedMine = function isSteppedMine() {
                return steppedMine;
            };
            return init();
        };
    Cell.SIZE = 20;
    Cell.DISTANCE = 3;
    Cell.EVENT_MOUSE_OVER = 'mouseover';
    return Cell;
});