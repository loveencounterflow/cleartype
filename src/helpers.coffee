
'use strict'

# #===========================================================================================================
# @bind_proto = ( that, f ) -> that::[ f.name ] = f.bind that::

#===========================================================================================================
hide = ( object, name, value ) => Object.defineProperty object, name,
    enumerable:   false
    writable:     true
    configurable: true
    value:        value

#===========================================================================================================
get_instance_methods = ( instance ) ->
  isa_function  = ( require './builtins' ).std.function.$isa
  R             = {}
  for key, { value: method, } of Object.getOwnPropertyDescriptors instance
    continue if key is 'constructor'
    continue unless isa_function method
    R[ key ] = method
  return R

#===========================================================================================================
bind_instance_methods = ( instance ) ->
  for key, method of get_instance_methods Object.getPrototypeOf instance
    hide instance, key, method.bind instance
  return null

#===========================================================================================================
debug   = console.debug
help    = console.help
rpr     = ( x ) -> ( require 'loupe' ).inspect x

#===========================================================================================================
module.exports = {
  hide
  get_instance_methods
  bind_instance_methods
  debug
  help
  rpr }
