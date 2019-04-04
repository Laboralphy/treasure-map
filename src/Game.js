import o876 from './o876';
import osge from './osge';
import Cartography from './cartography';
import Indicators from './Indicators';
import THINKERS from './thinkers';
import DATA from './data';

import ImageLoader from './image-loader';

const Vector = o876.geometry.Vector;
const SpriteLayer = osge.SpriteLayer;

const Z_CURSOR = -20;


class Game extends osge.Game {
    constructor() {
        super();
        this._lastEntityId = 0;
        this.state = {
        	time: 0,
        	input: {
        		keys: {},
				mouse: {
        			click: new Vector(),
					shiftclick: new Vector(),
					fire: false
				}
			},
            entities: [],
            player: null,
            view: new Vector()
        };
    }

	onClick(event) {
		let p = this.mouse.add(this.carto._view);
    	if (event.shiftKey) {
			this.state.input.mouse.shiftclick.set(p);
			this.state.input.mouse.fire = true;
		} else {
			this.state.cursor.data.position.set(p);
			this.state.input.mouse.click.set(p);
		}
	}

	onKeyUp(event) {
		this.state.input.keys[event.keys] = true;
	}

	onKeyDown(event) {
		this.state.input.keys[event.keys] = false;
	}

	processThinker(entity) {
        entity.thinker.think(entity);
		entity.data.thinked = true;
		entity.sprite.visible = true;
    }

	async createEntity(sResRef, vPosition) {
    	let bp0 = DATA.blueprints[sResRef];
    	if (bp0 === undefined) {
    		throw new Error('this blueprint does not exist : "' + sResRef + '"');
		}
    	let blueprint = Object.assign({
			"angle": 0,                   // angle de cap
			"angleSpeed": 0,              // amplitude d emofication de l'angle
			"position": new Vector(vPosition.x, vPosition.y),     // position actuelle
			"destination": new Vector(),  // position vers laquelle on se dirige
			"enginePower": 0,             // inc/dec de la vitesse du moteur
			"speed": 0,                   // vitesse actuelle
			"maxSpeed": 0,                // vitesse max
			"sprite": Object.assign({}, DATA.tiles[bp0.tileset]),
			"thinker": "",
			"input": {
				"keys": {},
				"mouse": {
					"click": new Vector()
				}
			}
		}, bp0);
    	blueprint.sprite.ref = new Vector(blueprint.sprite.ref.x, blueprint.sprite.ref.y);
		let id = ++this._lastEntityId;
		let sprite = new osge.Sprite();
		this._spriteLayer.add(sprite);
		await sprite.define(blueprint.sprite);
		sprite.z = bp0.z || 0;
		if (!(blueprint.thinker in THINKERS)) {
			throw new Error('this thinker does not exist : "' + blueprint.thinker);
		}
		const oThinker = THINKERS[blueprint.thinker];

		let oEntity = {
			id,
			sprite,
            thinker: oThinker,
			data: blueprint,
			game: this
		};
		this.state.entities.push(oEntity);
		return oEntity;
	}

	destroyEntity(entity) {
    	let i = this.state.entities.indexOf(entity);
		if (i >= 0) {
			this.state.entities.splice(i, 1);
		}
		i = this._spriteLayer.sprites.indexOf(entity.sprite);
		if (i >= 0) {
			this._spriteLayer.sprites.splice(i, 1);
		}
	}


    async init() {
        await super.init();

        // chargement des ressources pour la carto
		await ImageLoader.load([
			'images/sceneries/city_0.png',
			'images/sceneries/city_1.png',
		]);

        // cartographie
		this.carto = new Cartography({
			cellSize: 256,
			hexSize: 16,
			hexSpacing: 7,
			scale: 2,
			seed: 0.111,
			preload: 1,
			drawGrid: true,
			drawCoords: true,
			service: '../build/worker.js',
			progress: Indicators.progress,
			verbose: false
		});
		// transmission des image à la carto
        await this.carto.startService();
        // layers
		this.layers.push(this._spriteLayer = new SpriteLayer());
        let oCanvas = document.querySelector('.world');
        this.canvas(oCanvas);

        // création du joueur
		this.state.player = await this.createEntity('tugboat_1', new Vector(0, 0));
		this.domevents.on(oCanvas, 'click', event => this.onClick(event));
		this.domevents.on(document, 'keydown', event => this.onKeyUp(event));
		this.domevents.on(document, 'keyup', event => this.onKeyDown(event));


        // création du sprite curseur de destination
		this.state.cursor = await this.createEntity('cursor', new Vector(0, 0));
    }

    sortSprite(e1, e2) {
		const z = e1.z - e2.z;
		return z === 0
			? e1.position.y - e2.position.y
			: z;
	}

    update() {
        super.update();
        let state = this.state;
        let entities = state.entities;
		entities.forEach(th => this.processThinker(th));
        // tous les sprites doivent etre relatifs à ce point de vue
		let p = state.player.data.position;
		entities.forEach(e => {
			e.sprite.position.set(e.data.position.sub(p));
		});
		++this.state.time;
		state.player.sprite.position.set(0, 0);
		state.view.set(p);
    }

    render() {
    	const v = this.state.view;
    	const c = this.carto;
		c.view(this.renderCanvas, v);
		c.renderTiles();
		this._spriteLayer.sort(this.sortSprite);
    	super.render();
	}
}

export default Game;