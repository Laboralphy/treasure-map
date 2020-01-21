import Geometry from '../geometry';
import AIBoatAbstract from './AIBoatAbstract';

const AI_SCHEMA = {
    "$idle": { // rien faire
        "$hasTarget": "$hunting"
    },

    "$hunting": {
        "$hasNoTarget": "$idle",
        "$isTooClose": "$stop",
        "$isTooFar": "$goCloser",
        "$isReadyToFire": "$fire",
    },

    "$goCloser": { // se rapprocher
        "$hasNoTarget": "$idle",
        "$always": "$hunting",
    },

    "$stop": { // s'éloigner'
        "$always": "$hunting"
    },

    "$fire": {
        "$always": "$hunting"
    }
};

class AIBoatChaser extends AIBoatAbstract {


    init(entity) {
        super.init(entity);
        const ai = entity.data.ai;
        ai.target = entity.game.state.player; // entité cible
        ai.farDistance = 384; // au dela de cette distance, la cible est trop loin
        ai.closeDistance = 128;  // en dessous de cette distance, la cible est trop proche
    }

    getAISchema() {
        return AI_SCHEMA;
    }


    /**
     * renvoie true si un cible a été définie
     * @param entity
     * @return {boolean}
     */
    $hasTarget(entity) {
        return !!entity.data.ai.target;
    }

    /**
     * renvoie true si aucune cible définie
     * @param entity
     * @return {boolean}
     */
    $hasNoTarget(entity) {
        return !entity.data.ai.target;
    }

    /**
     * Renvoie true si prêt à tirer
     * @param entity
     * @return {boolean}
     */
    $isReadyToFire(entity) {
        return true;
    }

    /**
     * aller vers la cible
     * @param entity
     */
    $goCloser(entity) {
        entity.data.destination.set(entity.data.ai.target.data.position);
    }
    /**
     * Arret des moteurs
     * @param entity
     */
    $stop(entity) {
        this.stopEngine(entity);
    }

    /**
     * tirer sur la cible
     * @param entity
     */
    $fire(entity) {
        const d = this.getDistanceFromTarget(entity, entity.data.ai.target);
        const dx = (Math.random() * 2 * d - d) * 0.125;
        const dy = (Math.random() * 2 * d - d) * 0.125;
        const vAim = new Geometry.Vector(dx, dy);
        vAim.translate(entity.data.ai.target.data.position);
        entity.data.input.fire = vAim;
    }

    /**
     * on est loin de la cible ?
     */
    $isTooFar(entity) {
        return this.getDistanceFromTarget(entity, entity.data.ai.target) > entity.data.ai.farDistance;
    }

    /**
     * on est proche de la cible ?
     */
    $isTooClose(entity) {
        return this.getDistanceFromTarget(entity, entity.data.ai.target) < entity.data.ai.closeDistance;
    }
}

export default AIBoatChaser;