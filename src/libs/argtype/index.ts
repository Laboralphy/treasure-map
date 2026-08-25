function _getType(x: unknown): string {
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

function main(...args: unknown[]): string {
    return args
        .map(_getType)
        .map(x => x.substring(0, 1))
        .join('');
}

export default main;
