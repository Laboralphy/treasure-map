import { describe, it, expect } from 'vitest';
import Random from '../src/libs/random';

describe('primary test', () => {
    const rand = new Random();
    rand.seed = 42;
    const COUNT = 100000;
    const NUMBERS: number[] = [];
    for (let x = 0; x < COUNT; ++x) {
        NUMBERS.push(rand.rand());
    }

    it('should have same amount of odd/even', () => {
        const n1 = NUMBERS.filter(n => ((n * 1000) & 1) === 1).length;
        const n2 = NUMBERS.filter(n => ((n * 1000) & 1) === 0).length;
        expect(100 * Math.abs(n1 - n2) / COUNT).toBeLessThan(2);
    });

    it('should not be over 1', () => {
        expect(NUMBERS.filter(n => n >= 1).length).toBe(0);
    });

    it('should not be below 0', () => {
        expect(NUMBERS.filter(n => n < 0).length).toBe(0);
    });

    it('6-sided dice : should have same amount of 1 2 3 4 5 6', () => {
        const d = [0, 0, 0, 0, 0, 0];
        NUMBERS.forEach(n => ++d[n * 6 | 0]);
        expect(d[0]).toBeCloseTo(COUNT / 6, -3);
        expect(d[1]).toBeCloseTo(COUNT / 6, -3);
        expect(d[2]).toBeCloseTo(COUNT / 6, -3);
        expect(d[3]).toBeCloseTo(COUNT / 6, -3);
        expect(d[4]).toBeCloseTo(COUNT / 6, -3);
        expect(d[5]).toBeCloseTo(COUNT / 6, -3);
    });

    it('should have +0.5 -0.5', () => {
        const n1 = NUMBERS.filter(n => Math.abs(n < 0.5 ? 1 : 0)).length;
        const n2 = NUMBERS.filter(n => Math.abs(n >= 0.5 ? 1 : 0)).length;
        expect(100 * Math.abs(n1 - n2) / COUNT).toBeLessThan(0.5);
    });

    it('should have same amount of 0..99', () => {
        const d = new Array<number>(100).fill(0);
        NUMBERS.forEach(n => ++d[n * 100 | 0]);
        for (let x = 0; x < 99; ++x) {
            expect(d[x]).toBeCloseTo(COUNT / 100, -3);
        }
    });
});
