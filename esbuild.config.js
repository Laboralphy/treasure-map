const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const libsAlias = {
    name: 'libs-alias',
    setup(build) {
        build.onResolve({ filter: /^libs\// }, args => {
            let resolved = path.resolve(__dirname, 'src/libs', args.path.slice('libs/'.length));
            if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
                const tsIndex = path.join(resolved, 'index.ts');
                const jsIndex = path.join(resolved, 'index.js');
                resolved = fs.existsSync(tsIndex) ? tsIndex : jsIndex;
            }
            return { path: resolved };
        });
    }
};

const shared = {
    bundle: true,
    sourcemap: true,
    platform: 'browser',
    format: 'iife',
    plugins: [libsAlias],
    logLevel: 'info',
};

const isWatch = process.argv.includes('--watch');
const isServe = process.argv.includes('--serve');

async function main() {
    const app = await esbuild.context({
        ...shared,
        entryPoints: ['src/index.ts'],
        outfile: 'public/dist/app.js',
    });
    const worker = await esbuild.context({
        ...shared,
        entryPoints: ['src/worker.ts'],
        outfile: 'public/dist/worker.js',
    });

    if (isServe) {
        await worker.watch();
        const { host, port } = await app.serve({ servedir: 'public' });
        console.log(`dev server: http://${host}:${port}`);
    } else if (isWatch) {
        await app.watch();
        await worker.watch();
        console.log('watching...');
    } else {
        await app.rebuild();
        await app.dispose();
        await worker.rebuild();
        await worker.dispose();
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
