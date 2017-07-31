// var webpack = require('webpack')

module.exports = {
  // entry: './client/main.js',
  entry: {
    app: './client/main.js',
    logs: './client/logs.jsx',
  },
  output: {
    // filename: './public/js/app.js',
    filename: './public/js/[name].js',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['es2015'],
          },
        },
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['es2015'],
            plugins: [['transform-react-jsx', { pragma: 'h' }]],
          },
        },
      },
      {
        test: /\.styl$/,
        exclude: /node_modules/,
        use: {
          loader: 'style-loader!css-loader!stylus-loader',
          /*
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'stylus-loader',
                        options: {
                            use: [stylus_plugin()],
                        },
                    },
                    */
        },
      },
    ],
  },

  // plugins: [new webpack.optimize.UglifyJsPlugin()],
};
