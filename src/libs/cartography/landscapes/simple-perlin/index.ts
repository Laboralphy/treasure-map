import HeightMapPerlinizer from '../../HeightMapPerlinizer';

const hmp = new HeightMapPerlinizer(128, 0);

function computeTile(x: number, y: number): Float32Array[] {
    return hmp.generate(x, y) as Float32Array[];
}

function main(heightMap: Float32Array[], x: number, y: number, tileSize: number, _seed?: number): void {
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
