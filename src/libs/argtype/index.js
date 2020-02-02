function _getType(x) {
    const s = typeof x;
    switch (s) {
        case 'object':
            return Array.isArray(x)
                ? 'array'
                : x === null
                    ? 'null'
                    : 'object';

        default:
            return s;
    }
}

function main(...args) {
    return args
        .map(_getType)
        .map(x => x.substr(0, 1))
        .join('');
}

export default main;