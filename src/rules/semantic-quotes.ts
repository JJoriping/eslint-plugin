import type { CallExpression, Literal, NewExpression, Node, ObjectLiteralElement } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES } from "@typescript-eslint/types/dist/generated/ast-spec";
import { ESLintUtils } from "@typescript-eslint/utils";
import { Symbol, SyntaxKind } from "typescript";
import { getFunctionParameters, getObjectProperties, getTSSymbolByNode, getTSTypeByNode, getTSTypeBySymbol, MessageIdOf, useTypeChecker } from "../utils/type";

const QUOTES = [ "'", "\"", "`" ];
const quotePattern = /^['"`]|['"`]$/g;

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
      'from-valueish-usage': "String literal used as a value should be quoted with `\"`."
    },
    schema: [{
      type: "object",
      properties: {
        keyishNamePattern: { type: "string" },
        valueishNamePattern: { type: "string" },
      }
    }]
  },
  defaultOptions: [{
    keyishNamePattern: /^(id|key|index|separator|delimiter)$|(Id|Key|Index|Separator|Delimiter)$/.source,
    valueishNamePattern: /^(value|name)$|(Value|Name)$/.source
  }],
  create(context, [{ keyishNamePattern: keyishNamePatternString, valueishNamePattern: valueishNamePatternString }]){
    const keyishNamePattern = new RegExp(keyishNamePatternString);
    const valueishNamePattern = new RegExp(valueishNamePatternString);
    const sourceCode = context.getSourceCode();
    const assertStringLiteral = (node:Node, as:"key"|"value", messageId:MessageIdOf<typeof context>) => {
      if(node.type !== AST_NODE_TYPES.Literal){
        return;
      }
      if(!QUOTES.includes(node.raw[0])){
        return;
      }
      const target = as === "key" ? "'" : "\"";
      if(node.raw[0] === target){
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
    const checkLiteral = (symbol:Symbol, node:Literal) => {
      if(keyishNamePattern.test(symbol.name)){
        assertStringLiteral(node, 'key', 'from-keyish-name');
        return;
      }
      if(valueishNamePattern.test(symbol.name)){
        assertStringLiteral(node, 'value', 'from-valueish-name');
        return;
      }
      const type = getTSTypeBySymbol(context, symbol, node);
      const isKey = type.isUnion() && type.types.every(w => w.isStringLiteral());

      if(isKey){
        assertStringLiteral(node, 'key', 'from-keyish-type');
      }else{
        assertStringLiteral(node, 'value', 'from-valueish-type');
      }
    };
    const checkObjectExpression = (types:readonly Symbol[], values:ObjectLiteralElement[]) => {
      const typeMap = types.reduce<Record<string, Symbol>>((pv, v) => {
        pv[v.name] = v;
        return pv;
      }, {});
      for(const v of values){
        if(v.type !== AST_NODE_TYPES.Property) continue;
        if(v.key.type !== AST_NODE_TYPES.Literal) continue;
        if(typeof v.key.value !== "string") continue;
        if(v.value.type === AST_NODE_TYPES.Literal){
          checkLiteral(typeMap[v.key.value], v.value);
        }else if(v.value.type === AST_NODE_TYPES.ObjectExpression){
          checkObjectExpression(getTSTypeBySymbol(context, typeMap[v.key.value], v).getProperties(), v.value.properties);
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
        for(let i = 0; i < parameters.length; i++){
          const parameter = parameters[i];
          const argument = node.arguments[i];
          if(!argument) continue;
          switch(argument.type){
            case AST_NODE_TYPES.Literal:
              checkLiteral(parameter, argument);
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
      TSPropertySignature: node => {
        assertStringLiteral(node.key, 'key', 'from-keyish-usage');
      },
      TSLiteralType: node => {
        assertStringLiteral(node.literal, 'value', 'from-valueish-usage');
      }
    };
  }
});