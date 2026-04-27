interface AnimationDef {
    start?: number;
    duration?: number;
    count?: number;
    loop?: number;
}

class Animation {
    frozen: boolean;
    start: number;
    index: number;
    count: number;
    duration: number;
    time: number;
    loop: number;
    frame: number;
    private _loopDir: number;
    private _bOver: boolean;

    constructor({ start = 0, duration = 0, count = 1, loop = 0 }: AnimationDef) {
        this.frozen = true;
        this.start = start;
        this.index = 0;
        this.count = count;
        this.duration = duration;
        this.time = 0;
        this.loop = loop;
        this.frame = 0;
        this._loopDir = 1;
        this._bOver = false;
    }

    animate(nInc: number): number {
        if (this.frozen) {
            return this.frame;
        }
        if (this.count <= 1 || this.duration === 0) {
            return this.index + this.start;
        }
        this.time += nInc;
        if (this.time >= this.duration) {
            this.time -= this.duration;
            if (this.loop === 3) {
                this.index = Math.random() * this.count | 0;
            } else {
                this.index += this._loopDir;
            }
        }
        if (this.time >= this.duration) {
            this.index += this._loopDir * (this.time / this.duration | 0);
            this.time %= this.duration;
        }
        switch (this.loop) {
            case 0:
                if (this.index >= this.count) {
                    this.index = this.count - 1;
                    this._bOver = true;
                }
                break;
            case 1:
                if (this.index >= this.count) {
                    this.index = 0;
                }
                break;
            case 2:
                if (this.index >= this.count) {
                    this.index = this.count - 1;
                    this._loopDir = -1;
                }
                if (this.index <= 0) {
                    this._loopDir = 1;
                    this.index = 0;
                }
                break;
            default:
                if (this.index >= this.count) {
                    this.index = this.count - 1;
                }
        }
        this.frame = this.index + this.start;
        return this.frame;
    }

    reset(): void {
        this.index = 0;
        this.time = 0;
        this._loopDir = 1;
        this._bOver = false;
    }

    isOver(): boolean {
        return this._bOver;
    }
}

export default Animation;
export type { AnimationDef };
