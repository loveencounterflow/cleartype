
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
bind_instance_methods = ( instance ) ->
  isa_function = ( require './builtins' ).TMP_typespace1.function.$isa
  for key, { value: method, } of Object.getOwnPropertyDescriptors Object.getPrototypeOf instance
    continue unless isa_function method
    hide instance, key, method.bind instance
  return null

#===========================================================================================================
debug   = console.debug
help    = console.help
rpr     = ( x ) -> ( require 'loupe' ).inspect x

#===========================================================================================================
module.exports = {
  hide
  bind_instance_methods
  debug
  help
  rpr }
