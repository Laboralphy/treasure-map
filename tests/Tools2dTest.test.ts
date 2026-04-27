import { describe, it, expect } from 'vitest';
import { createArray2D, rotate } from '../src/libs/tools2d';

describe('#create', () => {
    it('should create Uint8Arrays', () => {
        const x = createArray2D(4, 4, 0, Uint8Array);
        expect(x[0]).toBeInstanceOf(Uint8Array);
        expect(x[1]).toBeInstanceOf(Uint8Array);
        expect(x[2]).toBeInstanceOf(Uint8Array);
        expect(x[3]).toBeInstanceOf(Uint8Array);
    });
});

describe('#rotate', () => {
    it('should rotate cw', () => {
        const a = [
            [10, 11, 12, 13],
            [20, 21, 22, 23],
            [30, 31, 32, 33],
            [40, 41, 42, 43]
        ];
        const aRotatedCW = [
            [40, 30, 20, 10],
            [41, 31, 21, 11],
            [42, 32, 22, 12],
            [43, 33, 23, 13]
        ];
        expect(rotate(a)).toEqual(aRotatedCW);
    });

    it('should rotate ccw', () => {
        const a = [
            [10, 11, 12, 13],
            [20, 21, 22, 23],
            [30, 31, 32, 33],
            [40, 41, 42, 43]
        ];
        const aRotatedCCW = [
            [13, 23, 33, 43],
            [12, 22, 32, 42],
            [11, 21, 31, 41],
            [10, 20, 30, 40]
        ];
        expect(rotate(a, true)).toEqual(aRotatedCCW);
    });

    it('should conserve row type Uint8', () => {
        const a = [
            new Uint8Array([10, 11, 12, 13]),
            new Uint8Array([20, 21, 22, 23]),
            new Uint8Array([30, 31, 32, 33]),
            new Uint8Array([40, 41, 42, 43])
        ];
        expect(rotate(a)[0]).toBeInstanceOf(Uint8Array);
    });
});
