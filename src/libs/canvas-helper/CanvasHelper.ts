let bDefaultImageSmoothing = true;

interface TextStyles {
    fill?: string | false;
    stroke?: string | boolean;
    font?: string;
}

class CanvasHelper {
    static createCanvas(width: number, height: number): HTMLCanvasElement {
        const c = document.createElement('canvas');
        c.width = width;
        c.height = height;
        CanvasHelper.setImageSmoothing(c, bDefaultImageSmoothing);
        return c;
    }

    static setDefaultImageSmoothing(b: boolean): void {
        bDefaultImageSmoothing = b;
    }

    static getDefaultImageSmoothing(): boolean {
        return bDefaultImageSmoothing;
    }

    static getData(oCanvas: HTMLCanvasElement, sType: string = 'image/png'): string {
        return oCanvas.toDataURL(sType);
    }

    static setImageSmoothing(oCanvas: HTMLCanvasElement, b: boolean): void {
        const oContext = oCanvas.getContext('2d')!;
        oContext.imageSmoothingEnabled = b;
    }

    static getImageSmoothing(oCanvas: HTMLCanvasElement): boolean {
        const oContext = oCanvas.getContext('2d')!;
        return !!oContext.imageSmoothingEnabled;
    }

    static isCanvas(c: unknown): c is HTMLCanvasElement {
        return c instanceof HTMLCanvasElement;
    }

    static isImage(c: unknown): c is HTMLImageElement {
        return c instanceof Image;
    }

    static cloneCanvas(oCanvas: HTMLCanvasElement | HTMLImageElement, fScale: number = 1): HTMLCanvasElement {
        let w: number, h: number;
        if (CanvasHelper.isImage(oCanvas)) {
            w = oCanvas.naturalWidth;
            h = oCanvas.naturalHeight;
        } else {
            w = oCanvas.width;
            h = oCanvas.height;
        }
        const nw = w * fScale | 0;
        const nh = h * fScale | 0;
        const c = CanvasHelper.createCanvas(nw, nh);
        const ctx = c.getContext('2d')!;
        if (fScale === 1) {
            ctx.drawImage(oCanvas, 0, 0);
        } else {
            ctx.drawImage(oCanvas, 0, 0, w, h, 0, 0, nw, nh);
        }
        return c;
    }

    static applyFilter(oCanvas: HTMLCanvasElement, f: (x: number, y: number, color: { r: number; g: number; b: number; a: number }) => void): void {
        const oCtx = oCanvas.getContext('2d')!;
        const W = oCanvas.width;
        const H = oCanvas.height;
        const oImgData = oCtx.getImageData(0, 0, W, H);
        const aPixData = oImgData.data;
        const nPixCount = aPixData.length;
        const color = { r: 0, g: 0, b: 0, a: 0 };
        let x = 0, y = 0;
        for (let iPix = 0; iPix < nPixCount; iPix += 4) {
            color.r = aPixData[iPix];
            color.g = aPixData[iPix + 1];
            color.b = aPixData[iPix + 2];
            color.a = aPixData[iPix + 3];
            f(x, y, color);
            aPixData[iPix]     = Math.min(255, Math.max(0, color.r | 0));
            aPixData[iPix + 1] = Math.min(255, Math.max(0, color.g | 0));
            aPixData[iPix + 2] = Math.min(255, Math.max(0, color.b | 0));
            aPixData[iPix + 3] = Math.min(255, Math.max(0, color.a | 0));
            if (++x >= W) {
                ++y;
                x = 0;
            }
        }
        oCtx.putImageData(oImgData, 0, 0);
    }

    static loadCanvas(sUrl: string): Promise<HTMLCanvasElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => {
                resolve(CanvasHelper.cloneCanvas(image));
            });
            image.addEventListener('error', () => {
                reject(new Error('CanvasHelper.loadImage : Error while loading this image : "' + sUrl + '"'));
            });
            image.src = sUrl;
        });
    }

    static resize(oCanvas: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement {
        const oNewCanvas = this.createCanvas(width, height);
        CanvasHelper.setImageSmoothing(oNewCanvas, CanvasHelper.getImageSmoothing(oCanvas));
        const ctx = oNewCanvas.getContext('2d')!;
        ctx.drawImage(oCanvas, 0, 0, oCanvas.width, oCanvas.height, 0, 0, oNewCanvas.width, oNewCanvas.height);
        return oNewCanvas;
    }

    static text(oCanvas: HTMLCanvasElement, sText: string, x: number, y: number, oStyles: CanvasGradient | string | TextStyles, wMax: number, h: number): void {
        const CESURE = ' ';
        const bGradient = oStyles instanceof CanvasGradient;
        const bObject = !bGradient && (oStyles !== null && (typeof oStyles === 'object'));
        const oContext = oCanvas.getContext('2d')!;
        if (oStyles instanceof CanvasGradient || typeof oStyles === 'string') {
            oContext.fillStyle = oStyles;
        }
        let bFill = true;
        let bStroke = false;
        if (bObject) {
            const styles = oStyles as TextStyles;
            if ('fill' in styles) {
                if (styles.fill === false) {
                    bFill = false;
                } else {
                    oContext.fillStyle = styles.fill as string;
                }
            }
            if ('stroke' in styles) {
                if (styles.stroke === true) {
                    bStroke = true;
                } else {
                    bStroke = true;
                    oContext.fillStyle = styles.stroke as string;
                }
            }
            if ('font' in styles && styles.font) {
                oContext.font = styles.font;
            }
        }
        const aText = sText
            .replace(/\n/g, '\n ')
            .split(CESURE)
            .filter(s => s.length > 0);
        let xCurs = 0, yCurs = 0;
        let aLine: string[] = [];
        const commitText = () => {
            const sLine = aLine.join('');
            if (bStroke) {
                oContext.strokeText(sLine, x + xCurs, y + yCurs, wMax);
            }
            if (bFill) {
                oContext.fillText(sLine, x, y + yCurs, wMax);
            }
            xCurs = 0;
            yCurs += h;
            aLine = [];
        };
        while (aText.length) {
            const sWord = aText.shift()! + CESURE;
            const mt = oContext.measureText(sWord);
            if (sWord.endsWith('\n') || (xCurs + mt.width) > wMax) {
                commitText();
            } else {
                xCurs += mt.width;
            }
            aLine.push(sWord);
        }
        commitText();
    }
}

export default CanvasHelper;
