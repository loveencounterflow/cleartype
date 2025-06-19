
'use strict'

#===========================================================================================================
isa_function              = ( require './builtins' ).gnd.function.isa

# #===========================================================================================================
# @bind_proto = ( that, f ) -> that::[ f.name ] = f.bind that::

#===========================================================================================================
hide = ( object, name, value ) => Object.defineProperty object, name,
    enumerable:   false
    writable:     true
    configurable: true
    value:        value

#===========================================================================================================
nameit = ( name, f ) -> Object.defineProperty f, 'name', { value: name, }; f

#===========================================================================================================
get_instance_methods = ( instance ) ->
  R             = {}
  for key, { value: method, } of Object.getOwnPropertyDescriptors instance
    continue if key is 'constructor'
    continue unless isa_function method
    R[ key ] = method
  return R

#===========================================================================================================
bind_instance_methods = ( instance, keep_name = true ) ->
  for key, method of get_instance_methods Object.getPrototypeOf instance
    if keep_name
      hide instance, key, nameit method.name, method.bind instance
    else
      hide instance, key, method.bind instance
  return null

#===========================================================================================================
debug   = console.debug
help    = console.help
warn    = console.warn
rpr     = ( x ) -> ( require 'loupe' ).inspect x

#===========================================================================================================
module.exports = {
  hide
  nameit
  get_instance_methods
  bind_instance_methods
  debug
  help
  warn
  rpr }
