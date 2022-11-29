export const emptyLinePattern = /^\s*$/;
export const indentationPattern = /^\s*/;
export const closingLinePattern = /^(\s*)(\)|}|]|<?\/>)/;

export const camelCasePattern = /^[$_]?[\da-z]+?(?:[A-Z][\da-z]*?)*$/;
export const pascalCasePattern = /^(?:[A-Z][\da-z]*?)+$/;
export const upperSnakeCasePattern = /^[\dA-Z_]+$/;

export const keyishNamePattern = /^(id|key|index|separator|delimiter)$|(Id|Key|Index|Separator|Delimiter)$/;
export const keyListLikeNamePattern = /^(idList|keyList|keys|indices)$|(IdList|KeyList|Keys|Indices)$/;
export const valueishNamePattern = /^(value|name)$|(Value|Name)$/;

export const domTypePatterns = [
  /\b(?:HTML\w*|SVG\w*|React)?Element\b/,
  /\b(?:Mutable)?RefObject\b/
];