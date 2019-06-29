import "./../../src/utilities/stringExtensions";

import TableBuilder, { Table } from "./../../src/utilities/tableBuilder";

var expectedTableBodyNoCols = "┌───────┬───────────┬───┐\n│ hello │ there     │ 1 │\n│ hello │ thererere │ 2 │\n└───────┴───────────┴───┘";
var expectedTableBodyWithCols = "┌───────┬───────────┬────────────┐\n│ Pos.  │ Numb.     │ Yeet yeet. │\n├───────┼───────────┼────────────┤\n│ hello │ there     │ 1          │\n│ hello │ thererere │ 2          │\n└───────┴───────────┴────────────┘";
var expectedTableWithHeader = "┌────────────────────────────────┐\n│ hello there                    │\n│ general kenobi                 │\n│                                │\n├───────┬───────────┬────────────┤\n│ Pos.  │ Numb.     │ Yeet yeet. │\n├───────┼───────────┼────────────┤\n│ hello │ there     │ 1          │\n│ hello │ thererere │ 2          │\n└───────┴───────────┴────────────┘";
var expectedTableWithFooter = "┌───────┬───────────┬────────────┐\n│ Pos.  │ Numb.     │ Yeet yeet. │\n├───────┼───────────┼────────────┤\n│ hello │ there     │ 1          │\n│ hello │ thererere │ 2          │\n├───────┴───────────┴────────────┤\n│ ...oh no...                    │\n└────────────────────────────────┘";
var expectedFullTable = "┌────────────────────────────────┐\n│ hello there                    │\n│ general kenobi                 │\n│                                │\n├───────┬───────────┬────────────┤\n│ Pos.  │ Numb.     │ Yeet yeet. │\n├───────┼───────────┼────────────┤\n│ hello │ there     │ 1          │\n│ hello │ thererere │ 2          │\n├───────┴───────────┴────────────┤\n│ ...oh no...                    │\n└────────────────────────────────┘";

describe("build table", () => {
    test("returns undefined when given an invalid table", () => {
        var result = TableBuilder.build(undefined);

        expect(result).toBeUndefined();
    });

    test("builds a table body with no columns correctly", () => {
        var table: Table = {
            rows: [
                ["hello", "there", "1"],
                ["hello", "thererere", "2"]
            ]
        };

        var result = TableBuilder.build(table);

        expect(result).toBe(expectedTableBodyNoCols);
    });

    test("builds a table body with columns correctly", () => {
        var table: Table = {
            columns: ["Pos.", "Numb.", "Yeet yeet."],
            rows: [
                ["hello", "there", "1"],
                ["hello", "thererere", "2"]
            ]
        };

        var result = TableBuilder.build(table);

        expect(result).toBe(expectedTableBodyWithCols);
    });

    test("builds a table with header correctly", () => {
        var table: Table = {
            header: ["hello there", "general kenobi"],
            columns: ["Pos.", "Numb.", "Yeet yeet."],
            rows: [
                ["hello", "there", "1"],
                ["hello", "thererere", "2"]
            ]
        };

        var result = TableBuilder.build(table);

        expect(result).toBe(expectedTableWithHeader);
    });

    test("builds a table with footer correctly", () => {
        var table: Table = {
            columns: ["Pos.", "Numb.", "Yeet yeet."],
            rows: [
                ["hello", "there", "1"],
                ["hello", "thererere", "2"]
            ],
            footer: ["...oh no..."]
        };

        var result = TableBuilder.build(table);

        expect(result).toBe(expectedTableWithFooter);
    });

    test("builds a full table correctly", () => {
        var table: Table = {
            header: ["hello there", "general kenobi"],
            columns: ["Pos.", "Numb.", "Yeet yeet."],
            rows: [
                ["hello", "there", "1"],
                ["hello", "thererere", "2"]
            ],
            footer: ["...oh no..."]
        };

        var result = TableBuilder.build(table);

        expect(result).toBe(expectedFullTable);
    });
});