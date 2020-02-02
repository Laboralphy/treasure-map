const Cartography = require('../src/libs/cartography/WorldGenerator').WorldGenerator;

function createTypicalCartography() {
    const c = new Cartography();
    const v = c.view;
    const m = c.metrics;

    v.width = 400;
    v.height = 300;
    v.center();
    v.position.set(1000, 500);

    m.tileSize = 128;
    m.voronoiCellSize = 50;

    return c;
}

describe('voronoi computation', function() {
    it('check if view window has correct points', function() {
        const c = createTypicalCartography();
        const v = c.view;

        const points = v.points();
        expect(points[0].x).toBe(1000 - 200);
        expect(points[0].y).toBe(500 - 150);
        expect(points[1].x).toBe(1000 + 200);
        expect(points[1].y).toBe(500 + 150);
    });


    it('checks if the 0, 0 voronoid cluster is correct', function() {
        const c = new Cartography();
        const v = c.computeVoronoiCluster(0, 0);
    });

});