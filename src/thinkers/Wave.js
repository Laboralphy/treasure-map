class Wave {
	processScaleAndAlpha(entity) {
		entity.sprite.scale += 0.04;
		if (entity.game.state.time > entity.data.lifetime) {
			entity.game.destroyEntity(entity);
		}
	}
	/**
	 * @param entity
	 */
	think(entity) {
		if (!entity.data.thinked) {
			entity.sprite.scale = 0.1;
			entity.sprite.fadeOut(0.04);
			entity.data.lifetime = entity.game.state.time + 32;
		}
		this.processScaleAndAlpha(entity);
	}
}

export default Wave;