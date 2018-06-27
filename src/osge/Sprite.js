import o876 from '../o876/index';
import Animation from './Animation';
import Game from './Game';

const Vector = o876.geometry.Vector;
const sb = o876.SpellBook;

class Sprite {
	constructor() {
		this.position = new Vector();
		this.reference = new Vector();
		this.image = null;
		this.frameWidth = 0;
		this.frameHeight = 0;
		this.animation = new Animation();
        this._iFrame = 0;
        this.alpha = 1;
        this._frames = [];
	}

	async define(data) {
		this.image = await Game.loadImage('images/sprites/' + data.tileset + '.png');
		if (('width' in data) && ('height' in data)) {
			this.frameWidth = data.width;
			this.frameHeight = data.height;
		} else {
			this.frameWidth =  this.image.naturalWidth / data.frames;
			this.frameHeight = this.image.naturalHeight;
		}
		let y = 0;
		while (y < this.image.naturalHeight) {
			let x = 0;
			while (x < this.image.naturalWidth) {
				this._frames.push({
					x: x,
					y: y
				});
				x += this.frameWidth;
			}
			y += this.frameHeight;
		}
		this.reference.x = (this.frameWidth >> 1) + data.ref.x;
		this.reference.y = (this.frameHeight >> 1) + data.ref.y;
	}

	frameCount() {
		return this._frames.length;
	}

	frame(n) {
		return sb.prop(this, '_iFrame', n);
	}

	animate(nInc) {
        this._iFrame = this.animation.animate(nInc);
	}

	draw(ctx, vOffset) {
		let n = this._iFrame;
		let w = this.frameWidth;
		let h = this.frameHeight;
		let p = this.position.sub(vOffset);
		let a = this.alpha;
		if (a) {
			let fSaveAlpha;
			if (a !== 1) {
				fSaveAlpha = ctx.globalAlpha;
			}
			let f = this._frames[n];
            ctx.drawImage(
                this.image,
                f.x,
                f.y,
                w,
                h,
                p.x,
                p.y,
                w,
                h
            );
            if (a !== 1) {
                ctx.globalAlpha = fSaveAlpha;
            }
		}
	}
}

export default Sprite;