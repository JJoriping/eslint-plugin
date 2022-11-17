import type { TSPropertySignature } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "whitespace",
    messages: {
      'default': "No spacing required around `:` except in type aliases.",
      'before-in-type-alias': "No spacing required before `:` in type aliases.",
      'after-in-type-alias': "Spacing required after `:` in type aliases."
    },
    schema: []
  },
  defaultOptions: [],
  create(context){
    const sourceCode = context.getSourceCode();

    return {
      TSTypeAnnotation: node => {
        if(node.parent?.parent?.type === AST_NODE_TYPES.TSTypeLiteral){
          return;
        }
        const [ colon, after ] = sourceCode.getFirstTokens(node, { count: 2 });
        if(colon.value !== ":"){
          return;
        }
        const before = sourceCode.getTokenBefore(colon);
        const hasSpaceBefore = before && sourceCode.isSpaceBetween?.(before, colon);
        const hasSpaceAfter = sourceCode.isSpaceBetween?.(colon, after);

        if(!hasSpaceBefore && !hasSpaceAfter){
          return;
        }
        context.report({
          node: colon,
          messageId: "default",
          *fix(fixer){
            if(hasSpaceBefore) yield fixer.removeRange([ before.range[1], colon.range[0] ]);
            if(hasSpaceAfter) yield fixer.removeRange([ colon.range[1], after.range[0] ]);
          }
        });
      },
      'TSTypeLiteral>TSPropertySignature': ({ typeAnnotation }:TSPropertySignature) => {
        if(!typeAnnotation){
          return;
        }
        const [ colon, after ] = sourceCode.getFirstTokens(typeAnnotation, { count: 2 });
        const before = sourceCode.getTokenBefore(colon);

        if(before && sourceCode.isSpaceBetween?.(before, colon)){
          context.report({
            node: colon,
            messageId: "before-in-type-alias",
            *fix(fixer){
              yield fixer.removeRange([ before.range[1], colon.range[0] ]);
            }
          });
        }
        if(!sourceCode.isSpaceBetween?.(colon, after)){
          context.report({
            node: colon,
            messageId: "after-in-type-alias",
            *fix(fixer){
              yield fixer.insertTextAfter(colon, " ");
            }
          });
        }
      }
    };
  }
});