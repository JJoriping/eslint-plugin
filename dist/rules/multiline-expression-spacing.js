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
var patterns_1 = require("../utils/patterns");
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        fixable: "code",
        messages: {
            'for-conditional-expression': "Multiline conditional expression should finish the line.",
            'for-call-expression': "Multiline function call should finish the line.",
            'for-member-expression': "Multiline property access should finish the line.",
            'for-binary-expression': "Multiline binary expression should finish the line."
        },
        schema: []
    },
    defaultOptions: [],
    create: function (context) {
        var sourceCode = context.getSourceCode();
        var getIntentation = function (line) {
            return sourceCode.lines[line - 1].match(patterns_1.indentationPattern)[0];
        };
        var checkExpression = function (node, messageId) {
            var isMultilined = node.loc.start.line !== node.loc.end.line;
            if (!isMultilined) {
                return;
            }
            var chunk = sourceCode.lines[node.loc.end.line - 1].match(patterns_1.closingLinePattern);
            if (chunk && getIntentation(node.loc.start.line) === chunk[1]) {
                return;
            }
            var next = sourceCode.getTokenAfter(node);
            if ((next === null || next === void 0 ? void 0 : next.loc.start.line) !== node.loc.end.line) {
                return;
            }
            context.report({
                node: next,
                messageId: messageId,
                fix: function (fixer) {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, fixer.insertTextAfter(node, "\n")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }
            });
        };
        return {
            ConditionalExpression: function (node) {
                checkExpression(node, 'for-conditional-expression');
            },
            CallExpression: function (node) {
                checkExpression(node, 'for-call-expression');
            },
            MemberExpression: function (node) {
                var _a;
                if (((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) === utils_1.AST_NODE_TYPES.CallExpression) {
                    return;
                }
                checkExpression(node, 'for-member-expression');
            },
            'BinaryExpression, LogicalExpression, TSUnionType, TSIntersectionType': function (node) {
                checkExpression(node, 'for-binary-expression');
            }
        };
    }
});