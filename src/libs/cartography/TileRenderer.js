/**
 * A partir des donnée d'une tuile, créé un canvas et ajoute des information visuel, et paysagique
 */
import CanvasHelper from "../canvas-helper";
import PixelProcessor from "../pixel-processor";
import Rainbow from "../rainbow";
import ImageLoader from "../image-loader";

const PHYS_WATER = 11;
const PHYS_SHORE = 12;
const PHYS_COAST = 22;
const PHYS_PLAIN = 23;
const PHYS_FOREST = 33;
const PHYS_PEAK = 55;

const COORDS_FONT_DEFINITION = 'italic 13px Times New Roman';
const FONT_SIZE = 28;
const FONT_PAD = 4;
const FONT_STROKE_WIDTH = 2;
const CITY_FONT_DEFINITION = 'px bold Times New Roman';

class TileRenderer {
    constructor({
        drawGrid = true,
        drawCoords = true,
        drawBrushes = true
    } = {}) {
        this._brushes = {};
        this._drawGrid = drawGrid;
        this._drawCoords = drawCoords;
        this._drawBrushes = drawBrushes;
    }

    /**
     * Chargement des sceneries
     * le format est le suivant :
     * [
     *   {
     *      type,  type de brush (city, land...)
     *      src,   url de l'image
     *      code   code supplémentaire pour différentier kles brush de même type, cela varie en fonction du type
     *   }
     */
    async loadBrushes(brushes) {
        // brushes
        for (let i = 0, l = brushes.length; i < l; ++i) {
            const brush = brushes[i];
            const type = brush.type;
            if (!(type in this._brushes)) {
                this._brushes[type] = {};
            }
            this._brushes[type][brush.code] = {
                img: await ImageLoader.load(brush.src),
                ...brush
            };
        }
        return this._brushes;
    }

    getBrushesStatus() {
        const a = [];
        for (let b in this._brushes) {
            const brush = this._brushes[b];
            a.push({type: b, count: Object.keys(brush).length})
        }
        return a;
    }

    paintLinesCoordinates(tile, xCurs, yCurs) {
        let ctx = tile.getContext('2d');
        if (this._drawGrid) {
            ctx.strokeStyle = 'rgba(57, 25, 7, 0.5)';
            ctx.beginPath();
            ctx.moveTo(0, tile.height - 1);
            ctx.lineTo(0, 0);
            ctx.lineTo(tile.width - 1, 0);
            ctx.stroke();
        }
        if (this._drawCoords) {
            let sText;
            ctx.font = COORDS_FONT_DEFINITION;
            ctx.textBaseline = 'top';
            ctx.strokeStyle = '#c7ab74';
            ctx.lineWidth = 2;
            ctx.fillStyle = 'rgba(57, 25, 7)';
            sText = 'lat:  ' + yCurs.toString();
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

    setCityNameFont(ctx, nFontSize) {
        ctx.textBaseline = 'top';
        ctx.strokeStyle = '#c7ab74';
        ctx.lineWidth = FONT_STROKE_WIDTH;
        ctx.fillStyle = 'rgba(57, 25, 7)';
        ctx.font = nFontSize + CITY_FONT_DEFINITION;
    }


    drawCity(oCanvas, data, physicGridSize) {
        const {x, y, width, height, name, seed, dir} = data;
        let nFontSize = FONT_SIZE;
        if (name.length > 10) {
            nFontSize *= 0.8;
        }
        const ctx = oCanvas.getContext('2d');
        const xm = x * physicGridSize, ym = y * physicGridSize;
        const wm = width * physicGridSize;
        const hm = height * physicGridSize;

        const sOrient = dir === 'n' || dir === 's'
            ? 'ns'
            : 'ew';

        const cities = Object
            .values(this._brushes.city)
            .filter(b => b.orientation === sOrient);
        const city = cities[seed % cities.length];
        switch (dir) {
            case 'w':
                ctx.drawImage(city.img , xm + physicGridSize, ym);
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
        }

        this.setCityNameFont(ctx, nFontSize);
        // déterminer si le nom de la ville sera en haut ou en bas
        let xf = xm, yf = ym + hm;
        ctx.textBaseline = 'top';
        if (yf + FONT_SIZE >= oCanvas.height) {
            ctx.textBaseline = 'bottom';
            yf = ym - FONT_PAD;
        }
        //
        // if (yf - FONT_SIZE - FONT_PAD < 0) {
        //     // si on l'écrit au dessus, le nom de la ville sera tronqué
        //     yf += hm + FONT_PAD;
        // } else {
        //     yf -= FONT_SIZE + FONT_PAD;
        // }
        const wt = ctx.measureText(name).width;
        if (xf + wt >= oCanvas.width) {
            xf = oCanvas.width - wt - 1;
        }
        ctx.strokeText(name, xf, yf);
        ctx.fillText(name, xf, yf);
    }

    paintSceneries(oCanvas, data, physicGridSize) {
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

    paintLandBrushes(ctx, physicMap, physicGridSize) {
        if (this._drawBrushes) {
            const oLandBrushes = this._brushes.land;
            physicMap.forEach((row, y) => row.forEach((cell, x) => {
                if ((x & 1) === (y & 1)) {
                    const sScen = cell;
                    if (sScen in oLandBrushes) {
                        ctx.drawImage(oLandBrushes[sScen].img, x * physicGridSize, y * physicGridSize);
                    }
                }
            }));
        }
    }

    render(oTileData, cvs) {
        const {colorMap, physicMap, sceneries, physicGridSize} = oTileData;
        const cvsColor = CanvasHelper.createCanvas(colorMap.length, colorMap.length);
        PixelProcessor.process(cvsColor, pp => {
            const nColor = colorMap[pp.y][pp.x];
            let oColor = Rainbow.parse(nColor);
            pp.color.r = oColor.r;
            pp.color.g = oColor.g;
            pp.color.b = oColor.b;
            pp.color.a = oColor.a;
        });
        // ajout des brushes
        const ctx = cvs.getContext('2d');
        ctx.drawImage(cvsColor, 0, 0, cvsColor.width, cvsColor.height, 0, 0, cvs.width, cvs.height);
        // ajout des sceneries
        this.paintLandBrushes(ctx, physicMap, physicGridSize);
        this.paintLinesCoordinates(cvs, oTileData.x, oTileData.y);
        this.paintSceneries(cvs, sceneries, physicGridSize);
        return cvs;
    }
}

export default TileRenderer;