
var $pyjs_array_slice = Array.prototype.slice;

var $pyjs_module_type = {
    toString: function() { return "<type 'module'>"; },
    __class__: null, // will be set by pyjslib once type is defined
    __mro__: null, // will be set by pyjslib once type is defined
    __name__: 'module'
};

// Track recent tracebacks so we can debug errors in production
var $pyjs_last_tracebacks = [];

// create_exception
function $pyce(exc) {
    var message = $p['repr'](exc);
    if (!(exc.__$super_cache__ && $p.StopIteration.$H in exc.__$super_cache__) &&
          message !== "NotImplementedError('/dev/urandom (or equivalent) not found',)" &&
          message !== "NotImplementedError('System entropy source does not have state.',)" &&
          message !== "ImportError('No module named threading.local, threading.local in context None',)") {
      try {
        throw new Error(message);
      } catch(e) {
        var traceback = (new Date()).toISOString().replace('T', ' ') + '\n';
        if (typeof e.stack != 'undefined') {
          traceback += e.stack;
        }
        var func_names = [];
        try {
          var parent = arguments.callee.caller;
          while (parent && func_names.length < 15) {
            var func_name = parent.__name__ || parent.name || '<anonymous>';
            if (parent.__class__ && parent.__class__ !== $p.__class__) {
              func_name = (parent.__class__.__module__ || '<unknown module>') + '.' +
                          (parent.__class__.__name__ || '<unknown class>') + '.' +
                          func_name;
            }
            func_names.push(func_name);
            parent = parent.caller;
          }
        } catch(e2) {
          // We can get here if accessing .caller causes TypeError because of strict mode
        }
        if (traceback && func_names.length) {
          traceback += '\nFunc name stack:\n';
        }
        traceback += '\n'.join(func_names) + '\n';
        $pyjs_last_tracebacks.splice(0, 0, traceback);
        if ($pyjs_last_tracebacks.length > 3) {
          $pyjs_last_tracebacks.pop();
        }
      }
    }
    var err = new Error(message);
    err['$pyjs_exc'] = exc;
    return err;
};

// make_generator
function $pymg()
{
  var $generator = function () {};
  $generator['__iter__'] = function () {
    return $generator;
  };
  $generator['next'] = function (noStop) {
    return $generator['$run'](null, null, false, noStop);
  };
  $generator['send'] = function ($val) {
    return $generator['$run']($val, null);
  };
  $generator['$$throw'] = function ($exc_type, $exc_value) {
      var exc=(typeof $exc_value == 'undefined' ? $exc_type() :
                                              ($p['isinstance']($exc_value, $exc_type)
                                               ? $exc_value : $exc_type($exc_value)));
      return $generator['$run'](null, exc);
  };
  $generator['close'] = function () {
    return $generator['$run'](null, $p['GeneratorExit'](), true);
  };
  return $generator;
};

// kwargs_call
function $pykc(obj, func, star_args, dstar_args, args, kwargs)
{
    if (obj !== null && typeof func != 'function') {
        func = obj[func];
        if (obj.__is_instance__ === true && obj.hasOwnProperty(func)) {
            obj = null;
        }
    }

    if (typeof func != 'function') {
        if (func && func.__is_instance__ === true && typeof func.__call__ == 'function') {
            obj = func;
            func = func.__call__;
        } else {
            throw $pyce($p['TypeError'](func + ' object is not callable'));
        }
    }

    // Merge dstar_args into kwargs
    if (dstar_args) {
        if ($p['get_pyjs_classtype'](dstar_args) != 'dict') {
            throw $pyce($p['TypeError'](func.__name__ + "() arguments after ** must be a dictionary " + $p['repr'](dstar_args)));
        }
        var i;
        /* use of __iter__ and next is horrendously expensive,
           use direct access to dictionary instead
         */
        for (var keys in dstar_args.__object) {
            var k = dstar_args.__object[keys][0];
            var v = dstar_args.__object[keys][1];

            if ('$$' + k in $p['var_remap']) {
                k = '$$' + k;
            }
            if (kwargs == null) {
                kwargs = {};
            }
            if ($pyjs.options.arg_kwarg_multiple_values && typeof kwargs[k] !=
 'undefined') {
                $pyjs__exception_func_multiple_values(func.__name__, k);
             }
            kwargs[k] = v;
        }

    }

    // Append star_args to args
    if (star_args) {
        if (star_args === null || typeof star_args.__iter__ != 'function') {
            throw $pyce($p['TypeError'](func.__name__ + "() arguments after * must be a sequence" + $p['repr'](star_args)));
        }
        if (star_args.__array != null && star_args.__array.constructor == Array) {
            args = args.concat(star_args.__array);
        } else {

            /* use of __iter__ and next is horrendously expensive,
               use __len__ and __getitem__ instead, if they exist.
             */
            var call_args = Array();

            if (typeof star_args.__array != 'undefined') {
                var a = star_args.__array;
                var n = a.length;
                for (var i = 0; i < n; i++) {
                    call_args[i] = a[i];
                }
            } else {
                var $iter = star_args.__iter__();
                if (typeof $iter.__array != 'undefined') {
                    var a = $iter.__array;
                    var n = a.length;
                    for (var i = 0; i < n; i++) {
                        call_args[i] = a[i];
                    }
                } else if (typeof $iter.$genfun == 'function') {
                    var v, i = 0;
                    while (typeof (v = $iter.next(true)) != 'undefined') {
                        call_args[i++] = v;
                    }
                } else {
                    var i = 0;
                    try {
                        while (true) {
                            call_args[i++]=$iter.next();
                        }
                    } catch (e) {
                        if (e.__name__ != 'StopIteration') {
                            throw e;
                        }
                    }
                }
            }
            args = args.concat(call_args);
        }
    }

    if ($pyjs.options.arg_instance_type && obj !== null) {
        var first_arg = null;
        if (args.length >= 1)
            first_arg = args[0];
        $pyjs_check_instance_type(obj, func, first_arg);
    }

    if ($pyjs.options.arg_is_instance && obj !== null) {
        $pyjs_check_if_instance(obj, func, args)
    }

    if (kwargs === null) {
        return func.apply(obj, args);
    }

    // Get function/method arguments
    if (typeof func.__args__ != 'undefined') {
        var __args__ = func.__args__;
    } else {
        var __args__ = new Array(null, null);
    }

    // Now convert args to call_args
    var _args = [];
    var a, aname, _idx , idx, res;
    _idx = 2;
    idx = 0;

    // Skip first argument in __args__ when calling a method
    if (func.__is_staticmethod__ !== true && obj !== null
            && typeof func.__is_instance__ == 'undefined'
            && (obj.__is_instance__ === true || func.__is_classmethod__ === true)) {
        _idx++;
    }
    for (; _idx < __args__.length; _idx++, idx++) {
        aname = __args__[_idx][0];
        a = kwargs[aname];
        if (typeof args[idx] == 'undefined') {
            _args.push(a);
            delete kwargs[aname];
        } else {
            if (typeof a != 'undefined') $pyjs__exception_func_multiple_values(func.__name__, aname);
            _args.push(args[idx]);
        }
    }

    // Append the left-over args
    for (;idx < args.length;idx++) {
        if (typeof args[idx] != 'undefined') {
            _args.push(args[idx]);
        }
    }
    // Remove trailing undefineds
    while (_args.length > 0 && typeof _args[_args.length-1] == 'undefined') {
        _args.pop();
    }

    if (__args__[1] === null) {
        // Check for unexpected keyword
        for (var kwname in kwargs) {
            $pyjs__exception_func_unexpected_keyword(func.__name__, kwname);
        }
        return func.apply(obj, _args);
    }
    a = $p['dict'](kwargs);
    if (a.__len__() > 0) {
        a['$pyjs_is_kwarg'] = true;
        _args.push(a);
    }
    res = func.apply(obj, _args);
    delete a['$pyjs_is_kwarg'];
    return res;
}

function $pyjs__exception_func_param(func_name, minargs, maxargs, nargs) {
    if (minargs == maxargs) {
        switch (minargs) {
            case 0:
                var msg = func_name + "() takes no arguments (" + nargs + " given)";
                break;
            case 1:
                msg = func_name + "() takes exactly " + minargs + " argument (" + nargs + " given)";
                break;
            default:
                msg = func_name + "() takes exactly " + minargs + " arguments (" + nargs + " given)";
        };
    } else if (nargs > maxargs) {
        if (maxargs == 1) {
            msg  = func_name + "() takes at most " + maxargs + " argument (" + nargs + " given)";
        } else {
            msg = func_name + "() takes at most " + maxargs + " arguments (" + nargs + " given)";
        }
    } else if (nargs < minargs) {
        if (minargs == 1) {
            msg = func_name + "() takes at least " + minargs + " argument (" + nargs + " given)";
        } else {
            msg = func_name + "() takes at least " + minargs + " arguments (" + nargs + " given)";
        }
    } else {
        return;
    }
    if (typeof $p['TypeError'] == 'function') {
        throw $pyce($p['TypeError'](String(msg)));
    }
    throw new Error(msg);
}

function $pyjs__exception_func_multiple_values(func_name, key) {
    throw $pyce($p['TypeError'](String(func_name + "() got multiple values for keyword argument '" + key + "'")));
}

function $pyjs__exception_func_unexpected_keyword(func_name, key) {
    throw $pyce($p['TypeError'](String(func_name + "() got an unexpected keyword argument '" + key + "'")));
}

function $pyjs__exception_func_class_expected(func_name, class_name, instance) {
        if (typeof instance == 'undefined') {
            instance = 'nothing';
        } else if (instance.__is_instance__ == null) {
            instance = "'"+String(instance)+"'";
        } else {
            instance = String(instance);
        }
        throw $pyce($p['TypeError'](String("unbound method "+func_name+"() must be called with "+class_name+" class as first argument (got "+instance+" instead)")));
}

function $pyjs_check_instance_type(instance, func, first_arg) {
    var klass = func.__class__;
    if (!$pyjs.options.arg_instance_type || typeof instance.__class__ == 'undefined'
            || typeof klass == 'undefined' || func.__is_staticmethod__) {
        return;
    }

    var is_subtype = $p['_isinstance'];
    if (instance.__is_instance__ === false) {
        if (func.__is_classmethod__ === true) {
            is_subtype = $p['issubclass'];
        } else {
            if (typeof first_arg != 'undefined' && first_arg !== null)
                $pyjs_check_instance_type(first_arg, func);
            return;
        }
    }

    if (typeof instance.__is_instance__ != 'undefined'
            && func.__is_instance__ !== false
            && typeof klass != 'undefined'
            && instance.__class__.__md5__ !== klass.__md5__
            && !is_subtype(instance, klass)) {
        $pyjs__exception_func_instance_expected(func.__name__, klass.__name__, instance);
    }
}

function $pyjs_check_if_instance(obj, func, args) {
    if ($pyjs.options.arg_is_instance && obj.__is_instance__ === false
            && func.__is_staticmethod__ !== true && func.__is_classmethod__ !== true
            && typeof func.__class__ != 'undefined'
            && args.length >= 1 && args[0] != null && args[0].__is_instance__ === false) {
        $pyjs__exception_func_instance_expected(func.__name__, func.__class__.__name__, obj);
    }
}

function $pyjs__exception_func_instance_expected(func_name, class_name, instance) {
    if (typeof instance == 'undefined') {
        instance = 'nothing';
    } else if (instance.__is_instance__ == null) {
        instance = "'"+String(instance)+"'";
    } else {
        instance = String(instance);
    }
    throw $pyce($p['TypeError'](String("unbound method "+func_name+"() must be called with "+class_name+" instance as first argument (got "+instance+" instead)")));
}

// prepare_func
function $pf(func_name, func, args) {
    func.__name__ = func.func_name = func_name;
    func.__args__ = args;
    func.__$pyjs_accepts_kwargs__ = args[1] !== null;
    return func;
}

// assign_function
function $af(ctx, func_name, func, args) {
    ctx[func_name] = $pf(func_name, func, args);
}

function $pyjs__mro_merge(seqs) {
    var res = new Array();
    var i = 0;
    var cand = null;
    function resolve_error(candidates) {
        throw $pyce($p['TypeError']("Cannot create a consistent method resolution order (MRO) for bases " + candidates[0].__name__ + ", "+ candidates[1].__name__));
    }
    for (;;) {
        var nonemptyseqs = new Array();
        for (var j = 0; j < seqs.length; j++) {
            if (seqs[j].length > 0) nonemptyseqs.push(seqs[j]);
        }
        if (nonemptyseqs.length == 0) return res;
        i++;
        var candidates = new Array();
        for (var j = 0; j < nonemptyseqs.length; j++) {
            cand = nonemptyseqs[j][0];
            candidates.push(cand);
            var nothead = new Array();
            for (var k = 0; k < nonemptyseqs.length; k++) {
                for (var m = 1; m < nonemptyseqs[k].length; m++) {
                    if (cand === nonemptyseqs[k][m]) {
                        nothead.push(nonemptyseqs[k]);
                    }
                }
            }
            if (nothead.length != 0)
                cand = null; // reject candidate
            else
                break;
        }
        if (cand == null) {
            resolve_error(candidates);
        }
        res.push(cand);
        for (var j = 0; j < nonemptyseqs.length; j++) {
            if (nonemptyseqs[j][0] === cand) {
                nonemptyseqs[j].shift();
            }
        }
    }
}

function $pyjs__class_instance(class_name, module_name) {
    if (typeof module_name == 'undefined') module_name = typeof __mod_name__ == 'undefined' ? '__main__' : __mod_name__;
    var cls_fn = function(){
        var args, init_args = null, instance, i;
        var kwargs = null;

        // Fast code path. The auto-generated __new__ method ignores all arguments.
        if (typeof cls_fn.__new__.__$pyjs_autogenerated__ != 'undefined') {
            instance = cls_fn.__new__.call(null, cls_fn);
            args = arguments;
        } else {
            if (cls_fn.__new__.__$pyjs_accepts_kwargs__ !== false && arguments.length >= 1) {
                var maybe_kwargs = arguments[arguments.length-1];
                if (maybe_kwargs !== null && typeof maybe_kwargs.$pyjs_is_kwarg != 'undefined') {
                    kwargs = maybe_kwargs.copy();
                    kwargs.$pyjs_is_kwarg = true;
                }
            }
            args = [cls_fn].concat($pyjs_array_slice.call(arguments));
            init_args = args;
            instance = cls_fn.__new__.apply(null, args);
            if (kwargs !== null) {
              args.shift();
              args[args.length-1] = kwargs;
            } else {
              args = arguments;
            }
        }

        if (typeof instance.__init__.__$pyjs_autogenerated__ != 'undefined') {
            return instance;
        }
        if (instance.__is_instance__ !== false) {
            // costly... if ($p['isinstance'](instance, cls_fn)) {
                instance.__init__.apply(instance, args);
                /* this check is not really critical...
                if (instance.__init__.apply(instance, args) != null) {
                    throw $pyce($p['TypeError']('__init__() should return None'));
                } */
            // }
        } else if ($p['isinstance'](cls_fn, $p['type'])) {
            // __metaclass__ returns a class instead of an instance. Don't pass the
            // class via this because otherwise the __init__ function fails to unpack
            // the arguments.
            if (typeof cls_fn.__init__ != 'function') {
                return instance;
            }
            if (init_args !== null) {
                args = init_args;
                args[0] = instance;
            } else {
                args = [instance];
                for (i=0; i<arguments.length; i++) {
                    args.push(arguments[i]);
                }
            }
            cls_fn.__init__.apply(null, args);
        }
        return instance;
    };
    cls_fn.__name__ = class_name;
    cls_fn.__module__ = module_name;
    cls_fn.__class__ = $p['type'];
    cls_fn.toString = function() {
        if (this.__is_instance__ === true) {
            if (typeof this.__repr__ == 'function') {
                return this.__repr__();
            }
            if (typeof this.__str__ == 'function') {
                return this.__str__();
            }
            return '<instance of ' + this.__module__ + '.' + this.__name__ + '>';
        }
        return '<class ' + this.__module__ + '.' + this.__name__ + '>';
    };
    return cls_fn;
}

// Who cares about this __new__ check? It's inefficient.
// if (cls.__init__.__$pyjs_autogenerated__ && arguments.length != 1) $pyjs__exception_func_param(arguments.callee.__name__, 1, 1, arguments.length);
function $pyjs__class_function_checked__new__(cls) {
    var ctor = cls.$__instancector__;
    return new ctor(cls);
}

function $pyjs__class_function_unchecked__new__(cls) {
  var ctor = cls.$__instancector__;
  return new ctor(cls);
}

function $pyjs__class_function(cls_fn, prop, bases) {
    if (typeof cls_fn != 'function') throw "compiler error? $pyjs__class_function: typeof cls_fn != 'function'";
    var class_name = cls_fn.__name__;
    var class_module = cls_fn.__module__;
    cls_fn.__number__ = null;
    var base_mro_list = [];
    for (var i = 0; i < bases.length; i++) {
        if (bases[i].__mro__ != null) {
            base_mro_list.push([].concat(bases[i].__mro__.__array));
        } else if (typeof bases[i].__class__ == 'function') {
            base_mro_list.push([bases[i].__class__]);
        }
    }
    var __mro__ = $pyjs__mro_merge(base_mro_list);

    var inherited = {};
    for (var b = __mro__.length-1; b >= 0; b--) {
        var base = __mro__[b];
        for (var p in base) {
            if (typeof base.__inherited_properties__ != 'undefined'
                    && p in base.__inherited_properties__) {
                continue;
            }
            if (!(p in prop)) {
              inherited[p] = null;
            }
            cls_fn[p] = base[p];
        }
    }

    for (var p in prop) {
        cls_fn[p] = prop[p];
    }

    cls_fn.__inherited_properties__ = inherited;
    // in the following eval statement we are only allowd to use vars defined inside eval
    // (vars defined outside are not allowd since a filter like slimit will rename vars)
    eval("var _cls_fn_$ = function " + class_name + "$inst(cls) { this.__class__ = cls; }");
    cls_fn.$__instancector__ = _cls_fn_$;
    var wrapper = function() {};
    wrapper.prototype = cls_fn;
    // This is an optimization
    cls_fn.$__instancector__.prototype = new wrapper();
    cls_fn.$__instancector__.prototype.__is_instance__ = true;
    cls_fn.$__instancector__.prototype.__dict__ = {};

    if (cls_fn['__new__'] == null) {
      cls_fn['__new__'] = $pf('__new__',
          ($pyjs.options.arg_count ? $pyjs__class_function_checked__new__ : $pyjs__class_function_unchecked__new__),
          ['args', 'kwargs', ['cls']]);
      cls_fn['__new__'].__$pyjs_autogenerated__ = true;
      cls_fn['__new__'].__$pyjs_accepts_kwargs__ = false;
      cls_fn['__new__'].__is_staticmethod__ = true;
    }
    if (cls_fn['__init__'] == null) {
      /* who cares about this __init__ check? It's inefficient.
        if (this.__is_instance__ === true) {
            var self = this;
            if ($pyjs.options.arg_count && arguments.length != 0) $pyjs__exception_func_param(arguments.callee.__name__, 1, 1, arguments.length+1);
        } else {
            var self = arguments[0];
            if ($pyjs.options.arg_is_instance && self.__is_instance__ !== true) $pyjs__exception_func_instance_expected(arguments.callee.__name__, arguments.callee.__class__.__name__, self);
            if ($pyjs.options.arg_count && arguments.length != 1) $pyjs__exception_func_param(arguments.callee.__name__, 1, 1, arguments.length);
        } */
      cls_fn['__init__'] = $pf('__init__', function () {
      }, [null, null, ['self']]);
      cls_fn['__init__'].__$pyjs_autogenerated__ = true;
      cls_fn['__init__'].__class__ = cls_fn;
    }
    cls_fn.__name__ = class_name;
    cls_fn.__module__ = class_module;
    __mro__ = [cls_fn].concat(__mro__);
    if (typeof $p['tuple'] != 'undefined') {
        cls_fn.__mro__ = $p['tuple'](__mro__);
    }
    cls_fn.__dict__ = cls_fn;
    cls_fn.__is_instance__ = false;
    cls_fn.__super_classes__ = bases;
    cls_fn.__sub_classes__ = [];
    if (class_name !== 'super') {
      for (var i = 0; i < bases.length; i++) {
          if (typeof bases[i].__sub_classes__ != 'undefined') {
              bases[i].__sub_classes__.push(cls_fn);
          } else {
              bases[i].__sub_classes__ = [];
              bases[i].__sub_classes__.push(cls_fn);
          }
      }
    }

    if (cls_fn.__new__.__args__ != null
            && cls_fn.__new__.__$pyjs_autogenerated__ !== true) {
        cls_fn.__args__ = $pyjs_array_slice.call(cls_fn.__new__.__args__, 0, 2).concat($pyjs_array_slice.call(cls_fn.__new__.__args__, 3));
    } else if (cls_fn.__init__.__args__ == null) {
        cls_fn.__args__ = cls_fn.__init__.__args__;
    } else {
        cls_fn.__args__ = $pyjs_array_slice.call(cls_fn.__init__.__args__, 0, 2).concat($pyjs_array_slice.call(cls_fn.__init__.__args__, 3));
    }
    
    // remove hash for newly created classes so that subclasses will get their
    // own hash
    if ('$H' in cls_fn) {
        delete cls_fn.$H;
    }

    if (class_name !== 'super') {
        var super_cache = {};
        var hash;
        for (var index = 0; index < __mro__.length - 1; index++) {
            hash = __mro__[index].$H;
            if (typeof hash == 'undefined') {
                hash = __mro__[index].$H = ++$p['next_hash_id'];
            }
            super_cache[hash] = $pyjs_type('super', __mro__.slice(index + 1),
                                           {$_fast_super: true});
        }
        if (typeof $p['object'] == 'function') {
          super_cache[$p['object']['$H']] = null;
        } else if (class_name === 'object') {
          super_cache[cls_fn['$H']] = null;
        }
        cls_fn.__$super_cache__ = super_cache;
    }

    return cls_fn;
}

/* creates a class, derived from bases, with methods and variables */
function $pyjs_type(clsname, bases, methods)
{
    var cls_instance = $pyjs__class_instance(clsname, methods['__module__']);
    var obj = {};
    for (var i in methods) {
        if (typeof methods[i] == 'function' && typeof methods[i].__class__ == 'undefined') {
            if (i == '__new__') {
                methods[i].__is_staticmethod__ = true;
            }
            methods[i].__class__ = cls_instance;
            obj[i] = methods[i];
        } else {
            obj[i] = methods[i];
        }
    }
    return $pyjs__class_function(cls_instance, obj, bases);
}


function $pyjs_varargs_handler(args, start, has_kwargs)
{
    var end;
    if (has_kwargs) {
        end = args.length-1;
        start = start - 1;
    } else {
        end = args.length;
    }
    $p['_imm_tuple']($pyjs_array_slice.call(args, start, end));
}

function $pyjs_get_vararg_and_kwarg($l, args, kwargname, varargname,
                                    argcount, maxargs, minargs, maxargscheck)
{
    if (kwargname !== null) { /* if node.kwargs: */
        $l[kwargname] = args.length >= maxargs ? args[args.length-1] :
                                                  args[args.length];
        if (typeof $l[kwargname] != 'object' ||
            $l[kwargname].__name__ != 'dict' ||
            typeof $l[kwargname].$pyjs_is_kwarg == 'undefined') {
            if (varargname !== null) { /* if node.varargs: */
                if (typeof $l.kwargs != 'undefined') {
                    $l[varargname].__array.push($l[kwargname]);
                }
            }
            $l[kwargname] = args[args.length+1];
        } else {
            delete $l[kwargname].$pyjs_is_kwarg;
        }
    }
    /* TODO: if options.function_argument_checking */
    /*
    if self.function_argument_checking:
    if ($pyjs.options.arg_count && argcount) {
        $pyjs__exception_func_param(args.callee.__name__,
                                    minargs, maxargscheck, args.length+1);
    }
     */
}

/* creates local variables as an array based on method parameter specification
   and the caller's arguments (in args).
   this function mirrors exactly what Translator._instance_method_init
   produces (it has to).

   when generating code to call this function, defaults_count is passed in
   because otherwise it is necessary to count the callee __args__ list
   items [['arg1'], ['arg2', 'a default value']] and that would be a pain,
   repeated tons of times.

 */
function $pyjs_instance_method_get(inst, args,
                                    defaults_count, /* convenience */
                                    has_varargs, has_kwargs)
{
    /* TODO: pass these in, to save time */
    var callee_args = args.callee.__args__;
    var varargname = callee_args[0];
    var kwargname = callee_args[1];
    var arg_names = callee_args.slice(2);

    console.debug(inst.__name__ + " " + args.callee.__name__ + " isinst " + inst.__is_instance__ + " hva " + has_varargs + " hkwa " + has_kwargs + " va " + varargname + " kw " + kwargname + " al " + arg_names.length);

    var $l = {};
    var end;
    var maxargs1 = arg_names.length - 1; /* for __is_instance__ === false */
    var maxargs2 = arg_names.length; /* for __is_instance__ === true */
    var maxargs1check = maxargs1;
    var maxargs2check = maxargs2;
    var minargs1 = maxargs1 - defaults_count;
    var minargs2 = maxargs2 - defaults_count;
    var argcount1;
    var argcount2;

    if (has_kwargs) {
        maxargs1 = maxargs1 + 1;
        maxargs2 = maxargs2 + 1;
    }
    /* for __instance__ === false */
    if (has_varargs) {
        argcount1 = args.length < minargs1;
        maxargs1check = null;
    } else if (minargs1 == maxargs1) {
        argcount1 = args.length != minargs1;
    } else {
        argcount1 = args.length < minargs1 || args.length > maxargs1;
    }
    /* for __instance__ === true */
    if (has_varargs) {
        argcount2 = args.length < minargs2;
        maxargs2check = null;
    } else if (minargs2 == maxargs2) {
        argcount2 = args.length != minargs2;
    } else {
        argcount2 = args.length < minargs2 || args.length > maxargs2;
    }

    if (inst.__is_instance__ === true) {

        $l['self'] = inst;

        if (varargname !== null) { /* if node.varargs: */
            /* self._varargs_handler(varargname, maxargs1) */
            $l[varargname] = $pyjs_varargs_handler(args, maxargs1, has_kwargs);
        }

        $pyjs_get_vararg_and_kwarg($l, args, kwargname, varargname, argcount1,
                                   maxargs1, minargs2, maxargs2check);
        for (i = 1; i < arg_names.length; i++)
        {
            var arg_name = arg_names[i][0];
            $l[arg_name] = args[i-1];
        }
    } else {

        if (arg_names.length > 0)
        {
            $l['self'] = args[0];
        }

        if (varargname !== null) { /* if node.varargs: */
            /* self._varargs_handler(varargname, maxargs1) */
            $l[varargname] = $pyjs_varargs_handler(args, maxargs2, has_kwargs);
        }

        $pyjs_get_vararg_and_kwarg($l, args, kwargname, varargname, argcount1,
                                   maxargs2, minargs2, maxargs2check);
        for (i = 1; i < arg_names.length; i++)
        {
            var arg_name = arg_names[i][0];
            $l[arg_name] = args[i];
        }
    }

    var res = '';
    for (i = 0; i < arg_names.length; i++)
    {
        var arg_name = arg_names[i][0];
        res = res + arg_name + " ";
    }

    console.debug("arg names " + res);

    /* TODO: function arg checking */
    /*
        if arg_names and self.function_argument_checking:
            self.w( """\
if ($pyjs.options.arg_instance_type) {
\tif (%(self)s.__class__.__md5__ !== '%(__md5__)s') {
\t\tif (!@{{_isinstance}}(%(self)s, arguments['callee']['__class__'])) {
\t\t\t$pyjs__exception_func_instance_expected(arguments['callee']['__name__'], arguments['callee']['__class__']['__name__'], %(self)s);
\t\t}
\t}
}\
""" % {'self': arg_names[0], '__md5__': current_klass.__md5__}, output=output)
    */
    $pyjs_default_args_handler($l, args, defaults_count,
                                    has_varargs, has_kwargs);

    var i = 0;
    var res = '';
    for (var k in $l) {
        res = res + k + " ";
    }
    console.debug("arg keys " + res);
    return $l;
}

function $pyjsdf(arg, alternate)
{
    //console.debug("pyjsdf " + arg + " default " + alternate);
    if (typeof arg == 'undefined') {
        return alternate;
    }
    return arg;
}

/* this function mirrors _default_args_handler
 */
function $pyjs_default_args_handler($l, args, defaults_count,
                                    has_varargs, has_kwargs)
{
    /* TODO: pass these in, to save time */
    var callee_args = args.callee.__args__;
    var varargname = callee_args[0];
    var kwargname = callee_args[1];
    var arg_names = callee_args.slice(2);

    if (has_kwargs
        && kwargname !== null
        && typeof $l[kwargname] == 'undefined')
    {
        /*
            # This is necessary when **kwargs in function definition
            # and the call didn't pass the $pykc().
            # See libtest testKwArgsInherit
            # This is not completely safe: if the last element in arguments
            # is an dict and the corresponding argument shoud be a dict and
            # the kwargs should be empty, the kwargs gets incorrectly the
            # dict and the argument becomes undefined.
            # E.g.
            # def fn(a = {}, **kwargs): pass
            # fn({'a':1}) -> a gets undefined and kwargs gets {'a':1}
        */
        $l[kwargname] = $p['__empty_dict']();
        for (var i = arg_names.length-1; i >= 0; --i)
        {
            var arg_name = arg_names[i][0];
            if (typeof $l[arg_name] != 'undefined')
            {
                if($l[arg_name] !== null
                   && typeof $l[arg_name].$pyjs_is_kwarg != 'undefined')
                {
                    $l[kwargname] = $l[arg_name];
                    $l[arg_name] = args[i];
                    break;
                }
            }
        }
    }
    var default_pos = arg_names.length - defaults_count;
    console.debug("default_pos " + default_pos + " count " + defaults_count);
    for (var i = 0; i < defaults_count; i++)
    {
        var default_name = arg_names[default_pos][0];
        console.debug("default_name " + default_name);
        default_pos++;
        if (typeof $l[default_name] == 'undefined')
        {
            $l[default_name] = callee_args[default_pos+1][1];
        }
    }
}

