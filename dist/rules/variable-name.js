"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@typescript-eslint/utils");
var patterns_1 = require("../utils/patterns");
var type_1 = require("../utils/type");
var CASE_TABLE = {
    'camelCase': patterns_1.camelCasePattern,
    'PascalCase': patterns_1.pascalCasePattern,
    'UPPER_SNAKE_CASE': patterns_1.upperSnakeCasePattern
};
var CASE_TABLE_KEYS = Object.keys(CASE_TABLE);
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        messages: {
            'for-const': "Constant name should follow {{list}}.",
            'for-variable': "Variable name should follow {{list}}.",
            'for-function': "Function name should follow {{list}}.",
            'for-constructible': "Constructible object's name should follow {{list}}.",
            'for-reactComponent': "React component's name should follow {{list}}.",
            'for-parameter': "Parameter name should follow {{list}}.",
            'for-typeAlias': "Type alias name should follow {{list}}.",
            'for-interface': "Interface name should follow {{list}}.",
            'for-generic': "Generic name should follow {{list}}.",
            'for-enum': "Enumerator name should follow {{list}}.",
            'for-enumValue': "Enumerator value's name should follow {{list}}."
        },
        schema: [{
                type: "object",
                properties: {
                    cases: {
                        type: "object",
                        properties: [
                            "const",
                            "variable",
                            "function",
                            "constructible",
                            "reactComponent",
                            "parameter",
                            "typeAlias",
                            "interface",
                            "generic",
                            "enum",
                            "enumValue"
                        ].reduce(function (pv, v) {
                            pv[v] = { type: "array", items: { type: "string", enum: CASE_TABLE_KEYS } };
                            return pv;
                        }, {})
                    },
                    exceptions: { type: "array", items: { type: "string" } }
                }
            }]
    },
    defaultOptions: [{
            cases: {
                const: ["camelCase", "UPPER_SNAKE_CASE"],
                variable: ["camelCase"],
                function: ["camelCase"],
                constructible: ["PascalCase"],
                reactComponent: ["PascalCase"],
                parameter: ["camelCase"],
                typeAlias: ["PascalCase"],
                interface: ["PascalCase"],
                generic: ["PascalCase"],
                enum: ["PascalCase"],
                enumValue: ["UPPER_SNAKE_CASE"]
            },
            exceptions: ["_"]
        }],
    create: function (context, _a) {
        var _b = _a[0], cases = _b.cases, exceptions = _b.exceptions;
        var isConstructible = function (type) { return type.getConstructSignatures().length > 0; };
        var isReactComponent = function (type) {
            var callSignatures = type.getCallSignatures();
            if (!callSignatures.length)
                return false;
            var returnType = context.settings.typeChecker.getReturnTypeOfSignature(callSignatures[0]).getNonNullableType();
            var returnTypeSymbol = returnType.getSymbol();
            if (!returnTypeSymbol)
                return false;
            var returnTypeName = context.settings.typeChecker.getFullyQualifiedName(returnTypeSymbol);
            return returnTypeName === "React.ReactElement";
        };
        var getSemanticType = function (node) {
            var tsType = (0, type_1.getTSTypeByNode)(context, node).getNonNullableType();
            if (isConstructible(tsType))
                return 'constructible';
            if (isReactComponent(tsType))
                return 'reactComponent';
            return null;
        };
        var checkCase = function (type, node) {
            var name;
            switch (node.type) {
                case utils_1.AST_NODE_TYPES.Identifier:
                    name = node.name;
                    break;
                case utils_1.AST_NODE_TYPES.ArrayPattern:
                    for (var _i = 0, _a = node.elements; _i < _a.length; _i++) {
                        var v = _a[_i];
                        if (!v)
                            continue;
                        checkCase(type, v);
                    }
                    return;
                case utils_1.AST_NODE_TYPES.ObjectPattern:
                    for (var _b = 0, _c = node.properties; _b < _c.length; _b++) {
                        var v = _c[_b];
                        checkCase(type, v);
                    }
                    return;
                case utils_1.AST_NODE_TYPES.AssignmentPattern:
                    checkCase(type, node.left);
                    return;
                case utils_1.AST_NODE_TYPES.Property:
                    checkCase(type, node.value);
                    return;
                case utils_1.AST_NODE_TYPES.RestElement:
                    checkCase(type, node.argument);
                    return;
                default: return;
            }
            if (exceptions.includes(name)) {
                return;
            }
            var actualType = getSemanticType(node) || type;
            var valid = cases[actualType].some(function (v) { return CASE_TABLE[v].test(name); });
            if (valid) {
                return;
            }
            context.report({
                node: node,
                messageId: "for-".concat(actualType),
                data: { list: cases[actualType].map(function (v) { return "`".concat(v, "`"); }).join(' or ') }
            });
        };
        (0, type_1.useTypeChecker)(context);
        return {
            VariableDeclarator: function (node) {
                var _a;
                if (((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) !== utils_1.AST_NODE_TYPES.VariableDeclaration) {
                    return;
                }
                if (node.parent.kind === "const") {
                    checkCase('const', node.id);
                }
                else {
                    checkCase('variable', node.id);
                }
            },
            ':function': function (node) {
                if (node.id) {
                    checkCase('function', node.id);
                }
                for (var _i = 0, _a = node.params; _i < _a.length; _i++) {
                    var v = _a[_i];
                    checkCase('parameter', v);
                }
            },
            ClassDeclaration: function (node) {
                if (!node.id) {
                    return;
                }
                checkCase('constructible', node.id);
            },
            PropertyDefinition: function (node) {
                checkCase('variable', node.key);
            },
            MethodDefinition: function (node) {
                checkCase('function', node.key);
            },
            TSPropertySignature: function (node) {
                checkCase('variable', node.key);
            },
            TSMethodSignature: function (node) {
                checkCase('function', node.key);
            },
            TSFunctionType: function (node) {
                for (var _i = 0, _a = node.params; _i < _a.length; _i++) {
                    var v = _a[_i];
                    checkCase('parameter', v);
                }
            },
            TSTypeAliasDeclaration: function (node) {
                checkCase('typeAlias', node.id);
            },
            TSInterfaceDeclaration: function (node) {
                checkCase('interface', node.id);
            },
            TSTypeParameter: function (node) {
                checkCase('generic', node.name);
            },
            TSEnumDeclaration: function (node) {
                checkCase('enum', node.id);
                for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
                    var v = _a[_i];
                    checkCase('enumValue', v.id);
                }
            }
        };
    }
});
