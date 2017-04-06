'use strict';

const fs = require('fs'),
      streamify = require('stream-generators'),
      booksStream = fs.createWriteStream('books_p4.csv'),
      authorsStream = fs.createWriteStream('authors_p4.csv'),
      csvStr = require('csv-string'),
      memoryUsage = require('./modules/memory-usage');

const hrstart = process.hrtime(),
    X1 = 10000,
    X2 = 10000;

function getGeneratorCSV(len, headers) {
    return (function *() {
        function* _generateCSV(j){

            if (Array.isArray(headers)) {
                if (j==0) {
                    yield csvStr.stringify(headers);
                } else {
                    yield csvStr.stringify(headers.map(function(v) {return v + '_' + j;}));
                }

                if (j < len) {
                    yield *_generateCSV(j + 1);
                }
            }
        }

        yield *_generateCSV(0);
    });
}

function errorOccurred(error)
{
    console.log("Error occurred: ", error);
    booksStream.end();
    authorsStream.end();
}

booksStream.on('error', (err) => {errorOccurred(err);});
booksStream.on('finish', () => {
    var hrend = process.hrtime(hrstart);
    console.log("Execution time book recording  (hr): ", hrend[0]+'s', hrend[1]/1000000+'ms');
});

authorsStream.on('error', (err) => {errorOccurred(err);});
authorsStream.on('finish', () => {
    var hrend = process.hrtime(hrstart);
    console.log("Execution time authors recording  (hr): ", hrend[0]+'s', hrend[1]/1000000+'ms');
});


streamify(getGeneratorCSV(X1, ['id', 'title'])).pipe(booksStream);
streamify(getGeneratorCSV(X2, ['id', 'firstName', 'lastName'])).pipe(authorsStream);