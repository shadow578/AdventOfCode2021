// Day 6, Puzzle 2

/**
 * This puzzle took me forever to solve, because i initially tried to optimize my solution for puzzle 1
 * for simulation sizes that large... Which resulted in node.js constantly running out of memory.
 * On top of that, since i'm on Windows on ARM, i'm limited to using 32bit node.js, limiting my 
 * memory usage to a maximum of ~4Gb - so no 'just increase the heap to 16Gb' for me :(
 * 
 * After fiddling with node for a few hours, trying async, manual GCing and the likes, I got the idea
 * to solve the problem like i did here (kinda felt stupid, because it's such a simple solution)...
 * 
 * Anyway, it works and scales very nicely (O(n) i think?), so it's good enough for me :D
 */

"use strict";
const fs = require("fs");
require("colors");

// how many days to simulate
const daysToSimulate = 256;

// fishCount is a array where each index represents the number of fish with that age
// (so all newborn fish start at index 8, and fish reproduce when they reach index 0)
// fish can only be between 0 and 8 days old, so the array needs 8 entries
let fishCounts = Array(8).fill(0);

// read whole file, split on \n and then ',', and process all lines sequentially
// bad for huge files, but the input is pretty small
fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)[0]
    .split(/,/)
    .forEach(ageStr => {
        // parse each fish's age and count it
        let age = Number(ageStr);
        if (!age && age != 0) {
            console.error(`cannot parse input age '${ageStr}'`.red);
            return;
        }

        fishCounts[age]++;
    });


// simulate days
for (let day = 0; day < daysToSimulate; day++) {
    // save the number of fish that will reproduce this day for later
    let fishToReproduce = fishCounts[0];

    // age down all fish
    // by "rotating" the array.
    // this copies all values to i-1
    for (let i = 1; i < fishCounts.length; i++) {
        fishCounts[i - 1] = fishCounts[i];
    }

    // simulate reproduction: 
    // adult fish that just reproduced are added to age 6
    fishCounts[6] += fishToReproduce;

    // newborn fish are added to age 8
    // NOTE: we're not adding but assigning, since the age- down step should have 
    // reset the last index to 0. But we don't actually do that, because 
    // why would we (we'd be adding 0 + fishToReproduce, which is fishToReproduce anyways...)
    fishCounts[8] = fishToReproduce;

    // print all fish counts
    let totalFish = fishCounts.reduce((a, b) => a + b);
    console.log(`On day ${(day + 1).toString().padStart(3, " ").green}, there are ${totalFish.toString().padStart(12, " ").red}`);
}
