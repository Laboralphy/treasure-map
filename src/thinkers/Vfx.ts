import type { IEntity, IGame, IThinker } from '../types/game';

class Vfx implements IThinker {
    think(entity: IEntity, game: IGame): void {
        if (entity.sprite.animation?.isOver()) {
            game.destroyEntity(entity);
        }
    }
}

export default Vfx;
