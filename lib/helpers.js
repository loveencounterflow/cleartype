(function() {
  'use strict';
  var bind_instance_methods, debug, get_instance_methods, help, hide, rpr;

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
  get_instance_methods = function(instance) {
    var R, isa_function, key, method, ref;
    isa_function = (require('./builtins')).TMP_typespace1.function.$isa;
    R = {};
    ref = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(instance));
    for (key in ref) {
      ({
        value: method
      } = ref[key]);
      if (key === 'constructor') {
        continue;
      }
      if (!isa_function(method)) {
        continue;
      }
      R[key] = method;
    }
    return R;
  };

  //===========================================================================================================
  bind_instance_methods = function(instance) {
    var key, method, ref;
    ref = get_instance_methods(instance);
    for (key in ref) {
      method = ref[key];
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
  module.exports = {hide, get_instance_methods, bind_instance_methods, debug, help, rpr};

}).call(this);

//# sourceMappingURL=helpers.js.map