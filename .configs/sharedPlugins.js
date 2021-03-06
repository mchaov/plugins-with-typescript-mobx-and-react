const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const workerThreads = require("./cpuResolver");

module.exports = debug => {
    return [
        new ForkTsCheckerWebpackPlugin({
            async: true,
            memoryLimit: 2048,
            tslintAutoFix: true,
            checkSyntacticErrors: true,
            workers: workerThreads(debug).typeChecker,
            tslint: path.resolve(__dirname, "tslint.json"),
            tsconfig: path.resolve(__dirname, "..", "tsconfig.json"),
            useTypescriptIncrementalApi: workerThreads(debug).typeChecker > 1 ? false : true,
            reportFiles: ["**/*.{ts,tsx}", "!**/node_modules/**/*", "!**/dist/**/*", "!**/mocks/**/*", "!**/lib-esm/**/*", "!**/lib/**/*", "!**/_bundles/**/*"]
        })
    ]
};