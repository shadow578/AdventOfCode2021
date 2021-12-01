// Day 1, Puzzle 1

const fs = require("fs");

// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but we're only using 2k lines
let lastN = undefined;
let increases = 0;
fs.readFileSync("./exclude/input.txt", "utf-8").split(/\r?\n/).forEach(line => {
    let n = Number(line.trim());
    if (lastN && n > lastN) {
        // have a increase
        increases++;
    }

    lastN = n;
});

console.log(`total increases in file: ${increases}`);
