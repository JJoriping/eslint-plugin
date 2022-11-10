import { ESLintUtils } from "@typescript-eslint/utils";

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    messages: {
      'default': "Class expression is not allowed."
    },
    schema: []
  },
  defaultOptions: [],
  create(context){
    return {
      ClassExpression: node => {
        context.report({ node, messageId: "default" });
      }
    };
  }
});