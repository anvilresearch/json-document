'use strict'

/**
 * Test dependencies
 */
const cwd = process.cwd()
const path = require('path')
const chai = require('chai')

/**
 * Assertions
 */
chai.should()
let expect = chai.expect

/**
 * Code under test
 */
const Initializer = require('../src/Initializer')


/**
 * Tests
 */
let tests = {


  /**
   * These tests are for a simple non-nested object. They cover assignment from
   * the input to the target, empty and false values, unexpected types, defaults,
   * existing values on the target object, options, and unspecified properties.
   */
  'level 1 object property assignment': [

    {
      assertion: 'should assign source values of expected type to target',
      schema: {
        properties: {
          a: { type: 'array' },
          b: { type: 'boolean' },
          c: { type: 'integer' },
          d: { type: 'null' },
          e: { type: 'number' },
          f: { type: 'object' },
          g: { type: 'string' },
          h: { type: 'undefined' }
        }
      },
      target: {},
      source: {
        a: [],
        b: true,
        c: 1,
        d: null,
        e: 3.14,
        f: {},
        g: 'value',
        h: undefined
      },
      result: {
        a: [],
        b: true,
        c: 1,
        d: null,
        e: 3.14,
        f: {},
        g: 'value',
        h: undefined
      }
    },

    {
      assertion: 'should assign source values of unexpected type to target',
      schema: {
        properties: {
          a: { type: 'array' },
          b: { type: 'boolean' },
          c: { type: 'integer' },
          d: { type: 'null' },
          e: { type: 'number' },
          f: { type: 'object' },
          g: { type: 'string' },
          h: { type: 'undefined' }
        }
      },
      target: {},
      source: {
        a: true,
        b: 1,
        c: null,
        d: 3.14,
        e: {},
        f: 'value',
        g: undefined,
        h: []
      },
      result: {
        a: true,
        b: 1,
        c: null,
        d: 3.14,
        e: {},
        f: 'value',
        g: undefined,
        h: []
      }
    },

    {
      assertion: 'should assign falsy source values to target',
      schema: {
        properties: {
          a: { type: 'boolean' },
          b: { type: 'integer' },
          c: { type: 'null' },
          d: { type: 'number' },
          e: { type: 'string' },
          f: { type: 'undefined' }
        }
      },
      target: {},
      source: {
        a: false,
        b: 0,
        c: null,
        d: 0.00,
        e: '',
        f: undefined
      },
      result: {
        a: false,
        b: 0,
        c: null,
        d: 0.00,
        e: '',
        f: undefined
      }
    },

    {
      assertion: 'should not assign specified values not present on source to target',
      schema: {
        properties: {
          a: { type: 'array' },
          b: { type: 'boolean' },
          c: { type: 'integer' },
          d: { type: 'null' },
          e: { type: 'number' },
          f: { type: 'object' },
          g: { type: 'string' },
          h: { type: 'undefined' }
        }
      },
      target: {},
      source: { b: true },
      result: { b: true }
    },

    {
      assertion: 'should not assign unspecified values on source to target',
      schema: {
        properties: {
          c: { type: 'array' },
          d: { type: 'boolean' },
          e: { type: 'integer' },
          f: { type: 'null' },
          g: { type: 'number' },
          h: { type: 'object' },
          i: { type: 'string' },
          j: { type: 'undefined' }
        }
      },
      target: {},
      source: {
        a: 0,
        b: 1,
        c: [],
        d: true,
        k: [],
        l: true,
        e: 1,
        m: 0,
        n: null,
        o: 3.14,
        p: {},
        q: 'value',
        r: undefined
      },
      result: {
        c: [],
        d: true,
        e: 1
      }
    },

    {
      assertion: 'should optionally assign unspecified values on source to target',
      schema: {
        properties: {
          c: { type: 'array' },
          d: { type: 'boolean' },
          e: { type: 'integer' },
          f: { type: 'null' },
          g: { type: 'number' },
          h: { type: 'object' },
          i: { type: 'string' },
          j: { type: 'undefined' }
        }
      },
      target: {},
      source: {
        a: 0,
        b: 1,
        c: [],
        d: true,
        k: [],
        l: true,
        e: 1,
        m: 0,
        n: null,
        o: 3.14,
        p: {},
        q: 'value',
        r: undefined
      },
      options: {
        filter: false
      },
      result: {
        a: 0,
        b: 1,
        c: [],
        d: true,
        k: [],
        l: true,
        e: 1,
        m: 0,
        n: null,
        o: 3.14,
        p: {},
        q: 'value',
        //r: undefined // NOTE: Deep copy with JSON.parse/stringify breaks this
      }
    },

    {
      assertion: 'should leave target values not present on source intact',
      schema: {
        properties: {
          a: { type: 'array' },
          b: { type: 'boolean' },
          c: { type: 'integer' },
          d: { type: 'null' },
          e: { type: 'number' },
          f: { type: 'object' },
          g: { type: 'string' },
          h: { type: 'undefined' }
        }
      },
      target: {
        a: [],
        b: true,
        c: 1,
        d: null,
        e: 3.14,
        f: {},
      },
      source: {
        g: 'value',
        h: undefined
      },
      result: {
        a: [],
        b: true,
        c: 1,
        d: null,
        e: 3.14,
        f: {},
        g: 'value',
        h: undefined
      }
    },
    {
      assertion: 'should override values present on target with source values',
      schema: {
        properties: {
          a: { type: 'array' },
          b: { type: 'boolean' },
          c: { type: 'integer' },
          d: { type: 'null' },
          e: { type: 'number' },
          f: { type: 'object' },
          g: { type: 'string' },
          h: { type: 'undefined' }
        }
      },
      target: {
        a: [],
        b: true,
        c: 1,
        d: null,
        e: 3.14,
        f: {},
        g: 'original',
        h: undefined
      },
      source: {
        a: [ 0, 1, 2 ],
        b: false,
        c: 0,
        d: false,
        e: 3.1459,
        f: { x: -3 },
        g: 'changed',
        h: null
      },
      result: {
        a: [ 0, 1, 2 ],
        b: false,
        c: 0,
        d: false,
        e: 3.1459,
        f: { x: -3 },
        g: 'changed',
        h: null
      }
    },
    {
      assertion: 'should assign default values when source values are not present',
      schema: {
        properties: {
          a: { type: 'array', default: [ 1, 1, 2, 3, 5, 8 ] },
          b: { type: 'boolean', default: false },
          c: { type: 'integer', default: 5150 },
          d: { type: 'null', default: null },
          e: { type: 'number', default: 9.8765 },
          f: { type: 'object', default: { foo: 'bar' } },
          g: { type: 'string', default: 'value' },
          h: { type: 'undefined', default: undefined }
        }
      },
      target: {},
      source: {},
      result: {
        a: [ 1, 1, 2, 3, 5, 8 ],
        b: false,
        c: 5150,
        d: null,
        e: 9.8765,
        f: { foo: 'bar' },
        g: 'value',
        h: undefined
      }
    },
    {
      assertion: 'should assign default values of unexpected type',
      schema: {
        properties: {
          a: { type: 'boolean', default: [ 1, 1, 2, 3, 5, 8 ] },
          b: { type: 'integer', default: false },
          c: { type: 'null', default: 5150 },
          d: { type: 'number', default: null },
          e: { type: 'object', default: 9.8765 },
          f: { type: 'string', default: { foo: 'bar' } },
          g: { type: 'undefined', default: 'value' },
          h: { type: 'array', default: undefined }
        }
      },
      target: {},
      source: {},
      result: {
        a: [ 1, 1, 2, 3, 5, 8 ],
        b: false,
        c: 5150,
        d: null,
        e: 9.8765,
        f: { foo: 'bar' },
        g: 'value',
        h: undefined
      }
    },
    {
      assertion: 'should assign falsy and empty default values',
      schema: {
        properties: {
          a: { default: [] },
          b: { default: false },
          c: { default: 0 },
          d: { default: -1 },
          e: { default: null },
          f: { default: 0.00 },
          g: { default: {} },
          h: { default: '' },
          i: { default: undefined }
        }
      },
      target: {},
      source: {},
      result: {
        a: [],
        b: false,
        c: 0,
        d: -1,
        e: null,
        f: 0.00,
        g: {},
        h: '',
        i: undefined
      }
    },
    {
      assertion: 'should override default values when source values are present',
      schema: {
        properties: {
          a: { type: 'array', default: [ 1, 1, 2, 3, 5, 8 ] },
          b: { type: 'boolean', default: false },
          c: { type: 'integer', default: 5150 },
          d: { type: 'null', default: null },
          e: { type: 'number', default: 9.8765 },
          f: { type: 'object', default: { foo: 'bar' } },
          g: { type: 'string', default: 'value' },
          h: { type: 'undefined', default: undefined }
        }
      },
      target: {},
      source: {
        a: [ 2, 3, 5, 8, 13, 21 ],
        b: true,
        c: 6789,
        d: { foo: 'bar' },
        e: 8.7654,
        f: { not: 'default' },
        g: 'not default',
        h: 'not default'
      },
      result: {
        a: [ 2, 3, 5, 8, 13, 21 ],
        b: true,
        c: 6789,
        d: { foo: 'bar' },
        e: 8.7654,
        f: { not: 'default' },
        g: 'not default',
        h: 'not default'
      }
    },
    {
      assertion: 'should override default values with source values of unexpected type',
      schema: {
        properties: {
          a: { type: 'array', default: [ 1, 1, 2, 3, 5, 8 ] },
          b: { type: 'boolean', default: false },
          c: { type: 'integer', default: 5150 },
          d: { type: 'null', default: null },
          e: { type: 'number', default: 9.8765 },
          f: { type: 'object', default: { foo: 'bar' } },
          g: { type: 'string', default: 'value' },
          h: { type: 'undefined', default: undefined }
        }
      },
      target: {},
      source: {
        a: 'not default',
        b: 'not default',
        c: 'not default',
        d: 'not default',
        e: 'not default',
        f: 'not default',
        g: [ 'not default' ],
        h: 'not default'
      },
      result: {
        a: 'not default',
        b: 'not default',
        c: 'not default',
        d: 'not default',
        e: 'not default',
        f: 'not default',
        g: [ 'not default' ],
        h: 'not default'
      }
    },
    {
      assertion: 'should optionally skip assigning default values',
      schema: {
        properties: {
          a: { type: 'array', default: [ 1, 1, 2, 3, 5, 8 ] },
          b: { type: 'boolean', default: false },
          c: { type: 'integer', default: 5150 },
          d: { type: 'null', default: null },
          e: { type: 'number', default: 9.8765 },
          f: { type: 'object', default: { foo: 'bar' } },
          g: { type: 'string', default: 'value' },
          h: { type: 'undefined', default: undefined }
        }
      },
      target: {},
      source: {},
      options: {
        defaults: false
      },
      result: {}
    }
  ],

  /**
   * These tests are for a simple nested object (one level of nesting). They cover
   * assignment from the input to the target, empty and false values, unexpected
   * types, defaults, existing values on the target object, options, and unspecified
   * properties.
   */
  'level 2 (nested) object property assignment': [

    {
      assertion: 'should assign source values of expected type to target',
      schema: {
        properties: {
          i: {
            properties: {
              a: { type: 'array' },
              b: { type: 'boolean' },
              c: { type: 'integer' },
              d: { type: 'null' },
              e: { type: 'number' },
              f: { type: 'object' },
              g: { type: 'string' },
              h: { type: 'undefined' }
            }
          },
          j: {
            properties: {
              a: { type: 'array' },
              b: { type: 'boolean' },
              c: { type: 'integer' },
              d: { type: 'null' },
              e: { type: 'number' },
              f: { type: 'object' },
              g: { type: 'string' },
              h: { type: 'undefined' }
            }
          }
        }
      },
      target: {},
      source: {
        i: {
          a: [],
          b: true,
          c: 1,
          d: null,
          e: 3.14,
          f: {},
          g: 'value',
          h: undefined
        },
        j: {
          a: [],
          b: true,
          c: 1,
          d: null,
          e: 3.14,
          f: {},
          g: 'value',
          h: undefined
        }
      },
      result: {
        i: {
          a: [],
          b: true,
          c: 1,
          d: null,
          e: 3.14,
          f: {},
          g: 'value',
          h: undefined
        },
        j: {
          a: [],
          b: true,
          c: 1,
          d: null,
          e: 3.14,
          f: {},
          g: 'value',
          h: undefined
        }
      }
    },

    {
      assertion: 'should assign source values of unexpected type to target',
      schema: {
        properties: {
          i: {
            properties: {
              a: { type: 'array' },
              b: { type: 'boolean' },
              c: { type: 'integer' },
              d: { type: 'null' },
              e: { type: 'number' },
              f: { type: 'object' },
              g: { type: 'string' },
              h: { type: 'undefined' }
            }
          },
          j: {
            properties: {
              a: { type: 'array' },
              b: { type: 'boolean' },
              c: { type: 'integer' },
              d: { type: 'null' },
              e: { type: 'number' },
              f: { type: 'object' },
              g: { type: 'string' },
              h: { type: 'undefined' }
            }
          }
        }
      },
      target: {},
      source: {
        i: {
          a: true,
          b: 1,
          c: null,
          d: 3.14,
          e: {},
          f: 'value',
          g: undefined,
          h: []
        },
        j: {
          a: 1,
          b: null,
          c: 3.14,
          d: {},
          e: 'value',
          f: undefined,
          g: [],
          h: true
        }
      },
      result: {
        i: {
          a: true,
          b: 1,
          c: null,
          d: 3.14,
          e: {},
          f: 'value',
          g: undefined,
          h: []
        },
        j: {
          a: 1,
          b: null,
          c: 3.14,
          d: {},
          e: 'value',
          f: undefined,
          g: [],
          h: true
        }
      }
    },

    {
      assertion: 'should assign falsy source values to target',
      schema: {
        properties: {
          i: {
            properties: {
              a: { type: 'boolean' },
              b: { type: 'integer' },
              c: { type: 'null' },
              d: { type: 'number' },
              e: { type: 'string' },
              f: { type: 'undefined' }
            }
          },
          j: {
            properties: {
              f: { type: 'boolean' },
              e: { type: 'integer' },
              d: { type: 'null' },
              c: { type: 'number' },
              b: { type: 'string' },
              a: { type: 'undefined' }
            }
          }
        }
      },
      target: {},
      source: {
        i: {
          a: false,
          b: 0,
          c: null,
          d: 0.00,
          e: '',
          f: undefined
        },
        j: {
          f: false,
          e: 0,
          d: null,
          c: 0.00,
          b: '',
          a: undefined
        }
      },
      result: {
        i: {
          a: false,
          b: 0,
          c: null,
          d: 0.00,
          e: '',
          f: undefined
        },
        j: {
          f: false,
          e: 0,
          d: null,
          c: 0.00,
          b: '',
          a: undefined
        }
      }
    },

    {
      assertion: 'should not assign specified values not present on source to target',
      schema: {
        properties: {
          i: {
            properties: {
              a: { type: 'array' },
              b: { type: 'boolean' },
              c: { type: 'integer' },
              d: { type: 'null' },
              e: { type: 'number' },
              f: { type: 'object' },
              g: { type: 'string' },
              h: { type: 'undefined' }
            }
          },
          j: {
            properties: {
              a: { type: 'array' },
              b: { type: 'boolean' },
              c: { type: 'integer' },
              d: { type: 'null' },
              e: { type: 'number' },
              f: { type: 'object' },
              g: { type: 'string' },
              h: { type: 'undefined' }
            }
          }
        }
      },
      target: {},
      source: { j: { b: true, d: null, f: { anything: 'goes' } } },
      result: { j: { b: true, d: null, f: { anything: 'goes' } } }
    },

    {
      assertion: 'should not assign unspecified values on source to target',
      schema: {
        properties: {
          a: {
            properties: {
              b: { type: 'array' },
              c: { type: 'boolean' },
              d: { type: 'integer' },
              e: { type: 'null' }
            }
          },
          j: {
            properties: {
              k: { type: 'array' },
              m: { type: 'integer' },
              o: { type: 'number' },
              q: { type: 'string' }
            }
          },
          s: { type: 'string' }
        }
      },
      target: {},
      source: {
        a: {
          b: [],
          c: true,
          d: 1,
          e: null,
          f: 3.14,
          g: {},
          h: 'value',
          i: undefined
        },
        t: false,
        j: {
          k: 'unexpected type',
          l: 'unspecified value',
          m: 'unexpected type',
          n: 'unexpected value',
          o: 'unexpected type',
          p: { 'unexpected': 'value' },
          q: null,
          r: 'unexpected value'
        },
        u: true,
        s: 'value',
        v: { 'unexpected': 'value' }
      },
      result: {
        a: {
          b: [],
          c: true,
          d: 1,
          e: null
        },
        j: {
          k: 'unexpected type',
          m: 'unexpected type',
          o: 'unexpected type',
          q: null
        },
        s: 'value'
      }
    },

    {
      assertion: 'should optionally assign unspecified values on source to target',
      schema: {
        properties: {
          a: {
            properties: {
              b: { type: 'array' },
              c: { type: 'boolean' },
              d: { type: 'integer' },
              e: { type: 'null' }
            }
          },
          j: {
            properties: {
              k: { type: 'array' },
              m: { type: 'integer' },
              o: { type: 'number' },
              q: { type: 'string' }
            }
          },
          s: { type: 'string' }
        }
      },
      target: {},
      source: {
        a: {
          b: [],
          c: true,
          d: 1,
          e: null,
          f: 3.14,
          g: {},
          h: 'value',
          i: undefined
        },
        t: false,
        j: {
          k: 'unexpected type',
          l: 'unspecified value',
          m: 'unexpected type',
          n: 'unexpected value',
          o: 'unexpected type',
          p: { 'unexpected': 'value' },
          q: null,
          r: 'unexpected value'
        },
        u: true,
        s: 'value',
        v: { 'unexpected': 'value' }
      },
      options: { filter: false },
      result: {
        a: {
          b: [],
          c: true,
          d: 1,
          e: null,
          f: 3.14,
          g: {},
          h: 'value',
          //i: undefined
        },
        t: false,
        j: {
          k: 'unexpected type',
          l: 'unspecified value',
          m: 'unexpected type',
          n: 'unexpected value',
          o: 'unexpected type',
          p: { 'unexpected': 'value' },
          q: null,
          r: 'unexpected value'
        },
        u: true,
        s: 'value',
        v: { 'unexpected': 'value' }
      }
    },

    {
      assertion: 'should leave target values not present on source intact',
      schema: {
        properties: {
          i: {
            properties: {
              a: { type: 'array' },
              b: { type: 'boolean' },
              c: { type: 'integer' },
              d: { type: 'null' },
              e: { type: 'number' },
              f: { type: 'object' },
              g: { type: 'string' },
              h: { type: 'undefined' }
            }
          },
          j: {
            properties: {
              a: { type: 'array' },
              b: { type: 'boolean' },
              c: { type: 'integer' },
              d: { type: 'null' },
              e: { type: 'number' },
              f: { type: 'object' },
              g: { type: 'string' },
              h: { type: 'undefined' }
            }
          },
          k: {
            properties: {
              l: { type: 'string' }
            }
          }
        }
      },
      target: {
        i: {
          a: [],
          b: true,
          c: 1,
          d: null,
          e: 3.14,
          f: {},
          g: 'value',
          h: undefined
        },
        j: {
          a: [],
          b: true,
          c: 1,
          d: null,
          e: 3.14,
          f: {},
          g: 'value',
          h: undefined
        },
        k: {}
      },
      source: {},
      result: {
        i: {
          a: [],
          b: true,
          c: 1,
          d: null,
          e: 3.14,
          f: {},
          g: 'value',
          h: undefined
        },
        j: {
          a: [],
          b: true,
          c: 1,
          d: null,
          e: 3.14,
          f: {},
          g: 'value',
          h: undefined
        },
        k: {}
      }
    },

    {
      assertion: 'should override values present on target with source values',
      schema: {
        properties: {
          i: {
            properties: {
              a: { type: 'array' },
              b: { type: 'boolean' },
              c: { type: 'integer' },
              d: { type: 'null' },
              e: { type: 'number' },
              f: { type: 'object' },
              g: { type: 'string' },
              h: { type: 'undefined' }
            }
          },
          j: {
            properties: {
              a: { type: 'array' },
              b: { type: 'boolean' },
              c: { type: 'integer' },
              d: { type: 'null' },
              e: { type: 'number' },
              f: { type: 'object' },
              g: { type: 'string' },
              h: { type: 'undefined' }
            }
          },
          k: {
            properties: {
              l: { type: 'string' }
            }
          }
        }
      },
      target: {
        i: {
          a: [],
          b: true,
          c: 1,
          d: null,
          e: 3.14,
          f: {},
          g: 'value',
          h: undefined
        },
        j: {
          a: [],
          b: true,
          c: 1,
          d: null,
          e: 3.14,
          f: {},
          g: 'value',
          h: undefined
        },
        k: {}
      },
      source: {
        i: {
          a: [ 1, 3, 5 ],
          c: 2,
          e: 3.1459,
          g: 'changed',
        },
        j: {
          b: false,
          d: 'changed',
          f: { changed: 'value' },
          h: 'changed'
        },
        k: []
      },
      result: {
        i: {
          a: [ 1, 3, 5 ],
          b: true,
          c: 2,
          d: null,
          e: 3.1459,
          f: {},
          g: 'changed',
          h: undefined
        },
        j: {
          a: [],
          b: false,
          c: 1,
          d: 'changed',
          e: 3.14,
          f: { changed: 'value' },
          g: 'value',
          h: 'changed'
        },
        k: []
      }
    },

    {
      assertion: 'should assign default values when source values are not present',
      schema: {
        properties: {
          i: {
            properties: {
              a: { type: 'array', default: [ 1, 1, 2, 3, 5, 8 ] },
              b: { type: 'boolean', default: false },
              c: { type: 'integer', default: 5150 },
              d: { type: 'null', default: null },
              e: { type: 'number', default: 9.8765 },
              f: { type: 'object', default: { foo: 'bar' } },
              g: { type: 'string', default: 'value' },
              h: { type: 'undefined', default: undefined }
            }
          }
        }
      },
      target: {},
      source: {},
      result: {
        i: {
          a: [ 1, 1, 2, 3, 5, 8 ],
          b: false,
          c: 5150,
          d: null,
          e: 9.8765,
          f: { foo: 'bar' },
          g: 'value',
          h: undefined
        }
      }
    },

    {
      assertion: 'should assign default values of unexpected type',
      schema: {
        properties: {
          i: {
            properties: {
              a: { type: 'boolean', default: [ 1, 1, 2, 3, 5, 8 ] },
              b: { type: 'integer', default: false },
              c: { type: 'null', default: 5150 },
              d: { type: 'number', default: null },
              e: { type: 'object', default: 9.8765 },
              f: { type: 'string', default: { foo: 'bar' } },
              g: { type: 'undefined', default: 'value' },
              h: { type: 'array', default: undefined }
            }
          }
        }
      },
      target: {},
      source: {},
      result: {
        i: {
          a: [ 1, 1, 2, 3, 5, 8 ],
          b: false,
          c: 5150,
          d: null,
          e: 9.8765,
          f: { foo: 'bar' },
          g: 'value',
          h: undefined
        }
      }
    },

    {
      assertion: 'should assign falsy and empty default values',
      schema: {
        properties: {
          i: {
            properties: {
              a: { default: [] },
              b: { default: false },
              c: { default: 0 },
              d: { default: -1 },
              e: { default: null },
              f: { default: 0.00 },
              g: { default: {} },
              h: { default: '' },
              i: { default: undefined }
            }
          }
        }
      },
      target: {},
      source: {},
      result: {
        i: {
          a: [],
          b: false,
          c: 0,
          d: -1,
          e: null,
          f: 0.00,
          g: {},
          h: '',
          i: undefined
        }
      }
    },

    {
      assertion: 'should override default values when source values are present',
      schema: {
        properties: {
          i: {
            properties: {
              a: { type: 'array', default: [ 1, 1, 2, 3, 5, 8 ] },
              b: { type: 'boolean', default: false },
              c: { type: 'integer', default: 5150 },
              d: { type: 'null', default: null },
              e: { type: 'number', default: 9.8765 },
              f: { type: 'object', default: { foo: 'bar' } },
              g: { type: 'string', default: 'value' },
              h: { type: 'undefined', default: undefined }
            }
          }
        }
      },
      target: {},
      source: {
        i: {
          a: [ 2, 3, 5, 8, 13, 21 ],
          b: true,
          c: 6789,
          d: { foo: 'bar' },
          e: 8.7654,
          f: { not: 'default' },
          g: 'not default',
          h: 'not default'
        }
      },
      result: {
        i: {
          a: [ 2, 3, 5, 8, 13, 21 ],
          b: true,
          c: 6789,
          d: { foo: 'bar' },
          e: 8.7654,
          f: { not: 'default' },
          g: 'not default',
          h: 'not default'
        }
      }
    },

    {
      assertion: 'should override default values with source values of unexpected type',
      schema: {
        properties: {
          i: {
            properties: {
              a: { type: 'array', default: [ 1, 1, 2, 3, 5, 8 ] },
              b: { type: 'boolean', default: false },
              c: { type: 'integer', default: 5150 },
              d: { type: 'null', default: null },
              e: { type: 'number', default: 9.8765 },
              f: { type: 'object', default: { foo: 'bar' } },
              g: { type: 'string', default: 'value' },
              h: { type: 'undefined', default: undefined }
            }
          }
        }
      },
      target: {},
      source: {
        i: {
          a: 'not default',
          b: 'not default',
          c: 'not default',
          d: 'not default',
          e: 'not default',
          f: 'not default',
          g: [ 'not default' ],
          h: 'not default'
        }
      },
      result: {
        i: {
          a: 'not default',
          b: 'not default',
          c: 'not default',
          d: 'not default',
          e: 'not default',
          f: 'not default',
          g: [ 'not default' ],
          h: 'not default'
        }
      }
    },

    {
      assertion: 'should optionally skip assigning default values',
      schema: {
        properties: {
          i: {
            properties: {
              a: { type: 'array', default: [ 1, 1, 2, 3, 5, 8 ] },
              b: { type: 'boolean', default: false },
              c: { type: 'integer', default: 5150 },
              d: { type: 'null', default: null },
              e: { type: 'number', default: 9.8765 },
              f: { type: 'object', default: { foo: 'bar' } },
              g: { type: 'string', default: 'value' },
              h: { type: 'undefined', default: undefined }
            }
          }
        }
      },
      target: {},
      source: {},
      options: {
        defaults: false
      },
      result: {}
    }
  ],


  /**
   * These tests are for a deeply nested object (two levels of nesting). They
   * cover assignment from the input to the target, empty and false values,
   * unexpected types, defaults, existing values on the target object, options,
   * and unspecified properties.
   */
  'level 3 (deeply nested) object property assignment': [

    {
      assertion: 'should assign source values of expected type to target',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'array' },
                  d: { type: 'boolean' },
                  e: { type: 'integer' },
                  f: { type: 'null' },
                  g: { type: 'number' },
                  h: { type: 'object' },
                  i: { type: 'string' },
                  j: { type: 'undefined' }
                }
              }
            }
          },
          k: {
            properties: {
              l: {
                properties: {
                  m: { type: 'array' },
                  n: { type: 'boolean' },
                  o: { type: 'integer' },
                  p: { type: 'null' },
                  q: { type: 'number' },
                  r: { type: 'object' },
                  s: { type: 'string' },
                  t: { type: 'undefined' }
                }
              }
            }
          }
        }
      },
      target: {},
      source: {
        a: {
          b: {
            c: [],
            d: true,
            e: 1,
            f: null,
            g: 3.14,
            h: {},
            i: 'value',
            j: undefined
          }
        },
        k: {
          l: {
            m: [],
            n: true,
            o: 1,
            p: null,
            q: 3.14,
            r: {},
            s: 'value',
            t: undefined
          }
        }
      },
      result: {
        a: {
          b: {
            c: [],
            d: true,
            e: 1,
            f: null,
            g: 3.14,
            h: {},
            i: 'value',
            j: undefined
          }
        },
        k: {
          l: {
            m: [],
            n: true,
            o: 1,
            p: null,
            q: 3.14,
            r: {},
            s: 'value',
            t: undefined
          }
        }
      }
    },

    {
      assertion: 'should assign source values of unexpected type to target',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'array' },
                  d: { type: 'boolean' },
                  e: { type: 'integer' },
                  f: { type: 'null' },
                  g: { type: 'number' },
                  h: { type: 'object' },
                  i: { type: 'string' },
                  j: { type: 'undefined' }
                }
              }
            }
          },
          k: {
            properties: {
              l: {
                properties: {
                  m: { type: 'array' },
                  n: { type: 'boolean' },
                  o: { type: 'integer' },
                  p: { type: 'null' },
                  q: { type: 'number' },
                  r: { type: 'object' },
                  s: { type: 'string' },
                  t: { type: 'undefined' }
                }
              }
            }
          }
        }
      },
      target: {},
      source: {
        a: {
          b: {
            c: true,
            d: 1,
            e: null,
            f: 3.14,
            g: {},
            h: 'value',
            i: undefined,
            j: []
          }
        },
        k: {
          l: {
            m: 1,
            n: null,
            o: 3.14,
            p: {},
            q: 'value',
            r: undefined,
            s: [],
            t: true
          }
        }
      },
      result: {
        a: {
          b: {
            c: true,
            d: 1,
            e: null,
            f: 3.14,
            g: {},
            h: 'value',
            i: undefined,
            j: []
          }
        },
        k: {
          l: {
            m: 1,
            n: null,
            o: 3.14,
            p: {},
            q: 'value',
            r: undefined,
            s: [],
            t: true
          }
        }
      }
    },

    {
      assertion: 'should assign empty and falsy source values to target',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'array' },
                  d: { type: 'boolean' },
                  e: { type: 'integer' },
                  f: { type: 'null' },
                  g: { type: 'number' },
                  h: { type: 'object' },
                  i: { type: 'string' },
                  j: { type: 'undefined' }
                }
              }
            }
          },
          k: {
            properties: {
              l: {
                properties: {
                  m: { type: 'array' },
                  n: { type: 'boolean' },
                  o: { type: 'integer' },
                  p: { type: 'null' },
                  q: { type: 'number' },
                  r: { type: 'object' },
                  s: { type: 'string' },
                  t: { type: 'undefined' }
                }
              }
            }
          }
        }
      },
      target: {},
      source: {
        a: {
          b: {
            c: [],
            d: false,
            e: 0,
            f: null,
            g: 0.00,
            h: {},
            i: '',
            j: undefined
          }
        },
        k: {
          l: {
            m: [],
            n: false,
            o: 0,
            p: null,
            q: 0.00,
            r: {},
            s: '',
            t: undefined
          }
        }
      },
      result: {
        a: {
          b: {
            c: [],
            d: false,
            e: 0,
            f: null,
            g: 0.00,
            h: {},
            i: '',
            j: undefined
          }
        },
        k: {
          l: {
            m: [],
            n: false,
            o: 0,
            p: null,
            q: 0.00,
            r: {},
            s: '',
            t: undefined
          }
        }
      }
    },

    {
      assertion: 'should not assign specified values not present on source to target',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'array' },
                  d: { type: 'boolean' },
                  e: { type: 'integer' },
                  f: { type: 'null' },
                  g: { type: 'number' },
                  h: { type: 'object' },
                  i: { type: 'string' },
                  j: { type: 'undefined' }
                }
              }
            }
          },
          k: {
            properties: {
              l: {
                properties: {
                  m: { type: 'array' },
                  n: { type: 'boolean' },
                  o: { type: 'integer' },
                  p: { type: 'null' },
                  q: { type: 'number' },
                  r: { type: 'object' },
                  s: { type: 'string' },
                  t: { type: 'undefined' }
                }
              }
            }
          }
        }
      },
      target: {},
      source: {
        a: {
          b: {
            d: true,
            e: 1,
            g: 3.14,
            i: 'value',
          }
        }
      },
      result: {
        a: {
          b: {
            d: true,
            e: 1,
            g: 3.14,
            i: 'value',
          }
        }
      }
    },

    {
      assertion: 'should not assign unspecified values on source to target',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'array' },
                  d: { type: 'boolean' },
                  e: { type: 'integer' },
                  f: { type: 'null' }
                }
              }
            }
          },
          g: {
            properties: {
              h: {
                properties: {
                  i: { type: 'array' },
                  j: { type: 'boolean' },
                  k: { type: 'integer' },
                  l: { type: 'null' }
                }
              }
            }
          },
          m: { type: 'string' }
        }
      },
      target: {},
      source: {
        a: {
          b: {
            c: [],
            d: true,
            e: 1,
            f: null,
            o: 3.14,
            p: {},
            q: 'value',
            r: undefined
          }
        },
        n: false,
        g: {
          h: {
            i: 'unexpected type',
            j: 'unspecified value',
            k: 'unexpected type',
            l: 'unexpected value',
            s: 'unexpected type',
            t: { 'unexpected': 'value' },
            u: null,
            v: 'unexpected value'
          },
          z: 'unexpected value'
        },
        w: true,
        x: 'value',
        y: { 'unexpected': 'value' }
      },
      result: {
        a: {
          b: {
            c: [],
            d: true,
            e: 1,
            f: null,
          }
        },
        g: {
          h: {
            i: 'unexpected type',
            j: 'unspecified value',
            k: 'unexpected type',
            l: 'unexpected value',
          }
        }
      }
    },

    {
      assertion: 'should optionally assign unspecified values on source to target',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'array' },
                  d: { type: 'boolean' },
                  e: { type: 'integer' },
                  f: { type: 'null' }
                }
              }
            }
          },
          g: {
            properties: {
              h: {
                properties: {
                  i: { type: 'array' },
                  j: { type: 'boolean' },
                  k: { type: 'integer' },
                  l: { type: 'null' }
                }
              }
            }
          },
          m: { type: 'string' }
        }
      },
      target: {},
      source: {
        a: {
          b: {
            c: [],
            d: true,
            e: 1,
            f: null,
            o: 3.14,
            p: {},
            q: 'value',
            r: undefined
          }
        },
        n: false,
        g: {
          h: {
            i: 'unexpected type',
            j: 'unspecified value',
            k: 'unexpected type',
            l: 'unexpected value',
            s: 'unexpected type',
            t: { 'unexpected': 'value' },
            u: null,
            v: 'unexpected value'
          },
          z: 'unexpected value'
        },
        w: true,
        x: 'value',
        y: { 'unexpected': 'value' }
      },
      options: {
        filter: false
      },
      result: {
        a: {
          b: {
            c: [],
            d: true,
            e: 1,
            f: null,
            o: 3.14,
            p: {},
            q: 'value',
            //r: undefined
          }
        },
        n: false,
        g: {
          h: {
            i: 'unexpected type',
            j: 'unspecified value',
            k: 'unexpected type',
            l: 'unexpected value',
            s: 'unexpected type',
            t: { 'unexpected': 'value' },
            u: null,
            v: 'unexpected value'
          },
          z: 'unexpected value'
        },
        w: true,
        x: 'value',
        y: { 'unexpected': 'value' }
      }
    },

    {
      assertion: 'should leave target values not present on source intact',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'array' },
                  d: { type: 'boolean' },
                  e: { type: 'integer' },
                  f: { type: 'null' },
                  g: { type: 'number' },
                  h: { type: 'object' },
                  i: { type: 'string' },
                  j: { type: 'undefined' }
                }
              }
            }
          },
          k: {
            properties: {
              l: {
                properties: {
                  m: { type: 'array' },
                  n: { type: 'boolean' },
                  o: { type: 'integer' },
                  p: { type: 'null' },
                  q: { type: 'number' },
                  r: { type: 'object' },
                  s: { type: 'string' },
                  t: { type: 'undefined' }
                }
              }
            }
          },
          u: {
            properties: {
              v: {
                properties: {
                  x: { type: 'string' }
                }
              }
            }
          }
        }
      },
      target: {
        a: {
          b: {
            c: [],
            d: true,
            e: 1,
            f: null,
            g: 3.14,
            h: {},
            i: 'value',
            j: undefined
          }
        },
        k: {
          l: {
            m: [],
            n: true,
            o: 1,
            p: null,
            q: 3.14,
            r: {},
            s: 'value',
            t: undefined
          }
        },
        u: {
          v: {}
        }
      },
      source: {},
      result: {
        a: {
          b: {
            c: [],
            d: true,
            e: 1,
            f: null,
            g: 3.14,
            h: {},
            i: 'value',
            j: undefined
          }
        },
        k: {
          l: {
            m: [],
            n: true,
            o: 1,
            p: null,
            q: 3.14,
            r: {},
            s: 'value',
            t: undefined
          }
        },
        u: {
          v: {}
        }
      }
    },

    {
      assertion: 'should override values present on target with source values',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'array' },
                  d: { type: 'boolean' },
                  e: { type: 'integer' },
                  f: { type: 'null' },
                  g: { type: 'number' },
                  h: { type: 'object' },
                  i: { type: 'string' },
                  j: { type: 'undefined' }
                }
              }
            }
          },
          k: {
            properties: {
              l: {
                properties: {
                  m: { type: 'array' },
                  n: { type: 'boolean' },
                  o: { type: 'integer' },
                  p: { type: 'null' },
                  q: { type: 'number' },
                  r: { type: 'object' },
                  s: { type: 'string' },
                  t: { type: 'undefined' }
                }
              }
            }
          },
          u: {
            properties: {
              v: {
                properties: {
                  x: { type: 'string' }
                }
              }
            }
          }
        }
      },
      target: {
        a: {
          b: {
            c: [],
            d: true,
            e: 1,
            f: null,
            g: 3.14,
            h: {},
            i: 'value',
            j: undefined
          }
        },
        k: {
          l: {
            m: [],
            n: true,
            o: 1,
            p: null,
            q: 3.14,
            r: {},
            s: 'value',
            t: undefined
          }
        },
        u: {
          v: {}
        }
      },
      source: {
        a: {
          b: {
            c: [ 1, 3, 5 ],
            e: 2,
            g: 3.1459,
            i: 'changed',
          }
        },
        k: {
          l: {
            n: false,
            p: true,
            r: { changed: 'value' },
            t: 'changed'
          }
        },
        u: {
          v: []
        }
      },
      result: {
        a: {
          b: {
            c: [ 1, 3, 5 ],
            d: true,
            e: 2,
            f: null,
            g: 3.1459,
            h: {},
            i: 'changed',
            j: undefined
          }
        },
        k: {
          l: {
            m: [],
            n: false,
            o: 1,
            p: true,
            q: 3.14,
            r: { changed: 'value' },
            s: 'value',
            t: 'changed'
          }
        },
        u: {
          v: []
        }
      }
    },

    {
      assertion: 'should assign default values when source values are not present',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'array', default: [ 1, 1, 2, 3, 5, 8 ] },
                  d: { type: 'boolean', default: false },
                  e: { type: 'integer', default: 5150 },
                  f: { type: 'null', default: null },
                  g: { type: 'number', default: 9.8765 },
                  h: { type: 'object', default: { foo: 'bar' } },
                  i: { type: 'string', default: 'value' },
                  j: { type: 'undefined', default: undefined }
                }
              }
            }
          }
        }
      },
      target: {},
      source: {},
      result: {
        a: {
          b: {
            c: [ 1, 1, 2, 3, 5, 8 ],
            d: false,
            e: 5150,
            f: null,
            g: 9.8765,
            h: { foo: 'bar' },
            i: 'value',
            j: undefined
          }
        }
      }
    },

    {
      assertion: 'should assign default values of unexpected type',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean', default: [ 1, 1, 2, 3, 5, 8 ] },
                  d: { type: 'integer', default: false },
                  e: { type: 'null', default: 5150 },
                  f: { type: 'number', default: null },
                  g: { type: 'object', default: 9.8765 },
                  h: { type: 'string', default: { foo: 'bar' } },
                  i: { type: 'undefined', default: 'value' },
                  j: { type: 'array', default: undefined }
                }
              }
            }
          }
        }
      },
      target: {},
      source: {},
      result: {
        a: {
          b: {
            c: [ 1, 1, 2, 3, 5, 8 ],
            d: false,
            e: 5150,
            f: null,
            g: 9.8765,
            h: { foo: 'bar' },
            i: 'value',
            j: undefined
          }
        }
      }
    },

    {
      assertion: 'should assign empty and falsy default values',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { default: [] },
                  d: { default: false },
                  e: { default: 0 },
                  f: { default: -1 },
                  g: { default: null },
                  h: { default: 0.00 },
                  i: { default: {} },
                  j: { default: '' },
                  k: { default: undefined }
                }
              }
            }
          }
        }
      },
      target: {},
      source: {},
      result: {
        a: {
          b: {
            c: [],
            d: false,
            e: 0,
            f: -1,
            g: null,
            h: 0.00,
            i: {},
            j: '',
            k: undefined
          }
        }
      }
    },

    {
      assertion: 'should override default values when source values are present',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean', default: [ 1, 1, 2, 3, 5, 8 ] },
                  d: { type: 'integer', default: false },
                  e: { type: 'null', default: 5150 },
                  f: { type: 'number', default: null },
                  g: { type: 'object', default: 9.8765 },
                  h: { type: 'string', default: { foo: 'bar' } },
                  i: { type: 'undefined', default: 'value' },
                  j: { type: 'array', default: undefined }
                }
              }
            }
          }
        }
      },
      target: {},
      source: {
        a: {
          b: {
            c: [ 2, 3, 5, 8, 13, 21 ],
            d: true,
            e: 6789,
            f: { foo: 'bar' },
            g: 8.7654,
            h: { not: 'default' },
            i: 'not default',
            j: 'not default'
          }
        }
      },
      result: {
        a: {
          b: {
            c: [ 2, 3, 5, 8, 13, 21 ],
            d: true,
            e: 6789,
            f: { foo: 'bar' },
            g: 8.7654,
            h: { not: 'default' },
            i: 'not default',
            j: 'not default'
          }
        }
      }
    },

    {
      assertion: 'should override default values with source values of unexpected type',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean', default: [ 1, 1, 2, 3, 5, 8 ] },
                  d: { type: 'integer', default: false },
                  e: { type: 'null', default: 5150 },
                  f: { type: 'number', default: null },
                  g: { type: 'object', default: 9.8765 },
                  h: { type: 'string', default: { foo: 'bar' } },
                  i: { type: 'undefined', default: 'value' },
                  j: { type: 'array', default: undefined }
                }
              }
            }
          }
        }
      },
      target: {},
      source: {
        a: {
          b: {
            c: 'not default',
            d: 'not default',
            e: 'not default',
            f: 'not default',
            g: 'not default',
            h: 'not default',
            i: [ 'not default' ],
            j: 'not default'
          }
        }
      },
      result: {
        a: {
          b: {
            c: 'not default',
            d: 'not default',
            e: 'not default',
            f: 'not default',
            g: 'not default',
            h: 'not default',
            i: [ 'not default' ],
            j: 'not default'
          }
        }
      }
    },

    {
      assertion: 'should optionally skip assigning default values',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'array', default: [ 1, 1, 2, 3, 5, 8 ] },
                  d: { type: 'boolean', default: false },
                  e: { type: 'integer', default: 5150 },
                  f: { type: 'null', default: null },
                  g: { type: 'number', default: 9.8765 },
                  h: { type: 'object', default: { foo: 'bar' } },
                  i: { type: 'string', default: 'value' },
                  j: { type: 'undefined', default: undefined }
                }
              }
            }
          }
        }
      },
      target: {},
      source: {},
      options: {
        defaults: false
      },
      result: {}
    }
  ],

  /**
   * Here we're concerned with various cases involving branches in a deeply nested
   * object.
   *
   * NOTE: although these cases deal with the existence of array values on the source
   * and target at the branch level (non-root, non-leaf), the schemas are for mostly
   * for deeply nested objects. Deep nesting of arrays within objects within arrays,
   * etc., will be handled in a separate block of tests.
   */
  'deeply nested object branch assignment': [
    {
      assertion: 'should not assign values not present on source to target',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' }
                }
              }
            }
          },
          d: {
            properties: {
              e: {
                properties: {
                  f: { type: 'integer' }
                }
              }
            }
          }
        }
      },
      target: { a: {} },
      source: { a: {} },
      result: { a: {} }
    },

    {
      assertion: 'should assign object source value to target with no existing value',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' }
                }
              }
            }
          },
          d: {
            properties: {
              e: {
                properties: {
                  f: { type: 'integer' }
                }
              }
            }
          }
        }
      },
      target: {},
      source: {
        a: { b: { c: 3 } },
        d: { e: { g: 'nope' } }
      },
      result: {
        a: { b: { c: 3 } },
        d: { e: {}}
      }
    },

    {
      assertion: 'should assign array source value to target with no existing value',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' }
                }
              }
            }
          },
          d: {
            properties: {
              e: {
                properties: {
                  f: { type: 'integer' }
                }
              }
            }
          }
        }
      },
      target: {},
      source: {
        a: { b: [ 0, 1 ] },
        d: { e: [] }
      },
      result: {
        a: { b: [ 0, 1 ] },
        d: { e: [] }
      }
    },

    {
      assertion: 'should assign null source value to target with no existing value',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' }
                }
              }
            }
          },
          d: {
            properties: {
              e: {
                properties: {
                  f: { type: 'integer' }
                }
              }
            }
          }
        }
      },
      target: {},
      source: {
        a: { b: null },
        d: { e: null }
      },
      result: {
        a: { b: null },
        d: { e: null }
      }
    },

    {
      assertion: 'should assign primitive source value to target with no existing value',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' }
                }
              }
            }
          },
          d: {
            properties: {
              e: {
                properties: {
                  f: { type: 'integer' }
                }
              }
            }
          }
        }
      },
      target: {},
      source: {
        a: { b: 1 },
        d: { e: false }
      },
      result: {
        a: { b: 1 },
        d: { e: false }
      }
    },

    {
      assertion: 'should leave target object intact when source value is not present',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' }
                }
              }
            }
          },
          d: {
            properties: {
              e: {
                properties: {
                  f: { type: 'integer' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: { p: 0 } },
        d: { e: {} }
      },
      source: { d: {} },
      result: {
        a: { b: { p: 0 } },
        d: { e: {} }
      }
    },

    {
      assertion: 'should leave target array intact when source value is not present',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' }
                }
              }
            }
          },
          d: {
            properties: {
              e: {
                properties: {
                  f: { type: 'integer' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: [ 2, 3 ] },
        d: { e: [] }
      },
      source: { a: {} },
      result: {
        a: { b: [ 2, 3 ] },
        d: { e: [] }
      }
    },

    {
      assertion: 'should leave target null intact when source value is not present',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' }
                }
              }
            }
          },
          d: {
            properties: {
              e: {
                properties: {
                  f: { type: 'integer' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: null },
        d: { e: null }
      },
      source: { a: {} },
      result: {
        a: { b: null },
        d: { e: null }
      }
    },

    {
      assertion: 'should leave target primitive value intact when source value is not present',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' }
                }
              }
            }
          },
          d: {
            properties: {
              e: {
                properties: {
                  f: { type: 'integer' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: false },
        d: { e: 1 }
      },
      source: {
        d: { e: 2 }
      },
      result: {
        a: { b: false },
        d: { e: 2 }
      }
    },

    {
      assertion: 'should modify target object when source value is object',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' },
                  d: { type: 'integer' },
                  e: { type: 'string' }
                }
              }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: { type: 'integer' },
                  i: { type: 'string' },
                  j: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: { c: true, d: 0 } },
        f: {}
      },
      source: {
        a: { b: { d: 1, e: 'member' } },
        f: { g: { i: 'member' } }
      },
      result: {
        a: { b: { c: true, d: 1, e: 'member' } },
        f: { g: { i: 'member' } }
      }
    },

    {
      assertion: 'should replace target array when source value is object',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' },
                  d: { type: 'integer' },
                  e: { type: 'string' }
                }
              }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: { type: 'integer' },
                  i: { type: 'string' },
                  j: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: [ 1, 2, 3 ] },
        f: { g: [] }
      },
      source: {
        a: { b: { c: true, d: 3, e: 'hello' } },
        f: { g: {} }
      },
      result: {
        a: { b: { c: true, d: 3, e: 'hello' } },
        f: { g: {} }
      }
    },

    {
      assertion: 'should replace target null when source value is object',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' },
                  d: { type: 'integer' },
                  e: { type: 'string' }
                }
              }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: { type: 'integer' },
                  i: { type: 'string' },
                  j: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: null },
        f: { g: null }
      },
      source: {
        a: { b: { c: true, d: 3, e: 'hello' } },
        f: { g: {} }
      },
      result: {
        a: { b: { c: true, d: 3, e: 'hello' } },
        f: { g: {} }
      }
    },

    {
      assertion: 'should replace target primitive when source value is object',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' },
                  d: { type: 'integer' },
                  e: { type: 'string' }
                }
              }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: { type: 'integer' },
                  i: { type: 'string' },
                  j: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: true },
        f: { g: 3.14 }
      },
      source: {
        a: { b: { c: true, d: 3, e: 'hello' } },
        f: { g: {} }
      },
      result: {
        a: { b: { c: true, d: 3, e: 'hello' } },
        f: { g: {} }
      }
    },

    {
      assertion: 'should replace target object when source value is array',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' },
                  d: { type: 'integer' },
                  e: { type: 'string' }
                }
              }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: { type: 'integer' },
                  i: { type: 'string' },
                  j: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: { c: true, d: 3, e: 'hello' } },
        f: { g: {} }
      },
      source: {
        a: { b: [] },
        f: { g: [ 5, 4, 3, 2, 1 ] }
      },
      result: {
        a: { b: [] },
        f: { g: [ 5, 4, 3, 2, 1 ] }
      }
    },

    {
      assertion: 'should modify target array when source value is array',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                items: {
                  properties: {
                    c: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: [ { c: 'foo' }, { c: 'bar' }, { c: 'baz' } ] }
      },
      source: {
        a: { b: [ { c: 'f00' }, { c: 'b4r' } ] }
      },
      result: {
        a: { b: [ { c: 'f00' }, { c: 'b4r' }, { c: 'baz' } ] }
      }
    },

    {
      assertion: 'should replace target null when source value is array',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' },
                  d: { type: 'integer' },
                  e: { type: 'string' }
                }
              }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: { type: 'integer' },
                  i: { type: 'string' },
                  j: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: null },
        f: { g: null }
      },
      source: {
        a: { b: [ 3, 2, 1 ] },
        f: { g: [] }
      },
      result: {
        a: { b: [ 3, 2, 1 ] },
        f: { g: [] }
      }
    },

    {
      assertion: 'should replace target primitive when source value is array',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' },
                  d: { type: 'integer' },
                  e: { type: 'string' }
                }
              }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: { type: 'integer' },
                  i: { type: 'string' },
                  j: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: 3 },
        f: { g: 'value' }
      },
      source: {
        a: { b: [ 3, 2, 1 ] },
        f: { g: [] }
      },
      result: {
        a: { b: [ 3, 2, 1 ] },
        f: { g: [] }
      }
    },

    {
      assertion: 'should replace target object when source value is null',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' },
                  d: { type: 'integer' },
                  e: { type: 'string' }
                }
              }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: { type: 'integer' },
                  i: { type: 'string' },
                  j: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: { c: false, d: 4, e: 'value' } },
        f: { g: { h: {} } }
      },
      source: {
        a: { b: null },
        f: { g: null }
      },
      result: {
        a: { b: null },
        f: { g: null }
      }
    },

    {
      assertion: 'should replace target array when source value is null',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' },
                  d: { type: 'integer' },
                  e: { type: 'string' }
                }
              }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: { type: 'integer' },
                  i: { type: 'string' },
                  j: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: [ 1, 2, 3 ] },
        f: { g: [] }
      },
      source: {
        a: { b: null },
        f: { g: null }
      },
      result: {
        a: { b: null },
        f: { g: null }
      }
    },

    {
      assertion: 'should keep target null when source value is null',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' },
                  d: { type: 'integer' },
                  e: { type: 'string' }
                }
              }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: { type: 'integer' },
                  i: { type: 'string' },
                  j: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: null },
        f: { g: null }
      },
      source: {
        a: { b: null },
        f: { g: null }
      },
      result: {
        a: { b: null },
        f: { g: null }
      }
    },

    {
      assertion: 'should replace target primitive when source value is null',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' },
                  d: { type: 'integer' },
                  e: { type: 'string' }
                }
              }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: { type: 'integer' },
                  i: { type: 'string' },
                  j: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: -123 },
        f: { g: true }
      },
      source: {
        a: { b: null },
        f: { g: null }
      },
      result: {
        a: { b: null },
        f: { g: null }
      }
    },

    {
      assertion: 'should replace target object when source value is primitive',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' },
                  d: { type: 'integer' },
                  e: { type: 'string' }
                }
              }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: { type: 'integer' },
                  i: { type: 'string' },
                  j: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: { c: false, d: 4, e: 'value' } },
        f: { g: { h: {} } }
      },
      source: {
        a: { b: true },
        f: { g: 3.14 }
      },
      result: {
        a: { b: true },
        f: { g: 3.14 }
      }
    },

    {
      assertion: 'should replace target array when source value is primitive',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' },
                  d: { type: 'integer' },
                  e: { type: 'string' }
                }
              }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: { type: 'integer' },
                  i: { type: 'string' },
                  j: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: [ 1, 2, 3 ] },
        f: { g: [] }
      },
      source: {
        a: { b: null },
        f: { g: null }
      },
      result: {
        a: { b: null },
        f: { g: null }
      }
    },

    {
      assertion: 'should replace target null when source value is primitive',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' },
                  d: { type: 'integer' },
                  e: { type: 'string' }
                }
              }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: { type: 'integer' },
                  i: { type: 'string' },
                  j: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: null },
        f: { g: null }
      },
      source: {
        a: { b: -123 },
        f: { g: true }
      },
      result: {
        a: { b: -123 },
        f: { g: true }
      }
    },

    {
      assertion: 'should replace target primitive when source value is primitive',
      schema: {
        properties: {
          a: {
            properties: {
              b: {
                properties: {
                  c: { type: 'boolean' },
                  d: { type: 'integer' },
                  e: { type: 'string' }
                }
              }
            }
          },
          f: {
            properties: {
              g: {
                properties: {
                  h: { type: 'integer' },
                  i: { type: 'string' },
                  j: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      target: {
        a: { b: -123 },
        f: { g: true }
      },
      source: {
        a: { b: -456 },
        f: { g: false }
      },
      result: {
        a: { b: -456 },
        f: { g: false }
      }
    }

  ],



  /**
   * These tests cover simple array item assignment. They cover assignment from
   * input to target, empty and false values, unexpected types, and existing values
   * on the target object.
   */
  'level 1 array items assignment (single schema)': [

    {
      assertion: 'should assign array source values of expected type to target',
      schema: { items: { type: 'array' } },
      target: [],
      source: [ [], [], [], [], [], [] ],
      result: [ [], [], [], [], [], [] ]
    },

    {
      assertion: 'should assign boolean source values of expected type to target',
      schema: { items: { type: 'boolean' } },
      target: [],
      source: [ true, false, true, false, true, false ],
      result: [ true, false, true, false, true, false ]
    },

    {
      assertion: 'should assign integer source values of expected type to target',
      schema: { items: { type: 'integer' } },
      target: [],
      source: [ 1, 1, 2, 3, 5, 8 ],
      result: [ 1, 1, 2, 3, 5, 8 ]
    },

    {
      assertion: 'should assign null source values of expected type to target',
      schema: { items: { type: 'null' } },
      target: [],
      source: [ null, null, null ],
      result: [ null, null, null ]
    },

    {
      assertion: 'should assign number source values of expected type to target',
      schema: { items: { type: 'number' } },
      target: [],
      source: [ 1.23, 4.56, 7.89 ],
      result: [ 1.23, 4.56, 7.89 ]
    },

    {
      assertion: 'should assign object source values of expected type to target',
      schema: { items: { type: 'object' } },
      target: [],
      source: [ { foo: 'bar' }, { baz: 'quux' } ],
      result: [ { foo: 'bar' }, { baz: 'quux' } ]
    },

    {
      assertion: 'should assign string source values of expected type to target',
      schema: { items: { type: 'string' } },
      target: [],
      source: [ 'foo', 'bar', 'baz', 'quux' ],
      result: [ 'foo', 'bar', 'baz', 'quux' ]
    },

    {
      assertion: 'should assign undefined source values of expected type to target',
      schema: { items: { type: 'undefined' } },
      target: [],
      source: [ undefined, undefined, undefined ],
      result: [ undefined, undefined, undefined ]
    },


    {
      assertion: 'should assign array source values of unexpected type to target',
      schema: { items: { type: 'boolean' } },
      target: [],
      source: [ [], [], [], [], [], [] ],
      result: [ [], [], [], [], [], [] ]
    },

    {
      assertion: 'should assign boolean source values of unexpected type to target',
      schema: { items: { type: 'integer' } },
      target: [],
      source: [ true, false, true, false, true, false ],
      result: [ true, false, true, false, true, false ]
    },

    {
      assertion: 'should assign integer source values of unexpected type to target',
      schema: { items: { type: 'null' } },
      target: [],
      source: [ 1, 1, 2, 3, 5, 8 ],
      result: [ 1, 1, 2, 3, 5, 8 ]
    },

    {
      assertion: 'should assign null source values of unexpected type to target',
      schema: { items: { type: 'number' } },
      target: [],
      source: [ null, null, null ],
      result: [ null, null, null ]
    },

    {
      assertion: 'should assign number source values of unexpected type to target',
      schema: { items: { type: 'object' } },
      target: [],
      source: [ 1.23, 4.56, 7.89 ],
      result: [ 1.23, 4.56, 7.89 ]
    },

    {
      assertion: 'should assign object source values of unexpected type to target',
      schema: { items: { type: 'string' } },
      target: [],
      source: [ { foo: 'bar' }, { baz: 'quux' } ],
      result: [ { foo: 'bar' }, { baz: 'quux' } ]
    },

    {
      assertion: 'should assign string source values of unexpected type to target',
      schema: { items: { type: 'undefined' } },
      target: [],
      source: [ 'foo', 'bar', 'baz', 'quux' ],
      result: [ 'foo', 'bar', 'baz', 'quux' ]
    },

    {
      assertion: 'should assign undefined source values of unexpected type to target',
      schema: { items: { type: 'array' } },
      target: [],
      source: [ undefined, undefined, undefined ],
      result: [ undefined, undefined, undefined ]
    },

    {
      assertion: 'should assign empty and falsy values to target',
      schema: {
        items: {
          type: [
            'array',
            'boolean',
            'integer',
            'null',
            'number',
            'object',
            'string',
            'undefined'
          ]
        }
      },
      target: [],
      source: [ [], false, 0, null, 0.00, {}, '', undefined ],
      result: [ [], false, 0, null, 0.00, {}, '', undefined ]
    },

    {
      // QUESTION: what does this mean for undefined values? we may need an
      // option to overwrite/not overwrite existing array items with `undefined`.
      assertion: 'should leave target values not present on source intact',
      schema: {
        items: {
          type: [
            'array',
            'boolean',
            'integer',
            'null',
            'number',
            'object',
            'string',
            'undefined'
          ]
        }
      },
      target: [
        undefined,
        [],
        false,
        1,
        null,
        3.14,
        { foo: 'bar' },
        'original'
      ],
      source: [
        5.9,
        { baz: 'quux' },
        true
      ],
      result: [
        5.9,
        { baz: 'quux' },
        true,
        1,
        null,
        3.14,
        { foo: 'bar' },
        'original'
      ]
    }
  ]

}

/**
 * Deep Copy
 *
 * NOTE: JSON.stringify() does not preserve undefined values as object properties,
 * therefore we can't copy enumerable properties with a value of undefined this way.
 *
 * This method of deep copy was intended to be used here to ensure we're always
 * dealing with unmutated initial target values on successive test runs using `-w`
 *
 * Preserved here until we determine the next best option.
 */
function copy (value) {
  return JSON.parse(JSON.stringify(value))
}

/**
 * Run the tests
 */
describe.only('JSON Schema-based Object Initialization', () => {
  Object.keys(tests).forEach(description => {
    describe(description, () => {
      tests[description].forEach(test => {
        let { assertion, schema, target, source, options, result } = test
        let fn = Initializer.compile(schema)

        it(assertion, () => {
          //target = copy(target)
          //source = copy(source)

          fn(target, source, options)
          target.should.eql(result)
        })
      })
    })
  })
})
