// Day 1, Puzzle 2

const fs = require("fs");

// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but we're only using 2k lines
let measurements = [];
fs.readFileSync("./exclude/input.txt", "utf-8").split(/\r?\n/).forEach(line => {
    measurements.push(Number(line.trim()));
});

// process measurements in 3- sample sliding window
// and check if the total value increased compared to the previous window
let lastSum = undefined;
let increases = 0;
for (let i = 0; i < measurements.length; i++) {
    // check if there are (at least) two more measurements for this window
    // if not, we stop
    if (!measurements[i + 2]) {
        break;
    }

    // create window sum
    let sum = measurements[i] + measurements[i + 1] + measurements[i + 2];

    // compare to previous sum 
    if (lastSum && sum > lastSum) {
        increases++;
    }

    lastSum = sum;
}

// output
console.log(`total window increases in file: ${increases}`);
