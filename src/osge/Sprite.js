import o876 from '../o876/index';
import Animation from './Animation';

const Vector = o876.geometry.Vector;

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
            ctx.drawImage(
                this.image,
                n * w,
                0,
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