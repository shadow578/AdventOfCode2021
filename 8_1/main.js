// Day 8, Puzzle 1

"use strict";
const fs = require("fs");
require("colors");

// the input data array, each entry is a object { signals: ["", ...], outputs: ["", ...] }
let data = [];

// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but the input is pretty small
fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)
    .forEach(ln => {
        // split the line on |
        let splitLn = ln.split(/\|/);

        // ensure we have two parts per line (signals and outputs)
        if (splitLn.length != 2) {
            console.error(`cannot parse line '${ln}'`.red);
            return;
        }

        // split both signals and outputs on space
        let signals = splitLn[0]
            .trim()
            .split(/ /)
            .map(s => s.trim());
        let outputs = splitLn[1]
            .trim()
            .split(/ /)
            .map(s => s.trim());

        // ensure both have correct length
        if (signals.length != 10 || outputs.length != 4) {
            console.error(`unexpected length! signals is ${signals.length}, should be 10; outputs is ${outputs.length}, should be 4`.red);
            return;
        }

        // push the data of this line
        data.push({
            signals: signals,
            outputs: outputs
        });
    });

console.log(`read ${data.length} entries!`.green);

// search for strings in output that have a lenght
// of 2 (digit 1), 4 (digit 4), 3 (digit 7) or 7 (digit 8)
let digitCounts = Array(10).fill(0);
data.forEach(entry => {
    entry.outputs.forEach(outputDigit => {
        let len = outputDigit.length;
        if (len == 2) {
            // this is digit 1
            digitCounts[1]++;
        } else if (len == 4) {
            // this is digit 4
            digitCounts[4]++;
        } else if (len == 3) {
            // this is digit 7
            digitCounts[7]++;
        } else if (len == 7) {
            // this is digit 8
            digitCounts[8]++;
        } else {
            // unknown digit
            console.error(`digit length unknown: '${outputDigit}' with length ${len}`.red);
        }
    });
});

// output results
console.log(digitCounts);
let sum = digitCounts.reduce((a, b) => a + b);
console.log(`puzzle answer: ${sum.toString().green}`);
