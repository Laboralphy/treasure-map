import Webworkio from 'webworkio';
import {mod} from '../r-mod';
import {Helper, View, Vector} from '../geometry';
import Cache2D from "../cache2d";
import CanvasHelper from "../canvas-helper";
import TileRenderer from "./TileRenderer";
import Events from 'events';

class Service {
    constructor({
        worker,     // url du service
        workerCount = 1, // nombre de workers
        brushes,     // chemin des sceneries
        seed = 0, // graine aléatoire
        tileSize, // taille des tuile de la carte
        palette,    // palette de couleurs
        preload = 0, // nombre de tuile a précharger autour de la zone de vue
        progress = null, // fonction callback appelée quand les tuiles se chargent
        scale = 1,  // zoom de tuiles
        altitudes, // url du json des altitudes
        physicGridSize,
        names, // nom des villes
        drawCoords = true, // ajouter des coordonnée
        drawGrid = true, // ajouter des lignes sur le rendu
        drawBrushes = true, // dessiner les brush sur la carte
        drawPhysicCodes = false, // dessiner les codes physiques (debug)
        drawFadeIn = true
    }) {
        this._worldDef = {
            worker,
            workerCount,
            seed,
            tileSize,
            palette,
            preload,
            progress,
            brushes,
            scale,
            altitudes,
            physicGridSize,
            names,
            drawCoords,
            drawGrid,
            drawBrushes,
            drawPhysicCodes,
            drawFadeIn
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

        if (physicGridSize === undefined) {
            throw new Error('Cartography: "physicGridSize" property must be defined');
        }

        this._view = new Vector();
        this._cache = new Cache2D({
            size: 64
        });

        this._tr = new TileRenderer({
            drawGrid,
            drawBrushes,
            drawCoords,
            drawPhysicCodes
        });
        this._fetching = false;
        this._cacheAdjusted = false;
        this._verbose = false;
        this._events = new Events();

        this._lastProgress = -1;
    }

    get cache() {
        return this._cache;
    }

    get verbose() {
        return this._verbose;
    }

    set verbose(value) {
        if (value !== this._verbose) {
            if (!value) {
                this.log('verbose mode off');
            }
            this._verbose = value;
            if (value) {
                this.log('verbose mode on');
            }
        }
    }

    get worldDef () {
        return this._worldDef;
    }

    get fetching() {
        return this._fetching;
    }

    get events() {
        return this._events;
    }

    createWorker() {
        const wg = this._worldDef;
        return new Promise((resolve, reject) => {
            const wwio = new Webworkio();
            wwio.worker(wg.worker);
            this.log('web worker instance created', wg.worker);
            wwio.emit('init', {
                seed: wg.seed,
                tileSize: wg.tileSize,
                palette: wg.palette,
                cache: this._cache.size,
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
        const wd = this._worldDef;
        this.log('starting service');
        await this._tr.loadBrushes(wd.brushes);
        this.log('brushes loaded');
        this._tr.getBrushesStatus().forEach(s => this.log('brush type :', s.type, s.count, 'item' + (s.count > 1 ? 's' :'')));
        const wwc = wd.workerCount;
        this._wwioHorde = new Array(wwc);
        this.log('creation of', wwc, 'worker' + (wwc > 1 ? 's' : ''));
        for (let iw = 0; iw < wwc; ++iw) {
            this._wwioHorde[iw] = await this.createWorker();
        }
        this._wwio = this._wwioHorde[0];
        const sVersion = await this.version();
        console.info('cartography service version', sVersion);
    }

    /**
     * décharge le web worker de la mémoire
     */
    terminate() {
        this._wwio.terminate();
        this.log('service terminated');
    }

    progress(n100) {
        if (this._lastProgress !== n100) {
            this.log('progress', n100 + '%');
            if (typeof this._worldDef.progress === 'function') {
                this._worldDef.progress(n100);
            }
            this._lastProgress = n100;
        }
    }

    log(...args) {
        if (this._verbose) {
            console.log('[c]', ...args);
        }
    }

    /**
     * calcule le nombre de tuiles max qui seront mises en cache
     * @param w {number} largeur de la zone visible
     * @param h {number} hauteur de la zone visible
     * @returns {Promise<Boolean>}
     */
    adjustCacheSize(w, h) {
        let tileSize = this._worldDef.tileSize;
        let m = Service.getViewPointMetrics(this._view.x, this._view.y, w, h, tileSize, this._worldDef.preload);
        let nNewSize = (m.yTo - m.yFrom + 2) * (m.xTo - m.xFrom + 2) * 2;
        if (nNewSize !== this._cache.size) {
            this._worldDef.cache = nNewSize;
            this._cache.size = nNewSize;
            this.log('new canvas size ( width', w, ', height', h, ')', 'adjusting cache size :', nNewSize);
            this._cacheAdjusted = true;
        }
    }

    /**
     * effacement du cache de tuile, qui sera recréé à la prochaine image
     */
    clearCache() {
        this._cacheAdjusted = false;
    }

    version() {
        return new Promise((resolve, reject) => {
            this._wwio.emit('version', {}, ({version}) => {
                resolve(version);
            });
        });
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

    async fetchTile(x, y, iWorker = 0) {
        return new Promise(resolve => {
            let oCanvas = CanvasHelper.createCanvas(
                this._worldDef.tileSize,
                this._worldDef.tileSize
            );
            const oTileData = {
                x, y,
                canvas: oCanvas,
                painted: false,
                alpha: 0,
                physicMap: null,
                sceneries: null
            };
            // verification en cache
            this._cache.store(x, y, oTileData);
            const ww = this._wwioHorde[iWorker];
            ww.emit('tile', {x, y}, result => {
                this._tr.render(result, oCanvas);
                oTileData.physicMap = result.physicMap;
                oTileData.sceneries = result.sceneries;
                oTileData.painted = true;
                this._events.emit('tilepaint', oTileData);
                resolve(oTileData);
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
        this.log('preloading tiles', x, y, w, h);
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
                const iww = ftPool.length;
                ftPool.push(this.fetchTile(xTile, yTile, iww));
            }
            if (ftPool.length >= this._wwioHorde.length) {
                await Promise.all(ftPool);
                ftPool = [];
            }
        }
        if (ftPool.length > 0) {
            await Promise.all(ftPool);
        }

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
    async view(oCanvas, vView, bRender = false) {
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
            const {tileFetched, timeElapsed} = await this.preloadTiles(x, y, oCanvas.width, oCanvas.height);
            this._fetching = false;
            if (tileFetched > 0) {
                this.log('fetched', tileFetched, 'tiles in', timeElapsed, 's.', (tileFetched * 10 / timeElapsed | 0) / 10, 'tiles/s');
            }
            if (bRender) {
                this.renderTiles();
            }
        }
        return true;
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
                let xScreen = m.xOfs + xTilePix;
                let yScreen = m.yOfs + yTilePix;
                if (wt && wt.painted) {
                    const bSemiTrans = this.worldDef.drawFadeIn && wt.alpha < 1;
                    if (bSemiTrans) {
                        ctx.clearRect(xScreen, yScreen, this.worldDef.tileSize, this.worldDef.tileSize);
                        ctx.save();
                        ctx.globalAlpha = wt.alpha;
                        wt.alpha += 0.05;
                    }
                    ctx.drawImage(wt.canvas, xScreen, yScreen);
                    if (bSemiTrans) {
                        ctx.restore();
                    }
                } else {
                    ctx.clearRect(xScreen, yScreen, this.worldDef.tileSize, this.worldDef.tileSize);
                }
                xTilePix += tileSize;
            }
            yTilePix += tileSize;
        }
    }

}

export default Service;