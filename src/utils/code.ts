import { Node } from "@typescript-eslint/types/dist/generated/ast-spec";
import { SourceCode } from "@typescript-eslint/utils/dist/ts-eslint";
import { emptyLinePattern } from "./patterns";

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