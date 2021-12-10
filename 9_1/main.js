// Day 9, Puzzle 1

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

// sum up risk levels of all low points
let sum = lowPoints.map(p => p.height + 1).reduce((a, b) => a + b);
console.log(`there are ${lowPoints.length} low points. the sum of all risk levels is ${sum.toString().green}`);
