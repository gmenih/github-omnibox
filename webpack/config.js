const wp = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { resolve, normalize } = require('path');


/** @import webpack as wp */
/** @type {wp.Configuration} */
const defaultConfig = {
    mode: process.env.NODE_ENV || 'development',
    context: resolve(__dirname, '../src'),
    entry: {
        background: './background/index.js',
        popup: './popup/index.js',
    },
    output: {
        path: resolve(__dirname, '../bin'),
        filename: '[name]-bundle.js',
    },
    plugins: [
        new CleanWebpackPlugin(['bin'], {
            verbose: true,
            root: resolve(__dirname, '..'),
        }),
        new HtmlWebpackPlugin({
            chunks: ['popup'],
            inject: 'body',
            template: '../src/popup/index.html',
            filename: 'popup.html',
        }),
        new HtmlWebpackPlugin({
            template: '../src/manifest.template.hbs',
            filename: 'manifest.json',
            inject: false,
        }),
        new CopyWebpackPlugin([{
            from: 'assets/*.png',
        }])
    ],
    module: {
        rules: [{
            test: /\.hbs$/,
            loader: 'handlebars-loader',
        }]
    },
    devServer: {
        contentBase: resolve('../bin'),
        compress: true,
        port: 9000
    }
};

module.exports = defaultConfig;