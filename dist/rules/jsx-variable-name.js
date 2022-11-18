"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@typescript-eslint/utils");
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        fixable: "code",
        messages: {
            'default': ""
        },
        schema: []
    },
    defaultOptions: [],
    create: function (context) {
        return {
            VariableDeclarator: VariableDeclarator
        };
    }
});
