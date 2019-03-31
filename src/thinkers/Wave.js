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
		this.processScaleAndAlpha(entity);
	}
}

export default Wave;