```
const tap = (message) => (x) => {
  console.log(`${message} '${x}'`);
  return components.Parsimmon.succeed(x);
};

const failX = (d) => {
  return components.Parsimmon.Parser(function (input, i) {
    console.log(`fail ${d} '${input.slice(i)}'`);
    return components.Parsimmon.makeFailure(i);
  });
}

const wrap = (d, p) => {
  return p().or(failX(d)).chain(tap(d));
}
```
