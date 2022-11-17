import type { JSXClosingElement, JSXOpeningElement, Token } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import { getIndentation } from "../utils/code";

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "whitespace",
    messages: {
      'in-tag-opening': "Opening of a tag should not be spaced.",
      'in-tag-closing': "Closing of a single line tag should not be spaced.",
      'in-tag-self-closing': "Self-closing of a tag should be spaced.",
      'in-tag-indentation': "Closing of a multiline tag should appear at the first of its line.",
      'in-multiline-tag-closing': "Closing of a tag should not be multiline.",
      'in-children-indentation': "Children of a tag should be indented."
    },
    schema: []
  },
  defaultOptions: [],
  create(context){
    const sourceCode = context.getSourceCode();

    const checkTagOpening = (tag:JSXOpeningElement|JSXClosingElement) => {
      let prefix:Token;
      let payload:Token;

      if(tag.type === AST_NODE_TYPES.JSXOpeningElement){
        [ prefix, payload ] = sourceCode.getFirstTokens(tag, { count: 2 });
      }else{
        [ , prefix, payload ] = sourceCode.getFirstTokens(tag, { count: 3 });
      }
      if(!sourceCode.isSpaceBetween?.(prefix, payload)){
        return;
      }
      context.report({
        node: prefix,
        messageId: "in-tag-opening",
        *fix(fixer){
          yield fixer.removeRange([ prefix.range[1], payload.range[0] ]);
        }
      });
    };
    const checkTagClosing = (tag:JSXOpeningElement|JSXClosingElement) => {
      const selfClosing = tag.type === AST_NODE_TYPES.JSXOpeningElement && tag.selfClosing;
      const [ payload, next ] = sourceCode.getLastTokens(tag, {
        count: selfClosing ? 3 : 2
      });

      if(selfClosing){
        if(sourceCode.isSpaceBetween?.(payload, next)){
          return;
        }
        context.report({
          node: next,
          messageId: "in-tag-self-closing",
          *fix(fixer){
            yield fixer.insertTextBefore(next, " ");
          }
        });
      }else{
        if(!sourceCode.isSpaceBetween?.(payload, next)){
          return;
        }
        context.report({
          node: next,
          messageId: "in-tag-closing",
          *fix(fixer){
            yield fixer.removeRange([ payload.range[1], next.range[0] ]);
          }
        });
      }
    };

    return {
      JSXElement: node => {
        if(!node.children.length) return;
        const first = sourceCode.getFirstToken(node);
        const openingTagRear = sourceCode.getLastToken(node.openingElement);
        const closingTagFront = node.closingElement && sourceCode.getFirstToken(node.closingElement);
        if(!first || !openingTagRear || !closingTagFront){
          return;
        }
        const indentation = getIndentation(sourceCode, first.loc.start.line);

        for(let i = openingTagRear.loc.end.line + 1; i < closingTagFront.loc.start.line; i++){
          const currentIndentation = getIndentation(sourceCode, i);
          if(indentation.length < currentIndentation.length) continue;
          const start = sourceCode.getLocFromIndex(sourceCode.lineStartIndices[i - 1]);
          const end = { line: start.line, column: currentIndentation.length };
          const endIndex = sourceCode.getIndexFromLoc(end);

          context.report({
            loc: { start, end },
            messageId: "in-children-indentation",
            *fix(fixer){
              yield fixer.replaceTextRange([ sourceCode.lineStartIndices[i - 1], endIndex ], indentation + "  ");
            }
          });
        }
      },
      JSXOpeningElement: node => {
        const isSingleLine = node.loc.start.line === node.loc.end.line;

        checkTagOpening(node);
        if(isSingleLine){
          checkTagClosing(node);
        }else{
          const closingBracket = sourceCode.getLastToken(node);
          if(!closingBracket) return;
          const aIndentation = getIndentation(sourceCode, node.loc.start.line);
          const bIndentation = getIndentation(sourceCode, closingBracket.loc.end.line);

          if(aIndentation !== bIndentation){
            context.report({
              node: closingBracket,
              messageId: "in-tag-indentation",
              *fix(fixer){
                const target = node.selfClosing ? sourceCode.getTokenBefore(closingBracket)! : closingBracket;

                yield fixer.insertTextBefore(target, "\n" + aIndentation);
              }
            });
          }
        }
      },
      JSXClosingElement: node => {
        const isSingleLine = node.loc.start.line === node.loc.end.line;

        checkTagOpening(node);
        if(isSingleLine){
          checkTagClosing(node);
          return;
        }
        context.report({
          node,
          messageId: "in-multiline-tag-closing",
          *fix(fixer){
            yield fixer.replaceText(node, sourceCode.getText(node).replace(/\s/g, ""));
          }
        });
      }
    };
  }
});