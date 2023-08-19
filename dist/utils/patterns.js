"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.domTypePatterns = exports.valueishNamePattern = exports.keyListLikeNamePattern = exports.keyishNamePattern = exports.upperSnakeCasePattern = exports.pascalCasePattern = exports.camelCasePattern = exports.closingLinePattern = exports.indentationPattern = exports.emptyLinePattern = void 0;
exports.emptyLinePattern = /^\s*$/;
exports.indentationPattern = /^\s*/;
exports.closingLinePattern = /^(\s*)(\)|}|]|<?\/\w*?>)/;
exports.camelCasePattern = /^[$_]?[\da-z]+?(?:[A-Z][\da-z]*?)*$/;
exports.pascalCasePattern = /^(?:[A-Z][\da-z]*?)+$/;
exports.upperSnakeCasePattern = /^[\dA-Z_]+$/;
exports.keyishNamePattern = /^(id|key|index|separator|delimiter)$|(Id|Key|Index|Separator|Delimiter)$/;
exports.keyListLikeNamePattern = /^(idList|keyList|keys|indices)$|(IdList|KeyList|Keys|Indices)$/;
exports.valueishNamePattern = /^(value|name)$|(Value|Name)$/;
exports.domTypePatterns = [
    /\b(?:HTML\w*|SVG\w*|React)?Element\b/,
    /\b(?:Mutable)?RefObject\b/
];
