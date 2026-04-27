class Time {
    period: number;
    private _last: number;

    constructor() {
        this.period = 0;
        this._last = 0;
    }

    process(t: number): number {
        let n = 0;
        const p = this.period;
        if (p) {
            while (this._last <= t) {
                ++n;
                this._last += p;
            }
            return n;
        } else {
            throw new Error('period must be set > 0');
        }
    }
}

export default Time;
