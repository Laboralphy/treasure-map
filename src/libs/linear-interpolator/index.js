/**
 * Interpolation lineaire
 * @param x {number}
 * @param xa {number}
 * @param ya {number}
 * @param xb {number}
 * @param yb {number}
 * @returns {number}
 */
export function interpolateSegment(x, xa, ya, xb, yb) {
    return x * (ya - yb) / (xa - xb) + (xa * yb - xb * ya) / (xa - xb);
}

export function findSegment(x, aSegments, i0 = null, i1 = null) {
    const nLen = aSegments.length;
    if (i0 === null) {
        return findSegment(x, aSegments, 0, nLen -1)
    }
    const p0 = aSegments[i0];
    const p1 = aSegments[i1];
    if (x >= p0.x && x <= p1.x) {
        if (Math.abs(i0 - i1) > 1) {
            const iMid = (i0 + i1) >> 1;
            let r = findSegment(x, aSegments, i0, iMid);
            if (r === false) {
                r = findSegment(x, aSegments, iMid, i1);
            }
            return r;
        } else {
            // il ne reste plus qu'un point
            return i0;
        }
    } else {
        return false;
    }
}

export function interpolate(x, aSegments) {
    const i0 = findSegment(x, aSegments);
    if (i0 === false) {
        return false;
    }
    const p0 = aSegments[i0];
    const p1 = aSegments[i0 + 1];
    return interpolateSegment(x, p0.x, p0.y, p1.x, p1.y);
}

export function makeSegments(...coords) {
    const a = [];
    for (let i = 0, l = coords.length; i < l; i += 2) {
        const x = coords[i];
        const y = coords[i + 1];
        a.push({x, y});
    }
    return a;
}