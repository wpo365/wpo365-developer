const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const defaultConfig = require('@wordpress/scripts/config/webpack.config')

module.exports = {
  ...defaultConfig,

  mode: 'production',

  entry: {
    './recent/app': './src/app.js',
    './recent/editor': './src/editor.js',
  },

  output: {
    ...defaultConfig.output,
    filename: '[name].js',
    path: __dirname + '/dist',
  },

  devtool: '',

  resolve: {
    ...defaultConfig.resolve,
    extensions: ['.jsx'],
  },

  module: {
    ...defaultConfig.module,
    rules: [
      {
        test: /.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },

  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },

  plugins: [
    ...defaultConfig.plugins,

    new CleanWebpackPlugin({
      dry: false,
      cleanOnceBeforeBuildPatterns: ['dist'],
    }),
  ],
}
