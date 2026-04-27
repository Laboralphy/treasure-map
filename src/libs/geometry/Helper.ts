class Helper {
    static distance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static squareDistance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return dx * dx + dy * dy;
    }

    static pointInRect(x: number, y: number, xr: number, yr: number, wr: number, hr: number): boolean {
        return x >= xr && y >= yr && x < xr + wr && y < yr + hr;
    }

    static rectInRect(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean {
        const ax2 = ax + aw - 1;
        const ay2 = ay + ah - 1;
        const bx2 = bx + bw - 1;
        const by2 = by + bh - 1;
        return ax < bx2 && ax2 > bx && ay > by2 && ay2 < by;
    }

    static angle(x1: number, y1: number, x2: number, y2: number): number {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    static polar2rect(angle: number, norm: number): { dx: number; dy: number } {
        return { dx: norm * Math.cos(angle), dy: norm * Math.sin(angle) };
    }

    static getRegion(aPoints: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
        let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
        aPoints.forEach(p => {
            xMin = Math.min(p.x, xMin);
            yMin = Math.min(p.y, yMin);
            xMax = Math.max(p.x, xMax);
            yMax = Math.max(p.y, yMax);
        });
        return [{ x: xMin, y: yMin }, { x: xMax, y: yMax }];
    }
}

export default Helper;
