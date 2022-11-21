"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@typescript-eslint/utils");
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        messages: {
            'default': "Class expression is not allowed."
        },
        schema: []
    },
    defaultOptions: [],
    create: function (context) {
        return {
            ClassExpression: function (node) {
                context.report({ node: node, messageId: "default" });
            }
        };
    }
});
