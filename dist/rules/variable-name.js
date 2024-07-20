"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@typescript-eslint/utils");
var patterns_1 = require("../utils/patterns");
var type_1 = require("../utils/type");
var CASE_TABLE = {
    camelCase: patterns_1.camelCasePattern,
    PascalCase: patterns_1.pascalCasePattern,
    UPPER_SNAKE_CASE: patterns_1.upperSnakeCasePattern
};
var CASE_TABLE_KEYS = Object.keys(CASE_TABLE);
var allGenericsPattern = /<.+>/g;
var reactComponentTypePattern = /^(ComponentType|ComponentClass|FunctionComponent|ForwardRefExoticComponent|NextPage)\b/;
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        messages: {
            'for-const': "Constant name should follow {{list}}.",
            'for-constructible': "Constructible object's name should follow {{list}}.",
            'for-enum': "Enumerator name should follow {{list}}.",
            'for-enumValue': "Enumerator value's name should follow {{list}}.",
            'for-function': "Function name should follow {{list}}.",
            'for-generic': "Generic name should follow {{list}}.",
            'for-interface': "Interface name should follow {{list}}.",
            'for-mappedKey': "Mapped key name should follow {{list}}.",
            'for-parameter': "Parameter name should follow {{list}}.",
            'for-reactComponent': "React component's name should follow {{list}}.",
            'for-typeAlias': "Type alias name should follow {{list}}.",
            'for-variable': "Variable name should follow {{list}}.",
            'for-catchParameter': "Catch parameter name should follow the pattern `{{pattern}}`.",
            'for-domVariable': "Name of the DOM-typed variable `{{type}}` should follow the pattern `{{pattern}}`."
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
                            "mappedKey",
                            "enum",
                            "enumValue"
                        ].reduce(function (pv, v) {
                            pv[v] = { type: "array", items: { type: "string", enum: CASE_TABLE_KEYS } };
                            return pv;
                        }, {})
                    },
                    names: {
                        type: "object",
                        properties: {
                            domVariable: { type: "string" },
                            catchParameter: { type: "string" }
                        }
                    },
                    domTypePatterns: { type: "array", items: { type: "string" } },
                    exceptions: { type: "array", items: { type: "string" } }
                }
            }]
    },
    defaultOptions: [{
            cases: {
                const: ["camelCase", "UPPER_SNAKE_CASE"],
                constructible: ["PascalCase"],
                enum: ["PascalCase"],
                enumValue: ["UPPER_SNAKE_CASE"],
                function: ["camelCase"],
                generic: ["PascalCase"],
                interface: ["PascalCase"],
                mappedKey: ["camelCase"],
                parameter: ["camelCase"],
                reactComponent: ["PascalCase"],
                typeAlias: ["PascalCase"],
                variable: ["camelCase"]
            },
            names: {
                domVariable: /^\$/.source,
                catchParameter: /^error$/.source
            },
            domTypePatterns: patterns_1.domTypePatterns.map(function (v) { return v.source; }),
            exceptions: ["_", "R", "$R"]
        }],
    create: function (context, _a) {
        var _b = _a[0], cases = _b.cases, names = _b.names, domTypePatternStrings = _b.domTypePatterns, exceptions = _b.exceptions;
        var NAME_TABLE = {
            domVariable: new RegExp(names.domVariable),
            catchParameter: new RegExp(names.catchParameter)
        };
        var domTypePatterns = domTypePatternStrings.map(function (v) { return new RegExp(v); });
        var isConstructible = function (type) { return type.getConstructSignatures().length > 0; };
        var isDOMObject = function (type) {
            var typeString = (0, type_1.typeToString)(context, type);
            if (typeString.startsWith("(")
                || typeString.startsWith("{")
                || typeString.startsWith("<")) {
                return false;
            }
            var filteredTypeString = typeString.replace(allGenericsPattern, "");
            return domTypePatterns.some(function (v) { return v.test(filteredTypeString); });
        };
        var getSemanticType = function (node) {
            var _a, _b;
            if (((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) === utils_1.AST_NODE_TYPES.CatchClause)
                return ['names', 'catchParameter'];
            var tsType = (0, type_1.getTSTypeByNode)(context, node).getNonNullableType();
            if (isConstructible(tsType))
                return ['cases', 'constructible'];
            if ((0, type_1.isDOMReturningFunction)(context, tsType, domTypePatterns)
                || reactComponentTypePattern.test((0, type_1.typeToString)(context, tsType)))
                return ['cases', 'reactComponent'];
            if (((_b = node.parent) === null || _b === void 0 ? void 0 : _b.type) !== utils_1.AST_NODE_TYPES.TSTypeAliasDeclaration && isDOMObject(tsType)) {
                return ['names', 'domVariable'];
            }
            return null;
        };
        var checkCase = function (type, node) {
            var _a;
            var name;
            switch (node.type) {
                case utils_1.AST_NODE_TYPES.Identifier:
                    name = node.name;
                    break;
                case utils_1.AST_NODE_TYPES.ArrayPattern:
                    for (var _i = 0, _b = node.elements; _i < _b.length; _i++) {
                        var v = _b[_i];
                        if (!v)
                            continue;
                        checkCase(type, v);
                    }
                    return;
                case utils_1.AST_NODE_TYPES.ObjectPattern:
                    for (var _c = 0, _d = node.properties; _c < _d.length; _c++) {
                        var v = _d[_c];
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
            var actualType = getSemanticType(node) || ['cases', type];
            var data;
            switch (actualType[0]) {
                case "cases":
                    if (cases[actualType[1]].some(function (v) { return CASE_TABLE[v].test(name); })) {
                        return;
                    }
                    data = { list: cases[actualType[1]].map(function (v) { return "`".concat(v, "`"); }).join(' or ') };
                    break;
                case "names":
                    if (((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) === utils_1.AST_NODE_TYPES.Property && node.parent.shorthand) {
                        return;
                    }
                    if (NAME_TABLE[actualType[1]].test(name)) {
                        return;
                    }
                    data = {
                        pattern: NAME_TABLE[actualType[1]].source,
                        type: (0, type_1.typeToString)(context, (0, type_1.getTSTypeByNode)(context, node))
                    };
                    break;
            }
            context.report({ node: node, messageId: "for-".concat(actualType[1]), data: data });
        };
        (0, type_1.useTypeChecker)(context);
        return {
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
            MethodDefinition: function (node) {
                checkCase('function', node.key);
            },
            PropertyDefinition: function (node) {
                checkCase(node.readonly ? 'const' : 'variable', node.key);
            },
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
            TSEnumDeclaration: function (node) {
                checkCase('enum', node.id);
                for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
                    var v = _a[_i];
                    checkCase('enumValue', v.id);
                }
            },
            TSFunctionType: function (node) {
                for (var _i = 0, _a = node.params; _i < _a.length; _i++) {
                    var v = _a[_i];
                    checkCase('parameter', v);
                }
            },
            TSInterfaceDeclaration: function (node) {
                checkCase('interface', node.id);
            },
            TSMethodSignature: function (node) {
                checkCase('function', node.key);
            },
            TSPropertySignature: function (node) {
                checkCase('variable', node.key);
            },
            TSTypeAliasDeclaration: function (node) {
                checkCase('typeAlias', node.id);
            },
            TSTypeParameter: function (node) {
                var _a;
                if (((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) === utils_1.AST_NODE_TYPES.TSMappedType) {
                    checkCase('mappedKey', node.name);
                }
                else {
                    checkCase('generic', node.name);
                }
            }
        };
    }
});
