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
var code_1 = require("../utils/code");
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        fixable: "whitespace",
        messages: {
            'default': "Type operator `{{operator}}` should not be spaced in single-line style.",
            'in-arrow-function': "Spacing required around `=>`.",
            'in-multiline': "Type operator `{{operator}}` should be spaced in multiline style.",
            'in-multiline-ending': "Line cannot be ended with `{{operator}}`.",
            'in-multiline-indent': "Line starting with a type operator should be indented."
        },
        schema: []
    },
    defaultOptions: [],
    create: function (context) {
        var sourceCode = context.getSourceCode();
        return {
            TSFunctionType: function (node) {
                var _a, _b;
                if (!node.returnType) {
                    return;
                }
                var _c = sourceCode.getFirstTokens(node.returnType, { count: 2 }), arrow = _c[0], after = _c[1];
                var before = sourceCode.getTokenBefore(arrow);
                var hasSpaceBefore = before && ((_a = sourceCode.isSpaceBetween) === null || _a === void 0 ? void 0 : _a.call(sourceCode, before, arrow));
                var hasSpaceAfter = (_b = sourceCode.isSpaceBetween) === null || _b === void 0 ? void 0 : _b.call(sourceCode, arrow, after);
                if (hasSpaceBefore && hasSpaceAfter) {
                    return;
                }
                context.report({
                    node: arrow,
                    messageId: "in-arrow-function",
                    fix: function (fixer) {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!!hasSpaceBefore) return [3 /*break*/, 2];
                                    return [4 /*yield*/, fixer.insertTextBefore(arrow, " ")];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2:
                                    if (!!hasSpaceAfter) return [3 /*break*/, 4];
                                    return [4 /*yield*/, fixer.insertTextAfter(arrow, " ")];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    }
                });
            },
            'TSUnionType, TSIntersectionType': function (node) {
                var _a, _b;
                var _loop_1 = function (i) {
                    var a = node.types[i];
                    var b = node.types[i + 1];
                    var aLast = sourceCode.getLastToken(a);
                    var bFirst = sourceCode.getFirstToken(b);
                    var operator = aLast && sourceCode.getTokenAfter(aLast);
                    if (!aLast || !bFirst || !operator)
                        return "continue";
                    if (aLast.loc.end.line === bFirst.loc.start.line) {
                        if (!((_a = sourceCode.isSpaceBetween) === null || _a === void 0 ? void 0 : _a.call(sourceCode, aLast, bFirst))) {
                            return "continue";
                        }
                        context.report({
                            node: operator,
                            messageId: "default",
                            data: { operator: operator.value },
                            fix: function (fixer) {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, fixer.replaceTextRange([aLast.range[1], bFirst.range[0]], operator.value)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }
                        });
                    }
                    else {
                        var aLineIndentation_1 = (0, code_1.getIndentation)(sourceCode, aLast.loc.end.line);
                        var bLineIndentation = (0, code_1.getIndentation)(sourceCode, bFirst.loc.start.line);
                        if (aLast.loc.end.line === operator.loc.start.line) {
                            context.report({
                                node: operator,
                                messageId: "in-multiline-ending",
                                data: { operator: operator.value },
                                fix: function (fixer) {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, fixer.replaceTextRange([operator.range[0], bFirst.range[0]], "\n".concat(operator.value, " "))];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }
                            });
                        }
                        if (i === 0 && aLineIndentation_1.length >= bLineIndentation.length) {
                            context.report({
                                node: bFirst,
                                messageId: "in-multiline-indent",
                                fix: function (fixer) {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, fixer.replaceTextRange([
                                                    sourceCode.lineStartIndices[bFirst.loc.start.line - 1],
                                                    operator.range[0]
                                                ], aLineIndentation_1 + "  ")];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }
                            });
                        }
                        if (i > 0 && aLineIndentation_1.length !== bLineIndentation.length) {
                            context.report({
                                node: bFirst,
                                messageId: "in-multiline-indent",
                                fix: function (fixer) {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, fixer.replaceTextRange([
                                                    sourceCode.lineStartIndices[bFirst.loc.start.line - 1],
                                                    operator.range[0]
                                                ], aLineIndentation_1)];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }
                            });
                        }
                        if ((_b = sourceCode.isSpaceBetween) === null || _b === void 0 ? void 0 : _b.call(sourceCode, operator, bFirst)) {
                            return "continue";
                        }
                        context.report({
                            node: operator,
                            messageId: "in-multiline",
                            data: { operator: operator.value },
                            fix: function (fixer) {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, fixer.insertTextAfter(operator, " ")];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }
                        });
                    }
                };
                for (var i = 0; i < node.types.length - 1; i++) {
                    _loop_1(i);
                }
            }
        };
    }
});
