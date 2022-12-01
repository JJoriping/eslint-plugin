import React from "react";

declare const keys:string[];
declare const list:[null]|string[];

// O
[].map(v => {});
for(const [ k, v ] of Object.entries({})){
  [].map(w => console.log(k, v, w));
}
for(const [ item ] of Array()) console.log(item);
Object.entries(global).map(e => {});
[].map(v => v).filter(v => v);
for(const k of [ "a", "b" ] as const) console.log(k);
while([].some(v => v)) console.log(1);
keys.filter(k => k).map(k => console.log(k));
Object.keys(global).filter(k => k);
console.log(<>
  {list.map((v, i) => (
    <a key={i}>
      {[].map((w, j) => (
        <b key={j} />
      ))}
    </a>
  ))}
</>);

// X
[].map(item => {});
for(const i of []){
  [].reduce((result, object, index) => i, "");
}
[].every(() => {
  for(const [ k, v ] of Object.entries(global)) console.log(k, v);
  return 1;
});
Object.entries(global).map(([ x, y ]) => []);
[].map(v => [].filter(v => v));
for(const v of [ "a", "b" ] as const) console.log(v);
keys.reduce((pv, v) => pv + v.length, 0);

export {};