import type { FunctionLike, Identifier, Node } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type { JSONSchema4 } from "@typescript-eslint/utils/dist/json-schema";
import type { Type } from "typescript";
import { camelCasePattern, domTypePatterns as defaultDOMTypePatterns, pascalCasePattern, upperSnakeCasePattern } from "../utils/patterns";
import { getTSTypeByNode, isDOMReturningFunction, typeToString, useTypeChecker } from "../utils/type";

const CASE_TABLE = {
  camelCase: camelCasePattern,
  PascalCase: pascalCasePattern,
  UPPER_SNAKE_CASE: upperSnakeCasePattern
};
const CASE_TABLE_KEYS = Object.keys(CASE_TABLE) as Array<keyof typeof CASE_TABLE>;
const allGenericsPattern = /<.+>/g;
const reactComponentTypePattern = /^(ComponentType|ComponentClass|FunctionComponent|NextPage)\b/;

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    messages: {
      'for-const': "Constant name should follow {{list}}.",
      'for-constructible': "Constructible object's name should follow {{list}}.",
      'for-enum': "Enumerator name should follow {{list}}.",
      'for-enumValue': "Enumerator value's name should follow {{list}}.",
      'for-function': "Function name should follow {{list}}.",
      'for-generic': "Generic name should follow {{list}}.",
      'for-interface': "Interface name should follow {{list}}.",
      'for-mappedKey': "Mapped key name should follow {{list}}.",
      'for-parameter': "Parameter name should follow {{list}}.",
      'for-reactComponent': "React component's name should follow {{list}}.",
      'for-typeAlias': "Type alias name should follow {{list}}.",
      'for-variable': "Variable name should follow {{list}}.",

      'for-catchParameter': "Catch parameter name should follow the pattern `{{pattern}}`.",
      'for-domVariable': "Name of the DOM-typed variable `{{type}}` should follow the pattern `{{pattern}}`."
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
            "mappedKey",
            "enum",
            "enumValue"
          ].reduce((pv, v) => {
            pv[v] = { type: "array", items: { type: "string", enum: CASE_TABLE_KEYS } };
            return pv;
          }, {} as Record<string, JSONSchema4>)
        },
        names: {
          type: "object",
          properties: {
            domVariable: { type: "string" },
            catchParameter: { type: "string" }
          }
        },
        domTypePatterns: { type: "array", items: { type: "string" } },
        exceptions: { type: "array", items: { type: "string" } }
      }
    }]
  },
  defaultOptions: [{
    cases: {
      const: [ "camelCase", "UPPER_SNAKE_CASE" ] as typeof CASE_TABLE_KEYS,
      constructible: [ "PascalCase" ] as typeof CASE_TABLE_KEYS,
      enum: [ "PascalCase" ] as typeof CASE_TABLE_KEYS,
      enumValue: [ "UPPER_SNAKE_CASE" ] as typeof CASE_TABLE_KEYS,
      function: [ "camelCase" ] as typeof CASE_TABLE_KEYS,
      generic: [ "PascalCase" ] as typeof CASE_TABLE_KEYS,
      interface: [ "PascalCase" ] as typeof CASE_TABLE_KEYS,
      mappedKey: [ "camelCase" ] as typeof CASE_TABLE_KEYS,
      parameter: [ "camelCase" ] as typeof CASE_TABLE_KEYS,
      reactComponent: [ "PascalCase" ] as typeof CASE_TABLE_KEYS,
      typeAlias: [ "PascalCase" ] as typeof CASE_TABLE_KEYS,
      variable: [ "camelCase" ] as typeof CASE_TABLE_KEYS
    },
    names: {
      domVariable: /^\$/.source,
      catchParameter: /^error$/.source
    },
    domTypePatterns: defaultDOMTypePatterns.map(v => v.source),
    exceptions: [ "_", "R", "$R" ]
  }],
  create(context, [{ cases, names, domTypePatterns: domTypePatternStrings, exceptions }]){
    const NAME_TABLE = {
      domVariable: new RegExp(names.domVariable),
      catchParameter: new RegExp(names.catchParameter)
    };
    const domTypePatterns = domTypePatternStrings.map(v => new RegExp(v));

    const isConstructible = (type:Type) => type.getConstructSignatures().length > 0;
    const isDOMObject = (type:Type):boolean => {
      const typeString = typeToString(context, type);
      if(typeString.startsWith("(")
        || typeString.startsWith("{")
        || typeString.startsWith("<")
      ){
        return false;
      }
      const filteredTypeString = typeString.replace(allGenericsPattern, "");

      return domTypePatterns.some(v => v.test(filteredTypeString));
    };

    const getSemanticType = (node:Identifier):null|["cases", keyof typeof cases]|["names", keyof typeof names] => {
      if(node.parent?.type === AST_NODE_TYPES.CatchClause) return [ 'names', 'catchParameter' ];
      const tsType = getTSTypeByNode(context, node).getNonNullableType();

      if(isConstructible(tsType)) return [ 'cases', 'constructible' ];
      if(isDOMReturningFunction(context, tsType, domTypePatterns)
        || reactComponentTypePattern.test(typeToString(context, tsType))
      ) return [ 'cases', 'reactComponent' ];
      if(node.parent?.type !== AST_NODE_TYPES.TSTypeAliasDeclaration && isDOMObject(tsType)){
        return [ 'names', 'domVariable' ];
      }
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
      const actualType = getSemanticType(node) || [ 'cases', type ];
      let data:Record<string, unknown>;

      switch(actualType[0]){
        case "cases":
          if(cases[actualType[1]].some(v => CASE_TABLE[v].test(name))){
            return;
          }
          data = { list: cases[actualType[1]].map(v => `\`${v}\``).join(' or ') };
          break;
        case "names":
          if(node.parent?.type === AST_NODE_TYPES.Property && node.parent.shorthand){
            return;
          }
          if(NAME_TABLE[actualType[1]].test(name)){
            return;
          }
          data = {
            pattern: NAME_TABLE[actualType[1]].source,
            type: typeToString(context, getTSTypeByNode(context, node))
          };
          break;
      }
      context.report({ node, messageId: `for-${actualType[1]}`, data });
    };

    useTypeChecker(context);

    return {
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
      MethodDefinition: node => {
        checkCase('function', node.key);
      },
      PropertyDefinition: node => {
        checkCase(node.readonly ? 'const' : 'variable', node.key);
      },
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

      TSEnumDeclaration: node => {
        checkCase('enum', node.id);
        for(const v of node.members){
          checkCase('enumValue', v.id);
        }
      },
      TSFunctionType: node => {
        for(const v of node.params){
          checkCase('parameter', v);
        }
      },
      TSInterfaceDeclaration: node => {
        checkCase('interface', node.id);
      },
      TSMethodSignature: node => {
        checkCase('function', node.key);
      },
      TSPropertySignature: node => {
        checkCase('variable', node.key);
      },
      TSTypeAliasDeclaration: node => {
        checkCase('typeAlias', node.id);
      },
      TSTypeParameter: node => {
        if(node.parent?.type === AST_NODE_TYPES.TSMappedType){
          checkCase('mappedKey', node.name);
        }else{
          checkCase('generic', node.name);
        }
      }
    };
  }
});