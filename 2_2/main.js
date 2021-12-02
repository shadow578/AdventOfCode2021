// Day 2, Puzzle 2

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
let sub = { aim: 0, horizontal: 0, depth: 0 };
commandList.forEach(cmd => {
    if (cmd.dir == "forward") {
        sub.horizontal += cmd.val;
        sub.depth += cmd.val * sub.aim;
    } else if (cmd.dir == "up") {
        sub.aim -= cmd.val;
    } else if (cmd.dir == "down") {
        sub.aim += cmd.val;
    } else {
        console.log(`unknown direction: ${cmd.dir}`);
    }
});


// output results
console.log(`final sub position: ${sub.horizontal} , ${sub.depth}`);
console.log(`puzzle solution: ${(sub.horizontal * sub.depth)}`);
