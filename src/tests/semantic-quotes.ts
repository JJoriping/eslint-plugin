function f(key:string, value:string, comment?:string){
  console.log(key, value);
}

// O
"x".split('x');
window['Array'] = Array;
window['Array']();
const oFoo = { 'x': 1, [`${1}`]: 2 };
type OBar = { 'x': "y"|"z" }&{ [key in `${number}`]: key };
f(`${"x"}`, "y");

// X
"x".split("x");
window["Array"] = Array;
window["Array"]();
const xFoo = { "x": 1 };
type XBar = { "x": "y"|'z' };
f("x", 'y', 'z');