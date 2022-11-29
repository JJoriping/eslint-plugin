"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@typescript-eslint/utils");
var patterns_1 = require("../utils/patterns");
var text_1 = require("../utils/text");
var type_1 = require("../utils/type");
var iterativeMethods = ["map", "reduce", "every", "some", "forEach", "filter", "find", "findIndex"];
var kindTable = {
    for: ["index"],
    forIn: ["key"],
    forOf: ["value"],
    entries: ["entry", "index"],
    entriesReduce: ["previousValue", "entry", "index"],
    every: ["value", "index"],
    filter: ["value", "index"],
    find: ["value", "index"],
    findIndex: ["value", "index"],
    forEach: ["value", "index"],
    map: ["value", "index"],
    reduce: ["previousValue", "value", "index"],
    some: ["value", "index"]
};
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        messages: {
            'default': "{{index}} iterator name of {{depth}} `{{kind}}` should be `{{criterion}}`."
        },
        schema: [
            {
                type: "object",
                properties: {
                    entry: { type: "array", items: { type: "string" } },
                    index: { type: "array", items: { type: "string" } },
                    key: { type: "array", items: { type: "string" } },
                    previousKey: { type: "array", items: { type: "string" } },
                    previousValue: { type: "array", items: { type: "string" } },
                    value: { type: "array", items: { type: "string" } }
                }
            },
            {
                type: "object",
                properties: {
                    keyListLikeNamePattern: { type: "string" },
                    exceptions: { type: "array", items: { type: "string" } }
                }
            }
        ]
    },
    defaultOptions: [
        {
            entry: ["e", "f", "g", "h", "i"],
            index: ["i", "j", "k", "l", "m"],
            key: ["k", "l", "m", "n", "o"],
            previousKey: ["pk", "pl", "pm", "pn", "po"],
            previousValue: ["pv", "pw", "px", "py", "pz"],
            value: ["v", "w", "x", "y", "z"]
        },
        {
            keyListLikeNamePattern: patterns_1.keyListLikeNamePattern.source,
            exceptions: ["_", "__"]
        }
    ],
    create: function (context, _a) {
        var options = _a[0], _b = _a[1], keyListLikeNamePatternString = _b.keyListLikeNamePattern, exceptions = _b.exceptions;
        if (!keyListLikeNamePatternString)
            throw Error("Unhandled keyListLikeNamePatternString: ".concat(keyListLikeNamePatternString));
        var keyListLikeNamePattern = new RegExp(keyListLikeNamePatternString);
        var sourceCode = context.getSourceCode();
        var getIterativeStatementParameters = function (node) {
            var _a;
            var name;
            var list;
            var calleeObject = undefined;
            var keyish = false;
            switch (node.type) {
                case utils_1.AST_NODE_TYPES.ForStatement:
                    if (((_a = node.init) === null || _a === void 0 ? void 0 : _a.type) !== utils_1.AST_NODE_TYPES.VariableDeclaration) {
                        return null;
                    }
                    if (node.init.declarations.length !== 1) {
                        return null;
                    }
                    if (node.init.declarations[0].id.type !== utils_1.AST_NODE_TYPES.Identifier) {
                        return null;
                    }
                    name = "for";
                    list = [node.init.declarations[0].id];
                    break;
                case utils_1.AST_NODE_TYPES.ForInStatement:
                case utils_1.AST_NODE_TYPES.ForOfStatement:
                    {
                        if (node.left.type !== utils_1.AST_NODE_TYPES.VariableDeclaration) {
                            return null;
                        }
                        if (node.left.declarations.length !== 1) {
                            return null;
                        }
                        var leftNode = node.left.declarations[0];
                        if (leftNode.id.type !== utils_1.AST_NODE_TYPES.Identifier && leftNode.id.type !== utils_1.AST_NODE_TYPES.ArrayPattern) {
                            return null;
                        }
                        name = node.type === utils_1.AST_NODE_TYPES.ForInStatement ? "forIn" : "forOf";
                        if (name === "forOf") {
                            if (isKeyListLikeName(node.right)) {
                                keyish = true;
                            }
                            else {
                                var iteratorType = (0, type_1.getTSTypeByNode)(context, leftNode);
                                if (iteratorType.isUnion() && iteratorType.types.every(function (v) { return v.isStringLiteral(); })) {
                                    keyish = true;
                                }
                            }
                        }
                        list = [leftNode.id];
                        calleeObject = node.right;
                    }
                    break;
                default: return null;
            }
            return { name: name, keyish: keyish, list: list, calleeObject: calleeObject };
        };
        var getIterativeMethodParameters = function (node) {
            var _a;
            if (node.callee.type !== utils_1.AST_NODE_TYPES.MemberExpression) {
                return null;
            }
            if (node.callee.property.type !== utils_1.AST_NODE_TYPES.Identifier) {
                return null;
            }
            if (((_a = node.arguments[0]) === null || _a === void 0 ? void 0 : _a.type) !== utils_1.AST_NODE_TYPES.ArrowFunctionExpression) {
                return null;
            }
            if (!node.arguments[0].params.every(function (v) { return v.type === utils_1.AST_NODE_TYPES.Identifier || v.type === utils_1.AST_NODE_TYPES.ArrayPattern; })) {
                return null;
            }
            var symbol = (0, type_1.getTSTypeByNode)(context, node.callee.object).getSymbol();
            if ((symbol === null || symbol === void 0 ? void 0 : symbol.name) !== "Array") {
                return null;
            }
            if (!iterativeMethods.includes(node.callee.property.name)) {
                return null;
            }
            return {
                name: node.callee.property.name,
                keyish: isKeyListLikeName(node.callee.object),
                calleeObject: node.callee.object,
                list: node.arguments[0].params
            };
        };
        var getCurrentDepth = function (me) {
            var ancestors = context.getAncestors();
            var R = 0;
            for (var i = 0; i < ancestors.length; i++) {
                var v = ancestors[i];
                switch (v.type) {
                    case utils_1.AST_NODE_TYPES.CallExpression:
                        if (v.callee === (ancestors[i + 1] || me)) {
                            continue;
                        }
                        if (!getIterativeMethodParameters(v)) {
                            continue;
                        }
                        R++;
                        break;
                    case utils_1.AST_NODE_TYPES.WhileStatement:
                    case utils_1.AST_NODE_TYPES.DoWhileStatement:
                        if (v.test === (ancestors[i + 1] || me)) {
                            continue;
                        }
                    case utils_1.AST_NODE_TYPES.ForStatement:
                    case utils_1.AST_NODE_TYPES.ForInStatement:
                    case utils_1.AST_NODE_TYPES.ForOfStatement:
                        R++;
                        break;
                }
            }
            return R;
        };
        var getActualName = function (value) {
            if (value.startsWith("$")) {
                return value.slice(1);
            }
            return value;
        };
        var checkParameterNames = function (kind, parameters, depth) {
            var _a, _b;
            var max = Math.min(kind.length, parameters.length);
            for (var i = 0; i < max; i++) {
                var parameter = parameters[i];
                if (parameter.type === utils_1.AST_NODE_TYPES.ArrayPattern) {
                    if (kind[i] !== "entry") {
                        continue;
                    }
                    if (((_a = parameter.elements[0]) === null || _a === void 0 ? void 0 : _a.type) !== utils_1.AST_NODE_TYPES.Identifier) {
                        continue;
                    }
                    if (((_b = parameter.elements[1]) === null || _b === void 0 ? void 0 : _b.type) !== utils_1.AST_NODE_TYPES.Identifier) {
                        continue;
                    }
                    if (getActualName(parameter.elements[0].name) === options.key[depth] && getActualName(parameter.elements[1].name) === options.value[depth]) {
                        continue;
                    }
                    context.report({
                        node: parameter,
                        messageId: "default",
                        data: {
                            index: "Destructured",
                            depth: (0, text_1.toOrdinal)(depth + 1),
                            kind: kind[i],
                            criterion: "[ ".concat(options.key[depth], ", ").concat(options.value[depth], " ]")
                        }
                    });
                }
                else {
                    var criterion = options[kind[i]][depth];
                    if (!criterion) {
                        continue;
                    }
                    if (exceptions.includes(parameter.name)) {
                        continue;
                    }
                    if (getActualName(parameter.name) === criterion) {
                        continue;
                    }
                    context.report({
                        node: parameter,
                        messageId: "default",
                        data: {
                            index: (0, text_1.toOrdinal)(i + 1),
                            depth: (0, text_1.toOrdinal)(depth + 1),
                            kind: kind[i],
                            criterion: criterion
                        }
                    });
                }
            }
        };
        var isStaticObjectCall = function (node, name) {
            if ((node === null || node === void 0 ? void 0 : node.type) !== utils_1.AST_NODE_TYPES.CallExpression) {
                return false;
            }
            if (sourceCode.getText(node.callee) !== "Object.".concat(name)) {
                return false;
            }
            return true;
        };
        var isKeyListLikeName = function (node) {
            switch (node.type) {
                case utils_1.AST_NODE_TYPES.Identifier: return keyListLikeNamePattern.test(node.name);
                case utils_1.AST_NODE_TYPES.CallExpression:
                    if (isStaticObjectCall(node, "keys"))
                        return true;
                    return node.callee.type === utils_1.AST_NODE_TYPES.MemberExpression && isKeyListLikeName(node.callee.object);
            }
            return false;
        };
        (0, type_1.useTypeChecker)(context);
        return {
            CallExpression: function (node) {
                var parameters = getIterativeMethodParameters(node);
                if (!parameters) {
                    return;
                }
                var depth = getCurrentDepth(node);
                if (isStaticObjectCall(parameters.calleeObject, "entries")) {
                    checkParameterNames(resolveKindTable(parameters.name === "reduce" ? 'entriesReduce' : 'entries', parameters.keyish), parameters.list, depth);
                }
                else {
                    checkParameterNames(resolveKindTable(parameters.name, parameters.keyish), parameters.list, depth);
                }
            },
            'ForStatement, ForInStatement, ForOfStatement': function (node) {
                var parameters = getIterativeStatementParameters(node);
                if (!parameters) {
                    return;
                }
                var depth = getCurrentDepth(node);
                if (parameters.calleeObject && isStaticObjectCall(parameters.calleeObject, "entries")) {
                    checkParameterNames(resolveKindTable('entries', parameters.keyish), parameters.list, depth);
                }
                else {
                    checkParameterNames(resolveKindTable(parameters.name, parameters.keyish), parameters.list, depth);
                }
            }
        };
    }
});
function resolveKindTable(key, keyish) {
    var R = __spreadArray([], kindTable[key], true);
    if (keyish) {
        R = R.map(function (v) {
            switch (v) {
                case "value": return "key";
                case "previousValue": return "previousKey";
            }
            return v;
        });
    }
    return R;
}
