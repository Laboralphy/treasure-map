import Time from './Time';
import o876 from '../o876';
import DOMEvents from './DOMEvents';
import ImageLoader from '../image-loader';
import Geometry from '../geometry'

const View = Geometry.View;
const Vector = Geometry.Vector;



class Game {

	constructor() {
		this._interval = null;
		this.renderCanvas = null;
		this.screenCanvas = null;
		this._time = new Time();
		this._time.period = 40;
		this._rendering = false;
		this.view = new View();
		this.layers = [];
		this.mouse = new Vector();
		this.domevents = new DOMEvents();
		this._perfMonitor = [];
		this._charge = 0;
	}

	start() {
		if (this._interval === null) {
            this._interval = setInterval(() => this.doomloop(), this._time.period);
		}
	}

	stop() {
        if (this._interval) {
            clearInterval(this._interval);
        }
	}

	doomloop() {
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

	forEachLayer(f) {
		this.layers.forEach(f);
	}

	onMouseMove(event) {
		this.mouse.set(event.offsetX, event.offsetY);
	}


	canvas(oCanvas) {
		if (this.screenCanvas !== oCanvas) {
			this.domevents.on(oCanvas, 'mousemove', event => this.onMouseMove(event));
			this.screenCanvas = oCanvas;
		}
        this.renderCanvas = o876.CanvasHelper.clone(oCanvas);
        let w = oCanvas.width;
        let h = oCanvas.height;
        this.view.width = w;
        this.view.height = h;
        this.view.offset = new Geometry.Vector(-(w >> 1), -(h >> 1));
	}

	init() {
		return Promise.resolve(true);
	}

	updateLayer(li) {
        li.view = this.view;
        li.update(this._time.period);
	}

	update() {
		this.forEachLayer(l => this.updateLayer(l))
	}

	render() {
		let sc = this.screenCanvas;
		if (sc) {
			let rc = this.renderCanvas;
			this.forEachLayer(l => {
				l.render(rc);
            });
            requestAnimationFrame(() => sc.getContext('2d')
				.drawImage(this.renderCanvas, 0, 0));
		} else {
			throw new Error('i need a canvas !');
		}
	}
}

export default Game;