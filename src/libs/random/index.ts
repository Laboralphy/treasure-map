class Random {
    private _seed: number;
    rand: () => number;

    constructor() {
        this._seed = Math.random();
        this.rand = () => this._rand_bcxx();
    }

    set seed(x: number) {
        this._seed = x;
    }

    get seed(): number {
        return this._seed;
    }

    private _rand_sin(): number {
        const n = Math.abs(((Math.sin(this._seed) * 1e12) % 1e6) / 1e6);
        this._seed = n === 0 ? 0.000001 : n;
        return n;
    }

    private _rand_bcxx(): number {
        this._seed = (22695477 * this._seed + 1) & 0xFFFFFFFF;
        return (this._seed >>> 16) / 65536;
    }

    roll(a: number, b: number): number {
        return Math.max(a, Math.min(b, (b - a + 1) * this.rand() + a | 0));
    }

    binomial(aArray: number[], pProbFunction?: (item: number) => number): number | null {
        let nSum = pProbFunction
            ? aArray.reduce((p, c) => Math.max(0, pProbFunction(c)) + p, 0)
            : aArray.reduce((p, c) => Math.max(0, c) + p, 0);
        let nChoice = this.roll(0, nSum - 1);
        for (let i = 0, l = aArray.length; i < l; ++i) {
            const ci = pProbFunction
                ? Math.max(0, pProbFunction(aArray[i]))
                : Math.max(0, aArray[i]);
            if (nChoice < ci) {
                return i;
            }
            nChoice -= ci;
        }
        return null;
    }

    shuffle<T>(aArray: T[], bImmutable?: boolean): T[] {
        if (bImmutable) {
            aArray = aArray.slice(0);
        }
        for (let i = aArray.length; i; --i) {
            const j = this.roll(0, i - 1);
            [aArray[i - 1], aArray[j]] = [aArray[j], aArray[i - 1]];
        }
        return aArray;
    }

    pick<T>(aArray: T[] | string, bRemove?: boolean): T {
        const n = this.roll(0, (aArray as T[]).length - 1);
        const r = (aArray as T[])[n];
        if (bRemove) {
            (aArray as T[]).splice(n, 1);
        }
        return r;
    }
}

export default Random;
