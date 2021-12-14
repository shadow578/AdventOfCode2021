// Day 14, Puzzle 1

"use strict";
const fs = require("fs");
require("colors");

// list of pair insertion rules, reach like this: { pair: "AB", insert: 'C', replace: "AcB"}
let pairInsertionRules = [];

// the polymer, as a string
let polymer;

// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but the input is pretty small
fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)
    .forEach(ln => {
        // the first line is always the starting polymer
        if (!polymer) {
            polymer = ln.trim();
            return;
        }

        // split on '->'
        let ruleSplit = ln.split(/->/);

        // we should have 2 pairs
        if (ruleSplit.length != 2) {
            console.error(`invalid pair rule in '${ln}'`.red);
            return;
        }

        // build the rule
        let pair = ruleSplit[0].trim();
        let insert = ruleSplit[1].trim();
        let replace = pair.charAt(0) + insert.charAt(0).toLowerCase() + pair.charAt(1);

        // append rule
        pairInsertionRules.push({
            pair: pair,
            insert: insert,
            replace: replace
        });
    });

// start insertion cycles
console.log(`Template: \t ${polymer}`);
for (let step = 1; step <= 10; step++) {
    // replace all pairs from the insertion rules with the pair + insert
    // insert is inserted as lowercase to stop chaining within steps
    pairInsertionRules.forEach(rule => {
        let prevPolymer;
        do {
            prevPolymer = polymer;
            polymer = polymer.replaceAll(rule.pair, rule.replace);
        } while (prevPolymer != polymer);
    });

    // convert all chars to uppercase
    polymer = polymer.toUpperCase();

    // log output
    console.log(`after step ${step}:\t ${polymer}`);
}

// count the elements
// this is a object with each element as a property and the count as value
let elementCounter = {};
polymer.split("").forEach(e => {
    if (!elementCounter[e]) {
        elementCounter[e] = 0;
    }

    elementCounter[e]++;
});
let elementCounts = Object.entries(elementCounter).sort((a, b) => a[1] - b[1]);

// find result element
let leastCommon = elementCounts.at(0);
let mostCommon = elementCounts.at(-1);
console.log(`\n\nthe least common element is '${leastCommon[0].toString().green}' with ${leastCommon[1].toString().green} occurances`);
console.log(`the most common element is '${mostCommon[0].toString().green}' with ${mostCommon[1].toString().green} occurances`);
console.log(`puzzle answer is: ${(mostCommon[1] - leastCommon[1]).toString().blue}`);
