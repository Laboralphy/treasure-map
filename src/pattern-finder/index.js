

export function checkPatternAt(xPM, yPM, physicmap, pattern) {
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

export function findPatterns(physicmap, pattern) {
    const aPatterns = [];
    const firstPatternCell = pattern[0][0];
    const ymax = physicmap.length - pattern.length + 1;
    const xmax = physicmap[0].length - pattern[0].length + 1;
    for (let y = 0; y < ymax; ++y) {
        const row = physicmap[y];
        for (let x = 0; x < xmax; ++x) {
            const cell = row[x];
            if (cell === firstPatternCell && checkPatternAt(x, y, physicmap, pattern)) {
                aPatterns.push({
                    x, y
                });
            }
        }
    }
    return aPatterns;
}

