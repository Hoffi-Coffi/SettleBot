import moment from 'moment';
import pluralize from 'pluralize';

export default class Formatter {
    static formatRSN(_rsn: string): string {
        if (!_rsn) return _rsn;

        var split = _rsn.toLowerCase().split("_");
        var result = [];
        split.forEach((val) => {
            result.push(val[0].toUpperCase() + val.substring(1));
        });

        return result.join(" ");
    }

    static humanizeDuration(duration: moment.Duration) {
        const durationComponents = [
            { value: duration.years(), unit: 'year' },
            { value: duration.months(), unit: 'month' },
            { value: duration.days(), unit: 'day' },
            { value: duration.hours(), unit: 'hour' },
            { value: duration.minutes(), unit: 'minute' }
          ]
          return durationComponents
            .filter(({ value }) => value !== 0)
            .slice(0, 3)
            .map(({ unit, value }) => `${value} ${pluralize(unit, value)}`)
            .join(', ');
    }

    static convertTime(time: string, ampm: string, appendZulu: boolean = true): string {
        if (!time) return time;
        
        var timeParts = time.split(":");

        var hour = parseInt(timeParts[0]);
        if (ampm === "PM") {
            hour += 12;

            if (hour === 24) hour -= 12;

            timeParts[0] = hour.toString();
        } else if (hour === 12) {
            hour = 0;
            timeParts[0] = hour.toString();
        }

        if (timeParts[0].length < 2) timeParts[0] = `0${timeParts[0]}`;
        if (timeParts[1].length < 2) timeParts[1] = `0${timeParts[1]}`;

        if (appendZulu) return `${timeParts.join(":")}Z`;
        return timeParts.join(":");
    }

    static mapMonth(month: string | number): string {
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

    static momentifyDate(date: string): string {
        if (!date) return date;

        var parts = date.split(' ');

        if (parts.length < 5) return null;

        var month = this.mapMonth(parts[0]);
        var day = parts[1].replace(',', '');
        if (day.length < 2) {
            day = `0${day}`;
        }
        var year = parts[2].replace(',', '');

        var time = parts[3];
        var ampm = parts[4];

        var correctedTime = this.convertTime(time, ampm);

        return `${year}-${month}-${day}T${correctedTime}`;
    }
};