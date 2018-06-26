import o876 from '../o876';

const Vector = o876.geometry.Vector;

/**
 * Le blimp dispose des variables suivantes
 *
 * blimp.angleSpeed // vitesse de modification de l'angle
 * blimp.angle
 *
 * @param entity
 */
function process(entity) {
    let pdata = entity.data;
    if (!pdata.destination.isEqual(pdata.position)) {
        if (pdata.destination.sub(pdata.position).distance() <= pdata.maxSpeed) {
			pdata.position.set(pdata.destination);
			return;
        }
        // angle de destination
        let fAngleDest = pdata.destination.sub(pdata.position).angle();
        let fAngleCurr = pdata.angle;
        let fAngleDiff = fAngleDest - fAngleCurr;
        let fAngleMod;
        if (Math.abs(fAngleDiff) >= Math.PI) {
			fAngleMod = Math.sign(fAngleDiff) * pdata.angleSpeed;
        } else {
			fAngleMod = -Math.sign(fAngleDiff) * pdata.angleSpeed;
		}
        pdata.angle += fAngleMod;
        let vMove = new Vector();
        vMove.fromPolar(pdata.angle, pdata.maxSpeed);
        pdata.position.translate(vMove);

        // changer le sprite
		entity.sprite._iFrame = ((16 * pdata.angle / (2 * Math.PI) | 0) + 16) % 16;
    }
}

export default process;