// Day 10, Puzzle 1

"use strict";
const fs = require("fs");
require("colors");

// points for each illegal token
let illegalTokenScores = {
    ')': 3,
    ']': 57,
    '}': 1197,
    '>': 25137
};

// how often each illegal token occurs in the input
let illegalTokenCounts = {
    ')': 0,
    ']': 0,
    '}': 0,
    '>': 0
};

// lists of all valid opening and closing tokens
// the list are in the same order, so openingToken[0] and closingToken[0] represent the same token type
let openingTokens = ['(', '[', '{', '<'];
let closingTokens = [')', ']', '}', '>'];

// list of all opening tokens that were not closed
let openTokens = [];

// read whole file, split on \n, then get each char separately, and process all tokens sequentially
// bad for huge files, but the input is pretty small
fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)
    .forEach(ln => {
        for (const token of ln.split("")) {
            // get index in opening or closing tokens
            let oIndex = openingTokens.indexOf(token);
            let cIndex = closingTokens.indexOf(token);

            // if token is neither opening or closing, skip the token with a error
            if (oIndex < 0 && cIndex < 0) {
                console.error(`actually illegal token ${token}`.red);
                continue;
            }

            // if this is a opening token, add it to openTokens
            if (oIndex >= 0) {
                openTokens.push(token);
                continue;
            }

            // if this is a closing token, try to pop it from openTokens
            // if we cannot pop the opening token (not matching), this is a syntax error
            if (cIndex >= 0) {
                let last = openTokens.pop();
                if (!last || openingTokens.indexOf(last) != cIndex) {
                    // syntax error!
                    // write to output (for test_input only)
                    let expectedClosing = closingTokens[openingTokens.indexOf(last)];
                    console.log(`${ln} - Expected ${expectedClosing}, but found ${token}`);

                    // count up errors for this token
                    illegalTokenCounts[token]++;

                    // do not continue with this line
                    break;
                }
            }
        }
    });

console.log(illegalTokenCounts);

// calculate score
let score = 0;
for (const [token, count] of Object.entries(illegalTokenCounts)) {
    score += count * illegalTokenScores[token];
}

console.log(`impressive! you scored ${score.toString().green} points!`);
