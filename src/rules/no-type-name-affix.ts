import { ESLintUtils } from "@typescript-eslint/utils";

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "code",
    messages: {
      'for-type-alias': "Type alias name should not be `{{pattern}}`.",
      'for-interface': "Interface name should not be `{{pattern}}`."
    },
    schema: [{
      type: "object",
      properties: {
        invalidTypeAliasNamePattern: { type: "string" },
        invalidInterfaceNamePattern: { type: "string" },
        validNames: {
          type: "array",
          items: { type: "string" }
        }
      }
    }]
  },
  defaultOptions: [{
    invalidTypeAliasNamePattern: /[^A-Z]T(?:ype)?$/.source,
    invalidInterfaceNamePattern: /^I[A-Z][^A-Z]/.source,
    validNames: [] as string[]
  }],
  create(context, [{
    invalidTypeAliasNamePattern: invalidTypeAliasNamePatternString,
    invalidInterfaceNamePattern: invalidInterfaceNamePatternString,
    validNames
  }]){
    const invalidTypeAliasNamePattern = new RegExp(invalidTypeAliasNamePatternString);
    const invalidInterfaceNamePattern = new RegExp(invalidInterfaceNamePatternString);

    return {
      TSTypeAliasDeclaration: node => {
        if(!invalidTypeAliasNamePattern.test(node.id.name)){
          return;
        }
        if(validNames.includes(node.id.name)){
          return;
        }
        context.report({
          node: node.id,
          messageId: "for-type-alias",
          data: { pattern: invalidTypeAliasNamePatternString }
        });
      },
      TSInterfaceDeclaration: node => {
        if(!invalidInterfaceNamePattern.test(node.id.name)){
          return;
        }
        if(validNames.includes(node.id.name)){
          return;
        }
        context.report({
          node: node.id,
          messageId: "for-interface",
          data: { pattern: invalidInterfaceNamePatternString }
        });
      }
    };
  }
});