// Day 4, Puzzle 1

/**
 * i think this puzzle wasn't too hard, but i took my time with this one to make it as nice as i could.
 * I also used the opportunity to learn about how to use classes in JS (useful when working with react, i was told)
 * aswell as some useful array functions.
 * 
 * Also, notice the ~fancy~ colored console output in the BingoBoard#print() function?
 * A simple puzzle, and my node_modules are already 3x the size of my own code. Isn't that neat :D
 */
const fs = require("fs");
require("colors");

class BingoBoard {
    /**
     * ~~ internal use only, use BingoBoard.parse() ~~
     * 
     * @param {Number[][]} board the board, as a 2D- array of numbers. 1st dimension is the rows, 2nd dimension is the columns
     */
    constructor(board) {
        // initialize board to input data
        this.board = board;

        // create a second array with the same dimensions as board that contains the 'marked'- ness of each
        // board position on the board as a boolean (false = unmarked; true = marked)
        this.marked = [];
        this.board.forEach(boardLine => {
            this.marked.push(Array(boardLine.length).fill(false));
        });
    }

    /**
     * parse a bingo board from input data
     * 
     * @param {String[]} boardLines the lines of the board to parse
     * @returns  the board instance
     */
    static parse(boardLines) {
        // read each line of the current board, and parse it into the board data
        let boardData = [];
        for (let lineInBoard = 0; lineInBoard < 5; lineInBoard++) {
            // split the current board line into separate numbers, and populate the board data
            boardData[lineInBoard] = boardLines[lineInBoard]
                .split(/ /)
                .filter(s => s)
                .map(s => Number(s));
        }

        return new BingoBoard(boardData);
    }

    /**
     * print the board to console.log
     */
    print() {
        for (let row = 0; row < this.board.length; row++) {
            let rowStr = "";
            for (let col = 0; col < this.board[row].length; col++) {
                const n = this.board[row][col];
                const str = n < 10 ? ` ${n} ` : `${n} `;
                const isMarked = this.marked[row][col];

                // log to console, in grey if unmarked and white if marked
                if (isMarked) {
                    rowStr += str.white;
                } else {
                    rowStr += str.gray;
                }
            }

            console.log(rowStr);
        }

        // reset console colors
        console.log("".reset);
    }

    /**
     * mark a number n on the board, if it exists on the board
     * 
     * @param {Number} n the number to mark
     */
    maybeMarkNumber(n) {
        for (let row = 0; row < this.board.length; row++) {
            const col = this.board[row].indexOf(n);
            if (col != -1) {
                this.marked[row][col] = true;
            }
        }
    }

    /**
     * check if this board won
     * 
     * @returns did this board win?
     */
    didWin() {
        // check for fully marked rows
        for (const row of this.marked) {
            if (row.indexOf(false) == -1) {
                // no unmarked in this row, this is a winner board!
                return true;
            }
        }

        // check for fully marked columns
        for (let col = 0; col < 5; col++) {
            let anyNonMarked = false;
            this.marked.forEach(row => {
                if (!row[col]) {
                    // the board position at (row/col) is false, so the current column cannot be fully marked
                    anyNonMarked = true;
                }
            });

            if (!anyNonMarked) {
                // all entries in the current column are marked, this is a winner board!
                return true;
            }
        }

        // none of the criteria match, not a winner :(
        return false;
    }

    /**
     * sum the marked OR unmarked numbers on the board 
     * 
     * @param {Boolean} shouldBeMarked sum the marked (== true) or unmarked (== false) numbers on the board? 
     * @returns the sum of the marked OR unmarked numbers on the board
     */
    getSum(shouldBeMarked) {
        let sum = 0;
        for (let row = 0; row < this.board.length; row++) {
            for (let col = 0; col < this.board[row].length; col++) {
                if (this.marked[row][col] == shouldBeMarked) {
                    sum += this.board[row][col];
                }
            }
        }

        return sum;
    }
}


// region parse input
// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but the input is pretty small
const allLines = fs.readFileSync("./exclude/input.txt", "utf-8").split(/\r?\n/);

// parse the numbers to draw (== first line of the input) 
let numbersToDraw = [];
allLines[0].split(/,/).forEach(nr => {
    numbersToDraw.push(Number(nr.trim()));
});

// parse the bingo boards
// start at line 2, step by 5 lines for every board
let bingoBoards = [];
for (let startLine = 2; startLine < allLines.length; startLine += 6) {
    bingoBoards.push(BingoBoard.parse(allLines.slice(startLine, startLine + 5)));
}

// debug logging
console.log(`parsed ${numbersToDraw.length} numbers to draw, and ${bingoBoards.length} bingo boards`);
//bingoBoards.forEach(board => {
//    board.print();
//    console.log("");
//});
// endregion

// draw one number at a time, update boards and check for win
let winningBoards;
let lastNumberCalled;
for (const n of numbersToDraw) {
    // save n for later
    lastNumberCalled = n;

    // update all boards
    bingoBoards.forEach(board => board.maybeMarkNumber(n));

    // check if any board won
    winningBoards = bingoBoards.filter(board => board.didWin());
    if (winningBoards.length > 0) {
        // we have a winner, break out of loop
        break;
    }
};

// check number of winners (should only be one)
if (winningBoards.length != 1) {
    console.error(`invalid number of winning boards: got ${winningBoards.length}`);
    return;
}
const winner = winningBoards[0];


// calculate puzzle output
const sum = winner.getSum(false /* unmarked */);
console.log(`sum of unmarked = ${sum}; last number called = ${lastNumberCalled}`);
console.log(`puzzle answer: ${sum * lastNumberCalled}`);

// print winner board
console.log("\nWinning Board:");
winner.print();
