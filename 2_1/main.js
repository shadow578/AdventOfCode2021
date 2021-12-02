// Day 2, Puzzle 1

const fs = require("fs");

// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but we're only using 2k lines
let commandList = [];
fs.readFileSync("./exclude/input.txt", "utf-8").split(/\r?\n/).forEach(line => {
    // split each line on space
    // and parse as command and value
    let splittedLine = line.trim().split(/ /);
    commandList.push({
        dir: splittedLine[0].toLowerCase(),
        val: Number(splittedLine[1])
    });
});

// process all commands and update position of the sub
let pos = { horizontal: 0, depth: 0 };
commandList.forEach(cmd => {
    if (cmd.dir == "forward") {
        pos.horizontal += cmd.val;
    } else if (cmd.dir == "up") {
        pos.depth -= cmd.val;
    } else if (cmd.dir == "down") {
        pos.depth += cmd.val;
    } else {
        console.log(`unknown direction: ${cmd.dir}`);
    }
});


// output results
console.log(`final sub position: ${pos.horizontal} , ${pos.depth}`);
console.log(`puzzle solution: ${(pos.horizontal * pos.depth)}`);
