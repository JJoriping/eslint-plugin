"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upperSnakeCasePattern = exports.pascalCasePattern = exports.camelCasePattern = exports.closingLinePattern = exports.indentationPattern = exports.emptyLinePattern = void 0;
exports.emptyLinePattern = /^\s*$/;
exports.indentationPattern = /^\s*/;
exports.closingLinePattern = /^(\s*)(\)|\}|\]|\/>)/;
exports.camelCasePattern = /^[_$]?[a-z0-9]+?(?:[A-Z][a-z0-9]*?)*$/;
exports.pascalCasePattern = /^(?:[A-Z][a-z0-9]*?)+$/;
exports.upperSnakeCasePattern = /^[A-Z0-9_]+$/;
