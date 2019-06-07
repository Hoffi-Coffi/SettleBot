import "./../../src/utilities/stringExtensions";

test('string.pad returns correctly padded string', () => {
    var input = "test";
    var sep = "-";
    var count = 5;

    expect(input.pad(count, sep)).toBe("test-----");
});