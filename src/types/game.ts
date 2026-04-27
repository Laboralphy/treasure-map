import type { Vector } from '../libs/geometry';

export interface ISprite {
    scale: number;
    frame: number;
    visible: boolean;
    z: number;
    position: Vector;
    frameCount(): number;
    fadeIn(rate?: number): void;
    fadeOut(rate?: number): void;
    animation: { isOver(): boolean } | null;
}

export interface IEntity {
    // identity
    id: number;
    sprite: ISprite;

    // motion
    angle: number;
    angleSpeed: number;
    position: Vector;
    destination: Vector;
    speed: number;
    maxSpeed: number;
    enginePower: number;
    repulse: Vector;
    input: { keys: Record<string, boolean>; fire?: Vector | false };

    // blueprint
    collision?: number;
    z?: number;

    // thinker runtime state
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
}

export interface ICartography {
    getPhysicValue(x: number, y: number): number | undefined;
}

export interface IGame {
    state: {
        time: number;
        player: IEntity | null;
        entities: IEntity[];
    };
    cartography: ICartography;
    destroyEntity(entity: IEntity): void;
    spawnEntity(ref: string, position: Vector): Promise<IEntity>;
    spawnMissile(entity: IEntity, target: Vector, offset: Vector): Promise<IEntity>;
}

export interface IThinker {
    think(entity: IEntity, game: IGame): void | Promise<void>;
}
