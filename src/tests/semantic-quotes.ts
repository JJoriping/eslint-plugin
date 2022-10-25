function f(key:string, value:string, z?:"Z"|"z"):void{
  console.log(key, value);
}

// O
"x".split('x');
window['Array'] = Array;
window['Array']();
type OBar = { 'o': "y"|"z" }&{ [key in `${number}`]: unknown };
const oFoo:OBar = { 'o': "y", [`${1}`]: `${0}` };
f(`${"x"}`, "y");

// X
"x".split("x");
window["Array"] = Array;
window["Array"]();
type XBar = { "x": { 'y': "1"|"2" }, 'key': string };
const xFoo:XBar = { 'x': { "y": '1' }, key: 'a' };
f("x", "y", "z");