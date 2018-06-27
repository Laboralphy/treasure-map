import o876 from '../../o876';
const Vector = o876.geometry.Vector;

const DATA = {
	"angle": 0,                   // angle de cap
	"angleSpeed": 0,              // amplitude d emofication de l'angle
	"position": new Vector(),             // position actuelle
	"destination": new Vector(),          // position vers laquelle on se dirige
	"enginePower": 0,             // inc/dec de la vitesse du moteur
	"speed": 0,                   // vitesse actuelle
	"maxSpeed": 2                 // vitesse max
};

export default DATA;