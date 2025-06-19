
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
class Cleartype_error extends Error
class Cleartype_arguments_not_allowed_error extends Cleartype_error
class Cleartype_validation_error extends Cleartype_error
class Cleartype_creation_error extends Cleartype_error


#===========================================================================================================
validate = ( type, x ) ->
  return x if type.isa x
  throw new Cleartype_validation_error "Ω___1 expected a #{type.name}, got a #{type_of x}"

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
    #.......................................................................................................
    { is_extension, base, baseclass,  } = @_extension_from_dcl  dcl
    { has_fields, fields,             } =    @_compile_fields { typename, dcl, base, }
    { has_template, template,         } =  @_compile_template { typename, dcl, base, fields, }
    isa                                 =       @_isa_from_dcl  dcl, { has_fields, is_extension, typename, }
    #.......................................................................................................
    create = -> throw new Cleartype_creation_error "Ω___8 unable to create a #{typename}"
    if dcl.create?
      validate gnd.function, dcl.create
      create = do ( create = dcl.create       ) -> ( P... ) -> @validate create.call @, P...
    else if is_extension and ( not has_fields )
      create = do ( create = base.create     ) -> ( P... ) -> @validate create.call base, P...
    ### TAINT provide create when there are fields but no create() ###
    else if has_fields
      debug 'Ω__10'
    create = nameit ( @_method_name_from_typename 'create', typename ), create
    #.......................................................................................................
    ### TAINT should we differentiate instance properties from prototype methods? ###
    clasz = class extends baseclass
      #.....................................................................................................
      constructor: ( P... ) ->
        super P...
        hide @, 'name',         typename
        hide @, 'base',         dcl.base
        hide @, 'fields',       fields
        hide @, 'template',     template
        hide @, 'has_fields',   has_fields
        hide @, 'has_template', has_template
        hide @, 'is_extension', is_extension
        return undefined
      #.....................................................................................................
      isa:          isa
      create:       create
    nameit ( @_classname_from_typename typename ), clasz
    return new clasz()

  #---------------------------------------------------------------------------------------------------------
  _compile_fields: ({ typename, dcl, base, }) ->
    has_fields  = false
    fields      = Object.create null
    ### TAINT missing validate gnd.pod, fields ###
    for source in [ base?.fields, dcl.fields, ]
      for sub_name, sub_field of ( source ? {} )
        has_fields          = true
        fields[ sub_name ]  = sub_field
    return { has_fields, fields, }

  #---------------------------------------------------------------------------------------------------------
  _compile_template: ({ typename, dcl, base, fields, }) ->
    has_template  = false
    template      = Object.create null
    ### TAINT missing validate gnd.pod, template ###
    for source in [ base?.template, dcl.template, ]
      for sub_name, sub_template of ( source ? {} )
        has_template          = true
        producer              = if ( gnd.function.isa sub_template ) then sub_template else \
          do ( value = sub_template ) -> -> sub_template
        ### TIANT use API call ###
        template[ sub_name ]  = nameit "create_#{typename}_#{sub_name}", producer
    return { has_template, template, }

  #---------------------------------------------------------------------------------------------------------
  _extension_from_dcl: ( dcl ) ->
    is_extension  = false
    baseclass     = @constructor
    base    = null
    ### TAINT condition should use API like 'has_property_but_value_isnt_null()' (?name?) ###
    if ( Reflect.has dcl, 'base' ) and ( dcl.base isnt null )
      unless ( dcl.base instanceof @constructor )
        ### TAINT use `type_of()` ###
        throw new Error "Ω___9 dcl.base must be instanceof #{rpr @}, got #{rpr dcl.base}"
      is_extension  = true
      base    = dcl.base
      baseclass     = dcl.base.constructor
    return { is_extension, base, baseclass, }

  #---------------------------------------------------------------------------------------------------------
  _isa_from_dcl: ( dcl, { has_fields, is_extension, typename, } ) ->
    if ( isa = dcl.isa )?
      if isa instanceof @constructor
        isa = do ( other_type = isa ) -> ( x ) -> other_type.isa x
      validate gnd.function, dcl.isa
    #.......................................................................................................
    ### TAINT decomplect logic ###
    else
      if has_fields
        isa = @_get_isa_for_fields dcl
      else
        unless is_extension
          throw new Error "Ω__10 type declaration must have one of 'fields', 'isa' or 'base' properties, got none"
        isa = ( x ) -> true
    #.......................................................................................................
    if is_extension
      isa = do ( base = dcl.base, isa ) -> ( x ) -> ( base.isa x ) and ( isa.call @, x )
    #.......................................................................................................
    return nameit ( @_method_name_from_typename 'isa', typename ), isa

  #---------------------------------------------------------------------------------------------------------
  _get_isa_for_fields: ( dcl ) -> ( x ) ->
    return false unless x?
    ### TAINT in the future, should allow extending e.g. lists with fields? ###
    return false unless gnd.pod.isa x
    for field_name, subtype of dcl.fields
      continue if subtype.isa x[ field_name ]
      ### TAINT use type_of ###
      rejection = "expected a #{subtype.name} for field #{rpr field_name}, got #{rpr x[ field_name ]}"
      # warn 'Ω__11', rejection
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
    throw new Cleartype_validation_error "Ω__13 validation error: expected a #{@name}, got a #{type_of x}"

  #---------------------------------------------------------------------------------------------------------
  isa: nameit 'isa_type', ( x ) -> x instanceof @constructor

#===========================================================================================================
class Typespace

  #---------------------------------------------------------------------------------------------------------
  add_types: ( dcls ) ->
    ### TAINT name collisions possible ###
    for typename, dcl of dcls
      if Reflect.has @, typename
        throw new Error "Ω__14 name collision: type / property #{rpr typename} already declared"
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

