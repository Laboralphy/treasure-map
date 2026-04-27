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
