class Wave {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processScaleAndAlpha(entity: any, game: any): void {
        entity.sprite.scale += 0.04;
        if (game.state.time > entity.lifetime) {
            game.destroyEntity(entity);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    think(entity: any, game: any): void {
        if (!entity.thought) {
            entity.sprite.scale = 0.1;
            entity.sprite.fadeOut(0.04);
            entity.lifetime = game.state.time + 32;
            entity.thought = true;
        }
        this.processScaleAndAlpha(entity, game);
    }
}

export default Wave;
