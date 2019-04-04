class Wave {
	processScaleAndAlpha(entity) {
		entity.sprite.scale += 0.02;
		if (entity.game.state.time > entity.data.lifetime) {
			entity.game.destroyEntity(entity);
		}
	}
	/**
	 * @param entity
	 */
	think(entity) {
		if (!entity.data.thought) {
			entity.sprite.scale = 0.5;
			entity.sprite.fadeOut(0.04);
			entity.data.lifetime = entity.game.state.time + 32;
			entity.sprite.frame(Math.random() * entity.sprite.frameCount() | 0);
		}
		this.processScaleAndAlpha(entity);
		--entity.data.position.y;
	}
}

export default Wave;