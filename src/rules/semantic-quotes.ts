import type { CallExpression, Literal, NewExpression, Node } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES } from "@typescript-eslint/types/dist/generated/ast-spec";
import { ESLintUtils } from "@typescript-eslint/utils";
import { Symbol } from "typescript";
import { getFunctionParameters, getTSTypeBySymbol, MessageIdOf, useTypeChecker } from "../utils/type";

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
          if(argument.type === AST_NODE_TYPES.Literal){
            checkLiteral(parameter, argument);
          }else if(argument.type === AST_NODE_TYPES.ConditionalExpression){
            for(const w of [ argument.consequent, argument.alternate ]){
              if(w.type !== AST_NODE_TYPES.Literal) continue;
              checkLiteral(parameter, w);
            }
          }
        }
        function checkLiteral(parameter:Symbol, node:Literal):void{
          if(keyishNamePattern.test(parameter.name)){
            assertStringLiteral(node, 'key', 'from-keyish-name');
            return;
          }
          if(valueishNamePattern.test(parameter.name)){
            assertStringLiteral(node, 'value', 'from-valueish-name');
            return;
          }
          const type = getTSTypeBySymbol(context, parameter);
          const isKey = type.isUnion() && type.types.every(w => w.isStringLiteral());

          if(isKey){
            assertStringLiteral(node, 'key', 'from-keyish-type');
          }else{
            assertStringLiteral(node, 'value', 'from-valueish-type');
          }
        }
      },
      MemberExpression: node => {
        assertStringLiteral(node.property, 'key', 'from-keyish-usage');
      },
      Property: node => {
        assertStringLiteral(node.key, 'key', 'from-keyish-usage');
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