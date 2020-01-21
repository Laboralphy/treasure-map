import Boat from './Boat';
import Automaton from '../automaton';
import Geometry from '../geometry';

class AIBoatAbstract extends Boat {


    init(entity) {
        entity.data.ai = {
            automaton: new Automaton(),
        };
        entity.data.ai.automaton.verbose = false;
        entity.data.ai.automaton.instance = this;
        entity.data.ai.automaton.transitions = this.getAISchema();
    }

    getAISchema() {
        return {
            "$idle": { // rien faire
            },
        };
    }

    /**
     * ne fait rien
     */
    $idle(entity) {

    }

    getDistanceFromTarget(entity, target) {
        const xTarget = target.data.position.x;
        const yTarget = target.data.position.y;
        const xPos = entity.data.position.x;
        const yPos = entity.data.position.y;
        return Geometry.Helper.distance(xPos, yPos, xTarget, yTarget);
    }

    stopEngine(entity) {
        const {dx, dy} = Geometry.Helper.polar2rect(entity.data.angleVis, 16);
        const v = new Geometry.Vector(dx, dy);
        entity.data.destination = entity.data.position.add(v);
    }

    $always(entity) {
        return true;
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

export default AIBoatAbstract;