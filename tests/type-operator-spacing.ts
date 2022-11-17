// O
const o = 1 + 2;
type O1 = 1|2;
type O2 = 1
  | 2
;
type O3 = () => 1;

// X
const x = 1+2;
type X1 = 1 | 2;
type X2 = 1
  |2
;
type X3 = 1 &
  2
;
type X4 = ()=>1;