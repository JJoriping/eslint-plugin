"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closingLinePattern = exports.indentationPattern = exports.emptyLinePattern = void 0;
exports.emptyLinePattern = /^\s*$/;
exports.indentationPattern = /^\s*/;
exports.closingLinePattern = /^(\s*)(\)|\}|\]|\/>)/;
