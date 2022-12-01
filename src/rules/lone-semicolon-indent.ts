import { ESLintUtils } from "@typescript-eslint/utils";
import { getIndentation } from "../utils/code";
import { closingLinePattern } from "../utils/patterns";
import { INDENTATION_UNIT } from "../utils/text";

const loneSemicolonPattern = /^\s*;$/;

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "whitespace",
    messages: {
      'default': "Lone semicolon should be indented less than the previous line."
    },
    schema: []
  },
  defaultOptions: [],
  create(context){
    const sourceCode = context.getSourceCode();

    return {
      Program: () => {
        for(let i = 1; i < sourceCode.lines.length; i++){
          if(!loneSemicolonPattern.test(sourceCode.lines[i])){
            continue;
          }
          const prevIndentation = getIndentation(sourceCode, i);
          const indentation = getIndentation(sourceCode, i + 1);
          if(prevIndentation.length > indentation.length){
            continue;
          }
          const semicolon = sourceCode.getTokenByRangeStart(sourceCode.lineStartIndices[i] + indentation.length);
          if(!semicolon){
            throw Error("There must exist one semicolon");
          }
          const isPrevLineClosing = closingLinePattern.test(sourceCode.lines[i - 1]);
          const prevToken = sourceCode.getTokenBefore(semicolon);

          context.report({
            node: semicolon,
            messageId: 'default',
            *fix(fixer){
              if(isPrevLineClosing && prevToken){
                yield fixer.replaceTextRange([ prevToken.range[1], semicolon.range[0] ], "");
              }else{
                yield fixer.removeRange([ semicolon.range[0] - INDENTATION_UNIT.length, semicolon.range[0] ]);
              }
            }
          });
        }
      }
    };
  }
});