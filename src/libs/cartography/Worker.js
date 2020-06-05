import WorldGenerator from './WorldGenerator';
import Webworkio from 'webworkio';
import {VERSION} from './version';

class Worker {
    /**
     * Initialisation des options
     * palette {url}
     * names {url}
     * seed {number}
     *
     * @param options
     * @returns {Promise<void>}
     */
    async actionInit({
        palette,
        names,
        seed,
        cache,
        tileSize,
        physicGridSize,
        scale
    }) {
      this._wg = new WorldGenerator({
        seed,
        palette,
        cache,
        tileSize,
        names,
        physicGridSize,
        scale
      });
      return true;
    }

    actionOptions({
        cache
    }) {
        this._wg._cache.tile.size = cache;
    }

    constructor() {
        this._wg = null;
        let wwio = new Webworkio();
        wwio.worker();
        wwio.on('init', async (options, cb) => {
          try {
            await this.actionInit(options);
            cb({status: 'done'});
          } catch (e) {
            cb({status: 'error', error: e.message});
          }
        });

        wwio.on('version', (options, cb) => {
            cb({version: VERSION});
        });

        wwio.on('options', (options) => {
            this.actionOptions(options);
        });

        wwio.on('tile', ({x, y}, cb) => {
            cb(this._wg.computeTile(x, y));
        });
        this._wwio = wwio;
    }
}

export default Worker;
