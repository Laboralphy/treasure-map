import Geometry from 'libs/geometry';

const Vector = Geometry.Vector;

class Bullet {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setup(entity: any): void {
        const data = entity;
        const target = data.target;
        data.angle = Geometry.Helper.angle(data.position.x, data.position.y, target.x, target.y);
        data.distance = Geometry.Helper.distance(data.position.x, data.position.y, target.x, target.y);
        data.lifetime = Math.floor(data.distance / data.maxSpeed);
        const { dx, dy } = Geometry.Helper.polar2rect(data.angle, data.maxSpeed);
        data.movement = new Vector(dx, dy);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async think(entity: any, game: any): Promise<void> {
        const data = entity;
        if (!data.lifetime) {
            this.setup(entity);
            return;
        }
        --data.lifetime;
        data.position.translate(data.movement);
        if (data.lifetime <= 0) {
            const p = data.target;
            const phys = game.cartography.getPhysicValue(p.x, p.y);
            if (phys === 11) {
                await game.spawnEntity('splash_0', p);
                await game.spawnEntity('wave_0', p);
            } else if (!!phys) {
                await game.spawnEntity('explosion_0', p);
            }
            game.destroyEntity(entity);
        }
    }
}

export default Bullet;
