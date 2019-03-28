import o876 from '../o876';
import aerostat from './aerostat';
import {computeWallCollisions} from '../wall-collider';

const Vector = o876.geometry.Vector;
const sb = o876.SpellBook;


function isMapSolid(x, y) {
    const ptm = getPTM(x, y);
    return !!ptm && ptm.type !== 11;
}


let xPTM = null;
let yPTM = null;
let oLastPTM = null;
let oLastGame = null;

function getPTM(x, y, game = null) {
    if (!!oLastPTM && xPTM === x && yPTM === y) {
        return oLastPTM;
    } else {
        oLastGame = game || oLastGame;
        if (oLastGame) {
            oLastPTM = oLastGame.carto.getPhysicTileMap(x, y);
            return oLastGame.carto.getPhysicValue(x, y, oLastPTM);
        }
        return null;
    }
}


function process(entity) {
    const xLast = entity.data.position.x;
    const yLast = entity.data.position.y;
    aerostat(entity);
    const xNew = entity.data.position.x;
    const yNew = entity.data.position.y;
    const dx = xNew - xLast;
    const dy = yNew - yLast;
    const c = computeWallCollisions(xLast, yLast, dx, dy, 8, 16, false, isMapSolid);
    if (c.wcf.x || c.wcf.y) {
        entity.data.position.set(c.wcf.pos.x, c.wcf.pos.y);
    }
}

export default process;