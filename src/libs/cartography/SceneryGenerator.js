import * as pf from 'libs/pattern-finder';
import Names from 'libs/names';
import pcghash from "libs/pcghash";
import * as Tools2D from 'libs/tools2d'

const PHYS_WATER = 11;
const PHYS_SHORE = 12;
const PHYS_COAST = 22;
const PHYS_PLAIN = 23;
const PHYS_FOREST = 33;
const PHYS_PEAK = 55;

const PATTERN_CHAR_MATCHER = {
    '.': PHYS_WATER,
    '*': PHYS_SHORE,
    '-': PHYS_COAST,
    'w': PHYS_PLAIN,
    'f': PHYS_FOREST,
    'M': PHYS_PEAK
};

function getMatcher(sChar) {
    if (sChar in PATTERN_CHAR_MATCHER) {
        return PATTERN_CHAR_MATCHER[sChar];
    } else {
        throw new Error('this pattern char does not exist : "' + sChar + '"');
    }
}

function convertCharPattern(aCharPattern) {
    return aCharPattern
        .map(row => new Uint8Array(
            row
                .split('')
                .map(getMatcher)
        ));
}

const PATTERN_BASE = {
    port_north: convertCharPattern([
        '....',
        '****',
        '----',
        '----'
    ]),
    port_north_east: convertCharPattern([
        '**..',
        '-**.',
        '--**',
        '---*'
    ]),
    port_south_west: convertCharPattern([
        '----',
        '----',
        '*---',
        '**--'
    ])
}

const PATTERNS = {
    port: [
        {
            name: 'size4east',
            dir: 'e',
            pattern: Tools2D.rotate(PATTERN_BASE.port_north)
        }, {
            name: 'size4west',
            dir: 'w',
            pattern: Tools2D.rotate(PATTERN_BASE.port_north, true)
        }, {
            name: 'size4south',
            dir: 's',
            pattern: Tools2D.rotateTwice(PATTERN_BASE.port_north)
        }, {
            name: 'size4north',
            dir: 'n',
            pattern: PATTERN_BASE.port_north
        }, {
            name: 'size4northeast',
            dir: 'n',
            pattern: PATTERN_BASE.port_north_east
        }, {
            name: 'size4northwest',
            dir: 'n',
            pattern: Tools2D.rotate(PATTERN_BASE.port_north_east, true)
        }, {
            name: 'size4southwest',
            dir: 'w',
            pattern: PATTERN_BASE.port_south_west
        }, {
            name: 'size4southeast',
            dir: 'e',
            pattern: Tools2D.rotate(PATTERN_BASE.port_south_west, true)
        }
    ]
};


class SceneryGenerator {

    _suitablePosition(nSize, {x, y}) {
        return x > 0 && y > 0 && x < nSize - 4 && y < nSize - 4;
    }

    generatePort(seed, x, y, physicMap) {
        let aPatterns;
        let aResults = [];
        const nSize = physicMap.length;

        PATTERNS.port.forEach(({name, dir, pattern}) => {
            aPatterns = pf
                .findPatterns(physicMap, pattern)
                .filter(p => this._suitablePosition(nSize, p));
            if (aPatterns.length > 0) {
                const p = aPatterns[seed % aPatterns.length];
                aResults.push({
                    type: 'city',
                    x: p.x,
                    y: p.y,
                    dir,
                    width: 4,
                    height: 4,
                    seed,
                    name: ''
                })
            }
        });
        if (aResults.length > 0) {
            const r = aResults[seed % aResults.length];
            r.name = Names.generateTownName(seed);
            return r;
        } else {
            return null;
        }

    }

    generate(seed, x, y, physicMap) {
        const a = [];
        a.push(this.generatePort(pcghash(x, y, seed), x, y, physicMap));
        return a.filter(x => !!x);
    }
}

export default SceneryGenerator;