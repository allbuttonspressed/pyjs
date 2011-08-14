
var $pyjs_array_slice = Array.prototype.slice;

var $pyjs_module_type = {
    toString: function() { return "<type 'module'>"; },
    __class__: null, // will be set by pyjslib once type is defined
    __mro__: null, // will be set by pyjslib once type is defined
    __name__: 'module'
};

function $pyjs_kwargs_call(obj, func, star_args, dstar_args, args, kwargs)
{
    if (obj !== null) {
        if (obj.__is_instance__ === true && obj.hasOwnProperty(func)) {
            func = obj[func];
            obj = null;
        } else {
            func = obj[func];
        }
    }

    if (typeof func != 'function') {
        throw (pyjslib.TypeError(func + ' object is not callable'));
    }

    // Merge dstar_args into kwargs
    if (dstar_args) {
        if (pyjslib.get_pyjs_classtype(dstar_args) != 'dict') {
            throw (pyjslib.TypeError(func.__name__ + "() arguments after ** must be a dictionary " + pyjslib.repr(dstar_args)));
        }
        var i;
        /* use of __iter__ and next is horrendously expensive,
           use direct access to dictionary instead
         */
        for (var keys in dstar_args.__object) {
            var k = dstar_args.__object[keys][0];
            var v = dstar_args.__object[keys][1];

            if (pyjslib.var_remap.indexOf(k) >= 0) {
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
            throw (pyjslib.TypeError(func.__name__ + "() arguments after * must be a sequence" + pyjslib.repr(star_args)));
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
    a = pyjslib.dict(kwargs);
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
    if (typeof pyjslib.TypeError == 'function') {
        throw pyjslib.TypeError(String(msg));
    }
    throw msg;
}

function $pyjs__exception_func_multiple_values(func_name, key) {
    //throw func_name + "() got multiple values for keyword argument '" + key + "'";
    throw pyjslib.TypeError(String(func_name + "() got multiple values for keyword argument '" + key + "'"));
}

function $pyjs__exception_func_unexpected_keyword(func_name, key) {
    //throw func_name + "() got an unexpected keyword argument '" + key + "'";
    throw pyjslib.TypeError(String(func_name + "() got an unexpected keyword argument '" + key + "'"));
}

function $pyjs__exception_func_class_expected(func_name, class_name, instance) {
        if (typeof instance == 'undefined') {
            instance = 'nothing';
        } else if (instance.__is_instance__ == null) {
            instance = "'"+String(instance)+"'";
        } else {
            instance = String(instance);
        }
        //throw "unbound method "+func_name+"() must be called with "+class_name+" class as first argument (got "+instance+" instead)";
        throw pyjslib.TypeError(String("unbound method "+func_name+"() must be called with "+class_name+" class as first argument (got "+instance+" instead)"));
}

function $pyjs_check_instance_type(instance, func, first_arg) {
    var klass = func.__class__;
    if (!$pyjs.options.arg_instance_type || typeof instance.prototype == 'undefined'
            || typeof klass == 'undefined' || func.__is_staticmethod__) {
        return;
    }

    var is_subtype = pyjslib._isinstance;
    if (instance.__is_instance__ === false) {
        if (func.__is_classmethod__ === true) {
            is_subtype = pyjslib.issubclass;
        } else {
            if (typeof first_arg != 'undefined' && first_arg !== null)
                $pyjs_check_instance_type(first_arg, func);
            return;
        }
    }

    if (typeof instance.__is_instance__ != 'undefined'
            && func.__is_instance__ !== false
            && typeof klass != 'undefined'
            && instance.prototype.__md5__ !== klass.__md5__
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
    //throw "unbound method "+func_name+"() must be called with "+class_name+" instance as first argument (got "+instance+" instead)";
    throw pyjslib.TypeError(String("unbound method "+func_name+"() must be called with "+class_name+" instance as first argument (got "+instance+" instead)"));
}

function $pyjs__prepare_func(func_name, func, args) {
    func.__name__ = func.func_name = func_name;
    func.__args__ = args;
    return func;
}

function $pyjs__mro_merge(seqs) {
    var res = new Array();
    var i = 0;
    var cand = null;
    function resolve_error(candidates) {
        //throw "Cannot create a consistent method resolution order (MRO) for bases " + candidates[0].__name__ + ", "+ candidates[1].__name__;
        throw (pyjslib.TypeError("Cannot create a consistent method resolution order (MRO) for bases " + candidates[0].__name__ + ", "+ candidates[1].__name__));
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
        if (cls_fn.__number__ !== null) {
            instance = cls_fn.__new__.apply(null, [cls_fn, arguments[0]]);
            args = arguments;
        } else {
            args = [cls_fn];
            for (i=0; i<arguments.length; i++) {
                args.push(arguments[i]);
            }
            init_args = args;
            var kwargs = null;
            if (arguments.length >= 1) {
                var maybe_kwargs = args[args.length-1];
                if (maybe_kwargs && typeof maybe_kwargs == 'object' && maybe_kwargs.__name__ == 'dict' && typeof maybe_kwargs.$pyjs_is_kwarg != 'undefined') {
                    kwargs = maybe_kwargs.copy();
                    kwargs.$pyjs_is_kwarg = true;
                }
            }
            instance = cls_fn.__new__.apply(null, args);
            if (kwargs != null) {
                args.shift();
                args[args.length-1] = kwargs;
            } else {
                args = arguments;
            }
        }

        var __init__ = instance.__init__;
        var apply_on = instance;
        if (instance.__is_instance__ === false && pyjslib.isinstance(cls_fn, pyjslib.type)) {
            // __metaclass__ returns a class instead of an instance. Don't pass the
            // class via this because otherwise the __init__ function fails to unpack
            // the arguments.
            __init__ = cls_fn.__init__;
            if (init_args !== null) {
                args = init_args;
                args[0] = instance;
            } else {
                args = [instance];
                for (i=0; i<arguments.length; i++) {
                    args.push(arguments[i]);
                }
            }
            apply_on = null;
        }
        if (typeof __init__ == 'function'
                && __init__.__$pyjs_autogenerated__ !== true
                // costly... && pyjslib.isinstance(instance, cls_fn)
                ) {
            if (__init__.apply(apply_on, args) != null) {
                throw pyjslib.TypeError('__init__() should return None');
            }
        }
        return instance;
    };
    cls_fn.__name__ = class_name;
    cls_fn.__module__ = module_name;
    cls_fn.__class__ = pyjslib['type'];
    cls_fn.toString = function() {
        if (this.__is_instance__ === true) {
            if (typeof this.__repr__ == 'function') {
                return this.__repr__();
            }
            if (typeof this.__str__ == 'function') {
                return this.__str__();
            }
        }
        return '<class ' + this.__module__ + '.' + this.__name__ + '>';
    };
    return cls_fn;
}

function $pyjs__class_function(cls_fn, prop, bases) {
    if (typeof cls_fn != 'function') throw "compiler error? $pyjs__class_function: typeof cls_fn != 'function'";
    var class_name = cls_fn.__name__;
    var class_module = cls_fn.__module__;
    cls_fn.__number__ = null;
    var base_mro_list = new Array();
    for (var i = 0; i < bases.length; i++) {
        if (bases[i].__mro__ != null) {
            base_mro_list.push(new Array().concat(bases[i].__mro__));
        } else if (typeof bases[i].__class__ == 'function') {
            base_mro_list.push(new Array().concat([bases[i].__class__]));
        } else if (typeof bases[i].prototype == 'function') {
            base_mro_list.push(new Array().concat([bases[i].prototype]));
        }
    }
    var __mro__ = $pyjs__mro_merge(base_mro_list);

    for (var b = __mro__.length-1; b >= 0; b--) {
        var base = __mro__[b];
        for (var p in base)
            cls_fn[p] = base[p];
    }
    for (var p in prop)
        cls_fn[p] = prop[p];

    if (cls_fn['__new__'] == null) {
      cls_fn['__new__'] = $pyjs__prepare_func('__new__', function(cls) {
        if (cls.__init__.__$pyjs_autogenerated__ && $pyjs.options.arg_count && arguments.length != 1) $pyjs__exception_func_param(arguments.callee.__name__, 1, 1, arguments.length);
        var instance = function () {};
        instance.prototype = cls.prototype;
        instance = new instance();
        instance.__class__ = instance.prototype;
        instance.__dict__ = instance;
        instance.__is_instance__ = true;
        return instance;
      }, ['args', 'kwargs', ['cls']]);
      cls_fn['__new__'].__$pyjs_autogenerated__ = true;
      cls_fn['__new__'].__is_staticmethod__ = true;
    }
    if (cls_fn['__init__'] == null) {
      cls_fn['__init__'] = $pyjs__prepare_func('__init__', function () {
        if (this.__is_instance__ === true) {
            var self = this;
            if ($pyjs.options.arg_count && arguments.length != 0) $pyjs__exception_func_param(arguments.callee.__name__, 1, 1, arguments.length+1);
        } else {
            var self = arguments[0];
            if ($pyjs.options.arg_is_instance && self.__is_instance__ !== true) $pyjs__exception_func_instance_expected(arguments.callee.__name__, arguments.callee.__class__.__name__, self);
            if ($pyjs.options.arg_count && arguments.length != 1) $pyjs__exception_func_param(arguments.callee.__name__, 1, 1, arguments.length);
        }
      }, [null, null, ['self']]);
      cls_fn['__init__'].__$pyjs_autogenerated__ = true;
      cls_fn['__init__'].__class__ = cls_fn;
    }
    cls_fn.__name__ = class_name;
    cls_fn.__module__ = class_module;
    //cls_fn.__mro__ = pyjslib.tuple(new Array(cls_fn).concat(__mro__));
    cls_fn.__mro__ = new Array(cls_fn).concat(__mro__);
    cls_fn.prototype = cls_fn;
    cls_fn.__dict__ = cls_fn;
    cls_fn.__is_instance__ = false;
    cls_fn.__super_classes__ = bases;
    cls_fn.__sub_classes__ = new Array();
    for (var i = 0; i < bases.length; i++) {
        if (typeof bases[i].__sub_classes__ == 'array') {
            bases[i].__sub_classes__.push(cls_fn);
        } else {
            bases[i].__sub_classes__ = new Array();
            bases[i].__sub_classes__.push(cls_fn);
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
    return cls_fn;
}

/* creates a class, derived from bases, with methods and variables */
function $pyjs_type(clsname, bases, methods)
{
    var cls_instance = $pyjs__class_instance(clsname, methods['__module__']);
    var obj = new Object;
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
    pyjslib['tuple']($pyjs_array_slice.call(args, start, end));
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
\tif (%(self)s.prototype.__md5__ !== '%(__md5__)s') {
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
            # and the call didn't pass the pyjs_kwargs_call().
            # See libtest testKwArgsInherit
            # This is not completely safe: if the last element in arguments 
            # is an dict and the corresponding argument shoud be a dict and 
            # the kwargs should be empty, the kwargs gets incorrectly the 
            # dict and the argument becomes undefined.
            # E.g.
            # def fn(a = {}, **kwargs): pass
            # fn({'a':1}) -> a gets undefined and kwargs gets {'a':1}
        */
        $l[kwargname] = pyjslib['__empty_dict']();
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

