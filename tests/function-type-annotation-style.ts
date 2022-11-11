// O
interface O1{
  f():void;
}
type O2 = {
  'f': () => void
};

// X
interface X1{
  f:() => void;
}
type X2 = {
  'f'(): void
};

export {};