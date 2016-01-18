/*global require, define */
/*jslint browser: true */
require.config({
    baseUrl: './js/app',
    paths: {
        three: '../vendor/three.min',
        TrackballControls: '../vendor/TrackballControls',
        OrbitControls: '../vendor/OrbitControls',
        Detector: '../vendor/Detector',
        optimer: '../vendor/fonts/optimer_bold.typeface',
        keyboardState: '../vendor/THREEx.KeyboardState',
        fullScreen: '../vendor/THREEx.FullScreen',
        reqwest: '../vendor/reqwest',
        ApiRemote: '../app/Api3D',
        nanoModal: '../vendor/nanomodal.min',
    },
    shim: {
        three: {
            exports: 'THREE'
        },
        TrackballControls: {
            deps: ['three']
        },
        OrbitControls: {
            deps: ['three']
        },
        Detector: {
            exports: 'Detector'
        },
        optimer: {
            deps: ['three']
        },
        keyboardState: {
            exports: 'THREEx'
        },
        fullScreen: {
            depts: ['keyboardState']
        }
    }
});
define(['three', 'Clock', 'Detector', 'UI', 'Api', 'Settings', 'Storage', 'utils', 'views/Grid3D', 'displayScore', 'dialog', 'keyboardState', 'OrbitControls', 'optimer', 'fullScreen'], function (THREE, Clock, Detector, UI, Api, Settings, Storage, utils, Grid, displayScore, dialog, THREEx) {
    "use strict";
    var grid, clock,
        config = {
            debug: true,
            fog: true,
            cache: false,
            renderer: {
                antialias: false,
                alpha: true
            },
            camera: {
                fov: 75,
                position: {
                    x: 0,
                    y: 0,
                    z: 200
                },
                aspect: window.innerWidth / window.innerHeight,
                near: 0.1,
                far: 1000
            },
            controls: {
                rotateSpeed: 1.0,
                zoomSpeed: 1.2,
                panSpeed: 0.8,
                noZoom: false,
                noPan: false,
                staticMoving: true,
                dynamicDampingFactor: 0.3,
                keys: [65, 83, 68]
            },
            lights: [{
                type: 'DirectionalLight',
                color: 0xffffff,
                position: {
                    x: 1,
                    y: 1,
                    z: 1
                }
            }, {
                type: 'DirectionalLight',
                color: 0x002288,
                position: {
                    x: -1,
                    y: -1,
                    z: -1
                }
            }, {
                type: 'AmbientLight',
                color: 0x222222
            }]
        },
        LAMBDA = 0.1,
        ui = new UI(),
        api = new Api(),
        storage = new Storage(),
        app = {
            mouse: new THREE.Vector3(0, 0, 0.5),
            hoveredCell: null
        },
        render = function render() {
            app.renderer.render(app.scene, app.camera);
            if (clock.running) {
                ui.setTime(utils.pad(Math.round(clock.getElapsedTime())));
            }
        },
        animate = function animate() {
//            if (grid.isInited() && !grid.isPaused() && grid.isActive()) {
//                clock.start();
//            }
            window.requestAnimationFrame(animate);
            app.controls.update();
            render();
//            if (grid.isInited() && !grid.isPaused() && grid.isActive()) {
//                clock.stop();
//            }
//            update();
        },
        handlers = {
            mouse: {
                move: function (e) {
                    var raycaster, intersections, o;
                    app.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                    app.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
                    app.mouse.unproject(app.camera);
                    app.mouse.sub(app.camera.position);
                    app.mouse.normalize();
                    raycaster = new THREE.Raycaster(app.camera.position, app.mouse);
                    intersections = raycaster.intersectObjects(grid.getBoxes());
                    if (intersections.length) {
                        o = intersections.reduce(function (prev, interaction) {
                            var cell;
                            if (prev) {
                                return prev;
                            }
                            cell = interaction.object.cell;
                            if (cell.isFlagged() && app.keyboard.pressed('shift')) {
                                return cell;
                            }
                            if (!cell.isRevealed() && !cell.isFlagged()) {
                                return cell;
                            }
                            return null;
                        }, null);
                        if (app.hoveredCell && app.hoveredCell !== o) {
                            grid.trigger(Grid.EVENT_MOUSE_OUT, app.hoveredCell);
                        }
                        if (o) {
                            app.hoveredCell = o;
                            grid.trigger(Grid.EVENT_MOUSE_ENTER, app.hoveredCell);
                        }
                    } else if (app.hoveredCell) {
                        grid.trigger(Grid.EVENT_MOUSE_OUT, app.hoveredCell);
                        app.hoveredCell = null;
                    }
                },
                up: function (e) {
                    var cell = app.hoveredCell;
                    if (cell && app.mouseHeld) {
                        if (Math.abs(app.mouseHeld.x - app.mouse.x) + Math.abs(app.mouseHeld.y - app.mouse.y) < LAMBDA) {
                            grid.trigger(Grid.EVENT_MOUSE_CLICK, {
                                which: e.button,
                                cell: cell
                            });
                        }
                    }
                    app.mouseHeld = null;
                },
                down: function () {
                    app.mouseHeld = app.mouse.clone();
                }
            }
        },
        initLights = function initLights() {
            app.lights = [];
            config.lights.forEach(function (lightConfig) {
                var pos = lightConfig.position,
                    light = new THREE[lightConfig.type](lightConfig.color);
                if (pos) {
                    light.position.set(pos.x, pos.y, pos.z);
                }
                app.scene.add(light);
                app.lights.push(light);
            });
            return app.lights;
        },
        initCamera = function initCamera() {
            app.camera = new THREE.PerspectiveCamera(config.camera.fov, config.camera.aspect, config.camera.near, config.camera.far);
            app.camera.position.set(config.camera.position.x, config.camera.position.y, config.camera.position.z);
        },
        initControls = function initControls() {
            app.controls = new THREE.OrbitControls(app.camera, app.container);
            app.controls.rotateSpeed = config.controls.rotateSpeed;
            app.controls.zoomSpeed = config.controls.zoomSpeed;
            app.controls.panSpeed = config.controls.panSpeed;
            app.controls.noZoom = config.controls.noZoom;
            app.controls.noPan = config.controls.noPan;
            app.controls.staticMoving = config.controls.staticMoving;
            app.controls.dynamicDampingFactor = config.controls.dynamicDampingFactor;
            app.controls.keys = config.controls.keys;
        },
        initRenderer = function initRenderer() {
            // renderer
            app.renderer = new THREE.WebGLRenderer(config.renderer);//utils.webglAvailable() ? new THREE.WebGLRenderer(config.renderer) : new THREE.CanvasRenderer(config.renderer); // Fallback to canvas renderer, if necessary.
            if (config.fog) {
                app.scene.fog = new THREE.FogExp2(0xcccccc);
                app.renderer.setClearColor(app.scene.fog.color);
            }
            app.renderer.setPixelRatio(window.devicePixelRatio);
            app.renderer.setSize(window.innerWidth, window.innerHeight);
            app.container.appendChild(app.renderer.domElement);
        },
        initGrid = function initGrid() {
            var s = ui.settings.get(Settings.SOURCE_STORAGE);
            grid = new Grid(s);
            ui.settings.set(Settings.SOURCE_INPUT, s);
            app.scene.add(grid.getEl());
            ui.setMinesLeft(grid.getMines());
        },
        bind = function () {
            app.controls.addEventListener('change', render);
            window.addEventListener('resize', function () {
                app.camera.aspect = window.innerWidth / window.innerHeight;
                app.camera.updateProjectionMatrix();
                app.renderer.setSize(window.innerWidth, window.innerHeight);
            }, false);
            app.renderer.domElement.addEventListener('mousemove', handlers.mouse.move, false);
            app.renderer.domElement.addEventListener('mouseup', handlers.mouse.up, false);
            app.renderer.domElement.addEventListener('mousedown', handlers.mouse.down, false);
            grid
                .on(Grid.EVENT_GAME_OVER, function (e) {
                    var time,
                        name = storage.getItem('name'),
                        prompt = function prompt() {
                            if (!name) {
                                dialog.prompt('You won, please enter your name', 'Anonymous', prompt);
                            }
                        },
                        timestamp = parseInt(Date.now() / 1000, 10),
                        status = e.status;
                    time = parseInt(clock.getElapsedTime(), 10);
                    clock.reset().stop();
                    if (status === Grid.STATUS_VICTORY) {
                        prompt();
                        storage.setItem('name', name);
                        api.gameOver({
                            status: status,
                            name: name,
                            time: time,
                            timestamp: timestamp,
                            y: grid.getX(),
                            x: grid.getY(),
                            z: grid.getZ(),
                            mines: grid.getMines()
                        }).then(function (response) {
                            if (response.success) {
                                displayScore(response);
                            } else {
                                dialog.alert(response.message);
                            }
                        });
                    }
                })
                .on(Grid.EVENT_MINES_LEFT_CHANGE, function (minesLeft) {
                    ui.setMinesLeft(minesLeft);
                })
                .on(Grid.EVENT_INIT, function (inited) {
                    if (inited) {
                        clock.start();
                    } else {
                        clock.stop();
                    }
                });
            api.popular().then(ui.populatePopular);
            ui.on(UI.EVENT_NEW_GAME, function () {
                var o = ui.settings.get(Settings.SOURCE_INPUT);
                ui.settings.set(Settings.SOURCE_STORAGE, o);
                grid.reset(o);
                clock = new Clock();
                ui
                    .setTime(0)
                    .setMinesLeft(o.mines);
            }).on(UI.EVENT_SHOW_SCORE, function () {
                api.scores({
                    x: grid.getX(),
                    y: grid.getY(),
                    z: grid.getZ(),
                    mines: grid.getMines()
                }).then(function (response) {
                    displayScore(response);
                });
            })
                .on(UI.EVENT_TOGGLE_FLAGS, grid.setPlacingFlags)
                .on(UI.EVENT_HELP, function () {
                    dialog.alert(document.getElementById('help-message').innerHTML);
                }).on(UI.EVENT_PAUSE, function (paused) {
                    if (paused) {
                        clock.stop();
                    } else {
                        clock.start();
                    }
                    grid.setPaused(paused);
                    app.scene.fog.density = paused ? 0.1 : 0.00025;
                });
            THREEx.FullScreen.bindKey({
                charCode: true,//config.fullscreen.charCode,
                dblclick: true,
                container: app.container
            });
            window.addEventListener('load', function () {
                setTimeout(function () {
                    window.scrollTo(0, 1);
                }, 1);
            }, false);
        },
        initDebugger = function initDebugger() {
            var noop;
            if (config.debug) {
                window.app = app;
                window.grid = grid;
                window.clock = clock;
            } else {
                noop = function () {};
                window.a = {
                    log: noop,
                    error: noop,
                    assert: noop,
                    debug: noop,
                    info: noop
                };
            }
        },
        initKeyboard = function initKeyboard() {
            app.keyboard = new THREEx.KeyboardState();
        },
        initClock = function initClock() {
            clock = new Clock();
        },
        initCache = function () {
            if (config.cache) {
                window.applicationCache.addEventListener('updateready', function () {
                    if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
                        window.applicationCache.swapCache();
                        if (window.confirm('A new version of this site is available. Load it?')) {
                            window.location.reload();
                        }
                    }
                }, false);
            }
        },
        init = function init() {
            if (!Detector.webgl) {// || !utils.webglAvailable()) {
                Detector.addGetWebGLMessage();
            } else {
                app.container = document.getElementById('main');
                initCamera();
                initControls();
                initKeyboard();
                app.scene = new THREE.Scene();
                initGrid();
                initLights();
                initRenderer();
                initClock();
                initCache();
                bind();
                animate();
                initDebugger();
            }
        };
    init();
});