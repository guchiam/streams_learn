'use strict';
var fs = require('fs'),
    memoryUsage = require('./modules/memory-usage'),
    csvWriter = require('csv-write-stream'),
    writeBooks = csvWriter({ headers: ["id", "title"]}),
    writeAuthors = csvWriter({ headers: ["id", "firstName", "lastName"]});

var hrstart = process.hrtime();
var X1 = 1000000;
var X2 = 2000000;

writeBooks.pipe(fs.createWriteStream('books.csv'));
writeAuthors.pipe(fs.createWriteStream('authors.csv'));


var generateBookCSV = function(bLength, j, callback, stream) {

    bLength--;
    j++;

    if (bLength === 0) {
        stream.write(["id_"+j, "title_"+j]);
        stream.end();
        if (typeof callback === 'function') {
            callback();
        }
    } else {
        if (stream.write(["id_"+j, "title_"+j])) {
            generateBookCSV(bLength, j, callback, stream);
        } else {
            stream.once('drain', ()=>{generateBookCSV(bLength, j, callback, stream)});
        }
    }
};

var generateAuthorsCSV = function(bLength, j, callback, stream) {

    bLength--;
    j++;

    if (bLength === 0) {
        stream.write(["id_"+j, "firstName_"+j, "lastName_"+j]);
        stream.end();
        if (typeof callback === 'function') {
            callback();
        }
    } else {
        if (stream.write(["id_"+j, "firstName_"+j, "lastName_"+j])) {
            generateAuthorsCSV(bLength, j, callback, stream);
        } else {
            stream.once('drain', ()=>{generateAuthorsCSV(bLength, j, callback, stream)});
        }
    }
};

writeBooks.on('error', (err) => {throw err;});
writeBooks.on('finish', () => {
    console.log("Recording books completed successfully!!!");
});

writeAuthors.on('error', (err) => {throw err;});
writeAuthors.on('finish', () => {
    console.log("Recording authors completed successfully!!!");
});

var bookPromise = new Promise((resolve, reject)=>{
    try {
        generateBookCSV(X1, 0, ()=>{
            resolve(()=>{
                var hrend = process.hrtime(hrstart);
                console.log("Execution time book recording  (hr): ", hrend[0]+'s', hrend[1]/1000000+'ms');
            });
        }, writeBooks);
    } catch (error) {
        reject(error);
    }
});

var authorsPromise = new Promise((resolve, reject)=>{
    try {
        generateAuthorsCSV(X2, 0, ()=>{
            resolve(()=>{
                var hrend = process.hrtime(hrstart);
                console.log("Execution time authors recording (hr): ", hrend[0]+'s', hrend[1]/1000000+'ms');
            });
        }, writeAuthors);
    } catch (error) {
        reject(error);
    }
});


Promise.all([
        bookPromise,
        authorsPromise
    ])
    .then(function(callback) {
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

