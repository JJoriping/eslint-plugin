import { ESLintUtils } from "@typescript-eslint/utils";

const backtickPattern = /^`|`$/g;

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "suggestion",
    fixable: "code",
    messages: {
      'default': "Template literal should contain at least one expression."
    },
    schema: [{
      type: "object",
      properties: {
        to: { type: "string", enum: [ '\'', '"' ] }
      }
    }]
  },
  defaultOptions: [{
    to: '"'
  }],
  create(context, [{ to }]){
    const sourceCode = context.getSourceCode();

    return {
      TemplateLiteral: node => {
        if(node.expressions.length){
          return;
        }
        if(node.loc.start.line !== node.loc.end.line){
          return;
        }
        context.report({
          node,
          messageId: "default",
          *fix(fixer){
            yield fixer.replaceText(node, sourceCode.getText(node).replace(backtickPattern, to));
          }
        });
      }
    };
  }
});