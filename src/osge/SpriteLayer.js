import Layer from './Layer';

class SpriteLayer extends Layer {
    constructor() {
        super();
        this.sprites = [];
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
            vi.draw(ctx, p.add(vi.reference).add(vo));
        }
    }
}

export default SpriteLayer;