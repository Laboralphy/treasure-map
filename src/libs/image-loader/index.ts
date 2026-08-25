import argtype from '../argtype';

const IMAGE_CACHE: Record<string, HTMLImageElement> = {};

function loadImage(sImage: string, id: string | null = null): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        if (sImage in IMAGE_CACHE) {
            resolve(IMAGE_CACHE[sImage]);
            return;
        }
        const oImage = new Image();
        IMAGE_CACHE[sImage] = oImage;
        oImage.addEventListener('load', () => resolve(oImage));
        oImage.addEventListener('error', () => reject(new Error('loading error : ' + sImage)));
        oImage.setAttribute('src', sImage);
        if (id) {
            oImage.setAttribute('data-id', id);
        }
    });
}

function loadImages(aList: string[] | Record<string, string>): Promise<HTMLImageElement[] | Record<string, HTMLImageElement>> {
    if (Array.isArray(aList)) {
        return Promise.all(aList.map(src => loadImage(src)));
    } else {
        const aPrepaList = Object.keys(aList).map(id => ({ id, src: (aList as Record<string, string>)[id] }));
        return Promise
            .all(aPrepaList.map(({ id, src }) => loadImage(src, id)))
            .then(a => {
                const oOutput: Record<string, HTMLImageElement> = {};
                a.forEach(image => oOutput[image.getAttribute('data-id')!] = image);
                return oOutput;
            });
    }
}

function load(x: string | string[] | Record<string, string>): Promise<HTMLImageElement | HTMLImageElement[] | Record<string, HTMLImageElement>> {
    switch (argtype(x)) {
        case 'a':
        case 'o':
            return loadImages(x as string[]);
        default:
            return loadImage(x as string);
    }
}

function getImage(src: string): HTMLImageElement {
    return IMAGE_CACHE[src];
}

export { load, getImage };
