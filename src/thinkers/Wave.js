class Wave {
	processScaleAndAlpha(entity, game) {
		entity.sprite.scale += 0.04;
		if (game.state.time > entity.data.lifetime) {
			game.destroyEntity(entity);
		}
	}
	/**
	 * @param entity
	 */
	think(entity, game) {
		if (!entity.data.thought) {
			entity.sprite.scale = 0.1;
			entity.sprite.fadeOut(0.04);
			entity.data.lifetime = game.state.time + 32;
		}
		this.processScaleAndAlpha(entity, game);
	}
}

export default Wave;