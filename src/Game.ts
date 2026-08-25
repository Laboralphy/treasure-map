import { Helper, Vector } from './libs/geometry';
import OsgeGame from './libs/osge/Game';
import SpriteLayer from './libs/osge/SpriteLayer';
import Cartography from './libs/cartography';
import Indicators from './Indicators';
import { DATA } from './data';
import CONFIG from './config.json';
import Entity from './Entity';
import type { IGame, IEntity, ICartography } from './types/game';

const COLLISION_DISTANCE = 512;
const MAX_RENDERING_THREADS = 4;

interface GameState {
    time: number;
    input: { keys: Record<string, boolean> };
    entities: Entity[];
    player: Entity | null;
    cursor: Entity | null;
    view: Vector;
}

class Game extends OsgeGame implements IGame {
    private _carto: Cartography | null;
    state: GameState;
    private _spriteLayer: SpriteLayer | null;
    private _collidingEntities: Entity[];

    constructor() {
        super();
        this.period = (CONFIG as { timer: number }).timer;
        this._carto = null;
        this.state = {
            time: 0,
            input: { keys: {} },
            entities: [],
            player: null,
            cursor: null,
            view: new Vector()
        };
        this._spriteLayer = null;
        this._collidingEntities = [];
    }

    get cartography(): Cartography {
        return this._carto!;
    }

    clickHandler(event: MouseEvent): void {
        const p = this.mouse.add(this.cartography.scrollPosition);
        if (event.shiftKey) {
            this.state.player!.input.fire = new Vector(p.x, p.y);
        } else {
            this.state.cursor!.position.set(p);
            this.state.player!.destination.set(p);
        }
    }

    keyUpHandler(event: KeyboardEvent): void {
        this.state.input.keys[event.key] = true;
    }

    keyDownHandler(event: KeyboardEvent): void {
        this.state.input.keys[event.key] = false;
    }

    async createEntity(sResRef: string): Promise<Entity> {
        return new Entity(sResRef);
    }

    linkEntity(entity: Entity): Entity {
        this._spriteLayer!.add(entity.sprite);
        this.state.entities.push(entity);
        if (entity.collision === 1) {
            this._collidingEntities.push(entity);
        }
        return entity;
    }

    async spawnEntity(sResRef: string, vPosition: Vector): Promise<Entity> {
        const oEntity = await this.createEntity(sResRef);
        await oEntity.spawn(vPosition);
        this.linkEntity(oEntity);
        return oEntity;
    }

    async spawnMissile(entity: Entity, vTarget: Vector, vOffset: Vector): Promise<Entity> {
        const position = entity.position;
        const posBullet = position.add(vOffset);
        const bullet = await this.createEntity('bullet_0');
        bullet.target = new Vector(vTarget.x, vTarget.y);
        await bullet.spawn(posBullet);
        this.linkEntity(bullet);
        bullet.sprite.fadeIn(1);
        await this.spawnEntity('smoke_0', posBullet);
        return bullet;
    }

    destroyEntity(entity: Entity): void {
        let i = this.state.entities.indexOf(entity);
        if (i >= 0) {
            this.state.entities.splice(i, 1);
        }
        this._spriteLayer!.remove(entity.sprite);
        if (entity.collision === 1) {
            i = this._collidingEntities.indexOf(entity);
            if (i >= 0) {
                this._collidingEntities.splice(i, 1);
            }
        }
    }

    initCartography(seed: number): Cartography {
        return new Cartography({
            seed,
            preload: 1,
            palette: DATA.palette as Array<{ altitude: number; color: string }>,
            tileSize: 256,
            worker: './dist/worker.js',
            workerCount: Math.max(1, Math.min(MAX_RENDERING_THREADS, navigator.hardwareConcurrency - 1)),
            brushes: DATA.brushes as Array<{ type: string; src: string; code: string | number }>,
            names: DATA.towns_fr as string[],
            physicGridSize: 16,
            scale: 2,
            progress: Indicators.progress,
            drawPhysicCodes: false
        });
    }

    async init(): Promise<boolean> {
        await super.init();
        const oCanvas = document.querySelector('canvas.world') as HTMLCanvasElement;
        this.canvas(oCanvas);
        const c = this.initCartography(0);
        this._carto = c;
        this.layers.push(this._spriteLayer = new SpriteLayer());
        await c.start();

        const oStartingTile = { x: 0, y: 0 };
        const cfg = CONFIG as { player: { blueprint: string } };
        this.state.player = await this.spawnEntity(
            cfg.player.blueprint,
            new Vector(oStartingTile.x * 256, oStartingTile.y * 256)
        );
        this.domevents.on(oCanvas, 'click', event => this.clickHandler(event as MouseEvent));
        this.domevents.on(document, 'keydown', event => this.keyUpHandler(event as KeyboardEvent));
        this.domevents.on(document, 'keyup', event => this.keyDownHandler(event as KeyboardEvent));
        this.state.cursor = await this.spawnEntity('cursor', this.state.player.position);
        return true;
    }

    private _sortSprites(e1: Entity, e2: Entity): number {
        const z = (e1.z ?? 0) - (e2.z ?? 0);
        return z === 0 ? e1.position.y - e2.position.y : z;
    }

    private _processThinker(entity: Entity): void {
        this._processCollidingSprites(entity);
        entity.thinker.think(entity, this);
        entity.thought = true;
        entity.sprite.visible = true;
    }

    private _processCollidingSprites(entity: Entity): void {
        if (entity.collision !== 1) { return; }
        const entitySector = entity.sector;
        const xm = entitySector.x;
        const ym = entitySector.y;
        const xEnt = entity.position.x;
        const yEnt = entity.position.y;
        const aColliders = this._collidingEntities.filter(e => {
            if (e === entity) { return false; }
            const otherSector = e.sector;
            return Math.abs(xm - otherSector.x) <= 1 &&
                Math.abs(ym - otherSector.y) <= 1 &&
                Helper.squareDistance(xEnt, yEnt, e.position.x, e.position.y) < COLLISION_DISTANCE;
        });
        const repulse = entity.repulse;
        const pEntity = entity.position;
        aColliders.forEach(other => {
            const pOther = other.position;
            let r: Vector;
            if (pOther.x === pEntity.x && pOther.y === pEntity.y) {
                r = new Vector(1, 0);
            } else {
                r = pOther.sub(pEntity).scale(0.1);
            }
            repulse.translate(r.neg());
            other.repulse.translate(r);
        });
    }

    update(): void {
        super.update();
        const state = this.state;
        const entities = state.entities;
        entities.forEach(th => { th.repulse.set(0, 0); });
        entities.forEach(th => { this._processThinker(th); });
        const p = state.player!.position;
        entities.forEach(e => { e.sprite.position.set(e.position.sub(p)); });
        ++this.state.time;
        state.player!.sprite.position.set(0, 0);
        state.view.set(p);
    }

    render(): void {
        const v = this.state.view;
        const c = this.cartography;
        c.view(this.renderCanvas!, v);
        c.renderTiles();
        this._spriteLayer!.sort((e1: unknown, e2: unknown) => this._sortSprites(e1 as Entity, e2 as Entity));
        super.render();
    }
}

export default Game;
