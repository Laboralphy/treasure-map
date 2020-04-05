import DATA from "./data";
import osge from "./libs/osge";
import THINKERS from "./thinkers";
import {Vector} from './libs/geometry';

let LAST_ENTITY_ID = 0;

class Entity {

    constructor(sResRef) {
        this.id = ++LAST_ENTITY_ID;
        let oBaseBlueprint = DATA['blueprints/' + sResRef];
        if (oBaseBlueprint === undefined) {
            throw new Error('this blueprint does not exist : "' + sResRef + '"');
        }
        let blueprint = Object.assign({
            "angle": 0,                   // angle de cap
            "angleSpeed": 0,              // amplitude d emofication de l'angle
            "position": new Vector(),     // position actuelle
            "destination": new Vector(),  // position vers laquelle on se dirige
            "enginePower": 0,             // inc/dec de la vitesse du moteur
            "speed": 0,                   // vitesse actuelle
            "maxSpeed": 0,                // vitesse max
            "sprite": Object.assign({}, DATA['tiles/' + oBaseBlueprint.tileset]),
            "thinker": "",
            "repulse": new Vector(),
            "sector": {
                x: 0,
                y: 0
            },
            "input": {
                "keys": {},
            }
        }, oBaseBlueprint);
        blueprint.sprite.ref = new Vector(blueprint.sprite.ref.x, blueprint.sprite.ref.y);
        this.data = blueprint;
    }

    /**
     * fait apparaitre l'entité à la position spécifiée
     * @param vPosition
     */
    async spawn(vPosition) {
        const sprite = new osge.Sprite();
        const blueprint = this.data;
        await sprite.define(blueprint.sprite);
        sprite.z = blueprint.z || 0;
        if (!(blueprint.thinker in THINKERS)) {
            throw new Error('this thinker does not exist : "' + blueprint.thinker);
        }
        this.thinker = THINKERS[blueprint.thinker];
        blueprint.position.set(vPosition);
        blueprint.destination.set(vPosition);
        this.sprite = sprite;
    }
}

export default Entity;