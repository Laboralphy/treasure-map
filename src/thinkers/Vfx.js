class Vfx {
	/**
	 * @param entity
	 */
	think(entity) {
		const sprite = entity.sprite;
		if (sprite.animation.isOver()) {
			entity.game.destroyEntity(entity);
		}
	}
}

export default Vfx;