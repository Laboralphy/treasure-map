import HeightMapPerlinizer from "../../HeightMapPerlinizer";
import * as Tools2D from "../../../tools2d";
import * as LinearInterpolator from "../../../linear-interpolator";
import {mod} from "../../../r-mod";
import Cache2D from "../../../cache2d";
import Geometry from "../../../geometry";

let hmpCont, hmpTile;
const oCache = {
    cont: new Cache2D({ size: 36 })
};

const CONTINENT_SIZE = 32;

function computeContinent(xCont, yCont) {
    let oCont = oCache.cont.load(xCont, yCont);
    if (oCont) {
        return oCont;
    }
    oCont = {
        x: xCont,
        y: yCont,
        heightMap: null
    };
    oCont.heightMap = hmpCont.generate(xCont, yCont, {});
    oCache.cont.store(xCont, yCont, oCont);
    return oCont;
}


function cellFilterMinMax(base, value) {
    if (base < 0.45) {
        return base * value;
    } else {
        return Math.max(0, Math.min(0.999, Math.sqrt(value + base - 0.45)));
    }
}

function computeTile(xTile, yTile) {
    /*
    const xCont = Math.floor(xTile / CONTINENT_SIZE);
    const yCont = Math.floor(yTile / CONTINENT_SIZE);
    const oContinent = computeContinent(xCont, yCont);
    const aContinentalNoise = oContinent.heightMap;
    if ( aContinentalNoise.length !== CONTINENT_SIZE) {
        throw new Error('continental heightmap noise size is incorrect : ' + oContinent.heightMap.length + ' - expected : ' + CONTINENT_SIZE);
    }
    return hmpTile.generate(xTile, yTile, {
        noise: (x, y, aNoise) => {
            return Tools2D.map2DFloat32(aNoise, (xg, yg, cell) => {
                const xTileInCont = mod(xTile, CONTINENT_SIZE);
                const yTileInCont = mod(yTile, CONTINENT_SIZE);
                const base = 0.4; //ContinentalNoise[yTileInCont][xTileInCont];
                return cell; //cellFilterMinMax(base, cell);
            });
        }
    });

     */
    const xCont = Math.floor(xTile / CONTINENT_SIZE);
    const yCont = Math.floor(yTile / CONTINENT_SIZE);
    const xContMod = mod(xTile, CONTINENT_SIZE);
    const yContMod = mod(yTile, CONTINENT_SIZE);
    const c2 = CONTINENT_SIZE / 2;
    const d = Geometry.Helper.distance(xContMod, yContMod, c2, c2);
    const fDistanceInv = 1 - Math.sqrt(d / (c2 * 1.415)); // max distance possible is CONTINENTAL _SIZE * sqrt(2)
    return hmpTile.generate(xTile, yTile, {
        noise: (x, y, aNoise) => {
            return Tools2D.map2DFloat32(aNoise, (xg, yg, cell) => {
                //return Math.max(0, Math.min(1, (1 - fDistance) * (cell * 0.25 + 0.75)));
                return fDistanceInv;
            });
        }
    });
}

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
    if (!hmpCont) {
        hmpCont = new HeightMapPerlinizer(CONTINENT_SIZE, seed);
    }
    if (!hmpTile) {
        hmpTile = new HeightMapPerlinizer(tileSize, seed);
    }
    const hm = computeTile(x, y, tileSize);
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