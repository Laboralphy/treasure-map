class Perlin {
    static computeOptimalOctaves(n: number): number {
        let i = 10;
        while (i > 0) {
            const i2 = 1 << i;
            if (i2 <= n) {
                break;
            }
            --i;
        }
        return i;
    }

    static cosineInterpolate(x0: number, x1: number, mu: number): number {
        const mu2 = (1 - Math.cos(mu * Math.PI)) / 2;
        return x0 * (1 - mu2) + x1 * mu2;
    }

    static generateSmoothNoise(aBaseNoise: number[][], nOctave: number): Float32Array[] {
        const w = aBaseNoise.length;
        const h = aBaseNoise[0].length;
        const aSmoothNoise: Float32Array[] = new Array(h);
        const nSamplePeriod = 1 << nOctave;
        const fSampleFreq = 1 / nSamplePeriod;
        const interpolate = Perlin.cosineInterpolate;
        for (let x = 0, y = 0; y < h; ++y) {
            const ys0 = y - (y % nSamplePeriod);
            const ys1 = (ys0 + nSamplePeriod) % h;
            const hBlend = (y - ys0) * fSampleFreq;
            const r = new Float32Array(w);
            const bny0 = aBaseNoise[ys0];
            const bny1 = aBaseNoise[ys1];
            for (x = 0; x < w; ++x) {
                const xs0 = x - (x % nSamplePeriod);
                const xs1 = (xs0 + nSamplePeriod) % w;
                const vBlend = (x - xs0) * fSampleFreq;
                const fTop = interpolate(bny0[xs0], bny1[xs0], hBlend);
                const fBottom = interpolate(bny0[xs1], bny1[xs1], hBlend);
                r[x] = interpolate(fTop, fBottom, vBlend);
            }
            aSmoothNoise[y] = r;
        }
        return aSmoothNoise;
    }

    static generate(aBaseNoise: number[][], nOctaveCount: number): Float32Array[][] {
        const w = aBaseNoise.length;
        const h = aBaseNoise[0].length;
        const aSmoothNoise: Float32Array[][] = new Array(nOctaveCount);
        const fPersist = 0.5;

        for (let i = 0; i < nOctaveCount; ++i) {
            aSmoothNoise[i] = Perlin.generateSmoothNoise(aBaseNoise, i);
        }

        const aPerlinNoise: Float32Array[] = new Array(h);
        let fAmplitude = 1;
        let fTotalAmp = 0;

        for (let y = 0; y < h; ++y) {
            const r = new Float32Array(w);
            for (let x = 0; x < w; ++x) {
                r[x] = 0;
            }
            aPerlinNoise[y] = r;
        }

        for (let iOctave = nOctaveCount - 1; iOctave >= 0; --iOctave) {
            fAmplitude *= fPersist;
            fTotalAmp += fAmplitude;
            const sno = aSmoothNoise[iOctave];
            for (let y = 0; y < h; ++y) {
                const snoy = sno[y];
                const pny = aPerlinNoise[y];
                for (let x = 0; x < w; ++x) {
                    pny[x] += snoy[x] * fAmplitude;
                }
            }
        }
        for (let y = 0; y < h; ++y) {
            const pny = aPerlinNoise[y];
            for (let x = 0; x < w; ++x) {
                pny[x] /= fTotalAmp;
            }
        }
        return aPerlinNoise as unknown as Float32Array[][];
    }

    static colorize(aNoise: Float32Array[][], aPalette: string[]): string[] {
        const pl = aPalette.length;
        const data: string[] = [];
        aNoise.forEach(r => (r as unknown as Float32Array).forEach((x: number) => {
            const nColor = Math.min(pl - 1, x * pl | 0);
            data.push(aPalette[nColor]);
        }));
        return data;
    }
}

export default Perlin;
