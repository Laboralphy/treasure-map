import { describe, it, expect } from 'vitest';
import { interpolate, findSegment, interpolateSegment } from '../src/libs/linear-interpolator';

describe('basic test', () => {
    it('should interpolate simple segment', () => {
        expect(interpolateSegment).toBeDefined();
        expect(findSegment).toBeDefined();
        expect(interpolateSegment(0,   0, 0, 1, 1)).toBe(0);
        expect(interpolateSegment(1,   0, 0, 1, 1)).toBe(1);
        expect(interpolateSegment(0.5, 0, 0, 1, 1)).toBe(0.5);
        expect(interpolateSegment(0.5, 0, 0, 1, 2)).toBe(1);
    });

    it('should find simple segment', () => {
        const aSegments = [{ x: 0, y: 0 }, { x: 2, y: 0 }];
        expect(findSegment(0,  aSegments)).toBe(0);
        expect(findSegment(1,  aSegments)).toBe(0);
        expect(findSegment(2,  aSegments)).toBe(0);
        expect(findSegment(3,  aSegments)).toBe(false);
        expect(findSegment(-1, aSegments)).toBe(false);
    });

    it('should find complex segment I', () => {
        const aSegments = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 4, y: 0 }];
        expect(findSegment(0,  aSegments)).toBe(0);
        expect(findSegment(1,  aSegments)).toBe(0);
        expect(findSegment(2,  aSegments)).toBe(0);
        expect(findSegment(3,  aSegments)).toBe(1);
        expect(findSegment(-1, aSegments)).toBe(false);
    });

    it('should find complex segment II', () => {
        const aSegments = [
            { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 4, y: 0 },
            { x: 10, y: 0 }, { x: 14, y: 0 }, { x: 15, y: 0 }, { x: 20, y: 0 }
        ];
        expect(findSegment(0,    aSegments)).toBe(0);
        expect(findSegment(1,    aSegments)).toBe(0);
        expect(findSegment(2,    aSegments)).toBe(0);
        expect(findSegment(3,    aSegments)).toBe(1);
        expect(findSegment(-1,   aSegments)).toBe(false);
        expect(findSegment(10,   aSegments)).toBe(2);
        expect(findSegment(10.1, aSegments)).toBe(3);
        expect(findSegment(19,   aSegments)).toBe(5);
        expect(findSegment(20,   aSegments)).toBe(5);
    });
});

describe('real interpolation', () => {
    it('should interpolate', () => {
        const aSegments = [
            { x: 0,  y: 1 }, { x: 2,  y: 0 }, { x: 4,  y: 1 },
            { x: 10, y: 3 }, { x: 14, y: -2 }, { x: 15, y: 10 }, { x: 20, y: 0 }
        ];
        expect(interpolate(0,    aSegments)).toBe(1);
        expect(interpolate(1,    aSegments)).toBe(0.5);
        expect(interpolate(2,    aSegments)).toBe(0);
        expect(interpolate(3,    aSegments)).toBe(0.5);
        expect(interpolate(4,    aSegments)).toBe(1);
        expect(interpolate(7,    aSegments)).toBe(2);
        expect(interpolate(10,   aSegments)).toBe(3);
        expect(interpolate(12,   aSegments)).toBe(0.5);
        expect(interpolate(14,   aSegments)).toBe(-2);
        expect(interpolate(14.5, aSegments)).toBe(4);
        expect(interpolate(17.5, aSegments)).toBe(5);
    });
});
