function process(entity) {
    let pdata = entity.data;
    if (!pdata.destination.isEqual(pdata.position)) {
        let vDiff = pdata.destination.sub(pdata.position);
        let nDist = vDiff.distance();
        let fAngleNeed = Math.atan2(vDiff.x, vDiff.y);
        let fAngleCurr = pdata.angle;


        let ms = pdata.maxSpeed;
        let speed = pdata.speed;
        let acc = pdata.acc;

        const DECCEL_THRESHOLD_DIST = ms << 2;

        if (nDist < DECCEL_THRESHOLD_DIST) {
            // en deça d'un certain seuil la vitesse max diminue
            // proportionnellemnt à la distance restante
            ms *= nDist / DECCEL_THRESHOLD_DIST;
        }
        speed = Math.min(ms, speed + acc);
        let vNorm = vDiff.normalize();
        let vMove = vNorm.mul(speed);
        pdata.speed = speed;
        pdata.position.translate(vMove);
    }
}

export default process;