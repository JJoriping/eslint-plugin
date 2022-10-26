import type { ArrayExpression, ArrayPattern, Node, ObjectExpression, ObjectPattern, Token } from "@typescript-eslint/types/dist/generated/ast-spec";
import { ESLintUtils } from "@typescript-eslint/utils";
import { closingLinePattern } from "../utils/patterns";
import { MessageIdOf } from "../utils/type";

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "whitespace",
    messages: {
      'after-[': "Spacing required after `[`.",
      'after-{': "Spacing required after `{`.",
      'before-]': "Spacing required before `]`.",
      'before-}': "Spacing required before `}`.",
      'no-before-]': "No spacing required before `]`.",
      'no-before-}': "No spacing required before `}`."
    },
    schema: []
  },
  defaultOptions: [],
  create(context){
    const sourceCode = context.getSourceCode();
    
    const isFirstCloserOfLine = (closer:Token) => {
      const line = sourceCode.lines[closer.loc.start.line - 1];
      const chunk = line.match(closingLinePattern);
      if(!chunk) return false;
      
      return closer.value === chunk[2];
    };
    const checkLeadingSpace = (from:Node, messageId:MessageIdOf<typeof context>) => {
      const [ opener, payload ] = sourceCode.getFirstTokens(from, { count: 2 });
      if(payload && sourceCode.isSpaceBetween?.(opener, payload)){
        return;
      }
      context.report({
        node: opener,
        messageId,
        *fix(fixer){
          yield fixer.insertTextAfter(opener, " ");
        }
      });
    };
    const checkTrailingSpace = (from:Node, messageId:MessageIdOf<typeof context>, shouldBeSpaced:boolean = false) => {
      const [ payload, closer ] = sourceCode.getLastTokens(from, { count: 2 });
      if(!payload){
        return;
      }
      if(isFirstCloserOfLine(closer)){
        return;
      }
      if(shouldBeSpaced === Boolean(sourceCode.isSpaceBetween?.(payload, closer))){
        return;
      }
      context.report({
        node: closer,
        messageId,
        *fix(fixer){
          if(shouldBeSpaced){
            yield fixer.insertTextBefore(closer, " ");
          }else{
            yield fixer.removeRange([ payload.range[1], closer.range[0] ]);
          }
        }
      });
    };

    return {
      'ArrayExpression, ArrayPattern': (node:ArrayExpression|ArrayPattern) => {
        if(!node.elements.length){
          return;
        }
        checkLeadingSpace(node, 'after-[');
        if(node.loc.start.line === node.loc.end.line){
          checkTrailingSpace(node, 'before-]', true);
        }else{
          checkTrailingSpace(node, 'no-before-]', false);
        }
      },
      'ObjectExpression, ObjectPattern': (node:ObjectExpression|ObjectPattern) => {
        if(!node.properties.length){
          return;
        }
        checkLeadingSpace(node, 'after-{');
        if(node.loc.start.line === node.loc.end.line){
          checkTrailingSpace(node, 'before-}', true);
        }else{
          checkTrailingSpace(node, 'no-before-}', false);
        }
      }
    };
  }
});