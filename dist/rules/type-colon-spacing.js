"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        fixable: "whitespace",
        messages: {
            'default': "No spacing required around `:` except in type aliases.",
            'before-in-type-alias': "No spacing required before `:` in type aliases.",
            'after-in-type-alias': "Spacing required after `:` in type aliases."
        },
        schema: []
    },
    defaultOptions: [],
    create: function (context) {
        var sourceCode = context.getSourceCode();
        return {
            TSTypeAnnotation: function (node) {
                var _a, _b, _c, _d;
                if (((_b = (_a = node.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.type) === utils_1.AST_NODE_TYPES.TSTypeLiteral) {
                    return;
                }
                var _e = sourceCode.getFirstTokens(node, { count: 2 }), colon = _e[0], after = _e[1];
                if (colon.value !== ":") {
                    return;
                }
                var before = sourceCode.getTokenBefore(colon);
                var hasSpaceBefore = before && ((_c = sourceCode.isSpaceBetween) === null || _c === void 0 ? void 0 : _c.call(sourceCode, before, colon));
                var hasSpaceAfter = (_d = sourceCode.isSpaceBetween) === null || _d === void 0 ? void 0 : _d.call(sourceCode, colon, after);
                if (!hasSpaceBefore && !hasSpaceAfter) {
                    return;
                }
                context.report({
                    node: colon,
                    messageId: "default",
                    fix: function (fixer) {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!hasSpaceBefore) return [3 /*break*/, 2];
                                    return [4 /*yield*/, fixer.removeRange([before.range[1], colon.range[0]])];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2:
                                    if (!hasSpaceAfter) return [3 /*break*/, 4];
                                    return [4 /*yield*/, fixer.removeRange([colon.range[1], after.range[0]])];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    }
                });
            },
            'TSTypeLiteral>TSPropertySignature': function (_a) {
                var _b, _c;
                var typeAnnotation = _a.typeAnnotation;
                if (!typeAnnotation) {
                    return;
                }
                var _d = sourceCode.getFirstTokens(typeAnnotation, { count: 2 }), colon = _d[0], after = _d[1];
                var before = sourceCode.getTokenBefore(colon);
                if (before && ((_b = sourceCode.isSpaceBetween) === null || _b === void 0 ? void 0 : _b.call(sourceCode, before, colon))) {
                    context.report({
                        node: colon,
                        messageId: "before-in-type-alias",
                        fix: function (fixer) {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, fixer.removeRange([before.range[1], colon.range[0]])];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }
                    });
                }
                if (!((_c = sourceCode.isSpaceBetween) === null || _c === void 0 ? void 0 : _c.call(sourceCode, colon, after))) {
                    context.report({
                        node: colon,
                        messageId: "after-in-type-alias",
                        fix: function (fixer) {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, fixer.insertTextAfter(colon, " ")];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }
                    });
                }
            }
        };
    }
});
