import osge from './osge';
import Cartography from './cartography';
import Indicators from './Indicators';

const SpriteLayer = osge.SpriteLayer;


class Game extends osge.Game {

    constructor() {
        super();
        this.carto = new Cartography({
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
    }

    async init() {
        super.init();
        this.canvas(document.querySelector('.world'));
        // ballon
        let oBalloonSprite = new osge.Sprite();
        oBalloonSprite.image = await this.loadImage('images/sprites/balloon_0.png');
        oBalloonSprite.frameHeight = oBalloonSprite.image.naturalHeight;
        oBalloonSprite.frameWidth = oBalloonSprite.image.naturalWidth;
        oBalloonSprite.reference.x = oBalloonSprite.frameWidth >> 1;
        oBalloonSprite.reference.y = oBalloonSprite.frameHeight - 16;
        this.sprites.push(oBalloonSprite);

        let sl = new SpriteLayer();
        sl.sprites.push(oBalloonSprite);
        this.layers.push(sl);
    }

    update() {
        super.update();
        let v = this.view.points()[0];
		let c = this.renderCanvas;
        this.carto.view(c, v);
    }
}

export default Game;