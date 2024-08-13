"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTypeChecker = useTypeChecker;
exports.getTSTypeByNode = getTSTypeByNode;
exports.getTSSymbolByNode = getTSSymbolByNode;
exports.getTSTypeBySymbol = getTSTypeBySymbol;
exports.typeToString = typeToString;
exports.getFunctionParameters = getFunctionParameters;
exports.getFunctionReturnType = getFunctionReturnType;
exports.getObjectProperties = getObjectProperties;
exports.isDOMReturningFunction = isDOMReturningFunction;
exports.isRestParameter = isRestParameter;
var utils_1 = require("@typescript-eslint/utils");
function useTypeChecker(context) {
    context.settings.service = utils_1.ESLintUtils.getParserServices(context);
    context.settings.typeChecker = context.settings.service.program.getTypeChecker();
    return { service: context.settings.service, typeChecker: context.settings.typeChecker };
}
function getTSTypeByNode(context, target) {
    var _a = context.settings, service = _a.service, typeChecker = _a.typeChecker;
    var tsNode = service.esTreeNodeToTSNodeMap.get(target);
    var type = typeChecker.getTypeAtLocation(tsNode);
    return type;
}
function getTSSymbolByNode(context, target) {
    var _a = context.settings, service = _a.service, typeChecker = _a.typeChecker;
    var tsNode = service.esTreeNodeToTSNodeMap.get(target);
    var symbol = typeChecker.getSymbolAtLocation(tsNode);
    return symbol;
}
function getTSTypeBySymbol(context, target, location) {
    var _a = context.settings, service = _a.service, typeChecker = _a.typeChecker;
    var tsNode = service.esTreeNodeToTSNodeMap.get(location);
    var type = typeChecker.getTypeOfSymbolAtLocation(target, tsNode);
    if (type['intrinsicName'] === "error") {
        throw Error("Unexpected intrinsicName from the target: ".concat(target.name));
    }
    return type;
}
function typeToString(context, type) {
    return context.settings.typeChecker.typeToString(type);
}
function getFunctionParameters(context, callLikeExpression) {
    var _a = context.settings, service = _a.service, typeChecker = _a.typeChecker;
    var tsNode = service.esTreeNodeToTSNodeMap.get(callLikeExpression);
    var signature = typeChecker.getResolvedSignature(tsNode);
    if (!signature)
        return null;
    return signature.parameters;
}
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
function getObjectProperties(context, node) {
    return getTSTypeByNode(context, node).getProperties();
}
function isDOMReturningFunction(context, type, domTypePatterns) {
    var callSignatures = type.getCallSignatures();
    if (!callSignatures.length)
        return false;
    var returnType = context.settings.typeChecker.getReturnTypeOfSignature(callSignatures[0]).getNonNullableType();
    var actualReturnTypes = returnType.isUnion() ? returnType.types : [returnType];
    return actualReturnTypes.some(function (v) {
        var returnTypeSymbol = v.getSymbol();
        if (!returnTypeSymbol)
            return false;
        var returnTypeName = context.settings.typeChecker.getFullyQualifiedName(returnTypeSymbol);
        return domTypePatterns.some(function (w) { return w.test(returnTypeName); });
    });
}
function isRestParameter(context, symbol) {
    var typeChecker = context.settings.typeChecker;
    var parameterDeclaration = typeChecker.symbolToParameterDeclaration(symbol, undefined, undefined);
    return Boolean(parameterDeclaration === null || parameterDeclaration === void 0 ? void 0 : parameterDeclaration.dotDotDotToken);
}
