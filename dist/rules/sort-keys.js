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
        hasSuggestions: true,
        messages: {
            'default': "`{{current}}` should be prior to `{{prev}}`.",
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
            minPropertyCount: 5
        }],
    create: function (context, _a) {
        var minPropertyCount = _a[0].minPropertyCount;
        var sourceCode = context.getSourceCode();
        var isSortTarget = function (node) {
            switch (node.type) {
                case utils_1.AST_NODE_TYPES.Property:
                case utils_1.AST_NODE_TYPES.PropertyDefinition:
                case utils_1.AST_NODE_TYPES.MethodDefinition:
                case utils_1.AST_NODE_TYPES.TSPropertySignature:
                case utils_1.AST_NODE_TYPES.TSMethodSignature:
                    return node.key.type === utils_1.AST_NODE_TYPES.Identifier || node.key.type === utils_1.AST_NODE_TYPES.Literal;
            }
            return false;
        };
        var sortKeys = function (node) {
            var R = [];
            var groups = [];
            var indentation = (0, code_1.getIndentation)(sourceCode, node.loc.start.line) + "  ";
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
                    groups.push(comments.map(function (v) { return sourceCode.getText(v); }));
            }
            R.push("{", groups.map(function (v) { return v.map(function (w) { return indentation + w; }).join('\n'); }).join('\n\n'), "}");
            return R.join('\n');
            function runner(target, nextToken) {
                var comments = sourceCode.getCommentsBefore(target);
                lastNode = target;
                if (!isSortTarget(target)) {
                    group.push([sourceCode.getText(target) + nextToken, comments]);
                    return;
                }
                var continued = prevLine !== undefined && prevLine + comments.length + 1 >= target.loc.start.line;
                if (!continued && group.length) {
                    flush();
                }
                group.push([sourceCode.getText(target) + nextToken, comments]);
                prevLine = target.loc.end.line;
            }
            function flush() {
                groups.push(group.sort(function (_a, _b) {
                    var a = _a[0];
                    var b = _b[0];
                    return compareString(a, b);
                }).map(function (_a) {
                    var payload = _a[0], comments = _a[1];
                    if (comments === null || comments === void 0 ? void 0 : comments.length) {
                        return "".concat(comments.map(function (w) { return sourceCode.getText(w); }).join('\n'), "\n").concat(indentation).concat(payload);
                    }
                    return payload;
                }));
                group = [];
            }
        };
        var checkProperties = function (list) {
            var prevLine;
            var prevName;
            var _loop_1 = function (v) {
                if (!isSortTarget(v)) {
                    return "continue";
                }
                var name_1 = v.key.type === utils_1.AST_NODE_TYPES.Literal ? String(v.key.value) : v.key.name;
                var comments = sourceCode.getCommentsBefore(v);
                if (prevLine !== undefined && prevLine + comments.length + 1 >= v.loc.start.line) {
                    if (prevName.localeCompare(name_1, undefined, { numeric: true }) > 0) {
                        var parent_1 = v.parent;
                        if (parent_1) {
                            var hasNontarget = list.some(function (w) { return !isSortTarget(w); })
                                || sourceCode.getCommentsInside(parent_1).length > 0;
                            context.report({
                                node: v,
                                messageId: "default",
                                data: { prev: prevName, current: name_1 },
                                suggest: [{
                                        messageId: hasNontarget ? "default/suggest/1" : "default/suggest/0",
                                        data: { length: list.length },
                                        fix: function (fixer) {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, fixer.replaceText(parent_1, sortKeys(parent_1))];
                                                    case 1:
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }
                                    }]
                            });
                        }
                    }
                }
                prevLine = v.loc.end.line;
                prevName = name_1;
            };
            for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                var v = list_1[_i];
                _loop_1(v);
            }
        };
        return {
            ClassBody: function (node) {
                if (node.body.length < minPropertyCount) {
                    return;
                }
                checkProperties(node.body);
            },
            TSTypeLiteral: function (node) {
                if (node.members.length < minPropertyCount) {
                    return;
                }
                checkProperties(node.members);
            },
            TSInterfaceBody: function (node) {
                if (node.body.length < minPropertyCount) {
                    return;
                }
                checkProperties(node.body);
            },
            ObjectExpression: function (node) {
                if (node.properties.length < minPropertyCount) {
                    return;
                }
                checkProperties(node.properties);
            }
        };
    }
});
function compareString(a, b) {
    return a.localeCompare(b, undefined, { numeric: true });
}
