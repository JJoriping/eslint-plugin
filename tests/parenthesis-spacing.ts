/*
  I insert a space after opening, except the case when the target consists of exactly one object or array.
  I insert a space before closing, except the case when it becomes a part of closing streak at the starting point of its line.
*/

// O
const o1 = [[ 1 ]];
const o2 = [ {}, [{}] ];
console.log([{}].concat([ {
  o: 1
}])[[ 0 ][0]]);

// X
const x1 = [ [ 1 ] ];
const x2 = [{}, [ {} ]];
console.log(
  [ { x: 1 } ].concat([ {
    x: 2
  }])
);

export {};