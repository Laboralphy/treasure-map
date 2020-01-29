import ImageLoader from '../../image-loader';

import {
    DIR_EAST, DIR_WEST, DIR_NORTH, DIR_SOUTH
} from "../../consts";

const MESH_SIZE = 16;
const FONT_SIZE = 28;
const FONT_PAD = 4;
const FONT_DEFINITION = 'px bold Times New Roman';


function setCityNameFont(ctx, nFontSize) {
    ctx.textBaseline = 'top';
    ctx.strokeStyle = '#efce8c';
    ctx.fillStyle = 'rgba(57, 25, 7)';
    ctx.font = nFontSize + FONT_DEFINITION;
}


function drawCity(oCanvas, data) {
    const {x, y, width, height, name} = data;
    let nFontSize = FONT_SIZE;
    if (name.length > 10) {
        nFontSize *= 0.8;
    }
    const ctx = oCanvas.getContext('2d');
    const xm = x * MESH_SIZE, ym = y * MESH_SIZE;
    const wm = width * MESH_SIZE;
    const hm = height * MESH_SIZE;

    switch (data.dir) {
        case DIR_WEST:
            ctx.drawImage(ImageLoader.getImage('images/sceneries/city_0.png'), xm + MESH_SIZE, ym);
            break;

        case DIR_EAST:
            ctx.drawImage(ImageLoader.getImage('images/sceneries/city_0.png'), xm, ym);
            break;

        case DIR_NORTH:
            ctx.drawImage(ImageLoader.getImage('images/sceneries/city_1.png'), xm, ym + MESH_SIZE);
            break;

        case DIR_SOUTH:
            ctx.drawImage(ImageLoader.getImage('images/sceneries/city_1.png'), xm, ym);
            break;

        default:
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(xm, ym, wm, hm);
    }


    setCityNameFont(ctx, nFontSize);
    // déterminer si le nom de la ville sera en haut ou en bas
    let xf = xm, yf = ym;
    if (yf - FONT_SIZE - FONT_PAD < 0) {
        yf = yf + hm + 4;
    } else {
        yf -= FONT_SIZE + FONT_PAD;
    }
    const wt = ctx.measureText(name).width;
    if (xf + wt >= oCanvas.width) {
        xf = oCanvas.width - wt - 1;
    }
    ctx.strokeText(name, xf, yf);
    ctx.fillText(name, xf, yf);
}


function drawUnknown(oCanvas, data) {
    const {x, y, width, height} = data;
    const ctx = oCanvas.getContext('2d');
    const xm = x * MESH_SIZE, ym = y * MESH_SIZE;
    const wm = width * MESH_SIZE;
    const hm = height * MESH_SIZE;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(xm, ym, wm, hm);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.strokeText(data.type + '???', xm, ym + 15);
    ctx.fillText(data.type + '???', xm, ym + 15);
}



function draw(oCanvas, data) {
    switch (data.type) {
        case 'port/t1s4':
        case 'port/t2s4':
            drawCity(oCanvas, data);
            break;

        default:
            drawUnknown(oCanvas, data);
            break;
    }
}



export default {
    draw,
}