// Day 9, Puzzle 2

"use strict";
const fs = require("fs");
require("colors");

// the map, parsed from the input
// this is a 2D- Array of the input data
let map = [];

// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but the input is pretty small
let expectedRowLength;
fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)
    .forEach(ln => {
        // convert the line to a array of (single- digit) numbers
        let row = ln.split("").map(n => Number(n));

        // check the width is right
        if (!expectedRowLength) expectedRowLength = row.length;
        if (row.length != expectedRowLength) {
            console.error(`parsed row has wrong length! expected ${expectedRowLength}, got ${row.length}`.red);
            return;
        }

        // append row
        map.push(row);
    });

let mapWidth = map[0].length;
let mapHeight = map.length;
console.log(`parsed map with size ${mapWidth} x ${mapHeight}`);

function mapGetSafe(x, y) {
    if (x < 0 || x >= mapWidth) return Infinity;
    if (y < 0 || y >= mapHeight) return Infinity;
    return map[y][x];
}

// find low points
// lowPoints is a array of objects formatted {x: 0, y: 0, height: 0}, where 
// x and y are the coordinates of the low point, and height is its height 
let lowPoints = [];
for (let x = 0; x < mapWidth; x++) {
    for (let y = 0; y < mapHeight; y++) {
        let center = mapGetSafe(x, y);
        let north = mapGetSafe(x, y - 1);
        let south = mapGetSafe(x, y + 1);
        let east = mapGetSafe(x - 1, y);
        let west = mapGetSafe(x + 1, y);

        // check if all points surrounding the center are defined and smaller
        if (center < north
            && center < south
            && center < east
            && center < west) {
            // this is a lowpoint
            lowPoints.push({
                x: x,
                y: y,
                height: center
            });
        }
    }
}

/**
 * @param {Number} x the center x
 * @param {Number} y the center y
 * @param {Number[]} currentBasin the current basin pool
 */
function checkBasinEdge(x, y, currentBasin) {
    // check bounds
    if (x < 0 || x >= mapWidth) return;
    if (y < 0 || y >= mapHeight) return;

    // check if this point was already "used"
    let height = mapGetSafe(x, y);
    if (height < 0) return;

    // check if this point is the edge of a basin (height == 9)
    if (height >= 9) return;

    // not a basin: add this point to current basin, set height to -1
    currentBasin.push({
        x: x,
        y: y,
        height: height
    });
    map[y][x] = -1;

    // check adjacent points
    checkBasinEdge(x + 1, y, currentBasin);
    checkBasinEdge(x - 1, y, currentBasin);
    checkBasinEdge(x, y + 1, currentBasin);
    checkBasinEdge(x, y - 1, currentBasin);
}

// starting at the low points, find all basins on the map
// allBasins is a list of lists of points {x: 0, y: 0}
let allBasins = [];
lowPoints.forEach(startPoint => {
    let basin = [];
    checkBasinEdge(startPoint.x, startPoint.y, basin);
    allBasins.push(basin);
});

// calculate result and output
let result = allBasins
    .map(b => b.length)     // get basin size
    .sort((a, b) => b - a)     // sort descending
    .slice(0, 3)            // get largest 3 basin sizes
    .reduce((a, b) => a * b);   // multiply sizes together 

console.log(`there are ${allBasins.length} basins`);
console.log(`puzzle answer: ${result.toString().green}`);
