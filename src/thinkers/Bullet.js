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
        if (!('lifetime' in data)) {
            this.setup(entity);
        }
        --data.lifetime;
        data.position.translate(data.movement);
        if (data.lifetime > 0) {
        } else {
            // explo
            await entity.game.createEntity('splash_0', data.position);
            await entity.game.createEntity('wave_0', data.position);
            entity.game.destroyEntity(entity);
        }
    }
}

export default Cursor;