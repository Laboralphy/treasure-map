/**
 * @class Random
 * a FALSE random very false...
 * generated random numbers, with seed
 * used for predictable landscape generation
 */

class Random {

    constructor() {
        this._seed = Math.random();
        this.rand = this._rand_bcxx;
    }

    /**
     * defines a new seed
     * @param x {number}
     * @returns {*}
     */
    set seed (x) {
        this._seed = x;
    }

    get seed() {
        return this._seed;
    }

    /**
     * Return a random generated number using the simple sine-66 function
     * @returns {number} a number between 0 and 1
     */
    _rand_sin() {
        const n = Math.abs(((Math.sin(this._seed) * 1e12) % 1e6) / 1e6);
        this._seed = n === 0 ? 0.000001 : n;
        return n;
    }

    _rand_bcxx() {
        this._seed = (22695477 * this._seed + 1) & 0xFFFFFFFF;
        return (this._seed >>> 16) / 65536;
    }

    /**
     * returns a random generated number.
     * the result will vary according to the given parameter values
     * - two integer (a, b) gives a random number between a and b
     * - an array gives a random item of this array
     * - an object gives a random key of this object
     * - no parameter gives a random float value between 0 and 1
     * @param [a] {number|Array|Object} lower limit
     * @param [b] {number} upper limit
     * @returns {*}
     */
    roll(a, b) {
        return Math.max(a, Math.min(b, (b - a + 1) * this.rand() + a | 0));
    }

    /**
     * This function randomly picks an item from the given array.
     * This choice is influenced by a weight.
     * The weight is either the item value or the result of a function called back with
     * the item given as parameter.
     * ex : ([10, 60, 30]) will give :
     *  - 0 : 10% of chance
     *  - 1 : 60% of chance
     *  - 2 : 40% of chance
     *
     * (['pif', 'gloup', 'ploumpatapoum'], x => x.length)
     *
     * @param aArray {array}
     * @param pProbFunction {function}
     * @return {number} the rank of the chosen item
     */
    binomial(aArray, pProbFunction) {
        let nSum = pProbFunction
            ? aArray.reduce((p, c) => Math.max(0, pProbFunction(c)) + p, 0)
            : aArray.reduce((p, c) => Math.max(0, c) + p, 0);
        let nChoice = this.roll(0, nSum - 1);
        for (let i = 0, l = aArray.length; i < l; ++i) {
            let ci;
            if (pProbFunction) {
                ci = Math.max(0, pProbFunction(aArray[i]));
            } else {
                ci = Math.max(0, aArray[i]);
            }
            if (nChoice < ci) {
                return i;
            }
            nChoice -= ci;
        }
        return null;
    }

    /**
     * Shuffles array in place. ES6 version
     * @param {Array} aArray items The array containing the items.
     * @param {boolean} bImmutable if true, a new array is built, the provide array remains untouched
     */
    shuffle(aArray, bImmutable) {
        if (bImmutable) {
            aArray = aArray.slice(0);
        }
        for (let i = aArray.length; i; --i) {
            let j = this.roll(0, i - 1);
            [aArray[i - 1], aArray[j]] = [aArray[j], aArray[i - 1]];
        }
        return aArray;
    }

    /**
     * randomly pick an item from an array or a string
     * @param aArray {array|string}
     * @param [bRemove] {boolean} if true the item is removed from the array
     */
    pick(aArray, bRemove) {
        let n = this.roll(0, aArray.length - 1);
        let r = aArray[n];
        if (bRemove) {
            aArray.splice(n, 1);
        }
        return r;
    }
}

module.exports = Random;
