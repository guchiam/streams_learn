'use strict';
const fs = require('fs'),
    memoryUsage = require('./modules/memory-usage'),
    streamify = require('stream-generators'),
    csvStr = require('csv-string'),
    booksStream = fs.createWriteStream('books_p4.csv'),
    authorsStream = fs.createWriteStream('authors_p4.csv');

const hrstart = process.hrtime(),
    X1 = 1000000,
    X2 = 1000000;


function getGeneratorCSV(len, headers) {
    return (function *() {
        let j = 0;
        while (j <len) {
            let csvVal = [];
            if (j==0) {
                csvVal = csvStr.stringify(headers);
            } else {
                csvVal = csvStr.stringify(headers.map(function(v) {return v + '_' + j;}));
            }
            j++;
            yield csvVal;
        }
    });
}


let bookPromise = new Promise((resolve, reject)=>{
    streamify(getGeneratorCSV(X1, ['id', 'title'])).pipe(booksStream);
    booksStream.on('end', resolve);
    booksStream.on('error', reject);
    booksStream.on('finish', () => {
        let hrend = process.hrtime(hrstart);
        console.log("Execution time book recording  (hr): ", hrend[0]+'s', hrend[1]/1000000+'ms');
    });
});


let authorsPromise = new Promise((resolve, reject)=>{
    streamify(getGeneratorCSV(X2, ['id', 'firstName', 'lastName'])).pipe(authorsStream);
    authorsStream.on('end', resolve);
    authorsStream.on('error', reject);
    authorsStream.on('finish', () => {
        let hrend = process.hrtime(hrstart);
        console.log("Execution time authors recording (hr): ", hrend[0]+'s', hrend[1]/1000000+'ms');
    });
});


Promise.all([
    bookPromise,
    authorsPromise
]).then((callback) => {
    if (Array.isArray(callback)) {
        callback.forEach(function(one) {
            if (typeof one === 'function' || typeof one === 'object') {
                one();
            }
        });
    }
}, (error) => {
    console.log("Error occurred: ", error);
    writeBooks.end();
    writeAuthors.end();
});
