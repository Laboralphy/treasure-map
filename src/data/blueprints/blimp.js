import o876 from '../../o876/index';
const Vector = o876.geometry.Vector;

const DATA = {
	"angle": 0,                   // angle de cap
	"angleSpeed": 0.1,              // amplitude d emofication de l'angle
	"position": new Vector(),     // position actuelle
	"destination": new Vector(),  // position vers laquelle on se dirige
	"enginePower": 0.1,             // inc/dec de la vitesse du moteur
	"speed": 0,                   // vitesse actuelle
	"maxSpeed": 2,                // vitesse max
	"sprite": {
		"tileset": "blimp_1",
		"frames": 32,
		"ref": new Vector(0, 41)
	},
	"thinker": "aerostat"
};

export default DATA;