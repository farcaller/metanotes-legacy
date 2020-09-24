# remark-metareact

A simple compiler / emitter for unified that converts Markdown AST into React
elements.

Notable differences from remarked-react:

- doesn't parse html and doesn't have a hast step. Markdown nodes are transpiled
  directly into React elements
- doesn't include a set of default components, and requires one (thus can be
  plugged into both react and react-native easily)
- parses the metanotes specific formatting
