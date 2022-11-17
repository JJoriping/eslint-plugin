export const emptyLinePattern = /^\s*$/;
export const indentationPattern = /^\s*/;
export const closingLinePattern = /^(\s*)(\)|\}|\]|\/>)/;

export const camelCasePattern = /^[_$]?[a-z0-9]+?(?:[A-Z][a-z0-9]*?)*$/;
export const pascalCasePattern = /^(?:[A-Z][a-z0-9]*?)+$/;
export const upperSnakeCasePattern = /^[A-Z0-9_]+$/;