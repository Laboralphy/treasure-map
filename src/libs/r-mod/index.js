function mod(n, d) {
    if (n > 0) {
        return n % d;
    } else {
        return (d - (-n % d)) % d;
    }
}

module.exports = {
    mod
};