import Balloon from './Balloon';
import Aerostat from './Aerostat';
import Cursor from './Cursor';
import Boat from './Boat';
import Wave from './Wave';
import Vfx from './Vfx';
import Bullet from './Bullet';
import Smoke from './Smoke';

export default {
    cursor: new Cursor(),
    balloon: new Balloon(),
    aerostat: new Aerostat(),
    boat: new Boat(),

    bullet: new Bullet,
    wave: new Wave(),
    vfx: new Vfx(),
    smoke: new Smoke()
};