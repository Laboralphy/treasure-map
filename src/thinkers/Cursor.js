const PHASE_PLAYER_AT_CURSOR = 0;
const PHASE_PLAYER_MOVING = 1;

class Cursor {
    processPulseScale(entity) {
        entity.sprite.scale = Math.sin(entity.game.state.time / 8) / 8 + 1;
    }
    /**
     * @param entity
     */
    think(entity) {
        let player = entity.game.state.player;
        let pdata = entity.data;
        if (!('phase' in pdata)) {
            pdata.phase = 0;
            entity.sprite.fadeOut();
        }
        this.processPulseScale(entity);
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