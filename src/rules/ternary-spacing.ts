import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";

import { getIndentation } from "../utils/code";

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "whitespace",
    messages: {
      'default': "Ternary operator should be the first token of its line.",
      'indent': "Ternary operator should be indented.",
      'no-indent': "Else-if-like ternary operator should not be indented."
    },
    schema: []
  },
  defaultOptions: [],
  create(context){
    const sourceCode = context.getSourceCode();

    return {
      ConditionalExpression: node => {
        if(node.loc.start.line === node.loc.end.line){
          return;
        }
        const indentation = getIndentation(sourceCode, node.loc.start.line);
        const [ prevQuestionMark, questionMark ] = sourceCode.getTokensBefore(node.consequent, { count: 2 });
        const [ prevColon, colon ] = sourceCode.getTokensBefore(node.alternate, { count: 2 });
        const aIndentation = getIndentation(sourceCode, questionMark.loc.start.line);

        if(prevQuestionMark.loc.end.line === questionMark.loc.start.line){
          context.report({
            node: questionMark,
            messageId: "default",
            *fix(fixer){
              yield fixer.insertTextBefore(questionMark, "\n" + indentation + "  ");
            }
          });
        }else{
          const elseIfLike = node.parent?.type === AST_NODE_TYPES.ConditionalExpression && node.parent.alternate === node;

          if(elseIfLike && aIndentation.length !== indentation.length){
            context.report({
              node: questionMark,
              messageId: "no-indent",
              *fix(fixer){
                yield fixer.replaceTextRange([
                  sourceCode.lineStartIndices[questionMark.loc.start.line - 1],
                  questionMark.range[0]
                ], indentation);
              }
            });
          }
          if(!elseIfLike && aIndentation.length <= indentation.length){
            context.report({
              node: questionMark,
              messageId: "indent",
              *fix(fixer){
                yield fixer.replaceTextRange([
                  sourceCode.lineStartIndices[questionMark.loc.start.line - 1],
                  questionMark.range[0]
                ], aIndentation + "  ");
              }
            });
          }
        }
        if(prevColon.loc.end.line === colon.loc.start.line){
          context.report({
            node: colon,
            messageId: "default",
            *fix(fixer){
              yield fixer.insertTextBefore(colon, "\n" + indentation + "  ");
            }
          });
        }else{
          const bIndentation = getIndentation(sourceCode, colon.loc.start.line);

          if(aIndentation.length !== bIndentation.length){
            context.report({
              node: colon,
              messageId: "indent",
              *fix(fixer){
                yield fixer.replaceTextRange([
                  sourceCode.lineStartIndices[colon.loc.start.line - 1],
                  colon.range[0]
                ], aIndentation);
              }
            });
          }
        }
      }
    };
  }
});