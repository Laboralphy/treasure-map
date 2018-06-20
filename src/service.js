import WorldGenerator from './WorldGenerator';
import Webworkio from 'webworkio';


class Service {
    constructor() {
        this._generator = null;
        let wwio = new Webworkio();
		wwio.worker();

		wwio.on('init', (options) => {
		    this._generator = new WorldGenerator(options);
        });

		wwio.on('options', (options) => {
			this._generator.options(options);
		});

        wwio.on('tile', ({x, y}, cb) => {
            cb({tile: this._generator.computeCellCache(x, y)});
        });

		this._wwio = wwio;
	}
}

const service = new Service();
