import o876 from '../o876';

const geometry = o876.geometry;
const Vector = geometry.Vector;

class Cursor {

    setup(entity) {
        let data = entity.data;
        let target = data.target;
        data.angle = geometry.Helper.angle(data.position.x, data.position.y, target.x, target.y);
        data.distance = geometry.Helper.distance(data.position.x, data.position.y, target.x, target.y);
        // calculer le nombre d'update à faire
        data.lifetime = Math.floor(data.distance / data.maxSpeed);
        const {dx, dy} = geometry.Helper.polar2rect(data.angle, data.maxSpeed);
        data.movement = new Vector(dx, dy);
    }

    /**
     * @param entity
     */
    async think(entity) {
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
            const phys = entity.game.carto.getPhysicValue(p.x, p.y);
            if (!!phys && phys.type === 11) {
                const puff = await entity.game.createEntity('splash_0', p); // link below
                const wave = await entity.game.createEntity('wave_0', p); // link below
                entity.game.linkEntity(wave);
                entity.game.linkEntity(puff);
            } else if (!!phys) {
                const puff = await entity.game.createEntity('explosion_0', p); // link below
                entity.game.linkEntity(puff);
            }
            entity.game.destroyEntity(entity);
        }
    }
}

export default Cursor;