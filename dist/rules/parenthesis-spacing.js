"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var ast_spec_1 = require("@typescript-eslint/types/dist/generated/ast-spec");
var utils_1 = require("@typescript-eslint/utils");
var patterns_1 = require("../utils/patterns");
var OBJECT_OR_ARRAY_TYPES = [
    utils_1.AST_NODE_TYPES.ArrayExpression,
    utils_1.AST_NODE_TYPES.ArrayPattern,
    utils_1.AST_NODE_TYPES.ObjectExpression,
    utils_1.AST_NODE_TYPES.ObjectPattern
];
var DIRECTION_TABLE = {
    '[': "after",
    '{': "after",
    ']': "before",
    '}': "before"
};
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        fixable: "whitespace",
        messages: {
            'should': "Spacing required {{direction}} `{{token}}`.",
            'should-not': "No spacing required {{direction}} `{{token}}`."
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
            return closer.loc.start.column === chunk[0].length - 1;
        };
        var hasOnlyObjectOrArray = function (children) { return children.length === 1
            && children[0] !== null
            && OBJECT_OR_ARRAY_TYPES.includes(children[0].type); };
        var getMessageIdWithData = function (token, shouldBeSpaced) {
            var direction = DIRECTION_TABLE[token];
            return {
                messageId: shouldBeSpaced ? "should" : "should-not",
                data: { direction: direction, token: token }
            };
        };
        var checkLeadingSpace = function (from, token, shouldBeSpaced) {
            var _a, _b;
            var _c;
            if (shouldBeSpaced === void 0) { shouldBeSpaced = false; }
            var opener;
            var payload;
            if (from.type in ast_spec_1.AST_TOKEN_TYPES) {
                _a = [from, sourceCode.getTokenAfter(from)], opener = _a[0], payload = _a[1];
            }
            else {
                _b = sourceCode.getFirstTokens(from, { count: 2 }), opener = _b[0], payload = _b[1];
            }
            if (!payload) {
                return;
            }
            if (shouldBeSpaced === Boolean((_c = sourceCode.isSpaceBetween) === null || _c === void 0 ? void 0 : _c.call(sourceCode, opener, payload))) {
                return;
            }
            context.report(__assign(__assign({ node: opener }, getMessageIdWithData(token, shouldBeSpaced)), { fix: function (fixer) {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!shouldBeSpaced) return [3 /*break*/, 2];
                                return [4 /*yield*/, fixer.insertTextAfter(opener, " ")];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 2: return [4 /*yield*/, fixer.removeRange([opener.range[1], payload.range[0]])];
                            case 3:
                                _a.sent();
                                _a.label = 4;
                            case 4: return [2 /*return*/];
                        }
                    });
                } }));
        };
        var checkTrailingSpace = function (from, token, shouldBeSpaced) {
            var _a, _b, _c;
            var _d;
            if (shouldBeSpaced === void 0) { shouldBeSpaced = false; }
            var payload;
            var closer;
            if (from.type in ast_spec_1.AST_TOKEN_TYPES) {
                _a = [sourceCode.getTokenBefore(from), from], payload = _a[0], closer = _a[1];
            }
            else if ('typeAnnotation' in from && from.typeAnnotation) {
                _b = sourceCode.getTokensBefore(from.typeAnnotation, { count: 2 }), payload = _b[0], closer = _b[1];
            }
            else {
                _c = sourceCode.getLastTokens(from, { count: 2 }), payload = _c[0], closer = _c[1];
            }
            if (!payload) {
                return;
            }
            if (isFirstCloserOfLine(closer)) {
                return;
            }
            if (shouldBeSpaced === Boolean((_d = sourceCode.isSpaceBetween) === null || _d === void 0 ? void 0 : _d.call(sourceCode, payload, closer))) {
                return;
            }
            context.report(__assign(__assign({ node: closer }, getMessageIdWithData(token, shouldBeSpaced)), { fix: function (fixer) {
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
                } }));
        };
        return {
            'ArrayExpression, ArrayPattern': function (node) {
                if (!node.elements.length) {
                    return;
                }
                var isMultiline = node.loc.start.line !== node.loc.end.line;
                var only = hasOnlyObjectOrArray(node.elements);
                checkLeadingSpace(node, "[", !only);
                if (isMultiline) {
                    checkTrailingSpace(node, "]", false);
                }
                else {
                    checkTrailingSpace(node, "]", !only);
                }
            },
            'ObjectExpression, ObjectPattern': function (node) {
                if (!node.properties.length) {
                    return;
                }
                var isMultiline = node.loc.start.line !== node.loc.end.line;
                var only = hasOnlyObjectOrArray(node.properties);
                checkLeadingSpace(node, "{", !only);
                if (isMultiline) {
                    checkTrailingSpace(node, "}", false);
                }
                else {
                    checkTrailingSpace(node, "}", !only);
                }
            },
            'ImportDeclaration, ExportNamedDeclaration': function (node) {
                if (!node.specifiers.length) {
                    return;
                }
                var opening = sourceCode.getTokenBefore(node.specifiers[0]);
                var closing = sourceCode.getTokenAfter(node.specifiers[node.specifiers.length - 1]);
                if (opening)
                    checkLeadingSpace(opening, "{", true);
                if (closing)
                    checkTrailingSpace(closing, "}", true);
            }
        };
    }
});
