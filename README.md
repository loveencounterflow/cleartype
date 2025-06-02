

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

* **`[—]`** put typespaces in `builtins` into object `typespaces`?
* **`[—]`** it should be possible to use arbitrary field names in the declaration
* **`[—]`** types are anonymous
* **`[—]`** model and POC for standardized function signatures: `f = ( p_0, p_1, .._., p_n, cfg_0, cfg_1,
  ..., cfg_m ) ->` is understood as `f:( { p_0, }, { p_1, }, ..., { p_n, }, cfg_0, cfg_1, ..., cfg_m )` and
  then resolved as `cfg = { { p_0, }..., { p_1, }..., ..., { p_n, }..., cfg_0..., cfg_1..., ..., cfg_m...,
  }`

## Is Done

* **`[+]`** rename `TMP_typespace1` to `std`
* **`[+]`** rename `ctx.types` to `ctx.ct` to mirror name `CT` of the default `Cleartype` instance

<!-- ## Don't -->

