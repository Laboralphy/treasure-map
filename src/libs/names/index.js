const NameCrafter = require('../name-crafter');

const DATA = {
    towns: null,
};

function setList(type, list) {
    const nc = new NameCrafter();
    nc.pattern = 3;
    nc.list = list;
    DATA[type] = nc;
}

function generateTownName(seed) {
    const nc = DATA.towns;
    const r = nc.random;
    r.seed = seed;
    const nLength = r.roll(1, 4) + r.roll(1, 4) + r.roll(1, 4);
    const sName = nc.generate(nLength);
    return sName.substr(0, 1) + sName.substr(1).toLowerCase();
}

module.exports = {
    generateTownName,
    setList
}