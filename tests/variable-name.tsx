/* eslint-disable prefer-const, @typescript-eslint/no-useless-empty-export, @typescript-eslint/no-empty-interface, react-hooks/rules-of-hooks */
import React, { FC, forwardRef, useRef, ReactNode, ComponentType, ReactElement } from "react";

// O
const O0 = 0;
const o1 = 1;
const [ o2 ] = Array();
let { o3 } = document.body.dataset;
let { WebSocket: O4, ...o5 } = window;
const O6:FC<{ 'foo': ReactNode, 'Bar': ComponentType }> = ({ foo, Bar }) => null;
function o7(foo:(o:number) => void):void{}
class O8{
  public foo:number;

  public bar():number{
    return this.foo;
  }
}
type O9 = number;
interface O10<T>{}
enum O11{
  FOO,
  BAR
}
const $o12 = <a />;
const $o13 = [ new Image(), <b key="1" /> ];
const $o14 = useRef<HTMLElement>(null);
for(const $v of $o13) console.log($v);
$o13.map($v => $v);
const OFifteen = forwardRef((props, ref) => null);
const OSixteen = <T,>() => <a />;
function o17<T>():Array<ReactElement<{ 'foo': T }>>{
  return [];
}

// X
const XOne = 1;
const [ XTwo ] = Array();
let { X3 } = document.body.dataset;
let { WebSocket: x4, ...X5 } = window;
const x6 = forwardRef(Props => null);
function X7(foo:(X:number) => void):void{}
class x8{
  public Foo:number;

  public b_ar():number{
    return this.Foo;
  }
}
type x9 = number;
interface X_10<t>{}
enum X_11{
  Foo,
  bar
}
const x12 = <a />;
const x13 = [ new Image(), <b key="1" /> ];
const x14 = useRef<HTMLElement>(null);
for(const v of x13) console.log(v);
x13.map(v => v);

export {};