/* eslint-disable @typescript-eslint/no-var-requires */
const DotEnvPlugin = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const pkg = require('./package.json');
const {join} = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const WebpackBar = require('webpackbar');

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

const isProduction = () => process.env.NODE_ENV === 'production';

/** @type {webpack.Configuration} */
const config = {
    mode: isProduction() ? 'production' : 'development',
    // only thing that works in a web extension
    devtool: isProduction() ? undefined : 'cheap-source-map',
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
              splitChunks: {
                  cacheGroups: {
                      core: {
                          name: 'core',
                          test: /[\\/]src[\\/]core[\\/]/,
                          chunks: 'all',
                      },
                      react: {
                          test: /[\\/]node_modules[\\/](react|react-dom|styled-components)[\\/]/,
                          name: 'react',
                          chunks: 'all',
                          priority: 20,
                      },
                      vendor: {
                          name: 'vendor',
                          test: /[\\/]node_modules[\\/]/,
                          chunks: 'all',
                          priority: 10,
                      },
                  },
              },
          }
        : {},
    plugins: [
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
    ],
};

module.exports = config;
