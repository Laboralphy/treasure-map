/** Animation : Classe chargée de calculer les frames d'animation
 * O876 raycaster project
 * 2012-01-01 Raphaël Marandet
 */

const LOOP_NONE = 0;
const LOOP_FORWARD = 1;
const LOOP_YOYO = 2;
const LOOP_RANDOM = 3;

class Animation {
	constructor({
		start = 0,
		duration = 0,
		count = 1,
		loop = 0
	}) {
		this.frozen = true;
		this.start = start; // frame de début
		this.index = 0; // index de la frame en cours d'affichage
		this.count = count; // nombre total de frames
		this.duration = duration; // durée de chaque frame, plus la valeur est grande plus l'animation est lente
		this.time = 0; // temps
		this.loop = loop; // type de boucle 1: boucle forward; 2: boucle yoyo 3: random
		this.frame = 0; // Frame actuellement affichée
		this._loopDir = 1; // direction de la boucle (pour yoyo)
	  	this._bOver = false;
	}

	animate(nInc) {
		if (this.frozen) {
			return this.frame;
		}
		if (this.count <= 1 || this.duration === 0) {
			return this.index + this.start;
		}
		this.time += nInc;
		// Dépassement de duration (pour une seule fois)
		if (this.time >= this.duration) {
			this.time -= this.duration;
			if (this.loop === 3) {
				this.index = Math.random() * this.count | 0;
			} else {
				this.index += this._loopDir;
			}
		}
		// pour les éventuels très gros dépassement de duration (pas de boucle)
		if (this.time >= this.duration) {
			this.index += this._loopDir * (this.time / this.duration | 0);
			this.time %= this.duration;
		}

		switch (this.loop) {
			case 0:
				if (this.index >= this.count) {
					this.index = this.count - 1;
					this._bOver = true;
				}
				break;

			case 1:
				if (this.index >= this.count) {
					this.index = 0;
				}
				break;

			case 2:
				if (this.index >= this.count) {
					this.index = this.count - 1;
					this._loopDir = -1;
				}
				if (this.index <= 0) {
					this._loopDir = 1;
					this.index = 0;
				}
				break;

			default:
				if (this.index >= this.count) {
					this.index = this.count - 1;
				}
		}
		this.frame = this.index + this.start;
		return this.frame;
	}

	reset() {
		this.index = 0;
		this.time = 0;
		this._loopDir = 1;
		this._bOver = false;
	}

	isOver() {
		return this._bOver;
	}
}

export default Animation;