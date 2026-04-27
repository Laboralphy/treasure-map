import { findPatterns } from '../pattern-finder';
import { generateTownName } from '../names';
import pcghash from '../pcghash';
import { rotate, rotateTwice } from '../tools2d';

const PHYS_WATER = 11;
const PHYS_SHORE = 12;
const PHYS_COAST = 22;
const PHYS_PLAIN = 23;
const PHYS_FOREST = 33;
const PHYS_PEAK = 55;

const PATTERN_CHAR_MATCHER: Record<string, number> = {
    '.': PHYS_WATER,
    '*': PHYS_SHORE,
    '-': PHYS_COAST,
    'w': PHYS_PLAIN,
    'f': PHYS_FOREST,
    'M': PHYS_PEAK
};

const BASE_PATTERNS: Record<string, string[]> = {
    port_north: ['....', '****', '----', '----'],
    port_north_east: ['**..', '-**.', '--**', '---*'],
    port_south_west: ['----', '*---', '**--', '.**-']
};

interface PatternEntry {
    name: string;
    dir: string;
    pattern: Uint8Array[];
}

export interface SceneryItem {
    type: string;
    x: number;
    y: number;
    dir: string;
    width: number;
    height: number;
    seed: number;
    name: string;
}

class SceneryGenerator {
    PATTERNS: { port: PatternEntry[] };

    constructor() {
        this.PATTERNS = this.buildPatterns();
    }

    static getMatcher(sChar: string): number {
        if (sChar in PATTERN_CHAR_MATCHER) {
            return PATTERN_CHAR_MATCHER[sChar];
        } else {
            throw new Error('this pattern char does not exist : "' + sChar + '"');
        }
    }

    convertCharPattern(aCharPattern: string[]): Uint8Array[] {
        return aCharPattern.map(row => new Uint8Array(row.split('').map(SceneryGenerator.getMatcher)));
    }

    buildPatterns(): { port: PatternEntry[] } {
        const oBasePatterns: Record<string, Uint8Array[]> = {};
        for (const p in BASE_PATTERNS) {
            oBasePatterns[p] = this.convertCharPattern(BASE_PATTERNS[p]);
        }
        return {
            port: [
                { name: 'size4east',      dir: 'e', pattern: rotate(oBasePatterns.port_north) as Uint8Array[] },
                { name: 'size4west',      dir: 'w', pattern: rotate(oBasePatterns.port_north, true) as Uint8Array[] },
                { name: 'size4south',     dir: 's', pattern: rotateTwice(oBasePatterns.port_north) as Uint8Array[] },
                { name: 'size4north',     dir: 'n', pattern: oBasePatterns.port_north },
                { name: 'size4northeast', dir: 'n', pattern: oBasePatterns.port_north_east },
                { name: 'size4northwest', dir: 'n', pattern: rotate(oBasePatterns.port_north_east, true) as Uint8Array[] },
                { name: 'size4southwest', dir: 'w', pattern: oBasePatterns.port_south_west },
                { name: 'size4southeast', dir: 'e', pattern: rotate(oBasePatterns.port_south_west, true) as Uint8Array[] }
            ]
        };
    }

    private _suitablePosition(nSize: number, { x, y }: { x: number; y: number }): boolean {
        return x > 0 && y > 0 && x < nSize - 4 && y < nSize - 4;
    }

    generatePort(seed: number, x: number, y: number, physicMap: Uint8Array[]): SceneryItem | null {
        const aResults: SceneryItem[] = [];
        const nSize = physicMap.length;
        this.PATTERNS.port.forEach(({ dir, pattern }) => {
            const aPatterns = findPatterns(physicMap, pattern)
                .filter(p => this._suitablePosition(nSize, p));
            if (aPatterns.length > 0) {
                const p = aPatterns[seed % aPatterns.length];
                aResults.push({ type: 'city', x: p.x, y: p.y, dir, width: 4, height: 4, seed, name: '' });
            }
        });
        if (aResults.length > 0) {
            const r = aResults[seed % aResults.length];
            r.name = generateTownName(seed);
            return r;
        } else {
            return null;
        }
    }

    generate(seed: number, x: number, y: number, physicMap: Uint8Array[]): SceneryItem[] {
        const a: Array<SceneryItem | null> = [];
        a.push(this.generatePort(pcghash(x, y, seed), x, y, physicMap));
        return a.filter((x): x is SceneryItem => !!x);
    }
}

export default SceneryGenerator;
