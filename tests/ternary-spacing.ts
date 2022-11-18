const foo = Math.random();

// O
console.log(foo > 0.5
  ? 1
  : 2
);
console.log(foo < 0.1
  ? Math.random() < 0.5
    ? 1
    : 2
  : foo < 0.3
  ? 3
  : 4
);

// X
console.log(foo > 0.5
  ? 1 : 2
);
console.log(foo < 0.1
  ? Math.random() < 0.5
    ? 1
  : 2
  : foo < 0.3
    ? 3
    : 4
);

export {};