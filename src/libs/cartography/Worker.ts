import WorldGenerator from './WorldGenerator';
import { WorkerServer } from '../worker-channel';
import { VERSION } from './version';
import type { InitPayload, TilePayload, OptionsPayload } from './protocol';

class Worker {
    private _wg: WorldGenerator | null = null;

    constructor() {
        new WorkerServer()
            .on<InitPayload, { status: string }>('init', async (payload) => {
                this._wg = new WorldGenerator({
                    seed: payload.seed,
                    palette: payload.palette,
                    cache: payload.cache,
                    tileSize: payload.tileSize,
                    names: payload.names,
                    physicGridSize: payload.physicGridSize,
                    scale: payload.scale
                });
                return { status: 'done' };
            })
            .on<unknown, { version: string }>('version', async () => ({ version: VERSION }))
            .on<OptionsPayload, void>('options', async (payload) => {
                this._wg!.options({ cache: payload.cache });
            })
            .on<TilePayload, ReturnType<WorldGenerator['computeTile']>>('tile', async ({ x, y }) => {
                return this._wg!.computeTile(x, y);
            })
            .listen();
    }
}

export default Worker;
