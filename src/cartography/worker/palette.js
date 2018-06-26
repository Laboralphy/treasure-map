import o876 from '../../o876/index';
import COLORS from '../../consts/colors';
const Rainbow = o876.Rainbow;

function _buildGradient() {
    return Rainbow.gradient({
        0: COLORS.abyss,
        40: COLORS.depth,
        48: COLORS.shallow,
        50: COLORS.shore,
        55: COLORS.land,
        75: COLORS.highland,
        99: COLORS.summit
    })
        .map(x => Rainbow.parse(x))
        .map(x => x.r | x.g << 8 | x.b << 16 | 0xFF000000);
}

export default _buildGradient;