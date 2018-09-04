var path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'buble-loader',
        include: path.join(__dirname, 'src'),
        options: {
          objectAssign: 'Object.assign'
        }
      },
      {
        test: /\.(csv)$/,
        use: [
          {
            loader: 'file-loader',
          }
        ]
      }
    ]
  }
};
