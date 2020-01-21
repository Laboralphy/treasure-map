import Cartography from "./cartography";
import o876 from './o876';
import Geometry from './geometry';
const Vector = Geometry.Vector;

async function main() {
    const carto = new Cartography({
        cellSize: 256,
        hexSize: 16,
        hexSpacing: 7,
        scale: 32,
        seed: 0.111,
        preload: 1,
        drawGrid: true,
        drawCoords: true,
        service: '../build/worker.js',
        progress: function(n) { document.querySelector('progress').value = n; },
        verbose: true
    });

    await carto.viewMap(
        document.querySelector('canvas.world'),
        -128, -96,
        256, 192,
        4
    );

}

window.addEventListener('load', main);
