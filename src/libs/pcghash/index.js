function rot(x, b) {
    return (x << b) ^ (x >> (32 - b))
}

function pcghash(x, y, seed = 0) {
    for (let i = 0; i < 3; i++) {
        x = rot((x ^ 0xcafebabe) + (y ^ 0xfaceb00c), 23);
        y = rot((x ^ 0xdeadbeef) + (y ^ 0x8badf00d), 5);
    }
    const n = x ^ y ^ seed;
    return n >= 0
        ? n
        : 0x7fffffff - n
}

export default pcghash;