import ImageLoader from '../../image-loader';

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
        case 'w':
            ctx.drawImage(ImageLoader.getImage('images/sceneries/city_0.png'), xm + MESH_SIZE, ym);
            break;

        case 'e':
            ctx.drawImage(ImageLoader.getImage('images/sceneries/city_0.png'), xm, ym);
            break;

        case 'n':
            ctx.drawImage(ImageLoader.getImage('images/sceneries/city_1.png'), xm, ym + MESH_SIZE);
            break;

        case 's':
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



function draw(oCanvas, data) {
    switch (data.type) {
        case 'city':
            drawCity(oCanvas, data);
            break;
    }
}


function setImageStock(oImages) {
    IMAGES = oImages;
}


export default {
    draw,
    setImageStock
}