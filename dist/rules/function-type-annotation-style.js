"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@typescript-eslint/utils");
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        fixable: "code",
        messages: {
            'default': "Signature of `{{key}}` should be {{type}}-like."
        },
        schema: [{
                type: "object",
                properties: {
                    typeAlias: { type: "string", enum: ["property", "method"] },
                    interface: { type: "string", enum: ["property", "method"] }
                }
            }]
    },
    defaultOptions: [{
            typeAlias: "property",
            interface: "method"
        }],
    create: function (context, _a) {
        var options = _a[0];
        var sourceCode = context.getSourceCode();
        return {
            TSPropertySignature: function (node) {
                var _a, _b, _c;
                if (((_a = node.typeAnnotation) === null || _a === void 0 ? void 0 : _a.typeAnnotation.type) !== utils_1.AST_NODE_TYPES.TSFunctionType) {
                    return;
                }
                var type = ((_b = node.parent) === null || _b === void 0 ? void 0 : _b.type) === utils_1.AST_NODE_TYPES.TSTypeLiteral
                    ? "typeAlias"
                    : ((_c = node.parent) === null || _c === void 0 ? void 0 : _c.type) === utils_1.AST_NODE_TYPES.TSInterfaceBody
                        ? "interface"
                        : undefined;
                if (!type) {
                    return;
                }
                if (options[type] === "property") {
                    return;
                }
                var returnType = node.typeAnnotation.typeAnnotation.returnType;
                context.report({
                    node: node.typeAnnotation,
                    messageId: "default",
                    data: { key: sourceCode.getText(node.key), type: options[type] },
                    fix: function (fixer) {
                        var colon, arrow;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    colon = node.typeAnnotation && sourceCode.getFirstToken(node.typeAnnotation);
                                    arrow = returnType && sourceCode.getFirstToken(returnType);
                                    if (!colon) return [3 /*break*/, 2];
                                    return [4 /*yield*/, fixer.remove(colon)];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2:
                                    if (!arrow) return [3 /*break*/, 4];
                                    return [4 /*yield*/, fixer.replaceText(arrow, ":")];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    }
                });
            },
            TSMethodSignature: function (node) {
                var _a, _b;
                var type = ((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) === utils_1.AST_NODE_TYPES.TSTypeLiteral
                    ? "typeAlias"
                    : ((_b = node.parent) === null || _b === void 0 ? void 0 : _b.type) === utils_1.AST_NODE_TYPES.TSInterfaceBody
                        ? "interface"
                        : undefined;
                if (!type) {
                    return;
                }
                if (options[type] === "method") {
                    return;
                }
                context.report({
                    node: node,
                    messageId: "default",
                    data: { key: sourceCode.getText(node.key), type: options[type] },
                    fix: function (fixer) {
                        var colon;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    colon = node.returnType && sourceCode.getFirstToken(node.returnType);
                                    return [4 /*yield*/, fixer.insertTextAfter(node.key, ":")];
                                case 1:
                                    _a.sent();
                                    if (!colon) return [3 /*break*/, 3];
                                    return [4 /*yield*/, fixer.replaceText(colon, "=>")];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }
                });
            }
        };
    }
});
