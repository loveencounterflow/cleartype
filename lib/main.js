(function() {
  'use strict';
  var Cleartype, Cleartype_error, Cleartype_validation_error, TMP_typespace1, ct, debug, help, rpr;

  ({debug, help} = console);

  rpr = function(x) {
    return (require('loupe')).inspect(x);
  };

  /*

   * from `ltsort` which uses an outdated version of `intertype`:

  get_base_types = ->
    return base_types if base_types?
    #.........................................................................................................
    base_types                = new Cleartype()
    { declare }               = base_types
    #.........................................................................................................
    declare.lt_nodelist 'list.of.nonempty.text'
    #.........................................................................................................
    declare.lt_constructor_cfg
      fields:
        loners:     'boolean'
      default:
        loners:     true
    #.........................................................................................................
    declare.lt_add_cfg
      fields:
        name:       'nonempty.text'
        precedes:   'lt_nodelist'
        needs:      'lt_nodelist'
      default:
        name:       null
        precedes:     null
        needs:      null
      create: ( x ) ->
        R           = x ? {}
        return R unless @isa.object R
        R.needs      ?= []
        R.precedes   ?= []
        R.needs       = [ R.needs,    ] unless @isa.list R.needs
        R.precedes    = [ R.precedes, ] unless @isa.list R.precedes
        return R
    #.........................................................................................................
    declare.lt_linearize_cfg
      fields:
        groups:     'boolean'
      default:
        groups:     false
    #.........................................................................................................
    return base_types

   */
  //===========================================================================================================
  Cleartype_error = class Cleartype_error extends Error {};

  Cleartype_validation_error = class Cleartype_validation_error extends Cleartype_error {};

  //===========================================================================================================
  Cleartype = class Cleartype {
    //---------------------------------------------------------------------------------------------------------
    constructor() {
      this._contexts = false ? new WeakMap() : new Map/* TAINT this is going to be configurable for testing */();
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    _get_ctx(type) {
      var R;
      if (typeof R !== "undefined" && R !== null) {
        return (R = this._contexts.get(type));
      }
      this._contexts.set(type, R = Object.freeze({
        me: type,
        types: this
      }));
      return R;
    }

    //---------------------------------------------------------------------------------------------------------
    isa(type, x) {
      return type.$isa.call(this._get_ctx(type), x);
    }

    //---------------------------------------------------------------------------------------------------------
    isa_optional(type, x) {
      return (x == null) || (this.isa(type, x));
    }

    //---------------------------------------------------------------------------------------------------------
    validate(type, x) {
      if (this.isa(type, x)) {
        return x;
      }
      throw new Cleartype_validation_error(`Ωpmi___1 validation error\n${rpr(type)}\n${rpr(x)}`);
    }

    //---------------------------------------------------------------------------------------------------------
    validate_optional(type, x) {
      if (this.isa_optional(type, x)) {
        return x;
      }
      throw new Cleartype_validation_error(`Ωpmi___2 validation error\n${rpr(type)}\n${rpr(x)}`);
    }

    //---------------------------------------------------------------------------------------------------------
    create(type, ...P) {
      return this.validate(type, type.$create.call(this._get_ctx(type), ...P));
    }

  };

  //===========================================================================================================
  ct = new Cleartype();

  // #===========================================================================================================
  // class Type

  //   #---------------------------------------------------------------------------------------------------------
  //   constructor: ( declaration ) ->
  //     @$isa     = declaration.$isa
  //     @$create  = declaration.$create
  //     return undefined

  //   # #---------------------------------------------------------------------------------------------------------
  //   # $isa: ->
  //   # $create: ->

  //===========================================================================================================
  TMP_typespace1 = {
    anything: {
      $isa: function(x) {
        return true;
      }
    },
    // $create: ( cfg ) ->
    boolean: {
      $isa: function(x) {
        return (x === true) || (x === false);
      }
    },
    // $create: ( cfg ) ->
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
      }
    },
    // $create: ( cfg ) ->
    object: {
      $isa: function(x) {
        return (x != null) && (typeof x === 'object') && ((Object.prototype.toString.call(x)) === '[object Object]');
      },
      $create: function(cfg) {
        return {...cfg};
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
    text: {
      $isa: function(x) {
        return (typeof x) === 'string';
      },
      $create: function() {
        return '';
      }
    },
    nullary: {
      $isa: function(x) {
        return (x != null) && ((x.length === 0) || (x.size === 0));
      }
    },
    // $create: ( cfg ) ->
    unary: {
      $isa: function(x) {
        return (x != null) && ((x.length === 1) || (x.size === 1));
      }
    },
    // $create: ( cfg ) ->
    binary: {
      $isa: function(x) {
        return (x != null) && ((x.length === 2) || (x.size === 2));
      }
    },
    // $create: ( cfg ) ->
    trinary: {
      $isa: function(x) {
        return (x != null) && ((x.length === 3) || (x.size === 3));
      }
    },
    // $create: ( cfg ) ->
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
        var ref, results, x;
        ref = cfg != null ? cfg : [];
        results = [];
        for (x of ref) {
          results.push(x);
        }
        return results;
      }
    }
  };

  //===========================================================================================================
  module.exports = {Cleartype, ct, TMP_typespace1};

}).call(this);

//# sourceMappingURL=main.js.map