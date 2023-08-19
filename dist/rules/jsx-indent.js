"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var text_1 = require("../utils/text");
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        fixable: "whitespace",
        messages: {
            'in-children-indentation': "Children of a tag should be indented.",
            'in-multiline-tag-closing': "Closing of a tag should not be multiline.",
            'in-tag-closing': "Closing of a single line tag should not be spaced.",
            'in-tag-indentation': "Closing of a multiline tag should appear at the first of its line.",
            'in-tag-opening': "Opening of a tag should not be spaced.",
            'in-tag-self-closing': "Self-closing of a tag should be spaced."
        },
        schema: []
    },
    defaultOptions: [],
    create: function (context) {
        var sourceCode = context.getSourceCode();
        var checkTagOpening = function (tag) {
            var _a, _b;
            var _c;
            var prefix;
            var payload;
            if (tag.type === utils_1.AST_NODE_TYPES.JSXOpeningElement) {
                _a = sourceCode.getFirstTokens(tag, { count: 2 }), prefix = _a[0], payload = _a[1];
            }
            else {
                _b = sourceCode.getFirstTokens(tag, { count: 3 }), prefix = _b[1], payload = _b[2];
            }
            if (!((_c = sourceCode.isSpaceBetween) === null || _c === void 0 ? void 0 : _c.call(sourceCode, prefix, payload))) {
                return;
            }
            context.report({
                node: prefix,
                messageId: "in-tag-opening",
                fix: function (fixer) {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, fixer.removeRange([prefix.range[1], payload.range[0]])];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }
            });
        };
        var checkTagClosing = function (tag) {
            var _a, _b;
            var selfClosing = tag.type === utils_1.AST_NODE_TYPES.JSXOpeningElement && tag.selfClosing;
            var _c = sourceCode.getLastTokens(tag, {
                count: selfClosing ? 3 : 2
            }), payload = _c[0], next = _c[1];
            if (selfClosing) {
                if ((_a = sourceCode.isSpaceBetween) === null || _a === void 0 ? void 0 : _a.call(sourceCode, payload, next)) {
                    return;
                }
                context.report({
                    node: next,
                    messageId: "in-tag-self-closing",
                    fix: function (fixer) {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fixer.insertTextBefore(next, " ")];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }
                });
            }
            else {
                if (!((_b = sourceCode.isSpaceBetween) === null || _b === void 0 ? void 0 : _b.call(sourceCode, payload, next))) {
                    return;
                }
                context.report({
                    node: next,
                    messageId: "in-tag-closing",
                    fix: function (fixer) {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fixer.removeRange([payload.range[1], next.range[0]])];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }
                });
            }
        };
        return {
            JSXElement: function (node) {
                if (!node.children.length)
                    return;
                var first = sourceCode.getFirstToken(node);
                var openingTagRear = sourceCode.getLastToken(node.openingElement);
                var closingTagFront = node.closingElement && sourceCode.getFirstToken(node.closingElement);
                if (!first || !openingTagRear || !closingTagFront) {
                    return;
                }
                var indentation = (0, code_1.getIndentation)(sourceCode, first.loc.start.line);
                var _loop_1 = function (i) {
                    if (!sourceCode.lines[i - 1].trim())
                        return "continue";
                    var currentIndentation = (0, code_1.getIndentation)(sourceCode, i);
                    if (indentation.length < currentIndentation.length)
                        return "continue";
                    var start = sourceCode.getLocFromIndex(sourceCode.lineStartIndices[i - 1]);
                    var end = { line: start.line, column: currentIndentation.length };
                    var endIndex = sourceCode.getIndexFromLoc(end);
                    context.report({
                        loc: { start: start, end: end },
                        messageId: "in-children-indentation",
                        fix: function (fixer) {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, fixer.replaceTextRange([sourceCode.lineStartIndices[i - 1], endIndex], indentation + text_1.INDENTATION_UNIT)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }
                    });
                };
                for (var i = openingTagRear.loc.end.line + 1; i < closingTagFront.loc.start.line; i++) {
                    _loop_1(i);
                }
            },
            JSXOpeningElement: function (node) {
                var isSingleLine = node.loc.start.line === node.loc.end.line;
                checkTagOpening(node);
                if (isSingleLine) {
                    checkTagClosing(node);
                }
                else {
                    var closingBracket_1 = sourceCode.getLastToken(node);
                    if (!closingBracket_1)
                        return;
                    var aIndentation_1 = (0, code_1.getIndentation)(sourceCode, node.loc.start.line);
                    var bIndentation = (0, code_1.getIndentation)(sourceCode, closingBracket_1.loc.end.line);
                    if (aIndentation_1 !== bIndentation) {
                        context.report({
                            node: closingBracket_1,
                            messageId: "in-tag-indentation",
                            fix: function (fixer) {
                                var target;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            target = node.selfClosing ? sourceCode.getTokenBefore(closingBracket_1) : closingBracket_1;
                                            return [4 /*yield*/, fixer.insertTextBefore(target, "\n" + aIndentation_1)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }
                        });
                    }
                }
            },
            JSXClosingElement: function (node) {
                var isSingleLine = node.loc.start.line === node.loc.end.line;
                checkTagOpening(node);
                if (isSingleLine) {
                    checkTagClosing(node);
                    return;
                }
                context.report({
                    node: node,
                    messageId: "in-multiline-tag-closing",
                    fix: function (fixer) {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fixer.replaceText(node, sourceCode.getText(node).replace(/\s/g, ""))];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }
                });
            }
        };
    }
});
