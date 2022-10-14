import { ESLintUtils } from "@typescript-eslint/utils";

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "problem",
    docs: {
      recommended: "strict",
      description: "Test"
    },
    messages: {
      'test': "1"
    },
    schema: []
  },
  create(context){
    return {
      Program(){
        console.log("!");
      }
    };
  },
  defaultOptions: []
});