import type { CallExpression, NewExpression, Node } from "@typescript-eslint/types/dist/generated/ast-spec";
import { ESLintUtils } from "@typescript-eslint/utils";
import type { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";
import { Symbol, Type } from "typescript";

export type Context = Readonly<RuleContext<string, unknown[]>>;
export type MessageIdOf<C extends Context> = C extends Readonly<RuleContext<infer R, unknown[]>>
  ? R
  : string
;

export function useTypeChecker(context:Context){
  context.settings.service = ESLintUtils.getParserServices(context);
  context.settings.typeChecker = context.settings.service.program.getTypeChecker();

  return { service: context.settings.service, typeChecker: context.settings.typeChecker };
}
export function getTSTypeByNode(context:Context, target:Node):Type{
  const { service, typeChecker } = context.settings;
  const tsNode = service.esTreeNodeToTSNodeMap.get(target);
  const type = typeChecker.getTypeAtLocation(tsNode);

  return type;
}
export function getTSSymbolByNode(context:Context, target:Node):Symbol|undefined{
  const { service, typeChecker } = context.settings;
  const tsNode = service.esTreeNodeToTSNodeMap.get(target);
  const symbol = typeChecker.getSymbolAtLocation(tsNode);

  return symbol;
}
export function getTSTypeBySymbol(context:Context, target:Symbol, location:Node):Type{
  const { service, typeChecker } = context.settings;
  const tsNode = service.esTreeNodeToTSNodeMap.get(location);
  const type = typeChecker.getTypeOfSymbolAtLocation(target, tsNode);

  if((type as any)['intrinsicName'] === "error"){
    throw Error(`Unexpected intrinsicName from the target: ${target.name}`);
  }
  return type;
}
export function getFunctionParameters(
  context:Context,
  callLikeExpression:CallExpression|NewExpression
):readonly Symbol[]|null{
  const { service, typeChecker } = context.settings;
  const tsNode = service.esTreeNodeToTSNodeMap.get(callLikeExpression);
  const signature = typeChecker.getResolvedSignature(tsNode);

  if(!signature) return null;
  return signature.parameters;
}
export function getObjectProperties(context:Context, node:Node):readonly Symbol[]{
  return getTSTypeByNode(context, node).getProperties();
}