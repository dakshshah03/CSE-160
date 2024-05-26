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

        gl.uniform4f(u_FragColor, 0.5*rgba[0], 0.5*rgba[1], 0.5*rgba[2], rgba[3]);
        // base
        drawTriangle3D([0, 0, 0,    0.3, 0, 1.0,    1.0, 0, 0.0]);

        // left
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([0, 0, 0,    0.3, 0, 1.0,    0.3, 1.0, 1.0]);

        // right
        
        gl.uniform4f(u_FragColor, 0.7*rgba[0], 0.7*rgba[1], 0.7*rgba[2], 0.7*rgba[3]);
        drawTriangle3D([1.0, 0, 0.0,    0.3, 0, 1.0,    0.3, 1.0, 1.0]);

        //front
        gl.uniform4f(u_FragColor, 0.5*rgba[0], 0.5*rgba[1], 0.5*rgba[2], rgba[3]);
        drawTriangle3D([0.0, 0, 0.0,    0.3, 1.0, 1.0,    1.0, 0.0, 0.0]);

    }
}