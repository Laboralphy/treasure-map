import o876 from '../o876';

const Vector = o876.geometry.Vector;


function getQuadran(a) {
    if (a >= -Math.PI && a < -Math.PI / 2) {
        return 3;
    }
    if (a >= -Math.PI / 2 && a < 0) {
        return 2;
    }
    if (a >= 0 && a < Math.PI / 2) {
        return 0;
    }
    if (a >= Math.PI / 2 && a < Math.PI) {
        return 1;
    }
}


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
        // determiner les secteur des angle de cap et de destination



        // angle de destination
        let fAngleDest = pdata.destination.sub(pdata.position).angle();
        pdata.aimedAngle = fAngleDest;
        let fAngleCurr = pdata.angle;
        let qDest = getQuadran(fAngleDest);
        let qCurr = getQuadran(fAngleCurr);
        let fAngleDiff = fAngleDest - fAngleCurr;
        let fAngleMod = 0;
        switch (Math.sign(fAngleDiff) * 100 + qDest * 10 + qCurr) {
            case 100: // même cadran : augmenter .angle
            case 111:
            case 122:
            case 133:
                fAngleMod = pdata.angleSpeed;
                break;

            case -100: // même cadran : diminuer .angle
            case -111:
            case -122:
            case -133:
                fAngleMod = -pdata.angleSpeed;
                break;

            case 10

        }



        if (Math.abs(fAngleDiff) >= Math.PI) {
			fAngleMod = -Math.sign(fAngleDiff) * pdata.angleSpeed;
        } else {
			fAngleMod = Math.sign(fAngleDiff) * pdata.angleSpeed;
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