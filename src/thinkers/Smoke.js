class Wave {
	processScaleAndAlpha(entity) {
		entity.sprite.scale += 0.02;
		if (game.state.time > entity.data.lifetime) {
			game.destroyEntity(entity);
		}
	}
	/**
	 * @param entity
	 */
	think(entity, game) {
		if (!entity.data.thought) {
			entity.sprite.scale = 0.5;
			entity.sprite.fadeOut(0.04);
			entity.data.lifetime = game.state.time + 32;
			entity.sprite.frame = Math.random() * entity.sprite.frameCount() | 0;
		}
		this.processScaleAndAlpha(entity, game);
		--entity.data.position.y;
	}
}

export default Wave;