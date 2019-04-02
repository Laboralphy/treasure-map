const o876 = require('../o876');
const CharRegistry = require('./CharRegistry');


const MAX_TRIES = 1024;

class NameCrafter {

    constructor() {
        this._nPatternLength = 3;
        this._initReg = new CharRegistry();
        this._finalReg = {};
        this._midReg = {};
        this._random = new o876.Random();
        this._list = null;
    }

    /**
     * Définir la liste des noms parmis lesquels s'inspirer pour créer un nouveau nom
     * @param l {Array}
     */
    setList(l) {
        this._list = l;
        l.forEach(s => this.addWord(s));
    }

    /**
     * pioche au hasard une entrée dans le registre
     * @param oReg
     * @return {*}
     */
    rndPick(oReg) {
        const x = this._random.rand(0, oReg.sum - 1);
        return oReg.pick(x);
    }

    addWord(word) {
        const n = this._nPatternLength;
        const ri = this._initReg;
        const rm = this._midReg;
        const rf = this._finalReg;
        ri.addEntry(word.substr(0, n));
        word = word.replace(/[^a-z]+/gi, '');
        if (word.length > n) {
            for (let i = 0; i < word.length - n; ++i) {
                let letter = word.charAt(i + n);
                let pattern = word.substr(i, n);
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

    generate(nLength) {
        const n = this._nPatternLength;
        const ri = this._initReg;
        const rm = this._midReg;
        const rf = this._finalReg;
        let nTries = MAX_TRIES;
        while(--nTries > 0) {
            let sPattern = this.rndPick(ri);
            let sResult = sPattern;
            while (sResult.length < (nLength - 1)) {
                let p = rm[sPattern] ? this.rndPick(rm[sPattern]) : '';
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
            if (this._list.indexOf(sResult) >= 0) {
                continue;
            }
            return sResult;
        }
        throw new Error('could not generate any name after ' + MAX_TRIES + ' tries... the initial list may be two small...');
    }
}

module.exports = NameCrafter;