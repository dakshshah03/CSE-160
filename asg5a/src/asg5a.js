import * as THREE from 'three';

let canvas;
let renderer;
let scene;
let camera;

function setUpScene() {
    canvas = document.querySelector('#c');
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    // renderer.setSize( window.innerWidth, window.innerHeight );
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

}

// function createCube(boxWidth = 1, boxHeight = 1, boxDepth = 1, c = 0x44aa88) {
//     const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
//     const material = new THREE.MeshBasicMaterial({color: c});
//     const cube = new THREE.Mesh(geometry, material);

//     scene.add(cube);
//     renderer.render(scene, camera);
//     return cube;
// }


// requestAnimationFrame(render);
function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({color});
   
    const cube = new THREE.Mesh(geometry, material);
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

    const cubes = [
        makeInstance(geometry, 0x44aa88,  0),
        makeInstance(geometry, 0x8844aa, -2),
        makeInstance(geometry, 0xaa8844,  2),
    ];
    

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