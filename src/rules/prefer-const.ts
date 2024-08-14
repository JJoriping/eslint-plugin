import type { Variable } from "@typescript-eslint/scope-manager";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

type Scope = ReturnType<RuleContext<string, never[]>['getScope']>;

export default ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    fixable: "code",
    messages: {
      'default': "`{{name}}` can be a constant."
    },
    schema: []
  },
  defaultOptions: [],
  create(context){
    const sourceCode = context.getSourceCode();
    const reassignedIdentifierTable:Record<string, true> = {};
    const getKey = ({ scope, name }:Variable) => `${scope.block.range[0]},${scope.block.range[1]}/${name}`;

    return {
      Program: node => {
        const variables = getReassignedVariables(sourceCode.getScope(node));

        for(const v of variables){
          reassignedIdentifierTable[getKey(v)] = true;
        }
      },
      VariableDeclaration: node => {
        if(node.kind !== "let"){
          return;
        }
        const scope = sourceCode.getScope(node);
        const kindToken = sourceCode.getFirstToken(node)!;

        for(const v of node.declarations){
          if(v.id.type !== AST_NODE_TYPES.Identifier) continue;
          const variable = scope.set.get(v.id.name);
          if(variable && reassignedIdentifierTable[getKey(variable)]) continue;

          context.report({
            node: v,
            messageId: "default",
            data: { name: v.id.name },
            *fix(fixer){
              yield fixer.replaceText(kindToken, "const");
            }
          });
        }
      }
    };
  }
});
function getReassignedVariables(scope:Scope, parentSet:Record<string, Variable> = {}):Variable[]{
  const R:Variable[] = [];
  const set = { ...parentSet, ...Object.fromEntries(scope.set.entries()) };

  for(const v of scope.references){
    if(v.from !== scope) continue;
    if(v.identifier.parent?.type === AST_NODE_TYPES.VariableDeclarator) continue;
    if(!v.isWrite()) continue;
    const variable = set[v.identifier.name];
    if(!variable) continue;
    R.push(variable);
  }
  for(const v of scope.childScopes){
    R.push(...getReassignedVariables(v, set));
  }
  return R;
}