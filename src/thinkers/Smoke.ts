class Smoke {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processScaleAndAlpha(entity: any, game: any): void {
        entity.sprite.scale += 0.02;
        if (game.state.time > entity.lifetime) {
            game.destroyEntity(entity);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    think(entity: any, game: any): void {
        if (!entity.thought) {
            entity.sprite.scale = 0.5;
            entity.sprite.fadeOut(0.04);
            entity.lifetime = game.state.time + 32;
            entity.sprite.frame = Math.random() * entity.sprite.frameCount() | 0;
            entity.thought = true;
        }
        this.processScaleAndAlpha(entity, game);
        --entity.position.y;
    }
}

export default Smoke;
