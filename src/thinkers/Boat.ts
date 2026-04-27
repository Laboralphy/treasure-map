import Aerostat from './Aerostat';
import { computeWallCollisions } from 'libs/wall-collider';
import Geometry from 'libs/geometry';
import type { IEntity, IGame } from '../types/game';

class Boat extends Aerostat {
    async processWave(entity: IEntity, game: IGame): Promise<void> {
        await game.spawnEntity('wave_0', entity.position);
    }

    think(entity: IEntity, game: IGame): void {
        const xLast = entity.position.x;
        const yLast = entity.position.y;
        super.think(entity, game);
        const dx = entity.position.x - xLast + entity.repulse.x;
        const dy = entity.position.y - yLast + entity.repulse.y;
        const c = computeWallCollisions(
            xLast, yLast, dx, dy, 6, 16, false,
            (x, y) => game.cartography.getPhysicValue(x, y) !== 11
        );
        if (c.wcf.x || c.wcf.y) {
            entity.stuck = (entity.stuck ?? 0) + 1;
        }
        entity.position.set(c.pos.x, c.pos.y);
        if (!entity.nextWave || game.state.time > entity.nextWave) {
            const t = c.speed.x === 0 && c.speed.y === 0 ? 16 : 4;
            entity.nextWave = game.state.time + t;
            this.processWave(entity, game);
        }
        if (entity.input.fire) {
            const offset = Geometry.Helper.polar2rect(entity.angle, 16);
            game.spawnMissile(entity, entity.input.fire, new Geometry.Vector(offset.dx, offset.dy));
            entity.input.fire = false;
        }
    }
}

export default Boat;
