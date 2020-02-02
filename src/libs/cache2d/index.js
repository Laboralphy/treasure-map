/**
 * Permet de mettre en cache des information indéxées par une coordonnées 2D
 */
class Cache2D {
	constructor(d = null) {
		let size = 64;
		if (d) {
			size = d.size || size;
		}
		this._cache = [];
		this._cacheSize = size;
		this._xLastRequest = null;
		this._yLastRequest = null;
		this._oLastRequest = null;
	}

	get size() {
		return this._cacheSize;
	}

	set size(v) {
		this.clear();
		this._cacheSize = v;
	}

	clear() {
		this._cache = [];
	}

	getMetaData(x, y) {
		if (this._xLastRequest === x && this._yLastRequest === y) {
			return this._oLastRequest;
		}
		const md = this._cache.find(o => o.x === x && o.y === y);
		if (!!md) {
			this._xLastRequest = x;
			this._yLastRequest = y;
			this._oLastRequest = md;
		}
		return md;
	}

	load(x, y) {
		let o = this.getMetaData(x, y);
		if (o) {
			return o.payload;
		} else {
			return null;
		}
	}

	trim() {
		let c = this._cache;
		c.sort((a, b) => b.n - a.n);
		let aDelete = [];
		while (c.length > this._cacheSize) {
			aDelete.push(c.shift());
		}
		return aDelete;
	}

	store(x, y, payload) {
		let c = this._cache;
		let md = this.getMetaData(x, y);
		if (!md) {
			c.push({
				x, y, n: 0, payload
			});
		} else {
			++md.n;
		}
		return this.trim();
	}
}

export default Cache2D;