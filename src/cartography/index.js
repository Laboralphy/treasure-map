import o876 from '../o876/index';
import WorldGenerator from './worker/WorldGenerator';
import Webworkio from 'webworkio';
import COLORS from '../consts/colors';
import WorldTile from './WorldTile';

const CanvasHelper = o876.CanvasHelper;
const Vector = o876.geometry.Vector;
const CLUSTER_SIZE = 16;
const sb = o876.SpellBook;

class Cartography {
	constructor(wgd) {
		this.oWorldDef = wgd;
		this._cache = new o876.structures.Cache2D({size: 64});
        this._wwio = new Webworkio();
        this._wwio.worker(wgd.service);
        this._wwio.emit('init', {
        	seed: wgd.seed,
			cellSize: wgd.cellSize,
			clusterSize: CLUSTER_SIZE,
			hexSize: wgd.hexSize,
			hexSpacing: wgd.hexSpacing,
            scale: wgd.scale,
			palette: COLORS
        });

        this._view = new o876.geometry.Vector();
		this._fetching = false;
		this._viewedCanvas = null; // last canvas used in view()
		this._viewedPosition = null; // last position used in view();
	}

	log(...args) {
        if (this.oWorldDef.verbose) {
            console.log('[world]', ...args);
        }
	}

	progress(n100) {
        this.log('fetching tiles', n100.toString() + '%');
		if (typeof this.oWorldDef.progress === 'function') {
            this.oWorldDef.progress(n100);
		}
	}

	adjustCacheSize(oCanvas) {
		let w = oCanvas.width;
		let h = oCanvas.height;
		let cellSize = this.cellSize();
		let m = Cartography.getViewPointMetrics(this._view.x, this._view.y, w, h, cellSize, this.oWorldDef.preload);
		let nNewSize = (m.yTo - m.yFrom + 2) * (m.xTo - m.xFrom + 2) * 2;
		if (nNewSize !== this._cache.size()) {
			this._cache.size(nNewSize);
			this._wwio.emit('options', {
				cacheSize: nNewSize
			});
			this.log('adjusting cache size :', nNewSize);
		}
	}

	getView() {
		return this._view;
	}

	getPhysicValue(x, y) {
		const map = this.getPhysicTileMap(x, y);
		const cs = this.cellSize();
		const ms = cs / WorldTile.MESH_SIZE | 0;
		const xCell = sb.mod(Math.floor(x / WorldTile.MESH_SIZE), ms);
		const yCell = sb.mod(Math.floor(y / WorldTile.MESH_SIZE), ms);
		if (!!map) {
			return !!map ? map[yCell][xCell] : undefined;
		} else {
			return undefined;
		}
	}

	getPhysicTileMap(x, y) {
		const cs = this.cellSize();
		const xTile = Math.floor(x / cs);
		const yTile = Math.floor(y / cs);
		const wt = this._cache.getPayload(xTile, yTile);
		if (!!wt && wt.isMapped()) {
			return wt.physicmap;
		} else {
			return undefined;
		}
	}


	getPhysicValueDebug(x, y) {
		const cs = this.cellSize();
		const ms = cs / WorldTile.MESH_SIZE | 0;
		const xTile = Math.floor(x / cs);
		const yTile = Math.floor(y / cs);
		const xCell = sb.mod(Math.floor(x / WorldTile.MESH_SIZE), ms);
		const yCell = sb.mod(Math.floor(y / WorldTile.MESH_SIZE), ms);
		const wt = this._cache.getPayload(xTile, yTile);
		if (!!wt && wt.isMapped()) {
			console.debug(x, y, xTile, yTile, xCell, yCell);
			console.log(
				wt.physicmap.map((row, y) => row.map((cell, x) => {
					if ((x & 1) ^ (y & 1)) {
						switch (cell.type) {
							case 11: return '~';
							case 23: return '.';
							case 33: return 'F';
							case 55: return 'M';
							default: return ' ';
						}
					} else {
						return ' ';
					}
				}).join('')).join('\n')
			);
			return wt.physicmap[yCell][xCell];
		} else {
			return undefined;
		}
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
		return new Promise((resolve, reject) => {
			let x = Math.round(vView.x);
			let y = Math.round(vView.y);
			this.adjustCacheSize(oCanvas);
			if (!this._fetching) {
				this._fetching = true;
				this.preloadTiles(x, y, oCanvas.width, oCanvas.height).then(({tileFetched, timeElapsed}) => {
					this._fetching = false;
					if (tileFetched) {
						this.log('fetched', tileFetched, 'tiles in', timeElapsed, 's.', (tileFetched * 10 / timeElapsed | 0) / 10, 'tiles/s');
					}
					if (bRender) {
						this.renderTiles();
					}
					resolve(true);
				});
			}
			this._view.set(x - (oCanvas.width >> 1), y - (oCanvas.height >> 1));
			resolve(false);
		});
	}

	cellSize() {
		return this.oWorldDef.cellSize;
	}


	async fetchTile(x, y) {
		return new Promise(resolve => {
			// verification en cache
			let oWorldTile = new WorldTile(x, y, this.cellSize(), {
				scale: this.oWorldDef.scale,
				drawGrid: this.oWorldDef.drawGrid,
				drawCoords: this.oWorldDef.drawCoords
			});
			this._cache.push(x, y, oWorldTile).forEach(wt => !!wt && (typeof wt.free === 'function') && wt.free());
			oWorldTile.lock();
			this._wwio.emit('tile', {...oWorldTile.getCoords()}, result => {
				oWorldTile.colormap = result.tile.colormap;
				oWorldTile.physicmap = result.tile.physicmap;
				oWorldTile.unlock();
				resolve(oWorldTile);
			});
		});
	}

	async preloadTiles(x, y, w, h) {
		let tStart = performance.now();
		let cellSize = this.cellSize();
		let m = Cartography.getViewPointMetrics(x, y, w, h, cellSize, this.oWorldDef.preload);
		let yTilePix = 0;
		let nTileCount = (m.yTo - m.yFrom + 1) * (m.xTo - m.xFrom + 1);
		let iTile = 0;
		let nTileFetched = 0;
		let n100;
		for (let yTile = m.yFrom; yTile <= m.yTo; ++yTile) {
			let xTilePix = 0;
			for (let xTile = m.xFrom; xTile <= m.xTo; ++xTile) {
				let wt = this._cache.getPayload(xTile, yTile);
				if (!wt) {
					// pas encore créée
                    n100 = (100 * iTile / nTileCount | 0);
					this.progress(n100);
					++nTileFetched;
					wt = await this.fetchTile(xTile, yTile);
				}
				// si la tile est partiellement visible il faut la dessiner
				xTilePix += cellSize;
				++iTile;
			}
			yTilePix += cellSize;
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

	renderTiles() {
		if (!this._viewedCanvas) {
			throw new Error('view() has not been called');
		}
		const oCanvas = this._viewedCanvas, x = this._viewedPosition.x, y = this._viewedPosition.y;
		let w = oCanvas.width;
		let h = oCanvas.height;
		let cellSize = this.cellSize();
		let m = Cartography.getViewPointMetrics(x, y, w, h, cellSize, 0);
		let yTilePix = 0;
		let ctx = oCanvas.getContext('2d');
		for (let yTile = m.yFrom; yTile <= m.yTo; ++yTile) {
			let xTilePix = 0;
			for (let xTile = m.xFrom; xTile <= m.xTo; ++xTile) {
				let wt = this._cache.getPayload(xTile, yTile);
				if (wt) {
					let xScreen = m.xOfs + xTilePix;
					let yScreen = m.yOfs + yTilePix;
					// si la tile est partiellement visible il faut la dessiner
					if (!wt.isPainted() && wt.isMapped()) {
						wt.paint();
						wt.colormap = null;
					}
					if (wt.isPainted() && wt.isMapped()) {
                        ctx.drawImage(wt.canvas, xScreen, yScreen);
					}
				}
				xTilePix += cellSize;
			}
			yTilePix += cellSize;
		}
    }

    /**
	 * A partire d'une coordonée centrée sur un rectangle de longueur et largeur spécifiées
	 * determiner les différente coordonnée de tuiles à calculer
     * @param x {number} coordonnée du centre du view point
     * @param y {number}
     * @param width {number} taille du viewpoint
     * @param height {number}
     * @param nBorder {number} taille de la bordure de securité
     * @return {{xFrom: number, yFrom: number, xTo: *, yTo: *, xOfs: number, yOfs: number}}
     */
	static getViewPointMetrics(x, y, width, height, cellSize, nBorder) {
        let x0 = x - (width >> 1);
        let y0 = y - (height >> 1);
        let xFrom = Math.floor(x0 / cellSize) - nBorder;
        let yFrom = Math.floor(y0 / cellSize) - nBorder;
        let xTo = Math.floor((x0 + width - 1) / cellSize) + (nBorder);
        let yTo = Math.floor((y0 + height - 1) / cellSize) + (nBorder);
        let xOfs = WorldGenerator._mod(x0, cellSize);
        let yOfs = WorldGenerator._mod(y0, cellSize);
		return {
			xFrom,
			yFrom,
			xTo,
			yTo,
			xOfs: -xOfs - nBorder * cellSize,
			yOfs: -yOfs - nBorder * cellSize
		};
	}
}

export default Cartography;