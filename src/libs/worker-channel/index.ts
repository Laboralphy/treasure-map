interface PendingRequest {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
}

interface WorkerGlobal {
    onmessage: ((e: MessageEvent) => void) | null;
    postMessage(data: unknown): void;
}

export class WorkerChannel {
    private _worker: Worker;
    private _pending = new Map<number, PendingRequest>();
    private _nextId = 0;

    constructor(url: string) {
        this._worker = new Worker(url);
        this._worker.onmessage = ({ data }: MessageEvent) => {
            const p = this._pending.get(data.id);
            if (!p) return;
            this._pending.delete(data.id);
            if (data.error) {
                p.reject(new Error(data.error));
            } else {
                p.resolve(data.payload);
            }
        };
    }

    request<T>(event: string, payload?: unknown): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const id = this._nextId++;
            this._pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
            this._worker.postMessage({ id, event, payload });
        });
    }

    send(event: string, payload?: unknown): void {
        this._worker.postMessage({ id: -1, event, payload });
    }

    terminate(): void {
        this._worker.terminate();
    }
}

export class WorkerServer {
    private _handlers = new Map<string, (payload: unknown) => Promise<unknown>>();

    on<T, R>(event: string, handler: (payload: T) => Promise<R>): this {
        this._handlers.set(event, handler as (p: unknown) => Promise<unknown>);
        return this;
    }

    listen(): void {
        const g = self as unknown as WorkerGlobal;
        g.onmessage = async ({ data }: MessageEvent) => {
            const handler = this._handlers.get(data.event);
            if (!handler) return;
            if (data.id === -1) {
                await handler(data.payload);
                return;
            }
            try {
                const result = await handler(data.payload);
                g.postMessage({ id: data.id, payload: result });
            } catch (e) {
                g.postMessage({ id: data.id, error: (e as Error).message });
            }
        };
    }
}
