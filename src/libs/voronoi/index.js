import Geometry from '../geometry';

class Voronoi {
    constructor() {
        this._germs = [];
        this._pushIndex = 0;
        this._region = [{x: Infinity, y: Infinity}, {x: -Infinity, y: -Infinity}];
        this._width = 0;
        this._height = 0;
    }


    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get germs() {
        return this._germs;
    }

    get region() {
        return this._region;
    }

    addPoint(x, y, interior = false) {
        const index = ++this._pushIndex;
        this._germs.push({
            index,
            x,
            y,
            nearest: [],
            regions: {
                outer: [
                    {x: null, y: null},
                    {x: null, y: null}
                ],
                inner: [
                    {x: null, y: null},
                    {x: null, y: null}
                ]
            },
            points: [],
            interior
        });
    }

    computeNearestPoint(p, n) {
        const aNearestFound = this._germs
            .filter(pi => pi.index !== p.index)
            .map(pi => ({
                x: pi.x,
                y: pi.y,
                distance: (pi.x - p.x) * (pi.x - p.x) + (pi.y - p.y) * (pi.y - p.y),
                index: {
                    origin: p.index,
                    nearest: pi.index
                },
                median: {
                    x: (pi.x + p.x) / 2,
                    y: (pi.y + p.y) / 2
                }
            }));
        if (aNearestFound.length >= n) {
            aNearestFound.sort((pa, pb) => pa.distance - pb.distance)
                .slice(0, n)
                .forEach(pi => p.nearest.push(pi));
        }
    }

    computeNearest(n) {
        this._germs
            .filter(p => p.interior)
            .forEach(p => {
                this.computeNearestPoint(p, n);
                p.regions.outer = Geometry.Helper.getRegion(p.nearest);
            });
    }

    isInsideSemiPlaneNearest(x, y, p, pn) {
        // get median point
        const m = pn.median;
        // create vectors
        const vMedian = new Geometry.Vector(m.x, m.y);
        const vSeed = new Geometry.Vector(p.x, p.y);
        const vTarget = new Geometry.Vector(x, y);
        const vBase = vSeed.sub(vMedian);
        const vCheck = vTarget.sub(vMedian);
        if (vCheck.magnitude() === 0) {
            return true;
        }
        const fAngle = Math.abs(vCheck.angle(vBase));
        return fAngle <= (Math.PI / 2);
    }

    isInsideAllSemiPlanes(x, y, p) {
        return p.nearest.every(pi => this.isInsideSemiPlaneNearest(x, y, p, pi));
    }

    _computeCellPointDistance(x, y, p) {
        // get distance between germ and point
        const fDistSeed = Math.max(1, Geometry.Helper.squareDistance(x, y, p.x, p.y));
        // look for nearest
        const oBestNearest = p.nearest.map(n => ({
            x: n.x,
            y: n.y,
            d2: Geometry.Helper.squareDistance(x, y, n.x, n.y)
        })).sort((n1, n2) => n1.d2 - n2.d2).shift();
        if (!oBestNearest) {
            return 0;
        }
        const fDistNearest = oBestNearest.d2;
        return Math.max(0, Math.min(1, 1 - (fDistSeed / fDistNearest)));
    }


    _getCellPoints(germ, rect = null) {
        const bRectDefined = rect !== null;
        const region = germ.regions.outer;
        let xMin = bRectDefined ? rect[0].x : region[0].x;
        let yMin = bRectDefined ? rect[0].y : region[0].y;
        let xMax = bRectDefined ? rect[1].x : region[1].x;
        let yMax = bRectDefined ? rect[1].y : region[1].y;
        const aPoints = [];
        let xInnerMin = Infinity;
        let yInnerMin = Infinity;
        let xInnerMax = -Infinity;
        let yInnerMax = -Infinity;
        for (let y = yMin; y <= yMax; ++y) {
            for (let x = xMin; x <= xMax; ++x) {
                if (this.isInsideAllSemiPlanes(x, y, germ)) {
                    const d = this._computeCellPointDistance(x, y, germ);
                    aPoints.push({x, y, d});
                    xInnerMin = Math.min(xInnerMin, x);
                    yInnerMin = Math.min(yInnerMin, y);
                    xInnerMax = Math.max(xInnerMax, x);
                    yInnerMax = Math.max(yInnerMax, y);
                }
            }
        }
        germ.regions.inner = [{x: xInnerMin, y: yInnerMin}, {x: xInnerMax, y: yInnerMax}];
        this._region[0].x = Math.min(this._region[0].x, xInnerMin);
        this._region[0].y = Math.min(this._region[0].y, xInnerMax);
        this._region[1].x = Math.min(this._region[1].x, xInnerMax);
        this._region[1].y = Math.min(this._region[1].y, yInnerMax);
        return aPoints;
    }

    compute(n) {
        this.computeNearest(n);
        this._germs.forEach(germ => {
            germ.points = this._getCellPoints(germ);
        });
    }
}

export default Voronoi;