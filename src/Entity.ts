import { BlueprintSchema } from './schemas/blueprint';
import { TileSchema, type Tile } from './schemas/tile';
import { DATA } from './data';
import Sprite from './libs/osge/Sprite';
import * as THINKERS from './thinkers';
import { Vector } from './libs/geometry';
import type { IThinker } from './types/game';

let LAST_ENTITY_ID = 0;

class Entity {
    id: number;

    // motion & physics (from blueprint defaults + JSON)
    angle: number         = 0;
    angleSpeed: number    = 0;
    position: Vector;
    destination: Vector;
    enginePower: number   = 0;
    speed: number         = 0;
    maxSpeed: number      = 0;
    repulse: Vector;
    sector: { x: number; y: number } = { x: 0, y: 0 };
    input: { keys: Record<string, boolean>; fire?: Vector | false } = { keys: {} };

    // from blueprint JSON
    collision?: number;
    z?: number;

    // set by thinkers at runtime
    angleVis?: number;
    turning?: number[];
    aimedAngle?: number;
    stuck?: number;
    nextWave?: number;
    phase?: number;
    target?: Vector;
    lifetime?: number;
    movement?: Vector;
    distance?: number;
    thought?: boolean;

    // set by spawn()
    sprite!: Sprite;
    thinker!: IThinker;

    // blueprint thinker name — kept separate from the thinker instance above
    thinkerName: string;

    // tile definition, consumed by spawn()
    private readonly _tileData: Tile & { ref: Vector };

    constructor(sResRef: string) {
        this.id = ++LAST_ENTITY_ID;

        const rawBlueprint = (DATA as Record<string, unknown>)['blueprints/' + sResRef];
        if (rawBlueprint === undefined) {
            throw new Error('this blueprint does not exist : "' + sResRef + '"');
        }
        const blueprint = BlueprintSchema.parse(rawBlueprint);

        const rawTile = (DATA as Record<string, unknown>)['tiles/' + blueprint.tileset];
        const tile: Tile = TileSchema.parse(rawTile);

        this.angleSpeed  = blueprint.angleSpeed  ?? 0;
        this.enginePower = blueprint.enginePower ?? 0;
        this.maxSpeed    = blueprint.maxSpeed    ?? 0;
        this.collision   = blueprint.collision;
        this.z           = blueprint.z;
        this.thinkerName = blueprint.thinker;

        this.position    = new Vector();
        this.destination = new Vector();
        this.repulse     = new Vector();

        const ref = new Vector(tile.ref.x, tile.ref.y);

        this._tileData = { ...tile, ref };
    }

    async spawn(vPosition: Vector) {
        const sprite = new Sprite();
        await sprite.define(this._tileData);
        sprite.z = this.z || 0;
        if (!(this.thinkerName in THINKERS)) {
            throw new Error('this thinker does not exist : "' + this.thinkerName + '"');
        }
        this.thinker = THINKERS[this.thinkerName as keyof typeof THINKERS];
        this.position.set(vPosition);
        this.destination.set(vPosition);
        this.sprite = sprite;
    }
}

export default Entity;
