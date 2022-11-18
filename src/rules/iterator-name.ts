import type { Identifier, CallExpression, Expression, ArrayPattern, Node } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";

import { toOrdinal } from "../utils/text";
import { getTSTypeByNode, useTypeChecker } from "../utils/type";

const iterativeMethods = [ "map", "reduce", "every", "some", "forEach", "filter", "find", "findIndex" ];
const kindTable:Record<string, Array<"index"|"key"|"value"|"previousValue"|"entry">> = {
  for: [ "index" ],
  forIn: [ "key" ],
  forOf: [ "value" ],

  entries: [ "entry", "index" ],
  every: [ "value", "index" ],
  filter: [ "value", "index" ],
  find: [ "value", "index" ],
  findIndex: [ "value", "index" ],
  forEach: [ "value", "index" ],
  map: [ "value", "index" ],
  reduce: [ "previousValue", "value", "index" ],
  some: [ "value", "index" ]
};

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    messages: {
      'default': "{{index}} iterator name of {{depth}} `{{kind}}` should be `{{criterion}}`."
    },
    schema: [{
      type: "object",
      properties: {
        index: { type: "array", items: { type: "string" } },
        key: { type: "array", items: { type: "string" } },
        value: { type: "array", items: { type: "string" } },
        previousValue: { type: "array", items: { type: "string" } },
        entry: { type: "array", items: { type: "string" } }
      }
    }]
  },
  defaultOptions: [{
    index: [ "i", "j", "k", "l", "m" ],
    key: [ "k", "l", "m", "n", "o" ],
    value: [ "v", "w", "x", "y", "z" ],
    previousValue: [ "pv", "pw", "px", "py", "pz" ],
    entry: [ "e", "f", "g", "h", "i" ]
  }],
  create(context, [ options ]){
    const sourceCode = context.getSourceCode();

    const getIterativeStatementParameters = (node:Node) => {
      let name:string;
      let list:Array<Identifier|ArrayPattern>;
      let calleeObject:Expression|undefined = undefined;

      switch(node.type){
        case AST_NODE_TYPES.ForStatement:
          if(node.init?.type !== AST_NODE_TYPES.VariableDeclaration){
            return null;
          }
          if(node.init.declarations.length !== 1){
            return null;
          }
          if(node.init.declarations[0].id.type !== AST_NODE_TYPES.Identifier){
            return null;
          }
          name = "for";
          list = [ node.init.declarations[0].id ];
          break;
        case AST_NODE_TYPES.ForInStatement:
        case AST_NODE_TYPES.ForOfStatement: {
          if(node.left.type !== AST_NODE_TYPES.VariableDeclaration){
            return null;
          }
          if(node.left.declarations.length !== 1){
            return null;
          }
          const { id } = node.left.declarations[0];
          if(id.type !== AST_NODE_TYPES.Identifier && id.type !== AST_NODE_TYPES.ArrayPattern){
            return null;
          }
          name = node.type === AST_NODE_TYPES.ForInStatement ? "forIn" : "forOf";
          list = [ id ];
          calleeObject = node.right;
        } break;
        default: return null;
      }
      return { name, list, calleeObject };
    };
    const getIterativeMethodParameters = (node:CallExpression) => {
      if(node.callee.type !== AST_NODE_TYPES.MemberExpression){
        return null;
      }
      if(node.callee.property.type !== AST_NODE_TYPES.Identifier){
        return null;
      }
      if(node.arguments[0]?.type !== AST_NODE_TYPES.ArrowFunctionExpression){
        return null;
      }
      if(!node.arguments[0].params.every(v => v.type === AST_NODE_TYPES.Identifier || v.type === AST_NODE_TYPES.ArrayPattern)){
        return null;
      }
      const symbol = getTSTypeByNode(context, node.callee.object).getSymbol();
      if(symbol?.name !== "Array"){
        return null;
      }
      if(!iterativeMethods.includes(node.callee.property.name)){
        return null;
      }
      return {
        name: node.callee.property.name,
        calleeObject: node.callee.object,
        list: node.arguments[0].params as Array<Identifier|ArrayPattern>
      };
    };
    const getCurrentDepth = () => {
      let R = 0;

      for(const v of context.getAncestors()){
        switch(v.type){
          case AST_NODE_TYPES.CallExpression:
            if(!getIterativeMethodParameters(v)){
              continue;
            }
            R++;
            break;
          case AST_NODE_TYPES.ForStatement:
          case AST_NODE_TYPES.ForInStatement:
          case AST_NODE_TYPES.ForOfStatement:
          case AST_NODE_TYPES.WhileStatement:
          case AST_NODE_TYPES.DoWhileStatement:
            R++;
            break;
        }
      }
      return R;
    };
    const getActualName = (value:string) => {
      if(value.startsWith("$")){
        return value.slice(1);
      }
      return value;
    };
    const checkParameterNames = (kind:(typeof kindTable)[string], parameters:Array<Identifier|ArrayPattern>, depth:number) => {
      for(let i = 0; i < parameters.length; i++){
        const parameter = parameters[i];

        if(parameter.type === AST_NODE_TYPES.ArrayPattern){
          if(kind[i] !== "entry"){
            continue;
          }
          if(parameter.elements[0]?.type !== AST_NODE_TYPES.Identifier){
            continue;
          }
          if(parameter.elements[1]?.type !== AST_NODE_TYPES.Identifier){
            continue;
          }
          if(getActualName(parameter.elements[0].name) === options.key[depth] && getActualName(parameter.elements[1].name) === options.value[depth]){
            continue;
          }
          context.report({
            node: parameter,
            messageId: "default",
            data: {
              index: "Destructured",
              depth: toOrdinal(depth + 1),
              kind: kind[i],
              criterion: `[ ${options.key[depth]}, ${options.value[depth]} ]`
            }
          });
        }else{
          const criterion = options[kind[i]][depth];
          if(!criterion){
            continue;
          }
          if(getActualName(parameter.name) === criterion){
            continue;
          }
          context.report({
            node: parameter,
            messageId: "default",
            data: {
              index: toOrdinal(i + 1),
              depth: toOrdinal(depth + 1),
              kind: kind[i],
              criterion
            }
          });
        }
      }
    };
    const isObjectEntriesCall = (node:Expression|undefined):node is CallExpression => {
      if(node?.type !== AST_NODE_TYPES.CallExpression){
        return false;
      }
      if(sourceCode.getText(node.callee) !== "Object.entries"){
        return false;
      }
      return true;
    };

    useTypeChecker(context);

    return {
      CallExpression: node => {
        const parameters = getIterativeMethodParameters(node);
        if(!parameters){
          return;
        }
        const depth = getCurrentDepth();

        if(isObjectEntriesCall(parameters.calleeObject)){
          checkParameterNames(kindTable['entries'], parameters.list, depth);
        }else{
          checkParameterNames(kindTable[parameters.name], parameters.list, depth);
        }
      },
      'ForStatement, ForInStatement, ForOfStatement': node => {
        const parameters = getIterativeStatementParameters(node);
        if(!parameters){
          return;
        }
        const depth = getCurrentDepth();

        if(parameters.calleeObject && isObjectEntriesCall(parameters.calleeObject)){
          checkParameterNames(kindTable['entries'], parameters.list, depth);
        }else{
          checkParameterNames(kindTable[parameters.name], parameters.list, depth);
        }
      }
    };
  }
});