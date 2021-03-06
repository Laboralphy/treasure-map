const {PNG} = require('pngjs');
const ArgumentParser = require('./libs/o876-argument-parser');
const WorldGenerator = require('./libs/cartography/WorldGenerator');
const fs = require('fs');
const Rainbow = require('./libs/rainbow');
const path = require('path');

function loadDataSync() {
    return {
        names: JSON.parse(fs.readFileSync(path.join(__dirname, './data/towns_fr.json')).toString()),
        palette: JSON.parse(fs.readFileSync(path.join(__dirname, './data/palette.json')).toString())
    };
}

function drawTile(x, y, seed, sOutput = '') {
    const DATA = loadDataSync();
    const tileSize = 256;
    const oInit = {
        seed,
        palette: DATA.palette,
        tileSize,
        physicGridSize: 16,
        names: DATA.names,
        scale: 2,
    };
    const wg = new WorldGenerator(oInit);

    const renderTile = (xTile, yTile) => {
        const oTile = wg.computeTile(xTile, yTile);
        const png = new PNG({
            width: tileSize >> 1,
            height: tileSize >> 1
        });
        for (let y = 0; y < png.height; ++y) {
            for (let x = 0; x < png.width; ++x) {
                const offset = (y * png.width + x) << 2;
                const color = Rainbow.parse(oTile.colorMap[y][x]);
                png.data[offset] = color.r;
                png.data[offset + 1] = color.g;
                png.data[offset + 2] = color.b;
                png.data[offset + 3] = color.a;
            }
        }
        oTile.sceneries.forEach(({
            type,
            x: xt,
            y: yt,
            dir,
            width,
            height,
            seed,
            name
        }) => {
            const ps = wg._scaledPhysicGridSize;
            for (let yi = 0; yi < height * ps; ++yi) {
                for (let xi = 0; xi < width * ps; ++xi) {
                    const offset = ((yt * ps + yi) * png.width + (xt * ps + xi)) << 2;
                    png.data[offset] = 255;
                    png.data[offset + 1] = 0;
                    png.data[offset + 2] = 0;
                    png.data[offset + 3] = 255;
                }
            }
            console.log('town', name, 'x', x, 'y', y);
        });

        // grid
        for (let xi = 0; xi < (tileSize >> 1); ++xi) {
            const offset = xi << 2;
            png.data[offset] >>>= 2;
            png.data[offset + 1] >>>= 2;
            png.data[offset + 2] >>>= 2;
        }
        for (let yi = 0; yi < (tileSize >> 1); ++yi) {
            const offset = yi * png.width << 2;
            png.data[offset] >>>= 2;
            png.data[offset + 1] >>>= 2;
            png.data[offset + 2] >>>= 2;
        }

        return png;
    }

    const png = renderTile(x, y);
    const buffy = PNG.sync.write(png);
    const sName = !!sOutput ? sOutput : 'tile.s' + seed + '.x' + x + '.y' + y + '.png';
    fs.writeFileSync(sName, buffy);
}




function getParameters() {
    ArgumentParser.setArgumentDefinition([
        {
            name: 'x',
            short: 'x',
            desc: 'x coordinate of the tile to be rendered',
            value: {
                required: true,
                type: 'number'
            }
        },
        {
            name: 'y',
            short: 'y',
            desc: 'y coordinate of the tile to be rendered',
            value: {
                required: true,
                type: 'number'
            }
        },
        {
            name: 'seed',
            short: 's',
            long: 'seed',
            desc: 'seed value for RNG',
            value: {
                required: true,
                type: 'number'
            }
        },
        {
            name: 'output',
            short: 'o',
            long: 'output',
            desc: 'the of the output file',
            value: {
                required: false,
                type: 'string',
                default: ''
            }
        },
        {
            name: 'help',
            short: 'h',
            long: 'help',
            desc: 'show command line options and usage'
        }
    ]);
    const aCommands = process.argv.slice(2);
    const p = ArgumentParser.parse(aCommands);
    if (p.help) {
        console.log(ArgumentParser.getHelpString());
        return;
    }
    if (('x' in p) && ('y' in p) && ('seed' in p)) {
        drawTile(p.x, p.y, p.seed, p.output);
        return;
    }
    console.info('in order to draw a tile you need to provide x, y and seed parameters.');
    console.info('type --help for help');
}

getParameters();