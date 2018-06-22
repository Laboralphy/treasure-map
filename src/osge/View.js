import o876 from '../o876/index';

const Vector = o876.geometry.Vector;

class View {
	constructor() {
		this.origin = new Vector;
		this.width = 0;
		this.height = 0;
	}
}

export default View;