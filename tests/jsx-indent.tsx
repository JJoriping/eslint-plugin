// O
const $o1 = <div>1</div>;
const $o2 = <div />;
console.log(
  <div
    id="1"
  >
  	1
  </div>
);
console.log(
  <div
    id="1"
  />,
  <b id="2">
    1
  </b>
);

// X
const $x1 = <div>1</div >;
const $x2 = <div/>;
console.log(
  < div
    id="1">
  	1
  </ div
  >
);
console.log(
  <div
    id="1" />,
  <b id="2">
  1
  </ b>
);