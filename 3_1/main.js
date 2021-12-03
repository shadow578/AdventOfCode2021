// Day 3, Puzzle 1

const fs = require("fs");

// contains the value of each line, each as a array of n booleans 
// where n == lineLen
let bins = [];

// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but the input is pretty small
let lineLen = undefined;
fs.readFileSync("./exclude/input.txt", "utf-8").split(/\r?\n/).forEach(line => {
    // ensure all lines are the same length
    if (!lineLen) {
        lineLen = line.length;
    }
    if (lineLen != line.length) {
        console.error(`line '${line}' has wrong length! expected ${lineLen} chars, got ${line.length}`);
        return;
    }

    // check each char of the line
    let bin = [];
    for (const char of line) {
        if (char == "0") {
            bin.push(false);
        } else if (char == "1") {
            bin.push(true);
        } else {
            console.error(`invalid char in line: ${char}`);
        }
    };

    // append
    bins.push(bin);
});

console.log(`${bins.length} bins; ${lineLen} bits/bin`);

// init bitcounts to 0 for n bits
let bitCount = [];
for (let i = 0; i < lineLen; i++) {
    bitCount.push(0);
}

// count how many 1s are in each position of each entry in bins
// this way, bitCount represents a array with the count of "1"- bits in each position
bins.forEach(bin => {
    for (let i = 0; i < bin.length; i++) {
        if (bin[i]) {
            // 1
            bitCount[i]++;
        }
    }
});


// calculate gamma and epsilon rate
// start at LSB, to MSB
let gamma = 0, epsilon = 0, i = 0;
for (let n = bitCount.length - 1; n >= 0; n--) {
    if (bitCount[n] > (bins.length / 2)) {
        // "1" is most common in position n
        // add to gamma
        gamma += Math.pow(2, i);
    } else {
        // "0" is most common in position n
        // add to epsilon
        epsilon += Math.pow(2, i);
    }

    i++;
}

// output
console.log(`gamma = ${gamma}; epsilon = ${epsilon}`);
console.log(`puzzle solution: ${gamma * epsilon}`);
