// Daksh Shah
// ID: 1953946
// dakshah@ucsc.edu
// asg1.js


// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;

  varying vec2 v_UV;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;

  varying vec2 v_UV;
  uniform vec4 u_FragColor;

  void main() {
    gl_FragColor = u_FragColor;
    //gl_FragColor = vec4(v_UV, 1.0, 1.0);
  }`

// global vars
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;

let g_cameraAngleX = 0;
let g_cameraAngleY = 0;
let g_cameraAngleZ = 0;

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

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if(!a_UV) {
    console.log('Failed to get the storage location of a_UV');
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

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if(!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  let x = new Matrix4();
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, x.elements);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, x.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, x.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, x.elements);
}

function addActionListeners() {
  // button events
  // document.getElementById('toggle-animation').onclick = function() {g_animationActive = !g_animationActive;};
  // document.getElementById('toggle-shift').onclick = function() {g_animationShift = !g_animationShift;};
  
  // slider events
  document.getElementById('cam-angle-x').addEventListener('mousemove', function() {g_cameraAngleX = this.value; renderAllShapes();});
  document.getElementById('cam-angle-y').addEventListener('mousemove', function() {g_cameraAngleY = this.value; renderAllShapes();});
  document.getElementById('cam-angle-z').addEventListener('mousemove', function() {g_cameraAngleZ = this.value; renderAllShapes();});


  // mouse events
  // document.getElementById('display-container').addEventListener('click', function(ev) {
  //   if(ev.shiftKey) {
  //     g_animationShift = !g_animationShift;
  //   }
  // });

  // canvas.onmousemove = function(ev) {
  //   let [x, y] = convertMouseToEventCoords(ev);
  //   if(ev.buttons == 1) {
  //     g_cameraAngleY -= (x - g_deltaX) * 120;
  //     g_cameraAngleX -= (y - g_deltaY) * 120;
  //     g_deltaX = x;
  //     g_deltaY = y;
  //   } else {
  //     g_deltaX = x;
  //     g_deltaY = y;
  //   }
  // }
}


function convertMouseToEventCoords(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

function renderAllShapes() {
  var start_time = performance.now();
  let viewMat = new Matrix4();
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  let projMat = new Matrix4();
  // projMat.setPerspective(30, 1, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  let globalRotMat = new Matrix4().rotate(-40, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let a = new Cube();
  a.color = [1, 0, 0, 1];
  a.render();

  // let body = new Cube();
  // body.color = [1.0, 0, 0, 1.0];
  // body.matrix.translate(-0.25, -0.5, 0.0);
  // body.matrix.scale(0.5, 1, 0.5);
  // body.render();



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

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  // console.log(g_seconds);
  g_seconds = performance.now()/1000.0 - g_startTime;
  

  renderAllShapes();

  requestAnimationFrame(tick);
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
  requestAnimationFrame(tick);
}

// main();