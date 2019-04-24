export * from "./core";
export let mocks = {};

if (process.env.NODE_ENV === "development") {
    mocks = require("./mocks");
}