export interface InitPayload {
    palette: Array<{ altitude: number; color: string }>;
    names: string[];
    seed: number;
    cache?: number;
    tileSize: number;
    physicGridSize: number;
    scale?: number;
}

export interface TilePayload {
    x: number;
    y: number;
}

export interface OptionsPayload {
    cache: number;
}
