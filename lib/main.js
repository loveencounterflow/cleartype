(function() {
  'use strict';
  var Cleartype, Cleartype_error, Cleartype_validation_error, bind_instance_methods, ct, ct_kinds, debug, get_instance_methods, help, hide, primitive_types, rpr, std, type_of;

  ({std, type_of, primitive_types, ct_kinds} = require('./builtins'));

  ({hide, get_instance_methods, bind_instance_methods, debug, help, rpr} = require('./helpers'));

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

  Cleartype = (function() {
    //===========================================================================================================
    class Cleartype {
      //---------------------------------------------------------------------------------------------------------
      constructor() {
        hide(this, "_contexts", false ? new WeakMap() : new Map/* TAINT this is going to be configurable for testing */());
        bind_instance_methods(this);
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
          ct: this
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
        throw new Cleartype_validation_error(`Ωcleartype___1 validation error\n${rpr(type)}\n${rpr(x)}`);
      }

      //---------------------------------------------------------------------------------------------------------
      validate_optional(type, x) {
        if (this.isa_optional(type, x)) {
          return x;
        }
        throw new Cleartype_validation_error(`Ωcleartype___2 validation error\n${rpr(type)}\n${rpr(x)}`);
      }

      //---------------------------------------------------------------------------------------------------------
      create(type, ...P) {
        return this.validate(type, type.$create.call(this._get_ctx(type), ...P));
      }

    };

    //---------------------------------------------------------------------------------------------------------
    Cleartype.prototype.type_of = type_of;

    return Cleartype;

  }).call(this);

  //===========================================================================================================
  ct = new Cleartype();

  (() => {    // #===========================================================================================================
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
    var CT;
    CT = new Cleartype();
    return module.exports = {Cleartype, std, CT, ...(get_instance_methods(CT))};
  })();

}).call(this);

//# sourceMappingURL=main.js.map