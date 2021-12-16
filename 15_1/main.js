// Day 15, Puzzle 1

/**
 * Learning to walk the way of node :P 
 * Why find your own solution when there's a library that does the work, amirite?
 * Seriously tho, it's really amazing how many awesome libraries there are for node, and javascript in general. 
 * Also, documentation generally seems to be quite good too (compared to libraries for C# or Java, at least)
 */

"use strict";
const fs = require("fs");
const easystarjs = require("easystarjs");
const easystar = new easystarjs.js();
require("colors");

// this is a 2D array of numbers [y][x]
let map = [];

// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but the input is pretty small
fs.readFileSync("./exclude/input.txt", "utf-8")
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

// load map into easystar
easystar.setGrid(map);

// make all tiles walkable
let tileTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9];
easystar.setAcceptableTiles(tileTypes);

// set cost of each tile
tileTypes.forEach(tt => easystar.setTileCost(tt, tt));

// find the path
easystar.findPath(0, 0, map.width - 1, map.heigth - 1, (path) => {
    if (!path) {
        console.error("no path was found!".red);
        return;
    }

    // stop ticking
    clearInterval(esTicker);

    // draw map with the path highlighted
    for (let y = 0; y < map.heigth; y++) {
        let ln = "";
        for (let x = 0; x < map.width; x++) {
            // color the pos if it is in our path
            if (path.some(p => p.x == x && p.y == y)) {
                ln += map[y][x].toString().green;
            } else {
                ln += map[y][x].toString().gray;
            }
        }

        console.log(ln);
    }

    // output result
    console.log(`\nthe lowest risk path has ${getPathRisk(path).toString().green} risk!`);
});

// start ticking easystar
const esTicker = setInterval(() => {
    easystar.calculate();
}, 1);
