import Geometry from './libs/geometry'
import osge from './libs/osge';
import Cartography from './libs/cartography';
import Indicators from './Indicators';
import THINKERS from './thinkers';
import DATA from './data/index';
import * as CARTOGRAPHY_CONSTS from './libs/cartography/consts';
import CONFIG from "./config.json";
import Entity from "./Entity";

const Vector = Geometry.Vector;
const SpriteLayer = osge.SpriteLayer;
const COLLISION_DISTANCE = 512;

class Game extends osge.Game {
  constructor() {
    super();
    this.period = CONFIG.timer;
    this._carto = null;
    this.state = {
      time: 0,
      input: {
        keys: {},
      },
      entities: [],
      player: null,
      view: new Vector()
    };
    this._spriteLayer = null;
    this._collidingEntities = [];
  }





//            _   _                   ___              _   _
//  __ _  ___| |_| |_ ___ _ __ ___   ( _ )    ___  ___| |_| |_ ___ _ __ ___
// / _` |/ _ \ __| __/ _ \ '__/ __|  / _ \/\ / __|/ _ \ __| __/ _ \ '__/ __|
//| (_| |  __/ |_| ||  __/ |  \__ \ | (_>  < \__ \  __/ |_| ||  __/ |  \__ \
// \__, |\___|\__|\__\___|_|  |___/  \___/\/ |___/\___|\__|\__\___|_|  |___/
// |___/

  get cartography() {
    return this._carto;
  }



//      _                                        _         _                     _ _
//   __| | ___  _ __ ___     _____   _____ _ __ | |_ ___  | |__   __ _ _ __   __| | | ___ _ __ ___
//  / _` |/ _ \| '_ ` _ \   / _ \ \ / / _ \ '_ \| __/ __| | '_ \ / _` | '_ \ / _` | |/ _ \ '__/ __|
// | (_| | (_) | | | | | | |  __/\ V /  __/ | | | |_\__ \ | | | | (_| | | | | (_| | |  __/ |  \__ \
//  \__,_|\___/|_| |_| |_|  \___| \_/ \___|_| |_|\__|___/ |_| |_|\__,_|_| |_|\__,_|_|\___|_|  |___/


  clickHandler(event) {
    let p = this.mouse.add(this.cartography._view);
    if (event.shiftKey) {
      this.state.player.data.input.fire = new Vector(p);
    } else {
      this.state.cursor.data.position.set(p);
      this.state.player.data.destination.set(p);
    }
  }

  keyUpHandler(event) {
    this.state.input.keys[event.keys] = true;
  }

  keyDownHandler(event) {
    this.state.input.keys[event.keys] = false;
  }



//                                   _    ____ ___
//    __ _  __ _ _ __ ___   ___     / \  |  _ \_ _|
//   / _` |/ _` | '_ ` _ \ / _ \   / _ \ | |_) | |
//  | (_| | (_| | | | | | |  __/  / ___ \|  __/| |
//   \__, |\__,_|_| |_| |_|\___| /_/   \_\_|  |___|
//   |___/


  /**
   * création d'une entité. Les entité créées doivent être lié
   * avec la methode linkEntity
   * @param sResRef {string} reference du blueprint
   * @returns {Promise<{Entity}>}
   */
  async createEntity(sResRef) {
    const oEntity = new Entity(sResRef);
    return oEntity;
  }

  /**
   * Integration de l'entité spécifé dans le jeu.
   * @param entity {*}
   * @returns {Entity}
   */
  linkEntity(entity) {
    this._spriteLayer.add(entity.sprite);
    this.state.entities.push(entity);
    if (entity.data.collision === 1) {
      this._collidingEntities.push(entity);
    }
    return entity;
  }


  /**
   * Créaation et liaison d'une nouvelle entité
   * @param sResRef {string}
   * @param vPosition {Vector}
   * @returns {Promise<{Entity}>}
   */
  async spawnEntity(sResRef, vPosition) {
    const oEntity = await this.createEntity(sResRef);
    await oEntity.spawn(vPosition);
    this.linkEntity(oEntity);
    return oEntity;
  }

  /**
   * Création d'une entité missile
   * @param entity {Entity} entité qui tire le missile
   * @param vTarget {Vector} point visé
   * @param vOffset {Vector} nombre de pixel de décalage
   * @returns {Entity}
   */
  async spawnMissile(entity, vTarget, vOffset) {
    const pdata = entity.data;
    const position = pdata.position;
    //const offset = //Geometry.Helper.polar2rect(pdata.angle, 16);
    const posBullet = position.add(vOffset);
    const bullet = await this.createEntity('bullet_0'); // link below
    bullet.data.target = new Geometry.Vector(vTarget);
    await bullet.spawn(posBullet);
    this.linkEntity(bullet);
    bullet.sprite.fadeIn(1);
    const explosion = await this.spawnEntity('smoke_0', posBullet); // link below
    return bullet;
  }

  /**
   * destruction de l'entité
   * @param entity {*}
   */
  destroyEntity(entity) {
    let i = this.state.entities.indexOf(entity);
    if (i >= 0) {
      this.state.entities.splice(i, 1);
    }
    this._spriteLayer.remove(entity.sprite);
    if (entity.data.collision === 1) {
      i = this._collidingEntities.indexOf(entity);
      if (i >= 0) {
        this._collidingEntities.splice(i, 1);
      }
    }
  }

  initCartography(seed) {
    return new Cartography({
      seed,
      preload: 1,
      palette: DATA.palette,
      cellSize: 25,
      tileSize: 256,
      worker: '../dist/worker.js',
      workerCount: Math.max(1, navigator.hardwareConcurrency - 1),
      brushes: DATA.brushes,
      names: DATA.towns_fr,
      physicGridSize: 16,
      scale: 2,
      progress: Indicators.progress
    });
  }


  /**
   * initialisation du jeu.
   * @returns {Promise<void>}
   */
  async init() {
    await super.init();
    const oCanvas = document.querySelector('canvas.world');
    this.canvas(oCanvas);
    const c = this.initCartography(0);
    this._carto = c;
    this.layers.push(this._spriteLayer = new SpriteLayer());
    await c.start();

    // il faut trouver le point de départ du sprite-joueur
    const oStartingTile = {x: 0, y: 0};

    // création du joueur
    this.state.player = await this.spawnEntity(
      CONFIG.player.blueprint,
      new Vector(oStartingTile.x * 256, oStartingTile.y * 256)
    ); // link below
    this.domevents.on(oCanvas, 'click', event => this.clickHandler(event));
    this.domevents.on(document, 'keydown', event => this.keyUpHandler(event));
    this.domevents.on(document, 'keyup', event => this.keyDownHandler(event));

    // création du sprite curseur de destination
    this.state.cursor = await this.spawnEntity('cursor', this.state.player.position);

  }

//              _            _         _   _     _
//   _ __  _ __(_)_   ____ _| |_ ___  | |_| |__ (_)_ __   __ _ ___
//  | '_ \| '__| \ \ / / _` | __/ _ \ | __| '_ \| | '_ \ / _` / __|
//  | |_) | |  | |\ V / (_| | ||  __/ | |_| | | | | | | | (_| \__ \
//  | .__/|_|  |_| \_/ \__,_|\__\___|  \__|_| |_|_|_| |_|\__, |___/
//  |_|                                                  |___/
  /**
   * tri des sprites pour que l'affichqage se pâsse bien
   * cette methode est utilisée au moment du rendu
   * @param e1 {Sprite}
   * @param e2 {Sprite}
   * @returns {number}
   * @private
   */
  _sortSprites(e1, e2) {
    const z = e1.z - e2.z;
    return z === 0
      ? e1.position.y - e2.position.y
      : z;
  }

  /**
   * Traitement de tous les thinkers
   * @param entity {*}
   * @private
   */
  _processThinker(entity) {
    this._processCollidingSprites(entity);
    entity.thinker.think(entity, this);
    entity.data.thought = true;
    entity.sprite.visible = true;
  }

  /**
   * renvoie la liste des entités qui sont pas loin de l'entité spécifiée
   * @param entity
   */
  _processCollidingSprites(entity) {
    if (entity.data.collision !== 1) {
      return;
    }
    const entitySector = entity.data.sector;
    const xm = entitySector.x;
    const ym = entitySector.y;
    const xEnt = entity.data.position.x;
    const yEnt = entity.data.position.y;
    const aColliders = this._collidingEntities.filter(e => {
      if (e === entity) {
        return false;
      } else {
        const otherSector = e.data.sector;
        const xe = otherSector.x;
        const ye = otherSector.y;
        return Math.abs(xm - xe) <= 1 &&
          Math.abs(ym - ye) <= 1 &&
          Geometry.Helper.squareDistance(
            xEnt,
            yEnt,
            e.data.position.x,
            e.data.position.y,
          ) < COLLISION_DISTANCE;
      }
    });
    const repulse = entity.data.repulse;
    const pEntity = entity.data.position;
    aColliders.forEach(other => {
      const pOther = other.data.position;
      let r;
      if (pOther.x === pEntity.x && pOther.y === pEntity.y) {
        r = new Vector(1, 0);
      } else {
        r = pOther.sub(pEntity).scale(0.1);
      }
      repulse.translate(r.neg());
      other.data.repulse.translate(r);
    });
  }





//                  _       _          ___                        _
//  _   _ _ __   __| | __ _| |_ ___   ( _ )    _ __ ___ _ __   __| | ___ _ __
// | | | | '_ \ / _` |/ _` | __/ _ \  / _ \/\ | '__/ _ \ '_ \ / _` |/ _ \ '__|
// | |_| | |_) | (_| | (_| | ||  __/ | (_>  < | | |  __/ | | | (_| |  __/ |
//  \__,_| .__/ \__,_|\__,_|\__\___|  \___/\/ |_|  \___|_| |_|\__,_|\___|_|
//       |_|

  update() {
    super.update();
    let state = this.state;
    let entities = state.entities;
    entities.forEach(th => {
      th.data.repulse.set(0, 0);
    });
    entities.forEach(th => {
      this._processThinker(th)
    });
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
    const c = this.cartography;
    c.view(this.renderCanvas, v);
    c.renderTiles();
    this._spriteLayer.sort(this._sortSprites);
    super.render();
  }
}

export default Game;
