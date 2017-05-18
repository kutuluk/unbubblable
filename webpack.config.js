// var webpack = require('webpack')

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
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: ['es2015']
        }
      }
    },
    {
      test: /\.styl$/,
      exclude: /node_modules/,
      use: {
        loader: 'style-loader!css-loader!stylus-loader'
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
      }
    }
    ]
  }

    // plugins: [new webpack.optimize.UglifyJsPlugin()],
}
