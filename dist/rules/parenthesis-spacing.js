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
exports.__esModule = true;
var utils_1 = require("@typescript-eslint/utils");
var patterns_1 = require("../utils/patterns");
exports["default"] = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        fixable: "whitespace",
        messages: {
            'after-[': "Spacing required after `[`.",
            'after-{': "Spacing required after `{`.",
            'before-]': "Spacing required before `]`.",
            'before-}': "Spacing required before `}`.",
            'no-before-]': "No spacing required before `]`.",
            'no-before-}': "No spacing required before `}`."
        },
        schema: []
    },
    defaultOptions: [],
    create: function (context) {
        var sourceCode = context.getSourceCode();
        var isFirstCloserOfLine = function (closer) {
            var line = sourceCode.lines[closer.loc.start.line - 1];
            var chunk = line.match(patterns_1.closingLinePattern);
            if (!chunk)
                return false;
            return closer.value === chunk[2];
        };
        var checkLeadingSpace = function (from, messageId) {
            var _a;
            var _b = sourceCode.getFirstTokens(from, { count: 2 }), opener = _b[0], payload = _b[1];
            if (payload && ((_a = sourceCode.isSpaceBetween) === null || _a === void 0 ? void 0 : _a.call(sourceCode, opener, payload))) {
                return;
            }
            context.report({
                node: opener,
                messageId: messageId,
                fix: function (fixer) {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, fixer.insertTextAfter(opener, " ")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }
            });
        };
        var checkTrailingSpace = function (from, messageId, shouldBeSpaced) {
            var _a;
            if (shouldBeSpaced === void 0) { shouldBeSpaced = false; }
            var _b = sourceCode.getLastTokens(from, { count: 2 }), payload = _b[0], closer = _b[1];
            if (!payload) {
                return;
            }
            if (isFirstCloserOfLine(closer)) {
                return;
            }
            if (shouldBeSpaced === Boolean((_a = sourceCode.isSpaceBetween) === null || _a === void 0 ? void 0 : _a.call(sourceCode, payload, closer))) {
                return;
            }
            context.report({
                node: closer,
                messageId: messageId,
                fix: function (fixer) {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!shouldBeSpaced) return [3 /*break*/, 2];
                                return [4 /*yield*/, fixer.insertTextBefore(closer, " ")];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 2: return [4 /*yield*/, fixer.removeRange([payload.range[1], closer.range[0]])];
                            case 3:
                                _a.sent();
                                _a.label = 4;
                            case 4: return [2 /*return*/];
                        }
                    });
                }
            });
        };
        return {
            'ArrayExpression, ArrayPattern': function (node) {
                if (!node.elements.length) {
                    return;
                }
                checkLeadingSpace(node, 'after-[');
                if (node.loc.start.line === node.loc.end.line) {
                    checkTrailingSpace(node, 'before-]', true);
                }
                else {
                    checkTrailingSpace(node, 'no-before-]', false);
                }
            },
            'ObjectExpression, ObjectPattern': function (node) {
                if (!node.properties.length) {
                    return;
                }
                checkLeadingSpace(node, 'after-{');
                if (node.loc.start.line === node.loc.end.line) {
                    checkTrailingSpace(node, 'before-}', true);
                }
                else {
                    checkTrailingSpace(node, 'no-before-}', false);
                }
            }
        };
    }
});
