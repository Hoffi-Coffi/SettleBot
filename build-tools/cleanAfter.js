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

console.log(`Cleaning build directory...`);

deleteFolderRecursive("./build");

console.log("Successfully cleaned build directory!");