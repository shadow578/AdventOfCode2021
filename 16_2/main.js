// Day 16, Puzzle 2

/**
 * JS wierdness... Otherwise actually not too hard
 */

"use strict";
const fs = require("fs");
require("colors");

/**
 * map a hex char to binary array
 * 
 * @param {String} hex single character string to convert from hex to bin 
 * @returns 4 bit binary array
 */
function hexCharToBits(hex) {
    const map = {
        '0': [0, 0, 0, 0],
        '1': [0, 0, 0, 1],
        '2': [0, 0, 1, 0],
        '3': [0, 0, 1, 1],
        '4': [0, 1, 0, 0],
        '5': [0, 1, 0, 1],
        '6': [0, 1, 1, 0],
        '7': [0, 1, 1, 1],
        '8': [1, 0, 0, 0],
        '9': [1, 0, 0, 1],
        'A': [1, 0, 1, 0],
        'B': [1, 0, 1, 1],
        'C': [1, 1, 0, 0],
        'D': [1, 1, 0, 1],
        'E': [1, 1, 1, 0],
        'F': [1, 1, 1, 1]
    };
    return map[hex.toUpperCase()];
}

/**
 * convert a bit array into a number.
 * Note: despite not actually having a 32 bit integer type, javascript does bit- shifting by 
 * converting whatever number you're shifting to a 32 bit integer, then doing the shifting (signed) and finally
 * converting back to the js number type...
 * this caused the original algorithm from puzzle 1 to overflow on 32 bit inputs
 * 
 * @param {Number[]} bits the bits to parse into a number
 * @param {Number} startOffset the start offset in bits to start parsing from
 * @returns the number
 */
function bitsToNumber(bits) {
    let n = 0;
    for (let i = 0; i < bits.length; i++) {
        if (bits[i]) {
            n += Math.pow(2, bits.length - 1 - i);
        }
    }

    return n;
}

/**
 * binary data received, each bit is a entry 0 or 1
 * 
 * @type {Number[]}
 */
let inputBits = [];
inputBits.taken = 0;

/**
 * take the next n elements from the array.
 * 
 * @param {Number} n the number of elements to take 
 * @returns the taken elements
 */
inputBits.take = function (n) {
    // this.taken is start index, this.taken + n is end index 
    let startIndex = this.taken;
    let endIndex = this.taken + n;

    // ensure start and end index are in bounds
    if (startIndex > this.length || endIndex > this.length) {
        throw `cannot take ${n} elements: out of bounds! already taken ${this.taken} elements, attempted to take ${n} more! lenght is ${this.length}`;
    }

    // add n to taken
    this.taken += n;

    // take the elements
    let e = this.slice(startIndex, endIndex);

    // make the returned array also have the take functions
    e.taken = 0;
    e.take = this.take;
    e.takeNumber = this.takeNumber;
    e.available = this.available;
    return e;
};

/**
 * take the next n bits from the array and convert them to a number
 * 
 * @param {Number} n the number of bits to take 
 * @returns the number
 */
inputBits.takeNumber = function (n) {
    return bitsToNumber(this.take(n));
};

/**
 * @returns the number of bits that can still be taken
 */
inputBits.available = function () {
    return this.length - this.taken;
};

// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but the input is pretty small
fs.readFileSync("./exclude/input.txt", "utf-8")
    .split(/\r?\n/)
    .at(0)
    .split("")
    .forEach(c => {
        let dat = hexCharToBits(c);
        if (!dat) {
            console.error(`illegal char ${c} in input!`.red);
            return;
        }

        inputBits.push(...dat);
    });
console.log(`read ${inputBits.length} bits!`);

/**
 * parse bits into packets 
 * 
 * @param {Number[]} bits the bits to parse 
 * @returns packet information
 */
function parsePacket(bits) {
    // abort if less than 6 bits available
    // no way this could be a valid packet...
    if (bits.available() < 6) {
        bits.take(bits.available());
        return;
    }

    // read version and type, 3 bits each
    let version = bits.takeNumber(3);
    let type = bits.takeNumber(3);

    // parse depending on type
    if (type == 4) {
        // literal value, read groups until the last one (first bit is 0)
        let bitsOfNumber = [];
        let group;
        do {
            // take 5 bits
            group = bits.take(5);

            // add all but the first bit to the final number
            bitsOfNumber.push(...group.slice(1));
        } while (group[0] != 0);

        // convert into the final number
        let number = bitsToNumber(bitsOfNumber);

        return {
            version: version,
            type: type,
            value: number
        };
    } else {
        // operator, check lenght type
        let subPackets = [];
        let lenType = bits.takeNumber(1);
        if (lenType) {
            // operator with length type 1
            // length is 11 bits that represent the number of sub- packets
            let subPacketCount = bits.takeNumber(11);

            // parse that many sub- packets
            for (let i = 0; i < subPacketCount; i++) {
                subPackets.push(parsePacket(bits));
            }
        } else {
            // operator with length type 0
            // length is 15 bits that represent the total number of bits of the sub- packets
            let subPacketLength = bits.takeNumber(15);

            // take that many bits, then read packets until we run out of bits
            let subBits = bits.take(subPacketLength);
            while (subBits.available()) {
                subPackets.push(parsePacket(subBits));
            }
        }

        return {
            version: version,
            type: type,
            value: subPackets
        };
    }
}

// map of all types to functions fulfilling that operation
const opFunctions = {
    // sum
    0: (value) => {
        if (value.length == 1) {
            return evalPkg(value[0]);
        }

        return value.map(p => evalPkg(p))
            .reduce((a, b) => a + b);
    },
    // product
    1: (value) => {
        if (value.length == 1) {
            return evalPkg(value[0]);
        }

        return value.map(p => evalPkg(p))
            .reduce((a, b) => a * b);
    },
    // minimum
    2: (value) => {
        return value.map(p => evalPkg(p))
            .reduce((a, b) => a < b ? a : b);
    },
    // maximum
    3: (value) => {
        return value.map(p => evalPkg(p))
            .reduce((a, b) => a < b ? b : a);
    },
    // literal
    4: (value) => {
        return value;
    },
    // greater than
    5: (value) => {
        if (value.length != 2) {
            throw `gt: expected 2 operands, found ${value.length}`;
        }

        let a = evalPkg(value[0]);
        let b = evalPkg(value[1]);
        return a > b ? 1 : 0;
    },
    // less than
    6: (value) => {
        if (value.length != 2) {
            throw `lt: expected 2 operands, found ${value.length}`;
        }

        let a = evalPkg(value[0]);
        let b = evalPkg(value[1]);
        return a < b ? 1 : 0;
    },
    // equal to
    7: (value) => {
        if (value.length != 2) {
            throw `eq: expected 2 operands, found ${value.length}`;
        }

        let a = evalPkg(value[0]);
        let b = evalPkg(value[1]);
        return a == b ? 1 : 0;
    }
};
function evalPkg(pkg) {
    return opFunctions[pkg.type](pkg.value);
}

function pkgToString(pkg) {
    const typeToStr = {
        // sum
        0: (value) => {
            if (value.length == 1) {
                return `( ${pkgToString(value[0])} )`;
            }

            return `( ${value.map(p => pkgToString(p)).join(" + ")} )`;
        },
        // product
        1: (value) => {
            if (value.length == 1) {
                return `( ${pkgToString(value[0])} )`;
            }

            return `( ${value.map(p => pkgToString(p)).join(" * ")} )`;
        },
        // minimum
        2: (value) => {
            return `min( ${value.map(p => pkgToString(p)).join(", ")} )`;
        },
        // maximum
        3: (value) => {
            return `max( ${value.map(p => pkgToString(p)).join(", ")} )`;
        },
        // literal
        4: (value) => {
            return `( ${value} )`;
        },
        // greater than
        5: (value) => {
            return `gt( ${value.map(p => pkgToString(p)).join(", ")} )`;
        },
        // less than
        6: (value) => {
            return `lt( ${value.map(p => pkgToString(p)).join(", ")} )`;
        },
        // equal to
        7: (value) => {
            return `eq( ${value.map(p => pkgToString(p)).join(", ")} )`;
        }
    };

    return typeToStr[pkg.type](pkg.value);
}

// read a single packet
let pkg = parsePacket(inputBits);
if (pkg) {
    // print package
    console.log(pkgToString(pkg));

    // calculate result
    let result = evalPkg(pkg);
    console.log(`final package value is: ${result.toString().green}`);
}
