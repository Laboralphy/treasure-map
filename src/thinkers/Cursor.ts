import type { IEntity, IGame, IThinker } from '../types/game';

const PHASE_PLAYER_AT_CURSOR = 0;
const PHASE_PLAYER_MOVING = 1;

class Cursor implements IThinker {
    think(entity: IEntity, game: IGame): void {
        const player = game.state.player!;
        if (!('phase' in entity)) {
            entity.phase = PHASE_PLAYER_MOVING;
            entity.sprite.fadeOut();
        }
        const bPlayerAtCursor = entity.position.isEqual(player.position);
        switch (entity.phase) {
            case PHASE_PLAYER_AT_CURSOR:
                if (!bPlayerAtCursor) {
                    entity.phase = PHASE_PLAYER_MOVING;
                    entity.sprite.fadeIn();
                }
                break;
            case PHASE_PLAYER_MOVING:
                if (bPlayerAtCursor) {
                    entity.phase = PHASE_PLAYER_AT_CURSOR;
                    entity.sprite.fadeOut();
                }
                break;
        }
    }
}

export default Cursor;
