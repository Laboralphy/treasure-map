import aerostat from './aerostat';
import {computeWallCollisions} from '../wall-collider';


function processWave(entity) {
    const game = entity.game;
    const pdata = entity.data;
    const position = pdata.position;
    const wave = game.createEntity('wave_0');
    wave.sprite.scale = 0.1;
    wave.sprite.z = -10;
    wave.sprite.alpha = 1;
    //wave.sprite.fadeOut(0.02);
    wave.data.position.set(position.x, position.y);
}

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
    if (!entity.data.nextWave || game.state.time > entity.data.nextWave) {
        entity.data.nextWave = entity.game.state.time + 16;
        console.log('wave');
        processWave(entity);
    }
}

export default process;