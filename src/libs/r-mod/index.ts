function mod(n: number, d: number): number {
    if (n > 0) {
        return n % d;
    } else {
        return (d - (-n % d)) % d;
    }
}

export { mod };
