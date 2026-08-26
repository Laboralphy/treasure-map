/**
 * Offline tile renderer.
 *
 * Renders one tile, or a rectangular block of tiles, straight to a PNG file.
 *
 * The generation pipeline (WorldGenerator and everything below it) is the very same code the
 * game runs inside its web workers : this tool feeds it an InitPayload, exactly like
 * libs/cartography/Worker does when it receives an 'init' message. Typing the options as
 * InitPayload keeps both entry points in lockstep : a change to the worker protocol breaks
 * this file at compile time.
 *
 * Tile *rendering* (libs/cartography/TileRenderer) is not reachable here : it draws on a
 * canvas and only exists in the browser. This tool rasterizes the colorMap itself.
 */

import { PNG } from 'pngjs';
import * as fs from 'fs';
import ArgumentParser, { type ArgumentDef } from './libs/o876-argument-parser';
import WorldGenerator from './libs/cartography/WorldGenerator';
import Rainbow from './libs/rainbow';
import type { InitPayload } from './libs/cartography/protocol';
import palette from './data/palette.json';
import names from './data/towns_fr.json';

interface TileOptions {
    x: number;
    y: number;
    seed: number;
    cols: number;
    rows: number;
    tileSize: number;
    scale: number;
    physicGridSize: number;
    grid: boolean;
    output: string;
}

const TOWN_COLOR = { r: 255, g: 0, b: 0 };

function renderTiles({
    x,
    y,
    seed,
    cols,
    rows,
    tileSize,
    scale,
    physicGridSize,
    grid,
    output,
}: TileOptions): void {
    // same payload shape the web worker gets on 'init'
    const oInit: InitPayload = {
        seed,
        palette,
        names,
        tileSize,
        physicGridSize,
        scale,
    };
    const wg = new WorldGenerator(oInit);
    const nScaledTileSize = wg.getScaledValue(tileSize);
    const nScaledPhysicGridSize = wg.getScaledValue(physicGridSize);

    const png = new PNG({
        width: cols * nScaledTileSize,
        height: rows * nScaledTileSize,
    });

    const putPixel = (px: number, py: number, r: number, g: number, b: number, a: number): void => {
        const offset = (py * png.width + px) << 2;
        png.data[offset] = r;
        png.data[offset + 1] = g;
        png.data[offset + 2] = b;
        png.data[offset + 3] = a;
    };

    for (let yTile = 0; yTile < rows; ++yTile) {
        for (let xTile = 0; xTile < cols; ++xTile) {
            const xOfs = xTile * nScaledTileSize;
            const yOfs = yTile * nScaledTileSize;
            const oTile = wg.computeTile(x + xTile, y + yTile);

            for (let py = 0; py < nScaledTileSize; ++py) {
                const aRow = oTile.colorMap[py];
                for (let px = 0; px < nScaledTileSize; ++px) {
                    const color = Rainbow.parse(aRow[px]);
                    putPixel(xOfs + px, yOfs + py, color.r, color.g, color.b, color.a ?? 255);
                }
            }

            oTile.sceneries.forEach(({ x: xt, y: yt, width, height, name }) => {
                for (let py = 0; py < height * nScaledPhysicGridSize; ++py) {
                    for (let px = 0; px < width * nScaledPhysicGridSize; ++px) {
                        putPixel(
                            xOfs + xt * nScaledPhysicGridSize + px,
                            yOfs + yt * nScaledPhysicGridSize + py,
                            TOWN_COLOR.r,
                            TOWN_COLOR.g,
                            TOWN_COLOR.b,
                            255
                        );
                    }
                }
                console.log('town', name, 'x', x + xTile, 'y', y + yTile);
            });

            if (grid) {
                for (let px = 0; px < nScaledTileSize; ++px) {
                    const offset = (yOfs * png.width + xOfs + px) << 2;
                    png.data[offset] >>>= 2;
                    png.data[offset + 1] >>>= 2;
                    png.data[offset + 2] >>>= 2;
                }
                for (let py = 0; py < nScaledTileSize; ++py) {
                    const offset = ((yOfs + py) * png.width + xOfs) << 2;
                    png.data[offset] >>>= 2;
                    png.data[offset + 1] >>>= 2;
                    png.data[offset + 2] >>>= 2;
                }
            }
        }
    }

    const sName = output.length > 0 ? output : 'tile.s' + seed + '.x' + x + '.y' + y + '.png';
    fs.writeFileSync(sName, PNG.sync.write(png));
    console.log(
        sName +
            ' : ' +
            png.width +
            'x' +
            png.height +
            'px' +
            ' - ' +
            cols +
            'x' +
            rows +
            ' tiles of ' +
            nScaledTileSize +
            'px' +
            ' (tileSize ' +
            tileSize +
            ' / scale ' +
            scale +
            ')'
    );
}

const ARGUMENT_DEFINITION: ArgumentDef[] = [
    {
        name: 'x',
        short: 'x',
        desc: 'x coordinate of the first tile to be rendered',
        value: { required: true, type: 'number' },
    },
    {
        name: 'y',
        short: 'y',
        desc: 'y coordinate of the first tile to be rendered',
        value: { required: true, type: 'number' },
    },
    {
        name: 'seed',
        short: 's',
        long: 'seed',
        desc: 'seed value for RNG',
        value: { required: true, type: 'number' },
    },
    {
        name: 'cols',
        short: 'c',
        long: 'cols',
        desc: 'number of tiles to render horizontally (default 1)',
        value: { required: false, type: 'number' },
    },
    {
        name: 'rows',
        short: 'r',
        long: 'rows',
        desc: 'number of tiles to render vertically (default 1)',
        value: { required: false, type: 'number' },
    },
    {
        name: 'tileSize',
        long: 'tile-size',
        desc: 'tile size in world units before scaling (default 256 ; the game uses 16)',
        value: { required: false, type: 'number' },
    },
    {
        name: 'scale',
        long: 'scale',
        desc: 'world unit / pixel ratio : a tile is rendered tileSize/scale px wide (default 2)',
        value: { required: false, type: 'number' },
    },
    {
        name: 'physicGridSize',
        long: 'physic-grid-size',
        desc: 'size of a physic mesh cell, in world units (default 16 ; the game uses 8)',
        value: { required: false, type: 'number' },
    },
    {
        name: 'noGrid',
        long: 'no-grid',
        desc: 'do not darken the tile borders',
    },
    {
        name: 'output',
        short: 'o',
        long: 'output',
        desc: 'the name of the output file',
        value: { required: false, type: 'string' },
    },
    {
        name: 'help',
        short: 'h',
        long: 'help',
        desc: 'show command line options and usage',
    },
];

function num(p: ArgumentParserResult, sName: string, nDefault: number): number {
    return sName in p ? Number(p[sName]) : nDefault;
}

type ArgumentParserResult = ReturnType<typeof ArgumentParser.parse>;

function main(): void {
    ArgumentParser.setArgumentDefinition(ARGUMENT_DEFINITION);
    const p = ArgumentParser.parse(process.argv.slice(2));
    if (p.help) {
        console.log(ArgumentParser.getHelpString());
        return;
    }
    if (!('x' in p) || !('y' in p) || !('seed' in p)) {
        console.info('in order to draw a tile you need to provide x, y and seed parameters.');
        console.info('type --help for help');
        return;
    }
    renderTiles({
        x: num(p, 'x', 0),
        y: num(p, 'y', 0),
        seed: num(p, 'seed', 0),
        cols: num(p, 'cols', 1),
        rows: num(p, 'rows', 1),
        tileSize: num(p, 'tileSize', 256),
        scale: num(p, 'scale', 2),
        physicGridSize: num(p, 'physicGridSize', 16),
        grid: !p.noGrid,
        output: 'output' in p ? String(p.output) : '',
    });
}

main();
