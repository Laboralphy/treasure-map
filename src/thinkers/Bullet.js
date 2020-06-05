import Geometry from 'libs/geometry';
const Vector = Geometry.Vector;

class Cursor {

    setup(entity) {
        let data = entity.data;
        let target = data.target;
        data.angle = Geometry.Helper.angle(data.position.x, data.position.y, target.x, target.y);
        data.distance = Geometry.Helper.distance(data.position.x, data.position.y, target.x, target.y);
        // calculer le nombre d'update à faire
        data.lifetime = Math.floor(data.distance / data.maxSpeed);
        const {dx, dy} = Geometry.Helper.polar2rect(data.angle, data.maxSpeed);
        data.movement = new Vector(dx, dy);
    }

    /**
     * @param entity
     */
    async think(entity, game) {
        let data = entity.data;
        if (!data.lifetime) {
            this.setup(entity);
            return;
        }
        --data.lifetime;
        data.position.translate(data.movement);
        if (data.lifetime <= 0) {
            const p = data.target;
            // explo
            const phys = game.cartography.getPhysicValue(p.x, p.y);
            if (phys === 11) {
                const puff = await game.spawnEntity('splash_0', p);
                const wave = await game.spawnEntity('wave_0', p);
            } else if (!!phys) {
                const puff = await game.spawnEntity('explosion_0', p);
            }
            game.destroyEntity(entity);
        }
    }
}

export default Cursor;