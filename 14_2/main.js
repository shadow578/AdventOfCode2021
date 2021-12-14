// Day 14, Puzzle 2

/**
 * Pain.
 * 
 * ~~
 * I really, really hate all puzzles that require you to optimize for time / memory...
 * This solution does not look nice, you have no way of actually knowing what the 'polymer' might look like
 * but it answers the puzzles question.
 * 
 * Also, this is ugly af... but it does work very fast, so i guess it's fine
 */

"use strict";
const fs = require("fs");
require("colors");

// map of pair insertion rules, each like this: { "AB": ["AC", "BC"], ...}
let rules = [];

// the polymer, as a string
let polymer;

// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but the input is pretty small
fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)
    .forEach(ln => {
        // the first line is always the starting polymer
        if (!polymer) {
            polymer = ln.trim().split("");
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
        let pairA = pair.charAt(0);
        let pairB = pair.charAt(1);
        let insert = ruleSplit[1].trim().charAt(0);

        // append rule
        rules[pair] = [pairA + insert, insert + pairB];
    });

// convert the polymer array into a map of element pairs and their counts
var pairs = {};
for (let i = 0; i < (polymer.length - 1); i++) {
    let pair = polymer[i] + polymer[i + 1];
    if (!pairs[pair]) {
        pairs[pair] = 0;
    }

    pairs[pair]++;
}


// start insertion cycles
for (let step = 0; step < 40; step++) {
    console.time(`step ${step}`);

    // apply rules for all pairs
    let newPairs = {};
    for (const [pair, count] of Object.entries(pairs)) {
        // get rule for this pair
        let rule = rules[pair];
        if (!rules) {
            console.error(`no rule for ${pair}`.red);
            return;
        }

        // insert new pairs
        rule.forEach(is => {
            if (!newPairs[is]) {
                newPairs[is] = 0;
            }
            newPairs[is] += count;
        });
    };
    pairs = newPairs;

    console.timeEnd(`step ${step}`);
}

// count the elements
// this is a object with each element as a property and the count as value
let elementCounter = {};
for (const [pair, count] of Object.entries(pairs)) {
    // split the pair
    let [a, b] = pair.split("");

    // count up both elements
    if (!elementCounter[a]) {
        elementCounter[a] = 0;
    }
    if (!elementCounter[b]) {
        elementCounter[b] = 0;
    }

    elementCounter[a] += count;
    elementCounter[b] += count;
};
elementCounter[polymer.at(0)]++;
elementCounter[polymer.at(-1)]++;

// correct and sort the count
let elementCounts = Object.entries(elementCounter)
    .map(e => { e[1] /= 2; return e; })     // we count all elements twice, correct that
    .sort((a, b) => a[1] - b[1]);           // sort by count

// find result element
let leastCommon = elementCounts.at(0);
let mostCommon = elementCounts.at(-1);
console.log(`\n\nthe least common element is '${leastCommon[0].toString().green}' with ${leastCommon[1].toString().green} occurances`);
console.log(`the most common element is '${mostCommon[0].toString().green}' with ${mostCommon[1].toString().green} occurances`);
console.log(`puzzle answer is: ${(mostCommon[1] - leastCommon[1]).toString().blue}`);
