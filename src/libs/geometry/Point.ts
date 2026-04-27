import Helper from './Helper';

class Point {
    x: number;
    y: number;

    constructor(x?: { x: number; y: number } | number, y?: number) {
        if (typeof x === 'object' && x !== null && 'x' in x && 'y' in x) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = (x as number) ?? 0;
            this.y = y ?? 0;
        }
    }

    distance(p: { x: number; y: number }): number {
        return Helper.distance(p.x, p.y, this.x, this.y);
    }
}

export default Point;
