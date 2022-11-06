"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var simpleNamePattern = /^\w+$/;
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "layout",
        fixable: "code",
        messages: {
            'for-type-alias': "Simple key name in a type alias should be quoted with `{{quotation}}`.",
            'for-interface': "Simple key name in an interface should be quoted with `{{quotation}}`.",
            'for-object': "Simple key name in an object should be quoted with `{{quotation}}`."
        },
        schema: [{
                type: "object",
                properties: {
                    typeAlias: { type: "string", enum: ["none", "'", "\""] },
                    object: { type: "string", enum: ["none", "'", "\""] },
                    interface: { type: "string", enum: ["none", "'", "\""] }
                }
            }]
    },
    defaultOptions: [{
            forTypeAlias: "'",
            forObject: "none",
            forInterface: "none"
        }],
    create: function (context, _a) {
        var _b = _a[0], forTypeAlias = _b.forTypeAlias, forObject = _b.forObject, forInterface = _b.forInterface;
        var isSimple = function (node) {
            switch (node.type) {
                case utils_1.AST_NODE_TYPES.Identifier: return simpleNamePattern.test(node.name);
                case utils_1.AST_NODE_TYPES.Literal: return typeof node.value === "string" && simpleNamePattern.test(node.value);
            }
            return false;
        };
        var getKeyQuotationStyle = function (node) {
            if (node.type === utils_1.AST_NODE_TYPES.Identifier) {
                if (!simpleNamePattern.test(node.name)) {
                    return null;
                }
                return { style: "none", name: node.name };
            }
            if (node.type === utils_1.AST_NODE_TYPES.Literal && typeof node.value === "string") {
                if (!simpleNamePattern.test(node.value)) {
                    return null;
                }
                return { style: node.raw[0], name: node.value };
            }
            return null;
        };
        var checkMembers = function (list, as, messageId) {
            var _loop_1 = function (v) {
                if (v.computed) {
                    return { value: void 0 };
                }
                var style = getKeyQuotationStyle(v.key);
                if (style === null) {
                    return { value: void 0 };
                }
                if (style.style === as) {
                    return { value: void 0 };
                }
                context.report({
                    node: v.key,
                    messageId: messageId,
                    data: { quotation: as },
                    fix: function (fixer) {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fixer.replaceText(v.key, as + style.name + as)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }
                });
            };
            for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                var v = list_1[_i];
                var state_1 = _loop_1(v);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
        };
        return {
            TSTypeLiteral: function (node) {
                var filteredMembers = node.members.filter(function (v) { return v.type === utils_1.AST_NODE_TYPES.TSPropertySignature; });
                if (!filteredMembers.every(function (v) { return isSimple(v.key); })) {
                    return;
                }
                checkMembers(filteredMembers, forTypeAlias, 'for-type-alias');
            },
            TSInterfaceBody: function (node) {
                var filteredMembers = node.body.filter(function (v) { return v.type === utils_1.AST_NODE_TYPES.TSPropertySignature; });
                if (!filteredMembers.every(function (v) { return isSimple(v.key); })) {
                    return;
                }
                checkMembers(filteredMembers, forInterface, 'for-interface');
            },
            ObjectExpression: function (node) {
                var filteredMembers = node.properties.filter(function (v) { return v.type === utils_1.AST_NODE_TYPES.Property; });
                if (!filteredMembers.every(function (v) { return isSimple(v.key); })) {
                    return;
                }
                checkMembers(filteredMembers, forObject, 'for-object');
            }
        };
    }
});
