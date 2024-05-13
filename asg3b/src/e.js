const { Perlin } = require('noisejs');

const perlin = new Perlin();

function generateHeightMap(width, height, scale) {
    const heights = [];
    for (let y = 0; y < height; y++) {
        heights[y] = [];
        for (let x = 0; x < width; x++) {
            heights[y][x] = perlin.noise(x / scale, y / scale, 0);
        }
    }
    return heights;
}

const width = 32;
const height = 32;
const scale = 10; // adjust scale for different noise levels

const heightMap = generateHeightMap(width, height, scale);

console.log(heightMap);
