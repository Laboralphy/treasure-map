import WorldGenerator from './WorldGenerator';
import Webworkio from 'webworkio';
import * as CONSTS from './consts';

class Worker {

    log(...args) {
        console.log('[ww]', ...args);
    }

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
        vorCellSize,
        vorClusterSize,
        physicGridSize,
        scale,
        turbulence
    }) {

      this.log('creating world generator');
      this._wg = new WorldGenerator({
        seed,
        palette,
        cache,
        tileSize,
        vorCellSize,
        vorClusterSize,
        names,
        physicGridSize,
        scale,
        turbulence
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

        wwio.on('options', (options) => {
            this.actionOptions(options);
        });

        wwio.on('tile', ({x, y}, cb) => {
            cb(this._wg.computeTile(x, y));
        });

        wwio.on('vor', ({x, y}, cb) => {
            cb(this._wg.computeVoronoiHeightMap(x, y));
        })

        wwio.on('find-tile', (oSearch, cb) => {
            let tile = null;
            switch (oSearch.type) {
                case CONSTS.FIND_TILE_CLOSEST_BELOW_ALTITUDE:
                    tile = this._wg.findClosestTileBelowAltitude(
                        oSearch.x,
                        oSearch.y,
                        oSearch.z,
                        oSearch.p
                    );
                    break;

                case CONSTS.FIND_TILE_COAST_NEAR_DIRECTION:
                    tile = this._wg.findCoastalTileDirection(
                        oSearch.x,
                        oSearch.y,
                        oSearch.a
                    )
            }
            cb(tile);
        });

        this._wwio = wwio;
    }
}

export default Worker;
