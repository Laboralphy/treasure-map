import aerostat from './aerostat';
import {computeWallCollisions} from '../wall-collider';

function process(entity) {
    const xLast = entity.data.position.x;
    const yLast = entity.data.position.y;
    aerostat(entity);
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
    entity.data.position.set(c.pos.x, c.pos.y);
}

export default process;