// O
[].map(v => {});
for(const [ k, v ] of Object.entries({})){
  [].map(w => console.log(k, v, w));
}
for(const [ item ] of []) console.log(item);
Object.entries(global).map(e => {});

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