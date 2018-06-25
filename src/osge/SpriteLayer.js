import Layer from './Layer';
import o876 from '../o876';

class SpriteLayer extends Layer {
    constructor() {
        super();
        this.sprites = [];
    }

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