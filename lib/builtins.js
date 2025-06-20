(function() {
  'use strict';
  var gnd, kind_of, pod_prototypes, type_of, validate,
    indexOf = [].indexOf;

  //-----------------------------------------------------------------------------------------------------------
  // primitive_types = Object.freeze [ 'null', 'undefined', 'infinity', 'boolean', 'nan', 'float', 'anyfloat', 'text', ]
  // ct_kinds        = Object.freeze [ '$unspecified', '$enumeration', '$record', '$variant', ]
  pod_prototypes = Object.freeze([null, Object.getPrototypeOf({})]);

  //===========================================================================================================
  gnd = {
    anything: {
      isa: function(x) {
        return true;
      }
    },
    primitive: {
      isa: function(x) {
        return primitive_types.includes(type_of(x));
      }
    },
    //.........................................................................................................
    /* NOTE types 'simple' and 'compound' more or less boil down to x being a POD, their explicit definition
     are for clarity and to allow for later modification */
    simple: {
      isa: function(x) {
        return (x == null) || (!gnd.compound.isa(x));
      }
    },
    compound: {
      isa: function(x) {
        return gnd.pod.isa(x);
      }
    },
    //.........................................................................................................
    boolean: {
      isa: function(x) {
        return (x === true) || (x === false);
      }
    },
    function: {
      isa: function(x) {
        return (Object.prototype.toString.call(x)) === '[object Function]';
      }
    },
    asyncfunction: {
      isa: function(x) {
        return (Object.prototype.toString.call(x)) === '[object AsyncFunction]';
      }
    },
    symbol: {
      isa: function(x) {
        return (typeof x) === 'symbol';
      }
    },
    object: {
      isa: function(x) {
        return (x != null) && (typeof x === 'object') && ((Object.prototype.toString.call(x)) === '[object Object]');
      }
    },
    float: {
      isa: function(x) {
        return Number.isFinite(x);
      }
    },
    integer: {
      isa: function(x) {
        return Number.isInteger(x);
      }
    },
    text: {
      isa: function(x) {
        return (typeof x) === 'string';
      }
    },
    nonempty_text: {
      isa: function(x) {
        return (typeof x) === 'string' && (x.length > 0);
      }
    },
    set: {
      isa: function(x) {
        return x instanceof Set;
      }
    },
    map: {
      isa: function(x) {
        return x instanceof Map;
      }
    },
    list: {
      isa: function(x) {
        return Array.isArray(x);
      }
    },
    nonempty_list: {
      isa: function(x) {
        return (Array.isArray(x)) && (x.length > 0);
      }
    },
    kind: {
      isa: function(x) {
        return x === 'simple' || x === 'compound';
      }
    },
    //.........................................................................................................
    // nullary:        isa:  ( x ) -> x? and ( ( x.length is 0 ) or ( x.size is 0 ) )
    // unary:          isa:  ( x ) -> x? and ( ( x.length is 1 ) or ( x.size is 1 ) )
    // binary:         isa:  ( x ) -> x? and ( ( x.length is 2 ) or ( x.size is 2 ) )
    // trinary:        isa:  ( x ) -> x? and ( ( x.length is 3 ) or ( x.size is 3 ) )
    //.........................................................................................................
    // pod:            isa:  ( x ) -> x? and x.constructor in [ Object, undefined, ]
    pod: {
      isa: function(x) {
        var ref;
        return (x != null) && (ref = Object.getPrototypeOf(x), indexOf.call(pod_prototypes, ref) >= 0);
      },
      get_template: function() {
        return Object.create(null);
      }
    },
    nullo: {
      isa: function(x) {
        return (Object.getPrototypeOf(x)) === null;
      }
    },
    type: {
      isa: function(x) {
        return (x != null) && x instanceof (require('./main')).Type;
      }
    },
    dcl_field: {
      isa: function(x) {
        return gnd.type.isa(x);
      }
    },
    //.........................................................................................................
    dcl: {
      isa: function(x) {
        if (!gnd.compound.isa(x)) {
          return false;
        }
        if (!gnd.nonempty_text.isa(x.name)) {
          return false;
        }
        if (!gnd.kind.isa(x.kind)) {
          return false;
        }
        if (!gnd.type.isa(x.base)) {
          return false;
        }
        if (!gnd.nullo.isa(x.fields)) {
          return false;
        }
        if (!gnd.nullo.isa(x.template)) {
          return false;
        }
        if (!gnd.boolean.isa(x.has_fields)) {
          return false;
        }
        if (!gnd.boolean.isa(x.has_template)) {
          return false;
        }
        if (!gnd.boolean.isa(x.has_base)) {
          return false;
        }
        if (!gnd.boolean.isa(x.is_creatable)) {
          return false;
        }
        return true;
      },
      get_template: function() {
        return {
          name: null,
          base: null,
          fields: null,
          template: null,
          has_fields: null,
          has_template: null,
          has_base: null,
          kind: null,
          is_creatable: null
        };
      }
    }
  };

  //-----------------------------------------------------------------------------------------------------------
  kind_of = function(x) {
    if (gnd.compound.isa(x)) {
      return 'compound';
    } else {
      return 'simple';
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

  //-----------------------------------------------------------------------------------------------------------
  validate = function(type, x) {
    if (type.isa(x)) {
      return x;
    }
    throw new Cleartype_type_validation_error(`Ω___1 expected a ${type.name}, got a ${type_of(x)}`);
  };

  //===========================================================================================================
  module.exports = {gnd, kind_of, type_of, validate};

}).call(this);

//# sourceMappingURL=builtins.js.map