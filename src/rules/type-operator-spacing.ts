import type { TSUnionType, TSIntersectionType } from "@typescript-eslint/types/dist/generated/ast-spec";
import { ESLintUtils } from "@typescript-eslint/utils";

import { getIndentation } from "../utils/code";

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "whitespace",
    messages: {
      'default': "Type operator `{{operator}}` should not be spaced in single-line style.",
      'in-arrow-function': "Spacing required around `=>`.",
      'in-multiline': "Type operator `{{operator}}` should be spaced in multiline style.",
      'in-multiline-ending': "Line cannot be ended with `{{operator}}`.",
      'in-multiline-indent': "Line starting with a type operator should be indented."
    },
    schema: []
  },
  defaultOptions: [],
  create(context){
    const sourceCode = context.getSourceCode();

    return {
      TSFunctionType: node => {
        if(!node.returnType){
          return;
        }
        const [ arrow, after ] = sourceCode.getFirstTokens(node.returnType, { count: 2 });
        const before = sourceCode.getTokenBefore(arrow);
        const hasSpaceBefore = before && sourceCode.isSpaceBetween?.(before, arrow);
        const hasSpaceAfter = sourceCode.isSpaceBetween?.(arrow, after);

        if(hasSpaceBefore && hasSpaceAfter){
          return;
        }
        context.report({
          node: arrow,
          messageId: "in-arrow-function",
          *fix(fixer){
            if(!hasSpaceBefore) yield fixer.insertTextBefore(arrow, " ");
            if(!hasSpaceAfter) yield fixer.insertTextAfter(arrow, " ");
          }
        });
      },
      'TSUnionType, TSIntersectionType': (node:TSUnionType|TSIntersectionType) => {
        for(let i = 0; i < node.types.length - 1; i++){
          const a = node.types[i];
          const b = node.types[i + 1];
          const aLast = sourceCode.getLastToken(a);
          const bFirst = sourceCode.getFirstToken(b);
          const operator = aLast && sourceCode.getTokenAfter(aLast);
          if(!aLast || !bFirst || !operator) continue;
          if(aLast.loc.end.line === bFirst.loc.start.line){
            if(!sourceCode.isSpaceBetween?.(aLast, bFirst)){
              continue;
            }
            context.report({
              node: operator,
              messageId: "default",
              data: { operator: operator.value },
              *fix(fixer){
                yield fixer.replaceTextRange([ aLast.range[1], bFirst.range[0] ], operator.value);
              }
            });
          }else{
            const aLineIndentation = getIndentation(sourceCode, aLast.loc.end.line);
            const bLineIndentation = getIndentation(sourceCode, bFirst.loc.start.line);

            if(aLast.loc.end.line === operator.loc.start.line){
              context.report({
                node: operator,
                messageId: "in-multiline-ending",
                data: { operator: operator.value },
                *fix(fixer){
                  yield fixer.replaceTextRange([ operator.range[0], bFirst.range[0] ], `\n${operator.value} `);
                }
              });
            }
            if(i === 0 && aLineIndentation.length >= bLineIndentation.length){
              context.report({
                node: bFirst,
                messageId: "in-multiline-indent",
                *fix(fixer){
                  yield fixer.replaceTextRange([
                    sourceCode.lineStartIndices[bFirst.loc.start.line - 1],
                    operator.range[0]
                  ], aLineIndentation + "  ");
                }
              });
            }
            if(i > 0 && aLineIndentation.length !== bLineIndentation.length){
              context.report({
                node: bFirst,
                messageId: "in-multiline-indent",
                *fix(fixer){
                  yield fixer.replaceTextRange([
                    sourceCode.lineStartIndices[bFirst.loc.start.line - 1],
                    operator.range[0]
                  ], aLineIndentation);
                }
              });
            }
            if(sourceCode.isSpaceBetween?.(operator, bFirst)){
              continue;
            }
            context.report({
              node: operator,
              messageId: "in-multiline",
              data: { operator: operator.value },
              *fix(fixer){
                yield fixer.insertTextAfter(operator, " ");
              }
            });
          }
        }
      }
    };
  }
});