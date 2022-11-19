import type { Node, Comment } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";

import { getIndentation } from "../utils/code";

type SortTargetNode = Node&{
  'type': AST_NODE_TYPES.Property
    | AST_NODE_TYPES.PropertyDefinition
    | AST_NODE_TYPES.MethodDefinition
    | AST_NODE_TYPES.TSPropertySignature
    | AST_NODE_TYPES.TSMethodSignature
  ,
  'key': {
    'type': AST_NODE_TYPES.Identifier|AST_NODE_TYPES.Literal
  }
};

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    hasSuggestions: true,
    messages: {
      'default': "`{{current}}` should be prior to `{{prev}}`.",
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
    minPropertyCount: 5
  }],
  create(context, [{ minPropertyCount }]){
    const sourceCode = context.getSourceCode();

    const isSortTarget = (node:Node):node is SortTargetNode => {
      switch(node.type){
        case AST_NODE_TYPES.Property:
        case AST_NODE_TYPES.PropertyDefinition: case AST_NODE_TYPES.MethodDefinition:
        case AST_NODE_TYPES.TSPropertySignature: case AST_NODE_TYPES.TSMethodSignature:
          return node.key.type === AST_NODE_TYPES.Identifier || node.key.type === AST_NODE_TYPES.Literal;
      }
      return false;
    };
    const sortKeys = (node:Node) => {
      const R:string[] = [];
      const groups:string[][] = [];
      const indentation = getIndentation(sourceCode, node.loc.start.line) + "  ";
      let group:Array<[payload:string, comments:Comment[]]> = [];
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

        if(comments.length) groups.push(comments.map(v => sourceCode.getText(v)));
      }
      R.push(
        "{",
        groups.map(v => v.map(w => indentation + w).join('\n')).join('\n\n'),
        "}"
      );
      return R.join('\n');

      function runner(target:Node, nextToken:string):void{
        const comments = sourceCode.getCommentsBefore(target);

        lastNode = target;
        if(!isSortTarget(target)){
          group.push([ sourceCode.getText(target) + nextToken, comments ]);
          return;
        }
        const continued = prevLine !== undefined && prevLine + comments.length + 1 >= target.loc.start.line;

        if(!continued && group.length){
          flush();
        }
        group.push([ sourceCode.getText(target) + nextToken, comments ]);
        prevLine = target.loc.end.line;
      }
      function flush():void{
        groups.push(
          group.sort(([ a ], [ b ]) => compareString(a, b)).map(([ payload, comments ]) => {
            if(comments?.length){
              return `${comments.map(w => sourceCode.getText(w)).join('\n')}\n${indentation}${payload}`;
            }
            return payload;
          })
        );
        group = [];
      }
    };
    const checkProperties = (list:Node[]) => {
      let prevLine:number|undefined;
      let prevName:string|undefined;

      for(const v of list){
        if(!isSortTarget(v)){
          continue;
        }
        const name = v.key.type === AST_NODE_TYPES.Literal ? String(v.key.value) : v.key.name;
        const comments = sourceCode.getCommentsBefore(v);

        if(prevLine !== undefined && prevLine + comments.length + 1 >= v.loc.start.line){
          if(prevName!.localeCompare(name, undefined, { numeric: true }) > 0){
            const parent = v.parent;

            if(parent){
              const hasNontarget = list.some(w => !isSortTarget(w))
                || sourceCode.getCommentsInside(parent).length > 0
              ;
              context.report({
                node: v,
                messageId: "default",
                data: { prev: prevName, current: name },
                suggest: [{
                  messageId: hasNontarget ? "default/suggest/1" : "default/suggest/0",
                  data: { length: list.length },
                  *fix(fixer){
                    yield fixer.replaceText(parent, sortKeys(parent));
                  }
                }]
              });
            }
          }
        }
        prevLine = v.loc.end.line;
        prevName = name;
      }
    };

    return {
      ClassBody: node => {
        if(node.body.length < minPropertyCount){
          return;
        }
        checkProperties(node.body);
      },
      TSTypeLiteral: node => {
        if(node.members.length < minPropertyCount){
          return;
        }
        checkProperties(node.members);
      },
      TSInterfaceBody: node => {
        if(node.body.length < minPropertyCount){
          return;
        }
        checkProperties(node.body);
      },
      ObjectExpression: node => {
        if(node.properties.length < minPropertyCount){
          return;
        }
        checkProperties(node.properties);
      }
    };
  }
});
function compareString(a:string, b:string):number{
  return a.localeCompare(b, undefined, { numeric: true });
}