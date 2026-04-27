import Helper from './Helper.js';

class Vector {
    x: number;
    y: number;

    constructor(x?: Vector | number, y?: number) {
        if (x instanceof Vector) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = typeof x === 'number' ? x : 0;
            this.y = y ?? 0;
        }
    }

    set(v: Vector): this;
    set(x: number, y: number): this;
    set(x: Vector | number, y?: number): this {
        if (x instanceof Vector) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = y!;
        }
        return this;
    }

    add(v: Vector): Vector {
        return new Vector(v.x + this.x, v.y + this.y);
    }

    sub(v: Vector): Vector {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    mul(f: Vector): number;
    mul(f: number): Vector;
    mul(f: Vector | number): number | Vector {
        if (f instanceof Vector) {
            return this.x * f.x + this.y * f.y;
        } else if (typeof f === 'number') {
            return new Vector(this.x * f, this.y * f);
        } else {
            throw new Error('vector product accepts only vectors or number as parameter');
        }
    }

    neg(): Vector {
        return new Vector(-this.x, -this.y);
    }

    isEqual(v: Vector): boolean {
        return this.x === v.x && this.y === v.y;
    }

    magnitude(): number {
        return Helper.distance(0, 0, this.x, this.y);
    }

    normalize(): Vector {
        if (this.magnitude() === 0) {
            throw new Error('division by vector magnitude 0');
        }
        return this.mul(1 / this.magnitude()) as Vector;
    }

    static zero(): Vector {
        return new Vector(0, 0);
    }

    translate(v: Vector): this {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    scale(f: number): this {
        this.x *= f;
        this.y *= f;
        return this;
    }

    direction(): number {
        return Helper.angle(0, 0, this.x, this.y);
    }

    angle(v: Vector): number {
        if (!v) {
            throw new Error('vector argument is mandatory');
        }
        return Math.acos(Math.min(1, Math.max(-1, this.normalize().dot(v.normalize()))));
    }

    toString(): string {
        return [this.x, this.y].map(n => n.toString()).join(':');
    }

    static fromPolar(a: number, s: number): Vector {
        const v = Helper.polar2rect(a, s);
        return new Vector(v.dx, v.dy);
    }

    dot(v: Vector): number {
        return this.x * v.x + this.y * v.y;
    }
}

export default Vector;
export { Vector };
