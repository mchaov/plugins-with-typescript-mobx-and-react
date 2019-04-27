const path = require("path");
const workerThreads = require("./cpuResolver");
const resolvePath = x => path.resolve(__dirname, "..", "packages", x, "src")

module.exports = debug => {
    const threadOptions = {
        workers: workerThreads(debug).builder,
        poolParallelJobs: 200,
        poolTimeout: 500,
        workerNodeArgs: ['--max-old-space-size=2048'],
    }
    return {
        target: "web",
        entry: {
            bl: resolvePath("bl"),
            view: resolvePath("view"),
            plugin1: resolvePath("plugin-1"),
            plugin2: resolvePath("plugin-2"),
            plugin3: resolvePath("plugin-3")
        },
        output: {
            path: path.resolve(__dirname, "..", "_bundles"),
            filename: `demo_[name].js`,
            libraryTarget: "umd",
            library: `demo_[name]`,
            umdNamedDefine: true
        },
        externals: {
            "mobx": "mobx",
            "react": "React",
            "react-dom": "ReactDOM",
            "mobx-utils": "mobxUtils",
            "mobx-react": "mobxReact"
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