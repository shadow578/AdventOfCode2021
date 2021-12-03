// Day 3, Puzzle 2

/**
 * struggled a bit with this puzzle because i did not realize you'd have to get the most (/least)
 * common bit in each position with the filtered input. 
 * As such, this code may be *a little* weird.
 * But it works, and that is all that counts ;) 
 */
const fs = require("fs");

// contains the value of each line, each as a array of n booleans 
// where n == lineLen
let bins = [];

// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but the input is pretty small
let lineLen = undefined;
fs.readFileSync("./exclude/input.txt", "utf-8").split(/\r?\n/).forEach(line => {
    // ensure all lines are the same length
    if (!lineLen) {
        lineLen = line.length;
    }
    if (lineLen != line.length) {
        console.error(`line '${line}' has wrong length! expected ${lineLen} chars, got ${line.length}`);
        return;
    }

    // check each char of the line
    let bin = [];
    for (const char of line) {
        if (char == "0") {
            bin.push(false);
        } else if (char == "1") {
            bin.push(true);
        } else {
            console.error(`invalid char in line: ${char}`);
        }
    };

    // append
    bins.push(bin);
});

console.log(`${bins.length} bins; ${lineLen} bits/bin`);

// count how many 0s and 1s are in the given bit position for all bins in the input
function countBinBits(inputBins, bitPosition) {
    let cnt = [/*0:*/ 0, /*1:*/ 0];
    inputBins.forEach(bin => {
        if (bin[bitPosition]) {
            cnt[1]++;
        } else {
            cnt[0]++;
        }
    });

    return cnt;
}

// copy the bins array two times so we can filter them independently
let oxyBins = bins.slice();
let coBins = bins.slice();
console.log(`starting with ${bins.length} bins for oxy & co2`);

// filter the bins until only one value remains
for (let n = 0; n < lineLen; n++) {
    if (oxyBins.length > 1) {
        let oxyCnt = countBinBits(oxyBins, n);
        let oxyTarget = oxyCnt[0] > oxyCnt[1] ? 0 : 1;
        if (oxyCnt[0] == oxyCnt[1]) {
            // 0 and 1 are equally common
            oxyTarget = 1;
        }

        oxyBins = oxyBins.filter(bin => bin[n] == oxyTarget);
    }

    if (coBins.length > 1) {

        let coCnt = countBinBits(coBins, n);
        let coTarget = coCnt[0] > coCnt[1] ? 1 : 0;
        if (coCnt[0] == coCnt[1]) {
            // 0 and 1 are equally common
            coTarget = 0;
        }

        coBins = coBins.filter(bin => bin[n] == coTarget);
    }
}

// ensure both oxyBins and coBins only have one value left in them
if (oxyBins.length != 1 || coBins.length != 1) {
    console.error(`len of resulting bins is != 1! oxy: ${oxyBins.length}; co2: ${coBins.length}`);
    return;
}

// function to convert a bin to a decimal number
function bin2Dec(bin) {
    let val = 0, i = 0;
    for (let n = (bin.length - 1); n >= 0; n--) {
        if (bin[n]) {
            // bit is 1
            val += Math.pow(2, i);
        }

        i++;
    }

    return val;
}

// output
let oxy = bin2Dec(oxyBins[0]);
let co2 = bin2Dec(coBins[0]);
console.log(`oxygen = ${oxy}; co2 = ${co2}`);
console.log(`puzzle answer: ${oxy * co2}`);
