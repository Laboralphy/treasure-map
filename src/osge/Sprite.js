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
        this._defined = false;
        this._fadeDiff = 0;
        this.z = 0;
	}

    fadeIn() {
        this._fadeDiff = 0.05;
        this.alpha = 0;
    }

    fadeOut() {
        this._fadeDiff = -0.05;
        this.alpha = 1;
    }

	processFade() {
        if (this._fadeDiff > 0) {
            this.alpha += this._fadeDiff;
            if (this.alpha > 1) {
                this.alpha = 1;
                this._fadeDiff = 0;
            }
        }
        if (this._fadeDiff < 0) {
            this.alpha += this._fadeDiff;
            if (this.alpha < 0) {
                this.alpha = 0;
                this._fadeDiff = 0;
            }
        }
	}

	async define(data) {
		this.image = await Game.loadImage('images/sprites/' + data.image + '.png');
		if (('width' in data) && ('height' in data)) {
			this.frameWidth = data.width;
			this.frameHeight = data.height;
		} else {
			if (!data.frames) {
				throw new Error('either "width/height" or "frames" must be defined, in the blueprint');
			}
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
		this._defined = true;
		this.fadeIn();
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
		if (!this._defined) {
			return;
		}
		let n = this._iFrame;
		let w = this.frameWidth;
		let h = this.frameHeight;
		let p = this.position.sub(vOffset);
        this.processFade();
		let a = this.alpha;
		if (a > 0) {
			let fSaveAlpha;
			if (a !== 1) {
				fSaveAlpha = ctx.globalAlpha;
				ctx.globalAlpha = a;
			}
			if (n >= this._frames.length) {
				throw new Error('no such frame : "' + n + '". frame count is ' + this._frames.length);
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