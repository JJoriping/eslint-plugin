import type { Expression, TSPropertySignature, Property } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import { MessageIdOf } from "../utils/type";

const simpleNamePattern = /^\w+$/;

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "code",
    messages: {
      'for-type-alias': "Simple key name in a type alias should be quoted with `{{quotation}}`.",
      'for-interface': "Simple key name in an interface should be quoted with `{{quotation}}`.",
      'for-object': "Simple key name in an object should be quoted with `{{quotation}}`."
    },
    schema: [{
      type: "object",
      properties: {
        typeAlias: { type: "string", enum: [ "none", "'", "\"" ] },
        object: { type: "string", enum: [ "none", "'", "\"" ] },
        interface: { type: "string", enum: [ "none", "'", "\"" ] }
      }
    }]
  },
  defaultOptions: [{
    forTypeAlias: "'",
    forObject: "none",
    forInterface: "none"
  }],
  create(context, [{ forTypeAlias, forObject, forInterface }]){
    const isSimple = (node:Expression) => {
      switch(node.type){
        case AST_NODE_TYPES.Identifier: return simpleNamePattern.test(node.name);
        case AST_NODE_TYPES.Literal: return typeof node.value === "string" && simpleNamePattern.test(node.value);
      }
      return false;
    };
    const getKeyQuotationStyle = (node:Expression) => {
      if(node.type === AST_NODE_TYPES.Identifier){
        if(!simpleNamePattern.test(node.name)){
          return null;
        }
        return { style: "none", name: node.name };
      }
      if(node.type === AST_NODE_TYPES.Literal && typeof node.value === "string"){
        if(!simpleNamePattern.test(node.value)){
          return null;
        }
        return { style: node.raw[0], name: node.value };
      }
      return null;
    };
    const checkMembers = (list:Array<TSPropertySignature|Property>, as:string, messageId:MessageIdOf<typeof context>) => {
      for(const v of list){
        if(v.computed){
          return;
        }
        const style = getKeyQuotationStyle(v.key);
        if(style === null){
          return;
        }
        if(style.style === as){
          return;
        }
        context.report({
          node: v.key,
          messageId,
          data: { quotation: as },
          *fix(fixer){
            yield fixer.replaceText(v.key, as + style.name + as);
          }
        });
      }
    };

    return {
      TSTypeLiteral: node => {
        const filteredMembers = node.members.filter((v):v is TSPropertySignature => v.type === AST_NODE_TYPES.TSPropertySignature);
        if(!filteredMembers.every(v => isSimple(v.key))){
          return;
        }
        checkMembers(filteredMembers, forTypeAlias, 'for-type-alias');
      },
      TSInterfaceBody: node => {
        const filteredMembers = node.body.filter((v):v is TSPropertySignature => v.type === AST_NODE_TYPES.TSPropertySignature);
        if(!filteredMembers.every(v => isSimple(v.key))){
          return;
        }
        checkMembers(filteredMembers, forInterface, 'for-interface');
      },
      ObjectExpression: node => {
        const filteredMembers = node.properties.filter((v):v is Property => v.type === AST_NODE_TYPES.Property);
        if(!filteredMembers.every(v => isSimple(v.key))){
          return;
        }
        checkMembers(filteredMembers, forObject, 'for-object');
      }
    };
  }
});