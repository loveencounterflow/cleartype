
'use strict'

#-----------------------------------------------------------------------------------------------------------
primitive_types = Object.freeze [ 'null', 'undefined', 'infinity', 'boolean', 'nan', 'float', 'anyfloat', 'text', ]
ct_kinds        = Object.freeze [ '$unspecified', '$enumeration', '$record', '$variant', ]
pod_prototypes  = Object.freeze [ null, ( Object.getPrototypeOf {} ), ]


#===========================================================================================================
gnd =
  anything:       isa: ( x ) -> true
  primitive:      isa: ( x ) -> primitive_types.includes type_of x
  #.........................................................................................................
  ### NOTE types 'simple' and 'compound' more or less boil down to x being a POD, their explicit definition
  are for clarity and to allow for later modification ###
  simple:         isa: ( x ) -> ( not x? ) or ( not gnd.compound.isa x )
  compound:       isa: ( x ) -> gnd.pod.isa x
  #.........................................................................................................
  boolean:        isa: ( x ) -> ( x is true ) or ( x is false )
  function:       isa: ( x ) -> ( Object::toString.call x ) is '[object Function]'
  asyncfunction:  isa: ( x ) -> ( Object::toString.call x ) is '[object AsyncFunction]'
  symbol:         isa: ( x ) -> ( typeof x ) is 'symbol'
  object:         isa: ( x ) -> x? and ( typeof x is 'object' ) and ( ( Object::toString.call x ) is '[object Object]' )
  # pod:            isa: ( x ) -> x? and x.constructor in [ Object, undefined, ]
  pod:            isa: ( x ) -> x? and ( Object.getPrototypeOf x ) in pod_prototypes
  float:          isa: ( x ) -> Number.isFinite x
  integer:        isa: ( x ) -> Number.isInteger x
  text:           isa: ( x ) -> ( typeof x ) is 'string'
  nonempty_text:  isa: ( x ) -> ( typeof x ) is 'string' and ( x.length > 0 )
  set:            isa: ( x ) -> x instanceof Set
  map:            isa: ( x ) -> x instanceof Map
  list:           isa: ( x ) -> Array.isArray x
  nonempty_list:  isa: ( x ) -> ( Array.isArray x ) and ( x.length > 0 )
  #.........................................................................................................
  nullary:        isa: ( x ) -> x? and ( ( x.length is 0 ) or ( x.size is 0 ) )
  unary:          isa: ( x ) -> x? and ( ( x.length is 1 ) or ( x.size is 1 ) )
  binary:         isa: ( x ) -> x? and ( ( x.length is 2 ) or ( x.size is 2 ) )
  trinary:        isa: ( x ) -> x? and ( ( x.length is 3 ) or ( x.size is 3 ) )


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


#===========================================================================================================
module.exports = { gnd, type_of, primitive_types, ct_kinds, }
