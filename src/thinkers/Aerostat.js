import o876 from '../o876';
import Geometry from '../geometry';

const Vector = Geometry.Vector;
const sb = o876.SpellBook;


class Aerostat {

	advance(entity) {
		let pdata = entity.data;
		if (!pdata.destination.isEqual(pdata.position)) {
			let vDiff = pdata.destination.sub(pdata.position);
			let nDist = vDiff.magnitude();
			let ms = pdata.maxSpeed;
			let speed = pdata.speed;
			let acc = pdata.enginePower;

			const DECCEL_THRESHOLD_DIST = ms << 3;

			if (nDist < DECCEL_THRESHOLD_DIST) {
				// en deça d'un certain seuil la vitesse max diminue
				// proportionnellemnt à la distance restante
				ms *= nDist / DECCEL_THRESHOLD_DIST;
			}
			speed = Math.min(ms, speed + acc);
			let vMove = Vector.fromPolar(pdata.angle, 1);
			vMove.scale(speed);
			// vMove.translate(pdata.repulse);
			// pdata.repulse.set(0, 0);
			pdata.speed = speed;
			pdata.position.translate(vMove);
		}
	}


	think(entity) {
		let pdata = entity.data;
		if (!pdata.destination.isEqual(pdata.position)) {
			if (pdata.destination.sub(pdata.position).magnitude() <= pdata.maxSpeed) {
				pdata.position.set(pdata.destination);
				return;
			}

			if (!('angleVis' in pdata)) {
				pdata.angleVis = pdata.angle;
			}
			let fAngleCurr = pdata.angle;
			let fAngleDest = pdata.destination.sub(pdata.position).direction();
			let fAngle;

			// si l'angle entre les deux vecteur est trop petit alors on les confond
			let vBlimp = Vector.fromPolar(fAngleCurr, 1);
			let vCap = Vector.fromPolar(fAngleDest, 1);
			let fAngleDeriv = Math.abs(vBlimp.angle(vCap));
			if (fAngleDeriv < pdata.angleSpeed) {
				fAngle = fAngleDest;
			} else {
				// angle de destination
				let fAngleDestInv = pdata.position.sub(pdata.destination).direction();
				pdata.aimedAngle = fAngleDest;
				let fAngleMod = 0;
				if (Math.sign(fAngleDest) === Math.sign(fAngleCurr)) {
					fAngleMod = Math.sign(fAngleDest - fAngleCurr);
				} else {
					fAngleMod = Math.sign(fAngleCurr - fAngleDestInv);
				}
				fAngleMod *= pdata.angleSpeed;
				fAngle = pdata.angle + fAngleMod;
				if (fAngle <= -Math.PI) {
					fAngle += 2 * Math.PI;
				}
				if (fAngle >= Math.PI) {
					fAngle -= 2 * Math.PI;
				}
			}
			pdata.angle = fAngle;
			// changer le sprite
			let nFract = entity.sprite.frameCount();
			let fAngleInt = fAngle < 0 ? 2 * Math.PI + fAngle : fAngle;
			let fAngle1 = fAngle / (2 * Math.PI);
			let fAngleFract = (fAngle1 + 1 / (nFract << 1)) % 1;
			let iFract = sb.mod(Math.floor(fAngleFract * nFract), nFract);
			if (iFract < 0) {
				console.log({nFract, fAngleInt, fAngle1, fAngleFract, iFract});
				throw new Error('WTF iFract < 0 !');
			}

			if (!('turning' in pdata)) {
				pdata.turning = [iFract];
			}
			if (pdata.turning[0] === iFract) {
				pdata.turning = [iFract];
			} else {
				pdata.turning.push(iFract);
				while (pdata.turning.length > 6) {
					pdata.turning.shift();
				}
				entity.sprite.frame(pdata.turning[0]);
			}
			this.advance(entity);
		}
	}
}

export default Aerostat;