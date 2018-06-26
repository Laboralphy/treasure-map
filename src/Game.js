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
        let oBlimpSprite = new osge.Sprite();
		oBlimpSprite.image = await this.loadImage('images/sprites/blimp_0.png');
        oBlimpSprite.frameHeight = oBlimpSprite.image.naturalHeight;
        oBlimpSprite.frameWidth = oBlimpSprite.image.naturalWidth / 16;
        oBlimpSprite.reference.x = oBlimpSprite.frameWidth >> 1;
        oBlimpSprite.reference.y = oBlimpSprite.frameHeight - 32;
        this.sprites.push(oBlimpSprite);
        this.state.player = {
            id: 1,
            sprite: oBlimpSprite,
            thinker: THINKERS.blimp,
            data: {
                angle: 0,                               // angle de cap
				angleSpeed: 0.05,
				position: new Vector(0, 0),             // position actuelle
				destination: new Vector(0, 0),          // position vers laquelle on se dirige
                enginePower: 0.1,                       // inc/dec de la vitesse du moteur
				speed: 0,                               // vitesse actuelle
                maxSpeed: 2                    // vitesse max
            }
        };
		this.state.entities.push(this.state.player);
        let sl = new SpriteLayer();
        sl.sprites.push(oBlimpSprite);
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