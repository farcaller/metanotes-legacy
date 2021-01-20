```js
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

a better debug inline:

```js
function debuginline(n,p) {
  return components.Parsimmon((s, i) => {
    console.group(`${n} [${JSON.stringify(s.slice(i))}]`);
    return components.Parsimmon.makeSuccess(i);
  }).then(p.or(components.Parsimmon((s, i) => {
    console.log('failed');
    console.groupEnd();
    return components.Parsimmon.makeFailure(i);
  }))).map(s=>{
    console.log('success:',  s);
    console.groupEnd();
    return s;
  }).skip(components.Parsimmon((s, i) => {
    console.log(`[${JSON.stringify(s.slice(i))}]`);
    return components.Parsimmon.makeSuccess(i);
  }));
}

function Inline(r) {
  let a = [
    'Str',
    'Endline',
    // | UlOrStarLine
    'Space',
    'Strong',
    // | Emph
    // | Strike
    // | Image
    // | Link
    // | NoteReference
    // | InlineNote
    // | Code
    // | RawHtml
    // | Entity
    // | EscapedChar
    // | Smart
    'Symbol',
  ];
  a = a.map(i=>debuginline(i,r[i]));
  return alt(...a);
}
```
