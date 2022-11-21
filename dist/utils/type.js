"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReactComponent = exports.getObjectProperties = exports.getFunctionReturnType = exports.getFunctionParameters = exports.typeToString = exports.getTSTypeBySymbol = exports.getTSSymbolByNode = exports.getTSTypeByNode = exports.useTypeChecker = void 0;
var utils_1 = require("@typescript-eslint/utils");
function useTypeChecker(context) {
    context.settings.service = utils_1.ESLintUtils.getParserServices(context);
    context.settings.typeChecker = context.settings.service.program.getTypeChecker();
    return { service: context.settings.service, typeChecker: context.settings.typeChecker };
}
exports.useTypeChecker = useTypeChecker;
function getTSTypeByNode(context, target) {
    var _a = context.settings, service = _a.service, typeChecker = _a.typeChecker;
    var tsNode = service.esTreeNodeToTSNodeMap.get(target);
    var type = typeChecker.getTypeAtLocation(tsNode);
    return type;
}
exports.getTSTypeByNode = getTSTypeByNode;
function getTSSymbolByNode(context, target) {
    var _a = context.settings, service = _a.service, typeChecker = _a.typeChecker;
    var tsNode = service.esTreeNodeToTSNodeMap.get(target);
    var symbol = typeChecker.getSymbolAtLocation(tsNode);
    return symbol;
}
exports.getTSSymbolByNode = getTSSymbolByNode;
function getTSTypeBySymbol(context, target, location) {
    var _a = context.settings, service = _a.service, typeChecker = _a.typeChecker;
    var tsNode = service.esTreeNodeToTSNodeMap.get(location);
    var type = typeChecker.getTypeOfSymbolAtLocation(target, tsNode);
    if (type['intrinsicName'] === "error") {
        throw Error("Unexpected intrinsicName from the target: ".concat(target.name));
    }
    return type;
}
exports.getTSTypeBySymbol = getTSTypeBySymbol;
function typeToString(context, type) {
    return context.settings.typeChecker.typeToString(type);
}
exports.typeToString = typeToString;
function getFunctionParameters(context, callLikeExpression) {
    var _a = context.settings, service = _a.service, typeChecker = _a.typeChecker;
    var tsNode = service.esTreeNodeToTSNodeMap.get(callLikeExpression);
    var signature = typeChecker.getResolvedSignature(tsNode);
    if (!signature)
        return null;
    return signature.parameters;
}
exports.getFunctionParameters = getFunctionParameters;
function getFunctionReturnType(context, declaration) {
    var _a;
    var _b = context.settings, service = _b.service, typeChecker = _b.typeChecker;
    var tsNode = service.esTreeNodeToTSNodeMap.get(declaration);
    var signature = typeChecker.getSignatureFromDeclaration(tsNode);
    if (!signature) {
        throw Error("No signature available from the declaration: ".concat((_a = declaration.id) === null || _a === void 0 ? void 0 : _a.name));
    }
    return typeChecker.getReturnTypeOfSignature(signature);
}
exports.getFunctionReturnType = getFunctionReturnType;
function getObjectProperties(context, node) {
    return getTSTypeByNode(context, node).getProperties();
}
exports.getObjectProperties = getObjectProperties;
function isReactComponent(context, type) {
    var callSignatures = type.getCallSignatures();
    if (!callSignatures.length)
        return false;
    var returnType = context.settings.typeChecker.getReturnTypeOfSignature(callSignatures[0]).getNonNullableType();
    var returnTypeSymbol = returnType.getSymbol();
    if (!returnTypeSymbol)
        return false;
    var returnTypeName = context.settings.typeChecker.getFullyQualifiedName(returnTypeSymbol);
    return returnTypeName === "React.ReactElement";
}
exports.isReactComponent = isReactComponent;
