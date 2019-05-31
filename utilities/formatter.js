var formatter = exports;

formatter.formatRSN = (_rsn = "") => {
    var split = _rsn.split("_");
    var result = [];
    split.forEach((val) => {
        result.push(val[0].toUpperCase() + val.substring(1));
    });

    return result.join(" ");
}

formatter.convertTime = (time = "", ampm, appendZulu = true) => {
    var timeParts = time.split(":");
    if (ampm === "PM") {
        var hour = parseInt(timeParts[0]);
        hour += 12;

        if (hour === 24) hour -= 12;

        timeParts[0] = hour.toString();
    }

    if (timeParts[0].length < 2) timeParts[0] = `0${timeParts[0]}`;
    if (timeParts[1].length < 2) timeParts[1] = `0${timeParts[1]}`;

    if (appendZulu) return `${timeParts.join(":")}Z`;
    return timeParts.join(":");
}

formatter.mapMonth = (month) => {
    switch (month) {
        case "January":
        case 1:
            return "01";
        case "February":
        case "Febuary":
        case 2:
            return "02";
        case "March":
        case 3:
            return "03";
        case "April":
        case 4:
            return "04";
        case "May":
        case 5:
            return "05";
        case "June":
        case 6:
            return "06";
        case "July":
        case 7:
            return "07";
        case "August":
        case 8:
            return "08";
        case "September":
        case 9:
            return "09";
        case "October":
        case 10:
            return "10";
        case "November":
        case 11:
            return "11";
        case "December":
        case 12:
            return "12";
    }
}

formatter.momentifyDate = (date) => {
    var parts = date.split(' ');

    var month = formatter.mapMonth(parts[0]);
    var day = parts[1].replace(',', '');
    if (day.length < 2) {
        day = `0${day}`;
    }
    var year = parts[2].replace(',', '');

    var time = parts[3];
    var ampm = parts[4];

    var correctedTime = formatter.convertTime(time, ampm);

    return `${year}-${month}-${day}T${correctedTime}`;
}