var logger = exports;

function timeNow() {
    var dateNow = new Date();
    return `${prettyHours(dateNow)}:${prettyMinutes(dateNow)}:${prettySeconds(dateNow)}`;
}

function prettyHours(date) {
    return `${((date.getHours() < 10) ? "0" : "") + date.getHours()}`;
}

function prettyMinutes(date) {
    return `${((date.getMinutes() < 10) ? "0" : "") + date.getMinutes()}`;
}

function prettySeconds(date) {
    return `${((date.getSeconds() < 10) ? "0" : "") + date.getSeconds()}`;
}

logger.info = function(message, callingModule) {
    if (callingModule) message += ` (${callingModule})`;
    console.info(`[${timeNow()}] <INFO> ${message}`);
};

logger.warn = function(message, callingModule) {
    if (callingModule) message += ` (${callingModule})`;
    console.warn(`[${timeNow()}] <WARN> ${message}`);
}

logger.error = function(message, callingModule) {
    if (callingModule) message += ` (${callingModule})`;
    console.error(`[${timeNow()}] <ERR> ${message}`);
}