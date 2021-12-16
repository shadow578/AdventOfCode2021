// Day 15, Puzzle 2

"use strict";
const fs = require("fs");
const easystarjs = require("easystarjs");
const easystar = new easystarjs.js();
require("colors");

// this is a 2D array of numbers [y][x]
let smallMap = [];

// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but the input is pretty small
fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)
    .forEach(ln => {
        // split this line into a list of numbers
        let row = ln.split("").map(n => Number(n));

        // ensure that the length matches the expected width
        if (!smallMap.width) smallMap.width = row.length;
        if (smallMap.width != row.length) {
            console.error(`line '${ln} has invalid length!'`.red);
            return;
        }

        // add to map
        smallMap.push(row);
    });
smallMap.heigth = smallMap.length;
console.log(`parsed map with size: ${smallMap.width} x ${smallMap.heigth}!`);

// 'inflate' the map
// totally not a way to make the second puzzle test your path- finding algorithm or anything...
let map = Array.from(Array(smallMap.heigth * 5), () => Array(smallMap.width * 5).fill(0));
map.width = smallMap.width * 5;
map.heigth = smallMap.heigth * 5;
// horizontal
for (let y = 0; y < smallMap.heigth; y++) {
    for (let x = 0; x < smallMap.width; x++) {
        let val = smallMap[y][x];
        for (let i = 0; i < 5; i++) {
            map[y][x + (smallMap.width * i)] = (((val + i) - 1) % 9) + 1;
        }
    }
}

// downwards
for (let x = 0; x < map.width; x++) {
    for (let y = 0; y < smallMap.heigth; y++) {
        let val = map[y][x];
        for (let i = 0; i < 5; i++) {
            map[y + (smallMap.heigth * i)][x] = (((val + i) - 1) % 9) + 1;
        }
    }
}

console.log(`inflated to map with size: ${map.width} x ${map.heigth}!`);

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
    // stop ticking
    clearInterval(esTicker);

    if (!path) {
        console.error("no path was found!".red);
        return;
    }

    // draw map with the path highlighted
    // skip drawing map if too wide
    if (map.width <= 200) {
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
    }

    // output result
    console.log(`\nthe lowest risk path has ${getPathRisk(path).toString().green} risk!`);
});

// start ticking easystar
const esTicker = setInterval(() => {
    easystar.calculate();
}, 1);
