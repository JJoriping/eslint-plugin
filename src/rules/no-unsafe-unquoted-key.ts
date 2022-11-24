import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import { getTSTypeByNode, useTypeChecker } from "../utils/type";

const propertyPattern = /\.\s*(\w+)$/;

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "code",
    messages: {
      'default': "Access to the unsafe key `{{key}}` should use a string literal."
    },
    schema: []
  },
  defaultOptions: [],
  create(context){
    const sourceCode = context.getSourceCode();

    useTypeChecker(context);

    return {
      MemberExpression: node => {
        if(node.property.type !== AST_NODE_TYPES.Identifier){
          return;
        }
        if(node.computed){
          return;
        }
        const type = getTSTypeByNode(context, node.object).getNonNullableType();
        const properties = context.settings.typeChecker.getPropertyOfType(type, node.property.name);
        if(properties){
          return;
        }
        context.report({
          node: node.property,
          messageId: 'default',
          data: { key: node.property.name },
          *fix(fixer){
            yield fixer.replaceText(node, sourceCode.getText(node).replace(propertyPattern, "['$1']"));
          }
        });
      }
    };
  }
});