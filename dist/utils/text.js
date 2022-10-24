"use strict";
exports.__esModule = true;
exports.toOrdinal = void 0;
var pluralRules = new Intl.PluralRules('en', { type: "ordinal" });
var suffixes = {
    one: "st",
    two: "nd",
    few: "rd",
    other: "th"
};
function toOrdinal(value) {
    return "".concat(value).concat(suffixes[pluralRules.select(value)]);
}
exports.toOrdinal = toOrdinal;
