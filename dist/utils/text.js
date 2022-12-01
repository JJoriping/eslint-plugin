"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toOrdinal = exports.INDENTATION_UNIT = void 0;
var pluralRules = new Intl.PluralRules("en", { type: "ordinal" });
var suffixes = {
    one: "st",
    two: "nd",
    few: "rd",
    other: "th"
};
exports.INDENTATION_UNIT = "  ";
function toOrdinal(value) {
    return "".concat(value).concat(suffixes[pluralRules.select(value)]);
}
exports.toOrdinal = toOrdinal;
