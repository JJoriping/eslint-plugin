declare function f(key:string, value:string, z?:"Z"|"z"):void;
declare function g<T>(target:T, foo:string, ...keys:Array<keyof T>):void;

// O
"x".split('x');
window['Array'] = Array;
window['Array']();
type OBar = { 'o': "y"|"z" }&{ [key in `${number}`]: unknown };
const oFoo:OBar = { 'o': "y", [`${1}`]: `${0}` };
f(`${"x"}`, "y");
type OPick = Pick<typeof window, 'open'|'close'>&{ [key in 'a']: `${key}${key}` };
g(new Image(), "apple", 'src', 'alt');

// X
"x".split("x");
window["Array"] = Array;
window["Array"]();
type XBar = { "x": { 'y': "1"|"2" }, 'key': string };
const xFoo:XBar = { 'x': { "y": '1' }, key: 'a' };
f("x", "y", "z");
type XPick = Pick<typeof window, "open"|"close">&{ [key in "a"]: `${key}${key}` };

export {};