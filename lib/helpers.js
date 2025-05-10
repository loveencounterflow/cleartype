(function() {
  'use strict';
  var bind_instance_methods, debug, help, hide, rpr;

  // #===========================================================================================================
  // @bind_proto = ( that, f ) -> that::[ f.name ] = f.bind that::

  //===========================================================================================================
  hide = (object, name, value) => {
    return Object.defineProperty(object, name, {
      enumerable: false,
      writable: true,
      configurable: true,
      value: value
    });
  };

  //===========================================================================================================
  bind_instance_methods = function(instance) {
    var isa_function, key, method, ref;
    isa_function = (require('./builtins')).TMP_typespace1.function.$isa;
    ref = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(instance));
    for (key in ref) {
      ({
        value: method
      } = ref[key]);
      if (!isa_function(method)) {
        continue;
      }
      hide(instance, key, method.bind(instance));
    }
    return null;
  };

  //===========================================================================================================
  debug = console.debug;

  help = console.help;

  rpr = function(x) {
    return (require('loupe')).inspect(x);
  };

  //===========================================================================================================
  module.exports = {hide, bind_instance_methods, debug, help, rpr};

}).call(this);

//# sourceMappingURL=helpers.js.map