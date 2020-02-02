import Layer from './Layer';

class SpriteLayer extends Layer {
    constructor() {
        super();
        this.sprites = [];
        this._willBeAdded = [];
        this._willBeRemoved = [];
    }

    /**
     * ajout d'un sprite à afficher dans ce layer
     * @param sprite {Sprite}
     */
    add(sprite) {
        this._willBeAdded.push(sprite);
    }

    /**
     * suppression d'un sprite du layer
     * @param sprite {Sprite}
     */
    remove(sprite) {
        this._willBeRemoved.push(sprite);
    }

    /**
     * Tri des sprite selon la fonction comparative passée en paramètre
     * @param cb {function}
     */
    sort(cb) {
        this.sprites.sort(cb);
    }

    /**
     * modification des coordonnées d'affichage des sprites
     * @param period {number}
     */
    update(period) {
        super.update();
        let v = this.sprites;
        for (let i = 0, l = v.length; i < l; ++i) {
            let vi = v[i];
            vi.animate(period);
        }
        if (this._willBeAdded.length > 0) {
            this._willBeAdded.forEach(s => v.push(s));
            this._willBeAdded = [];
        }
        if (this._willBeRemoved) {
            this._willBeRemoved.forEach(s => v.splice(v.indexOf(s), 1));
            this._willBeRemoved = [];
        }
    }

	/**
     * Dessine tous les sprite du layer
	 * @param canvas {HTMLCanvasElement}
	 */
	render(canvas) {
        super.render(canvas);
        let ctx = canvas.getContext('2d');
        let p = this.view.position;
        let v = this.sprites;
        let vo = p.add(this.view.offset);
        for (let i = 0, l = v.length; i < l; ++i) {
            let vi = v[i];
            if (vi.visible) {
                vi.draw(ctx, p.add(vi.reference).add(vo));
            }
        }
    }
}

export default SpriteLayer;