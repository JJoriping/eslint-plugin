"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@typescript-eslint/utils");
var text_1 = require("../utils/text");
var type_1 = require("../utils/type");
var iterativeMethods = ["map", "reduce", "every", "some", "forEach", "filter", "find", "findIndex"];
var kindTable = {
    for: ["index"],
    forIn: ["key"],
    forOf: ["value"],
    entries: ["entry", "index"],
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
        schema: [{
                type: "object",
                properties: {
                    entry: { type: "array", items: { type: "string" } },
                    index: { type: "array", items: { type: "string" } },
                    key: { type: "array", items: { type: "string" } },
                    previousValue: { type: "array", items: { type: "string" } },
                    value: { type: "array", items: { type: "string" } }
                }
            }]
    },
    defaultOptions: [{
            entry: ["e", "f", "g", "h", "i"],
            index: ["i", "j", "k", "l", "m"],
            key: ["k", "l", "m", "n", "o"],
            previousValue: ["pv", "pw", "px", "py", "pz"],
            value: ["v", "w", "x", "y", "z"]
        }],
    create: function (context, _a) {
        var options = _a[0];
        var sourceCode = context.getSourceCode();
        var getIterativeStatementParameters = function (node) {
            var _a;
            var name;
            var list;
            var calleeObject = undefined;
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
                        var id = node.left.declarations[0].id;
                        if (id.type !== utils_1.AST_NODE_TYPES.Identifier && id.type !== utils_1.AST_NODE_TYPES.ArrayPattern) {
                            return null;
                        }
                        name = node.type === utils_1.AST_NODE_TYPES.ForInStatement ? "forIn" : "forOf";
                        list = [id];
                        calleeObject = node.right;
                    }
                    break;
                default: return null;
            }
            return { name: name, list: list, calleeObject: calleeObject };
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
                calleeObject: node.callee.object,
                list: node.arguments[0].params
            };
        };
        var getCurrentDepth = function () {
            var R = 0;
            for (var _i = 0, _a = context.getAncestors(); _i < _a.length; _i++) {
                var v = _a[_i];
                switch (v.type) {
                    case utils_1.AST_NODE_TYPES.CallExpression:
                        if (!getIterativeMethodParameters(v)) {
                            continue;
                        }
                        R++;
                        break;
                    case utils_1.AST_NODE_TYPES.ForStatement:
                    case utils_1.AST_NODE_TYPES.ForInStatement:
                    case utils_1.AST_NODE_TYPES.ForOfStatement:
                    case utils_1.AST_NODE_TYPES.WhileStatement:
                    case utils_1.AST_NODE_TYPES.DoWhileStatement:
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
            for (var i = 0; i < parameters.length; i++) {
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
        var isObjectEntriesCall = function (node) {
            if ((node === null || node === void 0 ? void 0 : node.type) !== utils_1.AST_NODE_TYPES.CallExpression) {
                return false;
            }
            if (sourceCode.getText(node.callee) !== "Object.entries") {
                return false;
            }
            return true;
        };
        (0, type_1.useTypeChecker)(context);
        return {
            CallExpression: function (node) {
                var parameters = getIterativeMethodParameters(node);
                if (!parameters) {
                    return;
                }
                var depth = getCurrentDepth();
                if (isObjectEntriesCall(parameters.calleeObject)) {
                    checkParameterNames(kindTable['entries'], parameters.list, depth);
                }
                else {
                    checkParameterNames(kindTable[parameters.name], parameters.list, depth);
                }
            },
            'ForStatement, ForInStatement, ForOfStatement': function (node) {
                var parameters = getIterativeStatementParameters(node);
                if (!parameters) {
                    return;
                }
                var depth = getCurrentDepth();
                if (parameters.calleeObject && isObjectEntriesCall(parameters.calleeObject)) {
                    checkParameterNames(kindTable['entries'], parameters.list, depth);
                }
                else {
                    checkParameterNames(kindTable[parameters.name], parameters.list, depth);
                }
            }
        };
    }
});
