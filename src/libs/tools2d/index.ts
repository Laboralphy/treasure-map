// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RowType = any;

function createArray2D(w: number, h: number, feed: ((x: number, y: number) => number) | number, pType: RowType = Array): RowType[] {
    const a: RowType[] = [];
    for (let y = 0; y < h; ++y) {
        const r = new pType(w);
        for (let x = 0; x < w; ++x) {
            r[x] = feed instanceof Function ? feed(x, y) : feed;
        }
        a[y] = r;
    }
    return a;
}

function _createRow(aRow: RowType, pType: RowType = Array): RowType {
    switch (pType) {
        case Array:
            return aRow;
        default:
            return new pType(aRow);
    }
}

function walk2D(aArray2D: RowType[], cb: (x: number, y: number, cell: number) => number): void {
    for (let y = 0, h = aArray2D.length; y < h; ++y) {
        const row = aArray2D[y];
        for (let x = 0, w = row.length; x < w; ++x) {
            row[x] = cb(x, y, row[x]);
        }
    }
}

function map2D(aArray2D: RowType[], cb: (x: number, y: number, cell: number) => number, pType: RowType = Array): RowType[] {
    return aArray2D.map((row: RowType, y: number) => _createRow(row.map((cell: number, x: number) => cb(x, y, cell))), pType);
}

function rotate(aArray: RowType[], bDirect: boolean = false): RowType[] {
    const n = aArray.length;
    if (n === 0) {
        return [];
    }
    return createArray2D(n, n, (x, y) => bDirect
        ? aArray[x][n - y - 1]
        : aArray[n - x - 1][y], aArray[0].constructor
    );
}

function rotateTwice(aArray: RowType[]): RowType[] {
    const a = rotate(aArray);
    return rotate(aArray, a as unknown as boolean);
}

export { rotate, createArray2D, map2D, rotateTwice, walk2D };
