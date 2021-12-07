// Day 7, Puzzle 2

/**
 * Never thought that math would be useful some day
 */

"use strict";
const fs = require("fs");
require("colors");

// read whole file, split on \n and then ',', and process all lines sequentially
// bad for huge files, but the input is pretty small
let crabPositions = [];
fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)[0]
    .split(/,/)
    .forEach(posStr => {
        // parse each position
        let pos = Number(posStr);
        if (!pos && pos != 0) {
            console.error(`cannot parse input pos '${posStr}'`.red);
            return;
        }

        crabPositions.push(pos);
    });

// get minimum and maximum initial crab position
// we assume that moving outside of these bounds doesn't make any sense
const minPos = crabPositions.reduce((a, b) => Math.min(a, b));
const maxPos = crabPositions.reduce((a, b) => Math.max(a, b));

// fuelUses is a array of objects containing Numbers 'hpos' and 'fuelUsed'
let fuelUses = [];

// test *all* positions between min and max and check fuel use
console.log(`aligning ${crabPositions.length} crabs between h-pos ${minPos} and ${maxPos}...`);
for (let targetPos = minPos; targetPos < maxPos; targetPos++) {
    // find absolute difference between all crab positions and the target position, and
    // use the gaussian sum formula ('Gaußsche Summenformel') to get the total fuel consuption
    const fuelUsed = crabPositions.map(crabPos => {
        let delta = Math.abs(targetPos - crabPos);
        return (delta * (delta + 1)) / 2;
    })
        .reduce((a, b) => a + b);

    // push result
    console.log(`pos ${targetPos} uses ${fuelUsed} fuel!`.gray);
    fuelUses.push({
        hpos: targetPos,
        fuelUsed: fuelUsed
    });
}

// find smalles fuel use
let minFuelUse = fuelUses.reduce((a, b) => (a.fuelUsed < b.fuelUsed) ? a : b);

// print result
console.log(`minimum fuel use at ${minFuelUse.hpos.toString().green} with ${minFuelUse.fuelUsed.toString().green} fuel used`);
