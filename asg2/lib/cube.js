class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [0.5, 0.5, 0.5, 0.5];
        this.matrix = new Matrix4();

        this.buffer = null;
    }

    render() {
        if(this.buffer === null) {
            this.buffer = gl.createBuffer();
            if (!this.buffer) {
              console.log("Failed to create the buffer object");
              return -1;
            }
        }

        var rgba = this.color;

        // note to self: update fragment colors to simulate shadows 

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // front of the cube
        gl.uniform4f(u_FragColor, 0.9*rgba[0], 0.9*rgba[1], 0.9*rgba[2], rgba[3]);
        drawTriangle3D([-0.5, 0.5, -0.5,  0.5, 0.5, -0.5,  0.5, -0.5, -0.5], this.buffer);
        drawTriangle3D([-0.5, -0.5, -0.5,  -0.5, 0.5, -0.5,  0.5, -0.5, -0.5], this.buffer);

        // face to the right
        gl.uniform4f(u_FragColor, 0.75*rgba[0], 0.75*rgba[1], 0.75*rgba[2], rgba[3]);
        drawTriangle3D([0.5, -0.5, -0.5,  0.5, 0.5, 0.5,  0.5, -0.5, 0.5], this.buffer);
        drawTriangle3D([0.5, -0.5, -0.5,  0.5, 0.5, -0.5,  0.5, 0.5, 0.5], this.buffer);

        // face to the left
        drawTriangle3D([-0.5, -0.5, -0.5,  -0.5, 0.5, 0.5,  -0.5, -0.5, 0.5], this.buffer);
        drawTriangle3D([-0.5, -0.5, -0.5,  -0.5, 0.5, -0.5,  -0.5, 0.5, 0.5], this.buffer);

        // top face
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([-0.5, 0.5, -0.5,  0.5, 0.5, 0.5,  0.5, 0.5, -0.5], this.buffer);
        drawTriangle3D([-0.5, 0.5, -0.5,  -0.5, 0.5, 0.5,  0.5, 0.5, 0.5], this.buffer);

        // bottom face
        gl.uniform4f(u_FragColor, 0.5*rgba[0], 0.5*rgba[1], 0.5*rgba[2], rgba[3]);
        drawTriangle3D([-0.5, -0.5, -0.5,  0.5, -0.5, 0.5,  0.5, -0.5, -0.5], this.buffer);
        drawTriangle3D([-0.5, -0.5, -0.5,  -0.5, -0.5, 0.5,  0.5, -0.5, 0.5], this.buffer);
        
        gl.uniform4f(u_FragColor, 0.75*rgba[0], 0.75*rgba[1], 0.75*rgba[2], rgba[3]);
        // back of the cube
        drawTriangle3D([-0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, -0.5, 0.5], this.buffer);
        drawTriangle3D([-0.5, -0.5, 0.5,  -0.5, 0.5, 0.5,  0.5, -0.5, 0.5], this.buffer);
    }
}