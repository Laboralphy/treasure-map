import type { IEntity, IGame, IThinker } from '../types/game';

class Balloon implements IThinker {
    think(entity: IEntity, _game: IGame): void {
        if (!entity.destination.isEqual(entity.position)) {
            const vDiff = entity.destination.sub(entity.position);
            const nDist = vDiff.magnitude();
            let ms = entity.maxSpeed;
            let speed = entity.speed;
            const acc = entity.enginePower;
            const DECCEL_THRESHOLD_DIST = ms << 2;
            if (nDist < DECCEL_THRESHOLD_DIST) {
                ms *= nDist / DECCEL_THRESHOLD_DIST;
            }
            speed = Math.min(ms, speed + acc);
            const vNorm = vDiff.normalize();
            const vMove = vNorm.mul(speed);
            entity.speed = speed;
            entity.position.translate(vMove);
        }
    }
}

export default Balloon;
