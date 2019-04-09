import Balloon from './Balloon';
import Aerostat from './Aerostat';
import Cursor from './Cursor';
import Boat from './Boat';
import Wave from './Wave';
import Vfx from './Vfx';
import Bullet from './Bullet';
import Smoke from './Smoke';
import AIBoat from './AIBoat';

export default {
    cursor: new Cursor(),
    balloon: new Balloon(),
    aerostat: new Aerostat(),
    boat: new Boat(),
    aiboat: new AIBoat(),

    bullet: new Bullet(),
    wave: new Wave(),
    vfx: new Vfx(),
    smoke: new Smoke()
};