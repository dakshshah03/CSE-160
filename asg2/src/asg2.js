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
let g_selectedSegmentCount = 10.0;
let rgb_mode = false;
let rgb_color = [1, 128, 255];
let rainbow_mode = false;
let rainbow_color = 0;

function setUpWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
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

  // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  // if(!u_Size) {
  //   console.log('Failed to get the storage location of u_Size');
  //   return;
  // }

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
  document.getElementById('generate-picture').onclick = function() {generatePicture()};
  document.getElementById('rgb').addEventListener('change', function() {if(this.checked) {rgb_mode = true;} else {rgb_mode = false;};});
  document.getElementById('rainbow').addEventListener('change', function() {if(this.checked) {rainbow_mode = true;} else {rainbow_mode = false;};});
  
  // slider events
  document.getElementById('red-slider').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/255; });
  document.getElementById('green-slider').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/255; });
  document.getElementById('blue-slider').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/255; });

  document.getElementById('shape-size-slider').addEventListener('mouseup', function() {g_selectedSize = this.value; });

  document.getElementById('segment-count-slider').addEventListener('mouseup', function() {g_selectedSegmentCount = this.value; });
}



// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];

function getRainbowColor() {
  rainbow_color += 5;
  rainbow_color = rainbow_color%1536;
  if(rainbow_color <= 255) {
    return [1.0, 0, (rainbow_color%256)/256, 1.0];
  } else if(rainbow_color <= 511) {
    return [(256 - (rainbow_color%256))/256, 0, 1.0, 1.0];
  } else if(rainbow_color <= 767) {
    return [0, (rainbow_color%256)/256, 1.0, 1.0];
  } else if(rainbow_color <= 1023) {
    return [0, 1.0, (256 - (rainbow_color%256))/256, 1.0];
  } else if(rainbow_color <= 1279) {
    return [(rainbow_color%256)/256, 1.0, 0, 1.0];
  } else if(rainbow_color <= 1535) {
    return [1.0, (256 - (rainbow_color%256))/256, 0, 1.0];
  }
}

var g_shapesList = [];

function handleClicks(ev) {
  // let r = document.getElementById('red-slider').value;
  // let g = document.getElementById('green-slider').value;
  // let b = document.getElementById('blue-slider').value;
  // addActionListeners();

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

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // var len = g_shapesList.length;
  // for(var i = 0; i < len; i++) {
  //   g_shapesList[i].render();
  // }
  // g_shapesList = [];
  drawTriangle3D([-1.0, 0.0, 0.0,   -0.5, -1.0, 0.0,    0.0, 0.0, 0.0]);

  let body = new Cube();
  body.color = [1.0, 0, 0, 1.0];
  body.matrix.translate(-0.25, -0.5, 0.0);
  body.matrix.scale(0.5, 1, 0.5);
  body.render();

  let left_arm = new Cube();
  left_arm.color = [1.0, 1, 0, 1.0];
  left_arm.matrix.setTranslate(0.7, 0, 0.0);
  left_arm.matrix.rotate(45, 0, 0, 1)
  left_arm.matrix.scale(0.25, .7, 0.5);
  left_arm.render();
  
  // drawTriangle3D([-1.0, 0.0, 0.0,   -0.5, -1.0, 0.0,    0.0, 0.0, 0.0]);


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

function generatePicture() {
  // clear the canvas
  g_shapesList = []; 
  renderAllShapes();

  //draw the picture
  // for(let i = 0; i < 25; i++) {
  //   g_shapesList.push(new Triangle());
  // }

  // g_shapesList[0].position = [-.5, 0.8, -.5, 0.95, -0.6, 0.95];

  // cloud
  drawTriangleColor([-.5, 0.8, -.5, 0.95, -0.8, 0.88], [110.0, 121.0, 138.0, 1.0]);
  drawTriangleColor([-.5, 0.8, -.5, 0.95, 0.1, 0.95], [73.0, 82.0, 97.0, 1.0]);
  drawTriangleColor([-.5, 0.8, .4, 0.67, 0.1, 0.95], [93.0, 100.0, 110.0, 1.0]);
  drawTriangleColor([-.5, 0.8, .4, 0.67, -0.7, 0.5], [110.0, 121.0, 138.0, 1.0]);
  drawTriangleColor([-.5, 0.8, -.9, 0.7, -0.7, 0.5], [100.0, 110.0, 133.0, 1.0]);
  drawTriangleColor([-.5, 0.8, -.9, 0.7, -0.8, 0.88], [73.0, 82.0, 97.0, 1.0]);

  // draw water
  drawTriangleColor([-1.0, -0.3, -1.0, -0.1, 0.5, -0.1], [32.0, 65.0, 190., 1.0]);
  drawTriangleColor([-1.0, -0.3, -1.0, -1, 0.5, -0.1], [7.0, 57.0, 138.0, 1.0]);
  drawTriangleColor([0.4, -1, -1.0, -1, 0.5, -0.1], [54.0, 98.0, 168.0, 1.0]);
  drawTriangleColor([0.4, -1, 1.0, -1, 0.5, -0.1], [7.0, 57.0, 138.0, 1.0]);
  drawTriangleColor([1, -1, 1.0, -0.1, 0.5, -0.1], [32.0, 65.0, 190., 1.0]);

  // add moon
  drawTriangleColor([0.7, 0.6, 0.6, 0.5, 0.6, 0.7], [189.0, 200.0, 219.0, 1.0]);
  drawTriangleColor([0.5, 0.6, 0.6, 0.5, 0.6, 0.7], [154.0, 170.0, 202.0, 1.0]);

  // add bridge
  drawTriangleColor([-1, 0, -0.5, 0, -0.5, 0.13], [155, 4, 55, 1.0]);
  drawTriangleColor([-0.1, 0, -0.5, 0, -0.5, 0.1], [219, 4, 55, 1.0]);
  drawTriangleColor([1, 0, 0.5, 0, 0.5, 0.13], [155, 4, 55, 1.0]);
  drawTriangleColor([0.1, 0, 0.5, 0, 0.5, 0.1], [219, 4, 55, 1.0]);
  drawTriangleColor([-1, 0, -1, -0.1, -0.3, 0], [87, 1, 21, 1.0]);
  drawTriangleColor([1, 0, 1, -0.1, 0.3, 0], [87, 1, 21, 1.0]);
  drawTriangleColor([-0.3, 0, 0, -0.1, 0.3, 0], [87, 1, 21, 1.0]);

  // renderAllShapes();

}

function generateAnimal() {
  drawTriangle3D([-1.0, 0.0, 0.0,   -0.5, -1.0, 0.0,    0.0, 0.0, 0.0]);

  let body = new Cube();
  body.color = [1.0, 0, 0, 1.0];
  body.matrix.translate(-0.25, -0.5, 0.0);
  body.matrix.scale(0.5, 1, 0.5);
  body.render();

  let left_arm = new Cube();
  left_arm.color = [1.0, 1, 0, 1.0];
  left_arm.matrix.translate(0.7, 0, 0.0);
  left_arm.matrix.rotate(45, 0, 0, 1)
  left_arm.matrix.scale(0.25, .7, 0.5);
  left_arm.render();
}

function main() {
  // set up canvas and gl
  setUpWebGL();
  // set up 
  connectVariablesToGLSL();

  addActionListeners();

  canvas.onmousedown = handleClicks //function(ev){ click(ev, gl, canvas, a_Position, u_FragColor) };
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) {handleClicks(ev);};};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  
  renderAllShapes();
  // g_shapesList = [];
  // renderAllShapes();
}

// main();