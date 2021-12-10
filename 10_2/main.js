// Day 10, Puzzle 2

"use strict";
const fs = require("fs");
require("colors");

// points for each repaired token
let repairedTokenScores = {
    ')': 1,
    ']': 2,
    '}': 3,
    '>': 4
};

// lists of all valid opening and closing tokens
// the list are in the same order, so openingToken[0] and closingToken[0] represent the same token type
let openingTokens = ['(', '[', '{', '<'];
let closingTokens = [')', ']', '}', '>'];

// read whole file, split on \n, then get each char separately, and process all tokens sequentially
// bad for huge files, but the input is pretty small
let scores = [];
fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)
    .forEach(ln => {
        // skip empty lines
        if (ln.length <= 0) return;

        // list of all opening tokens that were not closed
        let openTokens = [];

        // iterate all tokens in this line
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
                    // discard this line
                    return;
                }
            }
        }

        // skip if no repair is needed
        if (openTokens.length <= 0) return;


        // openTokens contains all tokens that were not yet closed
        // to repair the line, we'd have to close them
        // since we're only interested in the score, we just add to the score
        let closeTokens = openTokens.reverse().map(oToken => closingTokens[openingTokens.indexOf(oToken)]);

        // output repair info
        console.log(`${ln} - repair with ${closeTokens.join("")}`);

        // calculate score
        scores.push(closeTokens.map(t => repairedTokenScores[t]).reduce((a, b) => (a * 5) + b));
    });

// get final score (the middle of the sorted array)
scores.sort((a, b) => a - b);
console.log(scores);
let score = scores[Math.trunc(scores.length / 2)];
console.log(`impressive! you scored ${score.toString().green} points!`);
