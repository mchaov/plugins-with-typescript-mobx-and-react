const cpus = require('os').cpus();

let _t = 1;
let _b = 1;
let i = "unknown";

if (cpus && cpus.length > 3) {
    _t = 2;
    _b = cpus.length - 2;
    i = cpus[0] && cpus[0].model;
}

let timer = 0;

function log(debug, cpus, i, b, t) {
    console.log(`Mode: ${debug ? "debug" : "release"}`);
    console.log(`Total available threads: ${cpus.length} - Cores model: ${i}`);
    console.log(`Threads used for build: ${b}`);
    console.log(`Threads used for type checker: ${t}`);
}

module.exports = debug => {
    let b = _b;
    let t = _t;

    if (debug === true && b > 1) {
        b = b - 1;
    }

    clearTimeout(timer);
    timer = setTimeout(log.bind(null, debug, cpus, i, b, t), 100);

    return {
        typeChecker: t,
        builder: b
    }
}