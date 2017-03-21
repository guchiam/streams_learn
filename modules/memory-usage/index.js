var memoryUsage;

var v1 = 300,
    v2 = 50,
    errorMsg = "Превышено потребление памяти: ";

    //TODO: move settings to config

function convertBytes(bytes)
{
    return(bytes / Math.pow(1024, 2)).toFixed(3);
}

var interval = setInterval(function(){
    memoryUsage = process.memoryUsage();
    var Mb = convertBytes(memoryUsage.heapUsed);
    if (Mb>v2) {
        console.log(errorMsg + Mb + " MB");
        process.exit(); // наверное нужно сделать end потоки?
    }
    console.log(Mb + " MB");
}, v1);

interval.unref();

module.exports = memoryUsage;