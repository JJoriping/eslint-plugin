"use strict";
var x = {};
var y = {};
var z;
// O
x['foo'] = z === null || z === void 0 ? void 0 : z.x;
console.log(y['bar']);
// X
x.foo = 1;
y.bar = 2;
