const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const Assets = require('./assets');

module.exports = {
    entry: {
        app: "./app/public/js/app.js",
        controllers: "./app/public/js/controllers.js",
        services: "./app/public/js/services.js",
    },
    output: {
        path: __dirname + "/app/public/build/js/",
        filename: "[name].bundle.js"
    },
    plugins: [
      new CopyWebpackPlugin(
        Assets.map(asset => {
          return {
            from: path.resolve(__dirname, `./node_modules/${asset}`),
            to: path.resolve(__dirname, './app/public/build/npm')
          };
        })
      )
    ]
};