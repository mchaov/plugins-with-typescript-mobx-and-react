'use strict'

const path = require("path");
const webpack = require("webpack");
const snakeToCamel = require("./snakeToCamel");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const sharedConfig = require("./webpack.shared");
const sharedPlugins = require("./sharedPlugins");
const packageJson = require("../package.json");

const envConfig = {};

if (packageJson.envConfig) {
    Object.keys(packageJson.envConfig).forEach(x => {
        envConfig[x.toUpperCase()] = JSON.stringify(packageJson.envConfig[x]);
    })
}

module.exports = Object.assign(
    sharedConfig(false), {
        mode: "development",
        devtool: "source-map",
        plugins: [
            ...sharedPlugins(false),
            new BundleAnalyzerPlugin({
                openAnalyzer: false,
                analyzerMode: "static"
            }),
            new webpack.DefinePlugin({
                "process.env": {
                    NODE_ENV: JSON.stringify("development"),
                    ...envConfig
                }
            })
        ]
    });