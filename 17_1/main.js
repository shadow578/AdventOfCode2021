// Day 17, Puzzle 1

/**
 * You could probably solve this with some fancy maths or something, but brute- forcing it 
 * also works if you're running on a sufficiently fast computer. And since you're running
 * node.js, it probably is :P
 * 
 * Note: if you are trying to learn how to program, please do NOT try to learn anything from this solution.
 * It really is kinda bad...
 */

"use strict";
const fs = require("fs");
require("colors");

// read first line of input file
let areaLn = fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)
    .at(0);

// the line should start with "target area:"
// check that's true and remove the prefix
if (!areaLn.startsWith("target area:")) {
    console.error(`invalid input: '${areaLn}'`.red);
    return;
}
areaLn = areaLn.substring("target area:".length).trim();

// split on ',' to get ranges
let [xRangeStr, yRangeStr] = areaLn.split(",").map(x => x.trim());

// xRange should start with x=, yRange with y=
if (!xRangeStr.startsWith("x=") || !yRangeStr.startsWith("y=")) {
    console.error(`invalid input: '${xRangeStr}', '${yRangeStr}'`.red);
    return;
}

// remove 'x=' / 'y=' prefix, then split on '..' to get range parts
let xRange = xRangeStr.substring("x=".length).split("..").map(n => Number(n));
let yRange = yRangeStr.substring("y=".length).split("..").map(n => Number(n));

// output parsed result
console.log(`parsed target area: x=${xRange[0]}..${xRange[1]}, y=${yRange[0]}..${yRange[1]}`);

// build 'probe' template object, that is cloned for every simulation we start
let probeTemplate = {
    x: 0,
    y: 0,
    xVel: 0,
    yVel: 0,
    step: function () {
        this.x += this.xVel;
        this.y += this.yVel;
        if (this.xVel != 0) {
            //this.xVel -= Math.sign(this.xVel);
            this.xVel -= 1;
        }
        this.yVel -= 1;
    },
    isInTarget: function () {
        return this.x >= xRange[0]
            && this.x <= xRange[1]
            && this.y >= yRange[0]
            && this.y <= yRange[1];
    }
};

// configure simulation range for brute- force
// make sure that these values are big enough, otherwise you may miss some!
const simulationRange = {
    x_start: 1,
    y_start: -999,
    x_end: 999,
    y_end: 999
};

// simulate brute- force
let maxY = Number.MIN_SAFE_INTEGER;
for (let sxv = simulationRange.x_start; sxv < simulationRange.x_end; sxv++) {
    for (let syv = simulationRange.y_start; syv < simulationRange.y_end; syv++) {
        // create probe
        let probe = {};
        Object.assign(probe, probeTemplate);

        // set x and y velocities
        probe.xVel = sxv;
        probe.yVel = syv;

        // start stepping, stop if we go beyond the target x or y bounds OR hit the target
        let my = maxY;
        do {
            // simulate
            probe.step();

            // check maximum Y coord
            my = Math.max(my, probe.y);
        } while (!probe.isInTarget() && probe.x <= xRange[1] && (probe.xVel > 0 || probe.y >= yRange[1]));

        if (probe.isInTarget()) {
            console.log(`hit target at (${probe.x}, ${probe.y}) with starting velocity (${sxv}, ${syv})`);
            maxY = my;
        }
    }
}

console.log(`maximum y is ${maxY.toString().green}`);
