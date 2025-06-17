
'use strict'

#===========================================================================================================
{ # std
  type_of               } = require './builtins'
#-----------------------------------------------------------------------------------------------------------
{ hide
  # get_instance_methods
  # bind_instance_methods
  nameit
  debug
  warn
  help
  rpr                   } = require './helpers'


#===========================================================================================================
class Cleartype_error extends Error
class Cleartype_validation_error extends Cleartype_error


#===========================================================================================================
class Type

  #---------------------------------------------------------------------------------------------------------
  constructor: ( dcl = null ) ->
    throw new Error "Ω___1 not allowed" if dcl?
    # H.bind_instance_methods @
    return undefined

  #---------------------------------------------------------------------------------------------------------
  create: ( typename, dcl ) -> @constructor.from_declaration dcl

  #---------------------------------------------------------------------------------------------------------
  @from_declaration: ( typename, dcl ) ->
    ### TAINT should wrap b/c of names? ###
    return dcl if dcl instanceof @
    #.......................................................................................................
    { has_fields,   fields,     } =    @_fields_from_dcl  dcl ? null
    { is_extension, extension,  } = @_extension_from_dcl  dcl ? null
    #.......................................................................................................
    if dcl.isa?
      switch true
        when dcl.isa instanceof @
          per_se_isa = do ( isa = dcl.isa.isa ) -> ( x ) -> isa x
        when ( Object::toString.call dcl.isa ) is '[object Function]'
          per_se_isa = dcl.isa
        else throw new Error 'Ω___3'
    #.......................................................................................................
    ### TAINT decomplect logic ###
    else
      if has_fields
        per_se_isa = ( x ) ->
          return false unless x?
          return false unless x.constructor in [ Object, undefined, ] ### stad.pod.isa x ###
          for field_name, subtype of dcl.fields
            continue if subtype.isa x[ field_name ]
            ### TAINT use type_of ###
            rejection = "expected a #{subtype.name} for field #{rpr field_name}, got #{rpr x[ field_name ]}"
            warn 'Ω___4', rejection
            return false
          return true
      else
        unless is_extension
          throw new Error "Ω___1 type declaration must have one of 'fields', 'isa' or 'refines' properties, got none"
        per_se_isa = ( x ) -> true
    #.......................................................................................................
    if is_extension
      ### TAINT review use of dcl.refines here ###
      debug 'Ωcltt___5', typename, dcl.refines, dcl.refines.isa
      isa = ( x ) -> ( dcl.refines.isa x ) and ( per_se_isa x )
    else
      isa = per_se_isa
    #.......................................................................................................
    create = dcl.create ? ( x ) -> x
    # if dcl.create?
    #   create = ( x ) -> dcl.create x
    # else
    #   ### TAINT check whether there are fields ###
    #   fields = {}
    #   for field_name, dsc of Object.getOwnPropertyDescriptors dcl
    #.......................................................................................................
    clasz = class extends extension
      name:         typename
      isa:          nameit ( @isaname_from_typename typename ), isa
      create:       create
      fields:       fields
      has_fields:   has_fields
    nameit ( clasz.classname_from_typename typename ), clasz
    return new clasz()

  #---------------------------------------------------------------------------------------------------------
  @_fields_from_dcl: ( dcl ) ->
    has_fields  = false
    fields      = Object.create null
    if dcl.fields?
      for sub_typename, sub_type of dcl.fields
        has_fields              = true
        fields[ sub_typename ]  = sub_type
    return { has_fields, fields, }

  #---------------------------------------------------------------------------------------------------------
  @_extension_from_dcl: ( dcl ) ->
    is_extension  = false
    extension     = @
    ### TAINT condition should use API like 'has_property_but_value_isnt_null()' (?name?) ###
    if ( Reflect.has dcl, 'refines' ) and ( dcl.refines isnt null )
      unless ( dcl.refines instanceof @ )
        ### TAINT use `type_of()` ###
        throw new Error "Ω___2 dcl.refines must be instanceof #{rpr @}, got #{rpr dcl.refines}"
      is_extension  = true
      extension     = dcl.refines.constructor
    return { is_extension, extension, }

  #---------------------------------------------------------------------------------------------------------
  @classname_from_typename = ( typename = null ) ->
    R = ( typename ? 'anonymous' )
    ### TAINT not Unicode-compliant ###
    return ( R[ 0 ] ).toUpperCase() + R[ 1 .. ]

  #---------------------------------------------------------------------------------------------------------
  @isaname_from_typename = ( typename = null ) ->
    R = ( typename ? 'anonymous' )
    return "isa_#{typename}"

  #---------------------------------------------------------------------------------------------------------
  validate: ( x ) ->
    return x if @isa x
    throw new Error "Ω___6 Cleartype_validation_error"

  #---------------------------------------------------------------------------------------------------------
  isa: ( x ) -> x instanceof @constructor

#===========================================================================================================
class Typespace

  #---------------------------------------------------------------------------------------------------------
  add_types: ( dcls ) ->
    ### TAINT name collisions possible ###
    for typename, dcl of dcls
      if Reflect.has @, typename
        throw new Error "Ω___7 name collision: type / property #{rpr typename} already declared"
      @[ typename ] = Type.from_declaration typename, dcl
    return null

#===========================================================================================================
# type  = new Type()
std   = new Typespace()

#===========================================================================================================
std.add_types
  #.........................................................................................................
  text:
    isa:      ( x ) -> ( Object::toString.call x ) is '[object String]'
    create:   ( x ) -> x?.toString() ? ''
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
    isa:      ( x ) -> ( x.length isnt 0 )
    create:   ( x ) -> x?.toString() ? ''
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
