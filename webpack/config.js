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
        background: ['babel-polyfill', './background/index.js'],
        popup: './popup/index.js',
    },
    output: {
        path: resolve(__dirname, '../bin'),
        filename: 'script/[name]-[hash:6].b.js',
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
            filename: 'popup_page.html',
        }),
        new HtmlWebpackPlugin({
            template: '!!handlebars-loader!./src/manifest.template.hbs',
            filename: 'manifest.json',
            inject: false,
        }),
        new CopyWebpackPlugin([{
            from: 'assets/*.png',
        }])
    ],
    module: {
        rules: [{
            test: /\.jsx?$/,
            loader: 'babel-loader',
        }, {
            test: /\.hbs$/,
            loader: 'handlebars-loader',
        }, {
            test: /\.gql$/,
            loader: 'graphql-tag/loader',
        }]
    },
    devtool: 'cheap-source-map',
};

module.exports = defaultConfig;
