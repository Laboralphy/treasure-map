class CharRegistry {
    sum: number;
    list: string[];

    constructor() {
        this.sum = 0;
        this.list = [];
    }

    addEntry(sEntry: string): void {
        this.list.push(sEntry);
        ++this.sum;
    }

    pick(x: number): string {
        return this.list[x];
    }
}

export default CharRegistry;
