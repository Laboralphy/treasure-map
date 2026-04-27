import { describe, it, expect } from 'vitest';
import pcghash from '../src/libs/pcghash';

describe('pcg basic testing', () => {
    it('check if 100 points are evenly distributed', () => {
        const a: number[] = [];
        for (let y = 0; y < 10; ++y) {
            for (let x = 0; x < 10; ++x) {
                a.push(pcghash(x, y) & 255);
            }
        }
        const moy = a.reduce((prev, curr) => prev + curr, 0) / a.length;
        expect(moy).toBeGreaterThan(125);
        expect(moy).toBeLessThan(132);
    });

    it('check if 10000 points are evenly distributed', () => {
        const a: number[] = [];
        for (let y = 0; y < 100; ++y) {
            for (let x = 0; x < 100; ++x) {
                a.push(pcghash(x, y) & 255);
            }
        }
        const moy = a.reduce((prev, curr) => prev + curr, 0) / a.length;
        expect(moy).toBeGreaterThan(125);
        expect(moy).toBeLessThan(132);
    });

    it('check if 100 points are evenly distributed / with seed', () => {
        const a: number[] = [];
        for (let y = 0; y < 10; ++y) {
            for (let x = 0; x < 10; ++x) {
                a.push(pcghash(x, y, 12555) & 255);
            }
        }
        const moy = a.reduce((prev, curr) => prev + curr, 0) / a.length;
        expect(moy).toBeGreaterThan(125);
        expect(moy).toBeLessThan(132);
    });

    it('check if 10000 points are evenly distributed / with seed', () => {
        const a: number[] = [];
        for (let y = 0; y < 100; ++y) {
            for (let x = 0; x < 100; ++x) {
                a.push(pcghash(x, y, 589654) & 255);
            }
        }
        const moy = a.reduce((prev, curr) => prev + curr, 0) / a.length;
        expect(moy).toBeGreaterThan(125);
        expect(moy).toBeLessThan(132);
    });
});
