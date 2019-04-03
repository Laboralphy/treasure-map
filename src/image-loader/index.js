const IMAGES = {};

function load(aList) {
    const aLoad = aList.map(src => new Promise((resolve, reject) => {
            const oImage = new Image();
            oImage.addEventListener('load', () => {
                resolve(true);
            });
            oImage.src = src;
            IMAGES[src] = oImage;
        })
    );
    return Promise.all(aLoad);
}

function getImage(src) {
    return IMAGES[src];
}

export default {
    load,
    getImage
};