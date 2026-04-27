import Cartography from './libs/cartography';
import Geometry from './libs/geometry';
import Indicators from './Indicators';
import DATA from './data';

class WorldMap {
    private _carto: Cartography | null;
    private _mapCanvas: HTMLCanvasElement | null;

    constructor() {
        this._carto = null;
        this._mapCanvas = null;
    }

    get cartography(): Cartography | null {
        return this._carto;
    }

    installMapCanvas({ width = 1024, height = 768 }: { width?: number; height?: number } = {}): void {
        const oCanvas = document.querySelector('canvas.world') as HTMLCanvasElement;
        const elemMapContainer = document.querySelector('div.world-container') as HTMLElement;
        oCanvas.width = width;
        oCanvas.height = height;
        elemMapContainer.appendChild(oCanvas);
        this._mapCanvas = oCanvas;
        oCanvas.addEventListener('click', event => {
            const x = (event as MouseEvent).offsetX;
            const y = (event as MouseEvent).offsetY;
            const viewed = this._carto!.viewedPosition!;
            const v = viewed.add(new Geometry.Vector(x - (oCanvas.width >> 1), y - (oCanvas.height >> 1)));
            console.info('viewing', v.x, v.y);
            this.render(v.x, v.y);
        });
    }

    render(x: number, y: number): Promise<boolean> {
        const vView = new Geometry.Vector(x, y);
        return this._carto!.view(this._mapCanvas!, vView, true);
    }

    initCartography(seed: number, params: Record<string, unknown> = {}): Promise<void> {
        const c = new Cartography({
            seed,
            preload: 0,
            palette: (DATA as unknown as Record<string, unknown>).palette as Array<{ altitude: number; color: string }>,
            tileSize: 16,
            worker: './dist/worker.js',
            workerCount: Math.max(1, navigator.hardwareConcurrency - 1),
            brushes: (DATA as unknown as Record<string, unknown>).brushes as Array<{ type: string; src: string; code: string | number }>,
            names: (DATA as unknown as Record<string, unknown>).towns_fr as string[],
            physicGridSize: 8,
            scale: 2,
            progress: Indicators.progress,
            drawGrid: true,
            drawBrushes: false,
            drawCoords: false,
            ...params
        });
        this._carto = c;
        c.events.on('tilepaint', (...args: unknown[]) => {
            const { canvas, x, y } = args[0] as { canvas: HTMLCanvasElement; x: number; y: number };
            const ctx = canvas.getContext('2d')!;
            if (x === 0 && y === 0) {
                ctx.fillStyle = 'red';
                ctx.fillRect(1, 1, 4, 4);
            }
            if (x % 5 === 0) {
                ctx.strokeStyle = 'black';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, c.worldDef.tileSize);
                ctx.stroke();
            }
            if (y % 5 === 0) {
                ctx.strokeStyle = 'black';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(c.worldDef.tileSize, 0);
                ctx.stroke();
            }
        });
        return c.start();
    }
}

export default WorldMap;
