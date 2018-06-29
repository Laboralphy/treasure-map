/**
 * Indexe une carte 2D pour déterminer le plus grand espace possible pour une zone carrée dont tous les élément sont
 * d'une valeur donnée.
 */


class PatternIndexer {

	constructor() {
		this._map = null;
		this._values = null;
	}

	setMap(m, cb) {
		this._map = m.map((row, y) => row.map((cell, x) => cb(cell, x, y)));
	}

	populate() {
		this._values = this._map.map(row => row.map(cell => cell ? 1 : 0));
	}

	compute() {
		let iIter = 100;
		let bChanged = false;
		do {
			bChanged = false;
			let h = this._values.length - 1;
			for (let y = 0; y < h; ++y) {
				let w = this._values[y].length - 1;
				for (let x = 0; x < w; ++x) {
					let xy = this._valuesLABY[y][x];
					let x1y = this._values[y][x + 1];
					let xy1 = this._values[y + 1][x];
					let x1y1 = this._values[y + 1][x + 1];
					if (xy > 0) {
						let nMin = Math.min(x1y, xy1, x1y1);
						if (xy <= nMin) {
							this._values[y][x] = nMin + 1;
							bChanged = true;
						}
					}
				}
			}
			--iIter;
		} while (bChanged && iIter > 0);
	}
}