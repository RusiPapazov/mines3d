/*global define */
define(['three'], function (THREE) {
    "use strict";
    var FlagGeometry = function FlagGeometry(height, thickness, base, flag) {
        var flagHeight,
            scope = this,
            normalX = new THREE.Vector3(1, 0, 0),
            normalY = new THREE.Vector3(0, 1, 0),
            normalZ = new THREE.Vector3(0, 0, 1);
        THREE.Geometry.call(this);
        scope.type = 'FlagGeometry';
        thickness = thickness === undefined ? 5 : thickness;
        height = height === undefined ? 20 : height;
        base = base === undefined ? 10 : base;
        flag = flag === undefined ? 10 : flag;
        scope.parameters = {
            height: height,
            thickness: thickness,
            base: base,
            flag: flag
        };
        if (height < flag) {
            throw new TypeError("Flag must be less than height");
        }
        flagHeight =  Math.sqrt(3) * flag / 2;
        //base
        //bottom
        scope.vertices[0] = new THREE.Vector3(base / 2, -height / 2, -base / 2);
        scope.vertices[1] = new THREE.Vector3(base / 2, -height / 2, base / 2);
        scope.vertices[2] = new THREE.Vector3(-base / 2, -height / 2, -base / 2);
        scope.faces[0] = new THREE.Face3(0, 1, 2, normalY, undefined, 0);
        scope.vertices[3] = new THREE.Vector3(-base / 2, -height / 2, base / 2);
        scope.faces[1] = new THREE.Face3(2, 1, 3, normalY, undefined, 0);
        //end bottom
        //top
        scope.vertices[4] = new THREE.Vector3(thickness / 2, thickness - height / 2, -thickness / 2);
        scope.vertices[5] = new THREE.Vector3(thickness / 2, thickness - height / 2, thickness / 2);
        scope.vertices[6] = new THREE.Vector3(-thickness / 2, thickness - height / 2, -thickness / 2);
        scope.vertices[7] = new THREE.Vector3(-thickness / 2, thickness - height / 2, thickness / 2);
        //end top

        //sides
        scope.faces[2] = new THREE.Face3(0, 4, 1, normalY, undefined, 0);
        scope.faces[3] = new THREE.Face3(4, 5, 1, normalY, undefined, 0);
        scope.faces[4] = new THREE.Face3(0, 2, 4, normalY, undefined, 0);
        scope.faces[5] = new THREE.Face3(4, 2, 6, normalY, undefined, 0);
        scope.faces[6] = new THREE.Face3(3, 7, 6, normalY, undefined, 0);
        scope.faces[7] = new THREE.Face3(3, 6, 2, normalY, undefined, 0);
        scope.faces[8] = new THREE.Face3(3, 1, 7, normalY, undefined, 0);
        scope.faces[9] = new THREE.Face3(7, 1, 5, normalY, undefined, 0);
        //end sides
        //end base

        //flag pole
        scope.vertices[8] = new THREE.Vector3(thickness / 2, height / 2, -thickness / 2);
        scope.vertices[9] = new THREE.Vector3(thickness / 2, height / 2, thickness / 2);
        scope.vertices[10] = new THREE.Vector3(-thickness / 2, height / 2, -thickness / 2);
        scope.vertices[11] = new THREE.Vector3(-thickness / 2, height / 2, thickness / 2);
        scope.faces[10] = new THREE.Face3(4, 6, 10, normalX, undefined, 0);
        scope.faces[11] = new THREE.Face3(8, 4, 10, normalX, undefined, 0);
        scope.faces[12] = new THREE.Face3(11, 10, 6, normalX, undefined, 0);
        scope.faces[13] = new THREE.Face3(11, 6, 7, normalX, undefined, 0);
        scope.faces[14] = new THREE.Face3(8, 9, 4, normalX, undefined, 0);
        scope.faces[15] = new THREE.Face3(4, 9, 5, normalX, undefined, 0);
        scope.faces[16] = new THREE.Face3(5, 9, 7, normalX, undefined, 0);
        scope.faces[17] = new THREE.Face3(7, 9, 11, normalX, undefined, 0);
        scope.faces[18] = new THREE.Face3(10, 11, 9, normalX, undefined, 0);
        scope.faces[19] = new THREE.Face3(8, 10, 9, normalX, undefined, 0);
        //end flag pole

        //flag cloth
        scope.vertices[12] = new THREE.Vector3(-thickness / 2, height / 2 - flag, thickness / 2);
        scope.vertices[13] = new THREE.Vector3(-thickness / 2, height / 2 - flag, -thickness / 2);
        scope.vertices[14] = new THREE.Vector3(-(thickness / 2 + flagHeight), height / 2 - flag / 2, thickness / 2);
        scope.vertices[15] = new THREE.Vector3(-(thickness / 2 + flagHeight), height / 2 - flag / 2, -thickness / 2);
        //sides
        scope.faces[20] = new THREE.Face3(12, 15, 13, normalX, undefined, 1);
        scope.faces[21] = new THREE.Face3(15, 12, 14, normalX, undefined, 1);
        //end sides
        scope.faces[22] = new THREE.Face3(10, 15, 11, normalX, undefined, 1);
        scope.faces[23] = new THREE.Face3(11, 15, 14, normalX, undefined, 1);
        scope.faces[24] = new THREE.Face3(11, 14, 12, normalZ, undefined, 1);
        scope.faces[25] = new THREE.Face3(10, 13, 15, normalZ, undefined, 1);
        //end flag cloth

    };
    THREE.FlagGeometry = FlagGeometry;
    THREE.FlagGeometry.prototype = Object.create(THREE.Geometry.prototype);
    THREE.FlagGeometry.prototype.constructor = THREE.Geometry;
    return FlagGeometry;
});