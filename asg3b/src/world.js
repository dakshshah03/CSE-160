class World {
    constructor() {
        this.blocks = [
            [1, 1, 0, 1],
            [0, 0, 1, 1],
            [0, 0, 0, 1],
            [1, 1, 1, 1],
        ]
    }

    drawMap() {
        let cube = new Cube();
        cube.textureOption = 3;
        cube.color = [1, 0, 0, 1];
        for(let x = 0; x < 4; x++) {
            for(let z = 0; z < 4; z++) {
                if(this.blocks[x][z] == 1) {
                    cube.matrix.setTranslate(x * 0.25, -1.1, z * 0.25);
                    cube.matrix.scale(0.25, 0.25, 0.25);
                    cube.render();
                }
            }
        }
    }
}