import WorldGenerator from './WorldGenerator';
import Webworkio from 'webworkio';
import Names from '../../names';


class Index {
    constructor() {
        this._generator = null;
        let wwio = new Webworkio();
		wwio.worker();

		wwio.on('init', async (options, cb) => {
		    this._generator = new WorldGenerator(options);
		    await Names.loadLists({ towns: '../public/data/towns-fr.txt' });
		    cb(true);
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

const service = new Index();
