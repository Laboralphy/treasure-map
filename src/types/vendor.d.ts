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

declare module 'pngjs' {
    export class PNG {
        constructor(options?: { width?: number; height?: number });
        width: number;
        height: number;
        data: Buffer;
        static sync: {
            read(buffer: Buffer): PNG;
            write(png: PNG): Buffer;
        };
    }
}
