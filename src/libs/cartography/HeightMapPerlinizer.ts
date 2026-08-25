import Cache2D from '../cache2d';
import { createArray2D } from '../tools2d';
import Random from '../random';
import Perlin from '../perlin';
import hash from '../shashi';

interface GenerateOptions {
    disabled?: boolean;
    perlin?: ((x: number, y: number, a: Float32Array[]) => Float32Array[]) | null;
    noise?: ((x: number, y: number, a: Float32Array[]) => Float32Array[]) | null;
}

class HeightMapPerlinizer {
    private _cache: { wn: Cache2D<Float32Array[]>; pn: Cache2D<Float32Array[]> };
    private _rand: Random;
    private _size: number;
    private _octaves: number;
    private _seed: number;

    constructor(size: number, seed: number = 0) {
        const CACHE_SIZE = 36;
        this._cache = {
            wn: new Cache2D<Float32Array[]>({ size: CACHE_SIZE }),
            pn: new Cache2D<Float32Array[]>({ size: CACHE_SIZE }),
        };
        this._rand = new Random();
        this._size = size;
        this._seed = seed;
        this._octaves = 0;
        this.computeOptimalOctaves();
    }

    computeOptimalOctaves(): void {
        this._octaves = Perlin.computeOptimalOctaves(this._size);
    }

    get size(): number {
        return this._size;
    }

    set size(value: number) {
        if (this._size !== value) {
            this._size = value;
            this.computeOptimalOctaves();
        }
    }

    get seed(): number {
        return this._seed;
    }

    set seed(value: number) {
        this._seed = value;
    }

    setCacheSize(size: number): void {
        this._cache.wn.size = size;
        this._cache.pn.size = size;
    }

    generateWhiteNoise(): Float32Array[] {
        const rand = this._rand;
        return createArray2D(this.size, this.size, () => rand.rand(), Float32Array) as Float32Array[];
    }

    static getPointHash(x: number, y: number): number {
        const xh = hash(x).toString().split('');
        const yh = hash(y).toString().split('');
        let s = xh.shift()! + yh.shift()! + '.';
        while (xh.length || yh.length) {
            if (xh.length) { s += xh.shift(); }
            if (yh.length) { s += yh.shift(); }
        }
        return parseFloat(s);
    }

    generate(x: number, y: number, options: GenerateOptions = {}): Float32Array[] {
        if (x >= Number.MAX_SAFE_INTEGER || x <= -Number.MAX_SAFE_INTEGER || y >= Number.MAX_SAFE_INTEGER || y <= -Number.MAX_SAFE_INTEGER) {
            throw new Error('trying to generate x:' + x + ' - y:' + y + ' - maximum safe integer is ' + Number.MAX_SAFE_INTEGER + ' !');
        }
        const cached = this._cache.pn.load(x, y);
        if (cached) {
            return cached;
        }
        const perlin = 'perlin' in options ? options.perlin : null;
        const noise = 'noise' in options ? options.noise : null;
        const rand = this._rand;
        const wnCache = this._cache.wn;

        const gwn = (xg: number, yg: number): Float32Array[] => {
            const cachedNoise = wnCache.load(xg, yg);
            if (cachedNoise) {
                return cachedNoise;
            }
            const nSeed = HeightMapPerlinizer.getPointHash(xg, yg);
            rand.seed = nSeed + this._seed;
            let aNoise = this.generateWhiteNoise();
            if (noise) {
                aNoise = noise(xg, yg, aNoise);
            }
            wnCache.store(xg, yg, aNoise);
            return aNoise;
        };

        const merge33 = (a33: Float32Array[][][]): Float32Array[] => {
            const h = this.size;
            const a: Float32Array[] = [];
            let i = 0;
            for (let ya = 0; ya < 3; ++ya) {
                const a33ya = a33[ya];
                const a33ya0 = a33ya[0];
                const a33ya1 = a33ya[1];
                const a33ya2 = a33ya[2];
                for (let y2 = 0; y2 < h; ++y2) {
                    a[i++] = new Float32Array([...a33ya0[y2], ...a33ya1[y2], ...a33ya2[y2]]);
                }
            }
            return a;
        };

        const extract33 = (a: Float32Array[]): Float32Array[] => {
            const s = this.size;
            return a.slice(s, s << 1).map(r => r.slice(s, s << 1)) as Float32Array[];
        };

        const a0: Float32Array[][][] = [
            [gwn(x - 1, y - 1), gwn(x, y - 1), gwn(x + 1, y - 1)],
            [gwn(x - 1, y),     gwn(x, y),      gwn(x + 1, y)    ],
            [gwn(x - 1, y + 1), gwn(x, y + 1),  gwn(x + 1, y + 1)]
        ];

        const a1 = merge33(a0);
        const a2 = !options.disabled
            ? Perlin.generate(a1, this._octaves)
            : a1;
        let a3 = extract33(a2);
        if (perlin) {
            a3 = perlin(x, y, a3);
        }
        this._cache.pn.store(x, y, a3);
        return a3;
    }
}

export default HeightMapPerlinizer;
