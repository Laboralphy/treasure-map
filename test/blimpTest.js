const o876 = require('../src/o876');
const Vector = o876.geometry.Vector;



describe('blimp thinker', function() {
	const BlimpThinker = require('../src/thinkers/Aerostat').default;
	const oBT = new BlimpThinker();
	describe('displacement', function() {
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
			oBT.process(entity);
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
            blimpThinker(entity);
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
			blimpThinker(entity);
			expect(entity.data.angle).toBeCloseTo(0.1, 2);
			expect(entity.sprite._iFrame).toBe(0);
			blimpThinker(entity);
			expect(entity.data.angle).toBeCloseTo(0.2, 2);
			expect(entity.sprite._iFrame).toBe(0);
			blimpThinker(entity);
			expect(entity.data.angle).toBeCloseTo(0.3, 2);
			expect(entity.sprite._iFrame).toBe(0);
			blimpThinker(entity);
			expect(entity.data.angle).toBeCloseTo(0.4, 2);
			expect(entity.sprite._iFrame).toBe(1);
			blimpThinker(entity);
			expect(entity.data.angle).toBeCloseTo(0.5, 2);
			expect(entity.sprite._iFrame).toBe(1);
			blimpThinker(entity);
			expect(entity.data.angle).toBeCloseTo(0.6, 2);
			expect(entity.sprite._iFrame).toBe(1);
			blimpThinker(entity);
			expect(entity.data.angle).toBeCloseTo(0.7, 2);
			expect(entity.sprite._iFrame).toBe(1);
			blimpThinker(entity);
			expect(entity.data.angle).toBeCloseTo(0.8, 2);
			expect(entity.sprite._iFrame).toBe(2);
		});
	});


	describe('aimed angle', function() {
        it ('compute a good angle when x and y are > 0', function() {
            let entity = {
                sprite: {
                    _iFrame: 0
                },
                data: {
                    position: new Vector(0, 0),
                    destination: new Vector(330, 330),
                    angle: 0,
                    angleSpeed: 0.1,
                    maxSpeed: 2
                }
            };
            blimpThinker(entity);
            expect(entity.data.aimedAngle).toBeCloseTo(Math.PI / 4, 4);
            expect(entity.data.angle).toBeCloseTo(0.1, 4);
        });
	});


	describe('bug affolement sinusoidal', function() {

	});


});