import argtype from '../argtype';

const IMAGE_CACHE = {};


function loadImage(sImage, id = null) {
    return new Promise((resolve, reject) => {
        if (sImage in IMAGE_CACHE) {
            resolve(IMAGE_CACHE[sImage]);
            return;
        }
        let oImage = new Image();
        IMAGE_CACHE[sImage] = oImage;
        oImage.addEventListener('load', event => resolve(oImage));
        oImage.addEventListener('error', event => reject(new Error('loading error : ' + sImage)));
        oImage.setAttribute('src', sImage);
        if (!!id) {
            oImage.setAttribute('data-id', id);
        }
    });
}

function loadImages(aList) {
    if (Array.isArray(aList)) {
        return Promise.all(aList.map(src => loadImage(src)));
    } else {
        const aPrepaList = Object.keys(aList).map(id => ({
            id, src: aList[id]
        }));
        return Promise
            .all(aPrepaList.map(({id, src}) => loadImage(src, id)))
            .then(a => {
                const oOutput = {};
                a.forEach(image => oOutput[image.getAttribute('data-id')] = image);
                return oOutput;
            });
    }
}

function load(x) {

    switch (argtype(x)) {
        case 'a':
        case 'o':
            return loadImages(x);

        default:
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