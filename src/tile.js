const {PNG} = require('pngjs');
const ArgumentParser = require('./libs/o876-argument-parser');
const WorldGenerator = require('./libs/cartography/WorldGenerator');
const fs = require('fs');
const Rainbow = require('./libs/rainbow');

function loadDataSync() {
    return {
        names: JSON.parse(fs.readFileSync('./data/towns_fr.json').toString()),
        palette: JSON.parse(fs.readFileSync('./data/palette.json').toString())
    };
}

function drawTile(x, y, seed) {
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
        return png;
    }

    const renderMap = (xTile, yTile) => {
        const oTile = wg.computeTile(xTile, yTile);
        const png = new PNG({
            width: tileSize / wg._physicGridSize,
            height: tileSize / wg._physicGridSize
        });
        for (let y = 0; y < png.height; ++y) {
            for (let x = 0; x < png.width; ++x) {
                const offset = (y * png.width + x) << 2;
                const pm = oTile.physicMap[y][x];
                const c = pm === 11 ? 0 : Math.floor(128 * oTile.physicMap[y][x] / 55 + 127);
                png.data[offset] = c;
                png.data[offset + 1] = c;
                png.data[offset + 2] = c;
                png.data[offset + 3] = 255;
            }
        }
        return png;
    }

    const renderPatch = (xTile, yTile, nWidth, nHeight) => {
        const png = new PNG({
            width: nWidth * (tileSize / wg._physicGridSize),
            height: nHeight * (tileSize / wg._physicGridSize)
        });
        let n100 = 0;
        for (let y = 0; y < nHeight; ++y) {
            for (let x = 0; x < nWidth; ++x) {
                const pngxy = renderMap(x + xTile, y + yTile);
                pngxy.bitblt(
                    png,
                    0,
                    0,
                    pngxy.width,
                    pngxy.height,
                    x * pngxy.width,
                    y * pngxy.height
                );
                let nx = Math.round(100 * (y * nWidth + x) / (nHeight * nWidth));
                if (n100 !== nx) {
                    n100 = nx;
                    process.stdout.write('\r' + n100 + '%');
                }
            }
        }
        console.log('\r100% done.');
        return png;
    }

    const png = renderTile(x, y, 30, 30);
    const buffy = PNG.sync.write(png);
    fs.writeFileSync('tile.s' + seed + '.x' + x + '.y' + y + '.png', buffy);
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
        drawTile(p.x, p.y, p.seed);
        return;
    }
    console.info('in order to draqw a tile you need to provide x, y and seed parameters.');
    console.info('type --help for help');
}

getParameters();