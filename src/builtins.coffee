
'use strict'

#-----------------------------------------------------------------------------------------------------------
# primitive_types = Object.freeze [ 'null', 'undefined', 'infinity', 'boolean', 'nan', 'float', 'anyfloat', 'text', ]
# ct_kinds        = Object.freeze [ '$unspecified', '$enumeration', '$record', '$variant', ]
pod_prototypes  = Object.freeze [ null, ( Object.getPrototypeOf {} ), ]


#===========================================================================================================
gnd =
  anything:       isa:  ( x ) -> true
  primitive:      isa:  ( x ) -> primitive_types.includes type_of x
  #.........................................................................................................
  ### NOTE types 'simple' and 'compound' more or less boil down to x being a POD, their explicit definition
  are for clarity and to allow for later modification ###
  simple:         isa:  ( x ) -> ( not x? ) or ( not gnd.compound.isa x )
  compound:       isa:  ( x ) -> gnd.pod.isa x
  #.........................................................................................................
  boolean:        isa:  ( x ) -> ( x is true ) or ( x is false )
  function:       isa:  ( x ) -> ( Object::toString.call x ) is '[object Function]'
  asyncfunction:  isa:  ( x ) -> ( Object::toString.call x ) is '[object AsyncFunction]'
  symbol:         isa:  ( x ) -> ( typeof x ) is 'symbol'
  object:         isa:  ( x ) -> x? and ( typeof x is 'object' ) and ( ( Object::toString.call x ) is '[object Object]' )
  float:          isa:  ( x ) -> Number.isFinite x
  integer:        isa:  ( x ) -> Number.isInteger x
  text:           isa:  ( x ) -> ( typeof x ) is 'string'
  nonempty_text:  isa:  ( x ) -> ( typeof x ) is 'string' and ( x.length > 0 )
  set:            isa:  ( x ) -> x instanceof Set
  map:            isa:  ( x ) -> x instanceof Map
  list:           isa:  ( x ) -> Array.isArray x
  nonempty_list:  isa:  ( x ) -> ( Array.isArray x ) and ( x.length > 0 )
  kind:           isa:  ( x ) -> x in [ 'simple', 'compound', ]
  #.........................................................................................................
  # nullary:        isa:  ( x ) -> x? and ( ( x.length is 0 ) or ( x.size is 0 ) )
  # unary:          isa:  ( x ) -> x? and ( ( x.length is 1 ) or ( x.size is 1 ) )
  # binary:         isa:  ( x ) -> x? and ( ( x.length is 2 ) or ( x.size is 2 ) )
  # trinary:        isa:  ( x ) -> x? and ( ( x.length is 3 ) or ( x.size is 3 ) )
  #.........................................................................................................
  # pod:            isa:  ( x ) -> x? and x.constructor in [ Object, undefined, ]
  pod:
    isa:                ( x ) -> x? and ( Object.getPrototypeOf x ) in pod_prototypes
    get_template:             -> Object.create null
  nullo:          isa:  ( x ) -> ( Object.getPrototypeOf x ) is null
  type:           isa:  ( x ) -> x instanceof ( require './main' ).Type
  dcl_field:      isa:  ( x ) -> gnd.type.isa x
  #.........................................................................................................
  dcl:
    isa: ( x ) ->
      return false unless gnd.compound.isa      x
      return false unless gnd.nonempty_text.isa x.name
      return false unless gnd.kind.isa          x.kind
      return false unless gnd.type.isa          x.base
      return false unless gnd.nullo.isa         x.fields
      return false unless gnd.nullo.isa         x.template
      return false unless gnd.boolean.isa       x.has_fields
      return false unless gnd.boolean.isa       x.has_template
      return false unless gnd.boolean.isa       x.has_base
      return false unless gnd.boolean.isa       x.is_creatable
      return true
    get_template: ->
      name:           null
      base:           null
      fields:         null
      template:       null
      has_fields:     null
      has_template:   null
      has_base:       null
      kind:           null
      is_creatable:   null

#-----------------------------------------------------------------------------------------------------------
kind_of = ( x ) -> if ( gnd.compound.isa x ) then 'compound' else 'simple'

#-----------------------------------------------------------------------------------------------------------
type_of = ( x ) ->
  #.........................................................................................................
  ### Primitives: ###
  return 'null'         if x is null
  return 'undefined'    if x is undefined
  return 'infinity'     if ( x is +Infinity ) or ( x is -Infinity )
  return 'boolean'      if ( x is true ) or ( x is false )
  return 'nan'          if Number.isNaN     x
  return 'float'        if Number.isFinite  x
  # return 'pod'          if B.isa.pod x
  #.........................................................................................................
  switch jstypeof = typeof x
    when 'string'                       then return 'text'
  #.........................................................................................................
  return 'list'         if Array.isArray  x
  ### TAINT consider to return x.constructor.name ###
  switch millertype = ( ( Object::toString.call x ).replace /^\[object ([^\]]+)\]$/, '$1' ).toLowerCase()
    when 'regexp'                       then return 'regex'
  return millertype
  # switch millertype = Object::toString.call x
  #   when '[object Function]'            then return 'function'
  #   when '[object AsyncFunction]'       then return 'asyncfunction'
  #   when '[object GeneratorFunction]'   then return 'generatorfunction'

#-----------------------------------------------------------------------------------------------------------
validate = ( type, x ) ->
  return x if type.isa x
  throw new Cleartype_type_validation_error "Ω___1 expected a #{type.name}, got a #{type_of x}"


#===========================================================================================================
module.exports = { gnd, kind_of, type_of, validate, }
