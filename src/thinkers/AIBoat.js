import Boat from './Boat';
import Automaton from '../automaton';
import {geometry} from '../o876';

class AIBoat extends Boat {


    init(entity) {
        entity.data.ai = {
            automaton: new Automaton(),
            target: entity.game.state.player, // entité cible
            farDistance: 384, // au dela de cette distance, la cible est trop loin
            closeDistance: 128, // en dessous de cette distance, la cible est trop proche
        };

        const CHART = {
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

        entity.data.ai.automaton.verbose = false;
        entity.data.ai.automaton.instance = this;
        entity.data.ai.automaton.transitions = CHART;
    }

    /**
     * ne fait rien
     */
    $idle(entity) {

    }

    getDistanceFromTarget(entity) {
        const aiData = entity.data.ai;
        const oTarget = aiData.target;
        const xTarget = oTarget.data.position.x;
        const yTarget = oTarget.data.position.y;
        const xPos = entity.data.position.x;
        const yPos = entity.data.position.y;
        return geometry.Helper.distance(xPos, yPos, xTarget, yTarget);
    }

    stopEngine(entity) {
        const {dx, dy} = geometry.Helper.polar2rect(entity.data.angleVis, 16);
        const v = new geometry.Vector(dx, dy);
        entity.data.destination = entity.data.position.add(v);
    }

    $hasTarget(entity) {
        return !!entity.data.ai.target;
    }

    $hasNoTarget(entity) {
        return !entity.data.ai.target;
    }

    $isReadyToFire(entity) {
        return true;
    }

    $always(entity) {
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
     * aller vers la cible
     * @param entity
     */
    $stop(entity) {
        this.stopEngine(entity);
        // const vSelf = entity.data.position;
        // const vTarget = entity.data.ai.target.data.position;
        // const vGo = vSelf.sub(vTarget).normalize().mul(entity.data.ai.closeDistance);
        // entity.data.position.set(vGo);
    }

    /**
     * tirer sur la cible
     * @param entity
     */
    $fire(entity) {
        const d = this.getDistanceFromTarget(entity);
        const dx = (Math.random() * 2 * d - d) * 0.125;
        const dy = (Math.random() * 2 * d - d) * 0.125;
        const vAim = new geometry.Vector(dx, dy);
        vAim.translate(entity.data.ai.target.data.position);
        entity.data.input.fire = vAim;
    }

    /**
     * on est loin de la cible ?
     */
    $isTooFar(entity) {
        return this.getDistanceFromTarget(entity) > entity.data.ai.farDistance;
    }

    /**
     * on est proche de la cible ?
     */
    $isTooClose(entity) {
        return this.getDistanceFromTarget(entity) < entity.data.ai.closeDistance;
    }

    think(entity) {
        if (!entity.data.thought) {
            this.init(entity);
        }
        if ((entity.game.state.time & 15) === 0) {
            entity.data.ai.automaton.process(entity);
        }
        super.think(entity);
    }
}

export default AIBoat;