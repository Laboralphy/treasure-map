import osge from './osge';

class Game {

	constructor() {
		this.sprites = [];
		this.view = new osge.View();
	}

	/**
	 * chargement asynchrone d'une image
	 * @param sImage {string} url de l'image
	 * @returns {Promise<Image>}
	 */
	async loadImage(sImage) {
		return new Promise(resolve => {
			let oImage = new Image();
			oImage.addEventListener('load', event => resolve(oImage));
			oImage.setAttribute('src', sImage);
		});
	}


	async init() {
		// ballon
		let oBalloonSprite = new osge.Sprite();
		oBalloonSprite.image = await this.loadImage('images/sprites/balloon_0.png');
		oBalloonSprite.frameHeight = oBalloonSprite.image.naturalHeight;
		oBalloonSprite.frameWidth = oBalloonSprite.image.naturalWidth;

		this.sprites.push(oBalloonSprite);
	}

	update() {

	}


	render() {

	}

}