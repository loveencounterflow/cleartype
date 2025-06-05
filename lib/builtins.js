(function() {
  'use strict';
  var ct_kinds, primitive_types, std, type_of;

  //-----------------------------------------------------------------------------------------------------------
  primitive_types = Object.freeze(['null', 'undefined', 'infinity', 'boolean', 'nan', 'float', 'anyfloat', 'text']);

  ct_kinds = Object.freeze(['$unspecified', '$enumeration', '$record', '$variant']);

  //===========================================================================================================
  std = {
    anything: {
      $isa: function(x) {
        return true;
      }
    },
    primitive: {
      $isa: function(x) {
        return primitive_types.includes(type_of(x));
      }
    },
    boolean: {
      $isa: function(x) {
        return (x === true) || (x === false);
      }
    },
    function: {
      $isa: function(x) {
        return (Object.prototype.toString.call(x)) === '[object Function]';
      },
      $create: function() {
        return function() {
          return null;
        };
      }
    },
    asyncfunction: {
      $isa: function(x) {
        return (Object.prototype.toString.call(x)) === '[object AsyncFunction]';
      },
      $create: function() {
        return async function() {
          return (await null);
        };
      }
    },
    symbol: {
      $isa: function(x) {
        return (typeof x) === 'symbol';
      },
      $create: function(...P) {
        return Symbol(this.ct.create(std.text, ...P));
      }
    },
    object: {
      $isa: function(x) {
        return (x != null) && (typeof x === 'object') && ((Object.prototype.toString.call(x)) === '[object Object]');
      },
      $create: function(cfg) {
        return {...cfg};
      }
    },
    pod: {
      $isa: function(x) {
        var ref;
        return (x != null) && ((ref = x.constructor) === Object || ref === (void 0));
      },
      $create: function(cfg) {
        return Object.assign(Object.create(null), cfg);
      }
    },
    float: {
      $isa: function(x) {
        return Number.isFinite(x);
      },
      $create: function() {
        return 0;
      }
    },
    integer: {
      $isa: function(x) {
        return Number.isInteger(x);
      },
      $create: function() {
        return 0;
      }
    },
    text: {
      $isa: function(x) {
        return (typeof x) === 'string';
      },
      $create: function(cfg) {
        var e;
        return ((function() {
          var results;
          results = [];
          for (e of cfg) {
            results.push(e);
          }
          return results;
        })()).join('');
      }
    },
    nonempty_text: {
      $isa: function(x) {
        return (typeof x) === 'string' && (x.length > 0);
      },
      $create: function(cfg) {
        var e;
        return ((function() {
          var results;
          results = [];
          for (e of cfg) {
            results.push(e);
          }
          return results;
        })()).join('');
      }
    },
    set: {
      $isa: function(x) {
        return x instanceof Set;
      },
      $create: function(cfg) {
        return new Set(cfg != null ? cfg : []);
      }
    },
    map: {
      $isa: function(x) {
        return x instanceof Map;
      },
      $create: function(cfg) {
        return new Map(cfg != null ? cfg : []);
      }
    },
    list: {
      $isa: function(x) {
        return Array.isArray(x);
      },
      $create: function(cfg) {
        var results, x;
        results = [];
        for (x of cfg != null ? cfg : []) {
          results.push(x);
        }
        return results;
      }
    },
    nonempty_list: {
      $isa: function(x) {
        return (Array.isArray(x)) && (x.length > 0);
      },
      $create: function(cfg) {
        var results, x;
        results = [];
        for (x of cfg != null ? cfg : []) {
          results.push(x);
        }
        return results;
      }
    },
    //.........................................................................................................
    nullary: {
      $isa: function(x) {
        return (x != null) && ((x.length === 0) || (x.size === 0));
      }
    },
    unary: {
      $isa: function(x) {
        return (x != null) && ((x.length === 1) || (x.size === 1));
      }
    },
    binary: {
      $isa: function(x) {
        return (x != null) && ((x.length === 2) || (x.size === 2));
      }
    },
    trinary: {
      $isa: function(x) {
        return (x != null) && ((x.length === 3) || (x.size === 3));
      }
    }
  };

  //-----------------------------------------------------------------------------------------------------------
  type_of = function(x) {
    /* TAINT consider to return x.constructor.name */
    var jstypeof, millertype;
    if (x === null) {
      //.........................................................................................................
      /* Primitives: */
      return 'null';
    }
    if (x === void 0) {
      return 'undefined';
    }
    if ((x === +2e308) || (x === -2e308)) {
      return 'infinity';
    }
    if ((x === true) || (x === false)) {
      return 'boolean';
    }
    if (Number.isNaN(x)) {
      return 'nan';
    }
    if (Number.isFinite(x)) {
      return 'float';
    }
    // return 'pod'          if B.isa.pod x
    //.........................................................................................................
    switch (jstypeof = typeof x) {
      case 'string':
        return 'text';
    }
    if (Array.isArray(x)) {
      //.........................................................................................................
      return 'list';
    }
    switch (millertype = ((Object.prototype.toString.call(x)).replace(/^\[object ([^\]]+)\]$/, '$1')).toLowerCase()) {
      case 'regexp':
        return 'regex';
    }
    return millertype;
  };

  // switch millertype = Object::toString.call x
  //   when '[object Function]'            then return 'function'
  //   when '[object AsyncFunction]'       then return 'asyncfunction'
  //   when '[object GeneratorFunction]'   then return 'generatorfunction'

  //===========================================================================================================
  module.exports = {std, type_of, primitive_types, ct_kinds};

}).call(this);

//# sourceMappingURL=builtins.js.map