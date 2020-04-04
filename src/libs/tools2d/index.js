/**
 * création rapide d'une matrice 2D
 * @param w {number}
 * @param h {number}
 * @param feed {function}
 * @returns {[]}
 * @private
 */
export function createArray2D (w, h, feed) {
    const a = [];
    for (let y = 0; y < h; ++y) {
        const r = [];
        for (let x = 0; x < w; ++x) {
            r.push(feed(x, y));
        }
        a.push(r);
    }
    return a;
}

/**
 * création rapide d'une matrice 2D constituée de flottant 32
 * @param w {number}
 * @param h {number}
 * @param feed {function}
 * @returns {[]}
 * @private
 */
export function createArray2DFloat32 (w, h, feed) {
    const a = new Array(h);
    for (let y = 0; y < h; ++y) {
        const r = new Float32Array(w);
        for (let x = 0; x < w; ++x) {
            r[x] = feed(x, y);
        }
        a[y] = r;
    }
    return a;
}

/**
 * Parcoure l'integralité du tableau 2D et appelle un callback dont le retour permet de modifier la valeur
 * @param aArray2D {array}
 * @param cb {function}
 */
export function walk2D(aArray2D, cb) {
    for (let y = 0, h = aArray2D.length; y < h; ++y) {
        const row = aArray2D[y];
        for (let x = 0, w = row.length; x < w; ++x) {
            row[x] = cb(x, y, row[x]);
        }
    }
}

/**
 * comme walk2D mais créé un nouveau tableau
 * @param aArray2D
 * @param cb
 */
export function map2D(aArray2D, cb) {
    return aArray2D.map((row, y) => row.map((cell, x) => cb(x, y, cell)));
}

/**
 * comme map2D mais créé un tableau de Uint8Array
 * @param aArray2D
 * @param cb
 */
export function map2DUint8(aArray2D, cb) {
    return aArray2D.map((row, y) => new Uint8Array(row.map((cell, x) => cb(x, y, cell))));
}

/**
 * comme map2D mais créé un tableau de Float32Array
 * @param aArray2D
 * @param cb
 */
export function map2DFloat32(aArray2D, cb) {
    return aArray2D.map((row, y) => new Float32Array(row.map((cell, x) => cb(x, y, cell))));
}
