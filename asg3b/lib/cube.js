class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [0.5, 0.5, 0.5, 0.5];
        this.matrix = new Matrix4();
        this.textureOption = 0;
        // this.texWeight = 1.0;
    }

    render() {
        if(this.buffer === null) {
            this.buffer = gl.createBuffer();
            if (!this.buffer) {
              console.log("Failed to create the buffer object");
              return -1;
            }
        }
        // console.log('render');

        var rgba = this.color;
        // console.log(rgba);

        // note to self: update fragment colors to simulate shadows 

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        // gl.uniform1f(u_texColorWeight, this.texWeight);

        // front of the cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        gl.uniform1i(u_textureOption, this.textureOption);

        drawTriangle3DUV([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0], [0,0,     1,1,     1,0]);
        
        drawTriangle3DUV([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0], [0,0,     0,1,     1,1]);

        // face to the right
        // gl.uniform4f(u_FragColor, 0.75*rgba[0], 0.75*rgba[1], 0.75*rgba[2], rgba[3]);
        drawTriangle3DUV([1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV([1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0], [0,0,     0,1,     1,1]);

        // // face to the left
        drawTriangle3DUV([0.0, 0.0, 0.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 1.0], [0,0,     0,1,     1,1]);

        // // top face
        // // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV([0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0,     0,1,     1,1]);

        // // bottom face
        // // gl.uniform4f(u_FragColor, 0.5*rgba[0], 0.5*rgba[1], 0.5*rgba[2], rgba[3]);
        drawTriangle3DUV([0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 0.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV([0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 1.0], [0,0,     0,1,     1,1]);
        
        // // gl.uniform4f(u_FragColor, 0.75*rgba[0], 0.75*rgba[1], 0.75*rgba[2], rgba[3]);
        // // back of the cube
        drawTriangle3DUV([0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV([0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0,     0,1,     1,1]);
    }
}