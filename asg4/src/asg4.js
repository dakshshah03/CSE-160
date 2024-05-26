// Daksh Shah
// ID: 1953946
// dakshah@ucsc.edu
// asg1.js


// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;

  varying vec2 v_UV;
  varying vec3 v_Normal;

  uniform vec4 u_FragColor;

  uniform float u_ambientLevel;
  uniform float u_specularCoefficient;
  uniform vec3 u_diffuseColor;
  uniform vec3 u_specularColor;
  uniform vec3 u_ambientColor;

  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;

  uniform int u_textureOption;
  uniform float u_texColorWeight;
  uniform bool u_normalOn;
  uniform bool u_lightOn;

  uniform bool u_spotlightOn;
  uniform vec3 u_spotlightPosition;
  uniform vec3 u_spotlightDirection;
  uniform float u_spotlightCutoff;
  uniform float u_spotlightExponent;

  uniform vec3 u_cameraPos;

  uniform vec3 u_lightPos;
  varying vec4 v_VertPos;

  void main() {
    if(u_textureOption == -1 || u_normalOn) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else if(u_textureOption == 0) {  
      gl_FragColor = u_FragColor;
    } else if(u_textureOption == 1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if(u_textureOption == 2) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if(u_textureOption == 3) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if(u_textureOption == 4) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if(u_textureOption == 5) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else if(u_textureOption == 6) {
      gl_FragColor = texture2D(u_Sampler4, v_UV);
    } else if(u_textureOption == 7) {
      gl_FragColor = texture2D(u_Sampler5, v_UV);
    }

    vec3 lightVector = vec3(v_VertPos) - u_lightPos;
    float r= length(lightVector);
    
      // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    // reflection
    vec3 R = reflect(L, N);

    // eye
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

    // specular
    vec3 specular = u_specularColor * pow(max(dot(E, R), 0.0), u_specularCoefficient);

    vec3 diffuse = vec3(u_diffuseColor) * vec3(gl_FragColor) * nDotL * 0.5;
    vec3 ambient = vec3(u_ambientColor) * vec3(gl_FragColor) * u_ambientLevel;


    float spotFactor;
    if(u_spotlightOn) {
      vec3 L_spot = normalize(vec3(v_VertPos) - u_spotlightPosition);
      vec3 D = normalize(vec3(u_spotlightDirection));
      float angle = dot(L_spot, D);
      if(angle > u_spotlightCutoff) {
        spotFactor = pow(angle, u_spotlightExponent);
        // spotFactor = 1.0;
      } else {
        spotFactor = 0.3;
      }
      // gl_FragColor = vec4(spotFactor * (specular + diffuse + ambient), 1.0);
    } else {
      spotFactor = 1.0;
    }

    if(u_lightOn) {
      if(u_textureOption > 1 || u_textureOption == 0) {
        gl_FragColor = vec4(spotFactor * (specular + diffuse + ambient), 1.0);
      } else {
        gl_FragColor = vec4(diffuse + ambient, 1.0);
      }
    }
  }`;

const SKY = 2;
const GRASS_BOTTOM = 3;
const GRASS_SIDE = 4;
const GRASS_TOP = 5;
const DIRT = 3;
const PLANK = 6;


// global vars
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_textureSegment;
let camera;

let u_lightPos;
let u_normalOn;
let u_ambientLevel;
let u_specularCoefficient;
let u_cameraPos;
let u_specularColor;
let u_diffuseColor;
let u_ambientColor;
let u_lightOn;

let u_spotlightOn;
let u_spotlightPosition;
let u_spotlightDirection;
let u_spotlightCutoff;
let u_spotlightExponent;

// let world;
// let u_texColorWeight;

let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;

let u_textureOption;

let g_cameraAngleX = 0;
let g_cameraAngleY = 0;
// let g_cameraAngleZ = 0;
let g_animationActive = true;

let g_normalOn = false;
let g_lightPos = [0,2,0];
let g_lightOn = true;
// let g_specularColor = [0.5,0.5,0.5];
let g_specularColor = [0.5,0.5,0.5];
let g_diffuseColor = [0.1,0.1,0.1];
let g_ambientColor = [0.5,0.5,0.5];
let g_ambientLevel = 0.65;
let g_specularCoefficient = 30.0;

let g_spotlight = {
  active: true,
  position: [0, 3, 0],
  direction: [0, -1, 0],
  cutoff: 0.8,
  exponent: 2
}

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
var g_tailAngle = 0.0;

let g_deltaX = 0;
let g_deltaY = 0;

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
  // gl.enable(gl.CULL_FACE);
  // gl.cullFace(gl.BACK_AND_FRONT);
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

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if(!a_Normal) {
    console.log('Failed to get the storage location of a_Normal');
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

  u_normalOn = gl.getUniformLocation(gl.program, 'u_normalOn');
  if(!u_normalOn) {
    console.log('Failed to get the storage location of u_normalOn');
    return;
  }

  u_ambientLevel = gl.getUniformLocation(gl.program, 'u_ambientLevel');
  if(!u_ambientLevel) {
    console.log('Failed to get the storage location of u_ambientLevel');
    return;
  }

  u_diffuseColor = gl.getUniformLocation(gl.program, 'u_diffuseColor');
  if(!u_diffuseColor) {
    console.log('Failed to get the storage location of u_diffuseColor');
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if(!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
  if(!u_spotlightOn) {
    console.log('Failed to get the storage location of u_spotlightOn');
    return;
  }

  u_specularCoefficient = gl.getUniformLocation(gl.program, 'u_specularCoefficient');
  if(!u_specularCoefficient) {
    console.log('Failed to get the storage location of u_specularCoefficient');
    return;
  }

  u_specularColor = gl.getUniformLocation(gl.program, 'u_specularColor');
  if(!u_specularColor) {
    console.log('Failed to get the storage location of u_specularColor');
    return;
  }

  u_ambientColor = gl.getUniformLocation(gl.program, 'u_ambientColor');
  if(!u_ambientColor) {
    console.log('Failed to get the storage location of u_ambientColor');
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

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if(!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  } 

  u_spotlightPosition = gl.getUniformLocation(gl.program, 'u_spotlightPosition');
  if(!u_spotlightPosition) {
    console.log('Failed to get the storage location of u_spotlightPosition');
    return;
  }

  u_spotlightDirection = gl.getUniformLocation(gl.program, 'u_spotlightDirection');
  if(!u_spotlightDirection) {
    console.log('Failed to get the storage location of u_spotlightDirection');
    return;
  }

  u_spotlightCutoff = gl.getUniformLocation(gl.program, 'u_spotlightCutoff');
  if(!u_spotlightCutoff) {
    console.log('Failed to get the storage location of u_spotlightCutoff');
    return;
  }

  u_spotlightExponent = gl.getUniformLocation(gl.program, 'u_spotlightExponent');
  if(!u_spotlightExponent) {
    console.log('Failed to get the storage location of u_spotlightExponent');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0) {
    console.log('Failed to create sampler0 object');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(!u_Sampler1) {
    console.log('Failed to create sampler1 object');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if(!u_Sampler2) {
    console.log('Failed to create sampler2 object');
    return false;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if(!u_Sampler3) {
    console.log('Failed to create sampler3 object');
    return false;
  }

  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if(!u_Sampler4) {
    console.log('Failed to create sampler4 object');
    return false;
  }

  u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
  if(!u_Sampler5) {
    console.log('Failed to create sampler5 object');
    return false;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if(!u_cameraPos) {
    console.log('Failed to create camera position object');
    return false;
  }

  u_textureOption = gl.getUniformLocation(gl.program, 'u_textureOption');
  if(!u_textureOption) {
    console.log('Failed to create texture option object');
    return false;
  }

  let x = new Matrix4();
  camera = new Camera();
  camera.eye = new Vector3([0, 1, -3]);
  camera.at = new Vector3([0, 0, 100]);
  camera.up = new Vector3([0, 1, 0]);

  // world = new World();
  gl.uniform1f(u_ambientLevel, g_ambientLevel);
  gl.uniform1f(u_specularCoefficient, g_specularCoefficient);
  gl.uniform3fv(u_diffuseColor, g_diffuseColor);
  gl.uniform1f(u_lightOn, g_lightOn);
  gl.uniform3fv(u_specularColor, g_specularColor);
  gl.uniform3fv(u_ambientColor, g_ambientColor);

  gl.uniform1f(u_spotlightOn, g_spotlight.active);
  gl.uniform3fv(u_spotlightPosition, g_spotlight.position);
  gl.uniform3fv(u_spotlightDirection, g_spotlight.direction);
  gl.uniform1f(u_spotlightCutoff, g_spotlight.cutoff);
  gl.uniform1f(u_spotlightExponent, g_spotlight.exponent);

  gl.uniformMatrix4fv(u_ModelMatrix, false, x.elements);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, x.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, x.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, x.elements);
  gl.uniform3fv(u_cameraPos, camera.eye.elements);
}

function initTextures() {
  let image0 = new Image();
  if(!image0) {
    console.log('Failed to create image object');
    return false;
  }

  image0.onload = function() { loadTexture0(image0); };
  image0.src = './../images/void.jpg';

  let image1 = new Image();
  if(!image1) {
    console.log('Failed to create image object');
    return false;
  }

  image1.onload = function() { loadTexture1(image1); };
  image1.src = './../images/dirt.jpg';

  let image2 = new Image();
  if(!image2) {
    console.log('Failed to create image object');
  }

  image2.onload = function() { loadTexture2(image2); };
  image2.src = './../images/grassSide.jpg';

  let image3 = new Image();
  if(!image3) {
    console.log('Failed to create image object');
  }

  image3.onload = function() { loadTexture3(image3); };
  image3.src = './../images/grasstop.jpg';

  let image4 = new Image();
  if(!image4) {
    console.log('Failed to create image object');
  }

  image4.onload = function() { loadTexture4(image4); };
  image4.src = './../images/plank.jpg';

  return true;
}

function loadTexture0(image) {
  let texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler0, 0);

  console.log("Texture0 loaded");
}

function loadTexture1(image) {
  let texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler1, 1);

  console.log("Texture1 loaded");
}

function loadTexture2(image) {
  let texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler2, 2);

  console.log("Texture2 loaded");
}

function loadTexture3(image) {
  let texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler3, 3);

  console.log("Texture3 loaded");
}

function loadTexture4(image) {
  let texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler4, 4);

  console.log("Texture4 loaded");
}

function loadTexture5(image) {
  let texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE5);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler5, 5);

  console.log("Texture5 loaded");
}

function rotateCamera(ev) {
  // camera.panLeft(ev.movementX);
  camera.panRight(ev.movementX*0.1);
  // console.log(camera.at.elements[1]);
  // console.log("-----------------------");
  // console.log(camera.eye.elements[1]);
  camera.panUp(ev.movementY*0.1);
}



function addActionListeners() {
  // let x_slider = document.getElementById('cam-angle-x');
  // let y_slider = document.getElementById('cam-angle-y');
  let x_light = document.getElementById('light-x');
  let y_light = document.getElementById('light-y');
  let z_light = document.getElementById('light-z');
    // let z_slider = document.getElementById('cam-angle-z');
  let ambient_slider = document.getElementById('ambient-level');
  let specular_slider = document.getElementById('specular-level');
  let specular_color = document.getElementById('specular-color');
  let diffuse_color = document.getElementById('diffuse-color');
  let ambient_color = document.getElementById('ambient-color');

  ambient_slider.addEventListener('mousemove', function() {g_ambientLevel = this.value; gl.uniform1f(u_ambientLevel, g_ambientLevel); renderAllShapes();});

  specular_slider.addEventListener('mousemove', function() {g_specularCoefficient = this.value; gl.uniform1f(u_specularCoefficient, g_specularCoefficient); renderAllShapes();});


  // color_picker.addEventListener('change', function() {}
  diffuse_color.addEventListener('change', function() {
    hex = this.value
    hex = hex.replace(/^#/, '');
    
    // Parse the hexadecimal string into its RGB components
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    
    g_diffuseColor = [r/255, g/255, b/255]; 
    gl.uniform3fv(u_diffuseColor, g_diffuseColor); 
    renderAllShapes();}
  );
  
  specular_color.addEventListener('change', function() {
    hex = this.value
    hex = hex.replace(/^#/, '');
    
    // Parse the hexadecimal string into its RGB components
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    
    g_specularColor = [r/255, g/255, b/255]; 
    gl.uniform3fv(u_specularColor, g_specularColor);
    renderAllShapes();}
  );
  
  ambient_color.addEventListener('change', function() {
    hex = this.value
    hex = hex.replace(/^#/, '');

    // Parse the hexadecimal string into its RGB components
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    g_ambientColor = [r/255, g/255, b/255];
    gl.uniform3fv(u_ambientColor, g_ambientColor);
    renderAllShapes();}
  );


  x_light.addEventListener('mousemove', function() {g_lightPos[0] = this.value/100; renderAllShapes();});
  y_light.addEventListener('mousemove', function() {g_lightPos[1] = this.value/100; renderAllShapes();});
  z_light.addEventListener('mousemove', function() {g_lightPos[2] = this.value/100; renderAllShapes();});

  canvas.onclick = function(ev) {
    if(!document.pointerLockElement) {
      canvas.requestPointerLock();
    }
  }
  document.addEventListener('pointerlockchange', function(ev) {
    if(document.pointerLockElement === canvas) {
      canvas.onmousemove = (ev) => rotateCamera(ev);
    } else {
      canvas.onmousemove = null;
    }
  });

  // canvas.onmousemove = function(ev) {
  //   let [x, y] = convertMouseToEventCoords(ev);
  //   if(ev.buttons == 1) {
  //     g_cameraAngleY += (x - g_deltaX) * 120;
  //     g_cameraAngleX += (y - g_deltaY) * 120;
  //     g_deltaX = x;
  //     g_deltaY = y;
  //   } else {
  //     g_deltaX = x;
  //     g_deltaY = y;
  //   }
  //   x_slider.value = g_cameraAngleX;
  //   y_slider.value = g_cameraAngleY;
  // }
}


function keydown(ev) {
  // console.log(camera.at.elements);
  if(ev.keyCode == 39 || ev.keyCode == 68) {
    camera.moveRight();
  }
  if(ev.keyCode == 37 || ev.keyCode == 65) {
    camera.moveLeft();
  }
  if(ev.keyCode == 38 || ev.keyCode == 87) {
    camera.moveForward();
  }
  if(ev.keyCode == 40 || ev.keyCode == 83) {
    camera.moveBackward();
  }
  if(ev.keyCode == 81) {
    camera.panLeft(5);
  }
  if(ev.keyCode == 69) {
    camera.panRight(5);
  }
  renderAllShapes();
  // console.log(ev.keyCode);
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

  gl.uniform1i(u_normalOn, g_normalOn);
  gl.uniform1f(u_lightOn, g_lightOn);
  gl.uniform1f(u_spotlightOn, g_spotlight.active);
  // let projMat = new Matrix4();
  // projMat.setPerspective(90, canvas.width/canvas.height, .05, 1000);
  // console.log(g_deltaX * 360);
  // camera.mousePan(g_cameraAngleX, g_cameraAngleY);
  let projMat = camera.projectionMatrix;
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
  
  // let viewMat = new Matrix4();
  // viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_lookat[0], g_lookat[1], g_lookat[2], g_up[0], g_up[1], g_up[2]); // eye at up
  let viewMat = camera.viewMatrix;
  viewMat.setLookAt(
    camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2],
    camera.at.elements[0], camera.at.elements[1], camera.at.elements[2],
    camera.up.elements[0], camera.up.elements[1], camera.up.elements[2]
);
  gl.uniform3fv(u_cameraPos, camera.eye.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  let globalRotMat = new Matrix4();
  // globalRotMat.setRotate(20, 1, 0, 0);
  // globalRotMat.setRotate(180, 0, 1, 0);
  // globalRotMat.rotate(g_cameraAngleX, 1, 0, 0);
  // globalRotMat.rotate(g_cameraAngleY, 0, 1, 0);
  // camera.viewMatrix.rotate(g_cameraAngleX, 1, 0, 0);
  // globalRotMat.rotate(g_cameraAngleZ, 0, 0, 1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // world.drawMap();
  // world.drawBlocks();
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
  var l_tailAngle = g_tailAngle;
  var speedMultiplier = 5;
  var distLowerMultiplier = 15;
  var distUpperMultiplier = 20;
  var neckMultiplier = 5;

  let l_lightPos = [g_lightPos[0], g_lightPos[1], g_lightPos[2]];
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
    l_neckAngle[0] = g_headAngle[0]*1 + neckMultiplier * Math.cos(g_seconds*5);

    l_tailAngle = g_tailAngle*1 + 10 * Math.sin(g_seconds*5);

    //animate light
    l_lightPos[0] = g_lightPos[0] + 2*Math.sin(g_seconds);
    l_lightPos[1] = g_lightPos[1] + 2*Math.cos(g_seconds);
    l_lightPos[2] = g_lightPos[2] + 2*Math.cos(g_seconds);
  }
    
  // draw main body
  {
    body.color = [0.75, 0.65, 0.4, 1.0];
    body.matrix.scale(0.5, 0.3, 0.75);
    body.matrix.translate(-0.5, -0.5, -0.5);
    body.render();
    
    tail.color = [0.65, 0.55, 0.3, 1.0];
    tail.matrix.translate(-0.05 , 0, 0.2);
    tail.matrix.rotate(l_tailAngle, 0, 1, 0);
    tail.matrix.scale(0.1, 0.1, 0.3);
    tail.render();
  }
  // front legs
  // front left leg
  {
    neck.color = [0.75, 0.65, 0.4, 1.0];
    neck.matrix.translate(0, -0.05, -0.35);
    neck.matrix.rotate(-40, 1, 0, 0);
    neck.matrix.rotate(l_neckAngle[0], 1, 0, 0);
    neck.matrix.rotate(l_neckAngle[1], 0, 1, 0);
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

  let s = new Sphere();
  s.color = [0.5, 0.5, 0.5, 1.0];
  s.textureOption = 3;
  s.matrix.translate(2, 0, 2);
  s.render();

  let sky = new Cube();
  // sky.textureOption = [SKY,SKY,SKY,SKY,SKY,0];
  sky.textureOption =  [0, 0, 0, 0, 0, 5];
  sky.color = [1, 1, 1, 1];
  sky.matrix.translate(0, -1, 0);
  sky.matrix.scale(8, 8, 8);
  sky.matrix.translate(-0.5, 0, -0.5);
  sky.renderSkybox();
  // sky.render();

  if(g_lightOn) {
    gl.uniform3f(u_lightPos, l_lightPos[0], l_lightPos[1], l_lightPos[2])

    let light = new Cube();
    light.color = [1, 1, 0, 1];
    light.matrix.translate(l_lightPos[0], l_lightPos[1], l_lightPos[2]);
    light.matrix.scale(0.1, 0.1, 0.1);
    light.render();
  }

  let random_cube2 = new Cube();
  random_cube2.color = [1, 0, 0.5, 1];
  random_cube2.textureOption = [0, 0, 0, 0,0,0];
  random_cube2.matrix.translate(-2, -1, -1);
  random_cube2.matrix.scale(0.75, 0.75, 0.75);
  random_cube2.render();
  // random_cube2.renderSkybox();

  // let body = new Cube();
  // body.color = [1.0, 0, 0, 1.0];
  // body.matrix.translate(-0.25, -0.5, 0.0);
  // body.matrix.scale(0.5, 1, 0.5);
  // body.render();

  var duration = performance.now() - start_time;


  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), 'performance-display');
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

function updateAnimation() {
  
}

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

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  document.onkeydown = keydown;
  
  renderAllShapes();
  // g_shapesList = [];
  // renderAllShapes();
  requestAnimationFrame(tick);
}

// main();
