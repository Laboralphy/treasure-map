import CanvasHelper from '../canvas-helper';
import PixelProcessor from '@laboralphy/pixel-processor';
import Rainbow from '../rainbow';
import ImageLoader from '../image-loader';
import type { SceneryItem } from './SceneryGenerator';

const PHYS_WATER = 11;
const PHYS_SHORE = 12;
const PHYS_COAST = 22;
const PHYS_PLAIN = 23;
const PHYS_FOREST = 33;
const PHYS_PEAK = 55;

void PHYS_WATER; void PHYS_SHORE; void PHYS_COAST; void PHYS_PLAIN; void PHYS_FOREST; void PHYS_PEAK;

const COORDS_FONT_DEFINITION = 'italic 13px Times New Roman';
const FONT_SIZE = 28;
const FONT_PAD = 4;
const FONT_STROKE_WIDTH = 2;
const CITY_FONT_DEFINITION = 'px bold Times New Roman';

export interface BrushDef {
    type: string;
    src: string;
    code: string | number;
    orientation?: string;
    [key: string]: unknown;
}

interface BrushEntry extends BrushDef {
    img: HTMLImageElement;
}

export interface TileData {
    colorMap: number[][];
    physicMap: Uint8Array[];
    sceneries: SceneryItem[];
    physicGridSize: number;
    x: number;
    y: number;
}

interface TileRendererOptions {
    drawGrid?: boolean;
    drawCoords?: boolean;
    drawBrushes?: boolean;
    drawPhysicCodes?: boolean;
}

class TileRenderer {
    private _brushes: Record<string, Record<string | number, BrushEntry>>;
    private _drawGrid: boolean;
    private _drawCoords: boolean;
    private _drawBrushes: boolean;
    private _drawPhysicCodes: boolean;

    constructor({
        drawGrid = true,
        drawCoords = true,
        drawBrushes = true,
        drawPhysicCodes = false
    }: TileRendererOptions = {}) {
        this._brushes = {};
        this._drawGrid = drawGrid;
        this._drawCoords = drawCoords;
        this._drawBrushes = drawBrushes;
        this._drawPhysicCodes = drawPhysicCodes;
    }

    async loadBrushes(brushes: BrushDef[]): Promise<Record<string, Record<string | number, BrushEntry>>> {
        for (let i = 0, l = brushes.length; i < l; ++i) {
            const brush = brushes[i];
            const type = brush.type;
            if (!(type in this._brushes)) {
                this._brushes[type] = {};
            }
            this._brushes[type][brush.code] = {
                img: await ImageLoader.load(brush.src),
                ...brush
            } as BrushEntry;
        }
        return this._brushes;
    }

    getBrushesStatus(): Array<{ type: string; count: number }> {
        const a: Array<{ type: string; count: number }> = [];
        for (const b in this._brushes) {
            const brush = this._brushes[b];
            a.push({ type: b, count: Object.keys(brush).length });
        }
        return a;
    }

    paintLinesCoordinates(tile: HTMLCanvasElement, xCurs: number, yCurs: number): void {
        const ctx = tile.getContext('2d')!;
        if (this._drawGrid) {
            ctx.strokeStyle = 'rgba(57, 25, 7, 0.5)';
            ctx.beginPath();
            ctx.moveTo(0, tile.height - 1);
            ctx.lineTo(0, 0);
            ctx.lineTo(tile.width - 1, 0);
            ctx.stroke();
        }
        if (this._drawCoords) {
            ctx.font = COORDS_FONT_DEFINITION;
            ctx.textBaseline = 'top';
            ctx.strokeStyle = '#c7ab74';
            ctx.lineWidth = 2;
            ctx.fillStyle = 'rgba(57, 25, 7)';
            let sText = 'lat:  ' + yCurs.toString();
            ctx.strokeText(sText, 25, 4);
            ctx.fillText(sText, 25, 4);
            sText = 'long:  ' + xCurs.toString();
            ctx.save();
            ctx.rotate(-Math.PI / 2);
            ctx.strokeText(sText, -tile.width + 25, 4);
            ctx.fillText(sText, -tile.width + 25, 4);
            ctx.restore();
        }
    }

    setCityNameFont(ctx: CanvasRenderingContext2D, nFontSize: number): void {
        ctx.textBaseline = 'top';
        ctx.strokeStyle = '#c7ab74';
        ctx.lineWidth = FONT_STROKE_WIDTH;
        ctx.fillStyle = 'rgba(57, 25, 7)';
        ctx.font = nFontSize + CITY_FONT_DEFINITION;
    }

    drawCity(oCanvas: HTMLCanvasElement, data: SceneryItem, physicGridSize: number): void {
        const sDebug = this._drawPhysicCodes ? '*' : '';
        const { x, y, width, height, name, seed, dir } = data;
        let nFontSize = FONT_SIZE;
        if (name.length > 10) {
            nFontSize *= 0.8;
        }
        const ctx = oCanvas.getContext('2d')!;
        const xm = x * physicGridSize, ym = y * physicGridSize;
        const wm = width * physicGridSize;
        const hm = height * physicGridSize;
        const sOrient = dir === 'n' || dir === 's' ? 'ns' : 'ew';
        const cities = Object.values(this._brushes.city).filter(b => b.orientation === sOrient);
        const city = cities[seed % cities.length];
        switch (sDebug + dir) {
            case 'w':
                ctx.drawImage(city.img, xm + physicGridSize, ym);
                break;
            case 'e':
                ctx.drawImage(city.img, xm, ym);
                break;
            case 'n':
                ctx.drawImage(city.img, xm, ym + physicGridSize);
                break;
            case 's':
                ctx.drawImage(city.img, xm, ym);
                break;
            default:
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(xm, ym, wm, hm);
                ctx.fillText(x + ':' + y, 0, 0);
        }
        this.setCityNameFont(ctx, nFontSize);
        let xf = xm, yf = ym + hm;
        ctx.textBaseline = 'top';
        if (yf + FONT_SIZE >= oCanvas.height) {
            ctx.textBaseline = 'bottom';
            yf = ym - FONT_PAD;
        }
        const wt = ctx.measureText(name).width;
        if (xf + wt >= oCanvas.width) {
            xf = oCanvas.width - wt - 1;
        }
        ctx.strokeText(name, xf, yf);
        ctx.fillText(name, xf, yf);
    }

    paintSceneries(oCanvas: HTMLCanvasElement, data: SceneryItem[], physicGridSize: number): void {
        if (this._drawBrushes) {
            data.forEach(d => {
                switch (d.type) {
                    case 'city':
                        this.drawCity(oCanvas, d, physicGridSize);
                        break;
                }
            });
        }
    }

    paintLandBrushes(ctx: CanvasRenderingContext2D, physicMap: Uint8Array[], physicGridSize: number): void {
        if (this._drawBrushes) {
            const oLandBrushes = this._brushes.land;
            physicMap.forEach((row, y) => (row as unknown as number[]).forEach((cell, x) => {
                if ((x & 1) === (y & 1)) {
                    if (cell in oLandBrushes) {
                        ctx.drawImage(oLandBrushes[cell].img, x * physicGridSize, y * physicGridSize);
                    }
                }
            }));
        }
        if (this._drawPhysicCodes) {
            ctx.textBaseline = 'top';
            physicMap.forEach((row, y) => (row as unknown as number[]).forEach((cell, x) => {
                const xPix = x * physicGridSize, yPix = y * physicGridSize;
                ctx.fillText(cell.toString(), xPix, yPix);
            }));
        }
    }

    render(oTileData: TileData, cvs: HTMLCanvasElement): HTMLCanvasElement {
        const { colorMap, physicMap, sceneries, physicGridSize } = oTileData;
        const cvsColor = CanvasHelper.createCanvas(colorMap.length, colorMap.length);
        PixelProcessor.paint(cvsColor, (pp: { x: number; y: number; color: { r: number; g: number; b: number; a: number } }) => {
            const nColor = colorMap[pp.y][pp.x];
            const oColor = Rainbow.parse(nColor);
            pp.color.r = oColor.r;
            pp.color.g = oColor.g;
            pp.color.b = oColor.b;
            pp.color.a = oColor.a ?? 255;
        });
        const ctx = cvs.getContext('2d')!;
        ctx.drawImage(cvsColor, 0, 0, cvsColor.width, cvsColor.height, 0, 0, cvs.width, cvs.height);
        this.paintLandBrushes(ctx, physicMap, physicGridSize);
        this.paintLinesCoordinates(cvs, oTileData.x, oTileData.y);
        this.paintSceneries(cvs, sceneries, physicGridSize);
        return cvs;
    }
}

export default TileRenderer;
