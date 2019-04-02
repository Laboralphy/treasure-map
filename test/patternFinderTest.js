const pf = require('../src/pattern-finder');



describe('pattern finder', function() {
    describe('checkPatternAt', function() {
        it('should find a pattern', function() {
            expect(pf.checkPatternAt(0, 0, [[1]], [[1]])).toBeTruthy();
        });
        it('should still find a pattern', function() {
            expect(pf.checkPatternAt(1, 0, [[1, 5]], [[5]])).toBeTruthy();
        });
        it('should not find a pattern', function() {
            expect(pf.checkPatternAt(0, 0, [[1]], [[2]])).toBeFalsy();
        });
        it('should find a pattern in big map', function() {
            expect(pf.checkPatternAt(1, 2, [
                [10, 11, 12, 13, 14],
                [20, 21, 22, 23, 24],
                [30, 31, 32, 33, 34],
                [40, 41, 42, 43, 44],
                [50, 51, 52, 53, 54],
            ], [[31, 32], [41, 42]])).toBeTruthy();
        });
        it('should not find a pattern in big map', function() {
            expect(pf.checkPatternAt(1, 2, [
                [10, 11, 12, 13, 14],
                [20, 21, 22, 23, 24],
                [30, 31, 32, 33, 34],
                [40, 41, 42, 43, 44],
                [50, 51, 52, 53, 54],
            ], [[31, 32, 34], [41, 42, 43]])).toBeFalsy();
        });
    })
});