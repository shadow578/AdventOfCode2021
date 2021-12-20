// Day 18, Puzzle 2

"use strict";
const fs = require("fs");
require("colors");

class SnailfishNumber {
    static parse(str) {
        return new SnailfishNumber(JSON.parse(str));
    }

    constructor(data) {
        this.data = data;
    }

    add(other) {
        // add self + other, adding depth information to each number
        const flattenAndAddDepth = (value, depth = 0) => {
            if (typeof (value) === "number") {
                return [{
                    value: value,
                    depth: depth
                }];
            }

            return value.flatMap(x => flattenAndAddDepth(x, depth + 1));
        };
        let values = flattenAndAddDepth([this.data, other.data]);

        // explode and split the numbers
        const explode = (values) => {
            // find first index to explode
            let i = values.findIndex(v => v.depth > 4);

            // stop if nothing found to explode
            if (i < 0) {
                return false;
            }

            // add to previous
            if (i > 0) {
                values[i - 1].value += values[i].value;
            }

            // add to next
            if (i < (values.length - 2)) {
                values[i + 2].value += values[i + 1].value;
            }

            // remove exploded node
            values.splice(i, 2, {
                value: 0,
                depth: --values[i].depth
            });

            return true;
        };
        const split = (values) => {
            // find first index of a value to split
            let i = values.findIndex(v => v.value >= 10);

            // skip if nothing found
            if (i < 0) {
                return false;
            }

            // split the value at i
            let v = values[i];
            values.splice(i, 1, {
                value: Math.floor(v.value / 2),
                depth: v.depth + 1
            }, {
                value: Math.ceil(v.value / 2),
                depth: v.depth + 1
            });

            return true;
        };

        // explode & split until we're done
        while (explode(values) || split(values));

        // return the data into the original form
        const foldAndRemoveDepth = (values, pos = [0], depth = 0) => {
            if (values[pos[0]].depth > depth) {
                return [foldAndRemoveDepth(values, pos, depth + 1), foldAndRemoveDepth(values, pos, depth + 1)];
            }

            return values[pos[0]++].value;
        };
        return new SnailfishNumber(foldAndRemoveDepth(values));
    }

    magnitude() {
        const mag = (val) => {
            if (typeof (val) === "number") {
                return val;
            }

            return (3 * mag(val[0])) + (2 * mag(val[1]));
        };

        return mag(this.data);
    }

    toString() {
        return JSON.stringify(this.data);
    }
}

// read all lines of the input, and parse them into snailfish numbers
let inputNumbers = fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)
    .filter(ln => ln.trim())
    .map(ln => SnailfishNumber.parse(ln));

console.log(`parsed ${inputNumbers.length} input numbers!`);

// add all possible numbers together, only keep highest magnitude
let maxMag = Number.MIN_SAFE_INTEGER;
for (const a of inputNumbers) {
    for (const b of inputNumbers) {
        // skip adding two equal numbers
        if (a === b) continue;

        // add together
        let sum = a.add(b);
        let magnitude = sum.magnitude();
        maxMag = Math.max(maxMag, magnitude);

        //console.log(`${a.toString()} + ${b.toString()} = ${sum.toString()} (${magnitude})`);
    }
}

// output
console.log(`highest possible magnitude is ${maxMag.toString().green}`);
