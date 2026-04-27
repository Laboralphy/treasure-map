import Vector from './Vector';

class View {
    private _offset: Vector;
    private _position: Vector;
    private _width: number;
    private _height: number;

    constructor() {
        this._offset = new Vector();
        this._position = new Vector();
        this._width = 0;
        this._height = 0;
    }

    get offset(): Vector { return this._offset; }
    set offset(v: Vector) { this._offset = v; }

    get position(): Vector { return this._position; }
    set position(v: Vector) { this._position = v; }

    get width(): number { return this._width; }
    set width(v: number) { this._width = v; }

    get height(): number { return this._height; }
    set height(v: number) { this._height = v; }

    center(): void {
        this.offset = new Vector(this.width >> 1, this.height >> 1);
    }

    points(): [Vector, Vector] {
        const p0 = this._position.sub(this._offset);
        const p1 = p0.add(new Vector(this._width, this._height));
        return [p0, p1];
    }
}

export default View;
