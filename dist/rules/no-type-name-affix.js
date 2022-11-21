"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@typescript-eslint/utils");
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        fixable: "code",
        messages: {
            'for-type-alias': "Type alias name should not be `{{pattern}}`.",
            'for-interface': "Interface name should not be `{{pattern}}`."
        },
        schema: [{
                type: "object",
                properties: {
                    invalidTypeAliasNamePattern: { type: "string" },
                    invalidInterfaceNamePattern: { type: "string" },
                    validNames: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }]
    },
    defaultOptions: [{
            invalidTypeAliasNamePattern: /[^A-Z]T(?:ype)?$/.source,
            invalidInterfaceNamePattern: /^I[A-Z][^A-Z]/.source,
            validNames: []
        }],
    create: function (context, _a) {
        var _b = _a[0], invalidTypeAliasNamePatternString = _b.invalidTypeAliasNamePattern, invalidInterfaceNamePatternString = _b.invalidInterfaceNamePattern, validNames = _b.validNames;
        var invalidTypeAliasNamePattern = new RegExp(invalidTypeAliasNamePatternString);
        var invalidInterfaceNamePattern = new RegExp(invalidInterfaceNamePatternString);
        return {
            TSTypeAliasDeclaration: function (node) {
                if (!invalidTypeAliasNamePattern.test(node.id.name)) {
                    return;
                }
                if (validNames.includes(node.id.name)) {
                    return;
                }
                context.report({
                    node: node.id,
                    messageId: "for-type-alias",
                    data: { pattern: invalidTypeAliasNamePatternString }
                });
            },
            TSInterfaceDeclaration: function (node) {
                if (!invalidInterfaceNamePattern.test(node.id.name)) {
                    return;
                }
                if (validNames.includes(node.id.name)) {
                    return;
                }
                context.report({
                    node: node.id,
                    messageId: "for-interface",
                    data: { pattern: invalidInterfaceNamePatternString }
                });
            }
        };
    }
});
