import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import { domTypePatterns } from "../utils/patterns";
import { getTSTypeByNode, isDOMReturningFunction, useTypeChecker } from "../utils/type";

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "suggestion",
    messages: {
      'default': "Only one React component is allowed to be exported in a file."
    },
    schema: []
  },
  defaultOptions: [],
  create(context){
    let alreadyExported = false;

    useTypeChecker(context);

    return {
      ExportNamedDeclaration: node => {
        if(node.declaration?.type !== AST_NODE_TYPES.VariableDeclaration){
          return;
        }
        for(const v of node.declaration.declarations){
          const tsType = getTSTypeByNode(context, v.id);

          if(!isDOMReturningFunction(context, tsType, domTypePatterns)){
            continue;
          }
          if(!alreadyExported){
            alreadyExported = true;
            continue;
          }
          context.report({ node: v, messageId: "default" });
        }
      },
      ExportSpecifier: node => {
        const tsType = getTSTypeByNode(context, node.local);

        if(!isDOMReturningFunction(context, tsType, domTypePatterns)){
          return;
        }
        if(!alreadyExported){
          alreadyExported = true;
          return;
        }
        context.report({ node: node.local, messageId: "default" });
      }
    };
  }
});