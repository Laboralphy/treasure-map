import Geometry from "../../../geometry";

function main(x, y, tileSize) {
    const bIsle = x & 1 === 1 && y & 1 === 1;
    const heightMap = [];
    const ts = tileSize;
    for (let iy = 0; iy < ts; ++iy) {
        const row = [];
        for (let ix = 0; ix < ts; ++ix) {
            row[ix] = bIsle
                ? Math.max(0, 1 - (Geometry.Helper.distance(ix, iy, ts >> 1, ts >> 1) / (ts >> 1)))
                : 0;
        }
        heightMap[iy] = row;
    }
    return heightMap;
}

export default main;