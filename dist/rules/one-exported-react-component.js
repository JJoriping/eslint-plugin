"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@typescript-eslint/utils");
var type_1 = require("../utils/type");
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "suggestion",
        messages: {
            'default': "Only one React component is allowed to be exported in a file."
        },
        schema: []
    },
    defaultOptions: [],
    create: function (context) {
        var alreadyExported = false;
        (0, type_1.useTypeChecker)(context);
        return {
            ExportNamedDeclaration: function (node) {
                var _a;
                if (((_a = node.declaration) === null || _a === void 0 ? void 0 : _a.type) !== utils_1.AST_NODE_TYPES.VariableDeclaration) {
                    return;
                }
                for (var _i = 0, _b = node.declaration.declarations; _i < _b.length; _i++) {
                    var v = _b[_i];
                    var tsType = (0, type_1.getTSTypeByNode)(context, v.id);
                    if (!(0, type_1.isReactComponent)(context, tsType)) {
                        continue;
                    }
                    if (!alreadyExported) {
                        alreadyExported = true;
                        continue;
                    }
                    context.report({ node: v, messageId: "default" });
                }
            },
            ExportSpecifier: function (node) {
                var tsType = (0, type_1.getTSTypeByNode)(context, node.local);
                if (!(0, type_1.isReactComponent)(context, tsType)) {
                    return;
                }
                if (!alreadyExported) {
                    alreadyExported = true;
                    return;
                }
                context.report({ node: node.local, messageId: "default" });
            }
        };
    }
});
