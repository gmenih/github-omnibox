const wp = require('webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {resolve} = require('path');
const pkg = require('./package.json');

const isProduction = process.env.NODE_ENV === 'production';

/** @import webpack as wp */
/** @type {wp.Configuration} */
const defaultConfig = {
    mode: process.env.NODE_ENV || 'development',
    entry: {
        background: './src/background/index.ts',
        options: './src/options/index.tsx',
        scripts: './src/content-script/index.ts',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    output: {
        path: resolve('./dist'),
        filename: 'script/[name].js',
    },
    devtool: !isProduction ? 'cheap-source-map' : '',
    devServer: {
        contentBase: './dist',
        openPage: './options_page.html',
        open: true,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
            },
            {
                test: /\.hbs$/,
                loader: 'handlebars-loader',
            },
            {
                test: /\.gql$/,
                loader: 'raw-loader',
            },
            {
                test: /\.(png|jpg|jpeg)$/,
                loader: 'file-loader',
                options: {
                    outputPath: 'assets/',
                },
            },
        ],
    },
    plugins: [
        // new CleanWebpackPlugin(),
        new wp.DefinePlugin({
            'process.env.CLIENT_ID': JSON.stringify(process.env.CLIENT_ID),
            'process.env.CLIENT_SECRET': JSON.stringify(process.env.CLIENT_SECRET),
        }),
        new HtmlWebpackPlugin({
            chunks: ['options'],
            inject: 'body',
            template: './src/assets/options.hbs',
            filename: 'options_page.html',
            pkg,
        }),
        new HtmlWebpackPlugin({
            template: '!!handlebars-loader!./src/assets/manifest.template.hbs',
            filename: 'manifest.json',
            inject: false,
            minify: false,
            pkg,
        }),
    ],
};

module.exports = defaultConfig;
