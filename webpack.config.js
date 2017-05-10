var webpack = require("webpack");

module.exports = {
    entry: './client/main.js',
    output: {
        filename: './public/js/app.js'
    },

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader",
                options: {
                    cacheDirectory: true,
                    presets: ['es2015'],
                }
            },
        }, ]
    },

    //plugins: [new webpack.optimize.UglifyJsPlugin()],
};