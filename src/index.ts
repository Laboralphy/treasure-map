import Game from './Game';
import parseSearch from './libs/parse-search';
import WorldMap from './WorldMap';
import CONTINENT_CONFIG from 'libs/cartography/landscapes/continental-perlin/config.json';

declare global {
    interface Window {
        game: Game;
        wm: WorldMap;
    }
}

async function drawMap({
    size = '16',
    x = '0',
    y = '0',
    seed = '0',
    width = '1024',
    height = '1024'
}: Record<string, string>): Promise<void> {
    const wm = new WorldMap();
    await wm.initCartography(parseInt(seed), {
        tileSize: parseInt(size),
        seed: parseInt(seed),
        drawFadeIn: false
    });
    wm.installMapCanvas({ width: parseInt(width), height: parseInt(height) });
    window.wm = wm;
    return wm.render(parseInt(x), parseInt(y)).then(() => undefined);
}

async function drawContinent({
    size = '16',
    x = '0',
    y = '0',
    seed = '0'
}: Record<string, string>): Promise<void> {
    const css = parseInt(size) * (CONTINENT_CONFIG as { continentSize: number }).continentSize << 1;
    return drawMap({
        size,
        x: String(parseInt(x) * css + (css >> 1)),
        y: String(parseInt(y) * css + (css >> 1)),
        seed,
        width: String(css),
        height: String(css)
    });
}

async function runGame(): Promise<void> {
    const g = new Game();
    await g.init();
    window.game = g;
    window.addEventListener('resize', windowResize);
    windowResize();
    g.start();
}

function main(): void {
    const params = parseSearch() as Record<string, string>;
    switch (params.mode) {
        case 'map':
            drawMap(params);
            break;
        case 'cont':
            drawContinent(params);
            break;
        default:
            runGame();
    }
}

function windowResize(): void {
    const oCanvas = document.querySelector('canvas.world') as HTMLCanvasElement;
    oCanvas.height = window.innerHeight - 96;
    oCanvas.width = window.innerWidth - 64;
    window.game.canvas(oCanvas);
}

window.addEventListener('load', main);
window.addEventListener('unload', () => {
    if ('game' in window && window.game.cartography) {
        window.game.cartography.terminate();
    }
});
