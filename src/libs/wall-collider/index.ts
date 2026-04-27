interface WallCollisionResult {
    pos: { x: number; y: number };
    speed: { x: number; y: number };
    wcf: { x: number; y: number; c: boolean };
}

export function computeWallCollisions(
    xEntity: number,
    yEntity: number,
    dx: number,
    dy: number,
    nSize: number,
    nPlaneSpacing: number,
    bCrashWall: boolean,
    pSolidFunction: (x: number, y: number) => boolean
): WallCollisionResult {
    let oWallCollision = { x: 0, y: 0, c: false };
    let x = xEntity;
    let y = yEntity;
    let iIgnoredEye = (Math.abs(dx) > Math.abs(dy) ? 1 : 0) | ((dx > dy) || (dx === dy && dx < 0) ? 2 : 0);
    let xClip: boolean, yClip: boolean, ix: number, iy: number, xci: number, yci: number;
    let bCorrection = false;
    for (let i = 0; i < 4; ++i) {
        if (iIgnoredEye === i) {
            continue;
        }
        xci = (i & 1) * Math.sign(2 - i);
        yci = ((3 - i) & 1) * Math.sign(i - 1);
        ix = nSize * xci + x;
        iy = nSize * yci + y;
        xClip = pSolidFunction(ix + dx, iy);
        yClip = pSolidFunction(ix, iy + dy);
        if (xClip) {
            oWallCollision.c = true;
            dx = 0;
            if (bCrashWall) {
                dy = 0;
                oWallCollision.y = yci || oWallCollision.y;
            }
            oWallCollision.x = xci || oWallCollision.x;
            bCorrection = true;
        }
        if (yClip) {
            oWallCollision.c = true;
            dy = 0;
            if (bCrashWall) {
                dx = 0;
                oWallCollision.x = xci || oWallCollision.x;
            }
            oWallCollision.y = yci || oWallCollision.y;
            bCorrection = true;
        }
    }
    x += dx;
    y += dy;
    if (bCorrection) {
        const p1s = nPlaneSpacing - 1 - nSize;
        if (oWallCollision.x > 0) {
            x = Math.floor(x / nPlaneSpacing) * nPlaneSpacing + p1s;
        } else if (oWallCollision.x < 0) {
            x = Math.floor(x / nPlaneSpacing) * nPlaneSpacing + nSize;
        }
        if (oWallCollision.y > 0) {
            y = Math.floor(y / nPlaneSpacing) * nPlaneSpacing + p1s;
        } else if (oWallCollision.y < 0) {
            y = Math.floor(y / nPlaneSpacing) * nPlaneSpacing + nSize;
        }
        return {
            pos: { x, y },
            speed: { x: x - xEntity, y: y - yEntity },
            wcf: oWallCollision,
        };
    } else {
        return {
            pos: { x, y },
            speed: { x: dx, y: dy },
            wcf: oWallCollision,
        };
    }
}
