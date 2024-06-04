import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from "./sky.js";


let canvas;
let renderer;
let scene;
let camera;
let loader;
let cubeLoader
let objLoader;
let controls;
let mtlloader;
let scene_items;
let sky;

function setUpScene() {
    canvas = document.querySelector('#c');

    scene = new THREE.Scene();

    loader = new THREE.TextureLoader();
    cubeLoader = new THREE.CubeTextureLoader();
    objLoader = new OBJLoader();
    mtlloader = new MTLLoader();

    sky = new Sky();
    sky.scale.setScalar(1000);
    scene.add(sky);

    
    // scene.background = cubeLoader.load([
    //     './../textures/sky/px.png',
    //     './../textures/sky/nx.png',
    //     './../textures/sky/py.png',
    //     './../textures/sky/ny.png',
    //     './../textures/sky/pz.png',
    //     './../textures/sky/nz.png'
    // ]);
    // scene.background.colorSpace = THREE.SRGBColorSpace;

    loader.load('./../textures/scenery/SM_DiffJPG2.jpg', (texture) => {
        // texture.preload();
        objLoader.load('./../textures/scenery/SnowyMountainMesh.obj', (root) => {
            // root.position.x = 4;
            root.position.y = -40;
            // root.position.z = 0;
            root.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2);
            root.scale.set(1000, 1000, 1000);
            root.traverse((child) => {
                if (child.isMesh) {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                }
            });
            scene.add(root);
            scene_items.push(root);
        });
    });

    renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    renderer.setSize( window.innerWidth, window.innerHeight );
    // document.body.appendChild( renderer.domElement );

    let fov = 100;
    let aspect = 2;  // the canvas default
    let near = 0.1;
    let far = 2000; 
    camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.z = 5;
    camera.position.x = -4;
    camera.position.y = 2;


    // headlights
    let color = 0xFFFFFF;
    let intensity = 5;
    let light = new THREE.PointLight(color, intensity);
    light.position.set(-5, 1.5, 3.5);
    scene.add(light);
    light = new THREE.PointLight(color, intensity);
    light.position.set(-3.25, 1.5, 3.5);
    scene.add(light);


    color = 0x6EFFC1;
    intensity = 2;
    let light2 = new THREE.AmbientLight(color, intensity);
    scene.add(light2);

    color = 0x255675;
    intensity = 2;
    let light3 = new THREE.DirectionalLight(color, intensity);
    light3.position.set(4, 10, 4);
    scene.add(light3);

    controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 1, 0 );
	controls.update();
}

function loadColorTexture( path ) {
    let texture = loader.load( path );
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function createMaterials(files) {
    let materials = [];
    for(let i = 0; i < files.length; i++) {
        materials.push(new THREE.MeshPhongMaterial({map: loadColorTexture(files[i])}));
    }
    return materials;
}

function makeInstance(geometry, files, position) {
    // add object to scene
    let materials = createMaterials(files);
    let obj = new THREE.Mesh(geometry, materials);
    scene.add(obj);

    obj.position.x = position[0];
    obj.position.y = position[1];
    obj.position.z = position[2];

    return obj;
  }

function createTree(location) {
    let trunk_geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
    let trunk_material = new THREE.MeshPhongMaterial({color: 0x6b5700});
    let trunk = new THREE.Mesh(trunk_geometry, trunk_material);
    scene.add(trunk);
    trunk.position.x = location[0];
    trunk.position.y = location[1];
    trunk.position.z = location[2];

    let leaves_material = new THREE.MeshPhongMaterial({color: 0x1c8e38});

    let leaf = new THREE.ConeGeometry(0.75, 1, 12);
    let leaf1 = new THREE.Mesh(leaf, leaves_material);
    leaf1.position.x = location[0];
    leaf1.position.y = location[1] + 4;
    leaf1.position.z = location[2];

    leaf = new THREE.ConeGeometry(1, 1, 12);
    let leaf2 = new THREE.Mesh(leaf, leaves_material);
    leaf2.position.x = location[0];
    leaf2.position.y = location[1] + 3.5;
    leaf2.position.z = location[2];

    leaf = new THREE.ConeGeometry(1.25, 1, 12);
    let leaf3 = new THREE.Mesh(leaf, leaves_material);
    leaf3.position.x = location[0];
    leaf3.position.y = location[1] + 2.9;
    leaf3.position.z = location[2];

    leaf = new THREE.ConeGeometry(1.5, 1, 12);
    let leaf4 = new THREE.Mesh(leaf, leaves_material);
    leaf4.position.x = location[0];
    leaf4.position.y = location[1] + 2.3;
    leaf4.position.z = location[2];
    
    leaf = new THREE.ConeGeometry(1.75, 1, 12);
    let leaf5 = new THREE.Mesh(leaf, leaves_material);
    leaf5.position.x = location[0];
    leaf5.position.y = location[1] + 1.7;
    leaf5.position.z = location[2];
    
    leaf = new THREE.ConeGeometry(2, 1, 12);
    let leaf6 = new THREE.Mesh(leaf, leaves_material);
    leaf6.position.x = location[0];
    leaf6.position.y = location[1] + 1.1;
    leaf6.position.z = location[2];

    scene.add(leaf1);
    scene.add(leaf2);   
    scene.add(leaf3);
    scene.add(leaf4);
    scene.add(leaf5);
    scene.add(leaf6);
}

function createObjects() {
    let cube_geometry_1 = new THREE.BoxGeometry(1, 1, 1);
    // let cube_geometry_2 = new THREE.BoxGeometry(1, 1, 1);
    let cube_texture_1 = ["./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp"];

    let sphere_geometry = new THREE.SphereGeometry(2, 30, 14);
    let sphere_material = new THREE.MeshPhongMaterial({map: loadColorTexture('./../textures/Minecraft/zigzag.jpg')});
    let sph = new THREE.Mesh(sphere_geometry, sphere_material);
    scene.add(sph);
    sph.position.x = 5;
    // load sphere

    // load torus geometry
    // let torus_geometry_1 = new THREE.TorusGeometry(2, 0.1, 15, 50);
    // let torus_material  = new THREE.MeshPhongMaterial({map: loadColorTexture('./../textures/Minecraft/pattern.jpg')});
    // torus_geometry_1.rotateX(Math.PI/6)
    // let torus = new THREE.Mesh( torus_geometry_1, torus_material );
    // scene.add(torus);
    // let torus_texture_1 = ;

    // creates an instance of all non-custom files
    scene_items = [
        // makeInstance(cube_geometry_1, cube_texture_1, [3, 0.5, 4]),
        // makeInstance(cube_geometry_1, cube_texture_1, [3, 0.5, 5]),
        // torus,
        sph,
        // makeInstance(torus_geometry_1, './../textures/Minecraft/pattern.jpg', [-3, 4, 4]),
    ];

    createTree([12, 0, 0]);
    createTree([0, 0, 5]);
    createTree([40, 4, 30]);
    createTree([60, 1, -50]);
    createTree([-65, 9, 102]);
    createTree([-90, 16, -142]);
    createTree([-20, 1, -49]);

    mtlloader.load('./../textures/models/GTR.mtl', (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
        objLoader.load('./../textures/models/GTR.obj', (root) => {
            scene.add(root);
            scene_items.push(root);
            root.position.x = -4;
        });
    });

    



}

function main() {
    setUpScene();

    //load grass
    // {
    //     let planeSize = 40;
    //     let ground = loader.load('./../textures/Minecraft/grass.jpeg');
    //     ground.wrapS = THREE.RepeatWrapping;
    //     ground.wrapT = THREE.RepeatWrapping;
    //     ground.colorSpace = THREE.SRGBColorSpace;
    //     let repeats = planeSize / 2;
    //     ground.repeat.set(repeats, repeats);
    //     let planeMat = new THREE.MeshPhongMaterial({
    //         map: ground,
    //         side: THREE.DoubleSide,
    //     });
    //     let planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    //     let mesh = new THREE.Mesh(planeGeo, planeMat);
    //     mesh.rotation.x = Math.PI * -.5;
    //     scene.add(mesh);
    // }
    //load cube

    createObjects();
    function render(time) {
        time *= 0.001;  // convert time to seconds

        let speed = 3;
        let rot = time * speed;
        scene_items[0].rotation.y = rot;
        sky.material.uniforms["iTime"].value = time;
        // scene_items[3].rotation.y = rot;
        // objects.forEach((obj, ndx) => {
        //   let speed = 1 + ndx * .1;
        //   let rot = time * speed;
        //   obj.rotation.x = rot;
        //   obj.rotation.y = rot;
        // });
        
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();