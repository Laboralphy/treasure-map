import HeightMapPerlinizer from "../../HeightMapPerlinizer";
import * as Tools2D from "../../../tools2d";
import * as LinearInterpolator from "../../../linear-interpolator";
import {mod} from "../../../r-mod";

let hmp;


/**
 * Des îles plutot circulaire avec une montagne au centre
 * @param cellSize {number}
 * @param tileSize {number}
 */
function segmentOnePeak(cellSize, tileSize) {
    return [
        {
            x: 0,
            y: 0
        }, {
            x: tileSize * 0.25,
            y: 0.2
        }, {
            x: tileSize * 0.75,
            y: 0.4
        }, {
            x: tileSize * cellSize * 0.5,
            y: 1
        }, {
            x: tileSize * cellSize - tileSize * 0.75,
            y: 0.4
        }, {
            x: tileSize * cellSize - tileSize * 0.25,
            y: 0.2
        }, {
            x: tileSize * cellSize,
            y: 0
        }
    ];
}

function segmentOnePeakInf(cellSize, tileSize) {
    return [
        {
            x: 0,
            y: 0
        }, {
            x: tileSize * 0.25,
            y: 0.2
        }, {
            x: tileSize * 0.75,
            y: 0.4
        }, {
            x: tileSize * cellSize * 0.3,
            y: 1
        }, {
            x: tileSize * cellSize * 0.5,
            y: 0.6
        }, {
            x: tileSize * cellSize * 0.5 + 1,
            y: 0.2
        }, {
            x: tileSize * cellSize * 0.4 + 1,
            y: 0
        }
    ];
}

function segmentTwoPeaks(cellSize, tileSize) {
    return [
        {
            x: 0,
            y: 0
        }, {
            x: tileSize * 0.25,
            y: 0.2
        }, {
            x: tileSize * 0.75,
            y: 0.4
        }, {
            x: tileSize * cellSize * 0.25,
            y: 1
        }, {
            x: tileSize * cellSize * 0.5,
            y: 0.5
        }, {
            x: tileSize * cellSize * 0.75,
            y: 1
        }, {
            x: tileSize * cellSize - tileSize * 0.75,
            y: 0.4
        }, {
            x: tileSize * cellSize - tileSize * 0.25,
            y: 0.2
        }, {
            x: tileSize * cellSize,
            y: 0
        }
    ];
}

function segmentOneValeOneLake(cellSize, tileSize) {
    return [
        {
            x: 0,
            y: 0
        }, {
            x: tileSize * 0.25,
            y: 0.2
        }, {
            x: tileSize * 0.75,
            y: 0.4
        }, {
            x: tileSize * cellSize * 0.2,
            y: 0.7
        }, {
            x: tileSize * cellSize * 0.25,
            y: 0.5
        }, {
            x: tileSize * cellSize * 0.3,
            y: 1
        }, {
            x: tileSize * cellSize * 0.5,
            y: 0.65
        }, {
            x: tileSize * cellSize * 0.75,
            y: 0.5
        }, {
            x: tileSize * cellSize - tileSize * 0.75,
            y: 0.4
        }, {
            x: tileSize * cellSize - tileSize * 0.25,
            y: 0.2
        }, {
            x: tileSize * cellSize,
            y: 0
        }
    ];
}

function segmentLargeVale(cellSize, tileSize) {
    return [
        {
            x: 0,
            y: 0
        }, {
            x: tileSize * 0.25,
            y: 0.2
        }, {
            x: tileSize * 0.75,
            y: 0.4
        }, {
            x: tileSize * cellSize * 0.2,
            y: 0.75
        }, {
            x: tileSize * cellSize * 0.3,
            y: 0.75
        }, {
            x: tileSize * cellSize * 0.4,
            y: 0.9
        }, {
            x: tileSize * cellSize * 0.5,
            y: 0.5
        }, {
            x: tileSize * cellSize * 0.6,
            y: 0.75
        }, {
            x: tileSize * cellSize * 0.7,
            y: 0.4
        }, {
            x: tileSize * cellSize * 0.8,
            y: 0.75
        }, {
            x: tileSize * cellSize - tileSize * 0.75,
            y: 0.4
        }, {
            x: tileSize * cellSize - tileSize * 0.25,
            y: 0.2
        }, {
            x: tileSize * cellSize,
            y: 0
        }
    ];
}

function computeSegments(cellSize, tileSize) {
    return {
        x: segmentOnePeak(cellSize, tileSize),
        y: segmentOnePeak(cellSize, tileSize)
    };
}

function computeTile(xTile, yTile, tileSize) {
    const CELL_SIZE = 16;
    const aSegments = computeSegments(CELL_SIZE, tileSize);
    const noise = (xg, yg, aNoise) => {
        const xt = mod(xg, CELL_SIZE) * tileSize;
        const yt = mod(yg, CELL_SIZE) * tileSize;
        return Tools2D.map2DFloat32(aNoise, (x, y, cell) => {
            const xtt = xt + x;
            const ytt = yt + y;
            const h1 = LinearInterpolator.interpolate(xtt, aSegments.x);
            const h2 = LinearInterpolator.interpolate(ytt, aSegments.y);
            const result = h1 * h2 * (1 + cell * 0);
            return Math.min(1, Math.max(0, result));
        });
    };
    hmp.size = tileSize;
    return hmp.generate(xTile, yTile, { noise });
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
function main(heightMap, x, y, tileSize, seed) {
    if (!hmp) {
        hmp = new HeightMapPerlinizer(tileSize, 0);
    }
    const hm = computeTile(x, y, tileSize);
    for (let iy = 0; iy < tileSize; ++iy) {
        const row = heightMap[iy];
        const hrow = hm[iy];
        for (let ix = 0; ix < tileSize; ++ix) {
            row[ix] = hrow[ix];
        }
    }
}

export default main;