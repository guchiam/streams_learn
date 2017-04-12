'use strict';
const fs = require('fs'),
    memoryUsage = require('./modules/memory-usage'),
    csvWriter = require('csv-write-stream'),
    writeBooks = csvWriter({ headers: ["id", "title"]}),
    writeAuthors = csvWriter({ headers: ["id", "firstName", "lastName"]});

const hrstart = process.hrtime(),
    X1 = 1000000,
    X2 = 2000000;

writeBooks.pipe(fs.createWriteStream('books.csv'));
writeAuthors.pipe(fs.createWriteStream('authors.csv'));

function generateCSV(bLength, j, stream, headers) {
    return (function generateAllRows() {
            j++;
            if (j < bLength) {
                if (stream.write(headers.map(function(v) {return v + '_' + j;}))) {
                    generateAllRows();
                } else {
                    stream.once('drain', ()=>{generateAllRows()});
                }
            } else if (j == bLength) {
                stream.write(headers.map(function(v) {return v + '_' + j;}));
                stream.end();
            }
    })();
}

let bookPromise = new Promise((resolve, reject)=>{
    generateCSV(X1, 0, writeBooks, ['id', 'title']);
    writeBooks.on('end', resolve);
    writeBooks.on('error', reject);
    writeBooks.on('finish', () => {
        let hrend = process.hrtime(hrstart);
        console.log("Execution time book recording  (hr): ", hrend[0]+'s', hrend[1]/1000000+'ms');
    });
});

let authorsPromise = new Promise((resolve, reject)=>{
    generateCSV(X2, 0, writeAuthors, ['id', 'firstName', 'lastName']);
    writeAuthors.on('end', resolve);
    writeAuthors.on('error', reject);
    writeAuthors.on('finish', () => {
        let hrend = process.hrtime(hrstart);
        console.log("Execution time authors recording (hr): ", hrend[0]+'s', hrend[1]/1000000+'ms');
    });
});

    Promise.all([
        bookPromise,
        authorsPromise
    ]).then(function(callback) {
        if (Array.isArray(callback)) {
            callback.forEach(function(one) {
                if (typeof one === 'function' || typeof one === 'object') {
                    one();
                }
            });
        }
    }, function(error) {
        console.log("Error occurred: ", error);
        writeBooks.end();
        writeAuthors.end();
    });

