import Geometry from 'libs/geometry';
import { mod } from 'libs/r-mod';
import type { IEntity, IGame, IThinker } from '../types/game';

const Vector = Geometry.Vector;

class Aerostat implements IThinker {
    advance(entity: IEntity): void {
        if (!entity.destination.isEqual(entity.position)) {
            const vDiff = entity.destination.sub(entity.position);
            const nDist = vDiff.magnitude();
            let ms = entity.maxSpeed;
            let speed = entity.speed;
            const acc = entity.enginePower;
            const DECCEL_THRESHOLD_DIST = ms << 3;
            if (nDist < DECCEL_THRESHOLD_DIST) {
                ms *= nDist / DECCEL_THRESHOLD_DIST;
            }
            speed = Math.min(ms, speed + acc);
            const vMove = Vector.fromPolar(entity.angle, 1);
            vMove.scale(speed);
            entity.speed = speed;
            entity.position.translate(vMove);
        }
    }

    think(entity: IEntity, _game: IGame): void {
        if (!entity.destination.isEqual(entity.position)) {
            if (entity.destination.sub(entity.position).magnitude() <= entity.maxSpeed) {
                entity.position.set(entity.destination);
                return;
            }

            if (!('angleVis' in entity)) {
                entity.angleVis = entity.angle;
            }
            const fAngleCurr = entity.angle;
            const fAngleDest = entity.destination.sub(entity.position).direction();
            let fAngle: number;

            const vBlimp = Vector.fromPolar(fAngleCurr, 1);
            const vCap = Vector.fromPolar(fAngleDest, 1);
            const fAngleDeriv = Math.abs(vBlimp.angle(vCap));
            if (fAngleDeriv < entity.angleSpeed) {
                fAngle = fAngleDest;
            } else {
                const fAngleDestInv = entity.position.sub(entity.destination).direction();
                entity.aimedAngle = fAngleDest;
                let fAngleMod: number;
                if (Math.sign(fAngleDest) === Math.sign(fAngleCurr)) {
                    fAngleMod = Math.sign(fAngleDest - fAngleCurr);
                } else {
                    fAngleMod = Math.sign(fAngleCurr - fAngleDestInv);
                }
                fAngleMod *= entity.angleSpeed;
                fAngle = entity.angle + fAngleMod;
                if (fAngle <= -Math.PI) { fAngle += 2 * Math.PI; }
                if (fAngle >= Math.PI)  { fAngle -= 2 * Math.PI; }
            }
            entity.angle = fAngle;

            const nFract = entity.sprite.frameCount();
            const fAngle1 = fAngle / (2 * Math.PI);
            const fAngleFract = (fAngle1 + 1 / (nFract << 1)) % 1;
            const iFract = mod(Math.floor(fAngleFract * nFract), nFract);
            if (iFract < 0) {
                throw new Error('WTF iFract < 0 !');
            }

            if (!('turning' in entity)) {
                entity.turning = [iFract];
            }
            if (entity.turning![0] === iFract) {
                entity.turning = [iFract];
            } else {
                entity.turning!.push(iFract);
                while (entity.turning!.length > 6) {
                    entity.turning!.shift();
                }
                entity.sprite.frame = entity.turning![0];
            }
            this.advance(entity);
        }
    }
}

export default Aerostat;
