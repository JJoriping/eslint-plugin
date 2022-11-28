/* eslint-disable @typescript-eslint/no-useless-constructor, @typescript-eslint/class-literal-property-style, class-methods-use-this */

// O
class O1{
  public static o1:any;
  protected static o2:any;
  private static o3:any;
  public static get o4():any{
    return 0;
  }
  protected static get o5():any{
    return 0;
  }
  private static get o6():any{
    return 0;
  }

  public static readonly o7 = () => {};
  protected static readonly o8 = () => {};
  private static readonly o9 = () => {};
  public static o10():any{}
  protected static o11():any{}
  private static o12():any{}
  static{
    console.log(1);
  }

  protected readonly o13r:any;
  public o13:any;
  protected o14:any;
  private o15:any;
  public get o16():any{
    return 0;
  }
  protected get o17():any{
    return 0;
  }
  private get o18():any{
    return 0;
  }
  [o19:string]:unknown;

  constructor(){}
  public o20 = () => {};
  protected o21 = () => {};
  private o22 = () => {};
  private o23():any{}
  protected o24():any{}
  public o25():any{}
}
type O2 = {
  'o13': any,
  'o20'?: () => void
};
interface O3{
  o13:any;
  get o16():any;
  [o19:string]:unknown;

  o23():any;
}

// X
class X1{
  private x1:any;
  private x0:any;
  public x2:any;
  constructor(){}
}
type X2 = {
  'o20'?: () => void,
  'o13': any
};
interface X3{
  [o19:string]:unknown;
  o13:any;
  get o17():any;
  get o16():any;
}