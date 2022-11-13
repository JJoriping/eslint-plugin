import type { ArrayExpression, ArrayPattern, Node, ObjectExpression, ObjectPattern, Token } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import { closingLinePattern } from "../utils/patterns";

const OBJECT_OR_ARRAY_TYPES = [
  AST_NODE_TYPES.ArrayExpression,
  AST_NODE_TYPES.ArrayPattern,
  AST_NODE_TYPES.ObjectExpression,
  AST_NODE_TYPES.ObjectPattern
];
const DIRECTION_TABLE:Record<string, string> = {
  '[': "after",
  '{': "after",
  ']': "before",
  '}': "before"
};

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "whitespace",
    messages: {
      'should': "Spacing required {{direction}} `{{token}}`.",
      'should-not': "No spacing required {{direction}} `{{token}}`."
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
      
      return closer.loc.start.column === chunk[0].length - 1;
    };
    const hasOnlyObjectOrArray = (children:Array<Node|null>) => {
      return children.length === 1 && children[0] !== null && OBJECT_OR_ARRAY_TYPES.includes(children[0].type);
    };
    const getMessageIdWithData = (token:string, shouldBeSpaced:boolean) => {
      const direction = DIRECTION_TABLE[token];

      return {
        messageId: shouldBeSpaced ? "should" as const : "should-not" as const,
        data: { direction, token }
      };
    };
    const checkLeadingSpace = (from:Node, token:string, shouldBeSpaced:boolean = false) => {
      const [ opener, payload ] = sourceCode.getFirstTokens(from, { count: 2 });
      if(!payload){
        return;
      }
      if(shouldBeSpaced === Boolean(sourceCode.isSpaceBetween?.(opener, payload))){
        return;
      }
      context.report({
        node: opener,
        ...getMessageIdWithData(token, shouldBeSpaced),
        *fix(fixer){
          if(shouldBeSpaced){
            yield fixer.insertTextAfter(opener, " ");
          }else{
            yield fixer.removeRange([ opener.range[1], payload.range[0] ]);
          }
        }
      });
    };
    const checkTrailingSpace = (from:Node, token:string, shouldBeSpaced:boolean = false) => {
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
        ...getMessageIdWithData(token, shouldBeSpaced),
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
        const isMultiline = node.loc.start.line !== node.loc.end.line;
        const only = !isMultiline && hasOnlyObjectOrArray(node.elements);

        checkLeadingSpace(node, '[', !only);
        if(isMultiline){
          checkTrailingSpace(node, ']', false);
        }else{
          checkTrailingSpace(node, ']', !only);
        }
      },
      'ObjectExpression, ObjectPattern': (node:ObjectExpression|ObjectPattern) => {
        if(!node.properties.length){
          return;
        }
        const isMultiline = node.loc.start.line !== node.loc.end.line;
        const only = !isMultiline && hasOnlyObjectOrArray(node.properties);

        checkLeadingSpace(node, '{', !only);
        if(isMultiline){
          checkTrailingSpace(node, '}', false);
        }else{
          checkTrailingSpace(node, '}', !only);
        }
      }
    };
  }
});