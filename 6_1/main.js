// Day 6, Puzzle 1

/**
 * Ooh... fancy array spread operator
 */

"use strict";
const fs = require("fs");
require("colors");

class LanternFish {
    /**
     * create a new lantern fish
     * 
     * @param {Number} age the age of the lantern fish. defaults to 8 
     */
    constructor(age = 8) {
        this.age = age;
    }

    /**
     * reset this fish's age (to 6)
     */
    resetAge() {
        this.age = 6;
    }

    /**
     * ages this lantern fish by one day, and spawns new fish accordingly
     * 
     * @returns a list of the newly spawned fish (by this fish)
     */
    ageThisFish() {
        // count down the age
        this.age--;

        // if the age was 0, reset the age and spawn a new fish
        if (this.age < 0) {
            this.resetAge();
            return [new LanternFish()];
        }

        // nothing happens by default
        return [];
    }

}

function logFish(msg, fish) {
    let fishPrint = "(Too Many Fish)".red;
    if (fish.length <= 30) {
        fishPrint = fish.map(fish => fish.age).join(",");
    }

    console.log(`${msg} (${fish.length.toString().padStart(4, " ")})   ${fishPrint}`);
}

// how many days to simulate
const daysToSimulate = 80;

// read whole file, split on \n and then ',', and process all lines sequentially
// bad for huge files, but the input is pretty small
let allFish = [];
fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)[0]
    .split(/,/)
    .forEach(ageStr => {
        // parse each fish's age and create a new fish
        let age = Number(ageStr);
        if (!age && age != 0) {
            console.error(`cannot parse input age '${ageStr}'`.red);
            return;
        }

        allFish.push(new LanternFish(age));
    });

// print initial state
logFish("Initial state: ", allFish);


// simulate days
let newFish = [];
for (let day = 0; day < daysToSimulate; day++) {
    // age all fish, add newly spawned fish to newFish
    allFish.forEach(fish => {
        newFish.push(...fish.ageThisFish());
    });

    // add newly spawned fish to array of all fish
    allFish.push(...newFish);
    newFish = [];

    // print state
    logFish(`After ${(day + 1).toString().padStart(3, " ")} days:`, allFish);
}


// output result
console.log(`After ${daysToSimulate.toString().red}, there are a total of ${allFish.length.toString().green} fish`);
