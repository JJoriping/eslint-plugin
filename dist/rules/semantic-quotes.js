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
var ast_spec_1 = require("@typescript-eslint/types/dist/generated/ast-spec");
var utils_1 = require("@typescript-eslint/utils");
var type_1 = require("../utils/type");
var QUOTES = ["'", "\"", "`"];
var quotePattern = /^['"`]|['"`]$/g;
exports["default"] = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        fixable: "code",
        messages: {
            'from-keyish-name': "String literal for a key should be quoted with `'`.",
            'from-valueish-name': "String literal for a value should be quoted with `\"`.",
            'from-keyish-type': "String literal constrained by a finite set of values should be quoted with `'`.",
            'from-valueish-type': "String literal not constrained by a finite set of values should be quoted with `\"`.",
            'from-keyish-usage': "String literal used as a key should be quoted with `'`.",
            'from-valueish-usage': "String literal used as a value should be quoted with `\"`."
        },
        schema: [{
                type: "object",
                properties: {
                    keyishNamePattern: { type: "string" },
                    valueishNamePattern: { type: "string" }
                }
            }]
    },
    defaultOptions: [{
            keyishNamePattern: /^(id|key|index|separator|delimiter)$|(Id|Key|Index|Separator|Delimiter)$/.source,
            valueishNamePattern: /^(value|name)$|(Value|Name)$/.source
        }],
    create: function (context, _a) {
        var _b = _a[0], keyishNamePatternString = _b.keyishNamePattern, valueishNamePatternString = _b.valueishNamePattern;
        var keyishNamePattern = new RegExp(keyishNamePatternString);
        var valueishNamePattern = new RegExp(valueishNamePatternString);
        var sourceCode = context.getSourceCode();
        var assertStringLiteral = function (node, as, messageId) {
            if (node.type !== ast_spec_1.AST_NODE_TYPES.Literal) {
                return;
            }
            if (!QUOTES.includes(node.raw[0])) {
                return;
            }
            var target = as === "key" ? "'" : "\"";
            if (node.raw[0] === target) {
                return;
            }
            context.report({
                node: node,
                messageId: messageId,
                fix: function (fixer) {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, fixer.replaceText(node, sourceCode.getText(node).replace(quotePattern, target))];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }
            });
        };
        (0, type_1.useTypeChecker)(context);
        return {
            'CallExpression, NewExpression': function (node) {
                var parameters = (0, type_1.getFunctionParameters)(context, node);
                if (!parameters) {
                    return;
                }
                for (var i = 0; i < parameters.length; i++) {
                    var parameter = parameters[i];
                    var argument = node.arguments[i];
                    if (!argument)
                        continue;
                    if (argument.type === ast_spec_1.AST_NODE_TYPES.Literal) {
                        checkLiteral(parameter, argument);
                    }
                    else if (argument.type === ast_spec_1.AST_NODE_TYPES.ConditionalExpression) {
                        for (var _i = 0, _a = [argument.consequent, argument.alternate]; _i < _a.length; _i++) {
                            var w = _a[_i];
                            if (w.type !== ast_spec_1.AST_NODE_TYPES.Literal)
                                continue;
                            checkLiteral(parameter, w);
                        }
                    }
                }
                function checkLiteral(parameter, node) {
                    if (keyishNamePattern.test(parameter.name)) {
                        assertStringLiteral(node, 'key', 'from-keyish-name');
                        return;
                    }
                    if (valueishNamePattern.test(parameter.name)) {
                        assertStringLiteral(node, 'value', 'from-valueish-name');
                        return;
                    }
                    var type = (0, type_1.getTSTypeBySymbol)(context, parameter);
                    var isKey = type.isUnion() && type.types.every(function (w) { return w.isStringLiteral(); });
                    if (isKey) {
                        assertStringLiteral(node, 'key', 'from-keyish-type');
                    }
                    else {
                        assertStringLiteral(node, 'value', 'from-valueish-type');
                    }
                }
            },
            MemberExpression: function (node) {
                assertStringLiteral(node.property, 'key', 'from-keyish-usage');
            },
            Property: function (node) {
                assertStringLiteral(node.key, 'key', 'from-keyish-usage');
            },
            TSPropertySignature: function (node) {
                assertStringLiteral(node.key, 'key', 'from-keyish-usage');
            },
            TSLiteralType: function (node) {
                assertStringLiteral(node.literal, 'value', 'from-valueish-usage');
            }
        };
    }
});