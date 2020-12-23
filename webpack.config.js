/* eslint-disable @typescript-eslint/no-var-requires */
const DotEnvPlugin = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const pkg = require('./package.json');

const MODULES_DIR = path.resolve(__dirname, './src/modules');

/** 
 * @param {string} moduleName
 * @returns {[webpack.RuleSetRule]}
 */
function moduleTsRule(moduleName) {
    return [
        {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            include: [path.resolve(MODULES_DIR, `./${moduleName}`), path.resolve(__dirname, './src/core')],
            options: {
                instance: moduleName,
                configFile: path.resolve(MODULES_DIR, `./${moduleName}/tsconfig.json`),
                reportFiles: [path.resolve(MODULES_DIR, `./${moduleName}/**/*.{ts,tsx}`)],
            },
        },
    ];
}

/** @type {webpack.Configuration} */
const config = {
    devtool: 'cheap-source-map',
    entry: {
        background: path.join(__dirname, './src/modules/background/index.ts'),
        options: path.join(__dirname, './src/modules/options/index.tsx'),
        'content-script': path.join(__dirname, './src/modules/content-script/index.ts'),
    },
    resolve: {
        extensions: ['.js', '.json', '.ts', '.tsx'],
    },
    module: {
        rules: [
            ...moduleTsRule('background'),
            ...moduleTsRule('content-script'),
            ...moduleTsRule('options'),
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
        new DotEnvPlugin({path: './src/.env'}),
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

module.exports = config;
