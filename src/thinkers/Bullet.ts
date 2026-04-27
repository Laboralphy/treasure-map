import Geometry from 'libs/geometry';
import type { IEntity, IGame, IThinker } from '../types/game';

const Vector = Geometry.Vector;

class Bullet implements IThinker {
    setup(entity: IEntity): void {
        const target = entity.target!;
        entity.angle    = Geometry.Helper.angle(entity.position.x, entity.position.y, target.x, target.y);
        entity.distance = Geometry.Helper.distance(entity.position.x, entity.position.y, target.x, target.y);
        entity.lifetime = Math.floor(entity.distance / entity.maxSpeed);
        const { dx, dy } = Geometry.Helper.polar2rect(entity.angle, entity.maxSpeed);
        entity.movement = new Vector(dx, dy);
    }

    async think(entity: IEntity, game: IGame): Promise<void> {
        if (!entity.lifetime) {
            this.setup(entity);
            return;
        }
        --entity.lifetime;
        entity.position.translate(entity.movement!);
        if (entity.lifetime <= 0) {
            const p = entity.target!;
            const phys = game.cartography.getPhysicValue(p.x, p.y);
            if (phys === 11) {
                await game.spawnEntity('splash_0', p);
                await game.spawnEntity('wave_0', p);
            } else if (phys) {
                await game.spawnEntity('explosion_0', p);
            }
            game.destroyEntity(entity);
        }
    }
}

export default Bullet;
