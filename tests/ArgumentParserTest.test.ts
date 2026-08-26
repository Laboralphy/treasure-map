import { describe, it, expect } from 'vitest';
import {
    getCommandLineArguments,
    setArgumentDefinition,
    parse,
    type ArgumentDef,
} from '../src/libs/o876-argument-parser';

const TILE_DEFINITION: ArgumentDef[] = [
    { name: 'x', short: 'x', desc: 'x coordinate', value: { required: true, type: 'number' } },
    { name: 'y', short: 'y', desc: 'y coordinate', value: { required: true, type: 'number' } },
    {
        name: 'seed',
        short: 's',
        long: 'seed',
        desc: 'seed',
        value: { required: true, type: 'number' },
    },
    { name: 'noGrid', long: 'no-grid', desc: 'no grid' },
];

describe('command line lexer', () => {
    it('reads a value given after a short switch', () => {
        const r = getCommandLineArguments(['-x', '20']);
        expect(r.switches.x.value).toBe('20');
    });

    it('does not mistake a negative number for a pack of short switches', () => {
        const r = getCommandLineArguments(['-x', '-20']);
        expect(r.switches.x.value).toBe('-20');
        expect(r.switches).not.toHaveProperty('2');
        expect(r.switches).not.toHaveProperty('0');
    });

    it('accepts negative decimals', () => {
        expect(getCommandLineArguments(['-x', '-2.5']).switches.x.value).toBe('-2.5');
        expect(getCommandLineArguments(['-x', '-.5']).switches.x.value).toBe('-.5');
    });

    it('still packs several short switches written together', () => {
        const r = getCommandLineArguments(['-xy']);
        expect(r.switches).toHaveProperty('x');
        expect(r.switches).toHaveProperty('y');
    });

    it('reads a value glued to a long switch', () => {
        expect(getCommandLineArguments(['--x=-20']).switches.x.value).toBe('-20');
    });
});

describe('tile command line', () => {
    it('parses negative coordinates given after short switches', () => {
        setArgumentDefinition(TILE_DEFINITION);
        expect(parse(['-x', '-20', '-y', '-20', '--seed=0'])).toEqual({ x: -20, y: -20, seed: 0 });
    });

    it('parses negative coordinates glued to long switches', () => {
        setArgumentDefinition(TILE_DEFINITION);
        expect(parse(['--x=-20', '--y=15', '--seed=3'])).toEqual({ x: -20, y: 15, seed: 3 });
    });

    it('keeps valueless flags working next to negative numbers', () => {
        setArgumentDefinition(TILE_DEFINITION);
        expect(parse(['-x', '-20', '-y', '-20', '--seed=0', '--no-grid'])).toEqual({
            x: -20,
            y: -20,
            seed: 0,
            noGrid: true,
        });
    });
});
