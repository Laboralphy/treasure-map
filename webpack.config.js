/**
 * Created by ralphy on 26/05/17.
 */
const path = require('path');

module.exports = {
    resolve: {
        alias: {
            libs: path.resolve(__dirname, 'src/libs')
        }
    },
    entry: {
        'app': path.resolve(__dirname, 'src/index.js'),
        'worker': path.resolve(__dirname, 'src/worker.js')
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'var',
        publicPath: "/public/",
    },
    mode: 'development',
    devtool: 'source-map',
    module: {
        rules: [
        ]
    },
    target: 'web'
};
