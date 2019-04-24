const path = require("path");
const packageJson = require("../package.json");
const workerThreads = require("./cpuResolver");
const snakeToCamel = require("./snakeToCamel");

module.exports = debug => {
    const threadOptions = {
        workers: workerThreads(debug).builder,
        poolParallelJobs: 200,
        poolTimeout: 500,
        workerNodeArgs: ['--max-old-space-size=2048'],
    }
    return {
        target: "web",
        entry: path.resolve(__dirname, "..", "src"),
        output: {
            path: path.resolve(__dirname, "..", "_bundles"),
            filename: `${snakeToCamel(packageJson.name)}.js`,
            libraryTarget: "umd",
            library: `${snakeToCamel(packageJson.name)}`,
            umdNamedDefine: true
        },
        resolve: {
            extensions: [".js", ".ts", ".tsx", ".jsx", "json"],
        },
        module: {
            rules: [{
                test: /\.tsx?$/,
                use: [{
                        loader: 'cache-loader'
                    },
                    {
                        loader: 'thread-loader',
                        options: threadOptions,
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            happyPackMode: true
                        }
                    }
                ],
                exclude: [/node_modules/]
            }],
        },
    }
}