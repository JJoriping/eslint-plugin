"use strict";
var _a;
function f(key, value, comment) {
    console.log(key, value);
}
// O
"x".split('x');
window['Array'] = Array;
window['Array']();
var oFoo = (_a = { 'x': 1 }, _a["".concat(1)] = 2, _a);
f("".concat("x"), "y");
// X
"x".split("x");
window["Array"] = Array;
window["Array"]();
var xFoo = { "x": 1 };
f("x", 'y', 'z');
