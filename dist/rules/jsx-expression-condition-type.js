"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@typescript-eslint/utils");
var typescript_1 = require("typescript");
var type_1 = require("../utils/type");
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "suggestion",
        fixable: "code",
        messages: {
            'default': "Left expression of loginal `&&` operations should not be a number or string."
        },
        schema: []
    },
    defaultOptions: [],
    create: function (context) {
        var hasStringOrNumber = function (type) {
            if (type.isUnionOrIntersection()) {
                return type.types.some(function (v) { return hasStringOrNumber(v); });
            }
            var flags = type.getFlags();
            return Boolean(flags & (typescript_1.TypeFlags.StringLike | typescript_1.TypeFlags.NumberLike));
        };
        (0, type_1.useTypeChecker)(context);
        return {
            'JSXExpressionContainer>LogicalExpression[operator="&&"]': function (node) {
                var tsType = (0, type_1.getTSTypeByNode)(context, node.left).getNonNullableType();
                if (!hasStringOrNumber(tsType)) {
                    return;
                }
                context.report({ node: node.left, messageId: "default" });
            }
        };
    }
});
