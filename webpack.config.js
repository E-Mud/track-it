var path = require('path');
var webpack = require('webpack');

var javascriptEntryPath = path.resolve(__dirname, 'client', 'index.js');
var htmlEntryPath = path.resolve(__dirname, 'client', 'index.html');
var buildPath = path.resolve(__dirname, 'public', 'build');

module.exports = {
  entry: [
    'webpack-hot-middleware/client?reload=true',
    javascriptEntryPath,
    htmlEntryPath
  ],
  output: {
    path: buildPath,
    publicPath: '/public/',
    filename: 'bundle.js',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loaders: ['react-hot', 'babel?presets[]=react,presets[]=es2015'],
    }, {
      test: /\.html$/,
      loader: 'file?name=[name].[ext]',
    }],
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
};
