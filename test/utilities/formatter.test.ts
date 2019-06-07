import Formatter from "./../../src/utilities/formatter";

describe("formatRSN", () => {
    test.each([
        [null, null], 
        ["", ""], 
        ["test", "Test"], 
        ["test_rsn", "Test Rsn"], 
        ["test_rsn_2", "Test Rsn 2"]
    ])("given '%s' formats correctly to '%s'", (input: string, expected: string) => {
            var result = Formatter.formatRSN(input);

            expect(result).toBe(expected);
        });
});

describe("convertTime", () => {
    test.each([
        ["12:1", "AM", true, "00:01Z"],
        ["12:1", "PM", true, "12:01Z"],
        ["9:45", "PM", true, "21:45Z"],
        ["6:0", "AM", false, "06:00"],
        ["02:00", "AM", false, "02:00"],
        [null, "AM", false, null],
        ["2:0", null, false, "02:00"]
    ])("given '%s' '%s' and appendZulu '%s' returns '%s' correctly", 
        (input: string, ampm: string, appendZulu: boolean, expected: string) => {
            var result = Formatter.convertTime(input, ampm, appendZulu);

            expect(result).toBe(expected);
        });
});

describe("momentifyDate", () => {
    test.each([
        ["January 1 2019 5:00 AM", "2019-01-01T05:00Z"],
        ["March 31 1994 10:30 PM", "1994-03-31T22:30Z"],
        [null, null],
        ["", ""],
        ["January 20 10:00 AM", null]
    ])("given input '%s' returns '%s' correctly", (input: string, expected: string) => {
        var result = Formatter.momentifyDate(input);

        expect(result).toBe(expected);
    });
});