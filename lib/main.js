(function() {
  'use strict';
  var Cleartype_error, Cleartype_validation_error, Type, Typespace, debug, gnd, help, hide, nameit, rpr, std, type, type_of, warn;

  //===========================================================================================================
  ({gnd, type_of} = require('./builtins'));

  //-----------------------------------------------------------------------------------------------------------
  // get_instance_methods
  // bind_instance_methods
  ({hide, nameit, debug, warn, help, rpr} = require('./helpers'));

  //===========================================================================================================
  Cleartype_error = class Cleartype_error extends Error {};

  Cleartype_validation_error = class Cleartype_validation_error extends Cleartype_error {};

  Type = (function() {
    //===========================================================================================================
    class Type {
      //---------------------------------------------------------------------------------------------------------
      constructor(dcl = null) {
        if (dcl != null) {
          throw new Error("Ω___1 not allowed");
        }
        // H.bind_instance_methods @
        return void 0;
      }

      //---------------------------------------------------------------------------------------------------------
      create(typename, dcl) {
        var clasz, create, extension, fields, has_fields, is_extension, isa, ref;
        if (dcl instanceof this.constructor) {
          /* TAINT should wrap b/c of names? */
          return dcl;
        }
        //.......................................................................................................
        ({has_fields, fields} = this._fields_from_dcl(dcl));
        ({is_extension, extension} = this._extension_from_dcl(dcl));
        isa = this._isa_from_dcl(dcl, {has_fields, is_extension, typename});
        //.......................................................................................................
        create = (ref = dcl.create) != null ? ref : function(x) {
          return x;
        };
        // if dcl.create?
        //   create = ( x ) -> dcl.create x
        // else
        //   ### TAINT check whether there are fields ###
        //   fields = {}
        //   for field_name, dsc of Object.getOwnPropertyDescriptors dcl
        //.......................................................................................................
        clasz = (function() {
          var _Class;

          _Class = class extends extension {};

          _Class.prototype.name = typename;

          // refines:      dcl.refines
          _Class.prototype.isa = isa;

          _Class.prototype.create = create;

          _Class.prototype.fields = fields;

          _Class.prototype.has_fields = has_fields;

          _Class.prototype.is_extension = is_extension;

          return _Class;

        }).call(this);
        nameit(this._classname_from_typename(typename), clasz);
        return new clasz();
      }

      //---------------------------------------------------------------------------------------------------------
      _fields_from_dcl(dcl) {
        var fields, has_fields, ref, sub_type, sub_typename;
        has_fields = false;
        fields = Object.create(null);
        if (dcl.fields != null) {
          ref = dcl.fields;
          for (sub_typename in ref) {
            sub_type = ref[sub_typename];
            has_fields = true;
            fields[sub_typename] = sub_type;
          }
        }
        return {has_fields, fields};
      }

      //---------------------------------------------------------------------------------------------------------
      _extension_from_dcl(dcl) {
        var extension, is_extension;
        is_extension = false;
        extension = this.constructor;
        /* TAINT condition should use API like 'has_property_but_value_isnt_null()' (?name?) */
        if ((Reflect.has(dcl, 'refines')) && (dcl.refines !== null)) {
          if (!(dcl.refines instanceof this.constructor)) {
            /* TAINT use `type_of()` */
            throw new Error(`Ω___2 dcl.refines must be instanceof ${rpr(this)}, got ${rpr(dcl.refines)}`);
          }
          is_extension = true;
          extension = dcl.refines.constructor;
        }
        return {is_extension, extension};
      }

      //---------------------------------------------------------------------------------------------------------
      _isa_from_dcl(dcl, {has_fields, is_extension, typename}) {
        var isa;
        if ((isa = dcl.isa) != null) {
          if (isa instanceof this.constructor) {
            isa = (function(other_type) {
              return function(x) {
                return other_type.isa(x);
              };
            })(isa);
          }
          if (!gnd.function.isa(dcl.isa)) {
            throw new Error('Ω___3');
          }
        } else {
          //.......................................................................................................
          /* TAINT decomplect logic */
          if (has_fields) {
            isa = this._get_isa_for_fields(dcl);
          } else {
            if (!is_extension) {
              throw new Error("Ω___1 type declaration must have one of 'fields', 'isa' or 'refines' properties, got none");
            }
            isa = function(x) {
              return true;
            };
          }
        }
        //.......................................................................................................
        if (is_extension) {
          isa = (function(base, isa) {
            return function(x) {
              return (base.isa(x)) && (isa.call(this, x));
            };
          })(dcl.refines, isa);
        }
        //.......................................................................................................
        return nameit(this._isaname_from_typename(typename), isa);
      }

      //---------------------------------------------------------------------------------------------------------
      _get_isa_for_fields(dcl) {
        return function(x) {
          /* TAINT use type_of */
          var field_name, ref, rejection, subtype;
          if (x == null) {
            return false;
          }
          if (!gnd.pod.isa(x)) {
            /* TAINT in the future, should allow extending e.g. lists with fields? */
            return false;
          }
          ref = dcl.fields;
          for (field_name in ref) {
            subtype = ref[field_name];
            if (subtype.isa(x[field_name])) {
              continue;
            }
            rejection = `expected a ${subtype.name} for field ${rpr(field_name)}, got ${rpr(x[field_name])}`;
            warn('Ω___4', rejection);
            return false;
          }
          return true;
        };
      }

      //---------------------------------------------------------------------------------------------------------
      _classname_from_typename(typename = null) {
        var R;
        R = typename != null ? typename : 'anonymous';
        /* TAINT not Unicode-compliant */
        return R[0].toUpperCase() + R.slice(1);
      }

      //---------------------------------------------------------------------------------------------------------
      _isaname_from_typename(typename = null) {
        var R;
        R = typename != null ? typename : 'anonymous';
        return `isa_${typename}`;
      }

      //---------------------------------------------------------------------------------------------------------
      validate(x) {
        if (this.isa(x)) {
          return x;
        }
        throw new Error("Ω___6 Cleartype_validation_error");
      }

    };

    //---------------------------------------------------------------------------------------------------------
    Type.prototype.isa = nameit('isa_type', function(x) {
      return x instanceof this.constructor;
    });

    return Type;

  }).call(this);

  //===========================================================================================================
  Typespace = class Typespace {
    //---------------------------------------------------------------------------------------------------------
    add_types(dcls) {
      var dcl, typename;
/* TAINT name collisions possible */
      for (typename in dcls) {
        dcl = dcls[typename];
        if (Reflect.has(this, typename)) {
          throw new Error(`Ω___7 name collision: type / property ${rpr(typename)} already declared`);
        }
        this[typename] = type.create(typename, dcl);
      }
      return null;
    }

  };

  //===========================================================================================================
  type = new Type();

  std = new Typespace();

  std.type = type;

  //===========================================================================================================
  std.add_types({
    //.........................................................................................................
    text: {
      isa: function(x) {
        return (Object.prototype.toString.call(x)) === '[object String]';
      },
      create: function(x) {
        var ref;
        return (ref = x != null ? x.toString() : void 0) != null ? ref : '';
      }
    },
    //.........................................................................................................
    float: {
      isa: function(x) {
        return Number.isFinite(x);
      },
      create: function(n = 0) {
        if (typeof x !== "undefined" && x !== null) {
          return parseFloat(x);
        } else {
          return 0;
        }
      }
    },
    //.........................................................................................................
    integer: {
      isa: function(x) {
        return Number.isInteger(x);
      },
      create: function(n = 0) {
        if (typeof x !== "undefined" && x !== null) {
          return parseInt(n, 10);
        } else {
          return 0;
        }
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  std.add_types({
    /*
    nonempty_text:
      isa:      std.text
      refine:   ( x ) -> ( x.length isnt 0 )
      create:   ( x ) -> x?.toString() ? ''
    */
    //.........................................................................................................
    nonempty_text: {
      refines: std.text,
      // isa:      ( x ) -> ( std.text.isa x ) and ( x.length isnt 0 )
      isa: function(x) {
        return x.length !== 0;
      },
      create: function(x) {
        var ref;
        return (ref = x != null ? x.toString() : void 0) != null ? ref : '';
      }
    },
    //.........................................................................................................
    quantity_q: {
      refines: std.float
    }
  });

  // isa: std.float.isa
  //-----------------------------------------------------------------------------------------------------------
  std.add_types({
    //.........................................................................................................
    quantity_u: {
      refines: std.nonempty_text
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  std.add_types({
    //.........................................................................................................
    quantity: {
      create: function(cfg) {
        return {
          q: 0,
          u: 'u',
          ...cfg
        };
      },
      fields: {
        q: std.quantity_q,
        u: std.quantity_u
      }
    }
  });

  //===========================================================================================================
  module.exports = {std, type_of, Type, Typespace};

}).call(this);

//# sourceMappingURL=main.js.map