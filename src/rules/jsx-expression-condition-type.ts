import type { LogicalExpression } from "@typescript-eslint/types/dist/generated/ast-spec";
import { ESLintUtils } from "@typescript-eslint/utils";
import { Type, TypeFlags } from "typescript";
import { getTSTypeByNode, useTypeChecker } from "../utils/type";

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "suggestion",
    fixable: "code",
    messages: {
      'default': "Left expression of loginal `&&` operations should not be a number or string."
    },
    schema: []
  },
  defaultOptions: [],
  create(context){
    const hasStringOrNumber = (type:Type):boolean => {
      if(type.isUnionOrIntersection()){
        return type.types.some(v => hasStringOrNumber(v));
      }
      const flags = type.getFlags();

      return Boolean(flags & (TypeFlags.StringLike | TypeFlags.NumberLike));
    };

    useTypeChecker(context);

    return {
      'JSXExpressionContainer>LogicalExpression[operator="&&"]': (node:LogicalExpression) => {
        const tsType = getTSTypeByNode(context, node.left).getNonNullableType();

        if(!hasStringOrNumber(tsType)){
          return;
        }
        context.report({ node: node.left, messageId: "default" });
      }
    };
  }
});