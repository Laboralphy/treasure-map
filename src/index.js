import Game from './Game';

async function main() {
	const g = new Game();
	await g.init();
	window.game = g;
	window.addEventListener('resize', windowResize);
	windowResize();
	g.start();
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
window.addEventListener('unload', () => game.cartography && game.cartography.terminate());
