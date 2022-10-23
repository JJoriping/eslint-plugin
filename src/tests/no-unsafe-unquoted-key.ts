const x:Record<string, unknown>&{ 'x'?: 1 } = {};
const y:any = {};
const z:{ 'x': 1 }|undefined;

// O
x['foo'] = z?.x;
console.log(y['bar']);

// X
x.foo = 1;
y.bar = 2;