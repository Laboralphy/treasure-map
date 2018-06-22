import o876 from '../o876/index';
import Animation from './Animation';

const Vector = o876.geometry.Vector;

class Sprite {
	constructor() {
		this.position = new Vector();
		this.image = null;
		this.frameWidth = 0;
		this.frameHeight = 0;
		this.animation = new Animation();
	}


}

export default Sprite;