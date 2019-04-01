import Cartography from "./cartography";
import o876 from './o876';
const Vector = o876.geometry.Vector;

async function main() {
    const carto = new Cartography({
        cellSize: 256,
        hexSize: 16,
        hexSpacing: 3,
        scale: 2,
        seed: 0.111,
        preload: 1,
        drawGrid: true,
        drawCoords: true,
        service: '../build/worker.js',
        progress: function(n) { document.querySelector('progress').value = n; },
        verbose: true
    });

    await carto.view(document.querySelector('canvas.world'), new Vector(0, 0), true);

}

window.addEventListener('load', main);
