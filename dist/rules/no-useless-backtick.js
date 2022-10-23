"use strict";
exports.__esModule = true;
var utils_1 = require("@typescript-eslint/utils");
exports["default"] = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "problem",
        docs: {
            recommended: "strict",
            description: "Test"
        },
        messages: {
            'test': "1"
        },
        schema: []
    },
    create: function (context) {
        return {
            Program: function () {
                console.log("!");
            }
        };
    },
    defaultOptions: []
});
