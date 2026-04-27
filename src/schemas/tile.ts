import { z } from 'zod';

const AnimationSchema = z.object({
    start:    z.number(),
    count:    z.number(),
    duration: z.number(),
    loop:     z.number(),
});

export const TileSchema = z.object({
    image:      z.string(),
    frames:     z.number(),
    ref:        z.object({ x: z.number(), y: z.number() }),
    animations: z.array(AnimationSchema).optional(),
});

export type Tile = z.infer<typeof TileSchema>;
export type Animation = z.infer<typeof AnimationSchema>;
