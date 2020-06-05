import Geometry from "../../../geometry";

/*
Cette fonction ne créé rien d'autre qu'un océan
 */


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
    for (let iy = 0; iy < tileSize; ++iy) {
        const row = heightMap[iy];
        for (let ix = 0; ix < tileSize; ++ix) {
            row[ix] = 0;
        }
    }
}

export default main;