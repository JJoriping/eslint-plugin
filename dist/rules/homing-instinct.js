"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@typescript-eslint/utils");
var desirousnessPattern = /집에\s*가고\s*싶다/;
exports.default = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: "problem",
        messages: {
            'default': "집에 가기까지 {{left}} 남았습니다... 🥺"
        },
        schema: [{
                type: "object",
                properties: {
                    hourFrom: { type: "integer" },
                    hourTo: { type: "integer" },
                    ignoreWeekend: { type: "boolean" }
                }
            }]
    },
    defaultOptions: [{
            hourFrom: 9,
            hourTo: 18,
            ignoreWeekend: true
        }],
    create: function (context, _a) {
        var _b = _a[0], hourFrom = _b.hourFrom, hourTo = _b.hourTo, ignoreWeekend = _b.ignoreWeekend;
        var now = new Date();
        var sourceCode = context.getSourceCode();
        var weekend = now.getDay() % 6 === 0;
        var inRange = hourFrom <= now.getHours() && now.getHours() < hourTo;
        if (ignoreWeekend && weekend) {
            return {};
        }
        if (!inRange) {
            return {};
        }
        return {
            Program: function () {
                var left = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourTo).getTime() - now.getTime();
                var leftMinutes = Math.floor(left / 60000);
                for (var _i = 0, _a = sourceCode.getAllComments(); _i < _a.length; _i++) {
                    var v = _a[_i];
                    if (!desirousnessPattern.test(v.value)) {
                        continue;
                    }
                    context.report({
                        node: v,
                        messageId: "default",
                        data: {
                            left: leftMinutes > 60
                                ? "".concat(Math.floor(leftMinutes / 60), "\uC2DC\uAC04 ").concat(leftMinutes % 60, "\uBD84")
                                : leftMinutes > 0
                                    ? "".concat(leftMinutes, "\uBD84")
                                    : "1분도 안"
                        }
                    });
                }
            }
        };
    }
});
