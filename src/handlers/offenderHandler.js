var offenders = exports;

var offenses = [];

offenders.add = function(name = "") {
    var offender = offenses.find(off => off.name === name);

    if (offender) {
        offenses.splice(offenses.indexOf(offender), 1);
        offender.count = offender.count + 1;

        offenses.push(offender);
    } else {
        offenses.push({
            name: name,
            count: 1
        });
    }
}

offenders.check = function(name = "") {
    var offender = offenses.find(off => off.name === name);

    if (!offender) return null;

    if (offender.count === 3) return "warn";
    if (offender.count === 4) return "mute";

    return null;
}

offenders.count = function(name = "") {
    var offender = offenses.find(off => off.name === name);

    return (offender) ? offender.count : 0;
}