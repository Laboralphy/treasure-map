const Vector = require('./Vector');

class View {
	constructor() {
		this._offset = new Vector(); // offset retranché à la position pour déterminer le point super-gauche
		this._position = new Vector(); // position de la vue
		this._width = 0;
		this._height = 0;
	}

	get offset() {
		return this._offset;
	}

	set offset(v) {
		this._offset = v;
	}

	get position() {
		return this._position;
	}

	set position(v) {
		this._position = v;
	}

	get width() {
		return this._width;
	}

	set width(v) {
		this._width = v;
	}

	get height() {
		return this._height;
	}

	set height(v) {
		this._height = v;
	}

	center() {
		this.offset = new Vector(this.width >> 1, this.height >> 1);
	}

	points() {
		let p0 = this._position.sub(this._offset);
		let p1 = p0.add(new Vector(this._width, this._height));
		return [p0, p1];
	}
}

module.exports = View;