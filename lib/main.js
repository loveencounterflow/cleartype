(function() {
  'use strict';// std
  var Cleartype_error, Cleartype_validation_error, Type, Typespace, debug, help, hide, nameit, rpr, std, type_of, warn;

  //===========================================================================================================
  ({type_of} = require('./builtins'));

  //-----------------------------------------------------------------------------------------------------------
  // get_instance_methods
  // bind_instance_methods
  ({hide, nameit, debug, warn, help, rpr} = require('./helpers'));

  //===========================================================================================================
  Cleartype_error = class Cleartype_error extends Error {};

  Cleartype_validation_error = class Cleartype_validation_error extends Cleartype_error {};

  //===========================================================================================================
  Type = class Type {
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
      return this.constructor.from_declaration(dcl);
    }

    //---------------------------------------------------------------------------------------------------------
    static from_declaration(typename, dcl) {
      var clasz, create, extension, fields, has_fields, is_extension, isa, per_se_isa, ref, ref1;
      if (dcl instanceof this) {
        /* TAINT should wrap b/c of names? */
        return dcl;
      }
      //.......................................................................................................
      ({has_fields, fields} = this._fields_from_dcl_fields((ref = dcl.fields) != null ? ref : null));
      //.......................................................................................................
      /* TAINT condition should use API like 'has_property_but_value_isnt_null()' (?name?) */
      if ((Reflect.has(dcl, 'refines')) && (dcl.refines !== null)) {
        if (!(dcl.refines instanceof this)) {
          /* TAINT use `type_of()` */
          throw new Error(`Ω___2 dcl.refines must be instanceof ${rpr(this)}, got ${rpr(dcl.refines)}`);
        }
        is_extension = true;
        extension = dcl.refines.constructor;
      } else {
        is_extension = false;
        extension = this;
      }
      //.......................................................................................................
      if (dcl.isa != null) {
        switch (true) {
          case dcl.isa instanceof this:
            per_se_isa = (function(isa) {
              return function(x) {
                return isa(x);
              };
            })(dcl.isa.isa);
            break;
          case (Object.prototype.toString.call(dcl.isa)) === '[object Function]':
            per_se_isa = dcl.isa;
            break;
          default:
            throw new Error('Ω___3');
        }
      } else {
        //.......................................................................................................
        /* TAINT decomplect logic */
        if (has_fields) {
          per_se_isa = function(x) {
            /* TAINT use type_of */
            var field_name, ref1, ref2, rejection, subtype;
            if (x == null) {
              return false;
            }
            if ((ref1 = x.constructor) !== Object && ref1 !== (void 0)) {
              return false;
            }
/* stad.pod.isa x */            ref2 = dcl.fields;
            for (field_name in ref2) {
              subtype = ref2[field_name];
              if (subtype.isa(x[field_name])) {
                continue;
              }
              rejection = `expected a ${subtype.name} for field ${rpr(field_name)}, got ${rpr(x[field_name])}`;
              warn('Ω___4', rejection);
              return false;
            }
            return true;
          };
        } else {
          if (!is_extension) {
            throw new Error("Ω___1 type declaration must have one of 'fields', 'isa' or 'refines' properties, got none");
          }
          per_se_isa = function(x) {
            return true;
          };
        }
      }
      //.......................................................................................................
      if (is_extension) {
        /* TAINT review use of dcl.refines here */
        debug('Ωcltt___5', typename, dcl.refines, dcl.refines.isa);
        isa = function(x) {
          return (dcl.refines.isa(x)) && (per_se_isa(x));
        };
      } else {
        isa = per_se_isa;
      }
      //.......................................................................................................
      create = (ref1 = dcl.create) != null ? ref1 : function(x) {
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

        _Class.prototype.isa = nameit(_Class.isaname_from_typename(typename), isa);

        _Class.prototype.create = create;

        _Class.prototype.fields = fields;

        _Class.prototype.has_fields = has_fields;

        return _Class;

      }).call(this);
      nameit(clasz.classname_from_typename(typename), clasz);
      return new clasz();
    }

    //---------------------------------------------------------------------------------------------------------
    static _fields_from_dcl_fields(dcl_fields = null) {
      var fields, has_fields, sub_type, sub_typename;
      has_fields = false;
      fields = Object.create(null);
      if (dcl_fields != null) {
        for (sub_typename in dcl_fields) {
          sub_type = dcl_fields[sub_typename];
          has_fields = true;
          fields[sub_typename] = sub_type;
        }
      }
      return {has_fields, fields};
    }

    //---------------------------------------------------------------------------------------------------------
    static classname_from_typename(typename = null) {
      var R;
      R = typename != null ? typename : 'anonymous';
      /* TAINT not Unicode-compliant */
      return R[0].toUpperCase() + R.slice(1);
    }

    //---------------------------------------------------------------------------------------------------------
    static isaname_from_typename(typename = null) {
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

    //---------------------------------------------------------------------------------------------------------
    isa(x) {
      return x instanceof this.constructor;
    }

  };

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
        this[typename] = Type.from_declaration(typename, dcl);
      }
      return null;
    }

  };

  //===========================================================================================================
  // type  = new Type()
  std = new Typespace();

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