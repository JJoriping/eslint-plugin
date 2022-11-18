enum X{
  FOO,
  BAR
}

declare const o1:boolean;
declare const o2:Function|null;
declare const x1:number;
declare const x2:string;
declare const x3:X|undefined;

// O
console.log(<>
  {o1 && 1}
  {o2 && 2}
</>);

// X
console.log(<>
  {x1 && 1}
  {x2 && 2}
  {x3 && 3}
</>);