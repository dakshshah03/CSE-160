// Daksh Shah
// ID: 1953946
// dakshah@ucsc.edu
// asg1.js


// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_GlobalTranslateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_GlobalTranslateMatrix * u_ModelMatrix * a_Position;
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
let u_GlobalTranslateMatrix;

let g_animationActive = true;
let g_animationShift = false;
// let g_animationAngle = 0.0;

let g_cameraAngleY = 0.0;
let g_cameraAngleX = 0.0;
let g_cameraAngleZ = 0.0;


//body control angles
var g_headAngle = [0.0, 0.0, 0.0];
var g_flAngle = 10.0;
var g_frAngle = 10.0;
var g_flLowerAngle = 0.0;
var g_frLowerAngle = 0.0;
var g_blAngle = -20.0;
var g_brAngle = -20.0;
var g_blLowerAngle = 40.0;
var g_brLowerAngle = 40.0;

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

  u_GlobalTranslateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalTranslateMatrix');
  if(!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_GlobalTranslateMatrix');
    return;
  }

  let x = new Matrix4();
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, x.elements);
}

function addActionListeners() {
  // button events
  document.getElementById('toggle-animation').onclick = function() {g_animationActive = !g_animationActive;};
  // document.getElementById('clear-canvas').onclick = function() {g_shapesList = []; renderAllShapes();};
  // document.getElementById('squares').onclick = function() {g_selectedShape = POINT;};
  // document.getElementById('triangles').onclick = function() {g_selectedShape = TRIANGLE;};
  // document.getElementById('circles').onclick = function() {g_selectedShape = CIRCLE;};
  
  // slider events
  document.getElementById('h-slider-x').addEventListener('mousemove', function() {g_headAngle[0] = this.value; renderAllShapes();});
  document.getElementById('h-slider-y').addEventListener('mousemove', function() {g_headAngle[1] = this.value; renderAllShapes();});
  document.getElementById('h-slider-z').addEventListener('mousemove', function() {g_headAngle[2] = this.value; renderAllShapes();});

  document.getElementById('front-left-leg-upper-slider').addEventListener('mousemove', function() {g_flAngle = this.value; renderAllShapes();});
  document.getElementById('front-left-leg-lower-slider').addEventListener('mousemove', function() {g_flLowerAngle = this.value; renderAllShapes();});

  document.getElementById('front-right-leg-upper-slider').addEventListener('mousemove', function() {g_frAngle = this.value; renderAllShapes();});
  document.getElementById('front-right-leg-lower-slider').addEventListener('mousemove', function() {g_frLowerAngle = this.value; renderAllShapes();});

  document.getElementById('back-left-leg-upper-slider').addEventListener('mousemove', function() {g_blAngle = this.value; renderAllShapes();});
  document.getElementById('back-left-leg-lower-slider').addEventListener('mousemove', function() {g_blLowerAngle = this.value; renderAllShapes();});

  document.getElementById('back-right-leg-upper-slider').addEventListener('mousemove', function() {g_brAngle = this.value; renderAllShapes();});
  document.getElementById('back-right-leg-lower-slider').addEventListener('mousemove', function() {g_brLowerAngle = this.value; renderAllShapes();});

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
  var globalRotMat = new Matrix4().rotate(-g_cameraAngleX*1, 1, 0, 0);
  // globalRotMat.rotate(45, 0, 1, 0);
  globalRotMat.rotate(g_cameraAngleY*1, 0, 1, 0);
  globalRotMat.rotate(g_cameraAngleZ*1, 0, 0, 1);
  var globalTMat = new Matrix4().translate(0, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.uniformMatrix4fv(u_GlobalTranslateMatrix, false, globalTMat.elements);
  // body vars
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
  let legBL_3 = new Cube();
  let legBR_1 = new Cube();
  let legBR_2 = new Cube();
  let legBR_3 = new Cube();

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

  var l_flAngle = g_flAngle;
  var l_frAngle = g_frAngle;
  var l_flLowerAngle = g_flLowerAngle;
  var l_frLowerAngle = g_frLowerAngle;
  var l_blAngle = g_blAngle;
  var l_brAngle = g_brAngle;
  var l_blLowerAngle = g_blLowerAngle;
  var l_brLowerAngle = g_brLowerAngle;
  var l_neckAngle = [g_headAngle[0], g_headAngle[1], g_headAngle[2]];
  var speedMultiplier = 5;
  var distLowerMultiplier = 15;
  var distUpperMultiplier = 20;
  var neckMultiplier = 5;

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if(g_animationActive) {
    // front left leg animation
    l_flAngle = g_flAngle*1 + distUpperMultiplier * Math.sin(g_seconds*speedMultiplier);
    l_flLowerAngle = g_flLowerAngle*1 -10 + distLowerMultiplier * Math.sin(g_seconds*speedMultiplier);
    l_frAngle = g_frAngle*1 + distUpperMultiplier * Math.sin(g_seconds*speedMultiplier + Math.PI);
    l_frLowerAngle = g_frLowerAngle*1 -10 + distLowerMultiplier * Math.sin(g_seconds*speedMultiplier + Math.PI);

    l_blAngle = g_blAngle*1 + 0.75*distUpperMultiplier * Math.sin(g_seconds*speedMultiplier + Math.PI);
    l_brAngle = g_brAngle*1 + 0.75*distUpperMultiplier * Math.sin(g_seconds*speedMultiplier);
    l_blLowerAngle = g_blLowerAngle*1 + distLowerMultiplier * Math.sin(g_seconds*speedMultiplier + Math.PI);
    l_brLowerAngle = g_brLowerAngle*1 + distLowerMultiplier * Math.sin(g_seconds*speedMultiplier);

    // console.log(g_headAngle[2]);
    l_neckAngle[2] = g_headAngle[2]*1 + neckMultiplier * Math.sin(g_seconds*5);
  }
    
  // draw main body
  {
    body.color = [0.75, 0.65, 0.4, 1.0];
    body.matrix.scale(0.5, 0.3, 0.75);
    body.matrix.translate(-0.5, -0.5, -0.5);
    body.render();
  }
  // front legs
  // front left leg
  {
    neck.color = [0.75, 0.65, 0.4, 1.0];
    neck.matrix.translate(0, -0.05, -0.35);
    neck.matrix.rotate(-40, 1, 0, 0);
    neck.matrix.rotate(l_neckAngle[2], 0, 0, 1);
    var n_mat = new Matrix4(neck.matrix);
    neck.matrix.scale(0.2, 0.4, 0.2);
    neck.matrix.translate(-0.5, 0, 0);
    neck.render();

    head.color = [0.7, 0.6, 0.35, 1.0];
    // head.matrix.translate(0, 0.4, -0.5);
    head.matrix = n_mat;
    head.matrix.translate(-0.125, 0.4, -0.1);
    head.matrix.rotate(40, 1, 0, 0);
    var head_mat = new Matrix4(head.matrix);
    head.matrix.scale(0.25, 0.25, 0.3);
    head.render();

    earL.color = [0.5, 0.43, 0.3, 1.0];
    earL.matrix = new Matrix4(head_mat);
    earL.matrix.translate(0.2, 0.25, 0.14);
    earL.matrix.rotate(135, 0, 1, 0);
    earL.matrix.scale(0.1, 0.1, 0.1);
    earL.render();

    earR.color = [0.5, 0.43, 0.3, 1.0];
    earR.matrix = new Matrix4(head_mat);
    earR.matrix.translate(0.05, 0.25, 0.14);
    earR.matrix.rotate(45, 0, 1, 0);
    earR.matrix.scale(0.1, 0.1, -0.1);
    earR.render();

    
    eyeL.color = [1.0, 1.0, 1.0, 1.0];
    eyeL.matrix = new Matrix4(head_mat);
    eyeL.matrix.translate(0.23, 0.15, 0.02);
    eyeL.matrix.scale(0.05, 0.06, 0.06);
    eyeL.render();

    eyeL.color = [0.0, 0.0, 0.0, 1.0];
    eyeL.matrix = new Matrix4(head_mat);
    eyeL.matrix.translate(0.24, 0.16, 0.035);
    eyeL.matrix.scale(0.05, 0.04, 0.03);
    eyeL.render();
    
  
    eyeR.color = [1.0, 1.0, 1.0, 1.0];
    eyeR.matrix = new Matrix4(head_mat);
    eyeR.matrix.translate(-0.03, 0.15, 0.02);
    eyeR.matrix.scale(0.05, 0.06, 0.06);
    eyeR.render();

    eyeR.color = [0.0, 0.0, 0.0, 1.0];
    eyeR.matrix = new Matrix4(head_mat);
    eyeR.matrix.translate(-0.04, 0.16, 0.035);
    eyeR.matrix.scale(0.05, 0.04, 0.03);
    eyeR.render();
    

    snout.color = [0.6, 0.5, 0.3, 1.0];
    snout.matrix = head_mat;
    snout.matrix.translate(0.06, 0, -0.2);
    var snout_mat = new Matrix4(snout.matrix);
    snout.matrix.scale(0.13, 0.13, 0.25);
    snout.render();

    nose.color = [0.35, 0.28, 0.22, 1.0];
    nose.matrix = snout_mat;
    nose.matrix.translate(0.015, 0.08, -0.03);
    nose.matrix.scale(0.1, 0.05, 0.1);
    nose.render();
  
  }
  {
    legFL_1.color = [0.65, 0.55, 0.3, 1.0];
    legFL_1.matrix.setTranslate(0.15, -0.05, -0.3);
    legFL_1.matrix.rotate(l_flAngle, 1, 0, 0);
    var fl_matrix = new Matrix4(legFL_1.matrix);
    legFL_1.matrix.rotate(180, 1, 0, 0);
    legFL_1.matrix.scale(0.15, 0.3, -0.15);
    legFL_1.render();

    legFL_2.color = [0.65, 0.55, 0.3, 1.0];
    legFL_2.matrix = fl_matrix;
    legFL_2.matrix.translate(0.025, -0.28, 0);
    legFL_2.matrix.rotate(180, 1, 0, 0);
    legFL_2.matrix.rotate(l_flLowerAngle, 1, 0, 0);
    // legFL_2.matrix.rotate(-1.5* g_flAngle, 1, 0, 0);
    var fl2_matrix = new Matrix4(legFL_2.matrix);
    legFL_2.matrix.scale(0.1, 0.4, -0.1);
    legFL_2.render();

    legFL_3.color = [0.25, 0.23, 0.16, 1.0];
    legFL_3.matrix = fl2_matrix;
    legFL_3.matrix.translate(-0.01, 0.3, -0.11);
    legFL_3.matrix.scale(0.12, 0.12, 0.12);
    legFL_3.render();
  }

  // front right leg
  {
    legFR_1.color = [0.65, 0.55, 0.3, 1.0];
    legFR_1.matrix.setTranslate(-0.3, -0.05, -0.3);
    legFR_1.matrix.rotate(l_frAngle, 1, 0, 0);
    var fr_matrix = new Matrix4(legFR_1.matrix);
    legFR_1.matrix.rotate(180, 1, 0, 0);
    legFR_1.matrix.scale(0.15, 0.3, -0.15);
    legFR_1.render();

    legFR_2.color = [0.65, 0.55, 0.3, 1.0];
    legFR_2.matrix = fr_matrix;
    legFR_2.matrix.translate(0.025, -0.28, 0);
    legFR_2.matrix.rotate(180, 1, 0, 0);
    legFR_2.matrix.rotate(l_frLowerAngle, 1, 0, 0);
    var fr2_matrix = new Matrix4(legFR_2.matrix);
    legFR_2.matrix.scale(0.1, 0.4, -0.1);
    legFR_2.render();

    legFR_3.color = [0.25, 0.23, 0.16, 1.0];
    legFR_3.matrix = fr2_matrix;
    legFR_3.matrix.translate(-0.01, 0.3, -0.11);
    legFR_3.matrix.scale(0.12, 0.12, 0.12);
    legFR_3.render();
  }

  // back legs
  // back left leg
  {
    legBL_1.color = [0.65, 0.55, 0.3, 1.0];
    legBL_1.matrix.translate(0.1, -0.05, .2);
    legBL_1.matrix.rotate(180, 1, 0, 0);
    legBL_1.matrix.rotate(l_blAngle, 1, 0, 0);
    var bl_matrix = new Matrix4(legBL_1.matrix);
    legBL_1.matrix.scale(0.2, 0.3, -0.2);
    legBL_1.render();

    legBL_2.color = [0.65, 0.55, 0.3, 1.0];
    legBL_2.matrix = bl_matrix;
    legBL_2.matrix.translate(0.05, 0.24, -0.15);
    legBL_2.matrix.rotate(l_blLowerAngle, 1, 0, 0);
    var bl2_matrix = new Matrix4(legBL_2.matrix);
    legBL_2.matrix.scale(0.1, 0.45, 0.1);
    legBL_2.render();

    legBL_3.color = [0.25, 0.23, 0.16, 1.0];
    legBL_3.matrix = bl2_matrix;
    legBL_3.matrix.translate(0.05, 0.45, 0.05);
    legBL_3.matrix.scale(0.12, 0.12, 0.12);
    legBL_3.matrix.translate(-0.5, -0.5, -0.5);
    legBL_3.render();
  }
  // back right leg
  {
    legBR_1.color = [0.65, 0.55, 0.3, 1.0];
    legBR_1.matrix.translate(-0.3, -0.05, .2);
    legBR_1.matrix.rotate(180, 1, 0, 0);
    legBR_1.matrix.rotate(l_brAngle, 1, 0, 0);
    var br_matrix = new Matrix4(legBR_1.matrix);
    legBR_1.matrix.scale(0.2, 0.3, -0.2);
    legBR_1.render();

    legBR_2.color = [0.65, 0.55, 0.3, 1.0];
    legBR_2.matrix = br_matrix;
    legBR_2.matrix.translate(0.05, 0.24, -0.15);
    legBR_2.matrix.rotate(l_brLowerAngle, 1, 0, 0);
    var br2_matrix = new Matrix4(legBR_2.matrix);
    legBR_2.matrix.scale(0.1, 0.45, 0.1);
    legBR_2.render();

    legBR_3.color = [0.25, 0.23, 0.16, 1.0];
    legBR_3.matrix = br2_matrix;
    legBR_3.matrix.translate(0.05, 0.45, 0.05);
    legBR_3.matrix.scale(0.12, 0.12, 0.12);
    legBR_3.matrix.translate(-0.5, -0.5, -0.5);
    legBR_3.render();
  }


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