import o876 from './o876';
import osge from './osge';
import Cartography from './cartography';
import Indicators from './Indicators';
import THINKERS from './thinkers';
import DATA from './data';

const Vector = o876.geometry.Vector;
const SpriteLayer = osge.SpriteLayer;


class Game extends osge.Game {
    constructor() {
        super();
        this.carto = new Cartography({
            cellSize: 256,
            hexSize: 16,
            hexSpacing: 3,
            scale: 2,
            seed: 0.111,
            preload: 1,
            drawGrid: true,
            drawCoords: true,
            service: '../build/worker.js',
            progress: Indicators.progress,
            verbose: false
        });
        this._lastEntityId = 0;
        this.state = {
            entities: [],
            player: null,
            view: new Vector()
        };
    }

    onClick(event) {
    	let p = this.mouse.add(this.carto._view);
		this.state.cursor.data.position.set(p);
		this.state.player.data.destination.set(p);
    }

    processThinker(entity) {
        entity.thinker(entity);
    }

	async createEntity(sResRef) {
    	let bp0 = DATA.blueprints[sResRef];
    	let blueprint = Object.assign({
			"angle": 0,                   // angle de cap
			"angleSpeed": 0,              // amplitude d emofication de l'angle
			"position": new Vector(),     // position actuelle
			"destination": new Vector(),  // position vers laquelle on se dirige
			"enginePower": 0,             // inc/dec de la vitesse du moteur
			"speed": 0,                   // vitesse actuelle
			"maxSpeed": 0,                // vitesse max
			"sprite": Object.assign({}, DATA.tiles[bp0.tileset]),
			"thinker": ""
		}, bp0);
    	blueprint.sprite.ref = new Vector(blueprint.sprite.ref.x, blueprint.sprite.ref.y);
		let id = ++this._lastEntityId;
		let sprite = new osge.Sprite();
		this._spriteLayer.sprites.push(sprite);
		sprite.define(blueprint.sprite);
		let oEntity = {
			id,
			sprite,
			thinker: THINKERS[blueprint.thinker],
			data: blueprint,
			game: this
		};
		this.state.entities.push(oEntity);
		return oEntity;
	}


    async init() {
        await super.init();
		this.layers.push(this._spriteLayer = new SpriteLayer());
        let oCanvas = document.querySelector('.world');
        this.canvas(oCanvas);

        // création du joueur
        this.state.player = await this.createEntity('blimp');
        this.domevents.on(oCanvas, 'click', event => this.onClick(event));

        // création du sprite curseur de destination
		this.state.cursor = await this.createEntity('cursor');
    }

    update() {
        super.update();
        let state = this.state;
        let entities = state.entities;
		entities.forEach(th => this.processThinker(th));
        let p = state.player.data.position;
        // tous les sprites doivent etre relatifs à ce point de vue
		entities.forEach(e => {
			e.sprite.position.set(e.data.position.sub(p));
		});
		this._spriteLayer.sort((e1, e2) => e1.position.y - e2.position.y);
		state.player.sprite.position.set(0, 0);
		state.view.set(p);
    }

    render() {
		this.carto.view(this.renderCanvas, this.state.view);
    	super.render();
	}
}

export default Game;