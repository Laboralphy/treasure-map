import Game from './Game';
import parseSearch from "./libs/parse-search";
import CanvasHelper from "./libs/canvas-helper";
import Cartography from './libs/cartography'
import DATA from './data'
import Indicators from './Indicators'


function initCartography(seed) {
  return new Cartography({
    seed,
    preload: 1,
    palette: DATA.palette,
    cellSize: 10,
    tileSize: 64,
    worker: '../dist/worker.js',
		workerCount: 1,
    brushes: DATA.brushes,
    names: DATA.towns_fr,
    physicGridSize: 16,
    scale: 2,
    progress: Indicators.progress
  });
}


async function drawMap() {
	const g = new Game();
	window.game = g;
  const c = initCartography(0);
  const c2 = initCartography(0);
  const c3 = initCartography(0);
  const c4 = initCartography(0);
	await c.start();
  await c2.start();
  await c3.start();
  await c4.start();

	const mapParams = {
		rect: [
			{
				x: -24,
				y: -24
			},
			{
				x: 24,
				y: 24
			}
		],
		cellSize: 16
	};

	const [r0, r1] = mapParams.rect;
	const w = r1.x - r0.x + 1;
	const h = r1.y - r0.y + 1;
	document.querySelector('canvas.world').style.display = 'none';
	const elemMapContainer = document.querySelector('div.world-container');
	const oCanvas = CanvasHelper.createCanvas(w * mapParams.cellSize, h * mapParams.cellSize);
	const oContext = oCanvas.getContext('2d');
	elemMapContainer.appendChild(oCanvas);
	let yMap = 0;
	for (let y = r0.y; y <= r1.y; ++y) {
		let xMap = 0;
		for (let x = r0.x; x <= r1.x; x += 4) {
			const [oMap1, oMap2, oMap3, oMap4] = await Promise.all([
				c.fetchTile(x, y),
        c2.fetchTile(x + 1, y),
        c3.fetchTile(x + 2, y),
        c4.fetchTile(x + 3, y),
				]
			);
			const oMapCvs1 = oMap1.canvas;
      const oMapCvs2 = oMap2.canvas;
      const oMapCvs3 = oMap3.canvas;
      const oMapCvs4 = oMap4.canvas;
			oContext.drawImage(
				oMapCvs1,
				0,
				0,
				oMapCvs1.width,
				oMapCvs1.height,
				xMap,
				yMap,
				mapParams.cellSize,
				mapParams.cellSize,
			);
			xMap += mapParams.cellSize;
      oContext.drawImage(
        oMapCvs2,
        0,
        0,
        oMapCvs2.width,
        oMapCvs2.height,
        xMap,
        yMap,
        mapParams.cellSize,
        mapParams.cellSize,
      );
      xMap += mapParams.cellSize;
      oContext.drawImage(
        oMapCvs3,
        0,
        0,
        oMapCvs2.width,
        oMapCvs2.height,
        xMap,
        yMap,
        mapParams.cellSize,
        mapParams.cellSize,
      );
      xMap += mapParams.cellSize;
      oContext.drawImage(
        oMapCvs4,
        0,
        0,
        oMapCvs2.width,
        oMapCvs2.height,
        xMap,
        yMap,
        mapParams.cellSize,
        mapParams.cellSize,
      );
      xMap += mapParams.cellSize;
		}
		yMap += mapParams.cellSize;
	}
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
		return drawMap();
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
window.addEventListener('unload', () => game && game.cartography && game.cartography.terminate());
