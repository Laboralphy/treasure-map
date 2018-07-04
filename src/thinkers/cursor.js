/**
 * @param entity
 */
function process(entity) {
	let cdata = entity.data;
	let game = entity.game;
	let player = game.state.player;
	let pdata = player.data;
	cdata.position.set(pdata.destination);
	entity.sprite.frame(0);
}

export default process;