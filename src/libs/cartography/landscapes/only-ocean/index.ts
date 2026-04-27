function main(heightMap: Float32Array[], _x: number, _y: number, tileSize: number, _seed?: number): void {
    for (let iy = 0; iy < tileSize; ++iy) {
        const row = heightMap[iy];
        for (let ix = 0; ix < tileSize; ++ix) {
            row[ix] = 0;
        }
    }
}

export default main;
