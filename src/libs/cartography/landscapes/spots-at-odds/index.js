import Geometry from "../../../geometry";

/*
Cette fonction créé des îles circulaires, de rayon tileSize / 4, dans chaque tuiles (x, y) ayant x et y impairs
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
    const bIsle = (x & 1) === 1 && (y & 1) === 1;
    for (let iy = 0; iy < tileSize; ++iy) {
        const row = heightMap[iy];
        for (let ix = 0; ix < tileSize; ++ix) {
            row[ix] = bIsle
                ? Math.max(0, 1 - (Geometry.Helper.distance(ix, iy, tileSize >> 1, tileSize >> 1) / (tileSize >> 1)))
                : 0;
        }
    }
}

export default main;