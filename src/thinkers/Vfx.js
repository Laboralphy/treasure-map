class Vfx {
	/**
	 * @param entity
	 */
	think(entity, game) {
		const sprite = entity.sprite;
		if (sprite.animation.isOver()) {
			game.destroyEntity(entity);
		}
	}
}

export default Vfx;