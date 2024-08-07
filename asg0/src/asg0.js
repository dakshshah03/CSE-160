function drawVector(v, color) {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(canvas.width/2, canvas.height/2);
    ctx.lineTo(canvas.width/2 + 20*v.elements[0], canvas.height/2 - 20*v.elements[1]);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function angleBetween(v1, v2) {
    let a = 180/(Math.PI) * Math.acos(Vector3.dot(v1, v2)/(v1.magnitude() * v2.magnitude()));
    console.log("Angle: " + a);
}

function areaTriangle(v1, v2) {
    let c = Vector3.cross(v1, v2).magnitude();
    console.log("Area: " + c/2);
}

function handleDrawEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let v1_x_coord = document.getElementById('v1_x').value;
    let v1_y_coord = document.getElementById('v1_y').value;

    let v2_x_coord = document.getElementById('v2_x').value;
    let v2_y_coord = document.getElementById('v2_y').value;

    let v1 = new Vector3([v1_x_coord, v1_y_coord, 0.0]);
    let v2 = new Vector3([v2_x_coord, v2_y_coord, 0.0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let v1_x_coord = document.getElementById('v1_x').value;
    let v1_y_coord = document.getElementById('v1_y').value;

    let v2_x_coord = document.getElementById('v2_x').value;
    let v2_y_coord = document.getElementById('v2_y').value;

    let v1 = new Vector3([v1_x_coord, v1_y_coord, 0.0]);
    let v2 = new Vector3([v2_x_coord, v2_y_coord, 0.0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");

    let scalar = document.getElementById('scalar').value;
    let operation = document.getElementById('operation-select').value;
    // console.log(operation);

    let v3 = new Vector3();
    let v4 = new Vector3();

    v3.set(v1);
    v4.set(v2);

    if(operation === "add") {
        v3.add(v2);
    } else if(operation === "sub") {
        v3.sub(v2);
    } else if(operation === "mul") {
        v3.mul(scalar);
        v4.mul(scalar);
    } else if(operation === "div") {
        v3.div(scalar);
        v4.div(scalar);
    } else if(operation === "mag") {
        console.log("Magnitude v1: " + v1.magnitude());
        console.log("Magnitude v2: " + v2.magnitude());
    } else if(operation === "nor") {
       v3.normalize();
       v4.normalize();
    } else if(operation === "ang") {
        angleBetween(v1, v2);
    } else if(operation === "are") {
        areaTriangle(v1, v2);
    }
    
    drawVector(v3, "green");
    drawVector(v4, "green");
}

// DrawRectangle.js
function main() {
// Retrieve <canvas> element <- (1)
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    
    // Get the rendering context for 2DCG <- (2)
    var ctx = canvas.getContext('2d');
    // CHAPTER 2 Your First Step with WebGL
    
    // Draw a blue rectangle <- (3)
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a blue color
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color

    var v1 = new Vector3([2.25, 2.25, 0])
    drawVector(v1, "red");
}