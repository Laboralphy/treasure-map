import { z } from 'zod';

export const BlueprintSchema = z.object({
    tileset:     z.string(),
    thinker:     z.string(),
    angleSpeed:  z.number().optional(),
    enginePower: z.number().optional(),
    maxSpeed:    z.number().optional(),
    collision:   z.number().optional(),
    z:           z.number().optional(),
});

export type Blueprint = z.infer<typeof BlueprintSchema>;
