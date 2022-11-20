import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type { Node } from "@typescript-eslint/types/dist/generated/ast-spec";

import { hasEmptyLineBefore } from "../utils/code";

const staticBlock = Symbol("static block");
const indexSignature = Symbol("index signature");
const enum ScoreValue{
  STATIC = 1000,

  PROPERTY = 240,
  GETTER = 230,
  SETTER = 220,
  INDEX_SIGNATURE = 210,

  CONSTRUCTOR = 140,
  ARROW_FUNCTION = 130,
  METHOD = 120,
  STATIC_BLOCK = 110,

  IMPLICITLY_PUBLIC = 4,
  PUBLIC = 3,
  PROTECTED = 2,
  PRIVATE = 1
}

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "whitespace",
    messages: {
      'interorder': "`{{target}}` node should appear prior to any `{{base}}` node.",
      'empty-line': "One empty line should appear between `{{base}}` and `{{target}}`.",
      'no-literal-member': "Name of a class member cannot be a string literal."
    },
    schema: []
  },
  defaultOptions: [],
  create(context){
    const sourceCode = context.getSourceCode();

    const checkElements = (list:Node[], checkEmptyLine?:boolean) => {
      const orderTable = getDefinitionOrderTable(list);
      let prevScore:number|undefined;

      for(const v of list){
        const key = getDefinitionIdentifier(v);
        if(!key) continue;
        const score = orderTable[key];

        if(prevScore !== undefined){
          if(prevScore < score){
            context.report({
              node: v,
              messageId: "interorder",
              data: { target: getScoreString(score), base: getScoreString(prevScore) }
            });
          }else if(checkEmptyLine && Math.floor(0.01 * prevScore) - Math.floor(0.01 * score) > 0){
            if(!hasEmptyLineBefore(sourceCode, v)){
              context.report({
                node: v,
                messageId: "empty-line",
                data: { target: getScoreString(score), base: getScoreString(prevScore) },
                *fix(fixer){
                  yield fixer.insertTextBefore(v, "\n");
                }
              });
            }
          }
        }
        prevScore = score;
      }
    };

    return {
      ClassBody: node => {
        checkElements(node.body, true);
      },
      TSTypeLiteral: node => {
        checkElements(node.members);
      },
      TSInterfaceDeclaration: node => {
        checkElements(node.body.body, true);
      }
    };
  }
});
function getDefinitionOrderTable(items:Node[]):Record<string|symbol, number>{
  const R:Record<string|symbol, number> = {};

  for(const v of items){
    const key = getDefinitionIdentifier(v);
    if(!key) continue;
    R[key] = getScore(v);
  }
  return R;
}
function getDefinitionIdentifier(item:Node):string|symbol|null{
  switch(item.type){
    case AST_NODE_TYPES.PropertyDefinition:
    case AST_NODE_TYPES.MethodDefinition:
    case AST_NODE_TYPES.TSPropertySignature:
    case AST_NODE_TYPES.TSMethodSignature:
      if(item.key.type === AST_NODE_TYPES.Identifier){
        return item.key.name;
      }
      if(item.key.type === AST_NODE_TYPES.Literal){
        return String(item.key.value);
      }
      return null;
    case AST_NODE_TYPES.StaticBlock:
      return staticBlock;
    case AST_NODE_TYPES.TSIndexSignature:
      return indexSignature;
  }
  return null;
}
// NOTE Node with higher score should appear first
function getScore(node:Node):number{
  let R = 0;

  if('static' in node && node.static) R += ScoreValue.STATIC;
  switch(node.type){
    case AST_NODE_TYPES.MethodDefinition:
    case AST_NODE_TYPES.TSMethodSignature:
      switch(node.kind){
        case "get": R += ScoreValue.GETTER; break;
        case "set": R += ScoreValue.SETTER; break;
        case "constructor": R += ScoreValue.CONSTRUCTOR; break;
        default: R += ScoreValue.METHOD;
      }
      break;
    case AST_NODE_TYPES.PropertyDefinition:
      if(node.value?.type === AST_NODE_TYPES.ArrowFunctionExpression) R += ScoreValue.ARROW_FUNCTION;
      else R += ScoreValue.PROPERTY;
      break;
    case AST_NODE_TYPES.TSPropertySignature:
      if(node.typeAnnotation?.typeAnnotation.type === AST_NODE_TYPES.TSFunctionType) R += ScoreValue.ARROW_FUNCTION;
      else R += ScoreValue.PROPERTY;
      break;
    case AST_NODE_TYPES.StaticBlock:
      R += ScoreValue.STATIC + ScoreValue.STATIC_BLOCK;
      break;
    case AST_NODE_TYPES.TSIndexSignature:
      R += ScoreValue.INDEX_SIGNATURE;
      break;
  }
  if('accessibility' in node) switch(node.accessibility){
    case "public": R += ScoreValue.PUBLIC; break;
    case "protected": R += ScoreValue.PROTECTED; break;
    case "private": R += ScoreValue.PRIVATE; break;
  }else R += ScoreValue.IMPLICITLY_PUBLIC;

  return R;
}
function getScoreString(score:number):string{
  const R:string[] = [];
  let rest = score;

  switch(rest % 10){
    case ScoreValue.IMPLICITLY_PUBLIC: rest -= ScoreValue.IMPLICITLY_PUBLIC; break;
    case ScoreValue.PUBLIC: rest -= ScoreValue.PUBLIC; R.push("public"); break;
    case ScoreValue.PROTECTED: rest -= ScoreValue.PROTECTED; R.push("protected"); break;
    case ScoreValue.PRIVATE: rest -= ScoreValue.PRIVATE; R.push("private"); break;
  }
  if(rest >= ScoreValue.STATIC){
    rest -= ScoreValue.STATIC;
    R.push("static");
  }
  switch(rest){
    case ScoreValue.PROPERTY: rest -= ScoreValue.PROPERTY; R.push("property"); break;
    case ScoreValue.GETTER: rest -= ScoreValue.GETTER; R.push("getter"); break;
    case ScoreValue.SETTER: rest -= ScoreValue.SETTER; R.push("setter"); break;
    case ScoreValue.INDEX_SIGNATURE: rest -= ScoreValue.INDEX_SIGNATURE; R.push("index signature"); break;
    case ScoreValue.CONSTRUCTOR: rest -= ScoreValue.CONSTRUCTOR; R.push("constructor"); break;
    case ScoreValue.ARROW_FUNCTION: rest -= ScoreValue.ARROW_FUNCTION; R.push("arrow function"); break;
    case ScoreValue.METHOD: rest -= ScoreValue.METHOD; R.push("method"); break;
    case ScoreValue.STATIC_BLOCK: rest -= ScoreValue.STATIC_BLOCK; R.push("static block"); break;
  }
  if(rest){
    throw Error(`Unhandled rest: ${rest}`);
  }
  R[0] = R[0][0].toUpperCase() + R[0].slice(1);

  return R.join(' ');
}