import Game from './Game';
import parseSearch from "./libs/parse-search";
import WorldMap from './WorldMap';
import CONTINENT_CONFIG from 'libs/cartography/landscapes/continental-perlin/config.json';

async function drawMap(
    {
        size = "16",
        x = "0",
        y = "0",
        seed = "0",
        width = "1024",
        height = "1024"
    }) {
	const wm = new WorldMap();
	await wm.initCartography(parseInt(seed), {
	    tileSize: parseInt(size),
        seed: parseInt(seed),
        drawFadeIn: false
    });
	wm.installMapCanvas({
        width: parseInt(width),
        height: parseInt(height),
    });
	window.wm = wm;
	return wm.render(parseInt(x), parseInt(y));
}

async function drawContinent(
    {
        size = "16",
        x = "0",
        y = "0",
        seed = "0"
    }) {
    const css = size * CONTINENT_CONFIG.continentSize << 1;
    return drawMap({
        size,
        x: x * css + (css >> 1),
        y: y * css + (css >> 1),
        seed,
        width: css,
        height: css
    })
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
    switch (params.mode) {
        case 'map':
            return drawMap(params);

        case 'cont':
            return drawContinent(params);

        default:
            return runGame();
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
