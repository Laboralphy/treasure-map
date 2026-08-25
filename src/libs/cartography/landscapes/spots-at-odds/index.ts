import { Helper } from '../../../geometry';

function main(heightMap: Float32Array[], x: number, y: number, tileSize: number, _seed?: number): void {
    const bIsle = (x & 1) === 1 && (y & 1) === 1;
    for (let iy = 0; iy < tileSize; ++iy) {
        const row = heightMap[iy];
        for (let ix = 0; ix < tileSize; ++ix) {
            row[ix] = bIsle
                ? Math.max(0, 1 - (Helper.distance(ix, iy, tileSize >> 1, tileSize >> 1) / (tileSize >> 1)))
                : 0;
        }
    }
}

export default main;
