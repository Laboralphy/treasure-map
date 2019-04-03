import Time from './Time';
import o876 from '../o876';
import DOMEvents from './DOMEvents';
const View = o876.geometry.View;
const Vector = o876.geometry.Vector;


const IMAGE_CACHE = {};

class Game {

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
		let n = this._time.process(performance.now());
		if (n > 10) {
			n = 10;
		}
		for (let i = 0; i < n; ++i) {
			this.update();
        }
		requestAnimationFrame(() => this.render());
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
        this.view.width(w);
        this.view.height(h);
        this.view.offset(new o876.geometry.Vector(-(w >> 1), -(h >> 1)));
	}

	/**
	 * chargement asynchrone d'une image
	 * @param sImage {string} url de l'image
	 * @returns {Promise<Image>}
	 */
	static async loadImage(sImage) {
		return new Promise(resolve => {
		    if (sImage in IMAGE_CACHE) {
		        resolve(IMAGE_CACHE[sImage]);
		        return;
            }
			let oImage = new Image();
            IMAGE_CACHE[sImage] = oImage;
			oImage.addEventListener('load', event => resolve(oImage));
			oImage.setAttribute('src', sImage);
		});
	}

	static async loadImages(aList) {
		return Promise.all(aList.map(src => Game.loadImage(src)));
	}

	/**
	 * Renvoi, de manière synchrone, une image qui a déja été chargé
	 * provoque une erreur si l'image n'existe pas
	 * @param src
	 */
	getImage(src) {
		if (src in IMAGE_CACHE) {
			return IMAGE_CACHE[src];
		} else {
			throw new Error('this image has not been loaded : "' + src + '"');
		}
	}

	async init() {
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
            sc.getContext('2d')
				.drawImage(this.renderCanvas, 0, 0);
		} else {
			throw new Error('i need a canvas !');
		}
	}
}

export default Game;