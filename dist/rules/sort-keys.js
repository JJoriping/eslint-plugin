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
var text_1 = require("../utils/text");
var staticBlock = Symbol("static block");
var indexSignature = Symbol("index signature");
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        fixable: "whitespace",
        hasSuggestions: true,
        type: "layout",
        messages: {
            'empty-line': "One empty line should appear between `{{base}}` and `{{target}}`.",
            'interorder': "`{{target}}` node should appear prior to any `{{base}}` node.",
            'intraorder': "`{{target}}` should appear prior to `{{base}}`.",
            'no-literal-member': "Name of a class member cannot be a string literal.",
            'default/suggest/0': "Sort {{length}} keys",
            'default/suggest/1': "Sort {{length}} keys (⚠️ Be aware of spreads and comments!)"
        },
        schema: [{
                type: "object",
                properties: {
                    minPropertyCount: { type: "integer" }
                }
            }]
    },
    defaultOptions: [{
            minPropertyCount: 10
        }],
    create: function (context, _a) {
        var minPropertyCount = _a[0].minPropertyCount;
        var sourceCode = context.getSourceCode();
        var checkElements = function (list, checkEmptyLine) {
            if (list.length < minPropertyCount) {
                return;
            }
            var orderTable = getDefinitionOrderTable(list);
            var prevLine;
            var prevScore;
            var prevKey;
            var _loop_1 = function (v) {
                if (!v.parent)
                    return "continue";
                var key = getDefinitionIdentifier(v);
                if (!key)
                    return "continue";
                var score = orderTable[key];
                if (prevScore !== undefined) {
                    if (prevScore < score) {
                        context.report({
                            node: v,
                            messageId: "interorder",
                            data: { target: getScoreString(score), base: getScoreString(prevScore) },
                            suggest: suggest(list.length, v.parent)
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
                if (typeof key !== "symbol") {
                    var comments = sourceCode.getCommentsBefore(v);
                    var isGroupHead = prevLine === undefined || prevLine + comments.length + 1 < v.loc.start.line;
                    if (prevKey && !isGroupHead && prevScore === score && compareString(prevKey, key) > 0) {
                        context.report({
                            node: v,
                            messageId: "intraorder",
                            data: { target: key, base: prevKey },
                            suggest: suggest(list.length, v.parent)
                        });
                    }
                    prevKey = key;
                }
                prevLine = v.loc.end.line;
                prevScore = score;
            };
            for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                var v = list_1[_i];
                _loop_1(v);
            }
            function suggest(length, parent) {
                var hasNontarget = list.some(function (v) { return !getDefinitionIdentifier(v); })
                    || sourceCode.getCommentsInside(parent).length > 0;
                return [{
                        messageId: hasNontarget ? "default/suggest/1" : "default/suggest/0",
                        data: { length: length },
                        fix: function (fixer) {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, fixer.replaceText(parent, sortKeys(parent))];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }
                    }];
            }
        };
        var sortKeys = function (node) {
            var R = [];
            var groups = [];
            var indentation = (0, code_1.getIndentation)(sourceCode, node.loc.start.line) + text_1.INDENTATION_UNIT;
            var group = [];
            var lastNode;
            var prevLine;
            switch (node.type) {
                case utils_1.AST_NODE_TYPES.ObjectExpression:
                    for (var _i = 0, _a = node.properties; _i < _a.length; _i++) {
                        var v = _a[_i];
                        runner(v, ",");
                    }
                    break;
                case utils_1.AST_NODE_TYPES.TSTypeLiteral:
                    for (var _b = 0, _c = node.members; _b < _c.length; _b++) {
                        var v = _c[_b];
                        runner(v, "");
                    }
                    break;
                case utils_1.AST_NODE_TYPES.ClassBody:
                case utils_1.AST_NODE_TYPES.TSInterfaceBody:
                    for (var _d = 0, _e = node.body; _d < _e.length; _d++) {
                        var v = _e[_d];
                        runner(v, "");
                    }
                    break;
            }
            if (group.length)
                flush();
            if (lastNode) {
                var comments = sourceCode.getCommentsAfter(lastNode);
                if (comments.length)
                    groups.push([0, comments.map(function (v) { return sourceCode.getText(v); })]);
            }
            groups.sort(function (_a, _b) {
                var a = _a[0];
                var b = _b[0];
                return b - a;
            });
            R.push("{", groups.map(function (_a) {
                var v = _a[1];
                return v.map(function (w) { return indentation + w; }).join('\n');
            }).join('\n\n'), "}");
            return R.join('\n');
            function runner(target, nextToken) {
                var _a, _b;
                var comments = sourceCode.getCommentsBefore(target);
                lastNode = target;
                if (!getDefinitionIdentifier(target) || !('key' in target)) {
                    var payload = sourceCode.getText(target) + nextToken;
                    group.push([((_b = (_a = group.at(-1)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : 0) + 0.001, payload, payload, comments]);
                    return;
                }
                var continued = prevLine !== undefined && prevLine + comments.length + 1 >= target.loc.start.line;
                if (!continued && group.length) {
                    flush();
                }
                group.push([getScore(target), unescape(sourceCode.getText(target.key)), sourceCode.getText(target) + nextToken, comments]);
                prevLine = target.loc.end.line;
            }
            function flush() {
                var sortedGroup = group
                    .sort(function (_a, _b) {
                    var aScore = _a[0], aKey = _a[1];
                    var bScore = _b[0], bKey = _b[1];
                    return bScore - aScore || compareString(aKey, bKey);
                });
                groups.push([
                    sortedGroup[0][0],
                    sortedGroup.map(function (_a) {
                        var payload = _a[2], comments = _a[3];
                        if (comments === null || comments === void 0 ? void 0 : comments.length) {
                            return "".concat(comments.map(function (w) { return sourceCode.getText(w); }).join('\n'), "\n").concat(indentation).concat(payload);
                        }
                        return payload;
                    })
                ]);
                group = [];
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
            },
            ObjectExpression: function (node) {
                checkElements(node.properties);
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
        case utils_1.AST_NODE_TYPES.Property:
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
    var accessModifierScore;
    var invertedAccessModifierOrder = false;
    if ('static' in node && node.static)
        R += 1000 /* ScoreValue.STATIC */;
    switch (node.type) {
        case utils_1.AST_NODE_TYPES.MethodDefinition:
        case utils_1.AST_NODE_TYPES.TSMethodSignature:
            switch (node.kind) {
                case "get":
                case "set":
                    R += 220 /* ScoreValue.GETTER_SETTER */;
                    break;
                case "constructor":
                    R += 140 /* ScoreValue.CONSTRUCTOR */;
                    break;
                default:
                    invertedAccessModifierOrder = node.static ? false : true;
                    R += 120 /* ScoreValue.METHOD */;
            }
            break;
        case utils_1.AST_NODE_TYPES.PropertyDefinition:
            if (((_a = node.value) === null || _a === void 0 ? void 0 : _a.type) === utils_1.AST_NODE_TYPES.ArrowFunctionExpression)
                R += 130 /* ScoreValue.ARROW_FUNCTION */;
            else
                R += 230 /* ScoreValue.PROPERTY */;
            break;
        case utils_1.AST_NODE_TYPES.TSPropertySignature:
            if (((_b = node.typeAnnotation) === null || _b === void 0 ? void 0 : _b.typeAnnotation.type) === utils_1.AST_NODE_TYPES.TSFunctionType)
                R += 130 /* ScoreValue.ARROW_FUNCTION */;
            else
                R += 230 /* ScoreValue.PROPERTY */;
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
                accessModifierScore = 3 /* ScoreValue.PUBLIC */;
                break;
            case "protected":
                accessModifierScore = 2 /* ScoreValue.PROTECTED */;
                break;
            case "private":
                accessModifierScore = 1 /* ScoreValue.PRIVATE */;
                break;
            default: throw Error("Unhandled accessibility: ".concat(node.accessibility));
        }
    else
        accessModifierScore = 4 /* ScoreValue.IMPLICITLY_PUBLIC */;
    if (invertedAccessModifierOrder) {
        R += 5 - accessModifierScore;
    }
    else {
        R += accessModifierScore;
    }
    if ('readonly' in node && node.readonly) {
        R += 5 /* ScoreValue.READONLY */;
    }
    return R;
}
function getScoreString(score) {
    var R = [];
    var rest = score;
    var accessModifierScore = rest % 10;
    rest -= accessModifierScore;
    if (rest >= 1000 /* ScoreValue.STATIC */) {
        rest -= 1000 /* ScoreValue.STATIC */;
        R.push("static");
    }
    switch (rest) {
        case 230 /* ScoreValue.PROPERTY */:
            rest -= 230 /* ScoreValue.PROPERTY */;
            R.push("property");
            break;
        case 220 /* ScoreValue.GETTER_SETTER */:
            rest -= 220 /* ScoreValue.GETTER_SETTER */;
            R.push("getter or setter");
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
    if (accessModifierScore >= 5 /* ScoreValue.READONLY */) {
        accessModifierScore -= 5 /* ScoreValue.READONLY */;
        R.push("readonly");
    }
    if (R.join(' ').startsWith("static method")) {
        accessModifierScore = 5 - accessModifierScore;
    }
    switch (accessModifierScore) {
        case 4 /* ScoreValue.IMPLICITLY_PUBLIC */: break;
        case 3 /* ScoreValue.PUBLIC */:
            R.push("public");
            break;
        case 2 /* ScoreValue.PROTECTED */:
            R.push("protected");
            break;
        case 1 /* ScoreValue.PRIVATE */:
            R.push("private");
            break;
    }
    if (rest) {
        throw Error("Unhandled rest: ".concat(rest));
    }
    R[0] = R[0][0].toUpperCase() + R[0].slice(1);
    return R.join(' ');
}
function compareString(a, b) {
    return a.localeCompare(b, undefined, { numeric: true });
}
function unescape(text) {
    return text.replace(/^'"|'"$/g, "");
}
