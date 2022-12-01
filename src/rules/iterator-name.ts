import type { ArrayPattern, ObjectPattern, CallExpression, Expression, Identifier, Node } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import { keyListLikeNamePattern as defaultKeyListLikeNamePattern } from "../utils/patterns";
import { toOrdinal } from "../utils/text";
import { getTSTypeByNode, useTypeChecker } from "../utils/type";

const iterativeMethods = [ "map", "reduce", "every", "some", "forEach", "filter", "find", "findIndex" ];
const kindTable:Record<string, Array<'index'|'key'|'value'|'previousKey'|'previousValue'|'entry'>> = {
  for: [ "index" ],
  forIn: [ "key" ],
  forOf: [ "value" ],

  entries: [ "entry", "index" ],
  entriesReduce: [ "previousValue", "entry", "index" ],

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
    schema: [
      {
        type: "object",
        properties: {
          entry: { type: "array", items: { type: "string" } },
          index: { type: "array", items: { type: "string" } },
          key: { type: "array", items: { type: "string" } },
          previousKey: { type: "array", items: { type: "string" } },
          previousValue: { type: "array", items: { type: "string" } },
          value: { type: "array", items: { type: "string" } }
        }
      },
      {
        type: "object",
        properties: {
          keyListLikeNamePattern: { type: "string" },
          exceptions: { type: "array", items: { type: "string" } }
        }
      }
    ]
  },
  defaultOptions: [
    {
      entry: [ "e", "f", "g", "h", "i" ],
      index: [ "i", "j", "k", "l", "m" ],
      key: [ "k", "l", "m", "n", "o" ],
      previousKey: [ "pk", "pl", "pm", "pn", "po" ],
      previousValue: [ "pv", "pw", "px", "py", "pz" ],
      value: [ "v", "w", "x", "y", "z" ]
    },
    {
      keyListLikeNamePattern: defaultKeyListLikeNamePattern.source,
      exceptions: [ "_", "__" ]
    }
  ],
  create(context, [ options, { keyListLikeNamePattern: keyListLikeNamePatternString, exceptions } ]){
    if(!keyListLikeNamePatternString) throw Error(`Unhandled keyListLikeNamePatternString: ${keyListLikeNamePatternString}`);
    const keyListLikeNamePattern = new RegExp(keyListLikeNamePatternString);
    const sourceCode = context.getSourceCode();

    const getIterativeStatementParameters = (node:Node) => {
      let name:string;
      let list:Array<Identifier|ArrayPattern>;
      let calleeObject:Expression|undefined = undefined;
      let keyish = false;

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
          const leftNode = node.left.declarations[0];
          if(leftNode.id.type !== AST_NODE_TYPES.Identifier && leftNode.id.type !== AST_NODE_TYPES.ArrayPattern){
            return null;
          }
          name = node.type === AST_NODE_TYPES.ForInStatement ? "forIn" : "forOf";
          if(name === "forOf"){
            if(isKeyListLikeName(node.right)){
              keyish = true;
            }else{
              const iteratorType = getTSTypeByNode(context, leftNode);

              if(iteratorType.isUnion() && iteratorType.types.every(v => v.isStringLiteral())){
                keyish = true;
              }
            }
          }
          list = [ leftNode.id ];
          calleeObject = node.right;
        } break;
        default: return null;
      }
      return { name, keyish, list, calleeObject };
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
      if(!node.arguments[0].params.every(v => v.type === AST_NODE_TYPES.Identifier
        || v.type === AST_NODE_TYPES.ArrayPattern
        || v.type === AST_NODE_TYPES.ObjectPattern
      )){
        return null;
      }
      if(!getTSTypeByNode(context, node.callee.object).getNumberIndexType()){
        return null;
      }
      if(!iterativeMethods.includes(node.callee.property.name)){
        return null;
      }
      return {
        name: node.callee.property.name,
        keyish: isKeyListLikeName(node.callee.object),
        calleeObject: node.callee.object,
        list: node.arguments[0].params as Array<Identifier|ArrayPattern>
      };
    };
    const getCurrentDepth = (me:Node) => {
      const ancestors = context.getAncestors();
      let R = 0;

      for(let i = 0; i < ancestors.length; i++){
        const v = ancestors[i];

        switch(v.type){
          case AST_NODE_TYPES.CallExpression:
            if(v.callee === (ancestors[i + 1] || me)){
              continue;
            }
            if(!getIterativeMethodParameters(v)){
              continue;
            }
            R++;
            break;
          case AST_NODE_TYPES.WhileStatement:
          case AST_NODE_TYPES.DoWhileStatement:
            if(v.test === (ancestors[i + 1] || me)){
              continue;
            }
          case AST_NODE_TYPES.ForStatement:
          case AST_NODE_TYPES.ForInStatement:
          case AST_NODE_TYPES.ForOfStatement:
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
    const checkParameterNames = (kind:(typeof kindTable)[string], parameters:Array<Identifier|ArrayPattern|ObjectPattern>, depth:number) => {
      const max = Math.min(kind.length, parameters.length);

      for(let i = 0; i < max; i++){
        const parameter = parameters[i];

        switch(parameter.type){
          case AST_NODE_TYPES.ObjectPattern:
            continue;
          case AST_NODE_TYPES.ArrayPattern:
            if(kind[i] !== "entry"){
              continue;
            }
            if(parameter.elements[0]?.type !== AST_NODE_TYPES.Identifier){
              continue;
            }
            if(parameter.elements[1]?.type !== AST_NODE_TYPES.Identifier){
              continue;
            }
            if(getActualName(parameter.elements[0].name) === options.key![depth] && getActualName(parameter.elements[1].name) === options.value![depth]){
              continue;
            }
            context.report({
              node: parameter,
              messageId: "default",
              data: {
                index: "Destructured",
                depth: toOrdinal(depth + 1),
                kind: kind[i],
                criterion: `[ ${options.key![depth]}, ${options.value![depth]} ]`
              }
            });
            break;
          default: {
            const criterion = options[kind[i]]![depth];
            if(!criterion){
              continue;
            }
            if(exceptions!.includes(parameter.name)){
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
      }
    };
    const isStaticObjectCall = (node:Expression|undefined, name:string):boolean => {
      if(node?.type !== AST_NODE_TYPES.CallExpression){
        return false;
      }
      if(sourceCode.getText(node.callee) !== `Object.${name}`){
        return false;
      }
      return true;
    };
    const isKeyListLikeName = (node:Node):boolean => {
      switch(node.type){
        case AST_NODE_TYPES.Identifier: return keyListLikeNamePattern.test(node.name);
        case AST_NODE_TYPES.CallExpression:
          if(isStaticObjectCall(node, "keys")) return true;
          return node.callee.type === AST_NODE_TYPES.MemberExpression && isKeyListLikeName(node.callee.object);
      }
      return false;
    };

    useTypeChecker(context);

    return {
      CallExpression: node => {
        const parameters = getIterativeMethodParameters(node);
        if(!parameters){
          return;
        }
        const depth = getCurrentDepth(node);

        if(isStaticObjectCall(parameters.calleeObject, "entries")){
          checkParameterNames(resolveKindTable(parameters.name === "reduce" ? 'entriesReduce' : 'entries', parameters.keyish), parameters.list, depth);
        }else{
          checkParameterNames(resolveKindTable(parameters.name, parameters.keyish), parameters.list, depth);
        }
      },
      'ForStatement, ForInStatement, ForOfStatement': node => {
        const parameters = getIterativeStatementParameters(node);
        if(!parameters){
          return;
        }
        const depth = getCurrentDepth(node);

        if(parameters.calleeObject && isStaticObjectCall(parameters.calleeObject, "entries")){
          checkParameterNames(resolveKindTable('entries', parameters.keyish), parameters.list, depth);
        }else{
          checkParameterNames(resolveKindTable(parameters.name, parameters.keyish), parameters.list, depth);
        }
      }
    };
  }
});
function resolveKindTable(key:string, keyish:boolean):(typeof kindTable)[string]{
  let R = [ ...kindTable[key] ];

  if(keyish){
    R = R.map(v => {
      switch(v){
        case "value": return "key";
        case "previousValue": return "previousKey";
      }
      return v;
    });
  }
  return R;
}