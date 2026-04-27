import Random from '../random';
import CharRegistry from './CharRegistry';

const MAX_TRIES = 1024;

class NameCrafter {
    private _pattern: number;
    private _initReg: CharRegistry;
    private _finalReg: Record<string, CharRegistry>;
    private _midReg: Record<string, CharRegistry>;
    private _random: Random;
    private _list: string[] | null;

    constructor() {
        this._pattern = 3;
        this._initReg = new CharRegistry();
        this._finalReg = {};
        this._midReg = {};
        this._random = new Random();
        this._list = null;
    }

    get pattern(): number {
        return this._pattern;
    }

    set pattern(value: number) {
        if (this._list === null) {
            this._pattern = value;
        } else {
            throw new Error('name crafter : the pattern value must be set before the list property');
        }
    }

    get random(): Random {
        return this._random;
    }

    set random(value: Random) {
        this._random = value;
    }

    get list(): string[] | null {
        return this._list;
    }

    set list(value: string[]) {
        this._list = value;
        this._initReg = new CharRegistry();
        this._finalReg = {};
        this._midReg = {};
        value.forEach(s => this.addWord(s));
    }

    rndPick(oReg: CharRegistry): string {
        const x = this._random.roll(0, oReg.sum - 1);
        return oReg.pick(x);
    }

    addWord(word: string): void {
        const n = this._pattern;
        const ri = this._initReg;
        const rm = this._midReg;
        const rf = this._finalReg;
        ri.addEntry(word.substr(0, n));
        word = word.replace(/[^a-z]+/gi, '');
        if (word.length > n) {
            for (let i = 0; i < word.length - n; ++i) {
                const letter = word.charAt(i + n);
                const pattern = word.substr(i, n);
                if (!(pattern in rm)) {
                    rm[pattern] = new CharRegistry();
                }
                rm[pattern].addEntry(letter);
            }
        }
        const sBeforeFin = word.substr(-n - 1, n);
        if (!(sBeforeFin in rf)) {
            rf[sBeforeFin] = new CharRegistry();
        }
        rf[sBeforeFin].addEntry(word.substr(-1));
    }

    generate(nLength: number): string {
        const n = this._pattern;
        const ri = this._initReg;
        const rm = this._midReg;
        const rf = this._finalReg;
        let nTries = MAX_TRIES;
        while (--nTries > 0) {
            let sPattern = this.rndPick(ri);
            let sResult = sPattern;
            while (sResult.length < (nLength - 1)) {
                const p = rm[sPattern] ? this.rndPick(rm[sPattern]) : '';
                if (p) {
                    sResult += p;
                    sPattern = sResult.substr(-n);
                } else {
                    sPattern = '';
                    break;
                }
            }
            if (rf[sPattern]) {
                sResult += this.rndPick(rf[sPattern]);
            } else {
                continue;
            }
            if (this._list!.indexOf(sResult) >= 0) {
                continue;
            }
            return sResult;
        }
        throw new Error('could not generate any name after ' + MAX_TRIES + ' tries... the initial list may be two small...');
    }
}

export default NameCrafter;
