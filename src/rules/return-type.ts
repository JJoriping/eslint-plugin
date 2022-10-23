import { ESLintUtils } from "@typescript-eslint/utils";
import { getFunctionReturnType, typeToString, useTypeChecker } from "../utils/type";

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "suggestion",
    hasSuggestions: true,
    messages: {
      'for-method': "Method should have a return type annotation.",
      'for-function': "Function with the simple return type `{{type}}` should have a return type annotation.",
      'for-function/suggest/0': "Add a return type annotation"
    },
    schema: [{
      type: "object",
      properties: {
        simpleTypePattern: { type: "string" }
      }
    }]
  },
  defaultOptions: [{
    simpleTypePattern: /^\w+(?: [&|] \w+)?$/.source
  }],
  create(context, [{ simpleTypePattern: simpleTypePatternString }]){
    const simpleTypePattern = new RegExp(simpleTypePatternString);

    useTypeChecker(context);

    return {
      MethodDefinition: node => {
        if(node.value.returnType){
          return;
        }
        context.report({ node, messageId: 'for-method' });
      },
      FunctionDeclaration: node => {
        if(node.returnType){
          return;
        }
        const returnType = typeToString(context, getFunctionReturnType(context, node));

        if(!simpleTypePattern.test(returnType)){
          return;
        }
        context.report({
          node,
          messageId: 'for-function',
          data: { type: returnType },
          suggest: [
            {
              messageId: 'for-function/suggest/0',
              *fix(fixer){
                yield fixer.insertTextBefore(node.body, `:${returnType.replace(/ /g, "")}`);
              }
            }
          ]
        });
      }
    };
  }
});