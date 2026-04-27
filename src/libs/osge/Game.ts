import Time from './Time';
import { Vector, View } from '../geometry';
import DOMEvents from './DOMEvents';
import CanvasHelper from '../canvas-helper';
import Layer from './Layer';

class Game {
    private _interval: ReturnType<typeof setInterval> | null;
    renderCanvas: HTMLCanvasElement | null;
    screenCanvas: HTMLCanvasElement | null;
    private _time: Time;
    view: View;
    layers: Layer[];
    mouse: Vector;
    domevents: DOMEvents;

    constructor() {
        this._interval = null;
        this.renderCanvas = null;
        this.screenCanvas = null;
        this._time = new Time();
        this._time.period = 40;
        this.view = new View();
        this.layers = [];
        this.mouse = new Vector();
        this.domevents = new DOMEvents();
    }

    set period(value: number) {
        this._time.period = value;
        if (this._interval !== null) {
            this.restart();
        }
    }

    get period(): number {
        return this._time.period;
    }

    start(): void {
        if (this._interval === null) {
            this._interval = setInterval(() => this._doomloop(), this._time.period);
        }
    }

    stop(): void {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
    }

    restart(): void {
        this.stop();
        this.start();
    }

    private _doomloop(): void {
        const pn = performance.now();
        let n = this._time.process(pn);
        if (n > 10) {
            n = 10;
        }
        for (let i = 0; i < n; ++i) {
            this.update();
        }
        this.render();
    }

    forEachLayer(f: (layer: Layer) => void): void {
        this.layers.forEach(f);
    }

    onMouseMove(event: MouseEvent): void {
        this.mouse.set(event.offsetX, event.offsetY);
    }

    canvas(oCanvas: HTMLCanvasElement): void {
        if (this.screenCanvas !== oCanvas) {
            this.domevents.on(oCanvas, 'mousemove', event => this.onMouseMove(event as MouseEvent));
            this.screenCanvas = oCanvas;
        }
        this.renderCanvas = CanvasHelper.createCanvas(oCanvas.width, oCanvas.height);
        const w = oCanvas.width;
        const h = oCanvas.height;
        this.view.width = w;
        this.view.height = h;
        this.view.offset = new Vector(-(w >> 1), -(h >> 1));
    }

    init(): Promise<boolean> {
        return Promise.resolve(true);
    }

    updateLayer(li: Layer): void {
        li.view = this.view;
        li.update(this._time.period);
    }

    update(): void {
        this.forEachLayer(l => this.updateLayer(l));
    }

    render(): void {
        const sc = this.screenCanvas;
        if (sc) {
            const rc = this.renderCanvas!;
            this.forEachLayer(l => {
                l.render(rc);
            });
            requestAnimationFrame(() => sc.getContext('2d')!.drawImage(rc, 0, 0));
        } else {
            throw new Error('i need a canvas !');
        }
    }
}

export default Game;
