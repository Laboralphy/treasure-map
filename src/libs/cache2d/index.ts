interface CacheEntry<T> {
    x: number;
    y: number;
    payload: T;
}

class Cache2D<T = unknown> {
    private _cache: CacheEntry<T>[];
    private _index: Record<string, Record<string, T>>;
    private _cacheSize: number;
    private _xLastRequest: number | null;
    private _yLastRequest: number | null;
    private _oLastRequest: T | null;

    constructor(d?: { size?: number } | null) {
        let size = 64;
        if (d) {
            size = d.size ?? size;
        }
        this._cache = [];
        this._index = {};
        this._cacheSize = size;
        this._xLastRequest = null;
        this._yLastRequest = null;
        this._oLastRequest = null;
    }

    get size(): number {
        return this._cacheSize;
    }

    set size(v: number) {
        this.clear();
        this._cacheSize = v;
    }

    clear(): void {
        this._cache = [];
    }

    load(x: number, y: number): T | null {
        return this._getMetaData(x, y);
    }

    store(x: number, y: number, payload: T): CacheEntry<T>[] {
        const md = this._getMetaData(x, y);
        if (!md) {
            this._add(x, y, payload);
            this._cache.push({ x, y, payload });
        }
        return this._trim();
    }

    private _add(x: number, y: number, payload: T): void {
        const sx = parseInt(x.toString()).toString();
        const sy = parseInt(y.toString()).toString();
        if (!(sy in this._index)) {
            this._index[sy] = {};
        }
        this._index[sy][sx] = payload;
    }

    private _find(x: number, y: number): T | null {
        const sx = parseInt(x.toString()).toString();
        const sy = parseInt(y.toString()).toString();
        if (!(sy in this._index)) {
            return null;
        }
        const oRow = this._index[sy];
        if (!(sx in oRow)) {
            return null;
        }
        return oRow[sx];
    }

    private _remove(x: number, y: number): void {
        const sx = parseInt(x.toString()).toString();
        const sy = parseInt(y.toString()).toString();
        if (!(sy in this._index)) {
            return;
        }
        const oRow = this._index[sy];
        if (sx in oRow) {
            delete oRow[sx];
        }
        if (Object.keys(oRow).length === 0) {
            delete this._index[sy];
        }
    }

    private _trim(): CacheEntry<T>[] {
        const aDelete: CacheEntry<T>[] = [];
        while (this._cache.length > this._cacheSize) {
            const d = this._cache.shift()!;
            aDelete.push(d);
            this._remove(d.x, d.y);
        }
        return aDelete;
    }

    private _getMetaData(x: number, y: number): T | null {
        if (this._xLastRequest === x && this._yLastRequest === y) {
            return this._oLastRequest;
        }
        const md = this._find(x, y);
        if (md) {
            this._xLastRequest = x;
            this._yLastRequest = y;
            this._oLastRequest = md;
        }
        return md;
    }
}

export default Cache2D;
