import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type { Node, Comment } from "@typescript-eslint/types/dist/generated/ast-spec";
import type { ReportSuggestionArray } from "@typescript-eslint/utils/dist/ts-eslint";
import { getIndentation, hasEmptyLineBefore } from "../utils/code";
import type { MessageIdOf } from "../utils/type";
import { INDENTATION_UNIT } from "../utils/text";

const staticBlock = Symbol("static block");
const indexSignature = Symbol("index signature");
const enum ScoreValue{
  STATIC = 1000,

  PROPERTY = 230,
  GETTER_SETTER = 220,
  INDEX_SIGNATURE = 210,

  CONSTRUCTOR = 140,
  ARROW_FUNCTION = 130,
  METHOD = 120,
  STATIC_BLOCK = 110,

  READONLY = 5,
  IMPLICITLY_PUBLIC = 4,
  PUBLIC = 3,
  PROTECTED = 2,
  PRIVATE = 1
}

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    fixable: "whitespace",
    hasSuggestions: true,
    type: "layout",

    messages: {
      'empty-line': "One empty line should appear between `{{base}}` and `{{target}}`.",
      'interorder': "`{{target}}` node should appear prior to any `{{base}}` node.",
      'intraorder': "`{{target}}` should appear prior to `{{base}}`.",
      'no-literal-member': "Name of a class member cannot be a string literal.",

      'default/suggest/0': "Sort {{length}} keys",
      'default/suggest/1': "Sort {{length}} keys (⚠️ Be aware of spreads and comments!)"
    },
    schema: [{
      type: "object",
      properties: {
        minPropertyCount: { type: "integer" }
      }
    }]
  },
  defaultOptions: [{
    minPropertyCount: 10
  }],
  create(context, [{ minPropertyCount }]){
    const sourceCode = context.getSourceCode();

    const checkElements = (list:Node[], checkEmptyLine?:boolean) => {
      if(list.length < minPropertyCount){
        return;
      }
      const orderTable = getDefinitionOrderTable(list);
      let prevLine:number|undefined;
      let prevScore:number|undefined;
      let prevKey:string|undefined;

      for(const v of list){
        if(!v.parent) continue;
        const key = getDefinitionIdentifier(v);
        if(!key) continue;
        const score = orderTable[key];

        if(prevScore !== undefined){
          if(prevScore < score){
            context.report({
              node: v,
              messageId: "interorder",
              data: { target: getScoreString(score), base: getScoreString(prevScore) },
              suggest: suggest(list.length, v.parent)
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
        if(typeof key !== "symbol"){
          const comments = sourceCode.getCommentsBefore(v);
          const isGroupHead = prevLine === undefined || prevLine + comments.length + 1 < v.loc.start.line;

          if(prevKey && !isGroupHead && prevScore === score && compareString(prevKey, key) > 0){
            context.report({
              node: v,
              messageId: "intraorder",
              data: { target: key, base: prevKey },
              suggest: suggest(list.length, v.parent)
            });
          }
          prevKey = key;
        }
        prevLine = v.loc.end.line;
        prevScore = score;
      }
      function suggest(
        length:number,
        parent:Node
      ):Readonly<ReportSuggestionArray<MessageIdOf<typeof context>>>{
        const hasNontarget = list.some(v => !getDefinitionIdentifier(v))
          || sourceCode.getCommentsInside(parent).length > 0
        ;
        return [{
          messageId: hasNontarget ? "default/suggest/1" : "default/suggest/0",
          data: { length },
          *fix(fixer){
            yield fixer.replaceText(parent, sortKeys(parent));
          }
        }];
      }
    };
    const sortKeys = (node:Node) => {
      const R:string[] = [];
      const groups:Array<[minScore:number, payload:string[]]> = [];
      const indentation = getIndentation(sourceCode, node.loc.start.line) + INDENTATION_UNIT;
      let group:Array<[score:number, keyName:string, payload:string, comments:Comment[]]> = [];
      let lastNode:Node|undefined;
      let prevLine:number|undefined;

      switch(node.type){
        case AST_NODE_TYPES.ObjectExpression:
          for(const v of node.properties) runner(v, ",");
          break;
        case AST_NODE_TYPES.TSTypeLiteral:
          for(const v of node.members) runner(v, "");
          break;
        case AST_NODE_TYPES.ClassBody:
        case AST_NODE_TYPES.TSInterfaceBody:
          for(const v of node.body) runner(v, "");
          break;
      }
      if(group.length) flush();
      if(lastNode){
        const comments = sourceCode.getCommentsAfter(lastNode);

        if(comments.length) groups.push([ 0, comments.map(v => sourceCode.getText(v)) ]);
      }
      groups.sort(([ a ], [ b ]) => b - a);
      R.push(
        "{",
        groups.map(([ , v ]) => v.map(w => indentation + w).join('\n')).join('\n\n'),
        "}"
      );
      return R.join('\n');

      function runner(target:Node, nextToken:string):void{
        const comments = sourceCode.getCommentsBefore(target);

        lastNode = target;
        if(!getDefinitionIdentifier(target) || !('key' in target)){
          const payload = sourceCode.getText(target) + nextToken;

          group.push([ (group.at(-1)?.[0] ?? 0) + 0.001, payload, payload, comments ]);
          return;
        }
        const continued = prevLine !== undefined && prevLine + comments.length + 1 >= target.loc.start.line;

        if(!continued && group.length){
          flush();
        }
        group.push([ getScore(target), unescape(sourceCode.getText(target.key)), sourceCode.getText(target) + nextToken, comments ]);
        prevLine = target.loc.end.line;
      }
      function flush():void{
        const sortedGroup = group
          .sort(([ aScore, aKey ], [ bScore, bKey ]) => bScore - aScore || compareString(aKey, bKey))
        ;
        groups.push([
          sortedGroup[0][0],
          sortedGroup.map(([ ,, payload, comments ]) => {
            if(comments?.length){
              return `${comments.map(w => sourceCode.getText(w)).join('\n')}\n${indentation}${payload}`;
            }
            return payload;
          })
        ]);
        group = [];
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
      },
      ObjectExpression: node => {
        checkElements(node.properties);
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
    case AST_NODE_TYPES.Property:
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
  let accessModifierScore:number;
  let invertedAccessModifierOrder = false;

  if('static' in node && node.static) R += ScoreValue.STATIC;
  switch(node.type){
    case AST_NODE_TYPES.MethodDefinition:
    case AST_NODE_TYPES.TSMethodSignature:
      switch(node.kind){
        case "get": case "set": R += ScoreValue.GETTER_SETTER; break;
        case "constructor": R += ScoreValue.CONSTRUCTOR; break;
        default:
          invertedAccessModifierOrder = node.static ? false : true;
          R += ScoreValue.METHOD;
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
    case "public": accessModifierScore = ScoreValue.PUBLIC; break;
    case "protected": accessModifierScore = ScoreValue.PROTECTED; break;
    case "private": accessModifierScore = ScoreValue.PRIVATE; break;
    default: throw Error(`Unhandled accessibility: ${node.accessibility}`);
  }else accessModifierScore = ScoreValue.IMPLICITLY_PUBLIC;
  if(invertedAccessModifierOrder){
    R += 5 - accessModifierScore;
  }else{
    R += accessModifierScore;
  }
  if('readonly' in node && node.readonly){
    R += ScoreValue.READONLY;
  }
  return R;
}
function getScoreString(score:number):string{
  const R:string[] = [];
  let rest = score;
  let accessModifierScore = rest % 10;

  rest -= accessModifierScore;
  if(rest >= ScoreValue.STATIC){
    rest -= ScoreValue.STATIC;
    R.push("static");
  }
  switch(rest){
    case ScoreValue.PROPERTY: rest -= ScoreValue.PROPERTY; R.push("property"); break;
    case ScoreValue.GETTER_SETTER: rest -= ScoreValue.GETTER_SETTER; R.push("getter or setter"); break;
    case ScoreValue.INDEX_SIGNATURE: rest -= ScoreValue.INDEX_SIGNATURE; R.push("index signature"); break;
    case ScoreValue.CONSTRUCTOR: rest -= ScoreValue.CONSTRUCTOR; R.push("constructor"); break;
    case ScoreValue.ARROW_FUNCTION: rest -= ScoreValue.ARROW_FUNCTION; R.push("arrow function"); break;
    case ScoreValue.METHOD: rest -= ScoreValue.METHOD; R.push("method"); break;
    case ScoreValue.STATIC_BLOCK: rest -= ScoreValue.STATIC_BLOCK; R.push("static block"); break;
  }
  if(accessModifierScore >= ScoreValue.READONLY){
    accessModifierScore -= ScoreValue.READONLY;
    R.push("readonly");
  }
  if(R.join(' ').startsWith("static method")){
    accessModifierScore = 5 - accessModifierScore;
  }
  switch(accessModifierScore){
    case ScoreValue.IMPLICITLY_PUBLIC: break;
    case ScoreValue.PUBLIC: R.push("public"); break;
    case ScoreValue.PROTECTED: R.push("protected"); break;
    case ScoreValue.PRIVATE: R.push("private"); break;
  }
  if(rest){
    throw Error(`Unhandled rest: ${rest}`);
  }
  R[0] = R[0][0].toUpperCase() + R[0].slice(1);

  return R.join(' ');
}
function compareString(a:string, b:string):number{
  return a.localeCompare(b, undefined, { numeric: true });
}
function unescape(text:string):string{
  return text.replace(/^'"|'"$/g, "");
}