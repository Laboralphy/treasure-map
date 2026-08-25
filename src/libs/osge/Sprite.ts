import Animation from './Animation';
import { load } from '../image-loader';
import { Vector } from '../geometry';

interface SpriteDefinition {
    image: string;
    frames?: number;
    width?: number;
    height?: number;
    ref: { x: number; y: number };
    animations?: Array<{ start: number; count: number; duration: number; loop: number }>;
}

class Sprite {
    position: Vector;
    reference: Vector;
    image: HTMLImageElement | null;
    frameWidth: number;
    frameHeight: number;
    animation: Animation | null;
    animations: Animation[];
    private _iFrame: number;
    alpha: number;
    private _frames: Array<{ x: number; y: number }>;
    private _defined: boolean;
    private _fadeDiff: number;
    z: number;
    scale: number;
    visible: boolean;
    rendered: { x: number; y: number };

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
        this.rendered = { x: 0, y: 0 };
    }

    fadeIn(fSpeed: number = 0.05): void {
        this._fadeDiff = fSpeed;
        this.alpha = 0;
    }

    fadeOut(fSpeed: number = 0.05): void {
        this._fadeDiff = -fSpeed;
        this.alpha = 1;
    }

    processFade(): void {
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

    async define(data: SpriteDefinition): Promise<void> {
        this.image = await load('./assets/graphics/sprites/' + data.image + '.png') as HTMLImageElement;
        if ('width' in data && 'height' in data) {
            this.frameWidth = data.width!;
            this.frameHeight = data.height!;
        } else {
            if (!data.frames) {
                throw new Error('either "width/height" or "frames" must be defined, in the blueprint');
            }
            this.frameWidth = this.image.naturalWidth / data.frames;
            this.frameHeight = this.image.naturalHeight;
        }
        let y = 0;
        while (y < this.image.naturalHeight) {
            let x = 0;
            while (x < this.image.naturalWidth) {
                this._frames.push({ x, y });
                x += this.frameWidth;
            }
            y += this.frameHeight;
        }
        if (data.animations) {
            this.animations = data.animations.map(anim => new Animation(anim));
            this.setAnimation(0);
        }
        this.reference.x = (this.frameWidth >> 1) + data.ref.x;
        this.reference.y = (this.frameHeight >> 1) + data.ref.y;
        this._defined = true;
    }

    frameCount(): number {
        return this._frames.length;
    }

    get frame(): number {
        return this._iFrame;
    }

    set frame(value: number) {
        this._iFrame = value | 0;
    }

    setAnimation(n: number): void {
        this.animation = this.animations[n];
        this.animation.reset();
        this.animation.frozen = false;
    }

    animate(nInc: number): void {
        if (this.animation) {
            this._iFrame = this.animation.animate(nInc);
        }
    }

    draw(ctx: CanvasRenderingContext2D, vOffset: Vector): void {
        if (!this._defined) {
            return;
        }
        const n = this._iFrame;
        if (n >= this._frames.length) {
            throw new Error('no such frame : "' + n + '". frame count is ' + this._frames.length);
        }
        const w = this.frameWidth;
        const h = this.frameHeight;
        const scale = this.scale;
        const p = this.position.sub(vOffset);
        this.processFade();
        const a = this.alpha;
        if (a > 0) {
            let fSaveAlpha: number | undefined;
            if (a !== 1) {
                fSaveAlpha = ctx.globalAlpha;
                ctx.globalAlpha = a;
            }
            const f = this._frames[n];
            const wScaled = w * scale;
            const hScaled = h * scale;
            const wScaledDiff = Math.floor((w - wScaled) / 2);
            const hScaledDiff = Math.floor((h - hScaled) / 2);
            const xrend = p.x + wScaledDiff;
            const yrend = p.y + hScaledDiff;
            this.rendered.x = xrend;
            this.rendered.y = yrend;
            ctx.drawImage(this.image!, f.x, f.y, w, h, xrend, yrend, wScaled, hScaled);
            if (a !== 1) {
                ctx.globalAlpha = fSaveAlpha!;
            }
        }
    }
}

export default Sprite;
export type { SpriteDefinition };
