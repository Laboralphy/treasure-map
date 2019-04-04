const IMAGE_CACHE = {};

function loadImage(sImage) {
    return new Promise(resolve => {
        if (sImage in IMAGE_CACHE) {
            resolve(IMAGE_CACHE[sImage]);
            return;
        }
        let oImage = new Image();
        IMAGE_CACHE[sImage] = oImage;
        oImage.addEventListener('load', event => resolve(oImage));
        oImage.setAttribute('src', sImage);
    });
}

function loadImages(aList) {
    return Promise.all(aList.map(src => loadImage(src)));
}

function load(x) {
    if (Array.isArray(x)) {
        return loadImages(x);
    } else {
        return loadImage(x)
    }
}

function getImage(src) {
    return IMAGE_CACHE[src];
}

export default {
    load,
    getImage
};