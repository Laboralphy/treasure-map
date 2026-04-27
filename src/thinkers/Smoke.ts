import type { IEntity, IGame, IThinker } from '../types/game';

class Smoke implements IThinker {
    think(entity: IEntity, game: IGame): void {
        if (!entity.thought) {
            entity.sprite.scale = 0.5;
            entity.sprite.fadeOut(0.04);
            entity.lifetime = game.state.time + 32;
            entity.sprite.frame = Math.random() * entity.sprite.frameCount() | 0;
            entity.thought = true;
        }
        entity.sprite.scale += 0.02;
        if (game.state.time > entity.lifetime!) {
            game.destroyEntity(entity);
        }
        --entity.position.y;
    }
}

export default Smoke;
