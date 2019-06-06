var fs = require('fs');

function deleteFolderRecursive(path) {
    if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
        fs.readdirSync(path).forEach(function(file){
            var curPath = path + "/" + file;

            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });

        console.log(`Deleting directory "${path}"...`);
        fs.rmdirSync(path);
    }
};

var cmdArgs = process.argv.slice(2);
var dirToClean = (cmdArgs[0] !== '--prod') ? "./local-run" : "./dist";

console.log(`Cleaning working tree... (${dirToClean})`);

deleteFolderRecursive(dirToClean);

console.log("Successfully cleaned working tree!");