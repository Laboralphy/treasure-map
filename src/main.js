import Game from './Game';

let game;

function main5() {
	game = new Game();
	game.init().then(resolve => {
		window.game = game;
		window.addEventListener('resize', windowResize);
		windowResize();
		game.start();
	});
}

function windowResize() {
	let oCanvas = document.querySelector('canvas.world');
	let hWin = window.innerHeight;
	let wWin = window.innerWidth;
	oCanvas.height = hWin - 96;
	oCanvas.width = wWin - 64;
	game.canvas(oCanvas);
}

window.addEventListener('load', main5);
window.addEventListener('unload', () => game.carto && game.carto.terminateService());
