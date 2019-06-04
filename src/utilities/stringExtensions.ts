declare interface String {
    pad(padLength: number, sep: string): string;
};

String.prototype.pad = function(this: string, padLength: number, sep: string) {
    var res = this;
    for (var x = 0; x < padLength; x++) res += sep;

    return res;
}