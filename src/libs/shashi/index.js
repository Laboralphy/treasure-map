/**
 * creation du hash d'une seule valeur
 * @param a {number}
 * @returns {number}
 */
function hash (a) {
    if (a < 0) {
        let b = 0, h = hash(-a);
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

module.exports = hash;