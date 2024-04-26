// Daksh Shah
// ID: 1953946
// dakshah@ucsc.edu
// asg1.js


// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// global vars
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;


const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10.0;
let g_selectedShape = POINT;
let g_cameraAngleY = 0.0;
let g_cameraAngleX = 0.0;
let g_cameraAngleZ = 0.0;
// let g_selectedSegmentCount = 10.0;
// let rgb_mode = false;
// let rgb_color = [1, 128, 255];
// let rainbow_mode = false;
// let rainbow_color = 0;

function setUpWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  let x = new Matrix4();
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, x.elements);
}

function addActionListeners() {
  // button events
  document.getElementById('clear-canvas').onclick = function() {g_shapesList = []; renderAllShapes();};
  document.getElementById('squares').onclick = function() {g_selectedShape = POINT;};
  document.getElementById('triangles').onclick = function() {g_selectedShape = TRIANGLE;};
  document.getElementById('circles').onclick = function() {g_selectedShape = CIRCLE;};
  
  // slider events
  // document.getElementById('red-slider').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/255; });
  // document.getElementById('green-slider').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/255; });
  // document.getElementById('blue-slider').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/255; });
  document.getElementById('cam-angle-x').addEventListener('mousemove', function() {g_cameraAngleX = this.value; renderAllShapes();});
  document.getElementById('cam-angle-y').addEventListener('mousemove', function() {g_cameraAngleY = this.value; renderAllShapes();});
  document.getElementById('cam-angle-z').addEventListener('mousemove', function() {g_cameraAngleZ = this.value; renderAllShapes();});
}


var g_shapesList = [];

function handleClicks(ev) {
  let [x, y] = convertMouseToEventCoords(ev);

  // create and store a point
  let point;
  if(g_selectedShape == POINT) {
    point = new Point();
  } else if (g_selectedShape == TRIANGLE) {
    point = new Triangle();
  } else if (g_selectedShape == CIRCLE) {
    point = new Circle();
    point.segments = g_selectedSegmentCount;
  }

  point.position = [x, y];
  if(rgb_mode == true) {
    rgb_color = [((rgb_color[0] + 1.2*g_selectedColor[0])%256), ((rgb_color[1] + 1.2*g_selectedColor[1])%256), ((rgb_color[2] + 1.2*g_selectedColor[2])%256), 1.0];
    point.color = [rgb_color[0]/255, rgb_color[1]/255, rgb_color[2]/255, 1.0];
  } else if(rainbow_mode == true) {
    point.color = getRainbowColor();
  } else {
    point.color = g_selectedColor.slice();
  }
  point.size = g_selectedSize;
  g_shapesList.push(point);

  renderAllShapes();
}

// function convertMouseToEventCoords(ev) {
//   var x = ev.clientX; // x coordinate of a mouse pointer
//   var y = ev.clientY; // y coordinate of a mouse pointer
//   var rect = ev.target.getBoundingClientRect();

//   x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
//   y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

//   return([x, y]);
// }


// make https://media1.tenor.com/m/OoGJfgQGlOkAAAAd/deer-dancing.gif


function renderAllShapes() {
  var start_time = performance.now();
  var globalRotMat = new Matrix4().rotate(g_cameraAngleX, 1, 0, 0);
  globalRotMat.rotate(g_cameraAngleY, 0, 1, 0);
  globalRotMat.rotate(g_cameraAngleZ, 0, 0, 1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  // body vars
  let body_mat = new Matrix4();
  var body = new Cube();

  // front legs
  let legFL_1 = new Cube(); // body joint
  let legFL_2 = new Cube(); // second joint
  let legFL_3 = new Cube(); // hoof joint
  let legFR_1 = new Cube();
  let legFR_2 = new Cube();
  let legFR_3 = new Cube();

  // back legs
  let legBL_1 = new Cube(); // body joint
  let legBL_2 = new Cube(); // foot joint
  let legBR_1 = new Cube();
  let legBR_2 = new Cube();

  // tail vars
  let tail = new Cube();

  // head vars
  let head = new Cube(); 
  let neck = new Cube();
  let snout = new Cube();
  let nose = new Cube();
  let eyeL = new Cube();
  let eyeR = new Cube();

  //ears
  let earL = new Pyramid();
  let earR = new Pyramid();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // // draw main body=
  body.color = [0.75, 0.65, 0.4, 1.0];
  body.matrix.scale(0.5, 0.3, 0.75);
  // body.matrix.translate(-0.5, -0.5, 0);
  body.render();

  // head.color = 
  // neck.color = [0.75, 0.65, 0.4, 1.0];
  // neck.matrix.scale(0.1, 0.1, 0.2);
  // neck.matrix.translate(0, 0.45, -0.3);
  // neck.render();

  // drawTriangle3D([-1.0, 0.0, 0.0,   -0.5, -1.0, 0.0,    0.0, 0.0, 0.0]);

  // let body = new Cube();
  // body.color = [1.0, 0, 0, 1.0];
  // body.matrix.translate(-0.25, -0.5, 0.0);
  // body.matrix.scale(0.5, 1, 0.5);
  // body.render();

  // let left_arm = new Cube();
  // left_arm.color = [1.0, 1, 0, 1.0];
  // left_arm.matrix.setTranslate(0.7, 0, 0.0);
  // left_arm.matrix.rotate(45, 0, 0, 1);
  // left_arm.matrix.scale(0.25, .7, 0.5);
  // left_arm.render();
  
  // let box = new Cube();
  // box.color = [1.0, 0, 1, 1.0];
  // box.matrix.translate(0, 0, -0.5, 0);
  // box.matrix.rotate(-30, 1, 0, 0);
  // box.matrix.scale(0.5, 0.5, 0.5);
  // box.render();

  // let e = new Pyramid();
  // e.matrix.scale(0.3, 0.3, 0.3);
  // e.render();



  var duration = performance.now() - start_time;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), 'performance-display');
}

function sendTextToHTML(txt, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if(!htmlID) {
    console.log("Failed to get " + htmlID + " from HTML.");
    return;
  }
  htmlElm.innerHTML = txt;
}

function main() {
  // set up canvas and gl
  setUpWebGL();
  // set up 
  connectVariablesToGLSL();

  addActionListeners();

  // canvas.onmousedown = handleClicks //function(ev){ click(ev, gl, canvas, a_Position, u_FragColor) };
  // canvas.onmousemove = function(ev) {if(ev.buttons == 1) {handleClicks(ev);};};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  
  renderAllShapes();
  // g_shapesList = [];
  // renderAllShapes();
}

// main();