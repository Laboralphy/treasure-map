import Geometry from '../geometry';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = any;

class Voronoi {
    private _germs: AnyObj[];
    private _pushIndex: number;
    private _region: Array<{ x: number; y: number }>;
    private _width: number;
    private _height: number;

    constructor() {
        this._germs = [];
        this._pushIndex = 0;
        this._region = [{ x: Infinity, y: Infinity }, { x: -Infinity, y: -Infinity }];
        this._width = 0;
        this._height = 0;
    }

    get width(): number { return this._width; }
    get height(): number { return this._height; }
    get germs(): AnyObj[] { return this._germs; }
    get region(): Array<{ x: number; y: number }> { return this._region; }

    addPoint(x: number, y: number, interior: boolean = false): void {
        const index = ++this._pushIndex;
        this._germs.push({
            index, x, y,
            nearest: [],
            regions: {
                outer: [{ x: null, y: null }, { x: null, y: null }],
                inner: [{ x: null, y: null }, { x: null, y: null }],
            },
            points: [],
            interior,
        });
    }

    createNearest(p: AnyObj, pi: AnyObj): AnyObj {
        return {
            x: pi.x,
            y: pi.y,
            distance: (pi.x - p.x) * (pi.x - p.x) + (pi.y - p.y) * (pi.y - p.y),
            index: pi.index,
            median: { x: (pi.x + p.x) / 2, y: (pi.y + p.y) / 2 },
        };
    }

    computeNearestPoint(p: AnyObj, n: number): void {
        const germs = this._germs;
        const aNearestFound = germs
            .filter((pi: AnyObj) => pi.index !== p.index)
            .map((pi: AnyObj) => this.createNearest(p, pi));
        if (aNearestFound.length >= n) {
            aNearestFound.sort((pa: AnyObj, pb: AnyObj) => pa.distance - pb.distance)
                .slice(0, n)
                .forEach((pi: AnyObj) => { p.nearest.push(pi); });
        }
    }

    computeNearest(n: number): void {
        this._germs
            .filter((p: AnyObj) => p.interior)
            .forEach((p: AnyObj) => {
                this.computeNearestPoint(p, n);
                p.regions.outer = Geometry.Helper.getRegion(p.nearest);
            });
    }

    isInsideSemiPlaneNearest(x: number, y: number, p: AnyObj, pn: AnyObj): boolean {
        const m = pn.median;
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

    isInsideAllSemiPlanes(x: number, y: number, p: AnyObj): boolean {
        return p.nearest.length > 0 && p.nearest.every((pi: AnyObj) => this.isInsideSemiPlaneNearest(x, y, p, pi));
    }

    _computeCellPointDistance(x: number, y: number, p: AnyObj): number {
        const fDistSeed = Math.max(1, Geometry.Helper.squareDistance(x, y, p.x, p.y));
        const oBestNearest = p.nearest.map((n: AnyObj) => ({
            x: n.x, y: n.y,
            d2: Geometry.Helper.squareDistance(x, y, n.x, n.y),
        })).sort((n1: AnyObj, n2: AnyObj) => n1.d2 - n2.d2).shift();
        if (!oBestNearest) {
            return 0;
        }
        return Math.max(0, Math.min(1, 1 - (fDistSeed / oBestNearest.d2)));
    }

    _getCellPoints(germ: AnyObj, rect: Array<{ x: number; y: number }> | null = null): AnyObj[] {
        const bRectDefined = rect !== null;
        const region = germ.regions.outer;
        const xMin = bRectDefined ? rect![0].x : region[0].x;
        const yMin = bRectDefined ? rect![0].y : region[0].y;
        const xMax = bRectDefined ? rect![1].x : region[1].x;
        const yMax = bRectDefined ? rect![1].y : region[1].y;
        const aPoints: AnyObj[] = [];
        let xInnerMin = Infinity, yInnerMin = Infinity, xInnerMax = -Infinity, yInnerMax = -Infinity;
        for (let y = yMin; y <= yMax; ++y) {
            for (let x = xMin; x <= xMax; ++x) {
                if (this.isInsideAllSemiPlanes(x, y, germ)) {
                    const d = this._computeCellPointDistance(x, y, germ);
                    aPoints.push({ x, y, d });
                    xInnerMin = Math.min(xInnerMin, x);
                    yInnerMin = Math.min(yInnerMin, y);
                    xInnerMax = Math.max(xInnerMax, x);
                    yInnerMax = Math.max(yInnerMax, y);
                }
            }
        }
        germ.regions.inner = [{ x: xInnerMin, y: yInnerMin }, { x: xInnerMax, y: yInnerMax }];
        this._region[0].x = Math.min(this._region[0].x, xInnerMin);
        this._region[0].y = Math.min(this._region[0].y, yInnerMin);
        this._region[1].x = Math.max(this._region[1].x, xInnerMax);
        this._region[1].y = Math.max(this._region[1].y, yInnerMax);
        return aPoints;
    }

    compute(n: number): void {
        this.computeNearest(n);
        this._germs.forEach((germ: AnyObj) => {
            germ.points = this._getCellPoints(germ);
        });
    }
}

export default Voronoi;
