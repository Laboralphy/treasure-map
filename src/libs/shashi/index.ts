function hash(a: number): number {
    if (a < 0) {
        let b = 0;
        let h = hash(-a);
        while (h) {
            b = (b << 4) | h & 15;
            h >>= 4;
        }
        return Math.abs(b);
    }
    a = (a ^ 61) ^ (a >> 16);
    a = a + (a << 3);
    a = a ^ (a >> 4);
    a = a * 0x27d4eb2d;
    a = a ^ (a >> 15);
    return a;
}

export default hash;
