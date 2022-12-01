import type { Node, BinaryExpression, LogicalExpression } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import { closingLinePattern } from "../utils/patterns";
import { getIndentation } from "../utils/code";
import type { MessageIdOf } from "../utils/type";

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "whitespace",
    messages: {
      'for-conditional-expression': "Multiline conditional expression should finish the line.",
      'for-call-expression': "Multiline function call should finish the line.",
      'for-call-expression-consistency': "Both the parentheses of a function call should be indented equally.",
      'for-member-expression': "Multiline property access should finish the line.",
      'for-binary-expression': "Multiline binary expression should finish the line."
    },
    schema: []
  },
  defaultOptions: [],
  create(context){
    const sourceCode = context.getSourceCode();

    const checkExpression = (node:Node, messageId:MessageIdOf<typeof context>) => {
      const isMultiline = node.loc.start.line !== node.loc.end.line;
      if(!isMultiline){
        return;
      }
      const chunk = sourceCode.lines[node.loc.end.line - 1].match(closingLinePattern);
      if(chunk && getIndentation(sourceCode, node.loc.start.line) === chunk[1]){
        return;
      }
      const next = sourceCode.getTokenAfter(node);
      if(next?.loc.start.line !== node.loc.end.line){
        return;
      }
      context.report({
        node: next,
        messageId,
        *fix(fixer){
          yield fixer.insertTextAfter(node, "\n");
        }
      });
    };

    return {
      ConditionalExpression: node => {
        checkExpression(node, 'for-conditional-expression');
      },
      CallExpression: node => {
        const openingParenthesis = sourceCode.getTokenAfter(node.callee);
        const closingParenthesis = sourceCode.getLastToken(node);
        if(!openingParenthesis || !closingParenthesis){
          return;
        }
        const openingLineIndentation = getIndentation(sourceCode, openingParenthesis.loc.start.line);
        const closingLineIndentation = getIndentation(sourceCode, closingParenthesis.loc.end.line);

        checkExpression(node, 'for-call-expression');
        if(openingLineIndentation !== closingLineIndentation){
          context.report({
            node: closingParenthesis,
            messageId: "for-call-expression-consistency",
            *fix(fixer){
              yield fixer.insertTextBefore(closingParenthesis, "\n" + openingLineIndentation);
            }
          });
        }
      },
      MemberExpression: node => {
        if(node.parent?.type === AST_NODE_TYPES.CallExpression){
          return;
        }
        checkExpression(node, 'for-member-expression');
      },
      'BinaryExpression, LogicalExpression': (node:BinaryExpression|LogicalExpression) => {
        const leftEnd = sourceCode.getLastToken(node.left);
        const rightStart = sourceCode.getFirstToken(node.right);
        if(!leftEnd || !rightStart){
          return;
        }
        if(leftEnd.loc.end.line === rightStart.loc.start.line){
          return;
        }
        checkExpression(node, 'for-binary-expression');
      },
      'TSUnionType, TSIntersectionType': (node:Node) => {
        checkExpression(node, 'for-binary-expression');
      }
    };
  }
});