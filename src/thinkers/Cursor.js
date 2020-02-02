const PHASE_PLAYER_AT_CURSOR = 0;
const PHASE_PLAYER_MOVING = 1;

class Cursor {
    /**
     * @param entity
     */
    think(entity, game) {
        let player = game.state.player;
        let pdata = entity.data;
        if (!('phase' in pdata)) {
            pdata.phase = 1;
            entity.sprite.fadeOut();
        }
        let bPlayerAtCursor = pdata.position.isEqual(player.data.position);
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