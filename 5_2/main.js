// Day 5, Puzzle 2

"use strict";
const fs = require("fs");
require("colors");

class Coord {
    /**
     * parse a coordinate from a string "x,y"
     * 
     * @param {String} str the input string to parse
     * @returns a new coordinate, parsed from the input; or null if the input is not valid 
     */
    static parse(str) {
        // split on ','
        const split = str.split(/,/);

        // ensure we have exactly 2 entries
        if (split.length != 2) {
            return null;
        }

        // x is first entry, y is second entry
        const px = Number(split[0].trim());
        const py = Number(split[1].trim());

        // ensure both x and y are valid
        if (px == null || py == null) {
            return null;
        }

        return new Coord(px, py);
    }

    /**
     * ~~ internal only, use Coord.parse ~~
     * 
     * @param {Number} x x portion of the coord 
     * @param {Number} y  y portion of the coord
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Line {
    /**
     * parse a line in format "sx,sy -> ex,ey", 
     * where sx,sy describes the start of the line, and ex,ey the end of the line
     * 
     * @param {String} str the input string
     * @returns the parsed line, or null if cannot be parsed 
     */
    static parse(str) {
        // split on '->'
        const split = str.split(/->/);

        // should have exactly two entries, sx,sy and ex,ey
        if (split.length != 2) {
            return null;
        }

        // parse start and end coords
        const start = Coord.parse(split[0].trim());
        const end = Coord.parse(split[1].trim());

        // ensure both start and end coord are valid
        if (!start || !end) {
            return null;
        }

        return new Line(start, end);
    }

    /**
     * ~~ internal only, use Line.parse ~~
     * 
     * @param {Coord} start start coordinate of the line
     * @param {Coord} end end coordinate of the line 
     */
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }


    /**
     * get a array of all coords this line covers
     * 
     * @returns the coordinates this line covers
     */
    getCoveredCoords() {
        // get start and end coord
        let sx = Math.min(this.start.x, this.end.x);
        let sy = Math.min(this.start.y, this.end.y);
        let ex = Math.max(this.start.x, this.end.x);
        let ey = Math.max(this.start.y, this.end.y);
        let covered = [];

        // vertical
        if (sx == ex) {
            for (let y = sy; y <= ey; y++) {
                covered.push(new Coord(sx, y));
            }
        }

        // horizontal 
        else if (sy == ey) {
            for (let x = sx; x <= ex; x++) {
                covered.push(new Coord(x, sy));
            }
        }

        // assume diagonal at 45 degrees
        else {
            // reassign sx,sy,ex,ex, so that x always goes left to right
            // and y is assigned accordingly
            if (this.start.x < this.end.x) {
                sx = this.start.x;
                sy = this.start.y;
                ex = this.end.x;
                ey = this.end.y;
            } else {
                ex = this.start.x;
                ey = this.start.y;
                sx = this.end.x;
                sy = this.end.y;
            }

            // x always goes left to right (+1).
            // check in what direction y goes
            if (sy > ey) {
                // line goes /
                let x = sx;
                let y = sy;
                while (x <= ex && y >= ey) {
                    covered.push(new Coord(x, y));
                    x++;
                    y--;
                }

            } else {
                // line goes \
                let x = sx;
                let y = sy;
                while (x <= ex && y <= ey) {
                    covered.push(new Coord(x, y));
                    x++;
                    y++;
                }
            }
        }

        return covered;
    }
}

class Map {
    /**
     * create a empty map
     * 
     * @param {Number} minX the smallest x coordinate
     * @param {Number} minY the smallest y coordinate
     * @param {Number} maxX the biggest x coordinate
     * @param {Number} maxY the biggest y coordinate 
     */
    constructor(minX, minY, maxX, maxY) {
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;

        this.width = (maxX - minX) + 1;
        this.height = (maxY - minY) + 1;

        this.map = [];
        for (let w = 0; w < this.width; w++) {
            this.map.push(Array(this.height).fill(0));
        }
    }

    /**
     * reset the map to all zeros
     */
    clear() {
        for (let w = 0; w < this.width; w++) {
            this.map[w].fill(0);
        }
    }

    /**
     * print the map to the console
     */
    print() {
        for (let y = 0; y < this.height; y++) {
            let ln = "";
            for (let x = 0; x < this.width; x++) {
                let v = this.get(x, y);
                let s = `${v <= 0 ? "." : v}`;

                if (v >= 2) {
                    ln += s.red;
                } else {
                    ln += s.white;
                }

            }

            console.log(ln.reset);
        }
    }

    /**
     * get the value at x/y
     * 
     * @param {Number} x x coordinate 
     * @param {Number} y y coordinate 
     * @returns the value at the coordinate x/y
     */
    get(x, y) {
        return this.map[x - this.minX][y - this.minY];
    }

    /**
    * set the value at x/y
    * 
    * @param {Number} x x coordinate 
    * @param {Number} y y coordinate 
    * @param {Number} val the value to set
    */
    set(x, y, val) {
        this.map[x - this.minX][y - this.minY] = val;
    }

    /**
    * add to the value at x/y
    * 
    * @param {Number} x x coordinate 
    * @param {Number} y y coordinate 
    * @param {Number} val the value to set
    */
    add(x, y, val) {
        let v = this.get(x, y) + val;
        this.set(x, y, v);
    }
}


// read whole file, split on \n, and process all lines sequentially
// bad for huge files, but the input is pretty small
const linesInFile = fs.readFileSync("./exclude/input.txt", "utf-8").split(/\r?\n/);

// parse all lines in the input
let allVentLines = [];
linesInFile.forEach(ln => {
    const ventLine = Line.parse(ln);
    if (!ventLine) {
        console.error(`could not parse '${ln}'`);
        return;
    }

    allVentLines.push(ventLine);
});

// debug output parse result
console.log(`parsed ${allVentLines.length} vent lines`);

// find the smallest and biggest x and y coordinates
let minX = 0, minY = 0, maxX = 0, maxY = 0;
allVentLines.forEach(line => {
    minX = Math.min(minX, line.start.x, line.end.x);
    minY = Math.min(minY, line.start.y, line.end.y);
    maxX = Math.max(maxX, line.start.x, line.end.x);
    maxY = Math.max(maxY, line.start.y, line.end.y);
});

// create the "map"
let map = new Map(minX, minY, maxX, maxY);
console.log(`map is ${map.width} by ${map.height}`);

// add values for all vent lines on the map
allVentLines.forEach(line => {
    line.getCoveredCoords().forEach(c => {
        map.add(c.x, c.y, 1);
    });
});

// print output map
//map.print();

// calculate and print puzzle answer
let dangerPoints = map.map.flat().filter(n => n >= 2).length;
console.log(`\nthere are ${dangerPoints.toString().red} points where at least two vent lines overlap!`);
