class Pyramid {
    constructor() {
        this.type = 'pyramid';
        this.color = [1.0, 1.0, 1.0, 1.0];
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
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // base
        drawTriangle3D([0, 0, 0,    0.3, 0, 1.0,    1.0, 0, 0.0], this.buffer);

        gl.uniform4f(u_FragColor, 0.5*rgba[0], 0.5*rgba[1], 0.5*rgba[2], rgba[3]);
        // left
        drawTriangle3D([0, 0, 0,    0.3, 0, 1.0,    0.3, 1.0, 1.0], this.buffer);

        // right
        drawTriangle3D([1.0, 0, 0.0,    0.3, 0, 1.0,    0.3, 1.0, 1.0], this.buffer);

        //front
        drawTriangle3D([0.0, 0, 0.0,    0.3, 1.0, 1.0,    1.0, 0.0, 0.0], this.buffer);

    }
}