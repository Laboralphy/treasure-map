class Balloon {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    think(entity: any, _game: any): void {
        const pdata = entity;
        if (!pdata.destination.isEqual(pdata.position)) {
            const vDiff = pdata.destination.sub(pdata.position);
            const nDist = vDiff.magnitude();

            let ms = pdata.maxSpeed;
            let speed = pdata.speed;
            const acc = pdata.enginePower;

            const DECCEL_THRESHOLD_DIST = ms << 2;

            if (nDist < DECCEL_THRESHOLD_DIST) {
                ms *= nDist / DECCEL_THRESHOLD_DIST;
            }
            speed = Math.min(ms, speed + acc);
            const vNorm = vDiff.normalize();
            const vMove = vNorm.mul(speed);
            pdata.speed = speed;
            pdata.position.translate(vMove);
        }
    }
}

export default Balloon;
