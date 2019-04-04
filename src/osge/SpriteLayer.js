import Layer from './Layer';

class SpriteLayer extends Layer {
    constructor() {
        super();
        this.sprites = [];
        this._willBeAdded = [];
    }

    add(sprite) {
        this._willBeAdded.push(sprite);
    }

    sort(cb) {
        this.sprites = this.sprites.sort(cb);
    }

    update(period) {
        super.update();
        let v = this.sprites;
        for (let i = 0, l = v.length; i < l; ++i) {
            let vi = v[i];
            vi.animate(period);
        }
        this._willBeAdded.forEach(s => v.push(s));
        this._willBeAdded.splice(1, this._willBeAdded.length);
    }

	/**
     * Dessine tous les sprite du layer
	 * @param canvas {HTMLCanvasElement}
	 */
	render(canvas) {
        super.render(canvas);
        let ctx = canvas.getContext('2d');
        let p = this.view.position();
        let v = this.sprites;
        let vo = this.view.position().add(this.view.offset());
        for (let i = 0, l = v.length; i < l; ++i) {
            let vi = v[i];
            if (vi.visible) {
                vi.draw(ctx, p.add(vi.reference).add(vo));
            }
        }
    }
}

export default SpriteLayer;