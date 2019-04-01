import o876 from './o876'
import Indicators from './Indicators';
import Game from './Game';


/*
function main4() {
	window.addEventListener('resize', windowResize);
	windowResize();
	pwrunner = this.world = new Cartography({
		cellSize: 256,
		hexSize: 16,
		scale: 2,
		seed: 0.111,
		preload: 1,
		drawGrid: true,
		drawCoords: true,
		service: '../build/worker.js',
		progress: Indicators.progress,
		verbose: false
	});

	window.pwrunner = pwrunner;
	X = 27 * 256;
	Y = 0;

	let cvs = document.querySelector('.world');
	let oImage;
	loadImage('images/sprites/balloon_0.png').then(img => {
		oImage = img;
		return pwrunner.preloadTiles(X, Y, cvs.width, cvs.height);
	}).then(() => {
		setInterval(() => {
			Y++;
			pwrunner.view(oCvsOffscreen, X, Y);
			oCvsOffscreen.getContext('2d').drawImage(oImage, (cvs.width - oImage.naturalWidth) >> 1, (cvs.height - oImage.naturalHeight) >> 1);
			requestAnimationFrame(() => {
				cvs.getContext('2d').drawImage(oCvsOffscreen, 0, 0);
			});
		}, 32);
	});
}*/

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
window.addEventListener('unload', () => game.carto.terminateService());
