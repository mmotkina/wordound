const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {  
  entry: [
    './app.js'
  ],
  output: {
    path: path.join(__dirname, '/static'),
    filename: 'main.js'
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        },
        exclude: /node_modules/
      },
      { 
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      },
    ]
  },
  plugins: [
      new ExtractTextPlugin('style.css')
  ]
};
