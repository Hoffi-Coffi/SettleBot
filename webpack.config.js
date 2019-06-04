const path = require("path");

module.exports = {
    entry: './src/bot.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'awesome-typescript-loader',
                exclude: /node_modules/
            }
        ]
    },
    target: "node",
    mode: "development",
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json']
    },
    output: {
        filename: 'bot.js',
        path: path.resolve(__dirname, 'dist')
    },
    stats: {
        warnings: false
    }
    // node: {
    //     fs: 'empty'
    // }
};