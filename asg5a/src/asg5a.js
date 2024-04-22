import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


let canvas;
let renderer;
let scene;
let camera;
let loader;
let objLoader;
let controls;
let mtlloader;

function setUpScene() {
    canvas = document.querySelector('#c');

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 'black' );

    loader = new THREE.TextureLoader();
    objLoader = new OBJLoader();
    mtlloader = new MTLLoader();

    renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    renderer.setSize( window.innerWidth, window.innerHeight );
    // document.body.appendChild( renderer.domElement );

    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 10; 
    camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.z = 2;

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);   

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
        materials.push(new THREE.MeshBasicMaterial({map: loadColorTexture(files[i])}));
    }
    return materials;
}

function makeInstance(geometry, files, translation, rotation, axis, scale) {
    // add object to scene
    let materials = createMaterials(files);
    const obj = new THREE.Mesh(geometry, materials);
    scene.add(obj);

    // transformations
    geometry.translate(translation[0], translation[1], translation[2]);

    if(axis === 'x') {
        geometry.rotateX(rotation);
    } else if(axis === 'y') {
        geometry.rotateY(rotation);
    } else if(axis === 'z') {
        geometry.rotateZ(rotation);
    }

    geometry.scale(scale[0], scale[1], scale[2]);

    return obj;
  }


function main() {
    setUpScene();

    const cube_geometry = new THREE.BoxGeometry(1, 1, 1);
    let cube_texture_1 = ["./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp"];


    // creates an instance of all non-custom files
    const objects = [
        makeInstance(cube_geometry, cube_texture_1, [0, 3, 0], 0, 'x', [1, 1, 1]),
        // makeInstance(geometry, files, -2),
        // makeInstance(geometry, files,  2),
    ];

    mtlloader.load('./../textures/models/GTR.mtl', (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
        objLoader.load('./../textures/models/GTR.obj', (root) => {
            objLoader.scale.setScalar(0.5, 0.5, 0.5);
            scene.add(root);
        });
    });
    
    

    function render(time) {
        time *= 0.001;  // convert time to seconds
       
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