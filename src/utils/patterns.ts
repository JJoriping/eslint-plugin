export const emptyLinePattern = /^\s*$/;
export const indentationPattern = /^\s*/;
export const closingLinePattern = /^(\s*)(\)|}|]|<?\/>)/;

export const camelCasePattern = /^[$_]?[\da-z]+?(?:[A-Z][\da-z]*?)*$/;
export const pascalCasePattern = /^(?:[A-Z][\da-z]*?)+$/;
export const upperSnakeCasePattern = /^[\dA-Z_]+$/;