// Day 8, Puzzle 2

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

// define all valid digits and what digits they use
//  AAA
// B   C
// B   C
//  DDD
// E   F
// E   F
//  GGG
const digitDefinitions = [
    "ABCEFG",   // 0
    "CF",       // 1
    "ACDEG",    // 2
    "ACDFG",    // 3
    "BCDF",     // 4
    "ABDFG",    // 5
    "ABDEFG",   // 6
    "ACF",      // 7
    "ABCDEFG",  // 8
    "ABCDFG"    // 9
];

// generate all possible mappings of [a,b,c,d,e,f,g] to [A,B,C,D,E,F,G]
// this is a list of objects like this: [{ a: 'A', b: 'B', ...},{ a: 'B', b: 'A', ...}, ...]
console.log("generating mappings...");
const allSegments = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
let allMappings = [];
allSegments.forEach(a => {
    allSegments.forEach(b => {
        if (b == a) return;
        allSegments.forEach(c => {
            if (c == a || c == b) return;
            allSegments.forEach(d => {
                if (d == a || d == b || d == c) return;
                allSegments.forEach(e => {
                    if (e == a || e == b || e == c || e == d) return;
                    allSegments.forEach(f => {
                        if (f == a || f == b || f == c || f == d || f == e) return;
                        allSegments.forEach(g => {
                            if (g == a || g == b || g == c || g == d || g == e || g == f) return;
                            allMappings.push({
                                a: a,
                                b: b,
                                c: c,
                                d: d,
                                e: e,
                                f: f,
                                g: g
                            });
                        });
                    });
                });
            });
        });
    });
});

console.log(`generated ${allMappings.length} mappings`);
//console.log(allMappings);


// use the mapping to decode the output, and return the digit
// according to the definitions in digitDefinitions 
function decode(input, mapping) {
    // decode input using mapping
    for (const [key, val] of Object.entries(mapping)) {
        input = input.replace(key, val);
    }

    // sort decoded input alphabetically
    input = input.split("").sort().join("");

    // find all digits that match the decoded input
    // if the input is valid with the mapping, we get exactly one result
    // if it is invalid, we get somewhere between 0 and 
    let validDigits = digitDefinitions.flatMap(def => input == def ? [digitDefinitions.indexOf(def)] : []);

    // check if valid
    if (validDigits.length == 1) {
        return validDigits[0];
    }

    // not valid, return according
    return undefined;
}

// decode all entries in the data by testing all mappings 
// for all entries and testing if all the digits are valid (== are in digitDefinitions)
// we save the used mapping in 'mapping', the decoded signals in 'signalsDecoded' and 
// the decoded outputs in 'outputsDecoded'
data = data.map(entry => {
    // test all mappings on all signals
    let correctMapping;
    mappingLoop: for (const mapping of allMappings) {
        // check all signals
        for (const signal of entry.signals) {
            let d = decode(signal, mapping);
            if (!d && d != 0) {
                // this signal cannot be decoded with this mapping
                continue mappingLoop;
            }
        }

        // all signals can be decoded with the mapping, it probably is the right one
        correctMapping = mapping;
        break;
    }

    // check that we found a mapping
    if (!correctMapping) {
        console.error(`could not find mapping for entry: {signals: [${entry.signals.join(", ")}], outputs: [${entry.outputs.join(", ")}]`.red);
        return;
    }

    // create decoded result
    return {
        signals: entry.signals,
        outputs: entry.outputs,
        mapping: correctMapping,
        signalsDecoded: entry.signals.map(signal => decode(signal, correctMapping)),
        outputsDecoded: entry.outputs.map(output => decode(output, correctMapping))
    };
});
//console.log(data);

// prepare output
let sum = data.map(e => Number(e.outputsDecoded.join(""))).reduce((a, b) => a + b);
console.log(`the sum of all outputs is ${sum.toString().green}`);
