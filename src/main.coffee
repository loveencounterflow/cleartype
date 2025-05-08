
'use strict'

{ debug
  help    }               = console
rpr                       = ( x ) -> ( require 'loupe' ).inspect x


###

# from `ltsort` which uses an outdated version of `intertype`:

get_base_types = ->
  return base_types if base_types?
  #.........................................................................................................
  base_types                = new Cleartype()
  { declare }               = base_types
  #.........................................................................................................
  declare.lt_nodelist 'list.of.nonempty.text'
  #.........................................................................................................
  declare.lt_constructor_cfg
    fields:
      loners:     'boolean'
    default:
      loners:     true
  #.........................................................................................................
  declare.lt_add_cfg
    fields:
      name:       'nonempty.text'
      precedes:   'lt_nodelist'
      needs:      'lt_nodelist'
    default:
      name:       null
      precedes:     null
      needs:      null
    create: ( x ) ->
      R           = x ? {}
      return R unless @isa.object R
      R.needs      ?= []
      R.precedes   ?= []
      R.needs       = [ R.needs,    ] unless @isa.list R.needs
      R.precedes    = [ R.precedes, ] unless @isa.list R.precedes
      return R
  #.........................................................................................................
  declare.lt_linearize_cfg
    fields:
      groups:     'boolean'
    default:
      groups:     false
  #.........................................................................................................
  return base_types

###

#===========================================================================================================
class Cleartype_error extends Error
class Cleartype_validation_error extends Cleartype_error


#===========================================================================================================
class Cleartype

  #---------------------------------------------------------------------------------------------------------
  constructor: ->
    @_contexts = if false then new WeakMap() else new Map ### TAINT this is going to be configurable for testing ###
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _get_ctx: ( type ) ->
    return ( R = @_contexts.get type ) if R?
    @_contexts.set type, R = Object.freeze { me: type, types: @, }
    return R

  #---------------------------------------------------------------------------------------------------------
  isa: ( type, x ) ->
    return type.$isa.call ( @_get_ctx type ), x

  #---------------------------------------------------------------------------------------------------------
  isa_optional: ( type, x ) -> ( not x? ) or ( @isa type, x )

  #---------------------------------------------------------------------------------------------------------
  validate: ( type, x ) ->
    return x if @isa type, x
    throw new Cleartype_validation_error "Ωpmi___1 validation error\n#{rpr type}\n#{rpr x}"

  #---------------------------------------------------------------------------------------------------------
  validate_optional: ( type, x ) ->
    return x if @isa_optional type, x
    throw new Cleartype_validation_error "Ωpmi___2 validation error\n#{rpr type}\n#{rpr x}"

  #---------------------------------------------------------------------------------------------------------
  create: ( type, P... ) ->
    return @validate type, type.$create.call ( @_get_ctx type ), P...

#===========================================================================================================
ct = new Cleartype()


# #===========================================================================================================
# class Type

#   #---------------------------------------------------------------------------------------------------------
#   constructor: ( declaration ) ->
#     @$isa     = declaration.$isa
#     @$create  = declaration.$create
#     return undefined

#   # #---------------------------------------------------------------------------------------------------------
#   # $isa: ->
#   # $create: ->


#===========================================================================================================
TMP_typespace1 =
  anything:
    $isa: ( x ) -> true
    # $create: ( cfg ) ->
  boolean:
    $isa: ( x ) -> ( x is true ) or ( x is false )
    # $create: ( cfg ) ->
  function:
    $isa: ( x ) -> ( Object::toString.call x ) is '[object Function]'
    $create: -> ( -> null )
  asyncfunction:
    $isa: ( x ) -> ( Object::toString.call x ) is '[object AsyncFunction]'
    $create: -> ( -> await null )
  symbol:
    $isa: ( x ) -> ( typeof x ) is 'symbol'
    # $create: ( cfg ) ->
  object:
    $isa: ( x ) -> x? and ( typeof x is 'object' ) and ( ( Object::toString.call x ) is '[object Object]' )
    $create: ( cfg ) -> { cfg..., }
  float:
    $isa: ( x ) -> Number.isFinite x
    $create: -> 0
  text:
    $isa: ( x ) -> ( typeof x ) is 'string'
    $create: -> ''
  nullary:
    $isa: ( x ) -> x? and ( ( x.length is 0 ) or ( x.size is 0 ) )
    # $create: ( cfg ) ->
  unary:
    $isa: ( x ) -> x? and ( ( x.length is 1 ) or ( x.size is 1 ) )
    # $create: ( cfg ) ->
  binary:
    $isa: ( x ) -> x? and ( ( x.length is 2 ) or ( x.size is 2 ) )
    # $create: ( cfg ) ->
  trinary:
    $isa: ( x ) -> x? and ( ( x.length is 3 ) or ( x.size is 3 ) )
    # $create: ( cfg ) ->
  set:
    $isa: ( x ) -> x instanceof Set
    $create: ( cfg ) -> new Set cfg ? []
  map:
    $isa: ( x ) -> x instanceof Map
    $create: ( cfg ) -> new Map cfg ? []
  list:
    $isa: ( x ) -> Array.isArray x
    $create: ( cfg ) -> ( x for x from cfg ? [] )


#===========================================================================================================
module.exports = { Cleartype, ct, TMP_typespace1, }
