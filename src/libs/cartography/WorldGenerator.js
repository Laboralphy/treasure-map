import Geometry from '../geometry';
import Cache2D from "../cache2d";
import Random from "../random";
import * as Tools2D from '../tools2d';
import Rainbow from "../rainbow";
import SceneryGenerator from "./SceneryGenerator";
import Names from "../names";

import computeHeightMap from './landscapes/continental-perlin';

const {Vector, View, Point} = Geometry;

class WorldGenerator {
    constructor({
        seed = 0,
        palette,
        tileSize,
        physicGridSize,
        names,
        scale = 1
    }) {
        if (
            palette === undefined ||
            tileSize === undefined ||
            physicGridSize === undefined ||
            names === undefined
        ) {
            throw new Error('WorldGenerator error: Undefined required property (palette, tileSize, physicGridSize, names)');
        }
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

        this._cache = {
            tile: new Cache2D({
                size: 64
            })
        };

        Names.setList('towns', names);

        this._palette = [];
        this.options({
            palette
        });
    }

    resizeHeightMap(size) {
        if (this._heightMap.length !== size) {
            const heightMap = new Array(size);
            for (let y = 0; y < size; ++y) {
                heightMap[y] = new Float32Array(size);
            }
            this._heightMap = heightMap;
        }
    }

    getScaledValue(n) {
        return n / this._scale | 0;
    }

    /**
     * permet de changer quelques options
     * - taille des caches
     * - palette de couleur
     * @param options
     */
    options(options) {
        // cache de tiles
        if ('cache' in options) {
            this._cache.tile.size = options.cache;
        }
        if ('palette' in options) {
            const oPalette = {};
            options.palette.forEach(p => oPalette[p.altitude] = p.color);
            this._palette = Rainbow
                .gradient(oPalette)
                .map(x => Rainbow.parse(x))
                .map(x => x.r | x.g << 8 | x.b << 16 | 0xFF000000);
        }
    }

    /**
     * obtenir le seed défini en constructor
     * @returns {number}
     */
    get seed() {
        return this._masterSeed;
    }

    /**
     * getter de la fenetre de vue
     * @returns {View}
     */
    get view() {
        return this._view;
    }

    /**
     * Transforme un rectangle de dimension quelconque en carré (prend la plus grande dimension comme nouvelle dimension du carré)
     * @param w {number} largeur
     * @param h {number} hauteur
     * @private
     * @return {{xOfs, yOfs, size}} nouvelle taille (size) ainsi que les offset du rectangle dans le nouveau carré
     */
    static _resquare(w, h) {
        const size = Math.max(w, h);
        const xOfs = (size - w) >> 1;
        const yOfs = (size - h) >> 1;
        return {xOfs, yOfs, size};
    }

    /**
     * Permet d'indexer des zone physique de terrain (déduite à partir de l'altitude min et l'altitude max
     * @param data
     * @returns {Array}
     */
    computePhysicMap(data) {
        const meshSize = this._scaledPhysicGridSize;
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
                    };
                }
                let m = aMap[yMesh][xMesh];
                m.min = Math.min(m.min, cell);
                m.max = Math.max(m.max, cell);
            });
        });
        return Tools2D.map2DUint8(aMap, (x, y, m) => m.type = disc(m.min) * 10 + disc(m.max));
    }

    computeHeightMap(x_rpt, y_rpt) {
        const sts = this._scaledTileSize;
        this.resizeHeightMap(sts);
        /**
         * carte de hauteur de la tuille x_rpt, yrpt,
         * chaque entrée est une valeur entre 0 (fond de l'océan) et 1 (top montagne)
         * @type {Float32Array[]}
         */
        const heightMap = this._heightMap;
        for (let y = 0; y < sts; ++y) {
            heightMap[y] = new Float32Array(sts);
        }
        computeHeightMap(heightMap, x_rpt, y_rpt, sts, this.seed);
        return heightMap;
    }

    computeColorMap(heightMap) {
        const PALETTE = this._palette;
        const PALETTE_LENGTH = PALETTE.length;
        return Tools2D.map2D(
            heightMap,
            (x, y, value) =>
                value < 0
                    ? -1
                    : PALETTE[Math.min(PALETTE_LENGTH - 1, value * PALETTE_LENGTH | 0)]
        )
    }

    /**
     * Calcule les donnée nécessaire à l'exploitation d'une tile
     * - colorMap : à transformer en canvas
     * - physicMap : détermine les altitudes
     * - sceneries : présence et position de villes
     * - x, y : position de la tile
     * - physicGridSize : taille pde la grille physique
     * @param x_rpt {number} coordonnée Tile
     * @param y_rpt {number} coordonnée Tile
     * @returns {null|{sceneries, x: *, physicGridSize: *, y: *, colorMap: *, physicMap}}
     */
    computeTile(x_rpt, y_rpt) {
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
