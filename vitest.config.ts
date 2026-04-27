import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            libs: path.resolve(__dirname, 'src/libs')
        }
    },
    test: {
        include: ['tests/**/*.test.ts'],
    }
});
