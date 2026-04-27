import WorldGenerator from './WorldGenerator';
import Webworkio from 'webworkio';
import { VERSION } from './version';

class Worker {
    private _wg: WorldGenerator | null;
    private _wwio: InstanceType<typeof Webworkio>;

    async actionInit({
        palette,
        names,
        seed,
        cache,
        tileSize,
        physicGridSize,
        scale
    }: {
        palette: Array<{ altitude: number; color: string }>;
        names: string[];
        seed: number;
        cache?: number;
        tileSize: number;
        physicGridSize: number;
        scale?: number;
    }): Promise<boolean> {
        this._wg = new WorldGenerator({ seed, palette, cache, tileSize, names, physicGridSize, scale });
        return true;
    }

    actionOptions({ cache }: { cache: number }): void {
        this._wg!.options({ cache });
    }

    constructor() {
        this._wg = null;
        const wwio = new Webworkio();
        wwio.worker();

        wwio.on('init', async (options: Parameters<Worker['actionInit']>[0], cb: (r: { status: string; error?: string }) => void) => {
            try {
                await this.actionInit(options);
                cb({ status: 'done' });
            } catch (e) {
                cb({ status: 'error', error: (e as Error).message });
            }
        });

        wwio.on('version', (_options: unknown, cb: (r: { version: string }) => void) => {
            cb({ version: VERSION });
        });

        wwio.on('options', (options: { cache: number }) => {
            this.actionOptions(options);
        });

        wwio.on('tile', ({ x, y }: { x: number; y: number }, cb: (r: ReturnType<WorldGenerator['computeTile']>) => void) => {
            cb(this._wg!.computeTile(x, y));
        });

        this._wwio = wwio;
    }
}

export default Worker;
