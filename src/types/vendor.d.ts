declare module 'webworkio' {
    class Webworkio {
        worker(url?: string): void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        on(event: string, handler: (...args: any[]) => void): void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        emit(event: string, data: any, callback?: (result: any) => void): void;
        terminate(): void;
    }
    export default Webworkio;
}

declare module '@laboralphy/pixel-processor' {
    interface PP {
        x: number;
        y: number;
        color: { r: number; g: number; b: number; a: number };
    }
    const PixelProcessor: {
        paint(canvas: HTMLCanvasElement, callback: (pp: PP) => void): void;
    };
    export default PixelProcessor;
}

declare module 'events' {
    class EventEmitter {
        on(event: string, listener: (...args: unknown[]) => void): this;
        off(event: string, listener: (...args: unknown[]) => void): this;
        emit(event: string, ...args: unknown[]): boolean;
        once(event: string, listener: (...args: unknown[]) => void): this;
        removeListener(event: string, listener: (...args: unknown[]) => void): this;
        removeAllListeners(event?: string): this;
        listeners(event: string): ((...args: unknown[]) => void)[];
    }
    export default EventEmitter;
}
