

# ClearType




<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [ClearType](#cleartype)
  - [To Do](#to-do)
  - [Is Done](#is-done)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



# ClearType


## To Do

* **`[—]`** create `Type_base` class that types are really derived from so they don't inherit methods like
  `_isaname_from_typename()` and so on
* **`[—]`** rename `dcl.refines` -> `dcl.base`

* **`[—]`** detect whether a type is either a <del>primitive</del> <ins>'fieldless type' (call it 'simple'
  to distinguish it from 'primitive')</ins> or else a POD (i.e. a 'compound' type); refuse to base a simple
  type on a compound type and vice versa
  * observe that there can be types that do have properties but are not compound types, e.g. when a
    `create()` method returns a set as in `d = mytype.create() -> new Set()` then `d` will have e.g. a
    property `size`; still, one is generally not supposed to add or delete properties on instantiated values
    or on JS `Array`s, so those count as simple types—leaving only PODs (i.e. values for which
    `Object.getPrototypeOf()` returns either `null` or something that's represented as `{} [Object: null
    prototype]` which is common to all direct derivatives of `Object`
  * **`[—]`** indicators for compoundness:
    * `dcl.fields` is a POD (or not a simple type)
    * `dcl.template` is a POD (or not a simple type)

* **`[—]`** `Type::create()` needs a `context` / `ctx` argument so it can resolve typenames from typespace
* **`[—]`** implement inheriting / linking typespaces so they can be 'assembled'; linking probably better
  b/c it allows to gather types from any number of typespaces into a new one
* **`[—]`** perform type creation on a class 'adjacent' to `Type` so derived type classes don't inherent
  internal stuff like what is now `Type::_classname_from_typename()`

* **`[—]`** list of invariants for types:
  * **`[—]`** each type has one of two kinds, 'simple' or 'compound'
  * **`[—]`** a type of one kind can only be based, if it is based, on another type of the same kind
  * **`[—]`** ...

* **`[—]`** list of configuration settings for `Type` instances; bolded parts indicate current explicit or
  implicit defaults:
  * **`[—]`** missing template value (MTV, default **`null`**)
  * **`[—]`** **allow** or forbid extraneous fields in types when checking with `isa()`
  * **`[—]`** **ignore** or honor ordering of elements of PODs, sets, maps when checking with `isa()`
  * **`[—]`** **copy** or ignore extraneous fields in types when constructing with `create()`
  * **`[—]`** **forbid** or allow custom properties on `Array`s
  * **`[—]`** ...

* **`[—]`** what happens when a type named `constructor` appears in a typespace?
* **`[—]`** better type name for result of `Object.create null`
* **`[—]`** introduce an API to do 'pre-checks' for values that are allowed to go into `create()`; for
  example one might demand that a valid `t` must have `x.k` to an `integer` but when passing in a value to
  `t.create()`, it's actually acceptable to have `x.k = null` because a suitable value will be filled out;
  however, we'd still want to treat `x.k = 'oops'` as an error right from the start, and checking for an
  optional integer in pre-checks could do exactly that
  * alternatively, advise in docs to just write a separate type for the pre-check
  * combine the two ideas, allow pre-check field to point to another type
  * observe that in the case of type declarations, we actually treat an empty object (`dcl.fields = {}`) as
    indicative of the *presence* of fields (and conclude this should be a compound type); but in the type
    that gets compiled from that declaration, an empty `t.fields` object indicates the *absence* of fields
    (and should be used in conjunction with `t.has_fields`)

* ??? **`[—]`** ??? put typespaces in `builtins` into object `typespaces`?
* ??? **`[—]`** ??? it should be possible to use arbitrary field names in the declaration
* ??? **`[—]`** ??? types are anonymous
* ??? **`[—]`** ??? model and POC for standardized function signatures: `f = ( p_0, p_1, .._., p_n, cfg_0, cfg_1,
  ..., cfg_m ) ->` is understood as `f:( { p_0, }, { p_1, }, ..., { p_n, }, cfg_0, cfg_1, ..., cfg_m )` and
  then resolved as `cfg = { { p_0, }..., { p_1, }..., ..., { p_n, }..., cfg_0..., cfg_1..., ..., cfg_m...,
  }`
* ??? **`[—]`** ??? better validation error messages
* ??? **`[—]`** ??? consider using `Object.create null` for templates
* ??? **`[—]`** ??? consider using properties for function properties of templates


## Is Done

* ??? **`[+]`** rename `TMP_typespace1` to `std`
* ??? **`[+]`** rename `ctx.types` to `ctx.ct` to mirror name `CT` of the default `Cleartype` instance

<!-- ## Don't -->

