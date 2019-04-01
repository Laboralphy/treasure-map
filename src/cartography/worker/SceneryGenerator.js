const PHYS_WATER = 11;
const PHYS_SHORE = 12;
const PHYS_COAST = 22;
const PHYS_PLAIN = 23;
const PHYS_FOREST = 33;
const PHYS_PEAK = 55;



class SceneryGenerator {

    checkPatternAt(xPM, yPM, physicmap, pattern) {
        const ymax = pattern.length;
        const xmax = pattern[0].length;
        for (let y = 0; y < ymax; ++y) {
            const row = pattern[y];
            for (let x = 0; x < xmax; ++x) {
                if (row[x] !== physicmap[yPM + y][xPM + x]) {
                    return false;
                }
            }
        }
        return true;
    }

    findPatterns(physicmap, pattern) {
        const aPatterns = [];
        const firstPatternCell = pattern[0][0];
        const ymax = physicmap.length - pattern.length + 1;
        const xmax = physicmap[0].length - pattern[0].length + 1;
        for (let y = 0; y < ymax; ++y) {
            const row = physicmap[y];
            for (let x = 0; x < xmax; ++x) {
                const cell = row[x];
                if (cell === firstPatternCell && this.checkPatternAt(x, y, physicmap, pattern)) {
                    aPatterns.push({
                        x, y
                    });
                }
            }
        }
        aPatterns.push({x: 0, y: 0});
        return aPatterns;
    }

    generatePort(seed, x, y, physicmap) {
        // const aPatterns = this.findPatterns(physicmap, [
        //     [PHYS_SHORE, PHYS_SHORE, PHYS_WATER],
        //     [PHYS_SHORE, PHYS_SHORE, PHYS_WATER],
        //     [PHYS_SHORE, PHYS_SHORE, PHYS_WATER]
        // ]);
        const aPatterns = this.findPatterns(physicmap, [
            [PHYS_WATER]
        ]);
        if (aPatterns.length > 0) {
            return {
                type: 'city',
                xmap: aPatterns[0].x,
                ymap: aPatterns[0].y,
                name: 'city-' + Math.random().toString().substr(2, 4)
            };
        } else {
            return null;
        }
    }


    generate(seed, x, y, physicmap) {
        return this.generatePort(seed, x, y, physicmap);
    }
}

export default SceneryGenerator;