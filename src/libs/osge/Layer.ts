import { View } from '../geometry';

class Layer {
    view: View;

    constructor() {
        this.view = new View();
    }

    update(_period?: number): void {}

    render(_canvas: HTMLCanvasElement): void {}
}

export default Layer;
