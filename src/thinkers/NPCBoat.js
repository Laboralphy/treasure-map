import Boat from './Boat';


class NPCBoat extends Boat {


    phaseInit(entity) {
        entity.data.ai = {
            time: 0,
        }
    }



    phaseIdle() {

    }




    think(entity) {
        if (!entity.data.thought) {
            this.phaseInit(entity);
        }
        super.think(entity);
    }
}

export default NPCBoat;