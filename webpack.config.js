let path = require('path');
let htmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: './src/entry.js',
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          //或者是从右到左的顺序，从下到上的顺序，不要错了
          'style-loader',
          'css-loader',
        ]
      },
      {
        test: /\.less$/,
        use: [
          //或者是从右到左的顺序，从下到上的顺序，不要错了
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader',
        options: {
          es6Module: false,
          limit: 8 * 1024,
          name: '[hash:10].[ext]'
        }
      },
      {
        test: /\.html$/,
        use: [
          //从下到上的顺序，不要错了
          'html-loader',
        ]
      },
    ]
  },
  plugins: [
    new htmlWebpackPlugin({
      template: "./src/index.html"
    })
  ],
  //devServer 热加载
  devServer: {
    port: 6002,
    // open: true,
    contentBase: path.resolve(__dirname, 'src'),
    compress: true,
  }
}
