const Cache2D = require('../src/libs/cache2d').default;

describe('cache 2D basic testing', function() {
  it('check an item can be retrieved', function() {
    const c = new Cache2D({
      size: 10
    });
    const oItem1 = {a: 1};
    c.store(15, 12, oItem1);
    expect(c._cache).toEqual([{x: 15, y: 12, payload: oItem1}]);
    expect(c._index).toEqual({12: {15: oItem1}});
    const xx = c.load(15, 12);
    expect(xx).toBeDefined();
    expect(xx).toBe(oItem1);
  });

  it('check several items can be retrieved', function() {
    const c = new Cache2D({
      size: 10
    });
    const oItem1 = {a: 1};
    const oItem2 = {a: 2};
    const oItem3 = {a: 3};
    const oItem4 = {a: 4};
    const oItem5 = {a: 5};
    const oItem6 = {a: 6};
    const oItem7 = {a: 7};
    const oItem8 = {a: 8};
    const oItem9 = {a: 9};
    const oItem10 = {a: 10};
    const oItem11 = {a: 11};
    const oItem12 = {a: 12};
    const oItem13 = {a: 13};
    c.store(15, 12, oItem1);
    c.store(-15, -12, oItem2);
    c.store(3, 5, oItem3);
    c.store(4, 5, oItem4);
    c.store(5, 5, oItem5);
    c.store(6, 5, oItem6);
    c.store(7, 5, oItem7);
    c.store(8, 5, oItem8);
    c.store(9, 5, oItem9);
    c.store(10, 5, oItem10);
    c.store(11, 5, oItem11);
    c.store(12, 5, oItem12);
    c.store(13, 5, oItem13);
    expect(c.load(10, 5)).toBe(oItem10);
    expect(c.load(4, 5)).toBe(oItem4);
    expect(c.load(15, 12)).toBe(null);
  });
});
