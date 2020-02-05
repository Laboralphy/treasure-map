import Cache2D from "../cache2d";
import * as Tools2D from "../tools2d";
import Random from "../random";
import Perlin from "../perlin";
import SceneryGenerator from "./SceneryGenerator";
import Names from "../names";


/**
 * cette classe génère des height map à partir de bruit
 * les matrice de bruit sont fournie par la classe Cartography qui génère ce bruit en fonction d'une altitude global
 */
class TileGenerator {
    constructor ({
        seed = 0,
        size,
        physicGridSize,
        names,
        scale
    }) {
        Names.setList('towns', names);

        const CACHE_SIZE = 36;
        this._cache = {
            wn: new Cache2D({size: CACHE_SIZE}),
            pn: new Cache2D({size: CACHE_SIZE}),
            t: new Cache2D({size: CACHE_SIZE})
        };
        this._rand = new Random();
        this._scale = scale;
        this._size = size;
        this._scaledSize = this.doScale(size);
        this.computeOptimalOctaves();
        this._seed = seed;
        this._physicGridSize = physicGridSize;
        this._physicGridScaledSize = this.doScale(physicGridSize);
        this._sceneryGenerator = new SceneryGenerator();
    }

    doScale(n) {
        return n / this._scale | 0;
    }

    computeOptimalOctaves() {
        this._octaves = Perlin.computeOptimalOctaves(this._size);
    }

    get rand() {
        return this._rand;
    }

    set rand(value) {
        this._rand = value;
    }

    get size() {
        return this._size;
    }

    set size(value) {
        this._size = value;
        this._scaledSize = this.doScale(value);
        this.computeOptimalOctaves();
    }

    get octaves() {
        return this._octaves;
    }

    get seed() {
        return this._seed;
    }

    set seed(value) {
        this._seed = value;
    }

    get scale() {
        return this._scale;
    }

    set scale(value) {
        this._scale = value;
        this._scaledSize = this.doScale(value);
    }

    /**
     * change la taille du cache
     * @param size {number}
     */
    setCacheSize(size) {
        this._cache.wn.size = size;
        this._cache.pn.size = size;
        this._cache.t.size = size;
    }

    /**
     * creation du hash d'une seule valeur
     * @param a {number}
     * @returns {number}
     */
    static hash (a) {
        if (a < 0) {
            let b = 0, h = TileGenerator.hash(-a);
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
        return Tools2D.createArray2D(this._scaledSize, this._scaledSize, (x, y) => {
            return rand.rand()
        });
    }

    /**
     * Calcule le hash d'une région
     * Permet de choisir une graine aléatoire
     * et de raccorder seamlessly les région adjacente
     */
    static getPointHash(x, y) {
        let xh = TileGenerator.hash(x).toString().split('');
        let yh = TileGenerator.hash(y).toString().split('');
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

    /**
     * Permet d'indexer des zone physique de terrain (déduite à partir de l'altitude min et l'altitude max
     * @param data
     * @param meshSize
     * @returns {Array}
     */
    buildPhysicMap(data, meshSize) {
        let aMap = [];
        function disc(n) {
            if (n < 0.5) {
                return 1;
            }
            if (n < 0.7) {
                return 2;
            }
            if (n < 0.8) {
                return 3;
            }
            if (n < 0.9) {
                return 4;
            }
            return 5;
        }
        data.forEach((row, y) => {
            let yMesh = Math.floor(y / meshSize);
            if (!aMap[yMesh]) {
                aMap[yMesh] = [];
            }
            row.forEach((cell, x) => {
                let xMesh = Math.floor(x / meshSize);
                if (!aMap[yMesh][xMesh]) {
                    aMap[yMesh][xMesh] = {
                        min: 5,
                        max: 0,
                        type: 0
                    };
                }
                let m = aMap[yMesh][xMesh];
                m.min = Math.min(m.min, cell);
                m.max = Math.max(m.max, cell);
                m.type = disc(m.min) * 10 + disc(m.max);
            });
        });
        return aMap;
    }


    generateHeighMap(x, y, callbacks) {
        if (x >= Number.MAX_SAFE_INTEGER || x <= -Number.MAX_SAFE_INTEGER || y >= Number.MAX_SAFE_INTEGER || y <= -Number.MAX_SAFE_INTEGER) {
            throw new Error('trying to generate x:' + x + ' - y:' + y + ' - maximum safe integer is ' + Number.MAX_SAFE_INTEGER + ' !');
        }
        callbacks = callbacks || {};
        const perlin = 'perlin' in callbacks ? callbacks.perlin : null;
        const noise = 'noise' in callbacks ? callbacks.noise : null;
        const rand = this._rand;

        const cached = this._cache.pn.load(x, y);
        if (cached) {
            return cached;
        }
        let wnCache = this._cache.wn;
        const gwn = (xg, yg) => {
            let cachedNoise = wnCache.load(xg, yg);
            if (cachedNoise) {
                return cachedNoise;
            }
            let nSeed = TileGenerator.getPointHash(xg, yg);
            rand.seed = nSeed + this._seed;
            let aNoise = this.generateWhiteNoise();
            if (noise) {
                aNoise = noise(xg, yg, aNoise);
            }
            wnCache.store(xg, yg, aNoise);
            return aNoise;
        };

        const merge33 = a33 => {
            let h = this._scaledSize;
            let a = [];
            let i = 0;
            for (let y, ya = 0; ya < 3; ++ya) {
                let a33ya = a33[ya];
                let a33ya0 = a33ya[0];
                let a33ya1 = a33ya[1];
                let a33ya2 = a33ya[2];
                for (y = 0; y < h; ++y) {
                    a[i++] = a33ya0[y].concat(a33ya1[y], a33ya2[y]);
                }
            }
            return a;
        };

        const extract33 = a => {
            let s = this._scaledSize;
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

    generate(x, y, callbacks) {
        let t = this._cache.t.load(x, y);
        if (!!t) {
            return t;
        }
        const heightMap = this.generateHeighMap(x, y, callbacks);
        const physicMap = Tools2D
            .map2D(
                this.buildPhysicMap(heightMap, this._physicGridScaledSize),
                (x, y, cell) => cell.type
            );
        const sceneries = this._sceneryGenerator.generate(this._seed, x, y, physicMap);
        t = {
            heightMap,
            physicMap,
            sceneries
        };
        this._cache.t.store(x, y, t);
        return t;
    }
}

export default TileGenerator;