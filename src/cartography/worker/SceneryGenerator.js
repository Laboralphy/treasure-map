import * as pf from '../../pattern-finder';
import Names from '../../names';

import {
    PHYS_SHORE,
    PHYS_WATER,
    PHYS_COAST,
    PHYS_FOREST,
    PHYS_PEAK,
    PHYS_PLAIN,

    DIR_EAST,
    DIR_NORTH,
    DIR_SOUTH,
    DIR_WEST
} from '../../consts';

const DIRS = [DIR_EAST, DIR_NORTH, DIR_SOUTH, DIR_WEST];




function rotateMatrix(a) {
    const b = [];
    const h = a.length;
    const w = a[0].length;
    for (let y = 0; y < h; ++y) {
        const irow = a[y];
        const row = [];
        for (let x = 0; x < w; ++x) {
            row[x] = irow[x];
        }
        b[y] = row;
    }
    for (let x = 0; x < w / 2; x++)
    {
        // Consider elements in group of 4 in
        // current square
        for (let y = x; y < w - x - 1; y++)
        {
            // store current cell in temp variable
            const temp = b[x][y];

            // move values from right to top
            b[x][y] = b[y][w - 1 - x];

            // move values from bottom to right
            b[y][w - 1 - x] = b[w - 1 - x][w - 1 - y];

            // move values from left to bottom
            b[w - 1 - x][w - 1 - y] = b[w - 1 - y][x];

            // assign temp to left
            b[w - 1 - y][x] = temp;
        }
    }
    return b;
}


function rotateAll(b) {
    const a = {
        [DIR_EAST]: b
    };
    a[DIR_NORTH] = rotateMatrix(a[DIR_EAST]);
    a[DIR_WEST] = rotateMatrix(a[DIR_NORTH]);
    a[DIR_SOUTH] = rotateMatrix(a[DIR_WEST]);
    return a;
}


const PORTS = {
    t1s4: rotateAll([
        [PHYS_COAST, PHYS_COAST, PHYS_SHORE, PHYS_WATER],
        [PHYS_COAST, PHYS_COAST, PHYS_SHORE, PHYS_WATER],
        [PHYS_COAST, PHYS_COAST, PHYS_SHORE, PHYS_WATER],
        [PHYS_COAST, PHYS_COAST, PHYS_SHORE, PHYS_WATER]
    ]),
    t2s4: rotateAll([
        [PHYS_COAST, PHYS_SHORE, PHYS_SHORE, PHYS_WATER],
        [PHYS_COAST, PHYS_COAST, PHYS_SHORE, PHYS_WATER],
        [PHYS_COAST, PHYS_COAST, PHYS_SHORE, PHYS_WATER],
        [PHYS_COAST, PHYS_SHORE, PHYS_SHORE, PHYS_WATER]
    ])

};


const PATTERNS = {
    PORTS
};

class SceneryGenerator {

    /**
     * recherche un pattern orienté d'une manière spécifiée dans la map physique
     * renvoie une structure copmlete garantissant que le pattern a été trouvé
     * @param physicmap {array} map physique dan slaquell eon recherche le pattern
     * @param seed {number} graine aléatoire
     * @param dir {string} l'orientation du pattern (pour l'inscrire dan sla structure)
     * @param searchedPattern {array} patterns recherché
     * @return {null|{x: *, width: *, name: string, y: *, dir: *, type: string, height: *}}
     */
    seek1Dir(physicmap, seed, dir, searchedPattern) {
        const aFoundPatterns = pf.findPatterns(physicmap, searchedPattern[dir]);
        if (aFoundPatterns.length > 0) {
            const p = aFoundPatterns[seed % aFoundPatterns.length];
            return {
                dir,
                x: p.x,
                y: p.y,
                width: searchedPattern[dir][0].length,
                height: searchedPattern[dir].length,
                name: '',
                type: ''
            };
        }
        return null;
    }

    /**
     * Cherche un pattern dans la map physique, s'il a été trouvé, pushe le resultat dans un tableau
     * sinon ne fait rien
     * @param aResults
     * @param physicmap
     * @param seed
     * @param dir
     * @param rootPattern
     * @return {boolean}
     */
    pushThisDir(aResults, physicmap, seed, dir, rootPattern) {
        const r = this.seek1Dir(physicmap, seed, dir, rootPattern);
        if (!!r) {
            aResults.push(r);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Cherche un patter dans 4 directions
     * @param physicmap
     * @param seed
     * @param rootPattern
     * @return {Array}
     */
    seek4Dirs(physicmap, seed, rootPattern) {
        let aResults = [];
        for (let dir = 0; dir < 4; ++dir) {
            if (this.pushThisDir(aResults, physicmap, seed, DIRS[(seed + dir) % 4], rootPattern)) {
                return aResults;
            }
        }
        return aResults;
    }


    generatePort(seed, x, y, physicmap) {
        for (let port in PATTERNS.PORTS) {
            const aResults = this.seek4Dirs(physicmap, seed, PATTERNS.PORTS[port]);
            if (aResults.length > 0) {
                const r = aResults[seed % aResults.length];
                r.name = Names.generateTownName(seed);
                r.type = 'port/' + port;
                return r;
            }
        }
        return null;
    }


    /**
     * generates sceneries for the cell
     * @param seed {number} random seed to use
     * @param x {number} cell coordinates
     * @param y {number}
     * @param physicmap {array} physical heights
     * @return {*[]}
     *
     * returns this format :
     * [
     *   {
     *       name: string,
     *       type: 'port/xxxx',   (port: [ts14, t2s4]...)
     *   }
     */
    generate(seed, x, y, physicmap) {
        const a = [];
        a.push(this.generatePort(seed, x, y, physicmap));
        return a.filter(x => !!x);
    }
}

export default SceneryGenerator;