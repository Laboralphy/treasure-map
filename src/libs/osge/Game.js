import Time from './Time';
import {Vector, View} from '../geometry';
import DOMEvents from './DOMEvents';
import CanvasHelper from "../canvas-helper";


class Game {

  constructor() {
    this._interval = null;
    this.renderCanvas = null;
    this.screenCanvas = null;
    this._time = new Time();
    this._time.period = 40;
    this._rendering = false;
    this.view = new View();
    this.layers = [];
    this.mouse = new Vector();
    this.domevents = new DOMEvents();
    this._perfMonitor = [];
    this._charge = 0;
  }

  set period(value) {
    this._time.period = value;
    if (this._interval !== null) {
      this.restart();
    }
  }

  get period() {
    return this._time.period;
  }

  /**
   * démarrage du timer perttant de lancer l'animation
   * l'animation peut etre stoppée avec stop()
   */
  start() {
    if (this._interval === null) {
      this._interval = setInterval(() => this._doomloop(), this._time.period);
    }
  }

  /**
   * arrêt du timer d'animation
   * l'animation peut etre relancée avec start()
   */
  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  /**
   * relance le timer (lorsque la periode a changé)
   */
  restart() {
    this.stop();
    this.start();
  }

  /**
   * boucle d'animation
   */
  _doomloop() {
    const pn = performance.now();
    let n = this._time.process(pn);
    if (n > 10) {
      n = 10;
    }
    for (let i = 0; i < n; ++i) {
      this.update();
    }
    this.render();
  }

  /**
   * effectue une itération sur toutes les couche graphique créées
   * @param f {function} callback a lancer pour chaque couche graphique
   */
  forEachLayer(f) {
    this.layers.forEach(f);
  }

  /**
   * handler d'évènement de déplacement souris sur la surface
   * @param event {Event} évènement souris
   */
  onMouseMove(event) {
    this.mouse.set(event.offsetX, event.offsetY);
  }


  /**
   * Définition du canvas principal de rendu
   * @param oCanvas {HTMLCanvasElement}
   */
  canvas(oCanvas) {
    if (this.screenCanvas !== oCanvas) {
      this.domevents.on(oCanvas, 'mousemove', event => this.onMouseMove(event));
      this.screenCanvas = oCanvas;
    }
    this.renderCanvas = CanvasHelper.createCanvas(oCanvas.width, oCanvas.height);
    let w = oCanvas.width;
    let h = oCanvas.height;
    this.view.width = w;
    this.view.height = h;
    this.view.offset = new Vector(-(w >> 1), -(h >> 1));
  }

  /**
   * Aucune idée de quoi ca sert ce truc
   * @return {Promise<boolean>}
   */
  init() {
    return Promise.resolve(true);
  }

  /**
   * lance la methode update du layer spécifié
   * @param li {Layer}
   */
  updateLayer(li) {
    li.view = this.view;
    li.update(this._time.period);
  }

  /**
   * lance la methode update de chaque layer
   */
  update() {
    this.forEachLayer(l => this.updateLayer(l))
  }

  /**
   * effectue le rendu des layers dans le canvas d'écrant*.
   */
  render() {
    let sc = this.screenCanvas;
    if (sc) {
      let rc = this.renderCanvas;
      this.forEachLayer(l => {
        l.render(rc);
      });
      requestAnimationFrame(() => sc.getContext('2d')
        .drawImage(rc, 0, 0));
    } else {
      throw new Error('i need a canvas !');
    }
  }
}

export default Game;