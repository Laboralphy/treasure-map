import Aerostat from './Aerostat';
import { computeWallCollisions } from 'libs/wall-collider';
import Geometry from 'libs/geometry';

class Boat extends Aerostat {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async processWave(entity: any, game: any): Promise<void> {
        const position = entity.position;
        await game.spawnEntity('wave_0', position);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    think(entity: any, game: any): void {
        const xLast = entity.position.x;
        const yLast = entity.position.y;
        super.think(entity, game);
        const xNew = entity.position.x;
        const yNew = entity.position.y;
        const dx = xNew - xLast + entity.repulse.x;
        const dy = yNew - yLast + entity.repulse.y;
        const c = computeWallCollisions(
            xLast,
            yLast,
            dx,
            dy,
            6,
            16,
            false,
            (x, y) => {
                const p = game.cartography.getPhysicValue(x, y);
                return p !== 11;
            }
        );
        if (c.wcf.x || c.wcf.y) {
            entity.stuck = (entity.stuck || 0) + 1;
        }
        entity.position.set(c.pos.x, c.pos.y);
        if (!entity.nextWave || game.state.time > entity.nextWave) {
            const t = c.speed.x === 0 && c.speed.y === 0 ? 16 : 4;
            entity.nextWave = game.state.time + t;
            this.processWave(entity, game);
        }
        const input = entity.input;
        if (input.fire) {
            const offset = Geometry.Helper.polar2rect(entity.angle, 16);
            game.spawnMissile(entity, input.fire, new Geometry.Vector(offset.dx, offset.dy));
            input.fire = false;
        }
    }
}

export default Boat;
