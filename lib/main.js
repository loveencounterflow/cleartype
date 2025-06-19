(function() {
  'use strict';
  var Cleartype_arguments_not_allowed_error, Cleartype_error, Cleartype_kind_mismatch_error, Cleartype_nocreate_error, Cleartype_notemplate_error, Cleartype_type_validation_error, Internals, Type, Typespace, bind_instance_methods, debug, gnd, help, hide, internals, nameit, rpr, std, type, type_of, validate, warn;

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

  Cleartype_type_validation_error = class Cleartype_type_validation_error extends Cleartype_error {};

  Cleartype_kind_mismatch_error = class Cleartype_kind_mismatch_error extends Cleartype_error {};

  Cleartype_nocreate_error = class Cleartype_nocreate_error extends Cleartype_error {};

  Cleartype_notemplate_error = class Cleartype_notemplate_error extends Cleartype_error {};

  //===========================================================================================================
  validate = function(type, x) {
    if (type.isa(x)) {
      return x;
    }
    throw new Cleartype_type_validation_error(`Ω___1 expected a ${type.name}, got a ${type_of(x)}`);
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
        var clasz;
        if (dcl instanceof this.constructor) {
          /* TAINT should wrap b/c of names? */
          return dcl;
        }
        dcl = {
          ...dcl,
          name: typename
        };
        //.......................................................................................................
        Object.assign(dcl, this._compile_base(dcl));
        Object.assign(dcl, this._compile_fields(dcl));
        Object.assign(dcl, this._compile_template(dcl));
        Object.assign(dcl, this._compile_isa(dcl));
        Object.assign(dcl, this._compile_create(dcl));
        //.......................................................................................................
        /* TAINT should we differentiate instance properties from prototype methods? */
        clasz = (function() {
          var _Class;

          _Class = class extends dcl.baseclass {
            //.....................................................................................................
            constructor(...P) {
              super(...P);
              hide(this, 'name', dcl.name);
              hide(this, 'base', dcl.base);
              hide(this, 'fields', dcl.fields);
              hide(this, 'template', dcl.template);
              hide(this, 'get_template', dcl.get_template);
              hide(this, 'has_fields', dcl.has_fields);
              hide(this, 'has_template', dcl.has_template);
              hide(this, 'has_base', dcl.has_base);
              hide(this, 'is_compound', dcl.is_compound);
              hide(this, 'is_creatable', dcl.is_creatable);
              return void 0;
            }

          };

          //.....................................................................................................
          _Class.prototype.isa = dcl.isa;

          _Class.prototype.create = dcl.create;

          return _Class;

        }).call(this);
        nameit(this._classname_from_typename(dcl.name), clasz);
        return new clasz();
      }

      //---------------------------------------------------------------------------------------------------------
      _compile_base(dcl) {
        /* NOTE redundant here but needed when we allow typenames for base */
        var base, baseclass, has_base;
        has_base = false;
        baseclass = this.constructor;
        base = null;
        /* TAINT condition should use API like 'has_property_but_value_isnt_null()' (?name?) */
        // if ( Reflect.has dcl, 'base' ) and ( dcl.base isnt null )
        if (dcl.base != null) {
          if (!(dcl.base instanceof this.constructor)) {
            /* TAINT use `type_of()` */
            throw new Error(`Ω___3 dcl.base must be instanceof ${rpr(this)}, got ${rpr(dcl.base)}`);
          }
          has_base = true;
          base = dcl.base;
          baseclass = dcl.base.constructor;
        }
        return {has_base, base, baseclass};
      }

      //---------------------------------------------------------------------------------------------------------
      _compile_fields(dcl) {
        var fields, has_fields, i, is_compound, len, ref, source, sources, sub_field, sub_name;
        has_fields = false;
        fields = Object.create(null);
        is_compound = null;
        sources = [];
        //.......................................................................................................
        if (dcl.has_base) {
          sources.push(dcl.base.fields);
          is_compound = dcl.base.is_compound;
        }
        //.......................................................................................................
        if (dcl.fields != null) {
          validate(gnd.compound, dcl.fields);
          sources.push(dcl.fields);
          if (dcl.has_base && (dcl.is_compound !== true)) {
            throw new Cleartype_kind_mismatch_error(`Ω___4 type ${dcl.name} is declared as a compound type kind but its base ${base.name} isn't`);
          }
          is_compound = true;
        }
//.......................................................................................................
        for (i = 0, len = sources.length; i < len; i++) {
          source = sources[i];
          ref = source != null ? source : {};
          for (sub_name in ref) {
            sub_field = ref[sub_name];
            has_fields = true;
            fields[sub_name] = sub_field;
          }
        }
        /* Note at this point is_compound can be any of `null`, `true`, `false` */
        return {has_fields, fields, is_compound};
      }

      //---------------------------------------------------------------------------------------------------------
      _compile_template(dcl) {
        var get_template, has_template, sources, template;
        has_template = false;
        template = Object.create(null);
        sources = [];
        get_template = function() {
          throw new Cleartype_notemplate_error(`Ω___5 type ${dcl.name} doesn't have a template`);
        };
        //.......................................................................................................
        if (dcl.has_base && dcl.base.has_template) {
          sources.push(base.template);
        }
        // #.......................................................................................................
        // if dcl.template?
        //   validate gnd.compound dcl.fields
        //   sources.push dcl.fields
        //   if has_base and ( is_compound isnt true )
        //     throw new Cleartype_kind_mismatch_error "Ω___6 type #{dcl.name} is declared as a compound type kind but its base #{base.name} isn't"
        //   is_compound = true
        // #.......................................................................................................
        // for source in [ base?.template, dcl.template, ]
        //   for sub_name, sub_template of ( source ? {} )
        //     has_template          = true
        //     producer              = if ( gnd.function.isa sub_template ) then sub_template else \
        //       do ( value = sub_template ) -> -> sub_template
        //     ### TIANT use API call ###
        //     template[ sub_name ]  = nameit "create_#{dcl.name}_#{sub_name}", producer
        // return { has_template, template, is_compound, }
        return {has_template, template, get_template};
      }

      //---------------------------------------------------------------------------------------------------------
      _compile_isa(dcl) {
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
          if (dcl.has_fields) {
            isa = this._get_isa_for_fields(dcl);
          } else {
            if (!dcl.has_base) {
              throw new Error("Ω___7 type declaration must have one of 'fields', 'isa' or 'base' properties, got none");
            }
            isa = function(x) {
              return true;
            };
          }
        }
        //.......................................................................................................
        if (dcl.has_base) {
          isa = (function(base, isa) {
            return function(x) {
              return (base.isa(x)) && (isa.call(this, x));
            };
          })(dcl.base, isa);
        }
        //.......................................................................................................
        isa = nameit(this._method_name_from_typename('isa', dcl.name), isa);
        return {isa};
      }

      //---------------------------------------------------------------------------------------------------------
      _compile_create(dcl) {
        var create;
        create = function() {
          throw new Cleartype_nocreate_error(`Ω___8 unable to create a ${dcl.name}`);
        };
        if (dcl.create != null) {
          validate(gnd.function, dcl.create);
          create = (function(create) {
            return function(...P) {
              return this.validate(create.call(this, ...P));
            };
          })(dcl.create);
        } else if (dcl.has_base && (!dcl.has_fields)) {
          create = (function(create, base) {
            return function(...P) {
              return this.validate(create.call(base, ...P));
            };
          })(dcl.base.create, dcl.base);
        /* TAINT provide create when there are fields but no create() */
        } else if (dcl.has_fields) {
          debug('Ω___9');
        }
        create = nameit(this._method_name_from_typename('create', dcl.name), create);
        return {create};
      }

      //=========================================================================================================
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
            // warn 'Ω__10', rejection
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
        throw new Cleartype_type_validation_error(`Ω__11 validation error: expected a ${this.name}, got a ${type_of(x)}`);
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
          throw new Error(`Ω__12 name collision: type / property ${rpr(typename)} already declared`);
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
    },
    //.........................................................................................................
    list: {
      isa: function(x) {
        return Array.isArray(x);
      },
      // create:   ( n = 0 ) -> if x? then ( parseInt n, 10 ) else 0
      template: function() {
        return [];
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