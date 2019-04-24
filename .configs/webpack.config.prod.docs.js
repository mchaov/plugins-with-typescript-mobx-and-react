const path = require("path");
const TypedocWebpackPlugin = require("typedoc-webpack-plugin");
const packageJson = require("../package.json");

module.exports = {
    entry: './index.docs.js',
    mode: "production",
    output: {
        path: path.resolve(__dirname),
        filename: 'docs-dummy.js'
    },
    plugins: [
        new TypedocWebpackPlugin({
            jsx: "react",
            target: "es5",
            module: "commonjs",
            name: packageJson.name,
            excludeExternals: true,
            includeDeclarations: true,
            ignoreCompilerErrors: true,
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
            externalPattern: "**/*+.d.ts",
            exclude: "**/*+(test|index|story).*",
            allowSyntheticDefaultImports: true,
            suppressImplicitAnyIndexErrors: true,
            forceConsistentCasingInFileNames: true,
            out: path.resolve(__dirname, "..", "docs")
        }, "./src")
    ]
};