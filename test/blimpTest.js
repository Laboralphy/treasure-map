const o876 = require('../src/o876');
const Vector = o876.geometry.Vector;


function blimp_process(entity) {
	let pdata = entity.data;
	if (!pdata.destination.isEqual(pdata.position)) {
		if (pdata.destination.sub(pdata.position).distance() <= pdata.maxSpeed) {
			pdata.position.set(pdata.destination);
			return;
		}
		// angle de destination
		let fAngleDest = pdata.destination.sub(pdata.position).angle();
		let fAngleCurr = pdata.angle;
		let fAngleDiff = fAngleDest - fAngleCurr;
		let fAngleMod;
		if (Math.abs(fAngleDiff) >= Math.PI) {
			fAngleMod = Math.sign(fAngleDiff) * pdata.angleSpeed;
		} else {
			fAngleMod = -Math.sign(fAngleDiff) * pdata.angleSpeed;
		}
		pdata.angle += fAngleMod;
		let vMove = new Vector();
		vMove.fromPolar(pdata.angle, pdata.maxSpeed);
		pdata.position.translate(vMove);

		// changer le sprite
		entity.sprite._iFrame = ((16 * pdata.angle / (2*Math.PI) | 0) + 16) % 16;
	}
}


describe('blimp thinker', function() {
	describe('wont move', function() {
		it ('should not move', function() {
			let entity = {
				sprite: {
					_iFrame: 0
				},
				data: {
					position: new Vector(0, 0),
					destination: new Vector(0, 0),
					angle: 0,
					angleSpeed: 0.1,
					maxSpeed: 2
				}
			};
			blimp_process(entity);
			expect(entity.data.position.x).toBe(0);
			expect(entity.data.position.y).toBe(0);
			expect(entity.data.angle).toBe(0);
			expect(entity.sprite._iFrame).toBe(0);
		});

		it ('should move a bit', function() {
			let entity = {
				sprite: {
					_iFrame: 0
				},
				data: {
					position: new Vector(0, 0),
					destination: new Vector(100, 0),
					angle: 0,
					angleSpeed: 0.1,
					maxSpeed: 2
				}
			};
			blimp_process(entity);
			expect(entity.data.position.x).toBe(2);
			expect(entity.data.position.y).toBe(0);
			expect(entity.data.angle).toBe(0);
			expect(entity.sprite._iFrame).toBe(0);
		});

		it ('should turn to the left', function() {
			let entity = {
				sprite: {
					_iFrame: 0
				},
				data: {
					position: new Vector(0, 0),
					destination: new Vector(100, 100),
					angle: 0,
					angleSpeed: 0.1,
					maxSpeed: 2
				}
			};
			blimp_process(entity);
			expect(entity.data.angle).toBeCloseTo(-0.1, 2);
			expect(entity.sprite._iFrame).toBe(0);
			blimp_process(entity);
			expect(entity.data.angle).toBeCloseTo(-0.2, 2);
			expect(entity.sprite._iFrame).toBe(0);
			blimp_process(entity);
			expect(entity.data.angle).toBeCloseTo(-0.3, 2);
			expect(entity.sprite._iFrame).toBe(0);
			blimp_process(entity);
			expect(entity.data.angle).toBeCloseTo(-0.4, 2);
			expect(entity.sprite._iFrame).toBe(15);
			blimp_process(entity);
			expect(entity.data.angle).toBeCloseTo(-0.5, 2);
			expect(entity.sprite._iFrame).toBe(15);
			blimp_process(entity);
			expect(entity.data.angle).toBeCloseTo(-0.6, 2);
			expect(entity.sprite._iFrame).toBe(15);
			blimp_process(entity);
			expect(entity.data.angle).toBeCloseTo(-0.7, 2);
			expect(entity.sprite._iFrame).toBe(15);
			blimp_process(entity);
			expect(entity.data.angle).toBeCloseTo(-0.8, 2);
			expect(entity.sprite._iFrame).toBe(14);
		});
	});



});