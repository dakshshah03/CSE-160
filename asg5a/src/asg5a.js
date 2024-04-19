import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


let canvas;
let renderer;
let scene;
let camera;
let loader;
let objLoader;
let controls;

function setUpScene() {
    canvas = document.querySelector('#c');

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 'black' );

    loader = new THREE.TextureLoader();
    objLoader = new OBJLoader();

    renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    renderer.setSize( window.innerWidth, window.innerHeight );
    // document.body.appendChild( renderer.domElement );

    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;
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

function makeInstance(geometry, files, x) {
    // const texture = loader.load( './../textures/dab.jpg' );
    // texture.colorSpace = THREE.SRGBColorSpace;
    let materials = createMaterials(files);
   
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);
   
    cube.position.x = x;
   
    return cube;
  }

function main() {
    setUpScene();
    

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    // const material = new THREE.MeshBasicMaterial({color: 0x44aa88});
    let files = ["./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp", "./../textures/Minecraft/dirt.webp"];

    const cubes = [
        // makeInstance(geometry, files,  0),
        // makeInstance(geometry, files, -2),
        // makeInstance(geometry, files,  2),
    ];
    
    objLoader.load('./../textures/models/car.obj', (root) => {
        scene.add(root);
    });

    function render(time) {
        time *= 0.001;  // convert time to seconds
       
        cubes.forEach((cube, ndx) => {
          const speed = 1 + ndx * .1;
          const rot = time * speed;
          cube.rotation.x = rot;
          cube.rotation.y = rot;
        });
        
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();