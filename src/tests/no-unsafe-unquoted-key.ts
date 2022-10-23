const x:Record<string, unknown>&{ 'x'?: 1 } = {};
const y:any = {};

// O
x['foo'] = x.x;
console.log(y['bar']);

// X
x.foo = 1;
y.bar = 2;