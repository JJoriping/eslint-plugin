"use strict";
exports.__esModule = true;
exports.getFunctionParameters = exports.getTSTypeBySymbol = exports.getTSTypeByNode = exports.useTypeChecker = void 0;
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
function getTSTypeBySymbol(context, target) {
    var typeChecker = context.settings.typeChecker;
    var type = typeChecker.getDeclaredTypeOfSymbol(target);
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
