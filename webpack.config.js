const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'production',
    entry: './src/server.js',
    output: {
        // eslint-disable-next-line no-undef
        path: path.join(__dirname, 'public'),
        publicPath: '/',
        filename: 'final.js',
    },
    target: 'node',
    externals: [nodeExternals()], // Exclude node_modules
};

// module.exports = {
//     mode: 'production',
//     entry: './src/server.js',
//     output: {
//         // eslint-disable-next-line no-undef
//         path: path.join(__dirname, 'dist'),
//         publicPath: '/',
//         filename: 'final.js',
//     },
//     target: 'node',
//     externals: [nodeExternals()], // Exclude node_modules
// };