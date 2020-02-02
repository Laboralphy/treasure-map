class CharRegistry {
    constructor() {
        this.sum = 0;
        this.list = [];
    }

    addEntry(sEntry) {
        this.list.push(sEntry);
        ++this.sum;
    }

    pick(x) {
        return this.list[x];
    }
}

export default CharRegistry;