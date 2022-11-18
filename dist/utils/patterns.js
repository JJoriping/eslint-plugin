"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upperSnakeCasePattern = exports.pascalCasePattern = exports.camelCasePattern = exports.closingLinePattern = exports.indentationPattern = exports.emptyLinePattern = void 0;
exports.emptyLinePattern = /^\s*$/;
exports.indentationPattern = /^\s*/;
exports.closingLinePattern = /^(\s*)(\)|}|]|<?\/>)/;
exports.camelCasePattern = /^[$_]?[\da-z]+?(?:[A-Z][\da-z]*?)*$/;
exports.pascalCasePattern = /^(?:[A-Z][\da-z]*?)+$/;
exports.upperSnakeCasePattern = /^[\dA-Z_]+$/;
