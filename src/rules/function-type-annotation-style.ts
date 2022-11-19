import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "code",
    messages: {
      'default': "Signature of `{{key}}` should be {{type}}-like."
    },
    schema: [{
      type: "object",
      properties: {
        typeAlias: { type: "string", enum: [ "property", "method" ] },
        interface: { type: "string", enum: [ "property", "method" ] }
      }
    }]
  },
  defaultOptions: [{
    typeAlias: "property",
    interface: "method"
  }],
  create(context, [ options ]){
    const sourceCode = context.getSourceCode();

    return {
      TSPropertySignature: node => {
        if(node.typeAnnotation?.typeAnnotation.type !== AST_NODE_TYPES.TSFunctionType){
          return;
        }
        const type = node.parent?.type === AST_NODE_TYPES.TSTypeLiteral
          ? "typeAlias"
          : node.parent?.type === AST_NODE_TYPES.TSInterfaceBody
          ? "interface"
          : undefined
        ;
        if(!type){
          return;
        }
        if(options[type] === "property"){
          return;
        }
        const returnType = node.typeAnnotation.typeAnnotation.returnType;

        context.report({
          node: node.typeAnnotation,
          messageId: "default",
          data: { key: sourceCode.getText(node.key), type: options[type] },
          *fix(fixer){
            const colon = node.typeAnnotation && sourceCode.getFirstToken(node.typeAnnotation);
            const arrow = returnType && sourceCode.getFirstToken(returnType);

            if(colon){
              yield fixer.remove(colon);
            }
            if(arrow){
              yield fixer.replaceText(arrow, ":");
            }
          }
        });
      },
      TSMethodSignature: node => {
        const type = node.parent?.type === AST_NODE_TYPES.TSTypeLiteral
          ? "typeAlias"
          : node.parent?.type === AST_NODE_TYPES.TSInterfaceBody
          ? "interface"
          : undefined
        ;
        if(!type){
          return;
        }
        if(options[type] === "method"){
          return;
        }
        context.report({
          node,
          messageId: "default",
          data: { key: sourceCode.getText(node.key), type: options[type] },
          *fix(fixer){
            const colon = node.returnType && sourceCode.getFirstToken(node.returnType);

            yield fixer.insertTextAfter(node.key, ":");
            if(colon){
              yield fixer.replaceText(colon, "=>");
            }
          }
        });
      }
    };
  }
});