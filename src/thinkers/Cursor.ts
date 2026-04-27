const PHASE_PLAYER_AT_CURSOR = 0;
const PHASE_PLAYER_MOVING = 1;

class Cursor {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    think(entity: any, game: any): void {
        const player = game.state.player;
        const pdata = entity;
        if (!('phase' in pdata)) {
            pdata.phase = 1;
            entity.sprite.fadeOut();
        }
        const bPlayerAtCursor = pdata.position.isEqual(player.position);
        switch (pdata.phase) {
            case 0:
                if (!bPlayerAtCursor) {
                    pdata.phase = PHASE_PLAYER_MOVING;
                    entity.sprite.fadeIn();
                }
                break;
            case 1:
                if (bPlayerAtCursor) {
                    pdata.phase = PHASE_PLAYER_AT_CURSOR;
                    entity.sprite.fadeOut();
                }
                break;
        }
    }
}

export default Cursor;
