import Webworkio from 'webworkio';
import { mod } from '../r-mod';
import { Helper, Vector } from '../geometry';
import Cache2D from '../cache2d';
import CanvasHelper from '../canvas-helper';
import TileRenderer, { type BrushDef, type TileData } from './TileRenderer';
import Events from 'events';

interface PaletteEntry {
    altitude: number;
    color: string;
}

interface WorldDef {
    worker: string;
    workerCount: number;
    seed: number;
    tileSize: number;
    palette: PaletteEntry[];
    preload: number;
    progress: ((n: number) => void) | null;
    brushes: BrushDef[];
    scale: number;
    altitudes: unknown;
    physicGridSize: number;
    names: string[];
    drawCoords: boolean;
    drawGrid: boolean;
    drawBrushes: boolean;
    drawPhysicCodes: boolean;
    drawFadeIn: boolean;
    cache?: number;
}

interface ServiceOptions {
    worker: string;
    workerCount?: number;
    brushes: BrushDef[];
    seed?: number;
    tileSize: number;
    palette: PaletteEntry[];
    preload?: number;
    progress?: ((n: number) => void) | null;
    scale?: number;
    altitudes?: unknown;
    physicGridSize: number;
    names: string[];
    drawCoords?: boolean;
    drawGrid?: boolean;
    drawBrushes?: boolean;
    drawPhysicCodes?: boolean;
    drawFadeIn?: boolean;
}

interface CachedTile {
    x: number;
    y: number;
    canvas: HTMLCanvasElement;
    painted: boolean;
    alpha: number;
    physicMap: Uint8Array[] | null;
    sceneries: TileData['sceneries'] | null;
}

interface ViewPointMetrics {
    xFrom: number;
    yFrom: number;
    xTo: number;
    yTo: number;
    xOfs: number;
    yOfs: number;
}

class Service {
    private _worldDef: WorldDef;
    private _view: Vector;
    private _cache: Cache2D<CachedTile>;
    private _tr: TileRenderer;
    private _fetching: boolean;
    private _cacheAdjusted: boolean;
    private _verbose: boolean;
    private _events: Events;
    private _lastProgress: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _wwio: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _wwioHorde: any[];
    private _viewedCanvas: HTMLCanvasElement | null;
    private _viewedPosition: Vector | null;

    constructor({
        worker,
        workerCount = 1,
        brushes,
        seed = 0,
        tileSize,
        palette,
        preload = 0,
        progress = null,
        scale = 1,
        altitudes,
        physicGridSize,
        names,
        drawCoords = true,
        drawGrid = true,
        drawBrushes = true,
        drawPhysicCodes = false,
        drawFadeIn = true
    }: ServiceOptions) {
        this._worldDef = {
            worker, workerCount, seed, tileSize, palette, preload, progress, brushes,
            scale, altitudes, physicGridSize, names, drawCoords, drawGrid, drawBrushes,
            drawPhysicCodes, drawFadeIn
        };

        if (worker === undefined) {
            throw new Error('Cartography: "worker" property must be a valid webworker url');
        }
        if (tileSize === undefined) {
            throw new Error('Cartography: "tileSize" property must be defined');
        } else if (Math.floor(Math.log2(tileSize)) !== Math.log2(tileSize)) {
            throw new Error('Cartography: "tileSize" property must be a number equal to a power of 2');
        }
        if (palette === undefined) {
            throw new Error('Cartography: "palette" property must be defined');
        }
        if (physicGridSize === undefined) {
            throw new Error('Cartography: "physicGridSize" property must be defined');
        }

        this._view = new Vector();
        this._cache = new Cache2D<CachedTile>({ size: 64 });
        this._tr = new TileRenderer({ drawGrid, drawBrushes, drawCoords, drawPhysicCodes });
        this._fetching = false;
        this._cacheAdjusted = false;
        this._verbose = false;
        this._events = new Events();
        this._lastProgress = -1;
        this._wwio = null;
        this._wwioHorde = [];
        this._viewedCanvas = null;
        this._viewedPosition = null;
    }

    get cache(): Cache2D<CachedTile> {
        return this._cache;
    }

    get verbose(): boolean {
        return this._verbose;
    }

    set verbose(value: boolean) {
        if (value !== this._verbose) {
            if (!value) { this.log('verbose mode off'); }
            this._verbose = value;
            if (value) { this.log('verbose mode on'); }
        }
    }

    get worldDef(): WorldDef {
        return this._worldDef;
    }

    get fetching(): boolean {
        return this._fetching;
    }

    get events(): Events {
        return this._events;
    }

    get scrollPosition(): Vector {
        return this._view;
    }

    get viewedPosition(): Vector | null {
        return this._viewedPosition;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createWorker(): Promise<any> {
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
            }, (response: { status: string; error?: string }) => {
                if (response.status === 'error') {
                    reject(new Error('web worker error: ' + response.error));
                } else {
                    resolve(wwio);
                }
            });
        });
    }

    async start(): Promise<void> {
        const wd = this._worldDef;
        this.log('starting service');
        await this._tr.loadBrushes(wd.brushes);
        this.log('brushes loaded');
        this._tr.getBrushesStatus().forEach(s => this.log('brush type :', s.type, s.count, 'item' + (s.count > 1 ? 's' : '')));
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

    terminate(): void {
        this._wwio.terminate();
        this.log('service terminated');
    }

    progress(n100: number): void {
        if (this._lastProgress !== n100) {
            this.log('progress', n100 + '%');
            if (typeof this._worldDef.progress === 'function') {
                this._worldDef.progress(n100);
            }
            this._lastProgress = n100;
        }
    }

    log(...args: unknown[]): void {
        if (this._verbose) {
            console.log('[c]', ...args);
        }
    }

    adjustCacheSize(w: number, h: number): void {
        const tileSize = this._worldDef.tileSize;
        const m = Service.getViewPointMetrics(this._view.x, this._view.y, w, h, tileSize, this._worldDef.preload);
        const nNewSize = (m.yTo - m.yFrom + 2) * (m.xTo - m.xFrom + 2) * 2;
        if (nNewSize !== this._cache.size) {
            this._worldDef.cache = nNewSize;
            this._cache.size = nNewSize;
            this.log('new canvas size ( width', w, ', height', h, ')', 'adjusting cache size :', nNewSize);
            this._cacheAdjusted = true;
        }
    }

    clearCache(): void {
        this._cacheAdjusted = false;
    }

    version(): Promise<string> {
        return new Promise(resolve => {
            this._wwio.emit('version', {}, ({ version }: { version: string }) => {
                resolve(version);
            });
        });
    }

    static getViewPointMetrics(x: number, y: number, width: number, height: number, tileSize: number, nBorder: number): ViewPointMetrics {
        const x0 = x - (width >> 1);
        const y0 = y - (height >> 1);
        const xFrom = Math.floor(x0 / tileSize) - nBorder;
        const yFrom = Math.floor(y0 / tileSize) - nBorder;
        const xTo = Math.floor((x0 + width - 1) / tileSize) + nBorder;
        const yTo = Math.floor((y0 + height - 1) / tileSize) + nBorder;
        const xOfs = mod(x0, tileSize);
        const yOfs = mod(y0, tileSize);
        return {
            xFrom, yFrom, xTo, yTo,
            xOfs: -xOfs - nBorder * tileSize,
            yOfs: -yOfs - nBorder * tileSize
        };
    }

    fetchTile(x: number, y: number, iWorker: number = 0): Promise<CachedTile> {
        return new Promise(resolve => {
            const oCanvas = CanvasHelper.createCanvas(this._worldDef.tileSize, this._worldDef.tileSize);
            const oTileData: CachedTile = { x, y, canvas: oCanvas, painted: false, alpha: 0, physicMap: null, sceneries: null };
            this._cache.store(x, y, oTileData);
            const ww = this._wwioHorde[iWorker];
            ww.emit('tile', { x, y }, (result: TileData) => {
                this._tr.render(result, oCanvas);
                oTileData.physicMap = result.physicMap;
                oTileData.sceneries = result.sceneries;
                oTileData.painted = true;
                this._events.emit('tilepaint', oTileData);
                resolve(oTileData);
            });
        });
    }

    getPhysicValue(x: number, y: number): number | undefined {
        const wd = this._worldDef;
        const pgs = wd.physicGridSize;
        const map = this.getPhysicTileMap(x, y);
        const cs = wd.tileSize;
        const ms = cs / pgs | 0;
        const xCell = mod(Math.floor(x / pgs), ms);
        const yCell = mod(Math.floor(y / pgs), ms);
        if (map) {
            return map[yCell][xCell];
        } else {
            return undefined;
        }
    }

    getPhysicTileMap(x: number, y: number): Uint8Array[] | undefined {
        const wd = this._worldDef;
        const cs = wd.tileSize;
        const xTile = Math.floor(x / cs);
        const yTile = Math.floor(y / cs);
        const wt = this._cache.load(xTile, yTile);
        if (wt && wt.physicMap) {
            return wt.physicMap;
        } else {
            return undefined;
        }
    }

    async preloadTiles(x: number, y: number, w: number, h: number): Promise<{ tileFetched: number; timeElapsed: number }> {
        this.log('preloading tiles', x, y, w, h);
        const tStart = performance.now();
        const tileSize = this._worldDef.tileSize;
        const m = Service.getViewPointMetrics(x, y, w, h, tileSize, this._worldDef.preload);
        const nTileCount = (m.yTo - m.yFrom + 1) * (m.xTo - m.xFrom + 1);
        let nTileFetched = 0;
        let n100 = 0;
        const xv = x / tileSize;
        const yv = y / tileSize;

        const aTilesToLoad: Array<{ xTile: number; yTile: number; d: number }> = [];
        for (let yTile = m.yFrom; yTile <= m.yTo; ++yTile) {
            for (let xTile = m.xFrom; xTile <= m.xTo; ++xTile) {
                const wt = this._cache.load(xTile, yTile);
                if (!wt) {
                    aTilesToLoad.push({ xTile, yTile, d: Helper.squareDistance(xTile, yTile, xv, yv) });
                }
            }
        }
        aTilesToLoad.sort((a, b) => a.d - b.d);

        let ftPool: Promise<CachedTile>[] = [];
        for (let iTile = 0, l = aTilesToLoad.length; iTile < l; ++iTile) {
            const { xTile, yTile } = aTilesToLoad[iTile];
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
        return { tileFetched: nTileFetched, timeElapsed: (performance.now() - tStart | 0) / 1000 };
    }

    async view(oCanvas: HTMLCanvasElement, vView: Vector, bRender: boolean = false): Promise<boolean> {
        this._viewedCanvas = oCanvas;
        this._viewedPosition = vView;
        const x = Math.round(vView.x);
        const y = Math.round(vView.y);
        if (!this._cacheAdjusted) {
            this.adjustCacheSize(oCanvas.width, oCanvas.height);
        }
        this._view.set(x - (oCanvas.width >> 1), y - (oCanvas.height >> 1));
        if (!this._fetching) {
            this._fetching = true;
            const { tileFetched, timeElapsed } = await this.preloadTiles(x, y, oCanvas.width, oCanvas.height);
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

    renderTiles(): void {
        if (!this._viewedCanvas) {
            throw new Error('view() has not been called');
        }
        const oCanvas = this._viewedCanvas;
        const x = this._viewedPosition!.x;
        const y = this._viewedPosition!.y;
        const w = oCanvas.width;
        const h = oCanvas.height;
        const tileSize = this._worldDef.tileSize;
        const m = Service.getViewPointMetrics(x, y, w, h, tileSize, 0);
        let yTilePix = 0;
        const ctx = oCanvas.getContext('2d')!;
        for (let yTile = m.yFrom; yTile <= m.yTo; ++yTile) {
            let xTilePix = 0;
            for (let xTile = m.xFrom; xTile <= m.xTo; ++xTile) {
                const wt = this._cache.load(xTile, yTile);
                const xScreen = m.xOfs + xTilePix;
                const yScreen = m.yOfs + yTilePix;
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
