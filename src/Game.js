import o876 from './o876';
import osge from './osge';
import Cartography from './cartography';
import Indicators from './Indicators';
import THINKERS from './thinkers';

const Vector = o876.geometry.Vector;
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
        this.state = {
            entities: [],
            player: null,
            view: new Vector()
        };
    }

    onClick(event) {
        let cvs = this.screenCanvas;
        let click = this.mouse.add(this.carto._view);
		this.state.player.data.destination.set(click);
    }

    processThinker(entity) {
        entity.thinker(entity);
    }

    async init() {
        super.init();
        let oCanvas = document.querySelector('.world');
		this.domevents.on(oCanvas, 'click', event => this.onClick(event));
        this.canvas(oCanvas);
        // ballon
        let oBalloonSprite = new osge.Sprite();
        oBalloonSprite.image = await this.loadImage('images/sprites/balloon_0.png');
        oBalloonSprite.frameHeight = oBalloonSprite.image.naturalHeight;
        oBalloonSprite.frameWidth = oBalloonSprite.image.naturalWidth;
        oBalloonSprite.reference.x = oBalloonSprite.frameWidth >> 1;
        oBalloonSprite.reference.y = oBalloonSprite.frameHeight - 16;
        this.sprites.push(oBalloonSprite);
        this.state.player = {
            id: 1,
            sprite: oBalloonSprite,
            thinker: THINKERS.balloon,
            data: {
				position: new Vector(0, 0),
				destination: new Vector(0, 0),
				speed: 0,
                acc: 0.1,
                maxSpeed: 2
            }
        };
		this.state.entities.push(this.state.player);

        let sl = new SpriteLayer();
        sl.sprites.push(oBalloonSprite);
        this.layers.push(sl);
    }

    update() {
        super.update();
        this.state.entities.forEach(th => this.processThinker(th));
        this.state.view.set(this.state.player.data.position);
		let c = this.renderCanvas;
        this.carto.view(c, this.state.view);
    }
}

export default Game;