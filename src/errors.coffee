
'use strict'

#===========================================================================================================
class Cleartype_error                       extends Error
class Cleartype_arguments_not_allowed_error extends Cleartype_error
class Cleartype_type_validation_error       extends Cleartype_error
class Cleartype_kind_mismatch_error         extends Cleartype_error
class Cleartype_nocreate_error              extends Cleartype_error
class Cleartype_notemplate_error            extends Cleartype_error

#===========================================================================================================
module.exports = { 
  Cleartype_error
  Cleartype_arguments_not_allowed_error
  Cleartype_type_validation_error
  Cleartype_kind_mismatch_error
  Cleartype_nocreate_error
  Cleartype_notemplate_error }
