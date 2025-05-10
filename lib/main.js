(function() {
  'use strict';
  var Cleartype, Cleartype_error, Cleartype_validation_error, TMP_typespace1, bind_instance_methods, ct, ct_kinds, debug, help, hide, primitive_types, rpr, type_of;

  ({TMP_typespace1, type_of, primitive_types, ct_kinds} = require('./builtins'));

  ({hide, bind_instance_methods, debug, help, rpr} = require('./helpers'));

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
          // debug 'Ωcleartype___1', @isa
          // debug 'Ωcleartype___2', @_contexts
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
        debug('Ωcleartype___3', this.isa, this.create, this._get_ctx);
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
        throw new Cleartype_validation_error(`Ωcleartype___4 validation error\n${rpr(type)}\n${rpr(x)}`);
      }

      //---------------------------------------------------------------------------------------------------------
      validate_optional(type, x) {
        if (this.isa_optional(type, x)) {
          return x;
        }
        throw new Cleartype_validation_error(`Ωcleartype___5 validation error\n${rpr(type)}\n${rpr(x)}`);
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
  module.exports = {Cleartype, ct, TMP_typespace1};

}).call(this);

//# sourceMappingURL=main.js.map