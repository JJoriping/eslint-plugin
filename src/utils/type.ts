import type { Node, CallExpression, NewExpression } from "@typescript-eslint/types/dist/generated/ast-spec";
import { ESLintUtils } from "@typescript-eslint/utils";
import type { RuleContext, SharedConfigurationSettings } from "@typescript-eslint/utils/dist/ts-eslint";
import type { Type, Symbol } from "typescript";

export type Context = Readonly<RuleContext<string, unknown[]>>;
export type MessageIdOf<C extends Context> = C extends Readonly<RuleContext<infer R, unknown[]>>
  ? R
  : string
;
type Settings = Required<SharedConfigurationSettings>;

export function useTypeChecker(context:Context){
  context.settings.service = ESLintUtils.getParserServices(context);
  context.settings.typeChecker = context.settings.service.program.getTypeChecker();

  return { service: context.settings.service, typeChecker: context.settings.typeChecker };
}
export function getTSTypeByNode(context:Context, target:Node):Type{
  const { service, typeChecker } = context.settings as Settings;
  const tsNode = service.esTreeNodeToTSNodeMap.get(target);
  const type = typeChecker.getTypeAtLocation(tsNode);

  return type;
}
export function getTSTypeBySymbol(context:Context, target:Symbol):Type{
  const { typeChecker } = context.settings as Settings;
  const type = typeChecker.getDeclaredTypeOfSymbol(target);

  return type;
}
export function getFunctionParameters(
  context:Context,
  callLikeExpression:CallExpression|NewExpression
):readonly Symbol[]|null{
  const { service, typeChecker } = context.settings as Settings;
  const tsNode = service.esTreeNodeToTSNodeMap.get(callLikeExpression);
  const signature = typeChecker.getResolvedSignature(tsNode);

  if(!signature) return null;
  return signature.parameters;
}