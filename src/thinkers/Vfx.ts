class Vfx {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    think(entity: any, game: any): void {
        const sprite = entity.sprite;
        if (sprite.animation.isOver()) {
            game.destroyEntity(entity);
        }
    }
}

export default Vfx;
