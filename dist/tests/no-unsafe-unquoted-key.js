"use strict";
var x = {};
var y = {};
// O
x['foo'] = x.x;
console.log(y['bar']);
// X
x.foo = 1;
y.bar = 2;
