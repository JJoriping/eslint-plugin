import type { CallExpression, FunctionDeclaration, NewExpression, Node } from "@typescript-eslint/types/dist/generated/ast-spec";
import { ESLintUtils } from "@typescript-eslint/utils";
import type { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";
import type { Symbol, Type } from "typescript";

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
export function typeToString(context:Context, type:Type):string{
  return context.settings.typeChecker.typeToString(type);
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
export function getFunctionReturnType(context:Context, declaration:FunctionDeclaration):Type{
  const { service, typeChecker } = context.settings;
  const tsNode = service.esTreeNodeToTSNodeMap.get(declaration);
  const signature = typeChecker.getSignatureFromDeclaration(tsNode);

  if(!signature){
    throw Error(`No signature available from the declaration: ${declaration.id?.name}`);
  }
  return typeChecker.getReturnTypeOfSignature(signature);
}
export function getObjectProperties(context:Context, node:Node):readonly Symbol[]{
  return getTSTypeByNode(context, node).getProperties();
}

export function isDOMReturningFunction(context:Context, type:Type, domTypePatterns:RegExp[]):boolean{
  const callSignatures = type.getCallSignatures();
  if(!callSignatures.length) return false;
  const returnType = context.settings.typeChecker.getReturnTypeOfSignature(callSignatures[0]).getNonNullableType();
  const actualReturnTypes = returnType.isUnion() ? returnType.types : [ returnType ];

  return actualReturnTypes.some(v => {
    const returnTypeSymbol = v.getSymbol();
    if(!returnTypeSymbol) return false;
    const returnTypeName = context.settings.typeChecker.getFullyQualifiedName(returnTypeSymbol);
    return domTypePatterns.some(w => w.test(returnTypeName));
  });
}
export function isRestParameter(context:Context, symbol:Symbol):boolean{
  const { typeChecker } = context.settings;
  const parameterDeclaration = typeChecker.symbolToParameterDeclaration(symbol, undefined, undefined);

  return Boolean(parameterDeclaration?.dotDotDotToken);
}