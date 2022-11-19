// O
console.log({
  a: { x: 1, y: 2 },
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f(){
    if(Math.random() > 0.5){
      console.log(1);
    }else{
      console.log(2);
    }
  },

  a1: true,
  b1: false
});
class O1{
  public a8:any;
  public a9:any;
  public a10:any;
  public a11:any;
  public a12:any;
}
type O2 = {
  'foo': 1,
  'bar': 2,
  'baz': 3
};

// X
console.log({
  c: 3,
  b: 2,
  f(){
    if(Math.random() > 0.5){
      console.log(1);
    }else{
      console.log(2);
    }
  },
  e: 5,
  a: { x: 1, y: 2 },
  d: 4,

  b1: false,
  a1: true
});
class X1{
  /**
   * Test comment 1 (should not be removed!)
   */
  public a10:any;
  // Test comment 2 (should not be removed!)
  public a11:any;
  public a12:any;
  public a8:any; // Test comment 3 (should not be removed!)
  public a9:any;
}
type X2 = {
  'e': 5,
  'd': 4,
  'c': 3,
  'b': 2,
  'a': 1
};
interface X3{
  d():void;
  e():void;
  c(foo:number):void;
  a():void;
  b():void;
}

export {};