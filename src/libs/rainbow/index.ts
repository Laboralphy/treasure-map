interface RGBAColor {
    r: number;
    g: number;
    b: number;
    a?: number;
}

const COLORS: Record<string, string> = {
    aliceblue: '#F0F8FF', antiquewhite: '#FAEBD7', aqua: '#00FFFF', aquamarine: '#7FFFD4',
    azure: '#F0FFFF', beige: '#F5F5DC', bisque: '#FFE4C4', black: '#000000',
    blanchedalmond: '#FFEBCD', blue: '#0000FF', blueviolet: '#8A2BE2', brown: '#A52A2A',
    burlywood: '#DEB887', cadetblue: '#5F9EA0', chartreuse: '#7FFF00', chocolate: '#D2691E',
    coral: '#FF7F50', cornflowerblue: '#6495ED', cornsilk: '#FFF8DC', crimson: '#DC143C',
    cyan: '#00FFFF', darkblue: '#00008B', darkcyan: '#008B8B', darkgoldenrod: '#B8860B',
    darkgray: '#A9A9A9', darkgrey: '#A9A9A9', darkgreen: '#006400', darkkhaki: '#BDB76B',
    darkmagenta: '#8B008B', darkolivegreen: '#556B2F', darkorange: '#FF8C00', darkorchid: '#9932CC',
    darkred: '#8B0000', darksalmon: '#E9967A', darkseagreen: '#8FBC8F', darkslateblue: '#483D8B',
    darkslategray: '#2F4F4F', darkslategrey: '#2F4F4F', darkturquoise: '#00CED1', darkviolet: '#9400D3',
    deeppink: '#FF1493', deepskyblue: '#00BFFF', dimgray: '#696969', dimgrey: '#696969',
    dodgerblue: '#1E90FF', firebrick: '#B22222', floralwhite: '#FFFAF0', forestgreen: '#228B22',
    fuchsia: '#FF00FF', gainsboro: '#DCDCDC', ghostwhite: '#F8F8FF', gold: '#FFD700',
    goldenrod: '#DAA520', gray: '#808080', grey: '#808080', green: '#008000',
    greenyellow: '#ADFF2F', honeydew: '#F0FFF0', hotpink: '#FF69B4', indianred: '#CD5C5C',
    indigo: '#4B0082', ivory: '#FFFFF0', khaki: '#F0E68C', lavender: '#E6E6FA',
    lavenderblush: '#FFF0F5', lawngreen: '#7CFC00', lemonchiffon: '#FFFACD', lightblue: '#ADD8E6',
    lightcoral: '#F08080', lightcyan: '#E0FFFF', lightgoldenrodyellow: '#FAFAD2', lightgray: '#D3D3D3',
    lightgrey: '#D3D3D3', lightgreen: '#90EE90', lightpink: '#FFB6C1', lightsalmon: '#FFA07A',
    lightseagreen: '#20B2AA', lightskyblue: '#87CEFA', lightslategray: '#778899', lightslategrey: '#778899',
    lightsteelblue: '#B0C4DE', lightyellow: '#FFFFE0', lime: '#00FF00', limegreen: '#32CD32',
    linen: '#FAF0E6', magenta: '#FF00FF', maroon: '#800000', mediumaquamarine: '#66CDAA',
    mediumblue: '#0000CD', mediumorchid: '#BA55D3', mediumpurple: '#9370DB', mediumseagreen: '#3CB371',
    mediumslateblue: '#7B68EE', mediumspringgreen: '#00FA9A', mediumturquoise: '#48D1CC',
    mediumvioletred: '#C71585', midnightblue: '#191970', mintcream: '#F5FFFA', mistyrose: '#FFE4E1',
    moccasin: '#FFE4B5', navajowhite: '#FFDEAD', navy: '#000080', oldlace: '#FDF5E6',
    olive: '#808000', olivedrab: '#6B8E23', orange: '#FFA500', orangered: '#FF4500',
    orchid: '#DA70D6', palegoldenrod: '#EEE8AA', palegreen: '#98FB98', paleturquoise: '#AFEEEE',
    palevioletred: '#DB7093', papayawhip: '#FFEFD5', peachpuff: '#FFDAB9', peru: '#CD853F',
    pink: '#FFC0CB', plum: '#DDA0DD', powderblue: '#B0E0E6', purple: '#800080',
    rebeccapurple: '#663399', red: '#FF0000', rosybrown: '#BC8F8F', royalblue: '#4169E1',
    saddlebrown: '#8B4513', salmon: '#FA8072', sandybrown: '#F4A460', seagreen: '#2E8B57',
    seashell: '#FFF5EE', sienna: '#A0522D', silver: '#C0C0C0', skyblue: '#87CEEB',
    slateblue: '#6A5ACD', slategray: '#708090', slategrey: '#708090', snow: '#FFFAFA',
    springgreen: '#00FF7F', steelblue: '#4682B4', tan: '#D2B48C', teal: '#008080',
    thistle: '#D8BFD8', tomato: '#FF6347', turquoise: '#40E0D0', violet: '#EE82EE',
    wheat: '#F5DEB3', white: '#FFFFFF', whitesmoke: '#F5F5F5', yellow: '#FFFF00',
    yellowgreen: '#9ACD32',
};

class Rainbow {
    static rgba(xData: RGBAColor | number | string): string {
        return Rainbow._buildRGBAFromStructure(Rainbow.parse(xData));
    }

    static int32(xData: RGBAColor): number {
        const x = Rainbow.parse(xData);
        return x.r || (x.g << 8) || (x.b << 16) || ((x.a ?? 0) << 24);
    }

    static parse(xData: RGBAColor | number | string): RGBAColor {
        if (typeof xData === 'object') {
            return xData;
        } else if (typeof xData === 'number') {
            return Rainbow._buildStructureFromInt(xData);
        } else if (typeof xData === 'string') {
            let s = xData.toLowerCase();
            if (s in COLORS) {
                s = COLORS[s];
            }
            switch (s.length) {
                case 3:
                    return Rainbow._buildStructureFromString3(s);
                case 4:
                    if (s[0] === '#') {
                        return Rainbow._buildStructureFromString3(s.substr(1));
                    } else {
                        throw new Error('invalid color structure');
                    }
                case 6:
                    return Rainbow._buildStructureFromString6(s);
                case 7:
                    if (s[0] === '#') {
                        return Rainbow._buildStructureFromString6(s.substr(1));
                    } else {
                        throw new Error('invalid color structure');
                    }
                default: {
                    let rx = s.match(/^rgb\( *([0-9]{1,3}) *, *([0-9]{1,3}) *, *([0-9]{1,3}) *\)$/);
                    if (rx) {
                        return { r: parseInt(rx[1], 10), g: parseInt(rx[2], 10), b: parseInt(rx[3], 10) };
                    } else {
                        rx = s.match(/^rgba\( *([0-9]{1,3}) *, *([0-9]{1,3}) *, *([0-9]{1,3}) *, *([.0-9]+) *\)$/);
                        if (rx) {
                            return { r: parseInt(rx[1], 10), g: parseInt(rx[2], 10), b: parseInt(rx[3], 10), a: parseFloat(rx[4]) };
                        } else {
                            throw new Error('invalid color structure ' + s);
                        }
                    }
                }
            }
        }
        throw new Error('could not parse this thing : ' + JSON.stringify(xData));
    }

    static spectrum(sColor1: RGBAColor | string, sColor2: RGBAColor | string, nSteps: number): string[] {
        const c1 = Rainbow.parse(sColor1 as string);
        const c2 = Rainbow.parse(sColor2 as string);
        let nSecur = 100;

        function getMedian(x1: RGBAColor, x2: RGBAColor): RGBAColor {
            return {
                r: (x1.r + x2.r) >> 1,
                g: (x1.g + x2.g) >> 1,
                b: (x1.b + x2.b) >> 1,
                a: ((x1.a ?? 0) + (x2.a ?? 0)) >> 1,
            };
        }

        function fillArray(a: RGBAColor[], x1: RGBAColor, x2: RGBAColor, n1: number, n2: number): RGBAColor[] {
            const m = getMedian(x1, x2);
            const n = (n1 + n2) >> 1;
            if (--nSecur < 0) {
                return a;
            }
            if (Math.abs(n1 - n2) > 1) {
                fillArray(a, x1, m, n1, n);
                fillArray(a, m, x2, n, n2);
            }
            a[n1] = x1;
            a[n2] = x2;
            return a;
        }

        return fillArray([], c1, c2, 0, nSteps - 1).map(c => Rainbow.rgba(c));
    }

    static gradient(oPalette: Record<string, string>): string[] {
        let aPalette: string[] = [];
        let sLastColor: string | null = null;
        let nLastPal = 0;
        for (const iPal in oPalette) {
            const nPal = parseInt(iPal, 10);
            const sColor = oPalette[iPal];
            if (sLastColor !== null) {
                aPalette = aPalette.concat(Rainbow.spectrum(sLastColor, sColor, nPal - nLastPal + 1).slice(1));
            } else {
                aPalette[nPal] = Rainbow.rgba(sColor);
            }
            sLastColor = sColor;
            nLastPal = nPal;
        }
        return aPalette;
    }

    static _buildStructureFromInt(n: number): RGBAColor {
        const a = (n >> 24) & 0xFF;
        const b = (n >> 16) & 0xFF;
        const g = (n >> 8) & 0xFF;
        const r = n & 0xFF;
        return { r, g, b, a };
    }

    static _buildStructureFromString3(s: string): RGBAColor {
        const r = parseInt('0x' + s[0] + s[0]);
        const g = parseInt('0x' + s[1] + s[1]);
        const b = parseInt('0x' + s[2] + s[2]);
        return { r, g, b, a: 255 };
    }

    static _buildStructureFromString6(s: string): RGBAColor {
        const r = parseInt('0x' + s[0] + s[1]);
        const g = parseInt('0x' + s[2] + s[3]);
        const b = parseInt('0x' + s[4] + s[5]);
        return { r, g, b, a: 255 };
    }

    static _buildRGBAFromStructure(oData: RGBAColor): string {
        let s1 = 'rgb';
        let s2 = oData.r.toString() + ', ' + oData.g.toString() + ', ' + oData.b.toString();
        if ('a' in oData) {
            s1 += 'a';
            s2 += ', ' + (oData.a ?? 0).toString();
        }
        return s1 + '(' + s2 + ')';
    }

    static _buildString3FromStructure(oData: RGBAColor): string {
        const sr = ((oData.r >> 4) & 0xF).toString(16);
        const sg = ((oData.g >> 4) & 0xF).toString(16);
        const sb = ((oData.b >> 4) & 0xF).toString(16);
        return sr + sg + sb;
    }

    static byte(n: number): number {
        return Math.min(255, Math.max(0, n | 0));
    }

    static brightness(color: RGBAColor | string, f: number): RGBAColor {
        const c = Rainbow.parse(color as string);
        c.r = Rainbow.byte(f * c.r);
        c.g = Rainbow.byte(f * c.g);
        c.b = Rainbow.byte(f * c.b);
        return c;
    }

    static grayscale(color: RGBAColor | string): RGBAColor {
        const c = Rainbow.parse(color as string);
        const n = Math.round((c.r * 30 + c.g * 59 + c.b * 11) / 100);
        c.r = c.g = c.b = n;
        return c;
    }
}

export default Rainbow;
export type { RGBAColor };
