import { View } from '../geometry';
import type { RGBAColor } from '../rainbow';
import Cache2D from '../cache2d';
import Random from '../random';
import { map2D } from '../tools2d';
import Rainbow from '../rainbow';
import SceneryGenerator, { type SceneryItem } from './SceneryGenerator';
import { setList } from '../names';
import computeHeightMap from './landscapes/continental-perlin';

interface PaletteEntry {
    altitude: number;
    color: string;
}

interface WorldGeneratorOptions {
    seed?: number;
    palette: PaletteEntry[];
    tileSize: number;
    physicGridSize: number;
    names: string[];
    scale?: number;
    cache?: number;
}

interface WorldGeneratorOptionsUpdate {
    cache?: number;
    palette?: PaletteEntry[];
}

export interface TileData {
    x: number;
    y: number;
    colorMap: number[][];
    physicMap: Uint8Array[];
    sceneries: SceneryItem[];
    physicGridSize: number;
}

class WorldGenerator {
    private _scale: number;
    private _view: View;
    private _masterSeed: number;
    private _rand: Random;
    private _physicGridSize: number;
    private _scaledPhysicGridSize: number;
    private _tileSize: number;
    private _scaledTileSize: number;
    private _sceneryGenerator: SceneryGenerator;
    private _heightMap: Float32Array[];
    private _cache: { tile: Cache2D<TileData> };
    private _palette: number[];

    constructor({
        seed = 0,
        palette,
        tileSize,
        physicGridSize,
        names,
        scale = 1
    }: WorldGeneratorOptions) {
        this._scale = scale;
        this._view = new View();
        this._masterSeed = seed;
        this._rand = new Random();
        this._rand.seed = seed;
        this._physicGridSize = physicGridSize;
        this._scaledPhysicGridSize = this.getScaledValue(physicGridSize);
        this._tileSize = tileSize;
        this._scaledTileSize = this.getScaledValue(tileSize);
        this._sceneryGenerator = new SceneryGenerator();
        this._heightMap = [];
        this._palette = [];

        this._cache = { tile: new Cache2D<TileData>({ size: 64 }) };

        setList('towns', names);
        this.options({ palette });
    }

    resizeHeightMap(size: number): void {
        if (this._heightMap.length !== size) {
            const heightMap: Float32Array[] = new Array(size);
            for (let y = 0; y < size; ++y) {
                heightMap[y] = new Float32Array(size);
            }
            this._heightMap = heightMap;
        }
    }

    getScaledValue(n: number): number {
        return n / this._scale | 0;
    }

    options(options: WorldGeneratorOptionsUpdate): void {
        if ('cache' in options && options.cache !== undefined) {
            this._cache.tile.size = options.cache;
        }
        if ('palette' in options && options.palette !== undefined) {
            const oPalette: Record<number, string> = {};
            options.palette.forEach(p => { oPalette[p.altitude] = p.color; });
            this._palette = Rainbow
                .gradient(oPalette as unknown as Record<string, string>)
                .map((x: string) => Rainbow.parse(x))
                .map((x: RGBAColor) => x.r | x.g << 8 | x.b << 16 | 0xFF000000);
        }
    }

    get seed(): number {
        return this._masterSeed;
    }

    get view(): View {
        return this._view;
    }

    static _resquare(w: number, h: number): { xOfs: number; yOfs: number; size: number } {
        const size = Math.max(w, h);
        const xOfs = (size - w) >> 1;
        const yOfs = (size - h) >> 1;
        return { xOfs, yOfs, size };
    }

    computePhysicMap(data: Float32Array[]): Uint8Array[] {
        const meshSize = this._scaledPhysicGridSize;
        const aMap: Array<Array<{ min: number; max: number; type?: number }>> = [];
        function disc(n: number): number {
            if (n < 0.5) { return 1; }
            if (n < 0.7) { return 2; }
            if (n < 0.8) { return 3; }
            if (n < 0.9) { return 4; }
            return 5;
        }
        data.forEach((row, y) => {
            const yMesh = Math.floor(y / meshSize);
            if (!aMap[yMesh]) { aMap[yMesh] = []; }
            (row as unknown as number[]).forEach((cell, x) => {
                const xMesh = Math.floor(x / meshSize);
                if (!aMap[yMesh][xMesh]) {
                    aMap[yMesh][xMesh] = { min: 5, max: 0 };
                }
                const m = aMap[yMesh][xMesh];
                m.min = Math.min(m.min, cell);
                m.max = Math.max(m.max, cell);
            });
        });
        return map2D(aMap, (x, y, m) => {
            const cell = m as unknown as { min: number; max: number };
            return disc(cell.min) * 10 + disc(cell.max);
        }, Uint8Array) as unknown as Uint8Array[];
    }

    computeHeightMap(x_rpt: number, y_rpt: number): Float32Array[] {
        const sts = this._scaledTileSize;
        this.resizeHeightMap(sts);
        const heightMap = this._heightMap;
        for (let y = 0; y < sts; ++y) {
            heightMap[y] = new Float32Array(sts);
        }
        computeHeightMap(heightMap, x_rpt, y_rpt, sts, this.seed);
        return heightMap;
    }

    computeColorMap(heightMap: Float32Array[]): number[][] {
        const PALETTE = this._palette;
        const PALETTE_LENGTH = PALETTE.length;
        return map2D(
            heightMap,
            (x, y, value) => value < 0 ? -1 : PALETTE[Math.min(PALETTE_LENGTH - 1, value * PALETTE_LENGTH | 0)]
        ) as unknown as number[][];
    }

    computeTile(x_rpt: number, y_rpt: number): TileData {
        let oTile = this._cache.tile.load(x_rpt, y_rpt);
        if (oTile) {
            return oTile;
        }
        const heightMap = this.computeHeightMap(x_rpt, y_rpt);
        const physicMap = this.computePhysicMap(heightMap);
        const colorMap = this.computeColorMap(heightMap);
        const sceneries = this._sceneryGenerator.generate(this.seed, x_rpt, y_rpt, physicMap);
        oTile = {
            x: x_rpt,
            y: y_rpt,
            colorMap,
            physicMap,
            sceneries,
            physicGridSize: this._physicGridSize
        };
        this._cache.tile.store(x_rpt, y_rpt, oTile);
        return oTile;
    }
}

export default WorldGenerator;
