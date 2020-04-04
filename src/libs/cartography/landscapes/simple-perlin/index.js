import HeightMapPerlinizer from "../../HeightMapPerlinizer";

const hmp = new HeightMapPerlinizer(128, 0);

function computeTile(x, y) {
    return hmp.generate(x, y);
}

/**
 * fonction principale
 * @param heightMap {Float32Array[]}
 * @param x {number}
 * @param y {number}
 * @param tileSize {number}
 * @param seed {number}
 * @returns {[]}
 */
function main(heightMap, x, y, tileSize, seed) {
    const hm = computeTile(x, y);
    for (let iy = 0; iy < tileSize; ++iy) {
        const row = heightMap[iy];
        const hrow = hm[iy];
        for (let ix = 0; ix < tileSize; ++ix) {
            row[ix] = hrow[ix];
        }
    }
}

export default main;