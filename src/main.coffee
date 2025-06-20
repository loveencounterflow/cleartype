
'use strict'

#===========================================================================================================
{ gnd
  kind_of
  validate
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
E                         = require './errors'


#===========================================================================================================
internals = new class Internals then constructor: ->
  @gnd  = gnd
  return undefined

#===========================================================================================================
class Type

  #---------------------------------------------------------------------------------------------------------
  constructor: ->
    throw new E.Cleartype_arguments_not_allowed_error "Ω___2 arguments not allowed" if arguments.length isnt 0
    bind_instance_methods @
    hide @, 'name', @constructor.name.toLowerCase()
    return undefined

  #---------------------------------------------------------------------------------------------------------
  create: ( typename, dcl ) ->
    ### TAINT should wrap b/c of names? ###
    return dcl if dcl instanceof @constructor
    dcl = { gnd.dcl.get_template()..., dcl..., name: typename, }
    #.......................................................................................................
    Object.assign dcl, @_compile_base     dcl
    Object.assign dcl, @_compile_kind     dcl
    Object.assign dcl, @_compile_fields   dcl
    Object.assign dcl, @_compile_template dcl
    Object.assign dcl, @_compile_isa      dcl
    Object.assign dcl, @_compile_create   dcl
    #.......................................................................................................
    ### TAINT should we differentiate instance properties from prototype methods? ###
    clasz = class extends dcl.baseclass
      #.....................................................................................................
      constructor: ( P... ) ->
        super P...
        hide @, 'name',         dcl.name
        hide @, 'kind',         dcl.kind
        hide @, 'base',         dcl.base
        hide @, 'fields',       dcl.fields
        hide @, 'template',     dcl.template
        hide @, 'has_fields',   dcl.has_fields
        hide @, 'has_template', dcl.has_template
        hide @, 'has_base',     dcl.has_base
        hide @, 'is_creatable', dcl.is_creatable
        return undefined
      #.....................................................................................................
      isa:          dcl.isa
      create:       dcl.create
      get_template: dcl.get_template
    nameit ( @_classname_from_typename dcl.name ), clasz
    return new clasz()

  #---------------------------------------------------------------------------------------------------------
  _compile_base: ( dcl ) ->
    has_base  = false
    baseclass = @constructor
    base      = null
    ### TAINT condition should use API like 'has_property_but_value_isnt_null()' (?name?) ###
    # if ( Reflect.has dcl, 'base' ) and ( dcl.base isnt null )
    if dcl.base?
      unless ( dcl.base instanceof @constructor )
        ### TAINT use `type_of()` ###
        throw new Error "Ω___3 dcl.base must be instanceof #{rpr @}, got #{rpr dcl.base}"
      has_base  = true
      ### NOTE redundant here but needed when we allow typenames for base ###
      base      = dcl.base
      baseclass = dcl.base.constructor
    return { has_base, base, baseclass, }

  #---------------------------------------------------------------------------------------------------------
  _compile_kind: ( dcl ) ->
    kind            = null
    kind_reason = null
    #.......................................................................................................
    hints =
      acc_to_kind:      if dcl.kind?      then dcl.kind               else null
      acc_to_fields:    if dcl.fields?    then 'compound'             else 'simple'
      acc_to_template:  if dcl.template?  then kind_of dcl.template   else null
      acc_to_base_kind: if dcl.base?      then dcl.base.kind          else null
    #.......................................................................................................
    for hint_reason, hint of hints
      continue unless hint?
      unless kind?
        kind        = hint
        kind_reason = hint_reason
        continue
      continue if hint is kind
      kind_reason = kind_reason.replace /acc_to_/g,  ''
      kind_reason = kind_reason.replace /_/g,        '.'
      hint_reason = hint_reason.replace /acc_to_/g,  ''
      hint_reason = hint_reason.replace /_/g,        '.'
      throw new E.Cleartype_kind_mismatch_error "Ω___4 according to #{dcl.name}.#{kind_reason}, " + \
        "the kind of #{dcl.name} is #{rpr kind}, but according to #{dcl.name}.#{hint_reason}, " + \
        "the kind of #{dcl.name} is #{rpr hint}"
    #.......................................................................................................
    return { kind, }

  #---------------------------------------------------------------------------------------------------------
  _compile_fields: ( dcl ) ->
    has_fields  = false
    fields      = Object.create null
    sources     = []
    #.......................................................................................................
    if dcl.has_base and dcl.base.has_fields
      sources.push dcl.base.fields
    #.......................................................................................................
    if dcl.fields?
      validate gnd.compound, dcl.fields
      sources.push dcl.fields
    #.......................................................................................................
    for source in sources
      for sub_name, sub_field of ( source ? {} )
        validate gnd.dcl_field, sub_field
        has_fields          = true
        fields[ sub_name ]  = sub_field
    return { has_fields, fields, }

  #---------------------------------------------------------------------------------------------------------
  _compile_template: ( dcl ) ->
    has_template  = Reflect.has dcl, 'template'
    template      = Object.create null
    sources       = []
    get_template  = -> throw new E.Cleartype_notemplate_error "Ω___6 type #{dcl.name} doesn't have a template"
    #.......................................................................................................
    if has_template
      if gnd.function.isa dcl.template
        # debug 'Ω___7', dcl.name, "_compile_template"
        template      = dcl.template
        get_template  = -> template.call @
      #.......................................................................................................
      else if gnd.simple.isa dcl.template
        # debug 'Ω___8', dcl.name, "_compile_template", rpr dcl.template
        template      = dcl.template
        get_template  = -> template
    #.......................................................................................................
    else if dcl.has_base and dcl.base.has_template
      # debug 'Ω___9', dcl.name, "_compile_template"
      sources.push dcl.base.template
    # #.......................................................................................................
    # if dcl.template?
    #   validate gnd.compound dcl.fields
    #   sources.push dcl.fields
    #   if has_base and ( kind isnt true )
    #     throw new E.Cleartype_kind_mismatch_error "Ω__10 type #{dcl.name} is declared as a compound type kind but its base #{base.name} isn't"
    #   kind = true
    # #.......................................................................................................
    # for source in [ base?.template, dcl.template, ]
    #   for sub_name, sub_template of ( source ? {} )
    #     has_template          = true
    #     producer              = if ( gnd.function.isa sub_template ) then sub_template else \
    #       do ( value = sub_template ) -> -> sub_template
    #     ### TIANT use API call ###
    #     template[ sub_name ]  = nameit "create_#{dcl.name}_#{sub_name}", producer
    # return { has_template, template, kind, }
    get_template = nameit ( @_method_name_from_typename 'get_template_for', dcl.name ), get_template
    return { has_template, template, get_template, }

  #---------------------------------------------------------------------------------------------------------
  _compile_isa: ( dcl ) ->
    if ( isa = dcl.isa )?
      if isa instanceof @constructor
        isa = do ( other_type = isa ) -> ( x ) -> other_type.isa x
      validate gnd.function, dcl.isa
    #.......................................................................................................
    ### TAINT decomplect logic ###
    else
      if dcl.has_fields
        isa = @_get_isa_for_fields dcl
      else
        unless dcl.has_base
          throw new Error "Ω__11 type declaration must have one of 'fields', 'isa' or 'base' properties, got none"
        isa = ( x ) -> true
    #.......................................................................................................
    if dcl.has_base
      isa = do ( base = dcl.base, isa ) -> ( x ) -> ( base.isa x ) and ( isa.call @, x )
    #.......................................................................................................
    isa = nameit ( @_method_name_from_typename 'isa', dcl.name ), isa
    return { isa, }

  #---------------------------------------------------------------------------------------------------------
  _compile_create: ( dcl ) ->
    create = -> throw new E.Cleartype_nocreate_error "Ω__12 unable to create a #{dcl.name}"
    if dcl.create?
      validate gnd.function, dcl.create
      create = do ( create = dcl.create                       ) -> ( P... ) -> @validate create.call @, P...
    else if dcl.has_base and ( not dcl.has_fields )
      create = do ( create = dcl.base.create, base =dcl.base  ) -> ( P... ) -> @validate create.call base, P...
    ### TAINT provide create when there are fields but no create() ###
    else if dcl.has_fields
      debug 'Ω__13'
    create = nameit ( @_method_name_from_typename 'create', dcl.name ), create
    return { create, }

  #=========================================================================================================
  _get_isa_for_fields: ( dcl ) -> ( x ) ->
    return false unless x?
    ### TAINT in the future, should allow extending e.g. lists with fields? ###
    return false unless gnd.pod.isa x
    for field_name, subtype of dcl.fields
      continue if subtype.isa x[ field_name ]
      ### TAINT use type_of ###
      rejection = "expected a #{subtype.name} for field #{rpr field_name}, got #{rpr x[ field_name ]}"
      # warn 'Ω__14', rejection
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
    throw new E.Cleartype_type_validation_error "Ω__15 validation error: expected a #{@name}, got a #{type_of x}"

  #---------------------------------------------------------------------------------------------------------
  isa: nameit 'isa_type', ( x ) -> x instanceof @constructor

#===========================================================================================================
class Typespace

  #---------------------------------------------------------------------------------------------------------
  add_types: ( dcls ) ->
    ### TAINT name collisions possible ###
    for typename, dcl of dcls
      if Reflect.has @, typename
        throw new Error "Ω__16 name collision: type / property #{rpr typename} already declared"
      @[ typename ] = type.create typename, dcl
    return null

#===========================================================================================================
type = new Type()

#===========================================================================================================
module.exports = { type_of, Type, Typespace, internals, }
