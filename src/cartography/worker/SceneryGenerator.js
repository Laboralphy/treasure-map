import * as pf from '../../pattern-finder';
import Names from '../../names';

const PHYS_WATER = 11;
const PHYS_SHORE = 12;
const PHYS_COAST = 22;
const PHYS_PLAIN = 23;
const PHYS_FOREST = 33;
const PHYS_PEAK = 55;


const PATTERNS = {
    port: {
        size4east: [
            [PHYS_COAST, PHYS_COAST, PHYS_SHORE, PHYS_WATER],
            [PHYS_COAST, PHYS_COAST, PHYS_SHORE, PHYS_WATER],
            [PHYS_COAST, PHYS_COAST, PHYS_SHORE, PHYS_WATER],
            [PHYS_COAST, PHYS_COAST, PHYS_SHORE, PHYS_WATER],
        ],

        size4west: [
            [PHYS_WATER, PHYS_SHORE, PHYS_COAST, PHYS_COAST],
            [PHYS_WATER, PHYS_SHORE, PHYS_COAST, PHYS_COAST],
            [PHYS_WATER, PHYS_SHORE, PHYS_COAST, PHYS_COAST],
            [PHYS_WATER, PHYS_SHORE, PHYS_COAST, PHYS_COAST],
        ],

        size4south: [
            [PHYS_COAST, PHYS_COAST, PHYS_COAST, PHYS_COAST],
            [PHYS_COAST, PHYS_COAST, PHYS_COAST, PHYS_COAST],
            [PHYS_SHORE, PHYS_SHORE, PHYS_SHORE, PHYS_SHORE],
            [PHYS_WATER, PHYS_WATER, PHYS_WATER, PHYS_WATER],
        ],

        size4north: [
            [PHYS_WATER, PHYS_WATER, PHYS_WATER, PHYS_WATER],
            [PHYS_SHORE, PHYS_SHORE, PHYS_SHORE, PHYS_SHORE],
            [PHYS_COAST, PHYS_COAST, PHYS_COAST, PHYS_COAST],
            [PHYS_COAST, PHYS_COAST, PHYS_COAST, PHYS_COAST],
        ]
    }
};


class SceneryGenerator {

    loadData() {
        return Names.loadLists({
            towns: '../public/data/towns-fr.txt'
        });
    }

    generatePort(seed, x, y, physicmap) {
        let aPatterns;
        let aResults = [];

        aPatterns = pf.findPatterns(physicmap, PATTERNS.port.size4east);
        if (aPatterns.length > 0) {
            const p = aPatterns[seed % aPatterns.length];
            aResults.push({
                type: 'city',
                x: p.x,
                y: p.y,
                dir: 'e',
                width: 4,
                height: 4,
                name: ''
            });
        }

        aPatterns = pf.findPatterns(physicmap, PATTERNS.port.size4west);
        if (aPatterns.length > 0) {
            const p = aPatterns[seed % aPatterns.length];
            aResults.push({
                type: 'city',
                x: p.x,
                y: p.y,
                dir: 'w',
                width: 4,
                height: 4,
                name: ''
            });
        }

        aPatterns = pf.findPatterns(physicmap, PATTERNS.port.size4south);
        if (aPatterns.length > 0) {
            const p = aPatterns[seed % aPatterns.length];
            aResults.push({
                type: 'city',
                x: p.x,
                y: p.y,
                dir: 's',
                width: 4,
                height: 4,
                name: ''
            });
        }

        aPatterns = pf.findPatterns(physicmap, PATTERNS.port.size4west);
        if (aPatterns.length > 0) {
            const p = aPatterns[seed % aPatterns.length];
            aResults.push({
                type: 'city',
                x: p.x,
                y: p.y,
                dir: 'n',
                width: 4,
                height: 4,
                name: ''
            });
        }

        if (aResults.length > 0) {
            const r = aResults[seed % aResults.length];
            r.name = Names.generateTownName(seed);
            return r;
        } else {
            return null;
        }
    }


    generate(seed, x, y, physicmap) {
        const a = [];
        a.push(this.generatePort(seed, x, y, physicmap));
        return a.filter(x => !!x);
    }
}

export default SceneryGenerator;