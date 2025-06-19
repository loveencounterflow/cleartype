
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
class Cleartype_error extends Error
class Cleartype_validation_error extends Cleartype_error
class Cleartype_creation_error extends Cleartype_error


#===========================================================================================================
validate = ( type, x ) ->
  return x if type.isa x
  throw new Cleartype_validation_error "Ω___1 expected a #{type.name}, got a #{type_of x}"

#===========================================================================================================
class Type

  #---------------------------------------------------------------------------------------------------------
  constructor: ( dcl = null ) ->
    throw new Error "Ω___2 not allowed" if dcl?
    bind_instance_methods @
    @name = @constructor.name.toLowerCase()
    return undefined

  #---------------------------------------------------------------------------------------------------------
  create: ( typename, dcl ) ->
    ### TAINT should wrap b/c of names? ###
    return dcl if dcl instanceof @constructor
    #.......................................................................................................
    { has_fields, fields,             } =    @_fields_from_dcl  dcl
    { is_extension, base, baseclass,  } = @_extension_from_dcl  dcl
    isa                                 =       @_isa_from_dcl  dcl, { has_fields, is_extension, typename, }
    #.......................................................................................................
    debug 'Ω___3', 'create', typename, base, baseclass
    if dcl.create?
      debug 'Ω___4', 'create', typename
      debug 'Ω___5', dcl.create.toString() if typename is 'text'
      validate gnd.function, dcl.create
      create = do ( create = dcl.create       ) -> ( P... ) -> @validate create.call @, P...
    ### TAINT this must be properly resolved (with inheritance?) ###
    else if is_extension
      debug 'Ω___6', base.create.toString() if typename is 'nonempty_text'
      create = do ( create = base.create     ) -> ( P... ) -> @validate create.call base, P...
    else
      debug 'Ω___7', 'create', typename
      create = -> throw new Cleartype_creation_error "Ω___8 unable to create a #{typename}"
    ### TAINT provide create when there are fields but no create() ###
    create = nameit ( @_method_name_from_typename 'create', typename ), create
    #.......................................................................................................
    clasz = class extends baseclass
      name:         typename
      # refines:      dcl.refines
      isa:          isa
      create:       create
      fields:       fields
      has_fields:   has_fields
      is_extension: is_extension
    nameit ( @_classname_from_typename typename ), clasz
    return new clasz()

  #---------------------------------------------------------------------------------------------------------
  _fields_from_dcl: ( dcl ) ->
    has_fields  = false
    fields      = Object.create null
    if dcl.fields?
      for sub_typename, sub_type of dcl.fields
        has_fields              = true
        fields[ sub_typename ]  = sub_type
    return { has_fields, fields, }

  #---------------------------------------------------------------------------------------------------------
  _extension_from_dcl: ( dcl ) ->
    is_extension  = false
    baseclass     = @constructor
    base    = null
    ### TAINT condition should use API like 'has_property_but_value_isnt_null()' (?name?) ###
    if ( Reflect.has dcl, 'refines' ) and ( dcl.refines isnt null )
      unless ( dcl.refines instanceof @constructor )
        ### TAINT use `type_of()` ###
        throw new Error "Ω___9 dcl.refines must be instanceof #{rpr @}, got #{rpr dcl.refines}"
      is_extension  = true
      base    = dcl.refines
      baseclass     = dcl.refines.constructor
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
          throw new Error "Ω__10 type declaration must have one of 'fields', 'isa' or 'refines' properties, got none"
        isa = ( x ) -> true
    #.......................................................................................................
    if is_extension
      isa = do ( base = dcl.refines, isa ) -> ( x ) -> ( base.isa x ) and ( isa.call @, x )
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
      warn 'Ω__11', rejection
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
    debug 'Ω__12', @
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
    isa:      ( x ) -> ( Object::toString.call x ) is '[object String]'
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
    refines:  std.text
    # isa:      ( x ) -> ( std.text.isa x ) and ( x.length isnt 0 )
    isa:      ( x ) -> x.length isnt 0
  #.........................................................................................................
  quantity_q:
    refines:  std.float
    # isa: std.float.isa
#-----------------------------------------------------------------------------------------------------------
std.add_types
  #.........................................................................................................
  quantity_u:
    refines:  std.nonempty_text
#-----------------------------------------------------------------------------------------------------------
std.add_types
  #.........................................................................................................
  quantity:
    create:   ( cfg ) -> { q: 0, u: 'u', cfg..., }
    fields:
      q:      std.quantity_q
      u:      std.quantity_u


#===========================================================================================================
module.exports = { std, type_of, Type, Typespace, }

