"use strict";
exports.__esModule = true;
function getCurrentVariables(context) {
    var R = {};
    for (var _i = 0, _a = context.getScope().variables; _i < _a.length; _i++) {
        var v = _a[_i];
        R[v.name] = v;
    }
    return R;
}
