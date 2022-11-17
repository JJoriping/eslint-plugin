// O
const o = {
  a: 1
};
type O1 = {
  'a': 1
};
declare function o2(foo:{ 'a': 1 }):{
  'a': {
    'b': 1
  }
};
interface O3{
  foo:1;
}

// X
const x = {
  a:1
};
type X1 = {
  'a':1
};
declare function x2(foo : { 'a':1 }): {
  'a':{
    'b':1
  }
};
interface X3{
  foo: 1;
}

export {};