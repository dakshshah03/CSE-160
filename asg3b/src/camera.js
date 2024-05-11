class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 0]);
        this.at = new Vector3([0, 0, -1]);
        this.up = new Vector3([0, 1, 0]);
        this.fov = 60.0;
        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(
            this.eye[0], this.eye[1], this.eye[2],
            this.at[0], this.at[1], this.at[2],
            this.up[0], this.up[1], this.up[2]
        )
        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.05, 1000);
    }
    
}