import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import GitRevisionPlugin from 'git-revision-webpack-plugin';
import webpack from 'webpack';
import path from 'path';

const pkg = require(path.resolve(process.cwd(), 'package.json'));
const gitRevisionPlugin = new GitRevisionPlugin();

export default (env, argv) => {
  console.log(argv.mode);

  return {
    entry: {
      babel_polyfill: '@babel/polyfill',
      app: './src/index.js',
    },
    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
    },
    devtool: 'inline-source-map',
    resolve: {
      modules: ['node_modules', 'src'],
      extensions: ['.js', '.jsx'],
      mainFields: ['browser', 'jsnext:main', 'main'],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/,
          exclude: /node_modules/,
          use: {
            loader: 'file-loader',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          exclude: /node_modules/,
          use: {
            loader: 'file-loader',
          },
        },
        {
          test: /\.(fnt|xml|json)$/,
          exclude: /node_modules/,
          use: {
            loader: 'file-loader',
          },
        },
        {
          test: /\.(ogg|wav|mp3)$/,
          exclude: /node_modules/,
          use: {
            loader: 'file-loader',
          },
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'html-loader',
            },
          ],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(), // cleans the /dist directory before each build!
      new HtmlWebpackPlugin({
        title: 'Som ol',
        template: './src/index.html',
        filename: './index.html',
      }),
      new CopyWebpackPlugin([
        {
          from: 'src/assets',
          to: path.resolve(process.cwd(), 'dist', 'assets'),
        },
        {
          from: 'src/assets/favicon.png',
          to: path.resolve(process.cwd(), 'dist'),
        },
      ]),
      new webpack.DefinePlugin({
        _bundle: {
          isProduction: JSON.stringify(argv.mode === 'production'),
          environment: JSON.stringify(argv.mode),
          buildVersion: JSON.stringify(pkg.version),
          name: JSON.stringify(pkg.name),
          description: JSON.stringify(pkg.description),
          authorName: JSON.stringify(pkg.author.name),
          authorUrl: JSON.stringify(pkg.author.url),
        },
        _git: {
          version: JSON.stringify(gitRevisionPlugin.version()),
          commitHash: JSON.stringify(gitRevisionPlugin.commithash()),
          branch: JSON.stringify(gitRevisionPlugin.branch()),
        },
      }),
    ],
  };
};
