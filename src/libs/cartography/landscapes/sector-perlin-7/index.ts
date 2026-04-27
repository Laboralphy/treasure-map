import HeightMapPerlinizer from '../../HeightMapPerlinizer';
import * as Tools2D from '../../../tools2d';
import * as LinearInterpolator from '../../../linear-interpolator';
import { mod } from '../../../r-mod';
import type { Segment } from '../../../linear-interpolator';

let hmp: HeightMapPerlinizer | undefined;

function segmentOnePeak(cellSize: number, tileSize: number): Segment[] {
    return [
        { x: 0, y: 0 },
        { x: tileSize * 0.25, y: 0.2 },
        { x: tileSize * 0.75, y: 0.4 },
        { x: tileSize * cellSize * 0.5, y: 1 },
        { x: tileSize * cellSize - tileSize * 0.75, y: 0.4 },
        { x: tileSize * cellSize - tileSize * 0.25, y: 0.2 },
        { x: tileSize * cellSize, y: 0 },
    ];
}

function computeSegments(cellSize: number, tileSize: number): { x: Segment[]; y: Segment[] } {
    return {
        x: segmentOnePeak(cellSize, tileSize),
        y: segmentOnePeak(cellSize, tileSize),
    };
}

function computeTile(xTile: number, yTile: number, tileSize: number): Float32Array[] {
    const CELL_SIZE = 16;
    const aSegments = computeSegments(CELL_SIZE, tileSize);
    const noise = (xg: number, yg: number, aNoise: Float32Array[]) => {
        const xt = mod(xg, CELL_SIZE) * tileSize;
        const yt = mod(yg, CELL_SIZE) * tileSize;
        return Tools2D.map2D(aNoise, (x: number, y: number, cell: number) => {
            const xtt = xt + x;
            const ytt = yt + y;
            const h1 = LinearInterpolator.interpolate(xtt, aSegments.x);
            const h2 = LinearInterpolator.interpolate(ytt, aSegments.y);
            const result = (h1 as number) * (h2 as number) * (1 + cell * 0);
            return Math.min(1, Math.max(0, result));
        }, Float32Array);
    };
    hmp!.size = tileSize;
    return hmp!.generate(xTile, yTile, { noise }) as Float32Array[];
}

function main(heightMap: Float32Array[], x: number, y: number, tileSize: number, _seed?: number): void {
    if (!hmp) {
        hmp = new HeightMapPerlinizer(tileSize, 0);
    }
    const hm = computeTile(x, y, tileSize);
    for (let iy = 0; iy < tileSize; ++iy) {
        const row = heightMap[iy];
        const hrow = hm[iy];
        for (let ix = 0; ix < tileSize; ++ix) {
            row[ix] = hrow[ix];
        }
    }
}

export default main;
