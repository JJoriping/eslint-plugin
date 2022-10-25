// O
class O{
  public static f():number{
    return 1;
  }
}
function o(){
  if(Math.random() < 0.5) return;
  return { a: 1 };
}

// X
class X{
  public static f(){}
}
function x(){
  if(Math.random() < 0.5) return;
  return 1;
}

export {};