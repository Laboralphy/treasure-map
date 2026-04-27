import NameCrafter from '../name-crafter';

const DATA: Record<string, NameCrafter | null> = {
    towns: null,
};

function setList(type: string, list: string[]): void {
    const nc = new NameCrafter();
    nc.pattern = 3;
    nc.list = list;
    DATA[type] = nc;
}

function generateTownName(seed: number): string {
    const nc = DATA.towns!;
    const r = nc.random;
    r.seed = seed;
    const nLength = r.roll(1, 4) + r.roll(1, 4) + r.roll(1, 4);
    const sName = nc.generate(nLength);
    return sName.substr(0, 1) + sName.substr(1).toLowerCase();
}

export { generateTownName, setList };
