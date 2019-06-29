export interface Table {
    header?: string[],
    columns?: string[],
    rows: string[][],
    footer?: string[]
};

const tlCorner = "┌";
const trCorner = "┐";
const brCorner = "┘";
const blCorner = "└";

const topT = "┬";
const leftT = "├";
const rightT = "┤";
const bottomT = "┴";

const cross = "┼";

const vLine = "│";
const hLine = "─";

const newLine = "\n";

export default class TableBuilder {
    static build(table: Table): string {
        if (!table) return undefined;

        var result = "";

        var bodyRes = this.buildBody(table.rows, table.header !== undefined, table.footer !== undefined, table.columns);

        if (table.header) {
            result += this.buildHeader(table.header, bodyRes[1]);
        }

        result += bodyRes[0];

        if (table.footer) {
            result += this.buildFooter(table.footer, bodyRes[1]);
        }

        return result;
    }

    private static buildHeader(header: string[], width: number): string {
        var result = tlCorner;

        for (var i = 0; i < width - 2; i++) {
            result += hLine;
        }

        result += trCorner + newLine;

        header.forEach((line) => {
            result += `${vLine} ${line}`;
            result = result.pad(width - line.length - 3, " ") + vLine + newLine;
        });

        result += `${vLine} `;
        result = result.pad(width - 3, " ") + vLine + newLine;

        return result;
    }

    private static buildFooter(footer: string[], width: number): string {
        var result = newLine;

        footer.forEach((line) => {
            result += `${vLine} ${line}`;
            result = result.pad(width - line.length - 3, " ") + vLine + newLine;
        });

        result += blCorner;

        for (var i = 0; i < width - 2; i++) {
            result += hLine;
        }

        result += brCorner;

        return result;
    }

    private static buildBody(rows: string[][], hasHeader: boolean, hasFooter: boolean, columns?: string[]): [string, number] {
        var result = "", width = 0;

        var colWidths: number[] = [];

        if (columns) {
            columns.forEach((val) => {
                colWidths.push(val.length);
            });
        }

        rows.forEach((row) => {
            row.forEach((cell, idx) => {
                if (colWidths[idx] === undefined) colWidths.push(cell.length);
                else if (cell.length > colWidths[idx]) {
                    colWidths[idx] = cell.length;
                }
            });
        });

        result += (hasHeader) ? leftT : tlCorner;

        colWidths.forEach((val, idx) => {
            for (var i = 0; i < val + 2; i++) {
                result += hLine;
            }

            if (idx !== (colWidths.length - 1)) result += topT;
        });

        result += ((hasHeader) ? rightT : trCorner) + newLine;
        width = result.trim().length;

        if (columns && columns.length > 0) {
            result += vLine;

            columns.forEach((col, idx) => {
                result += ` ${col}`;
                result = result.pad(colWidths[idx] - col.length + 1, " ") + vLine;
            });

            result += newLine + leftT;

            colWidths.forEach((val, idx) => {
                for (var i = 0; i < val + 2; i++) {
                    result += hLine;
                }

                if (idx !== (colWidths.length - 1)) result += cross;
            });

            result += rightT + newLine;
        }

        rows.forEach((row) => {
            result += vLine;

            row.forEach((cell, idx) => {
                result += ` ${cell}`;
                result = result.pad(colWidths[idx] - cell.length + 1, " ") + vLine;
            });

            result += newLine;
        });

        result += (hasFooter) ? leftT : blCorner;

        colWidths.forEach((val, idx) => {
            for (var i = 0; i < val + 2; i++) {
                result += hLine;
            }

            if (idx !== (colWidths.length - 1)) result += bottomT;
        });

        result += (hasFooter) ? rightT : brCorner;

        return [result, width];
    }
}