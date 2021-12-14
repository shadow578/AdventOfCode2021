// Day 13, Puzzle 1

"use strict";
const fs = require("fs");
require("colors");

// a list of the coordinates of all dots on the paper
// each like so: {x: 0, y: 0}
let dotCoords = [];

// a list of folding instruction, each like so: { along: "x|y", at:7 }
let foldInstructions = [];

// read whole file, split on \n
// bad for huge files, but the input is pretty small
fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)
    .forEach(ln => {
        // check if line starts with 'fold'
        if (ln.startsWith("fold")) {
            // fold instruction, split on spaces
            let lnSplit = ln.split(/ /);

            // we should have 3 parts
            if (lnSplit.length != 3) {
                console.error(`invalid fold instruction '${ln}'`.red);
                return;
            }

            // split last entry on = to get direction and value
            let foldSplit = lnSplit[2].split(/=/);

            // we should have two parts
            if (foldSplit.length != 2) {
                console.error(`invalid fold instruction '${ln}'`.red);
                return;
            }

            // add to list of fold instructions
            foldInstructions.push({
                along: foldSplit[0].trim(),
                at: Number(foldSplit[1])
            });
        } else {
            // position of a dot, split on ',' 
            let coordSplit = ln.split(/,/);

            // ensure we have two parts
            if (coordSplit.length != 2) {
                console.error(`invalid dot coord '${ln}'`.red);
                return;
            }

            // add to list of coords
            dotCoords.push({
                x: Number(coordSplit[0]),
                y: Number(coordSplit[1])
            });
        }
    });

// convert the list of dots into the map:
// find maximum x and y coordinates (we assume that the minimum is 0/0)
// this is the map width and height
let mapWidth = 1 + dotCoords.map(c => c.x).reduce((a, b) => a > b ? a : b);
let mapHeight = 1 + dotCoords.map(c => c.y).reduce((a, b) => a > b ? a : b);

// initialize the 'paper'
// a 2D- array of chars representing the folding paper
let paper = Array.from(Array(mapHeight), () => Array(mapWidth).fill('.'));
paper.width = mapWidth;
paper.height = mapHeight;

// mark all "dots"
dotCoords.forEach(dot => {
    paper[dot.y][dot.x] = '#';
});

// printing function
paper.print = function () {
    this.forEach(row => {
        console.log(row.map(c => c == '#' ? c.white : c.gray).join(''));
    });
};

// folding function
paper.fold = function (fold) {
    if (fold.along == 'x') {
        // fold along y axis (== 'to the left')
        for (let y = 0; y < this.height; y++) {
            for (let xo = 0; xo < fold.at; xo++) {
                // get paper 'entries' at left and right
                let left = this[y][xo];
                let right = this[y][this.width - xo - 1];

                // merge and write back to left position
                this[y][xo] = (right == '#') ? right : left;

                // clear out right pos
                this[y][this.width - xo - 1] = ' ';
            }

            // clear out column on seam
            this[y][fold.at] = ' ';
        }
    } else if (fold.along == 'y') {
        // fold along x axis (== 'up')        
        for (let x = 0; x < this.width; x++) {
            for (let yo = 0; yo < fold.at; yo++) {
                // get paper 'entries' at top and bottom
                let top = this[yo][x];
                let btm = this[this.height - yo - 1][x];

                // merge and write back to top position
                this[yo][x] = (btm == '#') ? btm : top;

                // clear out bottom pos
                this[this.height - yo - 1][x] = ' ';
            }
        }

        // clear out row on seam
        this[fold.at] = Array(this.width).fill(' ');
    } else {
        console.error(`invalid fold command: ${fold}`.red);
    }
};

// dot counting function
paper.dots = function () {
    return this.flatMap(row => row.map(c => c == '#' ? 1 : 0)).reduce((a, b) => a + b);
};

// get on folding
//paper.print();
let foldNo = 1;
for (const fold of foldInstructions) {
    // do fold
    paper.fold(fold);

    // print number of dots
    console.log(`after fold ${foldNo++}, there are currently ${paper.dots().toString().green} dots on the paper: `);

    // print current paper
    //paper.print();
}
