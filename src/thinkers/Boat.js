import Aerostat from './Aerostat';
import {computeWallCollisions} from '../wall-collider';

class Boat extends Aerostat {
    async processWave(entity) {
        const game = entity.game;
        const pdata = entity.data;
        const position = pdata.position;
        const wave = await game.createEntity('wave_0', position);
        wave.sprite.scale = 0.1;
        wave.sprite.z = -10;
        wave.sprite.fadeOut(0.04);
        wave.data.lifetime = game.state.time + 32;
    }

    think(entity) {
        const xLast = entity.data.position.x;
        const yLast = entity.data.position.y;
        super.think(entity);
        let xNew = entity.data.position.x;
        let yNew = entity.data.position.y;
        const dx = xNew - xLast;
        const dy = yNew - yLast;
        const c = computeWallCollisions(
            xLast,
            yLast,
            dx,
            dy,
            6,
            16,
            false,
            (x, y) => {
                const p = game.carto.getPhysicValue(x, y);
                return !!p && p.type !== 11;
            }
        );
        if (c.wcf.x || c.wcf.y) {
            entity.data.stuck = (entity.data.stuck || 0) + 1;
        }
        entity.data.position.set(c.pos.x, c.pos.y);
        if (!entity.data.nextWave || game.state.time > entity.data.nextWave) {
            const t = c.speed.x === 0 && c.speed.y === 0 ? 16 : 4;
            entity.data.nextWave = entity.game.state.time + t;
            this.processWave(entity);
        }
    }

}

export default Boat;