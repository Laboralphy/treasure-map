class Bresenham {
    static line(
        x0: number, y0: number,
        x1: number, y1: number,
        pCallback?: (x: number, y: number, n: number) => boolean | void
    ): boolean {
        x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = (x0 < x1) ? 1 : -1;
        const sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;
        let n = 0;
        while (true) {
            if (pCallback) {
                if (pCallback(x0, y0, n) === false) {
                    return false;
                }
            }
            if (x0 === x1 && y0 === y1) {
                break;
            }
            const e2 = err << 1;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
            ++n;
        }
        return true;
    }
}

export default Bresenham;
