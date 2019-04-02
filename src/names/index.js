import NameCrafter from '../name-crafter';

const DATA = {
    towns: null,
};

async function createNameCrafterFromURL(sURL) {
    const req = await fetch(sURL);
    const text = await req.text();
    const aList = text.split('\n');
    const nc = new NameCrafter();
    nc.setList(aList);
    return nc;
}

async function loadLists(oLists) {
    for (let s in oLists) {
        DATA[s] = await createNameCrafterFromURL(oLists[s]);
    }
}


function generateTownName(seed) {
    const nc = DATA.towns;
    const r = nc._random;
    r.seed(seed);
    const nLength = r.rand(1, 4) + r.rand(1, 4) + r.rand(1, 4);
    const sName = nc.generate(nLength);
    return sName.substr(0, 1) + sName.substr(1).toLowerCase();
}

export default {
    generateTownName,
    loadLists
}