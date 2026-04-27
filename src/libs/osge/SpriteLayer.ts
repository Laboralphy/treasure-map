import Layer from './Layer';
import Sprite from './Sprite';

class SpriteLayer extends Layer {
    sprites: Sprite[];
    private _willBeAdded: Sprite[];
    private _willBeRemoved: Sprite[];

    constructor() {
        super();
        this.sprites = [];
        this._willBeAdded = [];
        this._willBeRemoved = [];
    }

    add(sprite: Sprite): void {
        this._willBeAdded.push(sprite);
    }

    remove(sprite: Sprite): void {
        this._willBeRemoved.push(sprite);
    }

    sort(cb: (a: Sprite, b: Sprite) => number): void {
        this.sprites.sort(cb);
    }

    update(period: number): void {
        super.update();
        const v = this.sprites;
        for (let i = 0, l = v.length; i < l; ++i) {
            v[i].animate(period);
        }
        if (this._willBeAdded.length > 0) {
            this._willBeAdded.forEach(s => v.push(s));
            this._willBeAdded = [];
        }
        if (this._willBeRemoved.length > 0) {
            this._willBeRemoved.forEach(s => v.splice(v.indexOf(s), 1));
            this._willBeRemoved = [];
        }
    }

    render(canvas: HTMLCanvasElement): void {
        super.render(canvas);
        const ctx = canvas.getContext('2d')!;
        const p = this.view.position;
        const v = this.sprites;
        const vo = p.add(this.view.offset);
        for (let i = 0, l = v.length; i < l; ++i) {
            const vi = v[i];
            if (vi.visible) {
                vi.draw(ctx, p.add(vi.reference).add(vo));
            }
        }
    }
}

export default SpriteLayer;
