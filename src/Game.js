import o876 from './o876';
import osge from './osge';
import Cartography from './cartography';
import Indicators from './Indicators';
import THINKERS from './thinkers';
import DATA from './data';
import assignDeep from 'assign-deep';

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
		this.state.player.data.destination.set(this.mouse.add(this.carto._view));
    }

    processThinker(entity) {
        entity.thinker(entity);
    }

	async createEntity(sResRef) {
		let blueprint = DATA.blueprints[sResRef];
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

	async createEntity2(sResRef) {
		let blueprint = DATA.blueprints[sResRef];
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
        this.state.entities.forEach(th => this.processThinker(th));
        this.state.view.set(this.state.player.data.position);
		let c = this.renderCanvas;
        this.carto.view(c, this.state.view);
    }
}

export default Game;