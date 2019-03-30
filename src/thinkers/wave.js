const PHASE_PLAYER_AT_CURSOR = 0;
const PHASE_PLAYER_MOVING = 1;


function processScaleAndAlpha(entity) {
    entity.sprite.scale += 0.02;
	entity.sprite.alpha -= 0.02;
    if (entity.sprite.alpha < 0 || entity.sprite.scale > 2) {
		entity.game.destroyEntity(entity);
	}
}
/**
 * @param entity
 */
function process(entity) {
	processScaleAndAlpha(entity);
}

export default process;