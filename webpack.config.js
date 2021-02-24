const path = require('path');
// встроеная либа в ноде, отвечает за пути
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// удаляет все из папки dist
const HtmlWebpackPlugin = require('html-webpack-plugin');
// если используем хеш в имени бандла, для авто подстановки
const CopyPlugin = require('copy-webpack-plugin');
// нужен чтобы скопировать что то как из папки src в dist
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'production'; // определяем мод
const isDev = !isProd;

// в дев моде будет давать имена без хеша
const filename = ext => isDev ? `bundle.${ext}` : `bundle[hash].${ext}`;

const jsLoaders = () => {
  const loaders = [
    {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env']
      }
    }
  ];
  if (isDev) {
    loaders.push('eslint-loader');
  }

  return loaders;
};

module.exports = {
  context: path.resolve(__dirname, 'src'), // истанавливает изначальный путь (откуда будет все читать)
  mode: 'development', // ниже будут правила для дев мода
  entry: ['@babel/polyfill', './index.js'], // точка входа в приложение
  output: {
    filename: filename('js'), // имя собранного файла, [hash] добавлен чтобы каждый раз было другое имя и не кешировалось
    path: path.resolve(__dirname, 'dist'), // папка где будет лежать сборка
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'), // указываем для импортов абсолютный путь (например вместо ../../../component будет @component)
      '@core': path.resolve(__dirname, 'src/core'),
    }
  },
  target: 'web', // без этого не работает хот релоад
  devtool: isDev ? 'source-map' : false,
  devServer: {
    port: 3000,
    hot: isDev
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html', // указываем шаблон хтмл в который будет подключен бандл (с хешом) автоматически
      minify: {
        removeComments: isProd, // удалить комменты в проде
        collapseWhitespace: isProd, // удалить пробелы в проде
      }
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/favicon.ico'), // копируем фавикон из папки src в dist
          to: path.resolve(__dirname, 'dist')
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: filename('css') // указываем имя для бандла стилей
    }),
  ],
  module: {
    rules: [
      { // правила для sass loader
        test: /\.s[ac]ss$/i, // следит за файлами с расширением scss / sass
        use: [
          MiniCssExtractPlugin.loader, // создает отдельный файл стилей когда импортится в js
          'css-loader',
          'sass-loader', // идет снизу вверх, сначала sass -> css -> minicss
        ],
      },
      { // правила для babel
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: jsLoaders()
      }
    ],
  },
};