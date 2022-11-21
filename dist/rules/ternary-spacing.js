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
            'default': "Ternary operator should be the first token of its line.",
            'indent': "Ternary operator should be indented.",
            'no-indent': "Else-if-like ternary operator should not be indented."
        },
        schema: []
    },
    defaultOptions: [],
    create: function (context) {
        var sourceCode = context.getSourceCode();
        return {
            ConditionalExpression: function (node) {
                var _a;
                if (node.loc.start.line === node.loc.end.line) {
                    return;
                }
                var indentation = (0, code_1.getIndentation)(sourceCode, node.loc.start.line);
                var _b = sourceCode.getTokensBefore(node.consequent, { count: 2 }), prevQuestionMark = _b[0], questionMark = _b[1];
                var _c = sourceCode.getTokensBefore(node.alternate, { count: 2 }), prevColon = _c[0], colon = _c[1];
                var aIndentation = (0, code_1.getIndentation)(sourceCode, questionMark.loc.start.line);
                if (prevQuestionMark.loc.end.line === questionMark.loc.start.line) {
                    context.report({
                        node: questionMark,
                        messageId: "default",
                        fix: function (fixer) {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, fixer.insertTextBefore(questionMark, "\n" + indentation + "  ")];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }
                    });
                }
                else {
                    var elseIfLike = ((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) === utils_1.AST_NODE_TYPES.ConditionalExpression && node.parent.alternate === node;
                    if (elseIfLike && aIndentation.length !== indentation.length) {
                        context.report({
                            node: questionMark,
                            messageId: "no-indent",
                            fix: function (fixer) {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, fixer.replaceTextRange([
                                                sourceCode.lineStartIndices[questionMark.loc.start.line - 1],
                                                questionMark.range[0]
                                            ], indentation)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }
                        });
                    }
                    if (!elseIfLike && aIndentation.length <= indentation.length) {
                        context.report({
                            node: questionMark,
                            messageId: "indent",
                            fix: function (fixer) {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, fixer.replaceTextRange([
                                                sourceCode.lineStartIndices[questionMark.loc.start.line - 1],
                                                questionMark.range[0]
                                            ], aIndentation + "  ")];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }
                        });
                    }
                }
                if (prevColon.loc.end.line === colon.loc.start.line) {
                    context.report({
                        node: colon,
                        messageId: "default",
                        fix: function (fixer) {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, fixer.insertTextBefore(colon, "\n" + indentation + "  ")];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }
                    });
                }
                else {
                    var bIndentation = (0, code_1.getIndentation)(sourceCode, colon.loc.start.line);
                    if (aIndentation.length !== bIndentation.length) {
                        context.report({
                            node: colon,
                            messageId: "indent",
                            fix: function (fixer) {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, fixer.replaceTextRange([
                                                sourceCode.lineStartIndices[colon.loc.start.line - 1],
                                                colon.range[0]
                                            ], aIndentation)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }
                        });
                    }
                }
            }
        };
    }
});
