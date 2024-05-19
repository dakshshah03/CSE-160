import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


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

function setUpScene() {
    canvas = document.querySelector('#c');

    scene = new THREE.Scene();

    loader = new THREE.TextureLoader();
    cubeLoader = new THREE.CubeTextureLoader();
    objLoader = new OBJLoader();
    mtlloader = new MTLLoader();



    
    scene.background = cubeLoader.load([
        './../textures/sky/px.png',
        './../textures/sky/nx.png',
        './../textures/sky/py.png',
        './../textures/sky/ny.png',
        './../textures/sky/pz.png',
        './../textures/sky/nz.png'
    ]);
    scene.background.colorSpace = THREE.SRGBColorSpace;

    renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    renderer.setSize( window.innerWidth, window.innerHeight );
    // document.body.appendChild( renderer.domElement );

    const fov = 100;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100; 
    camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.z = 5;
    camera.position.x = -4;
    camera.position.y = 2;

    let color = 0xFFFFFF;
    let intensity = 100;
    let light = new THREE.SpotLight(color, intensity);
    light.position.set(2, 8, 2);
    scene.add(light);

    color = 0x6EFFC1;
    intensity = 2;
    let light2 = new THREE.AmbientLight(color, intensity);
    scene.add(light2);

    controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 1, 0 );
	controls.update();
}

function loadColorTexture( path ) {
    const texture = loader.load( path );
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
    const obj = new THREE.Mesh(geometry, materials);
    scene.add(obj);

    obj.position.x = position[0];
    obj.position.y = position[1];
    obj.position.z = position[2];

    return obj;
  }

function createObjects() {
    const cube_geometry_1 = new THREE.BoxGeometry(1, 1, 1);
    // const cube_geometry_2 = new THREE.BoxGeometry(1, 1, 1);
    let cube_texture_1 = ["./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp"];

    const sphere_geometry = new THREE.SphereGeometry(2, 30, 14);
    let sphere_material = new THREE.MeshPhongMaterial({map: loadColorTexture('./../textures/Minecraft/zigzag.jpg')});
    const sph = new THREE.Mesh(sphere_geometry, sphere_material);
    scene.add(sph);
    sph.position.x = 5;
    // load sphere

    // load torus geometry
    // const torus_geometry_1 = new THREE.TorusGeometry(2, 0.1, 15, 50);
    // const torus_material  = new THREE.MeshPhongMaterial({map: loadColorTexture('./../textures/Minecraft/pattern.jpg')});
    // torus_geometry_1.rotateX(Math.PI/6)
    // const torus = new THREE.Mesh( torus_geometry_1, torus_material );
    // scene.add(torus);
    // let torus_texture_1 = ;

    // creates an instance of all non-custom files
    scene_items = [
        makeInstance(cube_geometry_1, cube_texture_1, [3, 0.5, 4]),
        makeInstance(cube_geometry_1, cube_texture_1, [3, 0.5, 5]),
        // torus,
        sph,
        // makeInstance(torus_geometry_1, './../textures/Minecraft/pattern.jpg', [-3, 4, 4]),
    ];

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
    //     const ground = loader.load('./../textures/Minecraft/grass.jpeg');
    //     ground.wrapS = THREE.RepeatWrapping;
    //     ground.wrapT = THREE.RepeatWrapping;
    //     ground.colorSpace = THREE.SRGBColorSpace;
    //     const repeats = planeSize / 2;
    //     ground.repeat.set(repeats, repeats);
    //     const planeMat = new THREE.MeshPhongMaterial({
    //         map: ground,
    //         side: THREE.DoubleSide,
    //     });
    //     const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    //     const mesh = new THREE.Mesh(planeGeo, planeMat);
    //     mesh.rotation.x = Math.PI * -.5;
    //     scene.add(mesh);
    // }
    //load cube

    createObjects();
    function render(time) {
        time *= 0.001;  // convert time to seconds

        const speed = 3;
        const rot = time * speed;
        scene_items[2].rotation.y = rot;
        // scene_items[3].rotation.y = rot;
        // objects.forEach((obj, ndx) => {
        //   const speed = 1 + ndx * .1;
        //   const rot = time * speed;
        //   obj.rotation.x = rot;
        //   obj.rotation.y = rot;
        // });
        
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();