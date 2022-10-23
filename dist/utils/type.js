"use strict";
exports.__esModule = true;
exports.getObjectProperties = exports.getFunctionParameters = exports.getTSTypeBySymbol = exports.getTSSymbolByNode = exports.getTSTypeByNode = exports.useTypeChecker = void 0;
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
function getFunctionParameters(context, callLikeExpression) {
    var _a = context.settings, service = _a.service, typeChecker = _a.typeChecker;
    var tsNode = service.esTreeNodeToTSNodeMap.get(callLikeExpression);
    var signature = typeChecker.getResolvedSignature(tsNode);
    if (!signature)
        return null;
    return signature.parameters;
}
exports.getFunctionParameters = getFunctionParameters;
function getObjectProperties(context, node) {
    return getTSTypeByNode(context, node).getProperties();
}
exports.getObjectProperties = getObjectProperties;
