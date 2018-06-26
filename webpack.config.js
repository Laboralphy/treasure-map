/**
 * Created by ralphy on 26/05/17.
 */
const path = require('path');

module.exports = {
    entry: {
        'app': path.resolve(__dirname, 'src/main.js'),
        'worker': path.resolve(__dirname, 'src/cartography/worker/index.js'),
        'test': path.resolve(__dirname, 'test/index.js')
	},
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
        publicPath: "/build/",
    },
    mode: 'development',
	devtool: 'source-map',
	module: {
	},
    target: 'web'
};
