var fs = require('fs');

var filesToCopy = ["badwords.json", "config.json", 
    "rsns.json", "stats.json", "events.json", "sotw.json", "leaderboards.json", "skills.json"];
var imagesToCopy = ["statsbg.png", "runescape_uf.ttf"];

var outDir = "./dist/bot/";
var cmdArgs = process.argv.slice(2);
if (cmdArgs[0] !== '--prod') {
    outDir = "./local-run/bot/";

    filesToCopy.forEach((val) => {
        fs.copyFile(`./src/${val}`, `./local-run/${val}`, (err) => {
            if (err) throw err;
            console.log(`Copied file "${val}" successfully`);
        });
    });

    imagesToCopy.forEach((val) => {
        fs.copyFile(`./src/img/${val}`, `./local-run/${val}`, (err) => {
            if (err) throw err;
            console.log(`Copied file "${val}" successfully`);
        });
    });
}

fs.copyFile('./src/auth.dev.json', `${outDir}auth.dev.json`, (err) => {
    if (err) throw err;
    console.log("Copied DEV token!");
});

fs.copyFile('./src/auth.prod.json', `${outDir}auth.prod.json`, (err) => {
    if (err) throw err;
    console.log("Copied PROD token!");
});