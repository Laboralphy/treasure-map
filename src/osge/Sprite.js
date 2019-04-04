import o876 from '../o876/index';
import Animation from './Animation';
import ImageLoader from '../image-loader';

const Vector = o876.geometry.Vector;
const sb = o876.SpellBook;

class Sprite {
	constructor() {
		this.position = new Vector();
		this.reference = new Vector();
		this.image = null;
		this.frameWidth = 0;
		this.frameHeight = 0;
		this.animation = null;
		this.animations = [];
        this._iFrame = 0;
        this.alpha = 1;
        this._frames = [];
        this._defined = false;
        this._fadeDiff = 0;
        this.z = 0;
        this.scale = 1;
        this.visible = false;
	}

    fadeIn(fSpeed = 0.05) {
        this._fadeDiff = fSpeed;
        this.alpha = 0;
    }

    fadeOut(fSpeed = 0.05) {
        this._fadeDiff = -fSpeed;
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
		this.image = await ImageLoader.load('images/sprites/' + data.image + '.png');
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
		if ('animations' in data) {
			this.animations = data.animations.map(anim => new Animation(anim));
			this.setAnimation(0);
		}
		this.reference.x = (this.frameWidth >> 1) + data.ref.x;
		this.reference.y = (this.frameHeight >> 1) + data.ref.y;
		this._defined = true;
	}

	frameCount() {
		return this._frames.length;
	}

	frame(n) {
		return sb.prop(this, '_iFrame', n);
	}

	setAnimation(n) {
		this.animation = this.animations[n];
		this.animation.reset();
		this.animation.frozen = false;
	}

	animate(nInc) {
		if (this.animation) {
			this._iFrame = this.animation.animate(nInc);
		}
	}

	draw(ctx, vOffset) {
		if (!this._defined) {
			return;
		}
		let n = this._iFrame;
		if (n >= this._frames.length) {
			throw new Error('no such frame : "' + n + '". frame count is ' + this._frames.length);
		}
		let w = this.frameWidth;
		let h = this.frameHeight;
		const scale = this.scale;
		let p = this.position.sub(vOffset);
        this.processFade();
		let a = this.alpha;
		if (a > 0) {
			let fSaveAlpha;
			if (a !== 1) {
				fSaveAlpha = ctx.globalAlpha;
				ctx.globalAlpha = a;
			}
			let f = this._frames[n];
			const wScaled = w * scale;
			const hScaled = h * scale;
			const wScaledDiff = Math.floor((w - wScaled) / 2);
			const hScaledDiff = Math.floor((h - hScaled) / 2);
            ctx.drawImage(
                this.image,
                f.x,
                f.y,
                w,
                h,
                p.x + wScaledDiff,
                p.y + hScaledDiff,
                wScaled,
                hScaled
            );
            if (a !== 1) {
                ctx.globalAlpha = fSaveAlpha;
            }
		}
	}
}

export default Sprite;