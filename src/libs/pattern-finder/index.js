

export function checkPatternAt(xPM, yPM, physicMap, pattern) {
    const ymax = pattern.length;
    const xmax = pattern[0].length;
    for (let y = 0; y < ymax; ++y) {
        const row = pattern[y];
        for (let x = 0; x < xmax; ++x) {
            if (row[x] !== physicMap[yPM + y][xPM + x]) {
                return false;
            }
        }
    }
    return true;
}

export function findPatterns(physicMap, pattern) {
    const aPatterns = [];
    const firstPatternCell = pattern[0][0];
    const ymax = physicMap.length - pattern.length + 1;
    const xmax = physicMap[0].length - pattern[0].length + 1;
    for (let y = 0; y < ymax; ++y) {
        const row = physicMap[y];
        for (let x = 0; x < xmax; ++x) {
            const cell = row[x];
            if (cell === firstPatternCell && checkPatternAt(x, y, physicMap, pattern)) {
                aPatterns.push({
                    x, y
                });
            }
        }
    }
    return aPatterns;
}

