import Game from './Game';
import parseSearch from "./libs/parse-search";
import WorldMap from './WorldMap';

async function drawMap(
    {
        size = 16,
        x = 0,
        y = 0,
        seed = 0
    }) {
	const wm = new WorldMap();
	await wm.initCartography(0, {
	    tileSize: parseInt(size),
        seed: parseInt(seed)
    });
	wm.installMapCanvas();
	window.wm = wm;

	return wm.render(x, y);
}

async function runGame() {
    const g = new Game();
    await g.init();
    window.game = g;
    window.addEventListener('resize', windowResize);
    windowResize();
    g.start();
}

function main() {
    const params = parseSearch();
    if (params.map == 1) {
      return drawMap(params);
    } else {
        return runGame()
    }
}

function windowResize() {
    let oCanvas = document.querySelector('canvas.world');
    let hWin = window.innerHeight;
    let wWin = window.innerWidth;
    oCanvas.height = hWin - 96;
    oCanvas.width = wWin - 64;
    game.canvas(oCanvas);
}

window.addEventListener('load', main);
window.addEventListener('unload', () => ('game' in window) && game.cartography && game.cartography.terminate());
