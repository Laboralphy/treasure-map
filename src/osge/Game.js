import Time from './Time';
import o876 from '../o876';
const View = o876.geometry.View;



class Game {

	constructor() {
		this._interval = null;
		this.renderCanvas = null;
		this.screenCanvas = null;
		this._time = new Time();
		this._time.period = 40;
		this.sprites = [];
		this.view = new View();
		this.layers = [];
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
		for (let i = 0; i < n; ++i) {
			this.update();
        }
		requestAnimationFrame(() => this.render());
	}

	forEachLayer(f) {
		this.layers.forEach(f);
	}

	canvas(oCanvas) {
		this.screenCanvas = oCanvas;
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
	async loadImage(sImage) {
		return new Promise(resolve => {
			let oImage = new Image();
			oImage.addEventListener('load', event => resolve(oImage));
			oImage.setAttribute('src', sImage);
		});
	}

	async init() {
	}

	updateLayer(li) {
        li.view = this.view;
        li.update();
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
			let p = this.view.points()[0];
            sc.getContext('2d')
				.drawImage(this.renderCanvas, 0, 0);
		} else {
			throw new Error('i need a canvas !');
		}
	}

}

export default Game;