## JSON Document

Model and manipulate data with ES6 classes, JSON Schema initialization and validation, JSON Patch, JSON Pointer, and JSON Mappings. 

* works in Nodejs and the browser
* compiled schema initialization and validation methods
* high-level JSONDocument class for ease of use
* zero production dependencies
* compatible with webpack

### Specifications

* [JSON Schema](http://json-schema.org/documentation.html)
* [JSON Patch](https://tools.ietf.org/html/rfc6902) RFC 6902
* [JSON Pointer](https://tools.ietf.org/html/rfc6901) RFC 6901
* JSON Mapping

## Status

Alpha code undergoing rigorous testing and refactoring prior to first production release.

## Known Issues

* Initializer
	* Arrays nested within arrays
	* Multiple defaults in the same tree

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

`JSONSchema` is a class that implements initialization and validation of
JSON/JavaScript values based on the JSON Schema standard. The `initialize` and
`validate` methods of this class are compiled into simple "flat" code without
iteration for performance.

```javascript
let schema = new JSONSchema({
  type: 'object',
  properties: {
    foo: { maxLength: 5 }
  }
})

schema.validate({ foo: 'too long' })
// => { valid: false, errors: [{...}] }
```

Schemas can be extended. This is useful for class inheritance, as we'll see
with JSONDocument.

```
let extended = schema.extend({
  type: ['object', 'array'],
  items: { type: 'integer' }
})
// => JSONSchema {
//      type: ['object', 'array'],
//      properties: { foo: { maxLength: 5 } }
//      items: { type: 'integer' } }
```

All JSON Schema validation keywords are currently supported except for `ref`, 
`remoteRef`, and `definitions`.

### JSONMapping

JSON Mappings can read data from one data structure and write to a different 
one. This is useful for translating data received in one format into another
format, for example getting user info from Facebook and storing it in our 
user records, which have a different schema.

Mappings must be declared before use. They're expressed as an object with 
JSON Pointer strings for keys and values.

```javascript
let mapping = new JSONMapping({
  '/foobar': '/foo/bar/0'
})
```

Now, give a source object to read from and a target object to write to, we can
map and project over a map.

```javascript
let target = {}
let source = { foo: { bar: ['baz'] } }

mapping.map(target, source)
// target => { foobar: 'baz' }
```

JSON Mappings also have a method for the reverse operation called `project`.

### JSONPatch

JSON Patch describes modifications to an object that are impossible to achieve 
by simple property assignment approaches. For example, if the value of a key in
an update object is undefined, does that mean the new value is undefined, that 
the key should be deleted, or that no change should be made. JSON Patch 
eliminates that kind of ambiguity.

Given a target object `{ "foo": ["bar", "qux", "baz"] }`, we could remove the
second element of the `foo` array like so:

```javascript
let patch = new JSONPatch([
  { op: 'remove', path: '/foo/1' }
])

let target = { foo: ['bar', 'qux', 'baz'] }

patch.apply(target)
// target is mutated to 
// =>
//  { foo: [ 'bar', 'baz' ] }
```

### JSONPointer

`JSONPointer` can parse JSON Pointer strings and use them to `get`, `add`, 
`replace`, and `remove` values from an object.

```javascript
let pointer = new JSONPointer('/foo/1')
let object = { foo: ['bar', 'baz'] }

pointer.get(object)             // => 'baz'
pointer.add(object, 'qux')      // => { foo: ['bar', 'qux', 'baz'] }
pointer.replace(object, 'quux') // => { foo: ['bar', 'quux', 'baz'] }
pointer.remove(object)          // => { foo: ['bar', 'baz'] }
```

### JSONDocument

```javascript
class Foo extends JSONDocument {
  static get schema () {
    return schema // JSONSchema instance
  }
}

let foo = new Foo({ a: 1, b: 2 })
foo.validate()
// if valid => { valid: true, errors: [] }
// if invalid => { valid: false, errors: [{...}, {...}, ...] }

foo.patch([{ op: 'add', path: '/c', value: 3 }])
foo.project(mapping)
```

### Formats

JSONSchema can be extended with additional named formats. `pattern` can
be a RegExp instance or a string representation of a regular expression.

```javascript
Formats.register('new-format', pattern)

let schema = new JSONSchema({
  type: 'string',
  format: 'new-format'
})
```

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
