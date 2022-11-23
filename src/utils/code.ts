import type { Node } from "@typescript-eslint/types/dist/generated/ast-spec";
import type { SourceCode } from "@typescript-eslint/utils/dist/ts-eslint";
import { emptyLinePattern, indentationPattern } from "./patterns";

export function getIndentation(sourceCode:Readonly<SourceCode>, line:number):string{
  return sourceCode.lines[line - 1].match(indentationPattern)![0];
}
export function hasEmptyLineBefore(sourceCode:Readonly<SourceCode>, node:Node):boolean{
  const prevToken = sourceCode.getTokenBefore(node);
  const token = sourceCode.getFirstToken(node);
  if(!prevToken || !token){
    return true;
  }
  for(let i = prevToken.loc.end.line + 1; i < token.loc.start.line; i++){
    if(emptyLinePattern.test(sourceCode.lines[i - 1])){
      return true;
    }
  }
  return false;
}