import Cache2D from "../cache2d";
import * as Tools2D from "../tools2d";
import Random from "../random";
import Perlin from "../perlin";


/**
 * cette classe génère des height map à partir de bruit
 * les matrice de bruit sont fournie par la classe Cartography qui génère ce bruit en fonction d'une altitude global
 */
class HeightMapPerlinizer {
    constructor (size, seed = 0) {
        const CACHE_SIZE = 36;
        this._cache = {
            wn: new Cache2D({size: CACHE_SIZE}),
            pn: new Cache2D({size: CACHE_SIZE}),
        };
        this._rand = new Random();
        this._size = size;
        this.computeOptimalOctaves();
        this._seed = seed;
    }

    computeOptimalOctaves() {
        this._octaves = Perlin.computeOptimalOctaves(this._size);
    }

    get size() {
        return this._size;
    }

    set size(value) {
        if (this._size !== value) {
            this._size = value;
            this.computeOptimalOctaves();
        }
    }

    get seed() {
        return this._seed;
    }

    set seed(value) {
        this._seed = value;
    }


    /**
     * change la taille du cache
     * @param size {number}
     */
    setCacheSize(size) {
        this._cache.wn.size = size;
        this._cache.pn.size = size;
    }

    /**
     * creation du hash d'une seule valeur
     * @param a {number}
     * @returns {number}
     */
    static hash (a) {
        if (a < 0) {
            let b = 0, h = HeightMapPerlinizer.hash(-a);
            while (h) {
                b = (b << 4) | h & 15;
                h >>= 4;
            }
            return Math.abs(b);
        }
        a = (a ^ 61) ^ (a >> 16);
        a = a + (a << 3);
        a = a ^ (a >> 4);
        a = a * 0x27d4eb2d;
        a = a ^ (a >> 15);
        return a;
    }

    generateWhiteNoise() {
        const rand = this._rand;
        return Tools2D.createArray2DFloat32(this.size, this.size, (x, y) => {
            return rand.rand()
        });
    }

    /**
     * Calcule le hash d'une région
     * Permet de choisir une graine aléatoire
     * et de raccorder seamlessly les région adjacente
     */
    static getPointHash(x, y) {
        let xh = HeightMapPerlinizer.hash(x).toString().split('');
        let yh = HeightMapPerlinizer.hash(y).toString().split('');
        let s = xh.shift() + yh.shift() + '.';
        while (xh.length || yh.length) {
            if (xh.length) {
                s += xh.shift();
            }
            if (yh.length) {
                s += yh.shift();
            }
        }
        return parseFloat(s);
    }

    generate(x, y, callbacks) {
        if (x >= Number.MAX_SAFE_INTEGER || x <= -Number.MAX_SAFE_INTEGER || y >= Number.MAX_SAFE_INTEGER || y <= -Number.MAX_SAFE_INTEGER) {
            throw new Error('trying to generate x:' + x + ' - y:' + y + ' - maximum safe integer is ' + Number.MAX_SAFE_INTEGER + ' !');
        }
        const cached = this._cache.pn.load(x, y);
        if (cached) {
            return cached;
        }
        callbacks = callbacks || {};
        const perlin = 'perlin' in callbacks ? callbacks.perlin : null;
        const noise = 'noise' in callbacks ? callbacks.noise : null;
        const rand = this._rand;
        let wnCache = this._cache.wn;
        const gwn = (xg, yg) => {
            let cachedNoise = wnCache.load(xg, yg);
            if (cachedNoise) {
                return cachedNoise;
            }
            let nSeed = HeightMapPerlinizer.getPointHash(xg, yg);
            rand.seed = nSeed + this._seed;
            let aNoise = this.generateWhiteNoise();
            if (noise) {
                aNoise = noise(xg, yg, aNoise);
            }
            wnCache.store(xg, yg, aNoise);
            return aNoise;
        };

        const merge33 = a33 => {
            let h = this.size;
            let a = [];
            let i = 0;
            for (let y, ya = 0; ya < 3; ++ya) {
                let a33ya = a33[ya];
                let a33ya0 = a33ya[0];
                let a33ya1 = a33ya[1];
                let a33ya2 = a33ya[2];
                for (y = 0; y < h; ++y) {
                    a[i++] = new Float32Array([...a33ya0[y], ...a33ya1[y], ...a33ya2[y]]);
                }
            }
            return a;
        };

        const extract33 = a => {
            let s = this.size;
            return a.slice(s, s << 1).map(r => r.slice(s, s << 1));
        };

        let a0 = [
            [gwn(x - 1, y - 1), gwn(x, y - 1), gwn(x + 1, y - 1)],
            [gwn(x - 1, y), gwn(x, y), gwn(x + 1, y)],
            [gwn(x - 1, y + 1), gwn(x, y + 1), gwn(x + 1, y + 1)]
        ];

        let a1 = merge33(a0);
        let a2 = Perlin.generate(a1, this._octaves);
        let a3 = extract33(a2);
        if (perlin) {
            a3 = perlin(x, y, a3);
        }
        this._cache.pn.store(x, y, a3);
        return a3;
    }
}

export default HeightMapPerlinizer;