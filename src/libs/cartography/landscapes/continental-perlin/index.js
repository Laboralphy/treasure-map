import HeightMapPerlinizer from "../../HeightMapPerlinizer";
import * as Tools2D from "../../../tools2d";
import * as LinearInterpolator from "../../../linear-interpolator";
import {mod} from "../../../r-mod";
import Cache2D from "../../../cache2d";
import Geometry from "../../../geometry";

const CONTINENT_SIZE = 16;

class ContinentalPerlinGenerator {
    constructor(nTileSize, nContinentSize, seed) {
        this._oCache = {
            cont: new Cache2D({ size: 36 })
        };
        this._nContinentSize = nContinentSize;
        this._hmpCont = new HeightMapPerlinizer(CONTINENT_SIZE, seed);
        this._hmpTile = new HeightMapPerlinizer(nTileSize, seed);
    }

    computeContinent(xCont, yCont) {
        let oCont = this._oCache.cont.load(xCont, yCont);
        if (oCont) {
            return oCont;
        }
        oCont = {
            x: xCont,
            y: yCont,
            heightMap: null
        };
        oCont.heightMap = this._hmpCont.generate(xCont, yCont, {});
        this._oCache.cont.store(xCont, yCont, oCont);
        return oCont;
    }


    /**
     * source : https://rosettacode.org/wiki/Bilinear_interpolation#Python
     * @param imArr {[]} array2d of values
     * @param posX {number} pixel position in float value
     * @param posY {number} pixel position in float value
     */
    biline(imArr, posX, posY) {
        const modXi = Math.floor(posX);
	    const modYi = Math.floor(posY);
	    const modXf = posX - modXi;
	    const modYf = posY - modYi;
	    const modXiPlusOneLim = Math.min(modXi + 1, imArr.length - 1);
	    const modYiPlusOneLim = Math.min(modYi + 1, imArr[0].length - 1);

        const bl = imArr[modYi][modXi];
        const br = imArr[modYi][modXiPlusOneLim];
        const tl = imArr[modYiPlusOneLim][modXi];
        const tr = imArr[modYiPlusOneLim][modXiPlusOneLim];

        const b = modXf * br + (1 - modXf) * bl;
        const t = modXf * tr + (1 - modXf) * tl;
        return modYf * t + (1 - modYf) * b;
    }

    cellFilterMinMax(base, value) {
        if (base < 0.45) {
            return base * value;
        } else {
            return Math.max(0, Math.min(0.999, Math.sqrt(value + base - 0.45)));
        }
    }

    getBaseElevationCircleIslands(xTile, yTile, nRadius) {
        const nCircleSectorSize = nRadius << 1;
        const xSectorOffset = mod(xTile, nCircleSectorSize);
        const ySectorOffset = mod(yTile, nCircleSectorSize);
        const d = Geometry.Helper.distance(xSectorOffset, ySectorOffset, nRadius, nRadius);
        //return Math.min(1, Math.abs((d - nRadius) / 4));
        return Math.min(1, Math.sqrt(2 * Math.abs((d - nRadius) / nRadius)));
    }

    getContinentCell(xCont, yCont, xCell, yCell) {
        const cs = this._nContinentSize;
        if (xCell < 0) {
            return this.getContinentCell(xCont - 1, yCont, xCell + cs, yCell);
        }
        if (yCell < 0) {
            return this.getContinentCell(xCont, yCont - 1, xCell, yCell + cs);
        }
        if (xCell >= cs) {
            return this.getContinentCell(xCont + 1, yCont, xCell - cs, yCell);
        }
        if (yCell >= cs) {
            return this.getContinentCell(xCont, yCont + 1, xCell, yCell - cs);
        }
        const c = this.computeContinent(xCont, yCont);
        return c.heightMap[yCell][xCell];
    }

    getBaseElevation(xCont, yCont, xContMod, yContMod, xPix, yPix) {
        const a = [];
        for (let iy = -1; iy <= 1; ++iy) {
            const r = [];
            for (let ix = -1; ix <= 1; ++ix) {
                r.push(this.getContinentCell(xCont, yCont, xContMod + ix, yContMod + iy));
            }
            a.push(r);
        }
        const nTileSize = this._hmpTile.size;
        return this.biline(a, (xPix + nTileSize) / nTileSize, (yPix + nTileSize) / nTileSize);
    }

    computeTile(xTile, yTile) {
        return this._hmpTile.generate(xTile, yTile, {
            noise: (xComputedTile, yComputedTile, aNoise) => {
                const cs = this._nContinentSize;
                Tools2D.walk2D(aNoise, (xPix, yPix, cell) => {
                    const xCont = Math.floor(xComputedTile / cs);
                    const yCont = Math.floor(yComputedTile / cs);
                    const xContMod = mod(xComputedTile, cs);
                    const yContMod = mod(yComputedTile, cs);
                    const base0 = this.getBaseElevationCircleIslands(xComputedTile, yComputedTile, this._nContinentSize);
                    const base1 = this.getBaseElevation(xCont, yCont, xContMod, yContMod, xPix, yPix);
                    const base = base0 * base1;
                    return this.cellFilterMinMax(base, cell);
                });
                return aNoise;
            }
        });
    }

}

let cpg;

/**
 * fonction principale
 * @param heightMap {Float32Array[]}
 * @param x {number}
 * @param y {number}
 * @param tileSize {number}
 * @param seed {number}
 * @returns {[]}
 */
function main(heightMap, x, y, tileSize, seed= 0) {
    if (!cpg) {
        cpg = new ContinentalPerlinGenerator(tileSize, CONTINENT_SIZE, seed);
    }
    const hm = cpg.computeTile(x, y);
    if (hm.length !== tileSize) {
        throw new Error('the computed heightmap size is incorrect : ' + hm.length + ' - expected : ' + tileSize);
    }
    for (let iy = 0; iy < tileSize; ++iy) {
        const row = heightMap[iy];
        const hrow = hm[iy];
        for (let ix = 0; ix < tileSize; ++ix) {
            row[ix] = hrow[ix];
        }
    }
}

export default main;