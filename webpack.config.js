const webpack = require('webpack');
const path = require('path');

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
      }
    ]
  }
};
