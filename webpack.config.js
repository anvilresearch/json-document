var path = require('path')

module.exports = {
  entry: [
    './lib/index.js'
  ],
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: 'json-document.min.js',
    library: 'JSONDocument',
    libraryTarget: 'var'
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  devtool: 'source-map'
}
