import Webworkio from 'webworkio';
import {mod} from '../r-mod';
import {Helper, View, Vector} from '../geometry';
import Cache2D from "../cache2d";
import CanvasHelper from "../canvas-helper";
import TileRenderer from "./TileRenderer";


class Service {

    constructor({
        worker,     // url du service
        workerCount = 1, // nombre de workers
        brushes,     // chemin des sceneries
        seed = 0, // graine aléatoire
        cellSize = 25, // taille des cellules voronoi (continents)
        tileSize, // taille des tuile de la carte
        palette,    // palette de couleurs
        cache = 64, // taille du cache de tuiles
        preload = 0, // nombre de tuile a précharger autour de la zone de vue
        progress = null, // fonction callback appelée quand les tuiles se chargent
        scale = 1,  // zoom de tuiles
        altitudes, // url du json des altitudes
        physicGridSize,
        names // nom des villes
    }) {
        this._worldDef = {
            worker,
            workerCount,
            seed,
            cellSize,
            tileSize,
            palette,
            cache,
            preload,
            progress,
            brushes,
            scale,
            altitudes,
            physicGridSize,
            names
        };

        if (worker === undefined) {
            throw new Error('Cartography: "worker" property must be a valid webworker url');
        }

        if (tileSize === undefined) {
            throw new Error('Cartography: "tileSize" property must be defined');
        } else {
            if (Math.floor(Math.log2(tileSize)) !== Math.log2(tileSize)) {
                throw new Error('Cartography: "tileSize" property must be a number equal to a power of 2');
            }
        }

        if (palette === undefined) {
            throw new Error('Cartography: "palette" property must be defined');
        }

        if (cache === undefined) {
            throw new Error('Cartography: "cache" property must be defined');
        }

        if (physicGridSize === undefined) {
            throw new Error('Cartography: "physicGridSize" property must be defined');
        }

        this._view = new Vector();
        this._cache = new Cache2D({
            size: cache
        });
        this._tr = new TileRenderer();
        this._fetching = false;
        this._cacheAdjusted = false;
    }

    get worldDef () {
        return this._worldDef;
    }

    get fetching() {
        return this._fetching;
    }

    createWorker() {
        const wg = this._worldDef;
        return new Promise((resolve, reject) => {
            const wwio = new Webworkio();
            wwio.worker(wg.worker);
            this.log('web worker instance created', wg.worker);
            wwio.emit('init', {
                seed: wg.seed,
                vorCellSize: wg.cellSize,
                vorClusterSize: 4,
                tileSize: wg.tileSize,
                palette: wg.palette,
                cache: wg.cache,
                names: wg.names,
                physicGridSize: wg.physicGridSize,
                altitudes: wg.altitudes,
                scale: wg.scale
            }, response => {
                if (response.status === 'error') {
                    reject(new Error('web worker error: ' + response.error));
                } else {
                    resolve(wwio);
                }
            });
        });
    }

    async start() {
        const wgd = this._worldDef;
        this.log('starting service');
        await this._tr.loadBrushes(wgd.brushes);
        this.log('brushes loaded');
        this._wwioHorde = new Array(wgd.workerCount);
        for (let iw = 0; iw < this._wwioHorde.length; ++iw) {
            this._wwioHorde[iw] = await this.createWorker();
        }
        this._wwio = this._wwioHorde[0];
        this.log('web worker instance created', wgd.worker);
    }

    /**
     * décharge le web worker de la mémoire
     */
    terminate() {
        this._wwio.terminate();
        this.log('service terminated');
    }

    progress(n100) {
        this.log('progress', n100 + '%');
        if (typeof this._worldDef.progress === 'function') {
            this._worldDef.progress(n100);
        }
    }

    log(...args) {
        //console.log('[c]', ...args);
    }

    /**
     * calcule le nombre de tuiles max qui seront mises en cache
     * @param w {number} largeur de la zone visible
     * @param h {number} hauteur de la zone visible
     * @returns {Promise<Boolean>}
     */
    adjustCacheSize(w, h) {
        return new Promise(resolve => {
            let tileSize = this._worldDef.tileSize;
            let m = Service.getViewPointMetrics(this._view.x, this._view.y, w, h, tileSize, this._worldDef.preload);
            let nNewSize = (m.yTo - m.yFrom + 2) * (m.xTo - m.xFrom + 2) * 2;
            if (nNewSize !== this._worldDef.cache) {
                this._worldDef.cache = nNewSize;
                this._cache.size = nNewSize;
                this._wwio.emit('options', {
                    cacheSize: nNewSize
                }, () => resolve(true));
                this.log('new canvas size ( width', w, ', height', h, ')', 'adjusting cache size :', nNewSize);
                this._cacheAdjusted = true;
            } else {
                resolve(true);
            }
        });
    }

    /**
     * effacement du cache de tuile, qui sera recréé à la prochaine image
     */
    clearCache() {
        this._cacheAdjusted = false;
    }

    /**
     * A partir d'une coordonée centrée sur un rectangle de longueur et largeur spécifiées
     * determiner les différente coordonnée de tuiles à calculer
     * @param x {number} coordonnée du centre du view point
     * @param y {number}
     * @param width {number} taille du viewpoint
     * @param height {number}
     * @param tileSize {number} taille d'une tile
     * @param nBorder {number} taille de la bordure de securité
     * @return {{xFrom: number, yFrom: number, xTo: *, yTo: *, xOfs: number, yOfs: number}}
     */
    static getViewPointMetrics(x, y, width, height, tileSize, nBorder) {
        const x0 = x - (width >> 1);
        const y0 = y - (height >> 1);
        const xFrom = Math.floor(x0 / tileSize) - nBorder;
        const yFrom = Math.floor(y0 / tileSize) - nBorder;
        const xTo = Math.floor((x0 + width - 1) / tileSize) + nBorder;
        const yTo = Math.floor((y0 + height - 1) / tileSize) + nBorder;
        const xOfs = mod(x0, tileSize);
        const yOfs = mod(y0, tileSize);
        return {
            xFrom,
            yFrom,
            xTo,
            yTo,
            xOfs: -xOfs - nBorder * tileSize,
            yOfs: -yOfs - nBorder * tileSize
        };
    }

    async fetchTile(x, y, bExtra = false) {
        return new Promise(resolve => {
            // verification en cache
            let oCanvas = CanvasHelper.createCanvas(
                this._worldDef.tileSize,
                this._worldDef.tileSize
            );
            const oTileData = {
                canvas: oCanvas,
                painted: false,
                physicMap: null
            };
            this._cache.store(x, y, oTileData);
            this._wwio.emit('tile', {x, y}, result => {
                this._tr.render(result, oCanvas);
                oTileData.physicMap = result.physicMap;
                oTileData.painted = true;
                resolve(oTileData);
            });
        });
    }

    findTile(type, oParameters) {
        return new Promise((resolve, reject) => {
            this._wwio.emit('find-tile', {type, ...oParameters}, result => {
                resolve(result);
            });
        });
    }

    getPhysicValue(x, y) {
        const wd = this._worldDef;
        const pgs = wd.physicGridSize;
        const map = this.getPhysicTileMap(x, y);
        const cs = wd.tileSize;
        const ms = cs / pgs | 0;
        const xCell = mod(Math.floor(x / pgs), ms);
        const yCell = mod(Math.floor(y / pgs), ms);
        if (!!map) {
            return !!map ? map[yCell][xCell] : undefined;
        } else {
            return undefined;
        }
    }

    getPhysicTileMap(x, y) {
        const wd = this._worldDef;
        const cs = wd.tileSize;
        const xTile = Math.floor(x / cs);
        const yTile = Math.floor(y / cs);
        const wt = this._cache.load(xTile, yTile);
        if (!!wt && wt.physicMap) {
            return wt.physicMap;
        } else {
            return undefined;
        }
    }

    async preloadTiles(x, y, w, h) {
        let tStart = performance.now();
        let tileSize = this._worldDef.tileSize;
        let m = Service.getViewPointMetrics(x, y, w, h, tileSize, this._worldDef.preload);
        let nTileCount = (m.yTo - m.yFrom + 1) * (m.xTo - m.xFrom + 1);
        let nTileFetched = 0;
        let n100;
        let xv = x / tileSize;
        let yv = y / tileSize;
        // premier balayage
        const aTilesToLoad = [];
        for (let yTile = m.yFrom; yTile <= m.yTo; ++yTile) {
            for (let xTile = m.xFrom; xTile <= m.xTo; ++xTile) {
                let wt = this._cache.load(xTile, yTile);
                if (!wt) {
                    aTilesToLoad.push({
                        xTile,
                        yTile,
                        d: Helper.squareDistance(xTile, yTile, xv, yv)
                    });
                }
            }
        }
        aTilesToLoad.sort((a, b) => a.d - b.d);

        let ftPool = [];
        for (let iTile = 0, l = aTilesToLoad.length; iTile < l; ++iTile) {
            const {xTile, yTile} = aTilesToLoad[iTile];
            n100 = (100 * iTile / nTileCount | 0);
            this.progress(n100);
            ++nTileFetched;
            if (ftPool.length < this._wwioHorde.length) {
                ftPool.push(this.fetchTile(xTile, yTile));
            }
            if (ftPool.length >= this._wwioHorde.length) {
                await Promise.all(ftPool);
                console.log('flush', this._wwioHorde.length);
                ftPool = [];
            }
        }
        if (ftPool.length > 0) {
            await Promise.all(ftPool);
        }

        /*
        for (let yTile = m.yFrom; yTile <= m.yTo; ++yTile) {
            //let xTilePix = 0;
            for (let xTile = m.xFrom; xTile <= m.xTo; ++xTile) {
                let wt = this._cache.load(xTile, yTile);
                if (!wt) {
                    // pas encore créée
                    n100 = (100 * iTile / nTileCount | 0);
                    this.progress(n100);
                    ++nTileFetched;
                    wt = await this.fetchTile(xTile, yTile);
                }
                // si la tile est partiellement visible il faut la dessiner
                //xTilePix += tileSize;
                ++iTile;
            }
            yTilePix += tileSize;
        }*/
        if (nTileFetched) {
            n100 = 100;
            this.progress(n100);
        }
        return {
            tileFetched: nTileFetched,
            timeElapsed: (performance.now() - tStart | 0) / 1000
        };
    }


    /**
     *
     * @param oCanvas
     * @param vView
     * @param bRender {boolean} if true, then the tiles are rendered after preload
     * @return {Promise<boolean>} returns true if no preload was currently running, returns false if there is a preload currently runing
     */
    view(oCanvas, vView, bRender = false) {
        this._viewedCanvas = oCanvas;
        this._viewedPosition = vView;
        let x = Math.round(vView.x);
        let y = Math.round(vView.y);
        if (!this._cacheAdjusted) {
            this.adjustCacheSize(oCanvas.width, oCanvas.height);
        }
        this._view.set(x - (oCanvas.width >> 1), y - (oCanvas.height >> 1));
        if (!this._fetching) {
            this._fetching = true;
            return this.preloadTiles(x, y, oCanvas.width, oCanvas.height).then(({tileFetched, timeElapsed}) => {
                this._fetching = false;
                if (tileFetched > 0) {
                    console.log('fetched', tileFetched, 'tiles in', timeElapsed, 's.', (tileFetched * 10 / timeElapsed | 0) / 10, 'tiles/s');
                }
                if (bRender) {
                    this.renderTiles();
                }
                return true;
            });
        } else {
            return Promise.resolve(true);
        }
    }

    renderTiles() {
        if (!this._viewedCanvas) {
            throw new Error('view() has not been called');
        }
        const oCanvas = this._viewedCanvas, x = this._viewedPosition.x, y = this._viewedPosition.y;
        let w = oCanvas.width;
        let h = oCanvas.height;
        let tileSize = this._worldDef.tileSize;
        let m = Service.getViewPointMetrics(x, y, w, h, tileSize, 0);
        let yTilePix = 0;
        let ctx = oCanvas.getContext('2d');
        for (let yTile = m.yFrom; yTile <= m.yTo; ++yTile) {
            let xTilePix = 0;
            for (let xTile = m.xFrom; xTile <= m.xTo; ++xTile) {
                let wt = this._cache.load(xTile, yTile);
                if (wt) {
                    let xScreen = m.xOfs + xTilePix;
                    let yScreen = m.yOfs + yTilePix;
                    if (wt.painted) {
                        ctx.drawImage(wt.canvas, xScreen, yScreen);
                    }
                }
                xTilePix += tileSize;
            }
            yTilePix += tileSize;
        }
    }
}

export default Service;