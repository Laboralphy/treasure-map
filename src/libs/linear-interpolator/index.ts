interface Segment {
    x: number;
    y: number;
}

function interpolateSegment(x: number, xa: number, ya: number, xb: number, yb: number): number {
    return x * (ya - yb) / (xa - xb) + (xa * yb - xb * ya) / (xa - xb);
}

function findSegment(x: number, aSegments: Segment[], i0: number | null = null, i1: number | null = null): number | false {
    const nLen = aSegments.length;
    if (i0 === null) {
        return findSegment(x, aSegments, 0, nLen - 1);
    }
    const p0 = aSegments[i0];
    const p1 = aSegments[i1!];
    if (x >= p0.x && x <= p1.x) {
        if (Math.abs(i0 - i1!) > 1) {
            const iMid = (i0 + i1!) >> 1;
            let r = findSegment(x, aSegments, i0, iMid);
            if (r === false) {
                r = findSegment(x, aSegments, iMid, i1!);
            }
            return r;
        } else {
            return i0;
        }
    } else {
        return false;
    }
}

function interpolate(x: number, aSegments: Segment[]): number | false {
    const i0 = findSegment(x, aSegments);
    if (i0 === false) {
        return false;
    }
    const p0 = aSegments[i0];
    const p1 = aSegments[i0 + 1];
    return interpolateSegment(x, p0.x, p0.y, p1.x, p1.y);
}

function makeSegments(...coords: number[]): Segment[] {
    const a: Segment[] = [];
    for (let i = 0, l = coords.length; i < l; i += 2) {
        const x = coords[i];
        const y = coords[i + 1];
        a.push({ x, y });
    }
    return a;
}

export { interpolate, findSegment, interpolateSegment, makeSegments };
export type { Segment };
