(function() {
  'use strict';
  var Type, Typespace, bind_instance_methods, debug, gnd, help, hide, kind_of, nameit, rpr, std, type_of, warn;

  //===========================================================================================================
  ({gnd, kind_of, type_of} = require('./builtins'));

  //-----------------------------------------------------------------------------------------------------------
  // get_instance_methods
  ({hide, bind_instance_methods, nameit, debug, warn, help, rpr} = require('./helpers'));

  //-----------------------------------------------------------------------------------------------------------
  ({Type, Typespace} = require('./main'));

  //===========================================================================================================
  std = new Typespace();

  //===========================================================================================================
  std.add_types({
    //.........................................................................................................
    text: {
      isa: function(x) {
        return (typeof x) === 'string'; // ( Object::toString.call x ) is '[object String]'
      },
      /* NOTE just returning argument which will be validated; only strings pass so `create value` is a no-op / validation only */
      create: function(x) {
        if (arguments.length === 0) {
          return '';
        } else {
          return x;
        }
      },
      template: ''
    },
    //.........................................................................................................
    float: {
      isa: function(x) {
        return Number.isFinite(x);
      },
      create: function(n = 0) {
        if (typeof x !== "undefined" && x !== null) {
          return parseFloat(x);
        } else {
          return 0;
        }
      }
    },
    //.........................................................................................................
    integer: {
      isa: function(x) {
        return Number.isInteger(x);
      },
      create: function(n = 0) {
        if (typeof x !== "undefined" && x !== null) {
          return parseInt(n, 10);
        } else {
          return 0;
        }
      },
      template: 0
    },
    //.........................................................................................................
    list: {
      isa: function(x) {
        return Array.isArray(x);
      },
      // create:   ( n = 0 ) -> if x? then ( parseInt n, 10 ) else 0
      template: function() {
        return [];
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  std.add_types({
    /*
    nonempty_text:
      isa:      std.text
      refine:   ( x ) -> ( x.length isnt 0 )
      create:   ( x ) -> x?.toString() ? ''
    */
    //.........................................................................................................
    nonempty_text: {
      base: std.text,
      // isa:      ( x ) -> ( std.text.isa x ) and ( x.length isnt 0 )
      isa: function(x) {
        return x.length !== 0;
      }
    },
    //.........................................................................................................
    quantity_q: {
      base: std.float
    }
  });

  // isa: std.float.isa
  //-----------------------------------------------------------------------------------------------------------
  std.add_types({
    //.........................................................................................................
    quantity_u: {
      base: std.nonempty_text
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  std.add_types({
    //.........................................................................................................
    quantity: {
      // create:   ( cfg ) -> { q: 0, u: 'u', cfg..., }
      fields: {
        q: std.quantity_q,
        u: std.quantity_u
      }
    },
    //.........................................................................................................
    quantity_with_template: {
      // create:   ( cfg ) -> { q: 0, u: 'u', cfg..., }
      fields: {
        q: std.quantity_q,
        u: std.quantity_u
      },
      template: {
        q: 'u'
      }
    }
  });

  //===========================================================================================================
  module.exports = {std};

}).call(this);

//# sourceMappingURL=std.js.map