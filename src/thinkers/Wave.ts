import type { IEntity, IGame, IThinker } from '../types/game';

class Wave implements IThinker {
    think(entity: IEntity, game: IGame): void {
        if (!entity.thought) {
            entity.sprite.scale = 0.1;
            entity.sprite.fadeOut(0.04);
            entity.lifetime = game.state.time + 32;
            entity.thought = true;
        }
        entity.sprite.scale += 0.04;
        if (game.state.time > entity.lifetime!) {
            game.destroyEntity(entity);
        }
    }
}

export default Wave;
