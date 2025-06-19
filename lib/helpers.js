(function() {
  'use strict';
  var bind_instance_methods, debug, get_instance_methods, help, hide, isa_function, nameit, rpr, warn;

  //===========================================================================================================
  isa_function = (require('./builtins')).gnd.function.isa;

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
  nameit = function(name, f) {
    Object.defineProperty(f, 'name', {
      value: name
    });
    return f;
  };

  //===========================================================================================================
  get_instance_methods = function(instance) {
    var R, key, method, ref;
    R = {};
    ref = Object.getOwnPropertyDescriptors(instance);
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
  bind_instance_methods = function(instance, keep_name = true) {
    var key, method, ref;
    ref = get_instance_methods(Object.getPrototypeOf(instance));
    for (key in ref) {
      method = ref[key];
      if (keep_name) {
        hide(instance, key, nameit(method.name, method.bind(instance)));
      } else {
        hide(instance, key, method.bind(instance));
      }
    }
    return null;
  };

  //===========================================================================================================
  debug = console.debug;

  help = console.help;

  warn = console.warn;

  rpr = function(x) {
    return (require('loupe')).inspect(x);
  };

  //===========================================================================================================
  module.exports = {hide, nameit, get_instance_methods, bind_instance_methods, debug, help, warn, rpr};

}).call(this);

//# sourceMappingURL=helpers.js.map