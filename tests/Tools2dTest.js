const Tools2D = require('../src/libs/tools2d');

describe('#create', function() {
    it('should create Uint8Arrays', function() {
        const x = Tools2D.createArray2D(4, 4, null, Uint8Array);
        expect(x[0]).toBeInstanceOf(Uint8Array);
        expect(x[1]).toBeInstanceOf(Uint8Array);
        expect(x[2]).toBeInstanceOf(Uint8Array);
        expect(x[3]).toBeInstanceOf(Uint8Array);
    })
})

describe('#rotate', function() {
    it('should rotate cw', function() {
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
        expect(Tools2D.rotate(a)).toEqual(aRotatedCW)
    })

    it('should rotate ccw', function() {
        const a = [
            [10, 11, 12, 13],
            [20, 21, 22, 23],
            [30, 31, 32, 33],
            [40, 41, 42, 43]
        ];
        const aRotatedCCW = [
            [13, 23, 33, 43],
            [12, 22, 32, 42],  // 12 pour ecrire [1][0] on lit [0][2] 4 - 1 - 1 = 2
            [11, 21, 31, 41],  // 31 pour ecrire [2][2] on lit [2][1] 4 - 1 - 2 = 1
            [10, 20, 30, 40]
        ];                     //    pour ecrire [y][x] on lit [x][4-1-y]
        expect(Tools2D.rotate(a, true)).toEqual(aRotatedCCW)
    })

    it('should conserve row type Uint8', function() {
        const a = [
            new Uint8Array([10, 11, 12, 13]),
            new Uint8Array([20, 21, 22, 23]),
            new Uint8Array([30, 31, 32, 33]),
            new Uint8Array([40, 41, 42, 43])
        ];
        expect(Tools2D.rotate(a)[0]).toBeInstanceOf(Uint8Array);
    })
});