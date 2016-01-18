/*global define */
define(['three'], function (THREE) {
    "use strict";
    var MineGeometry = function MineGeometry(size) {//radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength
        var scope = this,
            materials = {
                sphere: new THREE.MeshLambertMaterial({
                    color: 0x000000
                }),
                spikes: new THREE.MeshLambertMaterial({
                    color: 0x555555
                })
            },
            geometries = {
                sphere: new THREE.SphereGeometry(size / 4),
                spikes: new THREE.CylinderGeometry(0.1, 2, size / 2)
            },
            meshes = {
                sphere: new THREE.Mesh(geometries.sphere, materials.sphere)
            },
            initSpikes = function initSpikes() {
                meshes.spikes = [
                    new THREE.Mesh(geometries.spikes, materials.spikes),
                    new THREE.Mesh(geometries.spikes.clone(), materials.spikes),
                    new THREE.Mesh(geometries.spikes.clone(), materials.spikes),
                    new THREE.Mesh(geometries.spikes.clone(), materials.spikes),
                    new THREE.Mesh(geometries.spikes.clone(), materials.spikes),
                    new THREE.Mesh(geometries.spikes.clone(), materials.spikes)
                ];
                meshes.spikes[0].translateY(2);
                meshes.spikes[1].rotateZ(Math.PI).translateY(2);
                meshes.spikes[2].rotateZ(Math.PI / 2).translateY(2);
                meshes.spikes[3].rotateZ(-Math.PI / 2).translateY(2);

                meshes.spikes[4].rotateZ(Math.PI).rotateX(Math.PI / 2).translateY(2);
                meshes.spikes[5].rotateZ(Math.PI).rotateX(-Math.PI / 2).translateY(2);
                meshes.spikes.forEach(function (spike) {
                    scope.add(spike);
                });
            };
        THREE.Object3D.apply(scope, arguments);
        scope.type = 'MineGeometry';
        initSpikes();
        scope.add(meshes.sphere);
    };
    THREE.MineGeometry = MineGeometry;
    THREE.MineGeometry.prototype = Object.create(THREE.Object3D.prototype);
    THREE.MineGeometry.prototype.constructor = THREE.Object3D;
    return MineGeometry;
});