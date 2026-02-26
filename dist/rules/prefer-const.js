"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@typescript-eslint/utils");
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        fixable: "code",
        messages: {
            'default': "`{{name}}` can be a constant."
        },
        schema: []
    },
    defaultOptions: [],
    create: function (context) {
        var sourceCode = context.getSourceCode();
        var reassignedIdentifierTable = {};
        var getKey = function (_a) {
            var scope = _a.scope, name = _a.name;
            return "".concat(scope.block.range[0], ",").concat(scope.block.range[1], "/").concat(name);
        };
        return {
            Program: function (node) {
                var variables = getReassignedVariables(sourceCode.getScope(node));
                for (var _i = 0, variables_1 = variables; _i < variables_1.length; _i++) {
                    var v = variables_1[_i];
                    reassignedIdentifierTable[getKey(v)] = true;
                }
            },
            VariableDeclaration: function (node) {
                if (node.kind !== "let") {
                    return;
                }
                var scope = sourceCode.getScope(node);
                var kindToken = sourceCode.getFirstToken(node);
                for (var _i = 0, _a = node.declarations; _i < _a.length; _i++) {
                    var v = _a[_i];
                    if (v.id.type !== utils_1.AST_NODE_TYPES.Identifier)
                        continue;
                    var variable = scope.set.get(v.id.name);
                    if (variable && reassignedIdentifierTable[getKey(variable)])
                        continue;
                    context.report({
                        node: v,
                        messageId: "default",
                        data: { name: v.id.name },
                        fix: function (fixer) {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, fixer.replaceText(kindToken, "const")];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }
                    });
                }
            }
        };
    }
});
function getReassignedVariables(scope, parentSet) {
    var _a;
    if (parentSet === void 0) { parentSet = {}; }
    var R = [];
    var set = __assign(__assign({}, parentSet), Object.fromEntries(scope.set.entries()));
    for (var _i = 0, _b = scope.references; _i < _b.length; _i++) {
        var v = _b[_i];
        if (v.from !== scope)
            continue;
        if (((_a = v.identifier.parent) === null || _a === void 0 ? void 0 : _a.type) === utils_1.AST_NODE_TYPES.VariableDeclarator)
            continue;
        if (!v.isWrite())
            continue;
        var variable = set[v.identifier.name];
        if (!variable)
            continue;
        R.push(variable);
    }
    for (var _c = 0, _d = scope.childScopes; _c < _d.length; _c++) {
        var v = _d[_c];
        R.push.apply(R, getReassignedVariables(v, set));
    }
    return R;
}
