// Day 11, Puzzle 1

"use strict";
const fs = require("fs");
require("colors");

// number of total flashes. updated from within the Octopus class
let totalFlashes = 0;

class Octopus {
    constructor(initialEnergyLevel, x, y) {
        this.energy = initialEnergyLevel;
        this.didFlashThisStep = false;
        this.x = x;
        this.y = y;
    }

    /**
     * simulate a step:
     * - increase energy by 1
     */
    step() {
        this.energy++;
        this.didFlashThisStep = false;
    }

    /**
     * @returns can this octopus flash?
     */
    canFlash() {
        return this.energy > 9 && !this.didFlashThisStep;
    }

    /**
     * maybe make this octopus flash. 
     * octopus can only flash ONCE per step
     * 
     * @returns did this octopus flash?
     */
    maybeFlash() {
        if (this.canFlash()) {
            this.didFlashThisStep = true;
            totalFlashes++;
            return true;
        }

        return false;
    }

    /**
     * reset the energy of this octopus if it did flash this step
     */
    maybeResetEnergy() {
        if (this.didFlashThisStep) {
            this.energy = 0;
        }
    }
}

// this is a 2D- array of Octopus
let map = [];

/**
 * print the map to console
 */
function printMap() {
    map.forEach(row => {
        let ln = "";
        row.forEach(octopus => {
            if (octopus.didFlashThisStep) {
                ln += octopus.energy.toString().white;
            } else {
                ln += octopus.energy.toString().gray;
            }
        });

        console.log(ln);
    });
    console.log("");
}

// read whole file, split on \n, then get each energy level separately, and process all levels sequentially
// bad for huge files, but the input is pretty small
let width;
let py = 0;
fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)
    .forEach(ln => {
        // convert line to list of numbers (energy levels)
        const lvls = ln.split("").map(n => Number(n));

        // check width is valid
        if (!width) width = lvls.length;
        if (lvls.length != width) {
            console.error(`line '${ln}' has invalid length: expected ${width}, got ${lvls.length}`.red);
            return;
        }

        // add row to octipi map
        let px = 0;
        map.push(lvls.map(el => new Octopus(el, px++, py)));
        py++;
    });

let height = map.length;
console.log(`parsed map with w:${width} and h:${height}`);
printMap(map);

/**
 * get the octopus at the point (x,y) safely.
 * if the coord does not exist, null is returned 
 * 
 * @param {Number} x x coord
 * @param {Number} y y coord 
 * @returns octopus at (x,y), or null
 */
function mapGetSafe(x, y) {
    if (x < 0 || x >= width) return null;
    if (y < 0 || y >= height) return null;
    return map[y][x];
}

/**
 * make all octopus flash, starting from the start octopus (recursively) 
 * 
 * @param {Octopus} startOcto the start octopus
 */
function makeFlashRecurse(startOcto) {
    // make the start octopus flash, abort if did not flash
    if (!startOcto.maybeFlash()) {
        return;
    }

    // get start coords
    let sx = startOcto.x;
    let sy = startOcto.y;

    // create a list of all adjacent octopus (that are valid)
    let adjacentOctopi = [
        mapGetSafe(sx + 1, sy + 1), // Top Right
        mapGetSafe(sx + 1, sy + 0), // Center Right
        mapGetSafe(sx + 1, sy - 1), // Bottom Right
        mapGetSafe(sx + 0, sy + 1), // Top Center
        mapGetSafe(sx + 0, sy - 1), // Bottom Center
        mapGetSafe(sx - 1, sy + 1), // Top Left
        mapGetSafe(sx - 1, sy + 0), // Center Left
        mapGetSafe(sx - 1, sy - 1)  // Bottom Left
    ].filter(o => o);

    // increment energy level of all adjacent octopus
    adjacentOctopi.forEach(o => o.energy++);

    // make all adjacent flash (if they can)
    adjacentOctopi.forEach(o => makeFlashRecurse(o));
}

// simulation loop
for (let i = 0; i < 100; i++) {
    // increase energy of all octopi
    map.forEach(row => row.forEach(octopus => octopus.step()));

    // find octopus that are ready to flash now (seeds for makeFlashRecurse)
    let readyToFlash = map.flatMap(row => row.filter(o => o.canFlash()));

    // flash recursively
    readyToFlash.forEach(o => makeFlashRecurse(o));

    // reset energy of all octopi that flashed this step
    map.forEach(row => row.forEach(octopus => octopus.maybeResetEnergy()));

    // print map after this step
    console.log(`After step ${i}:`);
    printMap();
}

// print result
console.log(`there have been a total of ${totalFlashes.toString().green} flashes!`);
