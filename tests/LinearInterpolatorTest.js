const LinearInterpolator = require('../src/libs/linear-interpolator');


describe('basic test', function() {
    it('should interpolate simple segment', function() {
        expect(LinearInterpolator).toBeDefined();
        expect(LinearInterpolator.findSegment).toBeDefined();
        expect(LinearInterpolator.interpolateSegment(0, 0, 0, 1, 1, )).toBe(0);
        expect(LinearInterpolator.interpolateSegment(1, 0, 0, 1, 1, )).toBe(1);
        expect(LinearInterpolator.interpolateSegment(0.5, 0, 0, 1, 1, )).toBe(0.5);
        expect(LinearInterpolator.interpolateSegment(0.5, 0, 0, 1, 2, )).toBe(1);
    });
    it('should find simple segment', function() {
        const aSegments = [
            {
                x: 0,
                y: 0
            },
            {
                x: 2,
                y: 0
            }
        ];
        expect(LinearInterpolator.findSegment(0, aSegments)).toBe(0);
        expect(LinearInterpolator.findSegment(1, aSegments)).toBe(0);
        expect(LinearInterpolator.findSegment(2, aSegments)).toBe(0);
        expect(LinearInterpolator.findSegment(3, aSegments)).toBe(false);
        expect(LinearInterpolator.findSegment(-1, aSegments)).toBe(false);
    });
    it('should find complex segment I', function() {
        const aSegments = [
            {
                x: 0,
                y: 0
            },
            {
                x: 2,
                y: 0
            },
            {
                x: 4,
                y: 0
            }
        ];
        expect(LinearInterpolator.findSegment(0, aSegments)).toBe(0);
        expect(LinearInterpolator.findSegment(1, aSegments)).toBe(0);
        expect(LinearInterpolator.findSegment(2, aSegments)).toBe(0);
        expect(LinearInterpolator.findSegment(3, aSegments)).toBe(1);
        expect(LinearInterpolator.findSegment(-1, aSegments)).toBe(false);
    });
    it('should find complex segment II', function() {
        const aSegments = [
            {
                x: 0,
                y: 0
            },
            {
                x: 2,
                y: 0
            },
            {
                x: 4,
                y: 0
            },
            {
                x: 10,
                y: 0
            },
            {
                x: 14,
                y: 0
            },
            {
                x: 15,
                y: 0
            },
            {
                x: 20,
                y: 0
            }
        ];
        expect(LinearInterpolator.findSegment(0, aSegments)).toBe(0);
        expect(LinearInterpolator.findSegment(1, aSegments)).toBe(0);
        expect(LinearInterpolator.findSegment(2, aSegments)).toBe(0);
        expect(LinearInterpolator.findSegment(3, aSegments)).toBe(1);
        expect(LinearInterpolator.findSegment(-1, aSegments)).toBe(false);
        expect(LinearInterpolator.findSegment(10, aSegments)).toBe(2);
        expect(LinearInterpolator.findSegment(10.1, aSegments)).toBe(3);
        expect(LinearInterpolator.findSegment(19, aSegments)).toBe(5);
        expect(LinearInterpolator.findSegment(20, aSegments)).toBe(5);
    });
});

describe('real interpolation', function() {
    it ('should interpolate', function() {
        const aSegments = [
            {
                x: 0,
                y: 1
            },
            {
                x: 2,
                y: 0
            },
            {
                x: 4,
                y: 1
            },
            {
                x: 10,
                y: 3
            },
            {
                x: 14,
                y: -2
            },
            {
                x: 15,
                y: 10
            },
            {
                x: 20,
                y: 0
            }
        ];
        expect(LinearInterpolator.interpolate(0, aSegments)).toBe(1);
        expect(LinearInterpolator.interpolate(1, aSegments)).toBe(0.5);
        expect(LinearInterpolator.interpolate(2, aSegments)).toBe(0);
        expect(LinearInterpolator.interpolate(3, aSegments)).toBe(0.5);
        expect(LinearInterpolator.interpolate(4, aSegments)).toBe(1);
        expect(LinearInterpolator.interpolate(7, aSegments)).toBe(2);
        expect(LinearInterpolator.interpolate(10, aSegments)).toBe(3);
        expect(LinearInterpolator.interpolate(12, aSegments)).toBe(0.5);
        expect(LinearInterpolator.interpolate(14, aSegments)).toBe(-2);
        expect(LinearInterpolator.interpolate(14.5, aSegments)).toBe(4);
        expect(LinearInterpolator.interpolate(17.5, aSegments)).toBe(5);
    })
});