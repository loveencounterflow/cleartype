(function() {
  'use strict';
  var E, Internals, Type, Typespace, bind_instance_methods, debug, gnd, help, hide, internals, kind_of, nameit, rpr, type, type_of, validate, warn;

  //===========================================================================================================
  ({gnd, kind_of, validate, type_of} = require('./builtins'));

  //-----------------------------------------------------------------------------------------------------------
  // get_instance_methods
  ({hide, bind_instance_methods, nameit, debug, warn, help, rpr} = require('./helpers'));

  E = require('./errors');

  //===========================================================================================================
  internals = new (Internals = class Internals {
    constructor() {
      this.gnd = gnd;
      return void 0;
    }

  })();

  Type = (function() {
    //===========================================================================================================
    class Type {
      //---------------------------------------------------------------------------------------------------------
      constructor() {
        if (arguments.length !== 0) {
          throw new E.Cleartype_arguments_not_allowed_error("Ωct___1 arguments not allowed");
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
          ...gnd.dcl.get_template(),
          ...dcl,
          name: typename
        };
        //.......................................................................................................
        Object.assign(dcl, this._compile_base(dcl));
        Object.assign(dcl, this._compile_kind(dcl));
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
              hide(this, 'kind', dcl.kind);
              hide(this, 'base', dcl.base);
              hide(this, 'fields', dcl.fields);
              hide(this, 'template', dcl.template);
              hide(this, 'has_fields', dcl.has_fields);
              hide(this, 'has_template', dcl.has_template);
              hide(this, 'has_base', dcl.has_base);
              hide(this, 'is_creatable', dcl.is_creatable);
              return void 0;
            }

          };

          //.....................................................................................................
          _Class.prototype.isa = dcl.isa;

          _Class.prototype.create = dcl.create;

          _Class.prototype.get_template = dcl.get_template;

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
            throw new Error(`Ωct___2 dcl.base must be instanceof ${rpr(this)}, got ${rpr(dcl.base)}`);
          }
          has_base = true;
          base = dcl.base;
          baseclass = dcl.base.constructor;
        }
        return {has_base, base, baseclass};
      }

      //---------------------------------------------------------------------------------------------------------
      _compile_kind(dcl) {
        var hint, hint_reason, hints, kind, kind_reason;
        kind = null;
        kind_reason = null;
        //.......................................................................................................
        hints = {
          acc_to_kind: dcl.kind != null ? dcl.kind : null,
          acc_to_fields: dcl.fields != null ? 'compound' : 'simple',
          acc_to_template: dcl.template != null ? kind_of(dcl.template) : null,
          acc_to_base_kind: dcl.base != null ? dcl.base.kind : null
        };
//.......................................................................................................
        for (hint_reason in hints) {
          hint = hints[hint_reason];
          if (hint == null) {
            continue;
          }
          if (kind == null) {
            kind = hint;
            kind_reason = hint_reason;
            continue;
          }
          if (hint === kind) {
            continue;
          }
          kind_reason = kind_reason.replace(/acc_to_/g, '');
          kind_reason = kind_reason.replace(/_/g, '.');
          hint_reason = hint_reason.replace(/acc_to_/g, '');
          hint_reason = hint_reason.replace(/_/g, '.');
          throw new E.Cleartype_kind_mismatch_error(`Ωct___3 according to ${dcl.name}.${kind_reason}, ` + `the kind of ${dcl.name} is ${rpr(kind)}, but according to ${dcl.name}.${hint_reason}, ` + `the kind of ${dcl.name} is ${rpr(hint)}`);
        }
        //.......................................................................................................
        return {kind};
      }

      //---------------------------------------------------------------------------------------------------------
      _compile_fields(dcl) {
        var fields, has_fields, i, len, ref, source, sources, sub_field, sub_name;
        has_fields = false;
        fields = Object.create(null);
        sources = [];
        //.......................................................................................................
        if (dcl.has_base && dcl.base.has_fields) {
          sources.push(dcl.base.fields);
        }
        //.......................................................................................................
        if (dcl.fields != null) {
          validate(gnd.compound, dcl.fields);
          sources.push(dcl.fields);
        }
//.......................................................................................................
        for (i = 0, len = sources.length; i < len; i++) {
          source = sources[i];
          ref = source != null ? source : {};
          for (sub_name in ref) {
            sub_field = ref[sub_name];
            validate(gnd.dcl_field, sub_field);
            has_fields = true;
            fields[sub_name] = sub_field;
          }
        }
        return {has_fields, fields};
      }

      //---------------------------------------------------------------------------------------------------------
      _compile_template(dcl) {
        var base_has_template, dcl_has_template, field_name, get_template, has_template, ref, template, value;
        dcl_has_template = Reflect.has(dcl, 'template');
        base_has_template = dcl.has_base && dcl.base.has_template;
        has_template = dcl_has_template || base_has_template;
        template = null;
        get_template = function() {
          throw new E.Cleartype_notemplate_error(`Ωct___4 type ${dcl.name} doesn't have a template`);
        };
        //.......................................................................................................
        switch (dcl.kind) {
          //.....................................................................................................
          case 'simple':
            if (dcl_has_template) {
              if (gnd.function.isa(dcl.template)) {
                template = dcl.template;
                get_template = function() {
                  return template.call(this);
                };
              //.......................................................................................................
              } else if (gnd.simple.isa(dcl.template)) {
                template = dcl.template;
                get_template = function() {
                  return template;
                };
              }
            } else if (base_has_template) {
              get_template = (function() {
                return function(base = dcl.base) {
                  return base.get_template();
                };
              })();
            }
            break;
          //.....................................................................................................
          case 'compound':
            template = Object.create(null);
            if (base_has_template) {
              Object.assign(template, ...base.get_template());
            }
            if (dcl_has_template) {
              /* TAINT this should be done in pre-checks */
              validate(gnd.pod, dcl.template);
              ref = dcl.template;
              for (field_name in ref) {
                value = ref[field_name];
                template[field_name] = value;
              }
            }
            null;
            break;
          default:
            //.....................................................................................................
            throw new E.Cleartype_internal_error(`Ωct___5 should never happen: encountered dcl.kind: ${rpr(dcl.kind)}`);
        }
        //.......................................................................................................
        // else if dcl.has_base and dcl.base.has_template
        //   # debug 'Ωct___8', dcl.name, "_compile_template"
        //   sources.push dcl.base.template
        // #.......................................................................................................
        // if dcl.template?
        //   validate gnd.compound dcl.fields
        //   sources.push dcl.fields
        //   if has_base and ( kind isnt true )
        //     throw new E.Cleartype_kind_mismatch_error "Ωct___9 type #{dcl.name} is declared as a compound type kind but its base #{base.name} isn't"
        //   kind = true
        // #.......................................................................................................
        // for source in [ base?.template, dcl.template, ]
        //   for sub_name, sub_template of ( source ? {} )
        //     has_template          = true
        //     producer              = if ( gnd.function.isa sub_template ) then sub_template else \
        //       do ( value = sub_template ) -> -> sub_template
        //     ### TIANT use API call ###
        //     template[ sub_name ]  = nameit "create_#{dcl.name}_#{sub_name}", producer
        // return { has_template, template, kind, }
        get_template = nameit(this._method_name_from_typename('get_template_for', dcl.name), get_template);
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
              throw new Error("Ωct__10 type declaration must have one of 'fields', 'isa' or 'base' properties, got none");
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
          throw new E.Cleartype_nocreate_error(`Ωct__11 unable to create a ${dcl.name}`);
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
          debug('Ωct__12');
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
            // warn 'Ωct__13', rejection
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
        throw new E.Cleartype_type_validation_error(`Ωct__14 validation error: expected a ${this.name}, got a ${type_of(x)}`);
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
          throw new Error(`Ωct__15 name collision: type / property ${rpr(typename)} already declared`);
        }
        this[typename] = type.create(typename, dcl);
      }
      return null;
    }

  };

  //===========================================================================================================
  type = new Type();

  //===========================================================================================================
  module.exports = {type_of, Type, Typespace, internals};

}).call(this);

//# sourceMappingURL=main.js.map