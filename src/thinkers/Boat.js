import Aerostat from './Aerostat';
import {computeWallCollisions} from '../wall-collider';
import Geometry from '../geometry';

class Boat extends Aerostat {

    async shoot(entity, vTarget) {
        const game = entity.game;
        const pdata = entity.data;
        const position = pdata.position;
        const offset = Geometry.Helper.polar2rect(pdata.angle, 16);
        const posBullet = position.add(new Geometry.Vector(offset.dx, offset.dy));
        const bullet = await game.createEntity('bullet_0', posBullet); // link below
        const explosion = await game.createEntity('smoke_0', posBullet); // link below
        bullet.data.target = new Geometry.Vector(vTarget);
        bullet.sprite.fadeIn(1);
        await game.linkEntity(explosion);
        await game.linkEntity(bullet);
    }

    async processWave(entity) {
        const game = entity.game;
        const pdata = entity.data;
        const position = pdata.position;
        const wave = await game.createEntity('wave_0', position); // link below
        await game.linkEntity(wave);
    }

    think(entity) {
        const xLast = entity.data.position.x;
        const yLast = entity.data.position.y;
        super.think(entity);
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
        let pdata = entity.data;
        let input = pdata.input;
        if (input.fire) {
            this.shoot(entity, input.fire);
            input.fire = false;
        }
    }

}

export default Boat;