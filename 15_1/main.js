// Day 15, Puzzle 1

/**
 * TODO: this solution currently does not work, as it quickly runs 
 * out of call stack space (due to the recursive function).
 * I really hoped i could get away without using a actual path finding algorithm , but sadly that isn't the case.
 * 
 * Well, i'll have to start from scratch now...
 */

"use strict";
const fs = require("fs");
require("colors");

// this is a 2D array of numbers [y][x]
let map = [];

// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but the input is pretty small
fs.readFileSync("./exclude/test_input.txt", "utf-8")
    .split(/\r?\n/)
    .forEach(ln => {
        // split this line into a list of numbers
        let row = ln.split("").map(n => Number(n));

        // ensure that the length matches the expected width
        if (!map.width) map.width = row.length;
        if (map.width != row.length) {
            console.error(`line '${ln} has invalid length!'`.red);
            return;
        }

        // add to map
        map.push(row);
    });
map.heigth = map.length;
console.log(`parsed map with size: ${map.width} x ${map.heigth}!`);

// safe get function
map.getSafe = function (x, y) {
    if (x < 0 || x >= this.width) return null;
    if (y < 0 || y >= this.heigth) return null;
    return this[y][x];
};

// path risk calc function
function getPathRisk(path) {
    // add up the risk of all positions entered
    let risk = 0;
    path.forEach(pos => {
        risk += map[pos.y][pos.x];
    });

    // substract the risk level from the starting position
    risk -= map[0][0];
    return risk;
}

// find all possible paths
// paths is a list of paths, each beign a list of coordinates it includes, 
// like this: [{x: 0, y:0}, {x: 0, y: 1}, ...]
let paths = [];
function pathFindRecursive(pos, path, allPaths) {
    // clone path and add current pos
    path = path.map(x => x);
    path.push(pos);

    // if current pos is the end position, we're done
    if (pos.x >= (map.width - 1) && pos.y >= (map.heigth - 1)) {
        allPaths.push(path);
        return;
    }

    // if risk of this path already is higher than the risk of the lowest risk path, skip this path
    if (allPaths.length > 0) {
        let lowestRisk = allPaths.map(p => getPathRisk(p)).reduce((a, b) => a > b ? b : a);
        let thisPathRisk = getPathRisk(path);
        if (thisPathRisk > lowestRisk) {
            return;
        }
    }

    // get surrounding positions
    let validPositions = [
        { x: pos.x + 1, y: pos.y }, // right
        { x: pos.x - 1, y: pos.y }, // left
        { x: pos.x, y: pos.y + 1 }, // down
        { x: pos.x, y: pos.y - 1 }  // up
    ];

    // filter out invalid positions
    validPositions = validPositions
        .filter(p => !path.some(e => e.x == p.x && e.y == p.y))     // not already in path
        .filter(p => map.getSafe(p.x, p.y) != null);                // inside map bounds

    // visit all valid positions
    validPositions.forEach(p => {
        pathFindRecursive(p, path, allPaths);
    });
}
console.time("pathFindRecursive");
pathFindRecursive(
    { x: 0, y: 0 },
    [],
    paths
);
console.timeEnd("pathFindRecursive");
console.log(`found ${paths.length} paths!`);

// find the path with the lowest risk
let lowestRiskPath = paths.map(path => {
    // return new object with path + risk for the path
    return {
        path: path,
        totalRisk: getPathRisk(path)
    };
}).sort((a, b) => a.totalRisk - b.totalRisk).at(0);

// draw map with lowest risk
for (let y = 0; y < map.heigth; y++) {
    let ln = "";
    for (let x = 0; x < map.width; x++) {
        // color the pos if it is in our path
        if (lowestRiskPath.path.some(p => p.x == x && p.y == y)) {
            ln += map[y][x].toString().green;
        } else {
            ln += map[y][x].toString().gray;
        }
    }

    console.log(ln);
}

// output result
console.log(`\n the lowest risk path has ${lowestRiskPath.totalRisk.toString().green} risk!`);
