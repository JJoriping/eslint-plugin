import type { CallExpression, Literal, NewExpression, Node, ObjectLiteralElement, TSLiteralType } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type { Symbol } from "typescript";
import { keyishNamePattern as defaultKeyishNamePattern, valueishNamePattern as defaultValueishNamePattern } from "../utils/patterns";
import type { MessageIdOf } from "../utils/type";
import { getFunctionParameters, getObjectProperties, getTSTypeByNode, getTSTypeBySymbol, isRestParameter, useTypeChecker } from "../utils/type";

const quotes = [ "'", "\"", "`" ];
const eventMethodNames = [ "on", "once", "off", "emit", "addEventListener", "removeEventListener" ];
const quotePattern = /^["'`]|["'`]$/g;

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "code",
    messages: {
      'from-keyish-name': "String literal for a key should be quoted with `'`.",
      'from-valueish-name': "String literal for a value should be quoted with `\"`.",

      'from-keyish-type': "String literal constrained by a finite set of values should be quoted with `'`.",
      'from-valueish-type': "String literal not constrained by a finite set of values should be quoted with `\"`.",

      'from-keyish-usage': "String literal used as a key should be quoted with `'`.",
      'from-valueish-usage': "String literal used as a value should be quoted with `\"`.",

      'from-event': "String literal used as an event name should be quoted with `'`.",
      'from-generic': "String literal used as a generic type should be quoted with `'`."
    },
    schema: [{
      type: "object",
      properties: {
        keyishNamePattern: { type: "string" },
        valueishNamePattern: { type: "string" }
      }
    }]
  },
  defaultOptions: [{
    keyishNamePattern: defaultKeyishNamePattern.source,
    valueishNamePattern: defaultValueishNamePattern.source
  }],
  create(context, [{ keyishNamePattern: keyishNamePatternString, valueishNamePattern: valueishNamePatternString }]){
    const keyishNamePattern = new RegExp(keyishNamePatternString);
    const valueishNamePattern = new RegExp(valueishNamePatternString);
    const sourceCode = context.getSourceCode();
    const assertStringLiteral = (node:Node, as:"key"|"value", messageId:MessageIdOf<typeof context>) => {
      if(node.type !== AST_NODE_TYPES.Literal){
        return;
      }
      if(!quotes.includes(node.raw[0])){
        return;
      }
      const target = as === "key" ? "'" : "\"";
      if(node.raw[0].startsWith(target)){
        return;
      }
      context.report({
        node,
        messageId,
        *fix(fixer){
          yield fixer.replaceText(node, sourceCode.getText(node).replace(quotePattern, target));
        }
      });
    };
    const checkLiteral = (symbol:Symbol, node:Literal, ignoreKeyishUnion?:boolean, isRest?:boolean) => {
      if(keyishNamePattern.test(symbol.name)){
        assertStringLiteral(node, 'key', 'from-keyish-name');
        return;
      }
      if(valueishNamePattern.test(symbol.name)){
        assertStringLiteral(node, 'value', 'from-valueish-name');
        return;
      }
      if(ignoreKeyishUnion){
        assertStringLiteral(node, 'value', 'from-valueish-usage');
        return;
      }
      const type = getTSTypeBySymbol(context, symbol, node).getNonNullableType();
      let isKey:boolean|undefined;

      if(isRest){
        const innerType = type.getNumberIndexType();

        isKey = innerType?.isStringLiteral() || (innerType?.isUnion() && innerType.types.every(v => v.isStringLiteral()));
      }else{
        isKey = type.isStringLiteral() || (type.isUnion() && type.types.every(v => v.isStringLiteral()));
      }
      if(isKey){
        assertStringLiteral(node, 'key', 'from-keyish-type');
      }else{
        assertStringLiteral(node, 'value', 'from-valueish-type');
      }
    };
    const checkObjectExpression = (types:readonly Symbol[], values:ObjectLiteralElement[]) => {
      const typeMap = types.reduce<Record<string, Symbol|undefined>>((pv, v) => {
        pv[v.name] = v;
        return pv;
      }, {});
      for(const v of values){
        if(v.type !== AST_NODE_TYPES.Property) continue;
        if(v.key.type !== AST_NODE_TYPES.Literal) continue;
        if(typeof v.key.value !== "string") continue;
        const keySymbol = typeMap[v.key.value];

        assertStringLiteral(v.key, 'key', 'from-keyish-usage');
        if(keySymbol && v.value.type === AST_NODE_TYPES.Literal){
          checkLiteral(keySymbol, v.value, true);
        }else if(v.value.type === AST_NODE_TYPES.ObjectExpression){
          checkObjectExpression(getTSTypeByNode(context, v.value).getNonNullableType().getProperties(), v.value.properties);
        }
      }
    };
    useTypeChecker(context);

    return {
      'CallExpression, NewExpression': (node:CallExpression|NewExpression) => {
        const parameters = getFunctionParameters(context, node);
        if(!parameters){
          return;
        }
        let parameterIndex = 0;

        for(let i = 0; i < node.arguments.length; i++){
          const parameter = parameters[parameterIndex];
          if(!parameter) break;
          const argument = node.arguments[i];
          const isRest = isRestParameter(context, parameter);

          switch(argument.type){
            case AST_NODE_TYPES.Literal:
              if(!parameterIndex && isCallingEventMethod(node)){
                assertStringLiteral(argument, 'key', 'from-event');
              }else{
                checkLiteral(parameter, argument, false, isRest);
              }
              break;
            case AST_NODE_TYPES.ConditionalExpression:
              for(const w of [ argument.consequent, argument.alternate ]){
                if(w.type !== AST_NODE_TYPES.Literal) continue;
                checkLiteral(parameter, w);
              }
              break;
            case AST_NODE_TYPES.ObjectExpression:
              checkObjectExpression(getTSTypeBySymbol(context, parameter, node).getProperties(), argument.properties);
              break;
          }
          if(!isRest){
            parameterIndex++;
          }
        }
      },
      MemberExpression: node => {
        assertStringLiteral(node.property, 'key', 'from-keyish-usage');
      },
      ObjectExpression: node => {
        switch(node.parent?.type){
          case AST_NODE_TYPES.VariableDeclarator:
            checkObjectExpression(getObjectProperties(context, node.parent.id), node.properties);
            break;
          case AST_NODE_TYPES.TSAsExpression:
            checkObjectExpression(getObjectProperties(context, node.parent.typeAnnotation), node.properties);
            break;
        }
      },
      TSLiteralType: (node:TSLiteralType) => {
        if(node.parent?.type === AST_NODE_TYPES.TSIndexedAccessType){
          assertStringLiteral(node.literal, 'key', 'from-keyish-name');
          return;
        }
        let fromGeneric = false;

        v: for(const v of context.getAncestors().reverse()){
          switch(v.type){
            case AST_NODE_TYPES.TSPropertySignature:
              fromGeneric = false;
              break v;
            case AST_NODE_TYPES.TSTypeParameter:
            case AST_NODE_TYPES.TSTypeParameterInstantiation:
              fromGeneric = true;
              break v;
          }
        }
        if(fromGeneric){
          assertStringLiteral(node.literal, 'key', 'from-generic');
        }else{
          assertStringLiteral(node.literal, 'value', 'from-valueish-usage');
        }
      },
      TSPropertySignature: node => {
        assertStringLiteral(node.key, 'key', 'from-keyish-usage');
      }
    };
  }
});
function isCallingEventMethod(node:CallExpression|NewExpression):boolean{
  if(node.type !== AST_NODE_TYPES.CallExpression) return false;
  if(node.callee.type !== AST_NODE_TYPES.MemberExpression) return false;
  if(node.callee.property.type !== AST_NODE_TYPES.Identifier) return false;
  return eventMethodNames.includes(node.callee.property.name);
}