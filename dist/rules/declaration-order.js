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
var staticBlock = Symbol("static block");
var indexSignature = Symbol("index signature");
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        fixable: "whitespace",
        messages: {
            'interorder': "`{{target}}` node should appear prior to any `{{base}}` node.",
            'empty-line': "One empty line should appear between `{{base}}` and `{{target}}`.",
            'no-literal-member': "Name of a class member cannot be a string literal."
        },
        schema: []
    },
    defaultOptions: [],
    create: function (context) {
        var sourceCode = context.getSourceCode();
        var checkElements = function (list, checkEmptyLine) {
            var orderTable = getDefinitionOrderTable(list);
            var prevScore;
            var _loop_1 = function (v) {
                var key = getDefinitionIdentifier(v);
                if (!key)
                    return "continue";
                var score = orderTable[key];
                if (prevScore !== undefined) {
                    if (prevScore < score) {
                        context.report({
                            node: v,
                            messageId: "interorder",
                            data: { target: getScoreString(score), base: getScoreString(prevScore) }
                        });
                    }
                    else if (checkEmptyLine && Math.floor(0.01 * prevScore) - Math.floor(0.01 * score) > 0) {
                        if (!(0, code_1.hasEmptyLineBefore)(sourceCode, v)) {
                            context.report({
                                node: v,
                                messageId: "empty-line",
                                data: { target: getScoreString(score), base: getScoreString(prevScore) },
                                fix: function (fixer) {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, fixer.insertTextBefore(v, "\n")];
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
                prevScore = score;
            };
            for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                var v = list_1[_i];
                _loop_1(v);
            }
        };
        return {
            ClassBody: function (node) {
                checkElements(node.body, true);
            },
            TSTypeLiteral: function (node) {
                checkElements(node.members);
            },
            TSInterfaceDeclaration: function (node) {
                checkElements(node.body.body, true);
            }
        };
    }
});
function getDefinitionOrderTable(items) {
    var R = {};
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var v = items_1[_i];
        var key = getDefinitionIdentifier(v);
        if (!key)
            continue;
        R[key] = getScore(v);
    }
    return R;
}
function getDefinitionIdentifier(item) {
    switch (item.type) {
        case utils_1.AST_NODE_TYPES.PropertyDefinition:
        case utils_1.AST_NODE_TYPES.MethodDefinition:
        case utils_1.AST_NODE_TYPES.TSPropertySignature:
        case utils_1.AST_NODE_TYPES.TSMethodSignature:
            if (item.key.type === utils_1.AST_NODE_TYPES.Identifier) {
                return item.key.name;
            }
            if (item.key.type === utils_1.AST_NODE_TYPES.Literal) {
                return String(item.key.value);
            }
            return null;
        case utils_1.AST_NODE_TYPES.StaticBlock:
            return staticBlock;
        case utils_1.AST_NODE_TYPES.TSIndexSignature:
            return indexSignature;
    }
    return null;
}
// NOTE Node with higher score should appear first
function getScore(node) {
    var _a, _b;
    var R = 0;
    if ('static' in node && node.static)
        R += 1000 /* ScoreValue.STATIC */;
    switch (node.type) {
        case utils_1.AST_NODE_TYPES.MethodDefinition:
        case utils_1.AST_NODE_TYPES.TSMethodSignature:
            switch (node.kind) {
                case "get":
                    R += 230 /* ScoreValue.GETTER */;
                    break;
                case "set":
                    R += 220 /* ScoreValue.SETTER */;
                    break;
                case "constructor":
                    R += 140 /* ScoreValue.CONSTRUCTOR */;
                    break;
                default: R += 120 /* ScoreValue.METHOD */;
            }
            break;
        case utils_1.AST_NODE_TYPES.PropertyDefinition:
            if (((_a = node.value) === null || _a === void 0 ? void 0 : _a.type) === utils_1.AST_NODE_TYPES.ArrowFunctionExpression)
                R += 130 /* ScoreValue.ARROW_FUNCTION */;
            else
                R += 240 /* ScoreValue.PROPERTY */;
            break;
        case utils_1.AST_NODE_TYPES.TSPropertySignature:
            if (((_b = node.typeAnnotation) === null || _b === void 0 ? void 0 : _b.typeAnnotation.type) === utils_1.AST_NODE_TYPES.TSFunctionType)
                R += 130 /* ScoreValue.ARROW_FUNCTION */;
            else
                R += 240 /* ScoreValue.PROPERTY */;
            break;
        case utils_1.AST_NODE_TYPES.StaticBlock:
            R += 1000 /* ScoreValue.STATIC */ + 110 /* ScoreValue.STATIC_BLOCK */;
            break;
        case utils_1.AST_NODE_TYPES.TSIndexSignature:
            R += 210 /* ScoreValue.INDEX_SIGNATURE */;
            break;
    }
    if ('accessibility' in node)
        switch (node.accessibility) {
            case "public":
                R += 3 /* ScoreValue.PUBLIC */;
                break;
            case "protected":
                R += 2 /* ScoreValue.PROTECTED */;
                break;
            case "private":
                R += 1 /* ScoreValue.PRIVATE */;
                break;
        }
    else
        R += 4 /* ScoreValue.IMPLICITLY_PUBLIC */;
    return R;
}
function getScoreString(score) {
    var R = [];
    var rest = score;
    switch (rest % 10) {
        case 4 /* ScoreValue.IMPLICITLY_PUBLIC */:
            rest -= 4 /* ScoreValue.IMPLICITLY_PUBLIC */;
            break;
        case 3 /* ScoreValue.PUBLIC */:
            rest -= 3 /* ScoreValue.PUBLIC */;
            R.push("public");
            break;
        case 2 /* ScoreValue.PROTECTED */:
            rest -= 2 /* ScoreValue.PROTECTED */;
            R.push("protected");
            break;
        case 1 /* ScoreValue.PRIVATE */:
            rest -= 1 /* ScoreValue.PRIVATE */;
            R.push("private");
            break;
    }
    if (rest >= 1000 /* ScoreValue.STATIC */) {
        rest -= 1000 /* ScoreValue.STATIC */;
        R.push("static");
    }
    switch (rest) {
        case 240 /* ScoreValue.PROPERTY */:
            rest -= 240 /* ScoreValue.PROPERTY */;
            R.push("property");
            break;
        case 230 /* ScoreValue.GETTER */:
            rest -= 230 /* ScoreValue.GETTER */;
            R.push("getter");
            break;
        case 220 /* ScoreValue.SETTER */:
            rest -= 220 /* ScoreValue.SETTER */;
            R.push("setter");
            break;
        case 210 /* ScoreValue.INDEX_SIGNATURE */:
            rest -= 210 /* ScoreValue.INDEX_SIGNATURE */;
            R.push("index signature");
            break;
        case 140 /* ScoreValue.CONSTRUCTOR */:
            rest -= 140 /* ScoreValue.CONSTRUCTOR */;
            R.push("constructor");
            break;
        case 130 /* ScoreValue.ARROW_FUNCTION */:
            rest -= 130 /* ScoreValue.ARROW_FUNCTION */;
            R.push("arrow function");
            break;
        case 120 /* ScoreValue.METHOD */:
            rest -= 120 /* ScoreValue.METHOD */;
            R.push("method");
            break;
        case 110 /* ScoreValue.STATIC_BLOCK */:
            rest -= 110 /* ScoreValue.STATIC_BLOCK */;
            R.push("static block");
            break;
    }
    if (rest) {
        throw Error("Unhandled rest: ".concat(rest));
    }
    R[0] = R[0][0].toUpperCase() + R[0].slice(1);
    return R.join(' ');
}
