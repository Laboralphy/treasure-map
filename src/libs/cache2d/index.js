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
    this._index = {};
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

  load(x, y) {
    let o = this._getMetaData(x, y);
    if (o) {
      return o;
    } else {
      return null;
    }
  }

  store(x, y, payload) {
		let c = this._cache;
		let md = this._getMetaData(x, y);
		if (!md) {
			this._add(x, y, payload);
      c.push({
        x, y, payload
      });
		}
		return this._trim();
	}



//               _            _                        _   _               _
//    _ __  _ __(_)_   ____ _| |_ ___   _ __ ___   ___| |_| |__   ___   __| |___
//   | '_ \| '__| \ \ / / _` | __/ _ \ | '_ ` _ \ / _ \ __| '_ \ / _ \ / _` / __|
//   | |_) | |  | |\ V / (_| | ||  __/ | | | | | |  __/ |_| | | | (_) | (_| \__ \
//   | .__/|_|  |_| \_/ \__,_|\__\___| |_| |_| |_|\___|\__|_| |_|\___/ \__,_|___/
//   |_|
//

  /**
	 * ajoute le payload
   * @param x
   * @param y
   * @param payload
   * @private
   */
	_add(x, y, payload) {
    x = parseInt(x).toString();
    y = parseInt(y).toString();
		const oIndex = this._index;
		if (!(y in oIndex)) {
			oIndex[y] = {};
		}
		oIndex[y][x] = payload;
  }

  _find(x, y) {
    x = parseInt(x).toString();
    y = parseInt(y).toString();
    const oIndex = this._index;
    if (!(y in oIndex)) {
      return null;
    }
    const oRow = oIndex[y];
    if (!(x in oRow)) {
      return null;
    }
    return oRow[x];
	}

	_remove(x, y) {
    x = parseInt(x).toString();
    y = parseInt(y).toString();
    const oIndex = this._index;
    if (!(y in oIndex)) {
      return;
    }
    const oRow = oIndex[y];
    if (x in oRow) {
    	delete oRow[x];
		}
		if (Object.keys(oRow).length === 0) {
			delete oIndex[y];
		}
	}

  _trim() {
    let c = this._cache;
    let aDelete = [];
    while (c.length > this._cacheSize) {
    	const d = c.shift();
      aDelete.push(d);
      this._remove(d.x, d.y);
    }
    return aDelete;
  }

  _getMetaData(x, y) {
    if (this._xLastRequest === x && this._yLastRequest === y) {
      return this._oLastRequest;
    }
    const md = this._find(x, y);
    if (!!md) {
      this._xLastRequest = x;
      this._yLastRequest = y;
      this._oLastRequest = md;
    }
    return md;
  }
}

module.exports = Cache2D;