import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";

import { getTSTypeByNode, isReactComponent, useTypeChecker } from "../utils/type";

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

          if(!isReactComponent(context, tsType)){
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

        if(!isReactComponent(context, tsType)){
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