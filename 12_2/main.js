// Day 12, Puzzle 2

/**
 * Note: this solution isn't really optimized, and may take a few minutes to compute.
 * But it does work, and i don't feel like optimizing it...
 */

"use strict";
const fs = require("fs");
require("colors");

/**
 * check if a cave is small
 * 
 * @param {String} cave  the cave to check
 * @returns is this a small cave?
 */
function isSmallCave(cave) {
    return cave == cave.toLowerCase();
}

/**
 * @param {*[]} arr the array to get duplicates in
 * @returns a list of the duplicate values in the input 
 */
function getDuplicates(arr) {
    return arr.filter((e, i, a) => a.indexOf(e) !== i);
}

// this is a object where each cave has a entry containing a list of all caves connected to that cave
// like so: {
//   "a": ["b", "c"],
//   "b": ["a"]
//   "c": ["a", "d"]
//   //...
// }
let caveConnections = {};

// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but the input is pretty small
fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)
    .forEach(ln => {
        // split the line on '-' to get entry and exit
        let lnSplit = ln.split(/-/);
        if (lnSplit.length != 2) {
            console.error(`line '${ln}' has wrong format, skipping...`.red);
            return;
        }

        // get entry and exit
        let entry = lnSplit[0].trim();
        let exit = lnSplit[1].trim();

        // ensure both entry and exit have a entry in caveConnections
        if (!caveConnections[entry]) {
            caveConnections[entry] = [];
        }
        if (!caveConnections[exit]) {
            caveConnections[exit] = [];
        }

        // add entry and exit to each others list of connections 
        caveConnections[entry].push(exit);
        caveConnections[exit].push(entry);
    });

// remove duplicate cave connections
// and also remove all connections back to the 'start' cave
for (const k in caveConnections) {
    caveConnections[k] = [...new Set(caveConnections[k].filter(c => c != "start"))];
}

// ensure we have at least the 'start' and 'end' caves
if (!caveConnections["start"] || !caveConnections["end"]) {
    console.error("start or end cave are missing!".red);
    return;
}


// remove connections to other caves from 'end' cave
// since we don't ever want to exit the 'end' cave again
caveConnections["end"] = [];

// print result
console.log(caveConnections);

/**
 * @param {String} currentCave the current cave 
 * @param {String[]} path the path we used to get to the current cave
 * @param {String[][]} pathsToEnd a list of all paths that reach the end cave
 */
function exploreRecurse(currentCave, path, pathsToEnd) {
    // get list of all caves that are connected to the current cave
    let connectedCaves = caveConnections[currentCave];

    // find all paths that are legal to reach
    let paths = [];
    connectedCaves.forEach(cave => {
        // if this is a small cave, we already visited it, AND we already visited a small cave once
        // skip this cave
        if (isSmallCave(cave)
            && path.includes(cave)
            && getDuplicates(path).some(c => isSmallCave(c))) {
            return;
        }

        // we can visit this cave, add a path
        let p = path.slice();
        p.push(cave);
        paths.push(p);
    });

    // add all caves that reach the end to pathsToEnd
    pathsToEnd.push(...paths.filter(p => p.at(-1) == "end"));

    // continue to explore all paths that did not reach the end cave
    paths.filter(p => p.at(-1) != "end").forEach(p => exploreRecurse(p.at(-1), p, pathsToEnd));
}

// find all paths to the end
let pathsToEnd = [];
exploreRecurse("start", ["start"], pathsToEnd);

// print all paths
pathsToEnd.forEach(path => console.log(path.join(",")));

// output count
console.log(`there are ${pathsToEnd.length.toString().green} valid paths!`);
