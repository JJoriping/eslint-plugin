import { ESLintUtils } from "@typescript-eslint/utils";

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "code",
    messages: {
      'default': ""
    },
    schema: []
  },
  defaultOptions: [],
  create(context){
    return {};
  }
});