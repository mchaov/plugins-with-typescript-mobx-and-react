const path = require("path");
const rootDir = path.resolve(process.cwd());

module.exports = {
    "globals": {
        "ts-jest": {
            "tsConfig": "testing-tsconfig.json"
        }
    },
    "testURL": "http://localhost/",
    "cacheDirectory": path.join(rootDir, ".jest-cache"),
    "rootDir": rootDir,
    "verbose": true,
    "testRegex": "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$",
    "setupFiles": [
        path.resolve(process.cwd(), ".configs", "jestsetup.js")
    ],
    "transformIgnorePatterns": ["node_modules"],
    "transform": {
        ".(ts|tsx)": "ts-jest",
        "^.+\\.js$": "babel-jest"
    },
    "collectCoverage": false,
    "collectCoverageFrom": [
        "**/*.{ts,tsx}",
        "!**/node_modules/**",
        "!**/vendor/**",
        "!**/*.d.ts",
        "!**/dict.ts",
        "!**/config.ts",
        "!**/index.ts",
        "!**/index.tsx"
    ],
    "coverageDirectory": path.resolve(process.cwd(), "coverage"),
    "coverageThreshold": {
        "global": {
            "branches": 100,
            "functions": 100,
            "lines": 100,
            "statements": 100
        }
    },
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js"
    ]
}