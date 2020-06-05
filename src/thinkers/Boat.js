import Aerostat from './Aerostat';
import {computeWallCollisions} from 'libs/wall-collider';
import Geometry from 'libs/geometry';

class Boat extends Aerostat {

    async processWave(entity, game) {
        const pdata = entity.data;
        const position = pdata.position;
        const wave = await game.spawnEntity('wave_0', position);
    }

    think(entity, game) {
        const xLast = entity.data.position.x;
        const yLast = entity.data.position.y;
        super.think(entity, game);
        let xNew = entity.data.position.x;
        let yNew = entity.data.position.y;
        const dx = xNew - xLast + entity.data.repulse.x;
        const dy = yNew - yLast + entity.data.repulse.y;
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
            entity.data.stuck = (entity.data.stuck || 0) + 1;
        }
        entity.data.position.set(c.pos.x, c.pos.y);
        if (!entity.data.nextWave || game.state.time > entity.data.nextWave) {
            const t = c.speed.x === 0 && c.speed.y === 0 ? 16 : 4;
            entity.data.nextWave = game.state.time + t;
            this.processWave(entity, game);
        }
        let pdata = entity.data;
        let input = pdata.input;
        if (input.fire) {
            const offset = Geometry.Helper.polar2rect(pdata.angle, 16);
            game.spawnMissile(entity, input.fire, new Geometry.Vector(offset.dx, offset.dy));
            input.fire = false;
        }
    }

}

export default Boat;