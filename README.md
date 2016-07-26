## JSON Document

Model and manipulate data with ES6 classes, JSON Schema initialization and validation, JSON Patch, JSON Pointer, and JSON Mappings. 

* works in Nodejs and the browser
* compiled schema initialization and validation methods
* high-level JSONDocument class for ease of use
* compatible with webpack

### Specifications

* [JSON Schema](http://json-schema.org/documentation.html)
* [JSON Patch](https://tools.ietf.org/html/rfc6902) RFC 6902
* [JSON Pointer](https://tools.ietf.org/html/rfc6901) RFC 6901
* JSON Mapping

## Status

Alpha code undergoing rigorous testing and refactoring prior to first production release.

## Install

From npm registry:

```bash
$ npm install json-document@beta
```

From GitHub repository:

```bash
$ npm install https://github.com/anvilresearch/json-document.git
```

## Usage

### Module loading

```javascript
const {
  JSONSchema,
  JSONMapping,
  JSONPatch,
  JSONPointer,
  JSONDocument,
  Formats
} = require('json-document')
```

### JSONSchema
### JSONMapping
### JSONPatch
### JSONPointer
### JSONDocument
### Formats

## Running tests

### Nodejs

```bash
$ npm test
```

### Browser (karma)

```bash
$ npm run karma
```

## MIT License

Copyright (c) 2016 Anvil Research, Inc.
