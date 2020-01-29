class Time {
    constructor() {
        this.period = 0;
        this._last = 0;
    }

    process(t) {
        let n = 0, p = this.period;
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