"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndentation = getIndentation;
exports.hasEmptyLineBefore = hasEmptyLineBefore;
var patterns_1 = require("./patterns");
function getIndentation(sourceCode, line) {
    return sourceCode.lines[line - 1].match(patterns_1.indentationPattern)[0];
}
function hasEmptyLineBefore(sourceCode, node) {
    var prevToken = sourceCode.getTokenBefore(node);
    var token = sourceCode.getFirstToken(node);
    if (!prevToken || !token) {
        return true;
    }
    for (var i = prevToken.loc.end.line + 1; i < token.loc.start.line; i++) {
        if (patterns_1.emptyLinePattern.test(sourceCode.lines[i - 1])) {
            return true;
        }
    }
    return false;
}
