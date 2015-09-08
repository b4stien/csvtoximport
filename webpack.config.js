var webpack = require('webpack');

module.exports = {
  context: __dirname + '/app',
  entry: {
    javascript: './app',
    html: './index.html',
  },

  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist',
  },

  resolve: {
    alias: {
      papaparse: __dirname + '/bower_components/papaparse/papaparse.js',
      fileSaver: __dirname + '/bower_components/file-saver.js/FileSaver.js',
    },
    // root: __dirname + '/web/static/js',
  },

  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      },
      {
        test: /\.html$|\.csv$/,
        loader: 'file?name=[name].[ext]',
      },
    ]
  },

  devtool: 'source-map',
}
