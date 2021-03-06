import Cartography from "./libs/cartography";
import Geometry from './libs/geometry';
import Indicators from "./Indicators";
import DATA from "./data";

class WorldMap {
    constructor() {
        this._carto = null;
        this._mapCanvas = null;
    }

    get cartography() {
        return this._carto;
    }

    installMapCanvas({width = 1024, height = 768} = {}) {
        const oCanvas = document.querySelector('canvas.world');
        const elemMapContainer = document.querySelector('div.world-container');
        oCanvas.width = width;
        oCanvas.height = height;
        elemMapContainer.appendChild(oCanvas);
        this._mapCanvas = oCanvas;
        oCanvas.addEventListener('click', event => {
            const x = event.offsetX, y = event.offsetY;
            const v = this._carto._viewedPosition.add(
                new Geometry.Vector(
                    x - (oCanvas.width >> 1),
                    y - (oCanvas.height >> 1)
                )
            );
            console.info('viewing', v.x, v.y);
            this.render(v.x, v.y);
        });
    }

    render(x, y) {
        const vView = new Geometry.Vector(x, y);
        return this._carto.view(this._mapCanvas, vView, true);
    }


    initCartography(seed, params) {
        const c = new Cartography({
            seed,
            preload: 0,
            palette: DATA.palette,
            tileSize: 16,
            worker: '../dist/worker.js',
            workerCount: Math.max(1, navigator.hardwareConcurrency - 1),
            brushes: DATA.brushes,
            names: DATA.towns_fr,
            physicGridSize: 8,
            scale: 2,
            progress: Indicators.progress,
            drawGrid: true,
            drawBrushes: false,
            drawCoords: false,
            ...params
        });
        this._carto = c;
        c.events.on('tilepaint', ({
            canvas, x, y, sceneries
        }) => {
            const ctx = canvas.getContext("2d");
            if (x === 0 && y === 0) {
                ctx.fillStyle = 'red';
                ctx.fillRect(1, 1, 4, 4);
            }
            if (x % 5 === 0) {
                ctx.strokeStyle = 'black';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, c._worldDef.tileSize);
                ctx.stroke();
            }
            if (y % 5 === 0) {
                ctx.strokeStyle = 'black';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(c._worldDef.tileSize, 0);
                ctx.stroke();
            }
        });
        return c.start();
    }
}

export default WorldMap;