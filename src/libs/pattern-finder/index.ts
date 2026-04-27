function checkPatternAt(xPM: number, yPM: number, physicMap: number[][], pattern: number[][]): boolean {
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

function findPatterns(physicMap: number[][], pattern: number[][]): Array<{ x: number; y: number }> {
    const aPatterns: Array<{ x: number; y: number }> = [];
    const firstPatternCell = pattern[0][0];
    const ymax = physicMap.length - pattern.length + 1;
    const xmax = physicMap[0].length - pattern[0].length + 1;
    for (let y = 0; y < ymax; ++y) {
        const row = physicMap[y];
        for (let x = 0; x < xmax; ++x) {
            const cell = row[x];
            if (cell === firstPatternCell && checkPatternAt(x, y, physicMap, pattern)) {
                aPatterns.push({ x, y });
            }
        }
    }
    return aPatterns;
}

export { checkPatternAt, findPatterns };
