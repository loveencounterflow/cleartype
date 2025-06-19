(function() {
  'use strict';
  var Cleartype_arguments_not_allowed_error, Cleartype_creation_error, Cleartype_error, Cleartype_validation_error, Internals, Type, Typespace, bind_instance_methods, debug, gnd, help, hide, internals, nameit, rpr, std, type, type_of, validate, warn;

  //===========================================================================================================
  ({gnd, type_of} = require('./builtins'));

  //-----------------------------------------------------------------------------------------------------------
  // get_instance_methods
  ({hide, bind_instance_methods, nameit, debug, warn, help, rpr} = require('./helpers'));

  //===========================================================================================================
  internals = new (Internals = class Internals {
    constructor() {
      this.gnd = gnd;
      return void 0;
    }

  })();

  //===========================================================================================================
  Cleartype_error = class Cleartype_error extends Error {};

  Cleartype_arguments_not_allowed_error = class Cleartype_arguments_not_allowed_error extends Cleartype_error {};

  Cleartype_validation_error = class Cleartype_validation_error extends Cleartype_error {};

  Cleartype_creation_error = class Cleartype_creation_error extends Cleartype_error {};

  //===========================================================================================================
  validate = function(type, x) {
    if (type.isa(x)) {
      return x;
    }
    throw new Cleartype_validation_error(`Ω___1 expected a ${type.name}, got a ${type_of(x)}`);
  };

  Type = (function() {
    //===========================================================================================================
    class Type {
      //---------------------------------------------------------------------------------------------------------
      constructor() {
        if (arguments.length !== 0) {
          throw new Cleartype_arguments_not_allowed_error("Ω___2 arguments not allowed");
        }
        bind_instance_methods(this);
        hide(this, 'name', this.constructor.name.toLowerCase());
        return void 0;
      }

      //---------------------------------------------------------------------------------------------------------
      create(typename, dcl) {
        var base, baseclass, clasz, create, fields, has_fields, has_template, is_extension, isa, template;
        if (dcl instanceof this.constructor) {
          /* TAINT should wrap b/c of names? */
          return dcl;
        }
        //.......................................................................................................
        ({is_extension, base, baseclass} = this._extension_from_dcl(dcl));
        ({has_fields, fields} = this._compile_fields({typename, dcl, base}));
        ({has_template, template} = this._compile_template({typename, dcl, base, fields}));
        isa = this._isa_from_dcl(dcl, {has_fields, is_extension, typename});
        //.......................................................................................................
        create = function() {
          throw new Cleartype_creation_error(`Ω___8 unable to create a ${typename}`);
        };
        if (dcl.create != null) {
          validate(gnd.function, dcl.create);
          create = (function(create) {
            return function(...P) {
              return this.validate(create.call(this, ...P));
            };
          })(dcl.create);
        } else if (is_extension && (!has_fields)) {
          create = (function(create) {
            return function(...P) {
              return this.validate(create.call(base, ...P));
            };
          })(base.create);
        /* TAINT provide create when there are fields but no create() */
        } else if (has_fields) {
          debug('Ω__10');
        }
        create = nameit(this._method_name_from_typename('create', typename), create);
        //.......................................................................................................
        /* TAINT should we differentiate instance properties from prototype methods? */
        clasz = (function() {
          var _Class;

          _Class = class extends baseclass {
            //.....................................................................................................
            constructor(...P) {
              super(...P);
              hide(this, 'name', typename);
              hide(this, 'base', dcl.base);
              hide(this, 'fields', fields);
              hide(this, 'template', template);
              hide(this, 'has_fields', has_fields);
              hide(this, 'has_template', has_template);
              hide(this, 'is_extension', is_extension);
              return void 0;
            }

          };

          //.....................................................................................................
          _Class.prototype.isa = isa;

          _Class.prototype.create = create;

          return _Class;

        }).call(this);
        nameit(this._classname_from_typename(typename), clasz);
        return new clasz();
      }

      //---------------------------------------------------------------------------------------------------------
      _compile_fields({typename, dcl, base}) {
        var fields, has_fields, i, len, ref, ref1, source, sub_field, sub_name;
        has_fields = false;
        fields = Object.create(null);
        ref = [base != null ? base.fields : void 0, dcl.fields];
        /* TAINT missing validate gnd.pod, fields */
        for (i = 0, len = ref.length; i < len; i++) {
          source = ref[i];
          ref1 = source != null ? source : {};
          for (sub_name in ref1) {
            sub_field = ref1[sub_name];
            has_fields = true;
            fields[sub_name] = sub_field;
          }
        }
        return {has_fields, fields};
      }

      //---------------------------------------------------------------------------------------------------------
      _compile_template({typename, dcl, base, fields}) {
        var has_template, i, len, producer, ref, ref1, source, sub_name, sub_template, template;
        has_template = false;
        template = Object.create(null);
        ref = [base != null ? base.template : void 0, dcl.template];
        /* TAINT missing validate gnd.pod, template */
        for (i = 0, len = ref.length; i < len; i++) {
          source = ref[i];
          ref1 = source != null ? source : {};
          for (sub_name in ref1) {
            sub_template = ref1[sub_name];
            has_template = true;
            producer = (gnd.function.isa(sub_template)) ? sub_template : (function(value) {
              return function() {
                return sub_template;
              };
            })(sub_template);
            /* TIANT use API call */
            template[sub_name] = nameit(`create_${typename}_${sub_name}`, producer);
          }
        }
        return {has_template, template};
      }

      //---------------------------------------------------------------------------------------------------------
      _extension_from_dcl(dcl) {
        var base, baseclass, is_extension;
        is_extension = false;
        baseclass = this.constructor;
        base = null;
        /* TAINT condition should use API like 'has_property_but_value_isnt_null()' (?name?) */
        if ((Reflect.has(dcl, 'base')) && (dcl.base !== null)) {
          if (!(dcl.base instanceof this.constructor)) {
            /* TAINT use `type_of()` */
            throw new Error(`Ω___9 dcl.base must be instanceof ${rpr(this)}, got ${rpr(dcl.base)}`);
          }
          is_extension = true;
          base = dcl.base;
          baseclass = dcl.base.constructor;
        }
        return {is_extension, base, baseclass};
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
          validate(gnd.function, dcl.isa);
        } else {
          //.......................................................................................................
          /* TAINT decomplect logic */
          if (has_fields) {
            isa = this._get_isa_for_fields(dcl);
          } else {
            if (!is_extension) {
              throw new Error("Ω__10 type declaration must have one of 'fields', 'isa' or 'base' properties, got none");
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
          })(dcl.base, isa);
        }
        //.......................................................................................................
        return nameit(this._method_name_from_typename('isa', typename), isa);
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
            // warn 'Ω__11', rejection
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
      _method_name_from_typename(methodname, typename = null) {
        var R;
        R = typename != null ? typename : '(anonymous)';
        return `${methodname}_${typename}`;
      }

      //---------------------------------------------------------------------------------------------------------
      validate(x) {
        if (this.isa(x)) {
          return x;
        }
        throw new Cleartype_validation_error(`Ω__13 validation error: expected a ${this.name}, got a ${type_of(x)}`);
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
          throw new Error(`Ω__14 name collision: type / property ${rpr(typename)} already declared`);
        }
        this[typename] = type.create(typename, dcl);
      }
      return null;
    }

  };

  //===========================================================================================================
  type = new Type();

  std = new Typespace();

  //===========================================================================================================
  std.add_types({
    //.........................................................................................................
    text: {
      isa: function(x) {
        return (typeof x) === 'string'; // ( Object::toString.call x ) is '[object String]'
      },
      /* NOTE just returning argument which will be validated; only strings pass so `create value` is a no-op / validation only */
      create: function(x) {
        if (arguments.length === 0) {
          return '';
        } else {
          return x;
        }
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
      },
      template: 0
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
      base: std.text,
      // isa:      ( x ) -> ( std.text.isa x ) and ( x.length isnt 0 )
      isa: function(x) {
        return x.length !== 0;
      }
    },
    //.........................................................................................................
    quantity_q: {
      base: std.float
    }
  });

  // isa: std.float.isa
  //-----------------------------------------------------------------------------------------------------------
  std.add_types({
    //.........................................................................................................
    quantity_u: {
      base: std.nonempty_text
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  std.add_types({
    //.........................................................................................................
    quantity: {
      // create:   ( cfg ) -> { q: 0, u: 'u', cfg..., }
      fields: {
        q: std.quantity_q,
        u: std.quantity_u
      }
    },
    //.........................................................................................................
    quantity_with_template: {
      // create:   ( cfg ) -> { q: 0, u: 'u', cfg..., }
      fields: {
        q: std.quantity_q,
        u: std.quantity_u
      },
      template: {
        q: 'u'
      }
    }
  });

  //===========================================================================================================
  module.exports = {std, type_of, Type, Typespace, internals};

}).call(this);

//# sourceMappingURL=main.js.map