import type { Identifier, Node, FunctionLike } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import { JSONSchema4 } from "@typescript-eslint/utils/dist/json-schema";
import { camelCasePattern, pascalCasePattern, upperSnakeCasePattern } from "../utils/patterns";
import { getFunctionReturnType, getTSTypeByNode, typeToString, useTypeChecker } from "../utils/type";
import type { SignatureKind, Type } from "typescript";

const CASE_TABLE = {
  'camelCase': camelCasePattern,
  'PascalCase': pascalCasePattern,
  'UPPER_SNAKE_CASE': upperSnakeCasePattern
};
const CASE_TABLE_KEYS = Object.keys(CASE_TABLE) as Array<keyof typeof CASE_TABLE>;

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    messages: {
      'for-const': "Constant name should follow {{list}}.",
      'for-variable': "Variable name should follow {{list}}.",
      'for-function': "Function name should follow {{list}}.",
      'for-constructible': "Constructible object's name should follow {{list}}.",
      'for-reactComponent': "React component's name should follow {{list}}.",
      'for-parameter': "Parameter name should follow {{list}}.",
      'for-typeAlias': "Type alias name should follow {{list}}.",
      'for-interface': "Interface name should follow {{list}}.",
      'for-generic': "Generic name should follow {{list}}.",
      'for-enum': "Enumerator name should follow {{list}}.",
      'for-enumValue': "Enumerator value's name should follow {{list}}."
    },
    schema: [{
      type: "object",
      properties: {
        cases: {
          type: "object",
          properties: [
            "const",
            "variable",
            "function",
            "constructible",
            "reactComponent",
            "parameter",
            "typeAlias",
            "interface",
            "generic",
            "enum",
            "enumValue"
          ].reduce((pv, v) => {
            pv[v] = { type: "array", items: { type: "string", enum: CASE_TABLE_KEYS } };
            return pv;
          }, {} as Record<string, JSONSchema4>)
        },
        exceptions: { type: "array", items: { type: "string" } }
      }
    }]
  },
  defaultOptions: [{
    cases: {
      const: [ "camelCase", "UPPER_SNAKE_CASE" ] as typeof CASE_TABLE_KEYS,
      variable: [ "camelCase" ] as typeof CASE_TABLE_KEYS,
      function: [ "camelCase" ] as typeof CASE_TABLE_KEYS,
      constructible: [ "PascalCase" ] as typeof CASE_TABLE_KEYS,
      reactComponent: [ "PascalCase" ] as typeof CASE_TABLE_KEYS,
      parameter: [ "camelCase" ] as typeof CASE_TABLE_KEYS,
      typeAlias: [ "PascalCase" ] as typeof CASE_TABLE_KEYS,
      interface: [ "PascalCase" ] as typeof CASE_TABLE_KEYS,
      generic: [ "PascalCase" ] as typeof CASE_TABLE_KEYS,
      enum: [ "PascalCase" ] as typeof CASE_TABLE_KEYS,
      enumValue: [ "UPPER_SNAKE_CASE" ] as typeof CASE_TABLE_KEYS
    },
    exceptions: [ "_" ]
  }],
  create(context, [{ cases, exceptions }]){
    const isConstructible = (type:Type) => type.getConstructSignatures().length > 0;
    const isReactComponent = (type:Type) => {
      const callSignatures = type.getCallSignatures();
      if(!callSignatures.length) return false;
      const returnType = context.settings.typeChecker.getReturnTypeOfSignature(callSignatures[0]).getNonNullableType();
      const returnTypeSymbol = returnType.getSymbol();
      if(!returnTypeSymbol) return false;
      const returnTypeName =  context.settings.typeChecker.getFullyQualifiedName(returnTypeSymbol);

      return returnTypeName === "React.ReactElement";
    };

    const getSemanticType = (node:Identifier):null|keyof typeof cases => {
      const tsType = getTSTypeByNode(context, node).getNonNullableType();

      if(isConstructible(tsType)) return 'constructible';
      if(isReactComponent(tsType)) return 'reactComponent';
      return null;
    };
    const checkCase = (type:keyof typeof cases, node:Node) => {
      let name:string;
      switch(node.type){
        case AST_NODE_TYPES.Identifier: name = node.name; break;
        case AST_NODE_TYPES.ArrayPattern:
          for(const v of node.elements){
            if(!v) continue;
            checkCase(type, v);
          }
          return;
        case AST_NODE_TYPES.ObjectPattern:
          for(const v of node.properties){
            checkCase(type, v);
          }
          return;
        case AST_NODE_TYPES.AssignmentPattern: checkCase(type, node.left); return;
        case AST_NODE_TYPES.Property: checkCase(type, node.value); return;
        case AST_NODE_TYPES.RestElement: checkCase(type, node.argument); return;
        default: return;
      }
      if(exceptions.includes(name)){
        return;
      }
      const actualType = getSemanticType(node) || type;
      const valid = cases[actualType].some(v => CASE_TABLE[v].test(name));
      if(valid){
        return;
      }
      context.report({
        node,
        messageId: `for-${actualType}`,
        data: { list: cases[actualType].map(v => `\`${v}\``).join(' or ') }
      });
    };

    useTypeChecker(context);

    return {
      VariableDeclarator: node => {
        if(node.parent?.type !== AST_NODE_TYPES.VariableDeclaration){
          return;
        }
        if(node.parent.kind === "const"){
          checkCase('const', node.id);
        }else{
          checkCase('variable', node.id);
        }
      },
      ':function': (node:FunctionLike) => {
        if(node.id){
          checkCase('function', node.id);
        }
        for(const v of node.params){
          checkCase('parameter', v);
        }
      },
      ClassDeclaration: node => {
        if(!node.id){
          return;
        }
        checkCase('constructible', node.id);
      },
      PropertyDefinition: node => {
        checkCase('variable', node.key);
      },
      MethodDefinition: node => {
        checkCase('function', node.key);
      },
      TSPropertySignature: node => {
        checkCase('variable', node.key);
      },
      TSMethodSignature: node => {
        checkCase('function', node.key);
      },
      TSFunctionType: node => {
        for(const v of node.params){
          checkCase('parameter', v);
        }
      },
      TSTypeAliasDeclaration: node => {
        checkCase('typeAlias', node.id);
      },
      TSInterfaceDeclaration: node => {
        checkCase('interface', node.id);
      },
      TSTypeParameter: node => {
        checkCase('generic', node.name);
      },
      TSEnumDeclaration: node => {
        checkCase('enum', node.id);
        for(const v of node.members){
          checkCase('enumValue', v.id);
        }
      }
    };
  }
});