
'use strict'

#===========================================================================================================
{ gnd
  type_of               } = require './builtins'
#-----------------------------------------------------------------------------------------------------------
{ hide
  # get_instance_methods
  bind_instance_methods
  nameit
  debug
  warn
  help
  rpr                   } = require './helpers'


#===========================================================================================================
internals = new class Internals then constructor: ->
  @gnd  = gnd
  return undefined

#===========================================================================================================
class Cleartype_error                       extends Error
class Cleartype_arguments_not_allowed_error extends Cleartype_error
class Cleartype_type_validation_error       extends Cleartype_error
class Cleartype_kind_mismatch_error         extends Cleartype_error
class Cleartype_nocreate_error              extends Cleartype_error
class Cleartype_notemplate_error            extends Cleartype_error


#===========================================================================================================
validate = ( type, x ) ->
  return x if type.isa x
  throw new Cleartype_type_validation_error "Ω___1 expected a #{type.name}, got a #{type_of x}"

#===========================================================================================================
class Type

  #---------------------------------------------------------------------------------------------------------
  constructor: ->
    throw new Cleartype_arguments_not_allowed_error "Ω___2 arguments not allowed" if arguments.length isnt 0
    bind_instance_methods @
    hide @, 'name', @constructor.name.toLowerCase()
    return undefined

  #---------------------------------------------------------------------------------------------------------
  create: ( typename, dcl ) ->
    ### TAINT should wrap b/c of names? ###
    return dcl if dcl instanceof @constructor
    dcl = { dcl..., name: typename, }
    #.......................................................................................................
    Object.assign dcl, @_compile_base     dcl
    Object.assign dcl, @_compile_fields   dcl
    Object.assign dcl, @_compile_template dcl
    Object.assign dcl, @_compile_isa      dcl
    #.......................................................................................................
    create = -> throw new Cleartype_creation_error "Ω___3 unable to create a #{dcl.name}"
    if dcl.create?
      validate gnd.function, dcl.create
      create = do ( create = dcl.create                       ) -> ( P... ) -> @validate create.call @, P...
    else if dcl.has_base and ( not dcl.has_fields )
      create = do ( create = dcl.base.create, base =dcl.base  ) -> ( P... ) -> @validate create.call base, P...
    ### TAINT provide create when there are fields but no create() ###
    else if dcl.has_fields
      debug 'Ω___4'
    create = nameit ( @_method_name_from_typename 'create', dcl.name ), create
    #.......................................................................................................
    ### TAINT should we differentiate instance properties from prototype methods? ###
    clasz = class extends dcl.baseclass
      #.....................................................................................................
      constructor: ( P... ) ->
        super P...
        hide @, 'name',         dcl.name
        hide @, 'base',         dcl.base
        hide @, 'fields',       dcl.fields
        hide @, 'template',     dcl.template
        hide @, 'has_fields',   dcl.has_fields
        hide @, 'has_template', dcl.has_template
        hide @, 'has_base',     dcl.has_base
        hide @, 'is_compound',  dcl.is_compound
        hide @, 'is_creatable', dcl.is_creatable
        return undefined
      #.....................................................................................................
      isa:          dcl.isa
      create:       create
    nameit ( @_classname_from_typename dcl.name ), clasz
    return new clasz()

  #---------------------------------------------------------------------------------------------------------
  _compile_base: ( dcl ) ->
    has_base  = false
    baseclass = @constructor
    base      = null
    ### TAINT condition should use API like 'has_property_but_value_isnt_null()' (?name?) ###
    # if ( Reflect.has dcl, 'base' ) and ( dcl.base isnt null )
    if dcl.base?
      unless ( dcl.base instanceof @constructor )
        ### TAINT use `type_of()` ###
        throw new Error "Ω___3 dcl.base must be instanceof #{rpr @}, got #{rpr dcl.base}"
      has_base  = true
      ### NOTE redundant here but needed when we allow typenames for base ###
      base      = dcl.base
      baseclass = dcl.base.constructor
    return { has_base, base, baseclass, }

  #---------------------------------------------------------------------------------------------------------
  _compile_fields: ( dcl ) ->
    has_fields  = false
    fields      = Object.create null
    is_compound = null
    sources     = []
    #.......................................................................................................
    if dcl.has_base
      sources.push dcl.base.fields
      is_compound = dcl.base.is_compound
    #.......................................................................................................
    if dcl.fields?
      validate gnd.compound, dcl.fields
      sources.push dcl.fields
      if dcl.has_base and ( dcl.is_compound isnt true )
        throw new Cleartype_kind_mismatch_error "Ω___4 type #{dcl.name} is declared as a compound type kind but its base #{base.name} isn't"
      is_compound = true
    #.......................................................................................................
    for source in sources
      for sub_name, sub_field of ( source ? {} )
        has_fields          = true
        fields[ sub_name ]  = sub_field
    ### Note at this point is_compound can be any of `null`, `true`, `false` ###
    return { has_fields, fields, is_compound, }

  #---------------------------------------------------------------------------------------------------------
  _compile_template: ( dcl ) ->
    has_template  = false
    template      = Object.create null
    sources       = []
    #.......................................................................................................
    if dcl.has_base and dcl.base.has_template
      sources.push base.template
    # #.......................................................................................................
    # if dcl.template?
    #   validate gnd.compound dcl.fields
    #   sources.push dcl.fields
    #   if has_base and ( is_compound isnt true )
    #     throw new Cleartype_kind_mismatch_error "Ω___6 type #{dcl.name} is declared as a compound type kind but its base #{base.name} isn't"
    #   is_compound = true
    # #.......................................................................................................
    # for source in [ base?.template, dcl.template, ]
    #   for sub_name, sub_template of ( source ? {} )
    #     has_template          = true
    #     producer              = if ( gnd.function.isa sub_template ) then sub_template else \
    #       do ( value = sub_template ) -> -> sub_template
    #     ### TIANT use API call ###
    #     template[ sub_name ]  = nameit "create_#{dcl.name}_#{sub_name}", producer
    # return { has_template, template, is_compound, }
    return { has_template, template, }

  #---------------------------------------------------------------------------------------------------------
  _compile_isa: ( dcl ) ->
    if ( isa = dcl.isa )?
      if isa instanceof @constructor
        isa = do ( other_type = isa ) -> ( x ) -> other_type.isa x
      validate gnd.function, dcl.isa
    #.......................................................................................................
    ### TAINT decomplect logic ###
    else
      if dcl.has_fields
        isa = @_get_isa_for_fields dcl
      else
        unless dcl.has_base
          throw new Error "Ω___7 type declaration must have one of 'fields', 'isa' or 'base' properties, got none"
        isa = ( x ) -> true
    #.......................................................................................................
    if dcl.has_base
      isa = do ( base = dcl.base, isa ) -> ( x ) -> ( base.isa x ) and ( isa.call @, x )
    #.......................................................................................................
    isa = nameit ( @_method_name_from_typename 'isa', dcl.name ), isa
    return { isa, }

  #---------------------------------------------------------------------------------------------------------
  _get_isa_for_fields: ( dcl ) -> ( x ) ->
    return false unless x?
    ### TAINT in the future, should allow extending e.g. lists with fields? ###
    return false unless gnd.pod.isa x
    for field_name, subtype of dcl.fields
      continue if subtype.isa x[ field_name ]
      ### TAINT use type_of ###
      rejection = "expected a #{subtype.name} for field #{rpr field_name}, got #{rpr x[ field_name ]}"
      # warn 'Ω__10', rejection
      return false
    return true

  #---------------------------------------------------------------------------------------------------------
  _classname_from_typename: ( typename = null ) ->
    R = ( typename ? 'anonymous' )
    ### TAINT not Unicode-compliant ###
    return ( R[ 0 ] ).toUpperCase() + R[ 1 .. ]

  #---------------------------------------------------------------------------------------------------------
  _method_name_from_typename: ( methodname, typename = null ) ->
    R = ( typename ? '(anonymous)' )
    return "#{methodname}_#{typename}"

  #---------------------------------------------------------------------------------------------------------
  validate: ( x ) ->
    return x if @isa x
    throw new Cleartype_type_validation_error "Ω__11 validation error: expected a #{@name}, got a #{type_of x}"

  #---------------------------------------------------------------------------------------------------------
  isa: nameit 'isa_type', ( x ) -> x instanceof @constructor

#===========================================================================================================
class Typespace

  #---------------------------------------------------------------------------------------------------------
  add_types: ( dcls ) ->
    ### TAINT name collisions possible ###
    for typename, dcl of dcls
      if Reflect.has @, typename
        throw new Error "Ω__12 name collision: type / property #{rpr typename} already declared"
      @[ typename ] = type.create typename, dcl
    return null

#===========================================================================================================
type      = new Type()
std       = new Typespace()

#===========================================================================================================
std.add_types
  #.........................................................................................................
  text:
    isa:      ( x ) -> ( typeof x ) is 'string' # ( Object::toString.call x ) is '[object String]'
    ### NOTE just returning argument which will be validated; only strings pass so `create value` is a no-op / validation only ###
    create:   ( x ) -> return if ( arguments.length is 0 ) then '' else x
  #.........................................................................................................
  float:
    isa:      ( x ) -> Number.isFinite x
    create:   ( n = 0 ) -> if x? then ( parseFloat x ) else 0
  #.........................................................................................................
  integer:
    isa:      ( x ) -> Number.isInteger x
    create:   ( n = 0 ) -> if x? then ( parseInt n, 10 ) else 0
    template: 0
  #.........................................................................................................
  list:
    isa:      ( x ) -> Array.isArray x
    # create:   ( n = 0 ) -> if x? then ( parseInt n, 10 ) else 0
    template: -> []
#-----------------------------------------------------------------------------------------------------------
std.add_types
  ###
  nonempty_text:
    isa:      std.text
    refine:   ( x ) -> ( x.length isnt 0 )
    create:   ( x ) -> x?.toString() ? ''
  ###
  #.........................................................................................................
  nonempty_text:
    base:  std.text
    # isa:      ( x ) -> ( std.text.isa x ) and ( x.length isnt 0 )
    isa:      ( x ) -> x.length isnt 0
  #.........................................................................................................
  quantity_q:
    base:  std.float
    # isa: std.float.isa
#-----------------------------------------------------------------------------------------------------------
std.add_types
  #.........................................................................................................
  quantity_u:
    base:  std.nonempty_text
#-----------------------------------------------------------------------------------------------------------
std.add_types
  #.........................................................................................................
  quantity:
    # create:   ( cfg ) -> { q: 0, u: 'u', cfg..., }
    fields:
      q:      std.quantity_q
      u:      std.quantity_u
  #.........................................................................................................
  quantity_with_template:
    # create:   ( cfg ) -> { q: 0, u: 'u', cfg..., }
    fields:
      q:      std.quantity_q
      u:      std.quantity_u
    template:
      q:      'u'

#===========================================================================================================
module.exports = { std, type_of, Type, Typespace, internals, }

