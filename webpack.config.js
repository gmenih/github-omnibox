/* eslint-disable @typescript-eslint/no-var-requires */
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const {join} = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DotEnvPlugin = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const pkg = require('./package.json');
const sharp = require('sharp');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurgeCSSPlugin = require('purgecss-webpack-plugin');
const glob = require('glob');

const MODULES_DIR = path.resolve(__dirname, './src/modules');
const iconSizes = [16, 32, 64];

/**
 * @param {string} moduleName
 * @returns {[webpack.RuleSetRule]}
 */
function moduleTsRule(moduleName) {
    return [
        {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            include: [
                path.resolve(MODULES_DIR, `./${moduleName}`),
                path.resolve(__dirname, './src/core'),
            ],
            options: {
                instance: moduleName,
                configFile: path.resolve(MODULES_DIR, `./${moduleName}/tsconfig.json`),
                reportFiles: [path.resolve(MODULES_DIR, `./${moduleName}/**/*.{ts,tsx}`)],
            },
        },
    ];
}

const isProduction = () => process.env.NODE_ENV === 'production';

/** @type {webpack.Configuration} */
const config = {
    mode: isProduction() ? 'production' : 'development',
    // only thing that works in a web extension
    devtool: isProduction() ? false : 'cheap-source-map',
    entry: {
        background: path.join(__dirname, './src/modules/background/index.ts'),
        options: path.join(__dirname, './src/modules/options/index.tsx'),
        'content-script': path.join(__dirname, './src/modules/content-script/index.ts'),
    },
    output: {
        path: join(__dirname, './dist'),
        // name must also be set in `/assets/manifest.hbs`
        filename: 'js/[name].js',
    },
    resolve: {
        extensions: ['.js', '.json', '.ts', '.tsx'],
        alias: {
            '@core': path.resolve(__dirname, './src/core'),
        },
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
                test: /\.(sass|scss)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
                sideEffects: true,
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
    optimization: isProduction()
        ? {
              minimize: true,
              mangleExports: true,
          }
        : {},
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new PurgeCSSPlugin({
            paths: glob.sync(`./src/**/*`, {nodir: true}),
            safelist: {
                greedy: [/box-heading/, /is-(primary|danger|info)/],
            },
        }),
        new CleanWebpackPlugin(),
        new WebpackBar(),
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
        new CopyWebpackPlugin({
            patterns: iconSizes.map((size) => ({
                from: 'src/assets/repo-icon.png',
                to: `assets/icon-${size}.png`,
                transform: (content) => {
                    return sharp(content).resize(size, size).png().toBuffer();
                },
            })),
        }),
    ],
};

module.exports = config;
