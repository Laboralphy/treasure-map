import o876 from './o876'
import PirateWorld from './PirateWorld';
import Indicators from './Indicators';
const CanvasHelper = o876.CanvasHelper;


let oCvsOffscreen;


let pwrunner, X, Y;




function main4() {
	window.addEventListener('resize', windowResize);
	windowResize();
	pwrunner = this.world = new PirateWorld({
		cellSize: 256,
		hexSize: 16,
		scale: 2,
		seed: 0.111,
		preload: 1,
		drawGrid: true,
		drawCoords: true,
		service: '../build/worker.js',
		progress: Indicators.progress,
		verbose: true
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
}

function windowResize() {
	let oCanvas = document.querySelector('canvas.world');
	let hWin = window.innerHeight;
	let wWin = window.innerWidth;
	oCanvas.height = hWin - 64;
	oCanvas.width = wWin - 64;
	oCvsOffscreen = o876.CanvasHelper.clone(oCanvas);
}

window.addEventListener('load', main4);
