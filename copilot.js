(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}




var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log = F2(function(tag, value)
{
	return value;
});

var _Debug_log_UNUSED = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString(value)
{
	return '<internals>';
}

function _Debug_toString_UNUSED(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash_UNUSED(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.bb.au === region.bo.au)
	{
		return 'on line ' + region.bb.au;
	}
	return 'on lines ' + region.bb.au + ' through ' + region.bo.au;
}



// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**_UNUSED/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**_UNUSED/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**/
	if (typeof x.$ === 'undefined')
	//*/
	/**_UNUSED/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0 = 0;
var _Utils_Tuple0_UNUSED = { $: '#0' };

function _Utils_Tuple2(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2_UNUSED(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3_UNUSED(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr(c) { return c; }
function _Utils_chr_UNUSED(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil = { $: 0 };
var _List_Nil_UNUSED = { $: '[]' };

function _List_Cons(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons_UNUSED(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**_UNUSED/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap_UNUSED(value) { return { $: 0, a: value }; }
function _Json_unwrap_UNUSED(value) { return value.a; }

function _Json_wrap(value) { return value; }
function _Json_unwrap(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.cm,
		impl.cG,
		impl.cD,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**_UNUSED/, _Json_errorToString(result.a) /**/);
	var managers = {};
	var initPair = init(result.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**/
	var node = args['node'];
	//*/
	/**_UNUSED/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS
//
// For some reason, tabs can appear in href protocols and it still works.
// So '\tjava\tSCRIPT:alert("!!!")' and 'javascript:alert("!!!")' are the same
// in practice. That is why _VirtualDom_RE_js and _VirtualDom_RE_js_html look
// so freaky.
//
// Pulling the regular expressions out to the top level gives a slight speed
// boost in small benchmarks (4-10%) but hoisting values to reduce allocation
// can be unpredictable in large programs where JIT may have a harder time with
// functions are not fully self-contained. The benefit is more that the js and
// js_html ones are so weird that I prefer to see them near each other.


var _VirtualDom_RE_script = /^script$/i;
var _VirtualDom_RE_on_formAction = /^(on|formAction$)/i;
var _VirtualDom_RE_js = /^\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i;
var _VirtualDom_RE_js_html = /^\s*(j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:|d\s*a\s*t\s*a\s*:\s*t\s*e\s*x\s*t\s*\/\s*h\s*t\s*m\s*l\s*(,|;))/i;


function _VirtualDom_noScript(tag)
{
	return _VirtualDom_RE_script.test(tag) ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return _VirtualDom_RE_on_formAction.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return _VirtualDom_RE_js.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return _VirtualDom_RE_js_html.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlJson(value)
{
	return (typeof _Json_unwrap(value) === 'string' && _VirtualDom_RE_js_html.test(_Json_unwrap(value)))
		? _Json_wrap(
			/**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		) : value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		H: func(record.H),
		bd: record.bd,
		a9: record.a9
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.H;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.bd;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.a9) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.cm,
		impl.cG,
		impl.cD,
		function(sendToApp, initialModel) {
			var view = impl.j;
			/**/
			var domNode = args['node'];
			//*/
			/**_UNUSED/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.cm,
		impl.cG,
		impl.cD,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.ba && impl.ba(sendToApp)
			var view = impl.j;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.aO);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.cF) && (_VirtualDom_doc.title = title = doc.cF);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.cq;
	var onUrlRequest = impl.cr;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		ba: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.bM === next.bM
							&& curr.bu === next.bu
							&& curr.bH.a === next.bH.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		cm: function(flags)
		{
			return A3(impl.cm, flags, _Browser_getUrl(), key);
		},
		j: impl.j,
		cG: impl.cG,
		cD: impl.cD
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { ck: 'hidden', cb: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { ck: 'mozHidden', cb: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { ck: 'msHidden', cb: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { ck: 'webkitHidden', cb: 'webkitvisibilitychange' }
		: { ck: 'hidden', cb: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		bT: _Browser_getScene(),
		b_: {
			b0: _Browser_window.pageXOffset,
			b1: _Browser_window.pageYOffset,
			b$: _Browser_doc.documentElement.clientWidth,
			bt: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		b$: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		bt: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			bT: {
				b$: node.scrollWidth,
				bt: node.scrollHeight
			},
			b_: {
				b0: node.scrollLeft,
				b1: node.scrollTop,
				b$: node.clientWidth,
				bt: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			bT: _Browser_getScene(),
			b_: {
				b0: x,
				b1: y,
				b$: _Browser_doc.documentElement.clientWidth,
				bt: _Browser_doc.documentElement.clientHeight
			},
			ci: {
				b0: x + rect.left,
				b1: y + rect.top,
				b$: rect.width,
				bt: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



function _Time_now(millisToPosix)
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(millisToPosix(Date.now())));
	});
}

var _Time_setInterval = F2(function(interval, task)
{
	return _Scheduler_binding(function(callback)
	{
		var id = setInterval(function() { _Scheduler_rawSpawn(task); }, interval);
		return function() { clearInterval(id); };
	});
});

function _Time_here()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(
			A2($elm$time$Time$customZone, -(new Date().getTimezoneOffset()), _List_Nil)
		));
	});
}


function _Time_getZoneName()
{
	return _Scheduler_binding(function(callback)
	{
		try
		{
			var name = $elm$time$Time$Name(Intl.DateTimeFormat().resolvedOptions().timeZone);
		}
		catch (e)
		{
			var name = $elm$time$Time$Offset(new Date().getTimezoneOffset());
		}
		callback(_Scheduler_succeed(name));
	});
}



// SEND REQUEST

var _Http_toTask = F3(function(router, toTask, request)
{
	return _Scheduler_binding(function(callback)
	{
		function done(response) {
			callback(toTask(request.E.a(response)));
		}

		var xhr = new XMLHttpRequest();
		xhr.addEventListener('error', function() { done($elm$http$Http$NetworkError_); });
		xhr.addEventListener('timeout', function() { done($elm$http$Http$Timeout_); });
		xhr.addEventListener('load', function() { done(_Http_toResponse(request.E.b, xhr)); });
		$elm$core$Maybe$isJust(request.bZ) && _Http_track(router, xhr, request.bZ.a);

		try {
			xhr.open(request.cp, request.L, true);
		} catch (e) {
			return done($elm$http$Http$BadUrl_(request.L));
		}

		_Http_configureRequest(xhr, request);

		request.aO.a && xhr.setRequestHeader('Content-Type', request.aO.a);
		xhr.send(request.aO.b);

		return function() { xhr.c = true; xhr.abort(); };
	});
});


// CONFIGURE

function _Http_configureRequest(xhr, request)
{
	for (var headers = request.bs; headers.b; headers = headers.b) // WHILE_CONS
	{
		xhr.setRequestHeader(headers.a.a, headers.a.b);
	}
	xhr.timeout = request.cE.a || 0;
	xhr.responseType = request.E.d;
	xhr.withCredentials = request.b5;
}


// RESPONSES

function _Http_toResponse(toBody, xhr)
{
	return A2(
		200 <= xhr.status && xhr.status < 300 ? $elm$http$Http$GoodStatus_ : $elm$http$Http$BadStatus_,
		_Http_toMetadata(xhr),
		toBody(xhr.response)
	);
}


// METADATA

function _Http_toMetadata(xhr)
{
	return {
		L: xhr.responseURL,
		cB: xhr.status,
		cC: xhr.statusText,
		bs: _Http_parseHeaders(xhr.getAllResponseHeaders())
	};
}


// HEADERS

function _Http_parseHeaders(rawHeaders)
{
	if (!rawHeaders)
	{
		return $elm$core$Dict$empty;
	}

	var headers = $elm$core$Dict$empty;
	var headerPairs = rawHeaders.split('\r\n');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf(': ');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3($elm$core$Dict$update, key, function(oldValue) {
				return $elm$core$Maybe$Just($elm$core$Maybe$isJust(oldValue)
					? value + ', ' + oldValue.a
					: value
				);
			}, headers);
		}
	}
	return headers;
}


// EXPECT

var _Http_expect = F3(function(type, toBody, toValue)
{
	return {
		$: 0,
		d: type,
		b: toBody,
		a: toValue
	};
});

var _Http_mapExpect = F2(function(func, expect)
{
	return {
		$: 0,
		d: expect.d,
		b: expect.b,
		a: function(x) { return func(expect.a(x)); }
	};
});

function _Http_toDataView(arrayBuffer)
{
	return new DataView(arrayBuffer);
}


// BODY and PARTS

var _Http_emptyBody = { $: 0 };
var _Http_pair = F2(function(a, b) { return { $: 0, a: a, b: b }; });

function _Http_toFormData(parts)
{
	for (var formData = new FormData(); parts.b; parts = parts.b) // WHILE_CONS
	{
		var part = parts.a;
		formData.append(part.a, part.b);
	}
	return formData;
}

var _Http_bytesToBlob = F2(function(mime, bytes)
{
	return new Blob([bytes], { type: mime });
});


// PROGRESS

function _Http_track(router, xhr, tracker)
{
	// TODO check out lengthComputable on loadstart event

	xhr.upload.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Sending({
			cz: event.loaded,
			bV: event.total
		}))));
	});
	xhr.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Receiving({
			cw: event.loaded,
			bV: event.lengthComputable ? $elm$core$Maybe$Just(event.total) : $elm$core$Maybe$Nothing
		}))));
	});
}


var _Bitwise_and = F2(function(a, b)
{
	return a & b;
});

var _Bitwise_or = F2(function(a, b)
{
	return a | b;
});

var _Bitwise_xor = F2(function(a, b)
{
	return a ^ b;
});

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = F2(function(offset, a)
{
	return a << offset;
});

var _Bitwise_shiftRightBy = F2(function(offset, a)
{
	return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function(offset, a)
{
	return a >>> offset;
});
var $elm$core$List$cons = _List_cons;
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === -2) {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Basics$EQ = 1;
var $elm$core$Basics$GT = 2;
var $elm$core$Basics$LT = 0;
var $elm$core$Result$Err = function (a) {
	return {$: 1, a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Basics$False = 1;
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Maybe$Nothing = {$: 1};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 0:
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 1) {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 1:
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 2:
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.c) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.d),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.d);
		} else {
			var treeLen = builder.c * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.e) : builder.e;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.c);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.d) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.d);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{e: nodeList, c: (len / $elm$core$Array$branchFactor) | 0, d: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = 0;
var $elm$core$Result$isOk = function (result) {
	if (!result.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 1, a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = $elm$core$Basics$identity;
var $elm$url$Url$Http = 0;
var $elm$url$Url$Https = 1;
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {bq: fragment, bu: host, bE: path, bH: port_, bM: protocol, bN: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 1) {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		0,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		1,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = $elm$core$Basics$identity;
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return 0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0;
		return A2($elm$core$Task$map, tagger, task);
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			A2($elm$core$Task$map, toMessage, task));
	});
var $elm$browser$Browser$element = _Browser_element;
var $elm$json$Json$Decode$field = _Json_decodeField;
var $author$project$Main$AgentsMsg = function (a) {
	return {$: 14, a: a};
};
var $author$project$Main$AgentsView = 2;
var $author$project$Main$Console = 0;
var $author$project$Main$Conversation = 0;
var $author$project$Main$DesignDoc = 3;
var $author$project$Main$GotZone = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$MissionControl = 1;
var $author$project$Main$MissionMsg = function (a) {
	return {$: 13, a: a};
};
var $author$project$Main$NoCall = {$: 0};
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$time$Time$Name = function (a) {
	return {$: 0, a: a};
};
var $elm$time$Time$Offset = function (a) {
	return {$: 1, a: a};
};
var $elm$time$Time$Zone = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$time$Time$customZone = $elm$time$Time$Zone;
var $elm$time$Time$here = _Time_here(0);
var $author$project$Agents$Connecting = 0;
var $author$project$Agents$GotBand = function (a) {
	return {$: 1, a: a};
};
var $author$project$Agents$BandAgent = F3(
	function (role, handle, ok) {
		return {v: handle, bC: ok, y: role};
	});
var $elm$json$Json$Decode$map3 = _Json_map3;
var $elm$json$Json$Decode$bool = _Json_decodeBool;
var $elm$json$Json$Decode$oneOf = _Json_oneOf;
var $author$project$Agents$optBool = function (name) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, name, $elm$json$Json$Decode$bool),
				$elm$json$Json$Decode$succeed(false)
			]));
};
var $elm$json$Json$Decode$null = _Json_decodeNull;
var $elm$json$Json$Decode$nullable = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				$elm$json$Json$Decode$null($elm$core$Maybe$Nothing),
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, decoder)
			]));
};
var $elm$json$Json$Decode$string = _Json_decodeString;
var $author$project$Agents$optString = function (name) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$field,
				name,
				$elm$json$Json$Decode$nullable($elm$json$Json$Decode$string)),
				$elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing)
			]));
};
var $author$project$Agents$bandAgentDecoder = A4(
	$elm$json$Json$Decode$map3,
	$author$project$Agents$BandAgent,
	A2($elm$json$Json$Decode$field, 'role', $elm$json$Json$Decode$string),
	$author$project$Agents$optString('handle'),
	$author$project$Agents$optBool('ok'));
var $elm$json$Json$Decode$decodeString = _Json_runOnString;
var $elm$http$Http$BadStatus_ = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$http$Http$BadUrl_ = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$GoodStatus_ = F2(
	function (a, b) {
		return {$: 4, a: a, b: b};
	});
var $elm$http$Http$NetworkError_ = {$: 2};
var $elm$http$Http$Receiving = function (a) {
	return {$: 1, a: a};
};
var $elm$http$Http$Sending = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$Timeout_ = {$: 1};
var $elm$core$Dict$RBEmpty_elm_builtin = {$: -2};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$core$Maybe$isJust = function (maybe) {
	if (!maybe.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === -2) {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1) {
					case 0:
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 1:
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Dict$Black = 1;
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: -1, a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = 0;
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === -1) && (!right.a)) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === -1) && (!left.a)) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === -1) && (!left.a)) && (left.d.$ === -1)) && (!left.d.a)) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === -2) {
			return A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1) {
				case 0:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 1:
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === -1) && (dict.d.$ === -1)) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.e.d.$ === -1) && (!dict.e.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.d.d.$ === -1) && (!dict.d.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === -1) && (!left.a)) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === -1) && (right.a === 1)) {
					if (right.d.$ === -1) {
						if (right.d.a === 1) {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === -1) && (dict.d.$ === -1)) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor === 1) {
			if ((lLeft.$ === -1) && (!lLeft.a)) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === -1) {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === -1) && (left.a === 1)) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === -1) && (!lLeft.a)) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === -1) {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === -1) {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === -1) {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _v0 = alter(
			A2($elm$core$Dict$get, targetKey, dictionary));
		if (!_v0.$) {
			var value = _v0.a;
			return A3($elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2($elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $elm$http$Http$expectStringResponse = F2(
	function (toMsg, toResult) {
		return A3(
			_Http_expect,
			'',
			$elm$core$Basics$identity,
			A2($elm$core$Basics$composeR, toResult, toMsg));
	});
var $elm$core$Result$mapError = F2(
	function (f, result) {
		if (!result.$) {
			var v = result.a;
			return $elm$core$Result$Ok(v);
		} else {
			var e = result.a;
			return $elm$core$Result$Err(
				f(e));
		}
	});
var $elm$http$Http$BadBody = function (a) {
	return {$: 4, a: a};
};
var $elm$http$Http$BadStatus = function (a) {
	return {$: 3, a: a};
};
var $elm$http$Http$BadUrl = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$NetworkError = {$: 2};
var $elm$http$Http$Timeout = {$: 1};
var $elm$http$Http$resolve = F2(
	function (toResult, response) {
		switch (response.$) {
			case 0:
				var url = response.a;
				return $elm$core$Result$Err(
					$elm$http$Http$BadUrl(url));
			case 1:
				return $elm$core$Result$Err($elm$http$Http$Timeout);
			case 2:
				return $elm$core$Result$Err($elm$http$Http$NetworkError);
			case 3:
				var metadata = response.a;
				return $elm$core$Result$Err(
					$elm$http$Http$BadStatus(metadata.cB));
			default:
				var body = response.b;
				return A2(
					$elm$core$Result$mapError,
					$elm$http$Http$BadBody,
					toResult(body));
		}
	});
var $elm$http$Http$expectJson = F2(
	function (toMsg, decoder) {
		return A2(
			$elm$http$Http$expectStringResponse,
			toMsg,
			$elm$http$Http$resolve(
				function (string) {
					return A2(
						$elm$core$Result$mapError,
						$elm$json$Json$Decode$errorToString,
						A2($elm$json$Json$Decode$decodeString, decoder, string));
				}));
	});
var $elm$http$Http$emptyBody = _Http_emptyBody;
var $elm$http$Http$Request = function (a) {
	return {$: 1, a: a};
};
var $elm$http$Http$State = F2(
	function (reqs, subs) {
		return {bP: reqs, bW: subs};
	});
var $elm$http$Http$init = $elm$core$Task$succeed(
	A2($elm$http$Http$State, $elm$core$Dict$empty, _List_Nil));
var $elm$core$Process$kill = _Scheduler_kill;
var $elm$core$Process$spawn = _Scheduler_spawn;
var $elm$http$Http$updateReqs = F3(
	function (router, cmds, reqs) {
		updateReqs:
		while (true) {
			if (!cmds.b) {
				return $elm$core$Task$succeed(reqs);
			} else {
				var cmd = cmds.a;
				var otherCmds = cmds.b;
				if (!cmd.$) {
					var tracker = cmd.a;
					var _v2 = A2($elm$core$Dict$get, tracker, reqs);
					if (_v2.$ === 1) {
						var $temp$router = router,
							$temp$cmds = otherCmds,
							$temp$reqs = reqs;
						router = $temp$router;
						cmds = $temp$cmds;
						reqs = $temp$reqs;
						continue updateReqs;
					} else {
						var pid = _v2.a;
						return A2(
							$elm$core$Task$andThen,
							function (_v3) {
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A2($elm$core$Dict$remove, tracker, reqs));
							},
							$elm$core$Process$kill(pid));
					}
				} else {
					var req = cmd.a;
					return A2(
						$elm$core$Task$andThen,
						function (pid) {
							var _v4 = req.bZ;
							if (_v4.$ === 1) {
								return A3($elm$http$Http$updateReqs, router, otherCmds, reqs);
							} else {
								var tracker = _v4.a;
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A3($elm$core$Dict$insert, tracker, pid, reqs));
							}
						},
						$elm$core$Process$spawn(
							A3(
								_Http_toTask,
								router,
								$elm$core$Platform$sendToApp(router),
								req)));
				}
			}
		}
	});
var $elm$http$Http$onEffects = F4(
	function (router, cmds, subs, state) {
		return A2(
			$elm$core$Task$andThen,
			function (reqs) {
				return $elm$core$Task$succeed(
					A2($elm$http$Http$State, reqs, subs));
			},
			A3($elm$http$Http$updateReqs, router, cmds, state.bP));
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (!_v0.$) {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $elm$http$Http$maybeSend = F4(
	function (router, desiredTracker, progress, _v0) {
		var actualTracker = _v0.a;
		var toMsg = _v0.b;
		return _Utils_eq(desiredTracker, actualTracker) ? $elm$core$Maybe$Just(
			A2(
				$elm$core$Platform$sendToApp,
				router,
				toMsg(progress))) : $elm$core$Maybe$Nothing;
	});
var $elm$http$Http$onSelfMsg = F3(
	function (router, _v0, state) {
		var tracker = _v0.a;
		var progress = _v0.b;
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$filterMap,
					A3($elm$http$Http$maybeSend, router, tracker, progress),
					state.bW)));
	});
var $elm$http$Http$Cancel = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$cmdMap = F2(
	function (func, cmd) {
		if (!cmd.$) {
			var tracker = cmd.a;
			return $elm$http$Http$Cancel(tracker);
		} else {
			var r = cmd.a;
			return $elm$http$Http$Request(
				{
					b5: r.b5,
					aO: r.aO,
					E: A2(_Http_mapExpect, func, r.E),
					bs: r.bs,
					cp: r.cp,
					cE: r.cE,
					bZ: r.bZ,
					L: r.L
				});
		}
	});
var $elm$http$Http$MySub = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$http$Http$subMap = F2(
	function (func, _v0) {
		var tracker = _v0.a;
		var toMsg = _v0.b;
		return A2(
			$elm$http$Http$MySub,
			tracker,
			A2($elm$core$Basics$composeR, toMsg, func));
	});
_Platform_effectManagers['Http'] = _Platform_createManager($elm$http$Http$init, $elm$http$Http$onEffects, $elm$http$Http$onSelfMsg, $elm$http$Http$cmdMap, $elm$http$Http$subMap);
var $elm$http$Http$command = _Platform_leaf('Http');
var $elm$http$Http$subscription = _Platform_leaf('Http');
var $elm$http$Http$request = function (r) {
	return $elm$http$Http$command(
		$elm$http$Http$Request(
			{b5: false, aO: r.aO, E: r.E, bs: r.bs, cp: r.cp, cE: r.cE, bZ: r.bZ, L: r.L}));
};
var $elm$http$Http$get = function (r) {
	return $elm$http$Http$request(
		{aO: $elm$http$Http$emptyBody, E: r.E, bs: _List_Nil, cp: 'GET', cE: $elm$core$Maybe$Nothing, bZ: $elm$core$Maybe$Nothing, L: r.L});
};
var $elm$json$Json$Decode$list = _Json_decodeList;
var $author$project$Agents$getBand = function (api) {
	return $elm$http$Http$get(
		{
			E: A2(
				$elm$http$Http$expectJson,
				$author$project$Agents$GotBand,
				A2(
					$elm$json$Json$Decode$field,
					'agents',
					$elm$json$Json$Decode$list($author$project$Agents$bandAgentDecoder))),
			L: api + '/band/status'
		});
};
var $author$project$Agents$GotHealth = function (a) {
	return {$: 0, a: a};
};
var $author$project$Agents$Health = F4(
	function (band, zoowork, zooworkRoles, tavily) {
		return {a2: band, be: tavily, bg: zoowork, b3: zooworkRoles};
	});
var $elm$json$Json$Decode$map4 = _Json_map4;
var $author$project$Agents$healthDecoder = A5(
	$elm$json$Json$Decode$map4,
	$author$project$Agents$Health,
	$author$project$Agents$optBool('band'),
	$author$project$Agents$optBool('zoowork'),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$field,
				'zooworkRoles',
				$elm$json$Json$Decode$list($elm$json$Json$Decode$string)),
				$elm$json$Json$Decode$succeed(_List_Nil)
			])),
	$author$project$Agents$optBool('tavily'));
var $author$project$Agents$getHealth = function (api) {
	return $elm$http$Http$get(
		{
			E: A2($elm$http$Http$expectJson, $author$project$Agents$GotHealth, $author$project$Agents$healthDecoder),
			L: api + '/health'
		});
};
var $author$project$Agents$GotMerchants = function (a) {
	return {$: 2, a: a};
};
var $author$project$Agents$MerchantRef = F3(
	function (id, name, category) {
		return {bj: category, b: id, bA: name};
	});
var $elm$json$Json$Decode$int = _Json_decodeInt;
var $author$project$Agents$merchantDecoder = A4(
	$elm$json$Json$Decode$map3,
	$author$project$Agents$MerchantRef,
	A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$int),
	A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'category', $elm$json$Json$Decode$string),
				$elm$json$Json$Decode$succeed('')
			])));
var $author$project$Agents$getMerchants = function (api) {
	return $elm$http$Http$get(
		{
			E: A2(
				$elm$http$Http$expectJson,
				$author$project$Agents$GotMerchants,
				$elm$json$Json$Decode$list($author$project$Agents$merchantDecoder)),
			L: api + '/merchants'
		});
};
var $author$project$Agents$init = function (api) {
	return _Utils_Tuple2(
		{u: api, aM: _List_Nil, k: '', l: 0, N: $elm$core$Maybe$Nothing, O: 'all', aQ: $elm$core$Maybe$Nothing, p: 1, ay: _List_Nil, T: _List_Nil, a: $elm$core$Maybe$Nothing, W: _List_Nil, J: $elm$core$Maybe$Nothing, X: ''},
		$elm$core$Platform$Cmd$batch(
			_List_fromArray(
				[
					$author$project$Agents$getHealth(api),
					$author$project$Agents$getBand(api),
					$author$project$Agents$getMerchants(api)
				])));
};
var $author$project$Mission$Connecting = 0;
var $author$project$Mission$NoThread = {$: 0};
var $author$project$Mission$GotSnapshot = function (a) {
	return {$: 0, a: a};
};
var $author$project$Mission$Snapshot = F2(
	function (totals, merchants) {
		return {ay: merchants, i: totals};
	});
var $author$project$Mission$Merchant = function (id) {
	return function (name) {
		return function (category) {
			return function (live) {
				return function (openRooms) {
					return function (approvalsWaiting) {
						return function (blockedToday) {
							return function (revenueToday) {
								return function (ordersToday) {
									return function (lastActivity) {
										return function (agents) {
											return {Z: agents, _: approvalsWaiting, ao: blockedToday, bj: category, b: id, bx: lastActivity, av: live, bA: name, aA: openRooms, ct: ordersToday, aD: revenueToday};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$Mission$AgentInfo = F8(
	function (key, handle, name, line, enabled, busy, zoowork, messagesLastHour) {
		return {bi: busy, bn: enabled, v: handle, co: key, au: line, az: messagesLastHour, bA: name, bg: zoowork};
	});
var $author$project$Mission$andMap = $elm$json$Json$Decode$map2($elm$core$Basics$apR);
var $author$project$Mission$boolOr = F2(
	function (_default, name) {
		return $elm$json$Json$Decode$oneOf(
			_List_fromArray(
				[
					A2($elm$json$Json$Decode$field, name, $elm$json$Json$Decode$bool),
					$elm$json$Json$Decode$succeed(_default)
				]));
	});
var $author$project$Mission$intOr0 = function (name) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, name, $elm$json$Json$Decode$int),
				$elm$json$Json$Decode$succeed(0)
			]));
};
var $author$project$Mission$agentDecoder = A2(
	$author$project$Mission$andMap,
	$author$project$Mission$intOr0('messagesLastHour'),
	A2(
		$author$project$Mission$andMap,
		A2($author$project$Mission$boolOr, false, 'zoowork'),
		A2(
			$author$project$Mission$andMap,
			A2($author$project$Mission$boolOr, false, 'busy'),
			A2(
				$author$project$Mission$andMap,
				A2($author$project$Mission$boolOr, true, 'enabled'),
				A2(
					$author$project$Mission$andMap,
					$elm$json$Json$Decode$oneOf(
						_List_fromArray(
							[
								A2($elm$json$Json$Decode$field, 'line', $elm$json$Json$Decode$string),
								$elm$json$Json$Decode$succeed('')
							])),
					A2(
						$author$project$Mission$andMap,
						$elm$json$Json$Decode$oneOf(
							_List_fromArray(
								[
									A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string),
									A2($elm$json$Json$Decode$field, 'handle', $elm$json$Json$Decode$string)
								])),
						A2(
							$author$project$Mission$andMap,
							A2($elm$json$Json$Decode$field, 'handle', $elm$json$Json$Decode$string),
							A2(
								$author$project$Mission$andMap,
								A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string),
								$elm$json$Json$Decode$succeed($author$project$Mission$AgentInfo)))))))));
var $elm$json$Json$Decode$maybe = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, decoder),
				$elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing)
			]));
};
var $author$project$Mission$merchantDecoder = A2(
	$author$project$Mission$andMap,
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$field,
				'agents',
				$elm$json$Json$Decode$list($author$project$Mission$agentDecoder)),
				$elm$json$Json$Decode$succeed(_List_Nil)
			])),
	A2(
		$author$project$Mission$andMap,
		$elm$json$Json$Decode$maybe(
			A2($elm$json$Json$Decode$field, 'lastActivity', $elm$json$Json$Decode$string)),
		A2(
			$author$project$Mission$andMap,
			$author$project$Mission$intOr0('ordersToday'),
			A2(
				$author$project$Mission$andMap,
				$author$project$Mission$intOr0('revenueToday'),
				A2(
					$author$project$Mission$andMap,
					$author$project$Mission$intOr0('blockedToday'),
					A2(
						$author$project$Mission$andMap,
						$author$project$Mission$intOr0('approvalsWaiting'),
						A2(
							$author$project$Mission$andMap,
							$author$project$Mission$intOr0('openRooms'),
							A2(
								$author$project$Mission$andMap,
								A2($author$project$Mission$boolOr, false, 'live'),
								A2(
									$author$project$Mission$andMap,
									$elm$json$Json$Decode$oneOf(
										_List_fromArray(
											[
												A2($elm$json$Json$Decode$field, 'category', $elm$json$Json$Decode$string),
												$elm$json$Json$Decode$succeed('')
											])),
									A2(
										$author$project$Mission$andMap,
										A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string),
										A2(
											$author$project$Mission$andMap,
											A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$int),
											$elm$json$Json$Decode$succeed($author$project$Mission$Merchant))))))))))));
var $author$project$Mission$Totals = F7(
	function (merchants, live, openRooms, messagesLastHour, approvalsWaiting, blockedToday, revenueToday) {
		return {_: approvalsWaiting, ao: blockedToday, av: live, ay: merchants, az: messagesLastHour, aA: openRooms, aD: revenueToday};
	});
var $elm$json$Json$Decode$map7 = _Json_map7;
var $author$project$Mission$totalsDecoder = A8(
	$elm$json$Json$Decode$map7,
	$author$project$Mission$Totals,
	$author$project$Mission$intOr0('merchants'),
	$author$project$Mission$intOr0('live'),
	$author$project$Mission$intOr0('openRooms'),
	$author$project$Mission$intOr0('messagesLastHour'),
	$author$project$Mission$intOr0('approvalsWaiting'),
	$author$project$Mission$intOr0('blockedToday'),
	$author$project$Mission$intOr0('revenueToday'));
var $author$project$Mission$snapshotDecoder = A3(
	$elm$json$Json$Decode$map2,
	$author$project$Mission$Snapshot,
	A2($elm$json$Json$Decode$field, 'totals', $author$project$Mission$totalsDecoder),
	A2(
		$elm$json$Json$Decode$field,
		'merchants',
		$elm$json$Json$Decode$list($author$project$Mission$merchantDecoder)));
var $author$project$Mission$fetchSnapshot = function (api) {
	return $elm$http$Http$get(
		{
			E: A2($elm$http$Http$expectJson, $author$project$Mission$GotSnapshot, $author$project$Mission$snapshotDecoder),
			L: api + '/mission'
		});
};
var $elm$core$Set$Set_elm_builtin = $elm$core$Basics$identity;
var $elm$core$Set$empty = $elm$core$Dict$empty;
var $elm$core$Set$insert = F2(
	function (key, _v0) {
		var dict = _v0;
		return A3($elm$core$Dict$insert, key, 0, dict);
	});
var $elm$core$Set$fromList = function (list) {
	return A3($elm$core$List$foldl, $elm$core$Set$insert, $elm$core$Set$empty, list);
};
var $author$project$Mission$sampleAgents = _List_fromArray(
	[
		A8($author$project$Mission$AgentInfo, 'gatekeeper', '@gatekeeper', 'Gatekeeper', 'Lose less', true, false, false, 4),
		A8($author$project$Mission$AgentInfo, 'concierge', '@concierge', 'Concierge', 'All', true, true, false, 9),
		A8($author$project$Mission$AgentInfo, 'stylist', '@stylist', 'Stylist', 'Sell more', true, false, false, 3),
		A8($author$project$Mission$AgentInfo, 'promo', '@promo', 'Promo engine', 'Sell more', true, false, false, 3),
		A8($author$project$Mission$AgentInfo, 'service', '@service', 'Service', 'Run leaner', true, false, false, 2),
		A8($author$project$Mission$AgentInfo, 'returns', '@returns', 'Risk screener', 'Lose less', true, false, false, 3)
	]);
var $author$project$Mission$sampleMerchants = _List_fromArray(
	[
		$author$project$Mission$Merchant(1)('Linden & Oak')('DTC apparel')(false)(4)(1)(1)(2140)(9)(
		$elm$core$Maybe$Just('10:46'))($author$project$Mission$sampleAgents),
		$author$project$Mission$Merchant(2)('Kiln & Co')('Ceramics')(false)(2)(0)(1)(1272)(5)(
		$elm$core$Maybe$Just('10:52'))($author$project$Mission$sampleAgents)
	]);
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $elm$core$Basics$modBy = _Basics_modBy;
var $elm$core$String$cons = _String_cons;
var $elm$core$String$fromChar = function (_char) {
	return A2($elm$core$String$cons, _char, '');
};
var $elm$core$Bitwise$and = _Bitwise_and;
var $elm$core$Bitwise$shiftRightBy = _Bitwise_shiftRightBy;
var $elm$core$String$repeatHelp = F3(
	function (n, chunk, result) {
		return (n <= 0) ? result : A3(
			$elm$core$String$repeatHelp,
			n >> 1,
			_Utils_ap(chunk, chunk),
			(!(n & 1)) ? result : _Utils_ap(result, chunk));
	});
var $elm$core$String$repeat = F2(
	function (n, chunk) {
		return A3($elm$core$String$repeatHelp, n, chunk, '');
	});
var $elm$core$String$padLeft = F3(
	function (n, _char, string) {
		return _Utils_ap(
			A2(
				$elm$core$String$repeat,
				n - $elm$core$String$length(string),
				$elm$core$String$fromChar(_char)),
			string);
	});
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $elm$core$String$dropRight = F2(
	function (n, string) {
		return (n < 1) ? string : A3($elm$core$String$slice, 0, -n, string);
	});
var $elm$core$String$endsWith = _String_endsWith;
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $elm$core$String$filter = _String_filter;
var $elm$core$List$isEmpty = function (xs) {
	if (!xs.b) {
		return true;
	} else {
		return false;
	}
};
var $elm$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			if (!list.b) {
				return false;
			} else {
				var x = list.a;
				var xs = list.b;
				if (isOkay(x)) {
					return true;
				} else {
					var $temp$isOkay = isOkay,
						$temp$list = xs;
					isOkay = $temp$isOkay;
					list = $temp$list;
					continue any;
				}
			}
		}
	});
var $elm$core$List$member = F2(
	function (x, xs) {
		return A2(
			$elm$core$List$any,
			function (a) {
				return _Utils_eq(a, x);
			},
			xs);
	});
var $elm$core$Dict$member = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$get, key, dict);
		if (!_v0.$) {
			return true;
		} else {
			return false;
		}
	});
var $elm$core$Set$member = F2(
	function (key, _v0) {
		var dict = _v0;
		return A2($elm$core$Dict$member, key, dict);
	});
var $elm$core$Basics$neq = _Utils_notEqual;
var $elm$core$String$words = _String_words;
var $author$project$Mission$recipients = F3(
	function (ours, room, p) {
		var mentioned = A2(
			$elm$core$List$filter,
			function (w) {
				return (!_Utils_eq(w, p.br)) && (A2($elm$core$Set$member, w, ours) || _Utils_eq(w, room.v));
			},
			A2(
				$elm$core$List$map,
				function (w) {
					return A2($elm$core$String$endsWith, '.', w) ? A2($elm$core$String$dropRight, 1, w) : w;
				},
				A2(
					$elm$core$List$map,
					$elm$core$String$filter(
						function (c) {
							return $elm$core$Char$isAlphaNum(c) || A2(
								$elm$core$List$member,
								c,
								_List_fromArray(
									['@', '/', '.', '-', '_']));
						}),
					A2(
						$elm$core$List$filter,
						$elm$core$String$startsWith('@'),
						$elm$core$String$words(p.al)))));
		var _v0 = p.w;
		switch (_v0) {
			case 2:
				return _List_Nil;
			case 1:
				return $elm$core$List$isEmpty(mentioned) ? _List_fromArray(
					['@concierge']) : mentioned;
			default:
				return $elm$core$List$isEmpty(mentioned) ? _List_fromArray(
					[room.v]) : mentioned;
		}
	});
var $author$project$Mission$sampleRole = function (p) {
	var _v0 = p.w;
	switch (_v0) {
		case 1:
			return 'buyer';
		case 2:
			return 'sys';
		default:
			return A2($elm$core$String$startsWith, '@staff', p.br) ? 'staff' : 'agent';
	}
};
var $author$project$Data$Agent = 0;
var $author$project$Data$Bad = 2;
var $author$project$Data$Buyer = 1;
var $author$project$Data$Good = 0;
var $author$project$Data$Sys = 2;
var $author$project$Data$post = F3(
	function (from, kind, text) {
		return {a1: false, M: _List_Nil, br: from, w: kind, a7: $elm$core$Maybe$Nothing, al: text};
	});
var $author$project$Data$Neutral = 3;
var $author$project$Data$Warn = 1;
var $author$project$Data$withCites = F2(
	function (c, m) {
		return _Utils_update(
			m,
			{M: c});
	});
var $author$project$Data$withPayload = F2(
	function (p, m) {
		return _Utils_update(
			m,
			{
				a7: $elm$core$Maybe$Just(p)
			});
	});
var $author$project$Data$rooms = _List_fromArray(
	[
		{
		ap: $elm$core$Maybe$Just('c1'),
		v: '@muse/priya.r',
		b: 'r1',
		as: 'Wool coat under $300, size M, by Friday',
		au: 'Sell more',
		ax: _List_fromArray(
			['@muse/priya.r', '@concierge', '@stylist', '@promo']),
		aB: '10:41',
		a8: 'Muse',
		aC: _List_fromArray(
			[
				A3($author$project$Data$post, '@gatekeeper', 2, 'Verified @muse/priya.r. Band handle known, platform signature valid, 1 session today. Room opened.'),
				A2(
				$author$project$Data$withPayload,
				'{ "type":"intent", "budget_usd":300, "size":"M", "deliver_by":"2026-10-09", "consent":"purchase_upto_300_usd" }',
				A3($author$project$Data$post, '@muse/priya.r', 1, 'Hi. I\'m shopping for Priya Raman. She wants a wool coat in size M, under $300, delivered to Brooklyn by Friday Oct 9.')),
				A3($author$project$Data$post, '@concierge', 0, 'Welcome back. Priya has bought from us 11 times. @stylist, can you suggest coats in M that are in stock in the NY warehouse?'),
				A2(
				$author$project$Data$withCites,
				_List_fromArray(
					['moss · customer/c1 · 4 ms', 'moss · catalog · 6 ms']),
				A3($author$project$Data$post, '@stylist', 0, 'Two fit her history (earth tones, natural fibres, keeps M in outerwear):\n1. Camel wool overcoat, $298, 6 left in M\n2. Charcoal wool-cashmere car coat, $340 (over budget)')),
				A3($author$project$Data$post, '@concierge', 0, '@promo, what\'s the best price on the camel overcoat for a Gold customer?'),
				A2(
				$author$project$Data$withCites,
				_List_fromArray(
					['tavily · competitor price · 820 ms']),
				A2(
					$author$project$Data$withPayload,
					'{ "type":"offer", "offer_id":"of_8812", "sku":"LO-COAT-CAMEL-M", "price":268.00, "list":298.00, "expires_at":"2026-10-03T18:00:00Z" }',
					A3($author$project$Data$post, '@promo', 0, '$268. That\'s the 10% returning-customer rate, inside the margin rule. A comparable coat at a competitor is $289, so this is a fair price.'))),
				A2(
				$author$project$Data$withPayload,
				'{ "type":"cart", "offer_id":"of_8812", "shipping":"express" }',
				A3($author$project$Data$post, '@muse/priya.r', 1, 'Accepting offer of_8812. Express shipping to the address on file, please.'))
			]),
		aH: _Utils_Tuple2('Negotiating', 0)
	},
		{
		ap: $elm$core$Maybe$Just('c2'),
		v: '@dots/agent-7f21',
		b: 'r2',
		as: 'Refund for Chelsea boots, \'wrong size\'',
		au: 'Lose less',
		ax: _List_fromArray(
			['@dots/agent-7f21', '@concierge', '@returns']),
		aB: '10:22',
		a8: 'Dots',
		aC: _List_fromArray(
			[
				A3($author$project$Data$post, '@gatekeeper', 2, 'Verified @dots/agent-7f21. Valid Band handle. Customer risk score is 72, so @returns joined early.'),
				A2(
				$author$project$Data$withPayload,
				'{ "type":"refund_request", "order":"LO-55790", "amount":214.00, "reason":"wrong_size" }',
				A3($author$project$Data$post, '@dots/agent-7f21', 1, 'Marcus Hale would like a full refund for order LO-55790, Chelsea boot size 44. Reason: wrong size.')),
				A2(
				$author$project$Data$withCites,
				_List_fromArray(
					['moss · policy/returns · 5 ms', 'moss · customer/c2 · 4 ms', 'tavily · resale listing · 1.1 s']),
				A3($author$project$Data$post, '@returns', 0, 'Checking against policy and history. This is the 3rd return in 60 days, and the same boot in size 44 was refunded in July. A listing for this exact boot, size 44, is on a resale site posted 2 days ago.')),
				function (m) {
				return _Utils_update(
					m,
					{a1: true});
			}(
				A2(
					$author$project$Data$withPayload,
					'{ "type":"approval_request", "case":"RF-2207", "amount":214.00, "risk":72, "recommend":"deny_refund_offer_exchange" }',
					A3($author$project$Data$post, '@returns', 0, 'Risk 72. My recommendation: decline the refund and offer an exchange for a different size. This needs a person to approve.')))
			]),
		aH: _Utils_Tuple2('Needs approval', 1)
	},
		{
		ap: $elm$core$Maybe$Nothing,
		v: '@shopbot-x9',
		b: 'r3',
		as: '40 × limited \'Field Runner\' sneaker',
		au: 'Lose less',
		ax: _List_fromArray(
			['@shopbot-x9', '@gatekeeper']),
		aB: '10:37',
		a8: 'Unverified',
		aC: _List_fromArray(
			[
				A2(
				$author$project$Data$withPayload,
				'{ "type":"intent", "platform":"muse", "signature":null, "qty":40 }',
				A3($author$project$Data$post, '@shopbot-x9', 1, 'I am a Muse shopping agent. Purchase 40 units of Field Runner sneaker, all sizes, ship to 12 different addresses.')),
				A2(
				$author$project$Data$withCites,
				_List_fromArray(
					['tavily · operator lookup · 940 ms']),
				A3($author$project$Data$post, '@gatekeeper', 2, 'Checks failed:\n• Claims Muse, but no platform signature\n• Handle created 3 hours ago\n• 212 requests in 10 minutes from 9 handles that share an operator\n• Tavily: operator domain appears in a sneaker-reseller bot forum')),
				A3($author$project$Data$post, '@gatekeeper', 2, 'Blocked. The room is closed and the handle is on the deny list for 30 days. Nothing was reserved.')
			]),
		aH: _Utils_Tuple2('Blocked', 2)
	},
		{
		ap: $elm$core$Maybe$Just('c3'),
		v: '@dots/agent-02aa',
		b: 'r4',
		as: 'Where is order LO-55812?',
		au: 'Run leaner',
		ax: _List_fromArray(
			['@dots/agent-02aa', '@concierge', '@service']),
		aB: '10:45',
		a8: 'Dots',
		aC: _List_fromArray(
			[
				A3($author$project$Data$post, '@gatekeeper', 2, 'Verified @dots/agent-02aa. Room opened.'),
				A2(
				$author$project$Data$withPayload,
				'{ "type":"question", "order":"LO-55812", "need_by":"2026-10-06" }',
				A3($author$project$Data$post, '@dots/agent-02aa', 1, 'Dana Kim\'s olive quilted vest (LO-55812) was due Oct 1. Where is it? She needs it for a trip on Oct 6.')),
				A2(
				$author$project$Data$withPayload,
				'{ "type":"offer", "action":"overnight_replacement", "cost_to_customer":0 }',
				A2(
					$author$project$Data$withCites,
					_List_fromArray(
						['moss · customer/c3 · 3 ms', 'moss · policy/late-delivery · 5 ms']),
					A3($author$project$Data$post, '@service', 0, 'It\'s held at the carrier\'s Dallas hub. The current estimate is Oct 5, one day before her trip. I can send a replacement by overnight shipping today at no cost, and she can refuse the late parcel on arrival.'))),
				A3($author$project$Data$post, '@dots/agent-02aa', 1, 'Dana wants to hear this from a person before she agrees. Can someone call her?')
			]),
		aH: _Utils_Tuple2('Service', 3)
	}
	]);
var $author$project$Mission$sampleRooms = _Utils_ap(
	A2(
		$elm$core$List$map,
		function (r) {
			return _Utils_Tuple3(1, 'Linden & Oak', r);
		},
		$author$project$Data$rooms),
	_List_fromArray(
		[
			_Utils_Tuple3(
			2,
			'Kiln & Co',
			{
				ap: $elm$core$Maybe$Nothing,
				v: '@dots/agent-91c2',
				b: 'k1',
				as: 'Four speckled stoneware mugs, gift wrapped',
				au: 'Sell more',
				ax: _List_fromArray(
					['@dots/agent-91c2', '@concierge', '@stylist', '@promo']),
				aB: '10:49',
				a8: 'Dots',
				aC: _List_fromArray(
					[
						A3($author$project$Data$post, '@gatekeeper', 2, 'Verified @dots/agent-91c2. Room opened.'),
						A3($author$project$Data$post, '@dots/agent-91c2', 1, 'Looking for a set of four speckled stoneware mugs as a wedding gift, under $120, gift wrapped.'),
						A3($author$project$Data$post, '@concierge', 0, '@stylist, which mug sets do we have four of in the speckled glaze?'),
						{
						a1: false,
						M: _List_fromArray(
							['moss · catalog · 5 ms']),
						br: '@stylist',
						w: 0,
						a7: $elm$core$Maybe$Nothing,
						al: 'The Oatmeal Speckle mug, 12 oz: 23 in stock, $28 each. It\'s the most-gifted item this month.'
					},
						A3($author$project$Data$post, '@concierge', 0, '@promo, can we bundle four with gift wrap?'),
						{
						a1: false,
						M: _List_fromArray(
							['tavily · competitor price · 760 ms']),
						br: '@promo',
						w: 0,
						a7: $elm$core$Maybe$Just('{ "type":"offer", "sku":"KC-MUG-OAT-x4", "price":104.00, "list":112.00 }'),
						al: 'Set of four for $104, gift wrap included. That\'s inside the bundle margin rule.'
					},
						A3($author$project$Data$post, '@dots/agent-91c2', 1, 'Accepting. Please include a card that says \"For Sam and Jo\".')
					]),
				aH: _Utils_Tuple2('Negotiating', 0)
			}),
			_Utils_Tuple3(
			2,
			'Kiln & Co',
			{
				ap: $elm$core$Maybe$Nothing,
				v: '@mugflip-22',
				b: 'k2',
				as: '60 × limited ash-glaze plates',
				au: 'Lose less',
				ax: _List_fromArray(
					['@mugflip-22', '@gatekeeper']),
				aB: '10:52',
				a8: 'Unverified',
				aC: _List_fromArray(
					[
						A3($author$project$Data$post, '@mugflip-22', 1, 'Buy 60 ash-glaze plates, the limited run. Ship to 15 addresses.'),
						{
						a1: false,
						M: _List_fromArray(
							['tavily · operator lookup · 880 ms']),
						br: '@gatekeeper',
						w: 2,
						a7: $elm$core$Maybe$Nothing,
						al: 'No platform signature. Handle 2 hours old. Tavily: operator resells limited ceramics. Blocked for 30 days.'
					}
					]),
				aH: _Utils_Tuple2('Blocked', 2)
			})
		]));
var $elm$core$List$sortBy = _List_sortBy;
var $author$project$Mission$sampleWire = function () {
	var ours = $elm$core$Set$fromList(
		_List_fromArray(
			['@gatekeeper', '@concierge', '@stylist', '@promo', '@service', '@returns']));
	var items = A2(
		$elm$core$List$concatMap,
		function (_v0) {
			var mid = _v0.a;
			var mname = _v0.b;
			var r = _v0.c;
			return A2(
				$elm$core$List$indexedMap,
				F2(
					function (i, p) {
						return {
							M: p.M,
							br: p.br,
							ar: $author$project$Mission$sampleRole(p),
							b: 0,
							p: mname,
							ag: mid,
							a8: r.a8,
							aE: r.b,
							bS: r.au,
							z: $elm$core$Maybe$Just('sim'),
							al: p.al,
							bY: r.aB + (':' + A3(
								$elm$core$String$padLeft,
								2,
								'0',
								$elm$core$String$fromInt(
									A2($elm$core$Basics$modBy, 60, i * 9)))),
							g: A3($author$project$Mission$recipients, ours, r, p)
						};
					}),
				r.aC);
		},
		$author$project$Mission$sampleRooms);
	return $elm$core$List$reverse(
		A2(
			$elm$core$List$indexedMap,
			F2(
				function (i, item) {
					return _Utils_update(
						item,
						{b: i + 1});
				}),
			A2(
				$elm$core$List$sortBy,
				function ($) {
					return $.bY;
				},
				items)));
}();
var $author$project$Mission$sampleTotals = {
	_: 1,
	ao: 2,
	av: 0,
	ay: 2,
	az: $elm$core$List$length($author$project$Mission$sampleWire),
	aA: 6,
	aD: 3412
};
var $author$project$Mission$init = function (api) {
	return _Utils_Tuple2(
		{
			u: api,
			l: 0,
			F: $elm$core$Maybe$Nothing,
			G: $elm$core$Set$fromList(
				_List_fromArray(
					['across', 'inside', 'staff'])),
			q: $elm$core$Maybe$Nothing,
			ay: $author$project$Mission$sampleMerchants,
			R: false,
			t: _List_Nil,
			S: '',
			aG: '',
			aY: $elm$core$Maybe$Nothing,
			J: $author$project$Mission$NoThread,
			i: $author$project$Mission$sampleTotals,
			h: $author$project$Mission$sampleWire
		},
		$author$project$Mission$fetchSnapshot(api));
};
var $author$project$Data$LogEntry = F5(
	function (time, agent, decision, basis, version) {
		return {b4: agent, b9: basis, bm: decision, bY: time, cH: version};
	});
var $author$project$Data$log = _List_fromArray(
	[
		A5($author$project$Data$LogEntry, '10:46', '@promo', 'Offered $268 (10% off) on the camel overcoat', 'Gold tier, margin rule, Tavily price', 'promo@a41c9e'),
		A5($author$project$Data$LogEntry, '10:37', '@gatekeeper', 'Blocked @shopbot-x9 for 30 days', 'No signature, rate, Tavily lookup', 'gatekeeper@7d02b1'),
		A5($author$project$Data$LogEntry, '10:25', '@returns', 'Sent RF-2207 for human approval', 'Risk 72 > 60, amount > $150', 'returns@c18f40'),
		A5($author$project$Data$LogEntry, '10:46', '@service', 'Offered free overnight replacement', 'Late-delivery policy, trip date', 'service@5e9a77'),
		A5($author$project$Data$LogEntry, '09:40', '@returns', 'Auto-approved RF-2196 as an exchange', 'Risk 6, inside 30 days', 'returns@c18f40')
	]);
var $elm$core$Platform$Cmd$map = _Platform_map;
var $author$project$Data$Refund = F8(
	function (id, cust, order, amt, risk, rec, why, decision) {
		return {b7: amt, cf: cust, bm: decision, b: id, bD: order, cv: rec, ai: risk, cJ: why};
	});
var $author$project$Data$refunds = _List_fromArray(
	[
		A8(
		$author$project$Data$Refund,
		'RF-2207',
		'Marcus Hale',
		'LO-55790',
		214,
		72,
		'Deny, offer exchange',
		_List_fromArray(
			['3rd return in 60 days', 'Same item on a resale site', 'Ships to a freight forwarder']),
		$elm$core$Maybe$Nothing),
		A8(
		$author$project$Data$Refund,
		'RF-2204',
		'Owen Brandt',
		'LO-55611',
		182,
		31,
		'Approve',
		_List_fromArray(
			['Damaged in transit, photo attached', 'First return']),
		$elm$core$Maybe$Nothing),
		A8(
		$author$project$Data$Refund,
		'RF-2201',
		'Lena Ortiz',
		'LO-55490',
		96,
		64,
		'Ask for photo',
		_List_fromArray(
			['\'Item not received\' but carrier shows signed', '2 similar claims this year']),
		$elm$core$Maybe$Nothing),
		A8(
		$author$project$Data$Refund,
		'RF-2196',
		'Priya Raman',
		'LO-49903',
		210,
		6,
		'Exchange',
		_List_fromArray(
			['Size swap, inside 30 days']),
		$elm$core$Maybe$Just('Auto-approved'))
	]);
var $author$project$Main$NoOp = {$: 0};
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $elm$core$Task$onError = _Scheduler_onError;
var $elm$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return $elm$core$Task$command(
			A2(
				$elm$core$Task$onError,
				A2(
					$elm$core$Basics$composeL,
					A2($elm$core$Basics$composeL, $elm$core$Task$succeed, resultToMessage),
					$elm$core$Result$Err),
				A2(
					$elm$core$Task$andThen,
					A2(
						$elm$core$Basics$composeL,
						A2($elm$core$Basics$composeL, $elm$core$Task$succeed, resultToMessage),
						$elm$core$Result$Ok),
					task)));
	});
var $elm$browser$Browser$Dom$setViewportOf = _Browser_setViewportOf;
var $author$project$Main$scrollToEnd = function (id) {
	return A2(
		$elm$core$Task$attempt,
		function (_v0) {
			return $author$project$Main$NoOp;
		},
		A3($elm$browser$Browser$Dom$setViewportOf, id, 0, 1.0e9));
};
var $elm$time$Time$utc = A2($elm$time$Time$Zone, 0, _List_Nil);
var $author$project$Main$init = function (flags) {
	var startView = (A2($elm$core$String$startsWith, '#d-', flags.af) || ((flags.af === '#design') || (flags.aF === 'design'))) ? 3 : (((flags.af === '#mission') || (flags.aF === 'mission')) ? 1 : (((flags.af === '#agents') || (flags.aF === 'agents')) ? 2 : 0));
	var _v0 = $author$project$Mission$init(flags.u);
	var mission = _v0.a;
	var missionCmd = _v0.b;
	var _v1 = $author$project$Agents$init(flags.u);
	var agents = _v1.a;
	var agentsCmd = _v1.b;
	return _Utils_Tuple2(
		{Z: agents, o: $author$project$Main$NoCall, k: '', D: 'r1', aw: $author$project$Data$log, ah: mission, V: $author$project$Data$refunds, W: $author$project$Data$rooms, A: 0, j: startView, a0: $elm$time$Time$utc},
		$elm$core$Platform$Cmd$batch(
			_List_fromArray(
				[
					A2($elm$core$Task$perform, $author$project$Main$GotZone, $elm$time$Time$here),
					$author$project$Main$scrollToEnd('feed'),
					A2($elm$core$Platform$Cmd$map, $author$project$Main$MissionMsg, missionCmd),
					A2($elm$core$Platform$Cmd$map, $author$project$Main$AgentsMsg, agentsCmd)
				])));
};
var $author$project$Main$CallTick = {$: 11};
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $elm$time$Time$Every = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$time$Time$State = F2(
	function (taggers, processes) {
		return {bK: processes, bX: taggers};
	});
var $elm$time$Time$init = $elm$core$Task$succeed(
	A2($elm$time$Time$State, $elm$core$Dict$empty, $elm$core$Dict$empty));
var $elm$time$Time$addMySub = F2(
	function (_v0, state) {
		var interval = _v0.a;
		var tagger = _v0.b;
		var _v1 = A2($elm$core$Dict$get, interval, state);
		if (_v1.$ === 1) {
			return A3(
				$elm$core$Dict$insert,
				interval,
				_List_fromArray(
					[tagger]),
				state);
		} else {
			var taggers = _v1.a;
			return A3(
				$elm$core$Dict$insert,
				interval,
				A2($elm$core$List$cons, tagger, taggers),
				state);
		}
	});
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === -2) {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _v0) {
				stepState:
				while (true) {
					var list = _v0.a;
					var result = _v0.b;
					if (!list.b) {
						return _Utils_Tuple2(
							list,
							A3(rightStep, rKey, rValue, result));
					} else {
						var _v2 = list.a;
						var lKey = _v2.a;
						var lValue = _v2.b;
						var rest = list.b;
						if (_Utils_cmp(lKey, rKey) < 0) {
							var $temp$rKey = rKey,
								$temp$rValue = rValue,
								$temp$_v0 = _Utils_Tuple2(
								rest,
								A3(leftStep, lKey, lValue, result));
							rKey = $temp$rKey;
							rValue = $temp$rValue;
							_v0 = $temp$_v0;
							continue stepState;
						} else {
							if (_Utils_cmp(lKey, rKey) > 0) {
								return _Utils_Tuple2(
									list,
									A3(rightStep, rKey, rValue, result));
							} else {
								return _Utils_Tuple2(
									rest,
									A4(bothStep, lKey, lValue, rValue, result));
							}
						}
					}
				}
			});
		var _v3 = A3(
			$elm$core$Dict$foldl,
			stepState,
			_Utils_Tuple2(
				$elm$core$Dict$toList(leftDict),
				initialResult),
			rightDict);
		var leftovers = _v3.a;
		var intermediateResult = _v3.b;
		return A3(
			$elm$core$List$foldl,
			F2(
				function (_v4, result) {
					var k = _v4.a;
					var v = _v4.b;
					return A3(leftStep, k, v, result);
				}),
			intermediateResult,
			leftovers);
	});
var $elm$time$Time$setInterval = _Time_setInterval;
var $elm$time$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		if (!intervals.b) {
			return $elm$core$Task$succeed(processes);
		} else {
			var interval = intervals.a;
			var rest = intervals.b;
			var spawnTimer = $elm$core$Process$spawn(
				A2(
					$elm$time$Time$setInterval,
					interval,
					A2($elm$core$Platform$sendToSelf, router, interval)));
			var spawnRest = function (id) {
				return A3(
					$elm$time$Time$spawnHelp,
					router,
					rest,
					A3($elm$core$Dict$insert, interval, id, processes));
			};
			return A2($elm$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var $elm$time$Time$onEffects = F3(
	function (router, subs, _v0) {
		var processes = _v0.bK;
		var rightStep = F3(
			function (_v6, id, _v7) {
				var spawns = _v7.a;
				var existing = _v7.b;
				var kills = _v7.c;
				return _Utils_Tuple3(
					spawns,
					existing,
					A2(
						$elm$core$Task$andThen,
						function (_v5) {
							return kills;
						},
						$elm$core$Process$kill(id)));
			});
		var newTaggers = A3($elm$core$List$foldl, $elm$time$Time$addMySub, $elm$core$Dict$empty, subs);
		var leftStep = F3(
			function (interval, taggers, _v4) {
				var spawns = _v4.a;
				var existing = _v4.b;
				var kills = _v4.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, interval, spawns),
					existing,
					kills);
			});
		var bothStep = F4(
			function (interval, taggers, id, _v3) {
				var spawns = _v3.a;
				var existing = _v3.b;
				var kills = _v3.c;
				return _Utils_Tuple3(
					spawns,
					A3($elm$core$Dict$insert, interval, id, existing),
					kills);
			});
		var _v1 = A6(
			$elm$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			processes,
			_Utils_Tuple3(
				_List_Nil,
				$elm$core$Dict$empty,
				$elm$core$Task$succeed(0)));
		var spawnList = _v1.a;
		var existingDict = _v1.b;
		var killTask = _v1.c;
		return A2(
			$elm$core$Task$andThen,
			function (newProcesses) {
				return $elm$core$Task$succeed(
					A2($elm$time$Time$State, newTaggers, newProcesses));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v2) {
					return A3($elm$time$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var $elm$time$Time$Posix = $elm$core$Basics$identity;
var $elm$time$Time$millisToPosix = $elm$core$Basics$identity;
var $elm$time$Time$now = _Time_now($elm$time$Time$millisToPosix);
var $elm$time$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _v0 = A2($elm$core$Dict$get, interval, state.bX);
		if (_v0.$ === 1) {
			return $elm$core$Task$succeed(state);
		} else {
			var taggers = _v0.a;
			var tellTaggers = function (time) {
				return $elm$core$Task$sequence(
					A2(
						$elm$core$List$map,
						function (tagger) {
							return A2(
								$elm$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						taggers));
			};
			return A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$succeed(state);
				},
				A2($elm$core$Task$andThen, tellTaggers, $elm$time$Time$now));
		}
	});
var $elm$time$Time$subMap = F2(
	function (f, _v0) {
		var interval = _v0.a;
		var tagger = _v0.b;
		return A2(
			$elm$time$Time$Every,
			interval,
			A2($elm$core$Basics$composeL, f, tagger));
	});
_Platform_effectManagers['Time'] = _Platform_createManager($elm$time$Time$init, $elm$time$Time$onEffects, $elm$time$Time$onSelfMsg, 0, $elm$time$Time$subMap);
var $elm$time$Time$subscription = _Platform_leaf('Time');
var $elm$time$Time$every = F2(
	function (interval, tagger) {
		return $elm$time$Time$subscription(
			A2($elm$time$Time$Every, interval, tagger));
	});
var $elm$core$Platform$Sub$map = _Platform_map;
var $elm$core$Platform$Sub$none = $elm$core$Platform$Sub$batch(_List_Nil);
var $author$project$Agents$Poll = {$: 16};
var $author$project$Agents$Retry = {$: 17};
var $author$project$Agents$subscriptions = function (model) {
	var _v0 = model.l;
	if (_v0 === 1) {
		return $elm$core$Platform$Sub$batch(
			_List_fromArray(
				[
					A2(
					$elm$time$Time$every,
					3000,
					function (_v1) {
						return $author$project$Agents$Poll;
					}),
					A2(
					$elm$time$Time$every,
					20000,
					function (_v2) {
						return $author$project$Agents$Retry;
					})
				]));
	} else {
		return A2(
			$elm$time$Time$every,
			10000,
			function (_v3) {
				return $author$project$Agents$Retry;
			});
	}
};
var $author$project$Mission$Live = 1;
var $author$project$Mission$Poll = {$: 6};
var $author$project$Mission$Polling = 2;
var $author$project$Mission$RefreshLinks = {$: 8};
var $author$project$Mission$Retry = {$: 7};
var $author$project$Mission$StreamEvent = function (a) {
	return {$: 5, a: a};
};
var $author$project$Mission$StreamStatus = function (a) {
	return {$: 4, a: a};
};
var $elm$json$Json$Decode$value = _Json_decodeValue;
var $author$project$Mission$missionEvent = _Platform_incomingPort('missionEvent', $elm$json$Json$Decode$value);
var $author$project$Mission$missionStatus = _Platform_incomingPort('missionStatus', $elm$json$Json$Decode$string);
var $author$project$Mission$subscriptions = function (model) {
	return $elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				$author$project$Mission$missionEvent($author$project$Mission$StreamEvent),
				$author$project$Mission$missionStatus($author$project$Mission$StreamStatus),
				function () {
				var _v0 = model.l;
				switch (_v0) {
					case 3:
						return A2(
							$elm$time$Time$every,
							10000,
							function (_v1) {
								return $author$project$Mission$Retry;
							});
					case 2:
						return A2(
							$elm$time$Time$every,
							3000,
							function (_v2) {
								return $author$project$Mission$Poll;
							});
					default:
						return $elm$core$Platform$Sub$none;
				}
			}(),
				((model.l === 1) || (model.l === 2)) ? A2(
				$elm$time$Time$every,
				15000,
				function (_v3) {
					return $author$project$Mission$RefreshLinks;
				}) : $elm$core$Platform$Sub$none
			]));
};
var $author$project$Main$subscriptions = function (model) {
	return $elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				function () {
				var _v0 = model.o;
				if (_v0.$ === 1) {
					return A2(
						$elm$time$Time$every,
						1600,
						function (_v1) {
							return $author$project$Main$CallTick;
						});
				} else {
					return $elm$core$Platform$Sub$none;
				}
			}(),
				A2(
				$elm$core$Platform$Sub$map,
				$author$project$Main$MissionMsg,
				$author$project$Mission$subscriptions(model.ah)),
				(model.j === 2) ? A2(
				$elm$core$Platform$Sub$map,
				$author$project$Main$AgentsMsg,
				$author$project$Agents$subscriptions(model.Z)) : $elm$core$Platform$Sub$none
			]));
};
var $author$project$Main$Decided = F3(
	function (a, b, c) {
		return {$: 6, a: a, b: b, c: c};
	});
var $author$project$Main$OnCall = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$addPost = F2(
	function (m, r) {
		return _Utils_update(
			r,
			{
				aC: _Utils_ap(
					r.aC,
					_List_fromArray(
						[m]))
			});
	});
var $author$project$Main$pad = A2(
	$elm$core$Basics$composeR,
	$elm$core$String$fromInt,
	A2($elm$core$String$padLeft, 2, '0'));
var $elm$time$Time$flooredDiv = F2(
	function (numerator, denominator) {
		return $elm$core$Basics$floor(numerator / denominator);
	});
var $elm$time$Time$posixToMillis = function (_v0) {
	var millis = _v0;
	return millis;
};
var $elm$time$Time$toAdjustedMinutesHelp = F3(
	function (defaultOffset, posixMinutes, eras) {
		toAdjustedMinutesHelp:
		while (true) {
			if (!eras.b) {
				return posixMinutes + defaultOffset;
			} else {
				var era = eras.a;
				var olderEras = eras.b;
				if (_Utils_cmp(era.bb, posixMinutes) < 0) {
					return posixMinutes + era.bB;
				} else {
					var $temp$defaultOffset = defaultOffset,
						$temp$posixMinutes = posixMinutes,
						$temp$eras = olderEras;
					defaultOffset = $temp$defaultOffset;
					posixMinutes = $temp$posixMinutes;
					eras = $temp$eras;
					continue toAdjustedMinutesHelp;
				}
			}
		}
	});
var $elm$time$Time$toAdjustedMinutes = F2(
	function (_v0, time) {
		var defaultOffset = _v0.a;
		var eras = _v0.b;
		return A3(
			$elm$time$Time$toAdjustedMinutesHelp,
			defaultOffset,
			A2(
				$elm$time$Time$flooredDiv,
				$elm$time$Time$posixToMillis(time),
				60000),
			eras);
	});
var $elm$time$Time$toHour = F2(
	function (zone, time) {
		return A2(
			$elm$core$Basics$modBy,
			24,
			A2(
				$elm$time$Time$flooredDiv,
				A2($elm$time$Time$toAdjustedMinutes, zone, time),
				60));
	});
var $elm$time$Time$toMinute = F2(
	function (zone, time) {
		return A2(
			$elm$core$Basics$modBy,
			60,
			A2($elm$time$Time$toAdjustedMinutes, zone, time));
	});
var $author$project$Main$clock = F2(
	function (zone, t) {
		return $author$project$Main$pad(
			A2($elm$time$Time$toHour, zone, t)) + (':' + $author$project$Main$pad(
			A2($elm$time$Time$toMinute, zone, t)));
	});
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (!maybeValue.$) {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $author$project$Data$CallLine = F3(
	function (who, text, cite) {
		return {cd: cite, al: text, cI: who};
	});
var $author$project$Data$callScript = function (customerId) {
	switch (customerId) {
		case 'c3':
			return _List_fromArray(
				[
					A3($author$project$Data$CallLine, 'Agent', 'Hi Dana, this is Linden & Oak calling about your olive quilted vest.', $elm$core$Maybe$Nothing),
					A3($author$project$Data$CallLine, 'Dana', 'Yes, it was supposed to come Wednesday.', $elm$core$Maybe$Nothing),
					A3(
					$author$project$Data$CallLine,
					'Agent',
					'I\'m sorry about that. It\'s held at the carrier\'s Dallas hub and now looks like Sunday, the day before your trip.',
					$elm$core$Maybe$Just('moss · customer/c3 · 3 ms')),
					A3($author$project$Data$CallLine, 'Dana', 'I fly out Tuesday morning, so that\'s too close.', $elm$core$Maybe$Nothing),
					A3(
					$author$project$Data$CallLine,
					'Agent',
					'I can send a new one overnight today, free. It would arrive tomorrow. If the first one turns up, just refuse it at the door.',
					$elm$core$Maybe$Just('moss · policy/late-delivery · 5 ms')),
					A3($author$project$Data$CallLine, 'Dana', 'Okay, please do that.', $elm$core$Maybe$Nothing),
					A3($author$project$Data$CallLine, 'Agent', 'Done. The replacement order is LO-56133, and the tracking link is in your email.', $elm$core$Maybe$Nothing)
				]);
		case 'c1':
			return _List_fromArray(
				[
					A3($author$project$Data$CallLine, 'Agent', 'Hi Priya, it\'s Linden & Oak. Your shopping agent picked out our camel overcoat in M. Want me to confirm the fit?', $elm$core$Maybe$Nothing),
					A3($author$project$Data$CallLine, 'Priya', 'Sure, is it roomy enough for a sweater?', $elm$core$Maybe$Nothing),
					A3(
					$author$project$Data$CallLine,
					'Agent',
					'Yes. It\'s cut with about 4 inches of ease at the chest. Your last coat from us in M was kept, so M should work.',
					$elm$core$Maybe$Just('moss · catalog · 4 ms')),
					A3($author$project$Data$CallLine, 'Priya', 'Great, go ahead.', $elm$core$Maybe$Nothing)
				]);
		case 'c2':
			return _List_fromArray(
				[
					A3($author$project$Data$CallLine, 'Agent', 'Hi Marcus, this is Linden & Oak about your return for the Chelsea boots.', $elm$core$Maybe$Nothing),
					A3($author$project$Data$CallLine, 'Marcus', 'I just want my money back.', $elm$core$Maybe$Nothing),
					A3(
					$author$project$Data$CallLine,
					'Agent',
					'I understand. For this order we can offer an exchange to another size, with free shipping both ways.',
					$elm$core$Maybe$Just('moss · policy/returns · 5 ms')),
					A3($author$project$Data$CallLine, 'Marcus', 'Fine, I\'ll think about it.', $elm$core$Maybe$Nothing)
				]);
		default:
			return _List_Nil;
	}
};
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Main$currentRoom = function (model) {
	return $elm$core$List$head(
		A2(
			$elm$core$List$filter,
			function (r) {
				return _Utils_eq(r.b, model.D);
			},
			model.W));
};
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$Main$currentScript = function (model) {
	return A2(
		$elm$core$Maybe$withDefault,
		_List_Nil,
		A2(
			$elm$core$Maybe$map,
			$author$project$Data$callScript,
			A2(
				$elm$core$Maybe$andThen,
				function ($) {
					return $.ap;
				},
				$author$project$Main$currentRoom(model))));
};
var $author$project$Main$CallEnded = {$: 2};
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $author$project$Main$updateRoom = F3(
	function (id, f, model) {
		return _Utils_update(
			model,
			{
				W: A2(
					$elm$core$List$map,
					function (r) {
						return _Utils_eq(r.b, id) ? f(r) : r;
					},
					model.W)
			});
	});
var $author$project$Main$endCall = function (model) {
	var _v0 = model.o;
	if (_v0.$ === 1) {
		return _Utils_Tuple2(
			A3(
				$author$project$Main$updateRoom,
				model.D,
				$author$project$Main$addPost(
					function (m) {
						return _Utils_update(
							m,
							{
								M: _List_fromArray(
									['voice · 1 call · moss lookups 3'])
							});
					}(
						A3($author$project$Data$post, '@service', 2, 'Phone call finished. Transcript attached to this room.'))),
				_Utils_update(
					model,
					{o: $author$project$Main$CallEnded})),
			$author$project$Main$scrollToEnd('feed'));
	} else {
		return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
	}
};
var $elm$browser$Browser$Dom$focus = _Browser_call('focus');
var $elm$core$Basics$ge = _Utils_ge;
var $author$project$Main$joinStaff = function (r) {
	return A2($elm$core$List$member, '@staff/you', r.ax) ? r : _Utils_update(
		r,
		{
			ax: _Utils_ap(
				r.ax,
				_List_fromArray(
					['@staff/you']))
		});
};
var $elm$json$Json$Encode$string = _Json_wrap;
var $author$project$Main$saveView = _Platform_outgoingPort('saveView', $elm$json$Json$Encode$string);
var $elm$core$String$toLower = _String_toLower;
var $elm$core$String$trim = _String_trim;
var $author$project$Agents$Offline = 2;
var $author$project$Agents$Online = 1;
var $author$project$Agents$GotPromos = function (a) {
	return {$: 5, a: a};
};
var $author$project$Agents$merchantUrl = F2(
	function (model, path) {
		return model.u + ('/merchants/' + ($elm$core$String$fromInt(model.p) + path));
	});
var $author$project$Agents$Promo = function (id) {
	return function (headline) {
		return function (body) {
			return function (product) {
				return function (pct) {
					return function (price) {
						return function (list) {
							return function (status) {
								return function (source) {
									return function (imageUrl) {
										return function (imageStatus) {
											return function (seen) {
												return {aO: body, aP: headline, b: id, bv: imageStatus, bw: imageUrl, by: list, bF: pct, bI: price, bL: product, bU: seen, z: source, bc: status};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$Agents$andMap = $elm$json$Json$Decode$map2($elm$core$Basics$apR);
var $author$project$Agents$optInt = function (name) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, name, $elm$json$Json$Decode$int),
				$elm$json$Json$Decode$succeed(0)
			]));
};
var $author$project$Agents$promoDecoder = A2(
	$author$project$Agents$andMap,
	$author$project$Agents$optInt('seen'),
	A2(
		$author$project$Agents$andMap,
		$author$project$Agents$optString('image_status'),
		A2(
			$author$project$Agents$andMap,
			$author$project$Agents$optString('image_url'),
			A2(
				$author$project$Agents$andMap,
				$author$project$Agents$optString('source'),
				A2(
					$author$project$Agents$andMap,
					A2($elm$json$Json$Decode$field, 'status', $elm$json$Json$Decode$string),
					A2(
						$author$project$Agents$andMap,
						A2($elm$json$Json$Decode$field, 'list', $elm$json$Json$Decode$int),
						A2(
							$author$project$Agents$andMap,
							A2($elm$json$Json$Decode$field, 'price', $elm$json$Json$Decode$int),
							A2(
								$author$project$Agents$andMap,
								A2($elm$json$Json$Decode$field, 'pct', $elm$json$Json$Decode$int),
								A2(
									$author$project$Agents$andMap,
									A2($elm$json$Json$Decode$field, 'product', $elm$json$Json$Decode$string),
									A2(
										$author$project$Agents$andMap,
										A2($elm$json$Json$Decode$field, 'body', $elm$json$Json$Decode$string),
										A2(
											$author$project$Agents$andMap,
											A2($elm$json$Json$Decode$field, 'headline', $elm$json$Json$Decode$string),
											A2(
												$author$project$Agents$andMap,
												A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$int),
												$elm$json$Json$Decode$succeed($author$project$Agents$Promo)))))))))))));
var $author$project$Agents$getPromos = function (model) {
	return $elm$http$Http$get(
		{
			E: A2(
				$elm$http$Http$expectJson,
				$author$project$Agents$GotPromos,
				$elm$json$Json$Decode$list($author$project$Agents$promoDecoder)),
			L: A2($author$project$Agents$merchantUrl, model, '/promos')
		});
};
var $author$project$Agents$GotRooms = function (a) {
	return {$: 3, a: a};
};
var $author$project$Agents$RoomRow = F9(
	function (id, kind, handle, intent, customerName, messageCount, bandSent, bandChatId, lastText) {
		return {aa: bandChatId, ab: bandSent, aq: customerName, v: handle, b: id, as: intent, w: kind, at: lastText, aT: messageCount};
	});
var $elm$json$Json$Decode$map8 = _Json_map8;
var $author$project$Agents$roomRowDecoder = A2(
	$elm$json$Json$Decode$andThen,
	function (f) {
		return A2(
			$elm$json$Json$Decode$map,
			f,
			$author$project$Agents$optString('last_text'));
	},
	A9(
		$elm$json$Json$Decode$map8,
		$author$project$Agents$RoomRow,
		A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$int),
		A2($elm$json$Json$Decode$field, 'kind', $elm$json$Json$Decode$string),
		A2($elm$json$Json$Decode$field, 'handle', $elm$json$Json$Decode$string),
		$author$project$Agents$optString('intent'),
		$author$project$Agents$optString('customer_name'),
		$author$project$Agents$optInt('message_count'),
		$author$project$Agents$optInt('band_sent'),
		$author$project$Agents$optString('band_chat_id')));
var $author$project$Agents$getRooms = function (model) {
	return $elm$http$Http$get(
		{
			E: A2(
				$elm$http$Http$expectJson,
				$author$project$Agents$GotRooms,
				$elm$json$Json$Decode$list($author$project$Agents$roomRowDecoder)),
			L: A2($author$project$Agents$merchantUrl, model, '/rooms')
		});
};
var $author$project$Agents$GotThread = F2(
	function (a, b) {
		return {$: 4, a: a, b: b};
	});
var $author$project$Agents$Thread = F6(
	function (room, platform, messages, bandLive, bandFailed, typing) {
		return {aN: bandFailed, a3: bandLive, a4: messages, a8: platform, a: room, bf: typing};
	});
var $elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3($elm$core$List$foldr, $elm$json$Json$Decode$field, decoder, fields);
	});
var $elm$json$Json$Decode$map6 = _Json_map6;
var $author$project$Agents$Message = F7(
	function (id, sender, role, text, cites, source, bandStatus) {
		return {ac: bandStatus, M: cites, b: id, y: role, aj: sender, z: source, al: text};
	});
var $author$project$Agents$messageDecoder = A8(
	$elm$json$Json$Decode$map7,
	$author$project$Agents$Message,
	A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$int),
	A2($elm$json$Json$Decode$field, 'sender', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'role', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'text', $elm$json$Json$Decode$string),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$field,
				'cites',
				$elm$json$Json$Decode$list($elm$json$Json$Decode$string)),
				$elm$json$Json$Decode$succeed(_List_Nil)
			])),
	$author$project$Agents$optString('source'),
	$author$project$Agents$optString('band_status'));
var $author$project$Agents$threadDecoder = A7(
	$elm$json$Json$Decode$map6,
	$author$project$Agents$Thread,
	$author$project$Agents$roomRowDecoder,
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'platform', $elm$json$Json$Decode$string),
				$elm$json$Json$Decode$succeed('')
			])),
	A2(
		$elm$json$Json$Decode$field,
		'messages',
		$elm$json$Json$Decode$list($author$project$Agents$messageDecoder)),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$at,
				_List_fromArray(
					['band', 'live']),
				$elm$json$Json$Decode$bool),
				$elm$json$Json$Decode$succeed(false)
			])),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$at,
				_List_fromArray(
					['band', 'failed']),
				$elm$json$Json$Decode$int),
				$elm$json$Json$Decode$succeed(0)
			])),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$field,
				'typing',
				$elm$json$Json$Decode$list($elm$json$Json$Decode$string)),
				$elm$json$Json$Decode$succeed(_List_Nil)
			])));
var $author$project$Agents$getThread = F2(
	function (model, id) {
		return $elm$http$Http$get(
			{
				E: A2(
					$elm$http$Http$expectJson,
					$author$project$Agents$GotThread(id),
					$author$project$Agents$threadDecoder),
				L: A2(
					$author$project$Agents$merchantUrl,
					model,
					'/rooms/' + $elm$core$String$fromInt(id))
			});
	});
var $author$project$Agents$Sent = function (a) {
	return {$: 12, a: a};
};
var $elm$http$Http$expectBytesResponse = F2(
	function (toMsg, toResult) {
		return A3(
			_Http_expect,
			'arraybuffer',
			_Http_toDataView,
			A2($elm$core$Basics$composeR, toResult, toMsg));
	});
var $elm$http$Http$expectWhatever = function (toMsg) {
	return A2(
		$elm$http$Http$expectBytesResponse,
		toMsg,
		$elm$http$Http$resolve(
			function (_v0) {
				return $elm$core$Result$Ok(0);
			}));
};
var $elm$http$Http$jsonBody = function (value) {
	return A2(
		_Http_pair,
		'application/json',
		A2($elm$json$Json$Encode$encode, 0, value));
};
var $elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, obj) {
					var k = _v0.a;
					var v = _v0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(0),
			pairs));
};
var $elm$http$Http$post = function (r) {
	return $elm$http$Http$request(
		{aO: r.aO, E: r.E, bs: _List_Nil, cp: 'POST', cE: $elm$core$Maybe$Nothing, bZ: $elm$core$Maybe$Nothing, L: r.L});
};
var $author$project$Agents$postMessage = F3(
	function (model, id, body) {
		return $elm$http$Http$post(
			{
				aO: $elm$http$Http$jsonBody(
					$elm$json$Json$Encode$object(
						_List_fromArray(
							[
								_Utils_Tuple2(
								'text',
								$elm$json$Json$Encode$string(body))
							]))),
				E: $elm$http$Http$expectWhatever($author$project$Agents$Sent),
				L: A2(
					$author$project$Agents$merchantUrl,
					model,
					'/rooms/' + ($elm$core$String$fromInt(id) + '/messages'))
			});
	});
var $author$project$Agents$Created = function (a) {
	return {$: 15, a: a};
};
var $author$project$Agents$postRoom = F2(
	function (model, topic) {
		return $elm$http$Http$post(
			{
				aO: $elm$http$Http$jsonBody(
					$elm$json$Json$Encode$object(
						_List_fromArray(
							[
								_Utils_Tuple2(
								'topic',
								$elm$json$Json$Encode$string(topic))
							]))),
				E: A2(
					$elm$http$Http$expectJson,
					$author$project$Agents$Created,
					A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$int)),
				L: A2($author$project$Agents$merchantUrl, model, '/rooms')
			});
	});
var $author$project$Agents$refreshThread = function (model) {
	var _v0 = model.a;
	if (!_v0.$) {
		var id = _v0.a;
		return A2($author$project$Agents$getThread, model, id);
	} else {
		return $elm$core$Platform$Cmd$none;
	}
};
var $author$project$Agents$sampleRooms = _List_fromArray(
	[
		{
		aa: $elm$core$Maybe$Just('sample'),
		ab: 4,
		aq: $elm$core$Maybe$Nothing,
		v: '@staff/you',
		b: 1,
		as: $elm$core$Maybe$Just('Weekend plan'),
		w: 'team',
		at: $elm$core$Maybe$Just('@promo: I\'d push the camel wool overcoat at 10% off.'),
		aT: 4
	},
		{
		aa: $elm$core$Maybe$Just('sample'),
		ab: 6,
		aq: $elm$core$Maybe$Just('Dana Kim'),
		v: '@muse/dana.k',
		b: 2,
		as: $elm$core$Maybe$Just('Linen trousers'),
		w: 'shop',
		at: $elm$core$Maybe$Just('@muse/dana.k: Accepted. Checking out.'),
		aT: 6
	}
	]);
var $author$project$Agents$sampleThread = {
	aN: 0,
	a3: true,
	a4: _List_fromArray(
		[
			{
			ac: $elm$core$Maybe$Just('sent'),
			M: _List_Nil,
			b: 1,
			y: 'sys',
			aj: 'system',
			z: $elm$core$Maybe$Nothing,
			al: 'Team room opened: Weekend plan. @mention an agent to bring it in.'
		},
			{
			ac: $elm$core$Maybe$Just('sent'),
			M: _List_Nil,
			b: 2,
			y: 'staff',
			aj: '@staff/you',
			z: $elm$core$Maybe$Nothing,
			al: '@stylist @promo what should we push this weekend?'
		},
			{
			ac: $elm$core$Maybe$Just('sent'),
			M: _List_Nil,
			b: 3,
			y: 'agent',
			aj: '@stylist',
			z: $elm$core$Maybe$Just('sim'),
			al: 'Best sellers: Field Runner sneaker, Waxed jacket (5 left), Camel wool overcoat.'
		},
			{
			ac: $elm$core$Maybe$Just('sent'),
			M: _List_fromArray(
				['zoowork · 12.2 s']),
			b: 4,
			y: 'agent',
			aj: '@promo',
			z: $elm$core$Maybe$Just('zoowork'),
			al: 'I\'d push the camel wool overcoat this weekend at 10% off: 13 in stock and it fits the weather.'
		}
		]),
	a8: 'Team',
	a: {
		aa: $elm$core$Maybe$Just('sample'),
		ab: 4,
		aq: $elm$core$Maybe$Nothing,
		v: '@staff/you',
		b: 1,
		as: $elm$core$Maybe$Just('Weekend plan'),
		w: 'team',
		at: $elm$core$Maybe$Nothing,
		aT: 4
	},
	bf: _List_Nil
};
var $author$project$Agents$visible = F2(
	function (filter, rooms) {
		return (filter === 'all') ? rooms : A2(
			$elm$core$List$filter,
			function (r) {
				return _Utils_eq(r.w, filter);
			},
			rooms);
	});
var $author$project$Agents$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				if (!msg.a.$) {
					var h = msg.a.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								aQ: $elm$core$Maybe$Just(h)
							}),
						$elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 1:
				if (!msg.a.$) {
					var agents = msg.a.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{aM: agents}),
						$elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 2:
				if (!msg.a.$) {
					var ms = msg.a.a;
					var m = _Utils_update(
						model,
						{
							l: 1,
							p: A2(
								$elm$core$List$any,
								function (x) {
									return _Utils_eq(x.b, model.p);
								},
								ms) ? model.p : A2(
								$elm$core$Maybe$withDefault,
								1,
								A2(
									$elm$core$Maybe$map,
									function ($) {
										return $.b;
									},
									$elm$core$List$head(ms))),
							ay: ms
						});
					return _Utils_Tuple2(
						m,
						$elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									$author$project$Agents$getRooms(m),
									$author$project$Agents$getPromos(m)
								])));
				} else {
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								l: 2,
								T: _List_Nil,
								a: $elm$core$Maybe$Just(1),
								W: $author$project$Agents$sampleRooms,
								J: $elm$core$Maybe$Just($author$project$Agents$sampleThread)
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 3:
				if (!msg.a.$) {
					var rs = msg.a.a;
					var room = function () {
						var _v3 = model.a;
						if (!_v3.$) {
							var id = _v3.a;
							return $elm$core$Maybe$Just(id);
						} else {
							return A2(
								$elm$core$Maybe$map,
								function ($) {
									return $.b;
								},
								$elm$core$List$head(
									A2($author$project$Agents$visible, model.O, rs)));
						}
					}();
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{a: room, W: rs}),
						function () {
							var _v1 = _Utils_Tuple2(room, model.a);
							if ((!_v1.a.$) && (_v1.b.$ === 1)) {
								var id = _v1.a.a;
								var _v2 = _v1.b;
								return A2($author$project$Agents$getThread, model, id);
							} else {
								return $elm$core$Platform$Cmd$none;
							}
						}());
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 4:
				if (!msg.b.$) {
					var id = msg.a;
					var t = msg.b.a;
					return _Utils_eq(
						model.a,
						$elm$core$Maybe$Just(id)) ? _Utils_Tuple2(
						_Utils_update(
							model,
							{
								J: $elm$core$Maybe$Just(t)
							}),
						$elm$core$Platform$Cmd$none) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 5:
				if (!msg.a.$) {
					var ps = msg.a.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{T: ps}),
						$elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 6:
				var s = msg.a;
				var m = _Utils_update(
					model,
					{
						p: A2(
							$elm$core$Maybe$withDefault,
							model.p,
							$elm$core$String$toInt(s)),
						T: _List_Nil,
						a: $elm$core$Maybe$Nothing,
						W: _List_Nil,
						J: $elm$core$Maybe$Nothing
					});
				return _Utils_Tuple2(
					m,
					$elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								$author$project$Agents$getRooms(m),
								$author$project$Agents$getPromos(m)
							])));
			case 7:
				var id = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							a: $elm$core$Maybe$Just(id),
							J: $elm$core$Maybe$Nothing
						}),
					(model.l === 1) ? A2($author$project$Agents$getThread, model, id) : $elm$core$Platform$Cmd$none);
			case 8:
				var f = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{O: f}),
					$elm$core$Platform$Cmd$none);
			case 9:
				var s = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{k: s}),
					$elm$core$Platform$Cmd$none);
			case 10:
				var a = msg.a;
				var tag = '@' + a;
				return A2($elm$core$String$contains, tag, model.k) ? _Utils_Tuple2(model, $elm$core$Platform$Cmd$none) : _Utils_Tuple2(
					_Utils_update(
						model,
						{
							k: ($elm$core$String$isEmpty(model.k) || A2($elm$core$String$endsWith, ' ', model.k)) ? (model.k + (tag + ' ')) : (model.k + (' ' + (tag + ' ')))
						}),
					$elm$core$Platform$Cmd$none);
			case 11:
				var _v4 = _Utils_Tuple3(
					model.a,
					$elm$core$String$trim(model.k),
					model.l);
				if ((!_v4.a.$) && (_v4.c === 1)) {
					var id = _v4.a.a;
					var body = _v4.b;
					var _v5 = _v4.c;
					return $elm$core$String$isEmpty(body) ? _Utils_Tuple2(model, $elm$core$Platform$Cmd$none) : _Utils_Tuple2(
						_Utils_update(
							model,
							{k: '', N: $elm$core$Maybe$Nothing}),
						A3($author$project$Agents$postMessage, model, id, body));
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 12:
				if (!msg.a.$) {
					return _Utils_Tuple2(
						model,
						$author$project$Agents$refreshThread(model));
				} else {
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								N: $elm$core$Maybe$Just('Couldn\'t send the message. Is the Tabard API running?')
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 13:
				var s = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{X: s}),
					$elm$core$Platform$Cmd$none);
			case 14:
				var t = $elm$core$String$trim(model.X);
				return ($elm$core$String$isEmpty(t) || (model.l !== 1)) ? _Utils_Tuple2(model, $elm$core$Platform$Cmd$none) : _Utils_Tuple2(
					_Utils_update(
						model,
						{N: $elm$core$Maybe$Nothing, X: ''}),
					A2($author$project$Agents$postRoom, model, t));
			case 15:
				if (!msg.a.$) {
					var id = msg.a.a;
					var m = _Utils_update(
						model,
						{
							O: 'all',
							a: $elm$core$Maybe$Just(id),
							J: $elm$core$Maybe$Nothing
						});
					return _Utils_Tuple2(
						m,
						$elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									$author$project$Agents$getRooms(m),
									A2($author$project$Agents$getThread, m, id)
								])));
				} else {
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								N: $elm$core$Maybe$Just('Couldn\'t open the team room.')
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 16:
				return _Utils_Tuple2(
					model,
					$elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								$author$project$Agents$getRooms(model),
								$author$project$Agents$refreshThread(model)
							])));
			default:
				return _Utils_Tuple2(
					model,
					$elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								$author$project$Agents$getHealth(model.u),
								$author$project$Agents$getBand(model.u),
								$author$project$Agents$getMerchants(model.u),
								(model.l === 1) ? $author$project$Agents$getPromos(model) : $elm$core$Platform$Cmd$none
							])));
		}
	});
var $author$project$Mission$Failed = function (a) {
	return {$: 3, a: a};
};
var $author$project$Mission$Loaded = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var $author$project$Mission$Loading = function (a) {
	return {$: 1, a: a};
};
var $author$project$Mission$Offline = 3;
var $elm$json$Json$Decode$decodeValue = _Json_run;
var $author$project$Mission$MerchantEvent = function (a) {
	return {$: 2, a: a};
};
var $author$project$Mission$TotalsEvent = function (a) {
	return {$: 1, a: a};
};
var $author$project$Mission$WireEvent = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$fail = _Json_fail;
var $author$project$Mission$WireItem = function (id) {
	return function (time) {
		return function (merchantId) {
			return function (merchant) {
				return function (roomId) {
					return function (roomKind) {
						return function (platform) {
							return function (from) {
								return function (fromRole) {
									return function (to) {
										return function (text) {
											return function (cites) {
												return function (source) {
													return {M: cites, br: from, ar: fromRole, b: id, p: merchant, ag: merchantId, a8: platform, aE: roomId, bS: roomKind, z: source, al: text, bY: time, g: to};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$Mission$wireDecoder = A2(
	$author$project$Mission$andMap,
	$elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, 'source', $elm$json$Json$Decode$string)),
	A2(
		$author$project$Mission$andMap,
		$elm$json$Json$Decode$oneOf(
			_List_fromArray(
				[
					A2(
					$elm$json$Json$Decode$field,
					'cites',
					$elm$json$Json$Decode$list($elm$json$Json$Decode$string)),
					$elm$json$Json$Decode$succeed(_List_Nil)
				])),
		A2(
			$author$project$Mission$andMap,
			A2($elm$json$Json$Decode$field, 'text', $elm$json$Json$Decode$string),
			A2(
				$author$project$Mission$andMap,
				$elm$json$Json$Decode$oneOf(
					_List_fromArray(
						[
							A2(
							$elm$json$Json$Decode$field,
							'to',
							$elm$json$Json$Decode$list($elm$json$Json$Decode$string)),
							$elm$json$Json$Decode$succeed(_List_Nil)
						])),
				A2(
					$author$project$Mission$andMap,
					$elm$json$Json$Decode$oneOf(
						_List_fromArray(
							[
								A2($elm$json$Json$Decode$field, 'fromRole', $elm$json$Json$Decode$string),
								$elm$json$Json$Decode$succeed('agent')
							])),
					A2(
						$author$project$Mission$andMap,
						A2($elm$json$Json$Decode$field, 'from', $elm$json$Json$Decode$string),
						A2(
							$author$project$Mission$andMap,
							$elm$json$Json$Decode$oneOf(
								_List_fromArray(
									[
										A2($elm$json$Json$Decode$field, 'platform', $elm$json$Json$Decode$string),
										$elm$json$Json$Decode$succeed('Unknown')
									])),
							A2(
								$author$project$Mission$andMap,
								$elm$json$Json$Decode$oneOf(
									_List_fromArray(
										[
											A2($elm$json$Json$Decode$field, 'roomKind', $elm$json$Json$Decode$string),
											$elm$json$Json$Decode$succeed('')
										])),
								A2(
									$author$project$Mission$andMap,
									A2($elm$json$Json$Decode$field, 'roomId', $elm$json$Json$Decode$string),
									A2(
										$author$project$Mission$andMap,
										A2($elm$json$Json$Decode$field, 'merchant', $elm$json$Json$Decode$string),
										A2(
											$author$project$Mission$andMap,
											A2($elm$json$Json$Decode$field, 'merchantId', $elm$json$Json$Decode$int),
											A2(
												$author$project$Mission$andMap,
												A2($elm$json$Json$Decode$field, 'time', $elm$json$Json$Decode$string),
												A2(
													$author$project$Mission$andMap,
													A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$int),
													$elm$json$Json$Decode$succeed($author$project$Mission$WireItem))))))))))))));
var $author$project$Mission$eventDecoder = A2(
	$elm$json$Json$Decode$andThen,
	function (t) {
		switch (t) {
			case 'message':
				return A2($elm$json$Json$Decode$map, $author$project$Mission$WireEvent, $author$project$Mission$wireDecoder);
			case 'totals':
				return A2($elm$json$Json$Decode$map, $author$project$Mission$TotalsEvent, $author$project$Mission$totalsDecoder);
			case 'merchant':
				return A2($elm$json$Json$Decode$map, $author$project$Mission$MerchantEvent, $author$project$Mission$merchantDecoder);
			default:
				return $elm$json$Json$Decode$fail('unknown event ' + t);
		}
	},
	A2($elm$json$Json$Decode$field, 'type', $elm$json$Json$Decode$string));
var $author$project$Mission$GotLinks = function (a) {
	return {$: 2, a: a};
};
var $author$project$Mission$Link = F3(
	function (from, to, count) {
		return {ad: count, br: from, g: to};
	});
var $author$project$Mission$linkDecoder = A4(
	$elm$json$Json$Decode$map3,
	$author$project$Mission$Link,
	A2($elm$json$Json$Decode$field, 'from', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'to', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'count', $elm$json$Json$Decode$int));
var $author$project$Mission$fetchLinks = function (api) {
	return $elm$http$Http$get(
		{
			E: A2(
				$elm$http$Http$expectJson,
				$author$project$Mission$GotLinks,
				$elm$json$Json$Decode$list($author$project$Mission$linkDecoder)),
			L: api + '/mission/links?minutes=60'
		});
};
var $author$project$Mission$GotThread = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $author$project$Data$Room = function (id) {
	return function (platform) {
		return function (handle) {
			return function (customer) {
				return function (state) {
					return function (intent) {
						return function (opened) {
							return function (line) {
								return function (members) {
									return function (posts) {
										return {ap: customer, v: handle, b: id, as: intent, au: line, ax: members, aB: opened, a8: platform, aC: posts, aH: state};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$Data$Post = F6(
	function (from, kind, text, payload, cites, approval) {
		return {a1: approval, M: cites, br: from, w: kind, a7: payload, al: text};
	});
var $author$project$Mission$postDecoder = A7(
	$elm$json$Json$Decode$map6,
	$author$project$Data$Post,
	A2($elm$json$Json$Decode$field, 'from', $elm$json$Json$Decode$string),
	A2(
		$elm$json$Json$Decode$map,
		function (k) {
			switch (k) {
				case 'buyer':
					return 1;
				case 'sys':
					return 2;
				default:
					return 0;
			}
		},
		A2($elm$json$Json$Decode$field, 'kind', $elm$json$Json$Decode$string)),
	A2($elm$json$Json$Decode$field, 'text', $elm$json$Json$Decode$string),
	$elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, 'payload', $elm$json$Json$Decode$string)),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$field,
				'cites',
				$elm$json$Json$Decode$list($elm$json$Json$Decode$string)),
				$elm$json$Json$Decode$succeed(_List_Nil)
			])),
	A2($author$project$Mission$boolOr, false, 'approval'));
var $author$project$Data$Rose = 4;
var $elm$core$Tuple$pair = F2(
	function (a, b) {
		return _Utils_Tuple2(a, b);
	});
var $author$project$Mission$toneLabelDecoder = A3(
	$elm$json$Json$Decode$map2,
	$elm$core$Tuple$pair,
	A2($elm$json$Json$Decode$field, 'label', $elm$json$Json$Decode$string),
	A2(
		$elm$json$Json$Decode$map,
		function (t) {
			switch (t) {
				case 'good':
					return 0;
				case 'warn':
					return 1;
				case 'bad':
					return 2;
				case 'rose':
					return 4;
				default:
					return 3;
			}
		},
		A2($elm$json$Json$Decode$field, 'tone', $elm$json$Json$Decode$string)));
var $author$project$Mission$roomDecoder = A2(
	$author$project$Mission$andMap,
	A2(
		$elm$json$Json$Decode$field,
		'posts',
		$elm$json$Json$Decode$list($author$project$Mission$postDecoder)),
	A2(
		$author$project$Mission$andMap,
		$elm$json$Json$Decode$oneOf(
			_List_fromArray(
				[
					A2(
					$elm$json$Json$Decode$field,
					'members',
					$elm$json$Json$Decode$list($elm$json$Json$Decode$string)),
					$elm$json$Json$Decode$succeed(_List_Nil)
				])),
		A2(
			$author$project$Mission$andMap,
			$elm$json$Json$Decode$oneOf(
				_List_fromArray(
					[
						A2($elm$json$Json$Decode$field, 'line', $elm$json$Json$Decode$string),
						$elm$json$Json$Decode$succeed('')
					])),
			A2(
				$author$project$Mission$andMap,
				$elm$json$Json$Decode$oneOf(
					_List_fromArray(
						[
							A2($elm$json$Json$Decode$field, 'opened', $elm$json$Json$Decode$string),
							$elm$json$Json$Decode$succeed('')
						])),
				A2(
					$author$project$Mission$andMap,
					$elm$json$Json$Decode$oneOf(
						_List_fromArray(
							[
								A2($elm$json$Json$Decode$field, 'intent', $elm$json$Json$Decode$string),
								$elm$json$Json$Decode$succeed('')
							])),
					A2(
						$author$project$Mission$andMap,
						A2($elm$json$Json$Decode$field, 'state', $author$project$Mission$toneLabelDecoder),
						A2(
							$author$project$Mission$andMap,
							$elm$json$Json$Decode$maybe(
								A2($elm$json$Json$Decode$field, 'customerId', $elm$json$Json$Decode$string)),
							A2(
								$author$project$Mission$andMap,
								A2($elm$json$Json$Decode$field, 'handle', $elm$json$Json$Decode$string),
								A2(
									$author$project$Mission$andMap,
									$elm$json$Json$Decode$oneOf(
										_List_fromArray(
											[
												A2($elm$json$Json$Decode$field, 'platform', $elm$json$Json$Decode$string),
												$elm$json$Json$Decode$succeed('')
											])),
									A2(
										$author$project$Mission$andMap,
										A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string),
										$elm$json$Json$Decode$succeed($author$project$Data$Room)))))))))));
var $author$project$Mission$fetchThread = F2(
	function (api, item) {
		return $elm$http$Http$get(
			{
				E: A2(
					$elm$http$Http$expectJson,
					$author$project$Mission$GotThread(item),
					A2($elm$json$Json$Decode$field, 'room', $author$project$Mission$roomDecoder)),
				L: api + ('/mission/rooms/' + ($elm$core$String$fromInt(item.ag) + ('/' + item.aE)))
			});
	});
var $author$project$Mission$GotWire = function (a) {
	return {$: 1, a: a};
};
var $author$project$Mission$fetchWire = F2(
	function (api, after) {
		return $elm$http$Http$get(
			{
				E: A2(
					$elm$http$Http$expectJson,
					$author$project$Mission$GotWire,
					$elm$json$Json$Decode$list($author$project$Mission$wireDecoder)),
				L: api + ('/mission/wire?limit=200' + A2(
					$elm$core$Maybe$withDefault,
					'',
					A2(
						$elm$core$Maybe$map,
						function (a) {
							return '&after=' + $elm$core$String$fromInt(a);
						},
						after)))
			});
	});
var $elm$core$Basics$not = _Basics_not;
var $elm$core$List$takeReverse = F3(
	function (n, list, kept) {
		takeReverse:
		while (true) {
			if (n <= 0) {
				return kept;
			} else {
				if (!list.b) {
					return kept;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs,
						$temp$kept = A2($elm$core$List$cons, x, kept);
					n = $temp$n;
					list = $temp$list;
					kept = $temp$kept;
					continue takeReverse;
				}
			}
		}
	});
var $elm$core$List$takeTailRec = F2(
	function (n, list) {
		return $elm$core$List$reverse(
			A3($elm$core$List$takeReverse, n, list, _List_Nil));
	});
var $elm$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (n <= 0) {
			return _List_Nil;
		} else {
			var _v0 = _Utils_Tuple2(n, list);
			_v0$1:
			while (true) {
				_v0$5:
				while (true) {
					if (!_v0.b.b) {
						return list;
					} else {
						if (_v0.b.b.b) {
							switch (_v0.a) {
								case 1:
									break _v0$1;
								case 2:
									var _v2 = _v0.b;
									var x = _v2.a;
									var _v3 = _v2.b;
									var y = _v3.a;
									return _List_fromArray(
										[x, y]);
								case 3:
									if (_v0.b.b.b.b) {
										var _v4 = _v0.b;
										var x = _v4.a;
										var _v5 = _v4.b;
										var y = _v5.a;
										var _v6 = _v5.b;
										var z = _v6.a;
										return _List_fromArray(
											[x, y, z]);
									} else {
										break _v0$5;
									}
								default:
									if (_v0.b.b.b.b && _v0.b.b.b.b.b) {
										var _v7 = _v0.b;
										var x = _v7.a;
										var _v8 = _v7.b;
										var y = _v8.a;
										var _v9 = _v8.b;
										var z = _v9.a;
										var _v10 = _v9.b;
										var w = _v10.a;
										var tl = _v10.b;
										return (ctr > 1000) ? A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A2($elm$core$List$takeTailRec, n - 4, tl))))) : A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A3($elm$core$List$takeFast, ctr + 1, n - 4, tl)))));
									} else {
										break _v0$5;
									}
							}
						} else {
							if (_v0.a === 1) {
								break _v0$1;
							} else {
								break _v0$5;
							}
						}
					}
				}
				return list;
			}
			var _v1 = _v0.b;
			var x = _v1.a;
			return _List_fromArray(
				[x]);
		}
	});
var $elm$core$List$take = F2(
	function (n, list) {
		return A3($elm$core$List$takeFast, 0, n, list);
	});
var $author$project$Mission$wireCap = 400;
var $author$project$Mission$ingest = F2(
	function (items, model) {
		var seen = $elm$core$Set$fromList(
			A2(
				$elm$core$List$map,
				function ($) {
					return $.b;
				},
				_Utils_ap(model.t, model.h)));
		var fresh = A2(
			$elm$core$List$filter,
			function (i) {
				return !A2($elm$core$Set$member, i.b, seen);
			},
			items);
		return $elm$core$List$isEmpty(fresh) ? model : (model.R ? _Utils_update(
			model,
			{
				t: A2(
					$elm$core$List$take,
					$author$project$Mission$wireCap,
					_Utils_ap(fresh, model.t))
			}) : _Utils_update(
			model,
			{
				h: A2(
					$elm$core$List$take,
					$author$project$Mission$wireCap,
					_Utils_ap(fresh, model.h))
			}));
	});
var $elm$core$List$maximum = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(
			A3($elm$core$List$foldl, $elm$core$Basics$max, x, xs));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Mission$lastId = function (model) {
	return $elm$core$List$maximum(
		A2(
			$elm$core$List$map,
			function ($) {
				return $.b;
			},
			_Utils_ap(model.t, model.h)));
};
var $author$project$Mission$missionConnect = _Platform_outgoingPort('missionConnect', $elm$json$Json$Encode$string);
var $elm$core$Set$remove = F2(
	function (key, _v0) {
		var dict = _v0;
		return A2($elm$core$Dict$remove, key, dict);
	});
var $author$project$Mission$sampleThread = function (item) {
	var _v0 = $elm$core$List$head(
		A2(
			$elm$core$List$filter,
			function (_v1) {
				var mid = _v1.a;
				var r = _v1.c;
				return _Utils_eq(mid, item.ag) && _Utils_eq(r.b, item.aE);
			},
			$author$project$Mission$sampleRooms));
	if (!_v0.$) {
		var _v2 = _v0.a;
		var room = _v2.c;
		return A2($author$project$Mission$Loaded, item, room);
	} else {
		return $author$project$Mission$Failed(item);
	}
};
var $author$project$Mission$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				if (!msg.a.$) {
					var snap = msg.a.a;
					var firstContact = (!model.l) || (model.l === 3);
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								l: firstContact ? 2 : model.l,
								ay: snap.ay,
								J: firstContact ? $author$project$Mission$NoThread : model.J,
								i: snap.i,
								h: firstContact ? _List_Nil : model.h
							}),
						firstContact ? $elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									A2($author$project$Mission$fetchWire, model.u, $elm$core$Maybe$Nothing),
									$author$project$Mission$fetchLinks(model.u),
									$author$project$Mission$missionConnect(model.u + '/mission/stream')
								])) : $elm$core$Platform$Cmd$none);
				} else {
					return ((!model.l) || (model.l === 3)) ? _Utils_Tuple2(
						_Utils_update(
							model,
							{l: 3}),
						$elm$core$Platform$Cmd$none) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 1:
				if (!msg.a.$) {
					var items = msg.a.a;
					return _Utils_Tuple2(
						A2(
							$author$project$Mission$ingest,
							$elm$core$List$reverse(items),
							model),
						$elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 2:
				if (!msg.a.$) {
					var ls = msg.a.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								aY: $elm$core$Maybe$Just(ls)
							}),
						$elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 3:
				if (!msg.b.$) {
					var item = msg.a;
					var room = msg.b.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								J: A2($author$project$Mission$Loaded, item, room)
							}),
						$elm$core$Platform$Cmd$none);
				} else {
					var item = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								J: $author$project$Mission$Failed(item)
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 4:
				if (msg.a === 'open') {
					return (model.l === 3) ? _Utils_Tuple2(model, $elm$core$Platform$Cmd$none) : _Utils_Tuple2(
						_Utils_update(
							model,
							{l: 1}),
						$elm$core$Platform$Cmd$none);
				} else {
					return (model.l === 1) ? _Utils_Tuple2(
						_Utils_update(
							model,
							{l: 2}),
						$elm$core$Platform$Cmd$none) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 5:
				var value = msg.a;
				var _v1 = A2($elm$json$Json$Decode$decodeValue, $author$project$Mission$eventDecoder, value);
				if (!_v1.$) {
					switch (_v1.a.$) {
						case 0:
							var item = _v1.a.a;
							return _Utils_Tuple2(
								A2(
									$author$project$Mission$ingest,
									_List_fromArray(
										[item]),
									model),
								$elm$core$Platform$Cmd$none);
						case 1:
							var t = _v1.a.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{i: t}),
								$elm$core$Platform$Cmd$none);
						default:
							var m = _v1.a.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										ay: A2(
											$elm$core$List$any,
											function (x) {
												return _Utils_eq(x.b, m.b);
											},
											model.ay) ? A2(
											$elm$core$List$map,
											function (x) {
												return _Utils_eq(x.b, m.b) ? m : x;
											},
											model.ay) : _Utils_ap(
											model.ay,
											_List_fromArray(
												[m]))
									}),
								$elm$core$Platform$Cmd$none);
					}
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 6:
				return _Utils_Tuple2(
					model,
					$elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								A2(
								$author$project$Mission$fetchWire,
								model.u,
								$author$project$Mission$lastId(model)),
								$author$project$Mission$fetchSnapshot(model.u)
							])));
			case 7:
				return _Utils_Tuple2(
					model,
					$author$project$Mission$fetchSnapshot(model.u));
			case 8:
				return _Utils_Tuple2(
					model,
					$author$project$Mission$fetchLinks(model.u));
			case 9:
				return model.R ? _Utils_Tuple2(
					_Utils_update(
						model,
						{
							R: false,
							t: _List_Nil,
							h: A2(
								$elm$core$List$take,
								$author$project$Mission$wireCap,
								_Utils_ap(model.t, model.h))
						}),
					$elm$core$Platform$Cmd$none) : _Utils_Tuple2(
					_Utils_update(
						model,
						{R: true}),
					$elm$core$Platform$Cmd$none);
			case 10:
				var m = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{q: m}),
					$elm$core$Platform$Cmd$none);
			case 11:
				var h = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{F: h}),
					$elm$core$Platform$Cmd$none);
			case 12:
				var p = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{S: p}),
					$elm$core$Platform$Cmd$none);
			case 13:
				var key = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							G: A2($elm$core$Set$member, key, model.G) ? A2($elm$core$Set$remove, key, model.G) : A2($elm$core$Set$insert, key, model.G)
						}),
					$elm$core$Platform$Cmd$none);
			case 14:
				var s = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{aG: s}),
					$elm$core$Platform$Cmd$none);
			case 15:
				var item = msg.a;
				return (model.l === 3) ? _Utils_Tuple2(
					_Utils_update(
						model,
						{
							J: $author$project$Mission$sampleThread(item)
						}),
					$elm$core$Platform$Cmd$none) : _Utils_Tuple2(
					_Utils_update(
						model,
						{
							J: $author$project$Mission$Loading(item)
						}),
					A2($author$project$Mission$fetchThread, model.u, item));
			default:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{J: $author$project$Mission$NoThread}),
					$elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Main$viewKey = function (v) {
	switch (v) {
		case 0:
			return 'console';
		case 1:
			return 'mission';
		case 2:
			return 'agents';
		default:
			return 'design';
	}
};
var $author$project$Main$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
			case 1:
				var zone = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{a0: zone}),
					$elm$core$Platform$Cmd$none);
			case 2:
				var v = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{j: v}),
					$author$project$Main$saveView(
						$author$project$Main$viewKey(v)));
			case 3:
				var t = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{A: t}),
					(!t) ? $author$project$Main$scrollToEnd('feed') : $elm$core$Platform$Cmd$none);
			case 4:
				var id = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{o: $author$project$Main$NoCall, D: id, A: 0}),
					$author$project$Main$scrollToEnd('feed'));
			case 5:
				var refId = msg.a;
				var act = msg.b;
				return _Utils_Tuple2(
					model,
					A2(
						$elm$core$Task$perform,
						A2($author$project$Main$Decided, refId, act),
						$elm$time$Time$now));
			case 6:
				var refId = msg.a;
				var act = msg.b;
				var now = msg.c;
				var entry = {
					b4: '@staff/you',
					b9: 'Approved in console',
					bm: refId + (': ' + act),
					bY: A2($author$project$Main$clock, model.a0, now),
					cH: '—'
				};
				var decided = _Utils_update(
					model,
					{
						aw: A2($elm$core$List$cons, entry, model.aw),
						V: A2(
							$elm$core$List$map,
							function (f) {
								return _Utils_eq(f.b, refId) ? _Utils_update(
									f,
									{
										bm: $elm$core$Maybe$Just(act)
									}) : f;
							},
							model.V)
					});
				return (refId === 'RF-2207') ? _Utils_Tuple2(
					A3(
						$author$project$Main$updateRoom,
						'r2',
						function (r) {
							return _Utils_update(
								r,
								{
									aC: _Utils_ap(
										r.aC,
										_List_fromArray(
											[
												A3(
												$author$project$Data$post,
												'@concierge',
												0,
												'The store\'s decision on ' + (refId + (': ' + ($elm$core$String$toLower(act) + '. I\'ll tell the buyer agent now.'))))
											])),
									aH: _Utils_Tuple2('Resolved', 3)
								});
						},
						decided),
					$author$project$Main$scrollToEnd('feed')) : _Utils_Tuple2(decided, $elm$core$Platform$Cmd$none);
			case 7:
				var s = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{k: s}),
					$elm$core$Platform$Cmd$none);
			case 8:
				var text = $elm$core$String$trim(model.k);
				return (text === '') ? _Utils_Tuple2(model, $elm$core$Platform$Cmd$none) : _Utils_Tuple2(
					A3(
						$author$project$Main$updateRoom,
						model.D,
						A2(
							$elm$core$Basics$composeR,
							$author$project$Main$joinStaff,
							$author$project$Main$addPost(
								A3($author$project$Data$post, '@staff/you', 0, text))),
						_Utils_update(
							model,
							{k: ''})),
					$author$project$Main$scrollToEnd('feed'));
			case 9:
				return _Utils_Tuple2(
					A3(
						$author$project$Main$updateRoom,
						model.D,
						A2(
							$elm$core$Basics$composeR,
							$author$project$Main$joinStaff,
							$author$project$Main$addPost(
								A3($author$project$Data$post, '@staff/you', 2, 'Staff joined the room. Agents will wait for you before replying to the buyer.'))),
						model),
					$elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								$author$project$Main$scrollToEnd('feed'),
								A2(
								$elm$core$Task$attempt,
								function (_v1) {
									return $author$project$Main$NoOp;
								},
								$elm$browser$Browser$Dom$focus('composeInput'))
							])));
			case 10:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							o: $author$project$Main$OnCall(1)
						}),
					$author$project$Main$scrollToEnd('calllog'));
			case 11:
				var _v2 = model.o;
				if (_v2.$ === 1) {
					var shown = _v2.a;
					return (_Utils_cmp(
						shown,
						$elm$core$List$length(
							$author$project$Main$currentScript(model))) > -1) ? $author$project$Main$endCall(model) : _Utils_Tuple2(
						_Utils_update(
							model,
							{
								o: $author$project$Main$OnCall(shown + 1)
							}),
						$author$project$Main$scrollToEnd('calllog'));
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 12:
				return $author$project$Main$endCall(model);
			case 13:
				var m = msg.a;
				var _v3 = A2($author$project$Mission$update, m, model.ah);
				var mission = _v3.a;
				var cmd = _v3.b;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{ah: mission}),
					A2($elm$core$Platform$Cmd$map, $author$project$Main$MissionMsg, cmd));
			default:
				var m = msg.a;
				var _v4 = A2($author$project$Agents$update, m, model.Z);
				var agents = _v4.a;
				var cmd = _v4.b;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{Z: agents}),
					A2($elm$core$Platform$Cmd$map, $author$project$Main$AgentsMsg, cmd));
		}
	});
var $author$project$Main$SelectView = function (a) {
	return {$: 2, a: a};
};
var $elm$virtual_dom$VirtualDom$attribute = F2(
	function (key, value) {
		return A2(
			_VirtualDom_attribute,
			_VirtualDom_noOnOrFormAction(key),
			_VirtualDom_noJavaScriptOrHtmlUri(value));
	});
var $elm$html$Html$Attributes$attribute = $elm$virtual_dom$VirtualDom$attribute;
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $elm$html$Html$Attributes$classList = function (classes) {
	return $elm$html$Html$Attributes$class(
		A2(
			$elm$core$String$join,
			' ',
			A2(
				$elm$core$List$map,
				$elm$core$Tuple$first,
				A2($elm$core$List$filter, $elm$core$Tuple$second, classes))));
};
var $elm$html$Html$div = _VirtualDom_node('div');
var $elm$html$Html$h1 = _VirtualDom_node('h1');
var $elm$html$Html$header = _VirtualDom_node('header');
var $elm$json$Json$Encode$bool = _Json_wrap;
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$hidden = $elm$html$Html$Attributes$boolProperty('hidden');
var $elm$html$Html$Attributes$id = $elm$html$Html$Attributes$stringProperty('id');
var $elm$html$Html$main_ = _VirtualDom_node('main');
var $elm$virtual_dom$VirtualDom$map = _VirtualDom_map;
var $elm$html$Html$map = $elm$virtual_dom$VirtualDom$map;
var $elm$html$Html$span = _VirtualDom_node('span');
var $author$project$Main$boolString = function (b) {
	return b ? 'true' : 'false';
};
var $author$project$Main$ariaSelected = function (b) {
	return A2(
		$elm$html$Html$Attributes$attribute,
		'aria-selected',
		$author$project$Main$boolString(b));
};
var $elm$html$Html$button = _VirtualDom_node('button');
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 0, a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $author$project$Main$tabButton = F3(
	function (label, selected, msg) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					A2($elm$html$Html$Attributes$attribute, 'role', 'tab'),
					$author$project$Main$ariaSelected(selected),
					$elm$html$Html$Events$onClick(msg)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label)
				]));
	});
var $elm$html$Html$section = _VirtualDom_node('section');
var $elm$html$Html$p = _VirtualDom_node('p');
var $elm$html$Html$a = _VirtualDom_node('a');
var $elm$html$Html$Attributes$alt = $elm$html$Html$Attributes$stringProperty('alt');
var $elm$html$Html$b = _VirtualDom_node('b');
var $elm$html$Html$Attributes$href = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'href',
		_VirtualDom_noJavaScriptUri(url));
};
var $elm$html$Html$img = _VirtualDom_node('img');
var $author$project$Agents$origin = function (model) {
	return A2($elm$core$String$endsWith, '/api', model.u) ? A2($elm$core$String$dropRight, 4, model.u) : model.u;
};
var $elm$html$Html$Attributes$rel = _VirtualDom_attribute('rel');
var $elm$html$Html$Attributes$src = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'src',
		_VirtualDom_noJavaScriptOrHtmlUri(url));
};
var $author$project$Agents$statusLabel = function (s) {
	switch (s) {
		case 'live':
			return 'On the billboard';
		case 'draft':
			return 'Draft';
		default:
			return 'Past';
	}
};
var $author$project$Agents$statusTone = function (s) {
	switch (s) {
		case 'live':
			return 'p-good';
		case 'draft':
			return 'p-warn';
		default:
			return 'p-neutral';
	}
};
var $elm$html$Html$Attributes$target = $elm$html$Html$Attributes$stringProperty('target');
var $author$project$Agents$viewAd = F2(
	function (model, p) {
		return A2(
			$elm$html$Html$a,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('ad-tile'),
					$elm$html$Html$Attributes$href(
					$author$project$Agents$origin(model) + ('/m/' + ($elm$core$String$fromInt(model.p) + ('/ads/' + $elm$core$String$fromInt(p.b))))),
					$elm$html$Html$Attributes$target('_blank'),
					$elm$html$Html$Attributes$rel('noopener')
				]),
			_List_fromArray(
				[
					function () {
					var _v0 = p.bw;
					if (!_v0.$) {
						var url = _v0.a;
						return A2(
							$elm$html$Html$img,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$src(
									_Utils_ap(
										$author$project$Agents$origin(model),
										url)),
									$elm$html$Html$Attributes$alt(p.aP + ('. ' + p.aO))
								]),
							_List_Nil);
					} else {
						return A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('ad-text')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('ad-pct')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											$elm$core$String$fromInt(p.bF) + '% off')
										])),
									A2(
									$elm$html$Html$b,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text(p.aP)
										])),
									A2(
									$elm$html$Html$span,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text(
											function () {
												var _v1 = p.bv;
												_v1$2:
												while (true) {
													if (!_v1.$) {
														switch (_v1.a) {
															case 'designing':
																return 'Artwork being painted…';
															case 'failed':
																return 'Artwork failed';
															default:
																break _v1$2;
														}
													} else {
														break _v1$2;
													}
												}
												return 'No artwork';
											}())
										]))
								]));
					}
				}(),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('ad-meta')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('ad-h')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(p.aP)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('note')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									p.bL + (' · $' + ($elm$core$String$fromInt(p.bI) + (' (was $' + ($elm$core$String$fromInt(p.by) + (') · seen by ' + $elm$core$String$fromInt(p.bU)))))))
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('ad-pills')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class(
											'pill ' + $author$project$Agents$statusTone(p.bc))
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											$author$project$Agents$statusLabel(p.bc))
										])),
									_Utils_eq(
									p.z,
									$elm$core$Maybe$Just('zoowork')) ? A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('pill p-good')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('ZooWork')
										])) : A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('pill p-neutral')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Simulated')
										]))
								]))
						]))
				]));
	});
var $author$project$Agents$viewAds = function (model) {
	return A2(
		$elm$html$Html$section,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('ads-section')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('panel-h plain')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('label')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Ads from the promo engine')
							])),
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('note')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Drafted by the ZooWork promo agent; artwork painted with its designer skill')
							]))
					])),
				$elm$core$List$isEmpty(model.T) ? A2(
				$elm$html$Html$p,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('note pad')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(
						(model.l === 1) ? 'No ads yet. Open the shop and prompt the billboard\'s promo engine.' : 'Ads appear here when the Tabard API is running.')
					])) : A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('ads')
					]),
				A2(
					$elm$core$List$map,
					$author$project$Agents$viewAd(model),
					A2($elm$core$List$take, 12, model.T)))
			]));
};
var $author$project$Agents$SelectMerchant = function (a) {
	return {$: 6, a: a};
};
var $elm$html$Html$Attributes$for = $elm$html$Html$Attributes$stringProperty('htmlFor');
var $elm$html$Html$label = _VirtualDom_node('label');
var $elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var $elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 1, a: a};
};
var $elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var $elm$html$Html$Events$targetValue = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		$elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysStop,
			A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue)));
};
var $elm$html$Html$option = _VirtualDom_node('option');
var $elm$html$Html$select = _VirtualDom_node('select');
var $elm$html$Html$Attributes$selected = $elm$html$Html$Attributes$boolProperty('selected');
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $author$project$Agents$viewMerchantPicker = function (model) {
	return $elm$core$List$isEmpty(model.ay) ? $elm$html$Html$text('') : A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('picker')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$label,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$for('agents-merchant'),
						$elm$html$Html$Attributes$class('label')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Shop')
					])),
				A2(
				$elm$html$Html$select,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('agents-merchant'),
						$elm$html$Html$Events$onInput($author$project$Agents$SelectMerchant)
					]),
				A2(
					$elm$core$List$map,
					function (m) {
						return A2(
							$elm$html$Html$option,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$value(
									$elm$core$String$fromInt(m.b)),
									$elm$html$Html$Attributes$selected(
									_Utils_eq(m.b, model.p))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(m.bA + (' · ' + m.bj))
								]));
					},
					model.ay))
			]));
};
var $author$project$Agents$CreateRoom = {$: 14};
var $author$project$Agents$SetFilter = function (a) {
	return {$: 8, a: a};
};
var $author$project$Agents$Topic = function (a) {
	return {$: 13, a: a};
};
var $author$project$Agents$boolStr = function (b) {
	return b ? 'true' : 'false';
};
var $elm$html$Html$Attributes$disabled = $elm$html$Html$Attributes$boolProperty('disabled');
var $elm$html$Html$form = _VirtualDom_node('form');
var $elm$html$Html$input = _VirtualDom_node('input');
var $elm$html$Html$Events$alwaysPreventDefault = function (msg) {
	return _Utils_Tuple2(msg, true);
};
var $elm$virtual_dom$VirtualDom$MayPreventDefault = function (a) {
	return {$: 2, a: a};
};
var $elm$html$Html$Events$preventDefaultOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayPreventDefault(decoder));
	});
var $elm$html$Html$Events$onSubmit = function (msg) {
	return A2(
		$elm$html$Html$Events$preventDefaultOn,
		'submit',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysPreventDefault,
			$elm$json$Json$Decode$succeed(msg)));
};
var $elm$html$Html$Attributes$placeholder = $elm$html$Html$Attributes$stringProperty('placeholder');
var $elm$html$Html$Attributes$type_ = $elm$html$Html$Attributes$stringProperty('type');
var $elm$html$Html$ul = _VirtualDom_node('ul');
var $author$project$Agents$SelectRoom = function (a) {
	return {$: 7, a: a};
};
var $author$project$Agents$kindLabel = function (k) {
	switch (k) {
		case 'team':
			return 'Team';
		case 'shop':
			return 'Shopping';
		case 'service':
			return 'Service';
		case 'bot':
			return 'Blocked';
		default:
			return k;
	}
};
var $author$project$Agents$kindTone = function (k) {
	switch (k) {
		case 'team':
			return 'p-rose';
		case 'shop':
			return 'p-good';
		case 'bot':
			return 'p-bad';
		default:
			return 'p-neutral';
	}
};
var $elm$html$Html$li = _VirtualDom_node('li');
var $author$project$Agents$roomTitle = function (r) {
	return (r.w === 'team') ? A2($elm$core$Maybe$withDefault, 'Team room', r.as) : A2($elm$core$Maybe$withDefault, r.v, r.aq);
};
var $author$project$Agents$viewRoomRow = F2(
	function (current, r) {
		return A2(
			$elm$html$Html$li,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('room'),
							A2(
							$elm$html$Html$Attributes$attribute,
							'aria-current',
							$author$project$Agents$boolStr(
								_Utils_eq(
									current,
									$elm$core$Maybe$Just(r.b)))),
							$elm$html$Html$Events$onClick(
							$author$project$Agents$SelectRoom(r.b))
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('r1')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('who')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											$author$project$Agents$roomTitle(r))
										])),
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class(
											'pill ' + $author$project$Agents$kindTone(r.w))
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											$author$project$Agents$kindLabel(r.w))
										]))
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('intent')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									A2($elm$core$Maybe$withDefault, 'No messages yet', r.at))
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('handle')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									_Utils_ap(
										r.v,
										(!_Utils_eq(r.aa, $elm$core$Maybe$Nothing)) ? (' · ◆ on Band (' + ($elm$core$String$fromInt(r.ab) + ')')) : ''))
								]))
						]))
				]));
	});
var $author$project$Agents$viewRooms = function (model) {
	return _List_fromArray(
		[
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('panel-h')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('label')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Agent rooms')
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('pill p-neutral')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$elm$core$String$fromInt(
								$elm$core$List$length(model.W)))
						]))
				])),
			A2(
			$elm$html$Html$form,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('newroom'),
					$elm$html$Html$Events$onSubmit($author$project$Agents$CreateRoom)
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$input,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$value(model.X),
							$elm$html$Html$Events$onInput($author$project$Agents$Topic),
							$elm$html$Html$Attributes$placeholder('New team room, e.g. Weekend plan'),
							A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Team room topic')
						]),
					_List_Nil),
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('btn primary'),
							$elm$html$Html$Attributes$type_('submit'),
							$elm$html$Html$Attributes$disabled(
							$elm$core$String$isEmpty(
								$elm$core$String$trim(model.X)))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Open')
						]))
				])),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('roomfilters')
				]),
			A2(
				$elm$core$List$map,
				function (_v0) {
					var k = _v0.a;
					var l = _v0.b;
					return A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('button'),
								A2(
								$elm$html$Html$Attributes$attribute,
								'aria-pressed',
								$author$project$Agents$boolStr(
									_Utils_eq(model.O, k))),
								$elm$html$Html$Events$onClick(
								$author$project$Agents$SetFilter(k))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(l)
							]));
				},
				_List_fromArray(
					[
						_Utils_Tuple2('all', 'All'),
						_Utils_Tuple2('team', 'Team'),
						_Utils_Tuple2('shop', 'Shopping'),
						_Utils_Tuple2('service', 'Service'),
						_Utils_Tuple2('bot', 'Bots')
					]))),
			A2(
			$elm$html$Html$ul,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('rooms')
				]),
			A2(
				$elm$core$List$map,
				$author$project$Agents$viewRoomRow(model.a),
				A2(
					$elm$core$List$take,
					40,
					A2($author$project$Agents$visible, model.O, model.W))))
		]);
};
var $elm$html$Html$h3 = _VirtualDom_node('h3');
var $author$project$Agents$card = F4(
	function (name, role, live, body) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('integration')
				]),
			A2(
				$elm$core$List$cons,
				A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('integration-h')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('label')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(role)
										])),
									A2(
									$elm$html$Html$h3,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text(name)
										]))
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class(
									'pill ' + (live ? 'p-good' : 'p-neutral'))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									live ? 'Live' : 'Off')
								]))
						])),
				body));
	});
var $author$project$Agents$viewStatus = function (model) {
	var h = model.aQ;
	var on = function (f) {
		return A2(
			$elm$core$Maybe$withDefault,
			false,
			A2($elm$core$Maybe$map, f, h));
	};
	var roles = A2(
		$elm$core$Maybe$withDefault,
		_List_Nil,
		A2(
			$elm$core$Maybe$map,
			function ($) {
				return $.b3;
			},
			h));
	return A2(
		$elm$html$Html$div,
		_List_Nil,
		_List_fromArray(
			[
				function () {
				var _v0 = model.l;
				if (_v0 === 2) {
					return A2(
						$elm$html$Html$p,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('callout')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$b,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('API offline. ')
									])),
								$elm$html$Html$text('Showing sample data. Start the Tabard API (cd server && npm run dev) and this view connects on its own.')
							]));
				} else {
					return $elm$html$Html$text('');
				}
			}(),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('integrations')
					]),
				_List_fromArray(
					[
						A4(
						$author$project$Agents$card,
						'Band',
						'Agent-to-agent rooms',
						on(
							function ($) {
								return $.a2;
							}),
						on(
							function ($) {
								return $.a2;
							}) ? _List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Every room is a Band chat room. Agents post as themselves and @mention whoever should act; the concierge hands work to specialists through their Band inboxes.')
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('chips')
									]),
								A2(
									$elm$core$List$map,
									function (a) {
										return A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$classList(
													_List_fromArray(
														[
															_Utils_Tuple2('chip', true),
															_Utils_Tuple2('chip-bad', !a.bC)
														]))
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(
													A2($elm$core$Maybe$withDefault, '@' + a.y, a.v))
												]));
									},
									model.aM))
							]) : _List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Not connected. Add BAND_KEY_* agent keys to server/.env to mirror every room to Band.')
									]))
							])),
						A4(
						$author$project$Agents$card,
						'ZooWork',
						'Managed agents',
						on(
							function ($) {
								return $.bg;
							}),
						on(
							function ($) {
								return $.bg;
							}) ? _List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('The promo engine and concierge run as ZooWork agents (Claude Opus 5.5). The promo agent paints billboard artwork with ZooWork\'s designer skill.')
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('chips')
									]),
								A2(
									$elm$core$List$map,
									function (r) {
										return A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('chip')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('@' + (r + ' · live'))
												]));
									},
									roles))
							]) : _List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Simulated. Add ZOOWORK_API_KEY to server/.env to run agents on ZooWork.')
									]))
							])),
						A4(
						$author$project$Agents$card,
						'Tavily',
						'Web research',
						on(
							function ($) {
								return $.be;
							}),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text(
										on(
											function ($) {
												return $.be;
											}) ? 'Reads storefront links (TikTok Shop, Amazon, any site) to build a shop, and finds live competitor prices for every promo offer.' : 'Not configured. Add TAVILY_API_KEY to server/.env to import shops from a link and price offers against the web.')
									]))
							]))
					]))
			]));
};
var $author$project$Agents$Compose = function (a) {
	return {$: 9, a: a};
};
var $author$project$Agents$Mention = function (a) {
	return {$: 10, a: a};
};
var $author$project$Agents$Send = {$: 11};
var $author$project$Agents$agentKeys = _List_fromArray(
	['concierge', 'stylist', 'promo', 'service', 'returns', 'gatekeeper']);
var $elm$html$Html$h2 = _VirtualDom_node('h2');
var $elm$html$Html$Attributes$title = $elm$html$Html$Attributes$stringProperty('title');
var $elm$core$List$intersperse = F2(
	function (sep, xs) {
		if (!xs.b) {
			return _List_Nil;
		} else {
			var hd = xs.a;
			var tl = xs.b;
			var step = F2(
				function (x, rest) {
					return A2(
						$elm$core$List$cons,
						sep,
						A2($elm$core$List$cons, x, rest));
				});
			var spersed = A3($elm$core$List$foldr, step, _List_Nil, tl);
			return A2($elm$core$List$cons, hd, spersed);
		}
	});
var $author$project$Agents$mentions = function (s) {
	return A2(
		$elm$core$List$intersperse,
		$elm$html$Html$text(' '),
		A2(
			$elm$core$List$map,
			function (w) {
				return (A2($elm$core$String$startsWith, '@', w) && ($elm$core$String$length(w) > 1)) ? A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('mention')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(w)
						])) : $elm$html$Html$text(w);
			},
			$elm$core$String$words(s)));
};
var $author$project$Agents$viewMessage = function (m) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$classList(
				_List_fromArray(
					[
						_Utils_Tuple2('msg', true),
						_Utils_Tuple2('buyer', m.y === 'buyer'),
						_Utils_Tuple2('sys', m.y === 'sys')
					]))
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('from')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(m.aj),
						function () {
						var _v0 = m.ac;
						_v0$2:
						while (true) {
							if (!_v0.$) {
								switch (_v0.a) {
									case 'sent':
										return A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('bandok'),
													$elm$html$Html$Attributes$title('Delivered through Band')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('◆ Band')
												]));
									case 'failed':
										return A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('bandfail')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Band failed')
												]));
									default:
										break _v0$2;
								}
							} else {
								break _v0$2;
							}
						}
						return $elm$html$Html$text('');
					}()
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('body')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('text')
							]),
						$author$project$Agents$mentions(m.al)),
						($elm$core$List$isEmpty(m.M) && _Utils_eq(m.z, $elm$core$Maybe$Nothing)) ? $elm$html$Html$text('') : A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('cite')
							]),
						_Utils_ap(
							function () {
								var _v1 = m.z;
								_v1$2:
								while (true) {
									if (!_v1.$) {
										switch (_v1.a) {
											case 'zoowork':
												return _List_fromArray(
													[
														A2(
														$elm$html$Html$span,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('zw')
															]),
														_List_fromArray(
															[
																$elm$html$Html$text('ZooWork live')
															]))
													]);
											case 'sim':
												return _List_fromArray(
													[
														A2(
														$elm$html$Html$span,
														_List_Nil,
														_List_fromArray(
															[
																$elm$html$Html$text('simulated')
															]))
													]);
											default:
												break _v1$2;
										}
									} else {
										break _v1$2;
									}
								}
								return _List_Nil;
							}(),
							A2(
								$elm$core$List$map,
								function (c) {
									return A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$classList(
												_List_fromArray(
													[
														_Utils_Tuple2(
														'tv',
														A2($elm$core$String$startsWith, 'tavily', c))
													]))
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(c)
											]));
								},
								m.M)))
					]))
			]));
};
var $author$project$Agents$viewThread = function (model) {
	var _v0 = model.J;
	if (_v0.$ === 1) {
		return _List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('empty')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Choose a room, or open a team room and @mention agents.')
					]))
			]);
	} else {
		var t = _v0.a;
		return _List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('roomhead')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$h2,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text(
								$author$project$Agents$roomTitle(t.a))
							])),
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('meta')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								(t.a.w === 'team') ? 'Team room · the owner and the shop\'s agents' : (t.a.v + (' · via ' + t.a8)))
							])),
						function () {
						var _v1 = t.a.aa;
						if (!_v1.$) {
							var chat = _v1.a;
							return A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('pill p-good'),
										$elm$html$Html$Attributes$title('Band chat ' + chat)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										'On Band · ' + ($elm$core$String$fromInt(t.a.ab) + (' sent' + ((t.aN > 0) ? (' · ' + ($elm$core$String$fromInt(t.aN) + ' failed')) : ''))))
									]));
						} else {
							return A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('pill p-neutral')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										t.a3 ? 'Not on Band yet' : 'Local room')
									]));
						}
					}()
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('feed agents-feed'),
						$elm$html$Html$Attributes$id('agents-feed')
					]),
				_Utils_ap(
					A2($elm$core$List$map, $author$project$Agents$viewMessage, t.a4),
					A2(
						$elm$core$List$map,
						function (a) {
							return A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('msg sys')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('from')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('@' + a)
											])),
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('body')
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('text')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('thinking…')
													]))
											]))
									]));
						},
						t.bf))),
				function () {
				var _v2 = model.N;
				if (!_v2.$) {
					var e = _v2.a;
					return A2(
						$elm$html$Html$p,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('callout')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(e)
							]));
				} else {
					return $elm$html$Html$text('');
				}
			}(),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('mentionbar')
					]),
				A2(
					$elm$core$List$map,
					function (a) {
						return A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Events$onClick(
									$author$project$Agents$Mention(a))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('@' + a)
								]));
					},
					$author$project$Agents$agentKeys)),
				A2(
				$elm$html$Html$form,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('compose'),
						$elm$html$Html$Events$onSubmit($author$project$Agents$Send)
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$value(model.k),
								$elm$html$Html$Events$onInput($author$project$Agents$Compose),
								$elm$html$Html$Attributes$placeholder('Message the room as the owner. @mention agents to bring them in.'),
								A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Message')
							]),
						_List_Nil),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('btn primary'),
								$elm$html$Html$Attributes$type_('submit'),
								$elm$html$Html$Attributes$disabled(model.l !== 1)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Send to room')
							]))
					]))
			]);
	}
};
var $author$project$Agents$view = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('agents-view')
			]),
		_List_fromArray(
			[
				$author$project$Agents$viewStatus(model),
				$author$project$Agents$viewMerchantPicker(model),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('agents-grid')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$section,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('panel')
							]),
						$author$project$Agents$viewRooms(model)),
						A2(
						$elm$html$Html$section,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('panel')
							]),
						$author$project$Agents$viewThread(model))
					])),
				$author$project$Agents$viewAds(model)
			]));
};
var $author$project$Design$docSection = F4(
	function (anchor, eyebrow, title, body) {
		return A2(
			$elm$html$Html$section,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$id(anchor)
				]),
			A2(
				$elm$core$List$cons,
				A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('eyebrow')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(eyebrow)
						])),
				A2(
					$elm$core$List$cons,
					A2(
						$elm$html$Html$h2,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text(title)
							])),
					body)));
	});
var $elm$html$Html$table = _VirtualDom_node('table');
var $elm$html$Html$tbody = _VirtualDom_node('tbody');
var $elm$html$Html$td = _VirtualDom_node('td');
var $elm$html$Html$th = _VirtualDom_node('th');
var $elm$html$Html$thead = _VirtualDom_node('thead');
var $elm$html$Html$tr = _VirtualDom_node('tr');
var $author$project$Design$agents = function () {
	var row = function (cells) {
		return A2(
			$elm$html$Html$tr,
			_List_Nil,
			A2(
				$elm$core$List$map,
				function (c) {
					return A2(
						$elm$html$Html$td,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text(c)
							]));
				},
				cells));
	};
	return A4(
		$author$project$Design$docSection,
		'd-agents',
		'Merchant agents',
		'Who sits in the room',
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('tbl-wrap panel')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$table,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('agents')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$thead,
								_List_Nil,
								_List_fromArray(
									[
										A2(
										$elm$html$Html$tr,
										_List_Nil,
										A2(
											$elm$core$List$map,
											function (h) {
												return A2(
													$elm$html$Html$th,
													_List_Nil,
													_List_fromArray(
														[
															$elm$html$Html$text(h)
														]));
											},
											_List_fromArray(
												['Handle', 'P&L line', 'Job', 'Tools', 'Needs a person when'])))
									])),
								A2(
								$elm$html$Html$tbody,
								_List_Nil,
								_List_fromArray(
									[
										row(
										_List_fromArray(
											['@gatekeeper', 'Lose less', 'Verifies the buyer agent before a room opens. Rate-limits. Blocks bulk resale bots.', 'Band identity, Tavily, risk rules', 'Never. Blocks, then reports.'])),
										row(
										_List_fromArray(
											['@concierge', 'All', 'Speaks for the store in the room. Reads intent and @mentions the right specialist.', 'Store API, Moss', 'The buyer agent asks for a person'])),
										row(
										_List_fromArray(
											['@stylist', 'Sell more', 'Recommends items using fit history and what\'s in stock.', 'Moss catalog + customer', 'Never'])),
										row(
										_List_fromArray(
											['@promo', 'Sell more', 'Makes offers within margin rules. Checks competitor prices.', 'Tavily, pricing rules', 'Discount above 15%'])),
										row(
										_List_fromArray(
											['@service', 'Run leaner', 'Order status, exchanges, sizing questions, phone calls.', 'Store API, Moss, voice', 'The customer is upset or the issue repeats'])),
										row(
										_List_fromArray(
											['@returns', 'Lose less', 'Scores refund requests for abuse and checks them against policy.', 'Store API, Moss policy, Tavily', 'Over $150 or risk above 60']))
									]))
							]))
					]))
			]));
}();
var $author$project$Design$architectureChart = 'flowchart LR\n  subgraph S["Shopper side"]\n    MU["Muse agent"]\n    DO["Dots agent"]\n    PH["Customer on phone"]\n  end\n  subgraph E["Entry"]\n    GK["Gatekeeper<br/>identity + rate limit"]\n    VO["Voice gateway<br/>LiveKit / Pipecat"]\n  end\n  subgraph B["Band"]\n    RM(("Session room<br/>one per shopper"))\n  end\n  subgraph Z["ZooWork managed agents"]\n    CO["Concierge"]\n    ST["Stylist"]\n    PR["Promo"]\n    SV["Service"]\n    RS["Returns screener"]\n  end\n  subgraph K["Knowledge and tools"]\n    MO[("Moss indexes<br/>catalog, policy, customer")]\n    TV["Tavily<br/>web search"]\n    API["Store API<br/>orders, stock, refunds"]\n  end\n  subgraph T["Tabard API"]\n    DB[("Express + SQLite<br/>rooms, messages, decisions")]\n  end\n  subgraph C["Tabard front end"]\n    UI["Merchant console<br/>one store"]\n    MC["Mission control<br/>every store"]\n  end\n  MU --> GK\n  DO --> GK\n  GK --> RM\n  PH --> VO --> SV\n  RM <--> CO\n  CO -. "@mention" .-> ST\n  CO -. "@mention" .-> PR\n  CO -. "@mention" .-> SV\n  CO -. "@mention" .-> RS\n  ST --> MO\n  SV --> MO\n  RS --> MO\n  PR --> TV\n  GK --> TV\n  RS --> API\n  CO --> API\n  RM -- "room events" --> DB\n  RS -- "approval request" --> DB\n  DB -- "SSE per merchant" --> UI\n  DB -- "SSE fan-in" --> MC';
var $elm$virtual_dom$VirtualDom$node = function (tag) {
	return _VirtualDom_node(
		_VirtualDom_noScript(tag));
};
var $elm$html$Html$node = $elm$virtual_dom$VirtualDom$node;
var $author$project$Design$diagram = function (source) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('diagram')
			]),
		_List_fromArray(
			[
				A3(
				$elm$html$Html$node,
				'mermaid-diagram',
				_List_fromArray(
					[
						A2($elm$html$Html$Attributes$attribute, 'src', source)
					]),
				_List_Nil)
			]));
};
var $author$project$Design$architecture = A4(
	$author$project$Design$docSection,
	'd-arch',
	'Architecture',
	'Five layers',
	_List_fromArray(
		[
			A2(
			$elm$html$Html$p,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text('Buyer agents enter through a gatekeeper. Each session becomes a Band room. Merchant agents run as ZooWork managed agents, pull context from Moss and the web from Tavily, and act on the store through one commerce API. The Tabard API writes every room message and decision to SQLite and streams them out: per merchant to the console, and across all merchants to Mission control.')
				])),
			$author$project$Design$diagram($author$project$Design$architectureChart),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('callout')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$b,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Build note.')
						])),
					$elm$html$Html$text(' Muse and Dots can\'t join Band rooms today. For the demo, build the buyer agents yourselves: a Claude agent on Band that plays \"Priya\'s Muse agent\", with a persona and a shopping goal. Keep the gatekeeper interface generic so a real buyer agent could connect later through an HTTP or MCP endpoint.')
				]))
		]));
var $elm$html$Html$pre = _VirtualDom_node('pre');
var $author$project$Design$codeBlock = function (source) {
	return A2(
		$elm$html$Html$pre,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('code')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(source)
			]));
};
var $author$project$Design$dataModel = A4(
	$author$project$Design$docSection,
	'd-data',
	'Data model',
	'Thirteen tables, one SQLite file',
	_List_fromArray(
		[
			A2(
			$elm$html$Html$p,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text('Every table except merchants carries merchant_id, so one database holds the whole fleet. Mission control reads across it; the console reads one merchant\'s slice.')
				])),
			$author$project$Design$codeBlock('merchants     (id, slug, name, category, owner, city, currency, timezone, plan,\n               discount_cap, refund_review_over, risk_threshold, house_offer, simulate,\n               description, source_url, source_platform, theme, import_notes)\nagents        (merchant_id, key, handle, name, line, job, version, zoowork_agent_id, enabled, actions)\ncustomers     (merchant_id, name, tier, ltv, return_rate, risk, phone, city, last_order)\nproducts      (merchant_id, sku, name, category, price, cost, stock, sold, image_url, product_url)\nrooms         (merchant_id, handle, platform, kind shop|service|bot, customer_id, intent,\n               state open|sold|left|blocked|resolved, opened_at, closed_at)\nmessages      (merchant_id, room_id, sender, role buyer|agent|staff|sys, text, cites, source zoowork|sim)\ntickets       (merchant_id, room_id, customer_id, topic, status agent|staff|resolved)\ntransactions  (merchant_id, code, sku, room_id, buyer_handle, customer_id, qty, amount,\n               type order|refund, flags, status, screen)\ncalls         (merchant_id, customer_id, topic, status ringing|live|ended, staff, lines)\napprovals     (merchant_id, code, customer_id, order_code, amount, risk, recommendation, reasons, status)\npromos        (merchant_id, prompt, headline, sku, pct, price, margin, competitor, status draft|live|retired)\ndecisions     (merchant_id, agent, decision, basis, version, created_at)\nevents        (merchant_id, actor, text, kind, created_at)    -- the shop\'s activity feed')
		]));
var $elm$html$Html$ol = _VirtualDom_node('ol');
var $author$project$Design$steps = function (items) {
	return A2(
		$elm$html$Html$ol,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('steps')
			]),
		A2(
			$elm$core$List$map,
			function (content) {
				return A2(
					$elm$html$Html$li,
					_List_Nil,
					_List_fromArray(
						[
							A2($elm$html$Html$div, _List_Nil, content)
						]));
			},
			items));
};
var $author$project$Design$demo = A4(
	$author$project$Design$docSection,
	'd-demo',
	'Demo script',
	'Three minutes, three P&L lines, one fleet view',
	_List_fromArray(
		[
			$author$project$Design$steps(
			_List_fromArray(
				[
					_List_fromArray(
					[
						A2(
						$elm$html$Html$b,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Sell more.')
							])),
						$elm$html$Html$text(' Priya\'s Muse agent asks for a wool coat. Stylist and promo answer in the room. The order lands and the revenue figure goes up.')
					]),
					_List_fromArray(
					[
						A2(
						$elm$html$Html$b,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Lose less.')
							])),
						$elm$html$Html$text(' A bot claiming to be Muse asks for 40 limited sneakers. The gatekeeper finds no valid signature, runs a Tavily lookup on the operator and blocks it. It shows up in the Security tab.')
					]),
					_List_fromArray(
					[
						A2(
						$elm$html$Html$b,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Lose less.')
							])),
						$elm$html$Html$text(' Marcus\'s Dots agent asks for a third refund. The screener flags a resale listing and sends it to the owner, who taps \"Offer exchange\".')
					]),
					_List_fromArray(
					[
						A2(
						$elm$html$Html$b,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Run leaner.')
							])),
						$elm$html$Html$text(' From Dana\'s desk, click Call customer. The service agent explains the delivery delay, with the Moss lookups shown as they happen.')
					]),
					_List_fromArray(
					[
						A2(
						$elm$html$Html$b,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Every store at once.')
							])),
						$elm$html$Html$text(' Open Mission control. Both stores\' agents talk on the wire live. Click @dots/* in the graph to see only Dots traffic, then open a room to read the whole thread.')
					])
				]))
		]));
var $author$project$Design$flow = A4(
	$author$project$Design$docSection,
	'd-flow',
	'A session, step by step',
	'From buyer agent to order',
	_List_fromArray(
		[
			$author$project$Design$diagram('sequenceDiagram\n  participant B as Buyer agent (Muse)\n  participant G as @gatekeeper\n  participant R as Band room\n  participant C as @concierge\n  participant S as @stylist\n  participant P as @promo\n  participant U as Console (owner)\n  B->>G: connect + signed intent\n  G->>G: check handle, signature, rate\n  G->>R: open room, invite buyer + concierge\n  R-->>U: room.opened\n  B->>R: intent: wool coat, M, under $300\n  C->>S: @stylist suggest from stock + fit history\n  S->>R: recommendation (2 coats, Moss hits)\n  C->>P: @promo price for returning customer\n  P->>R: offer $268 (Tavily: competitor at $289)\n  B->>R: cart + checkout\n  C->>R: order LO-56120 confirmed\n  R-->>U: order.created, revenue +$268')
		]));
var $author$project$Design$card = F3(
	function (role, title, body) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('sp')
				]),
			A2(
				$elm$core$List$cons,
				A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('role')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(role)
						])),
				A2(
					$elm$core$List$cons,
					A2(
						$elm$html$Html$h3,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text(title)
							])),
					body)));
	});
var $author$project$Design$mono = function (s) {
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('mono')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(s)
			]));
};
var $author$project$Design$frontEnd = A4(
	$author$project$Design$docSection,
	'd-front',
	'Front end',
	'One app, three views',
	_List_fromArray(
		[
			A2(
			$elm$html$Html$p,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text('Merchant console is one store\'s view: everything is clickable from one screen, so a judge can follow a session without changing pages. Mission control is the view across every store. System design is this document.')
				])),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('screens')
				]),
			_List_fromArray(
				[
					A3(
					$author$project$Design$card,
					'Left',
					'Live rooms',
					_List_fromArray(
						[
							A2(
							$elm$html$Html$p,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('One row per Band room: which platform the buyer agent came from, its intent, and its state (negotiating, refund, service, blocked). Click a row to open it.')
								]))
						])),
					A3(
					$author$project$Design$card,
					'Center',
					'Room tabs',
					_List_fromArray(
						[
							A2(
							$elm$html$Html$p,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Conversation (agent-to-agent transcript with payloads and the search hits behind each answer), Refunds (approval queue), Security & fraud (agents seen, signals), Decision log (with agent versions).')
								]))
						])),
					A3(
					$author$project$Design$card,
					'Right',
					'Customer desk',
					_List_fromArray(
						[
							A2(
							$elm$html$Html$p,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Who the buyer agent represents: lifetime value, return rate, risk, sizes, purchase history. The Call customer button starts a voice session with a live transcript.')
								]))
						]))
				])),
			A2(
			$elm$html$Html$h3,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text('Stack')
				])),
			A2(
			$elm$html$Html$ul,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$li,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$elm$html$Html$b,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Front end:')
								])),
							$elm$html$Html$text(' Elm, compiled to one page ('),
							$author$project$Design$mono('copilot.html'),
							$elm$html$Html$text('). Live events arrive over Server-Sent Events through a port; if the API is down, the app falls back to sample data and retries.')
						])),
					A2(
					$elm$html$Html$li,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$elm$html$Html$b,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Backend:')
								])),
							$elm$html$Html$text(' the Tabard API, Node + Express + SQLite on port 4000. REST under '),
							$author$project$Design$mono('/api/merchants/:id/…'),
							$elm$html$Html$text(' for one store, '),
							$author$project$Design$mono('/api/mission/…'),
							$elm$html$Html$text(' across all stores, '),
							$author$project$Design$mono('/api/import/…'),
							$elm$html$Html$text(' to create a merchant from a store link (Tavily gathers the data, Claude or rules structure it), and SSE streams for one store and for all of them. It runs a shop simulation for each merchant while someone is watching.')
						])),
					A2(
					$elm$html$Html$li,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$elm$html$Html$b,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Agents:')
								])),
							$elm$html$Html$text(' ZooWork managed agents. Each one connects to Band through the Band SDK adapter.')
						])),
					A2(
					$elm$html$Html$li,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$elm$html$Html$b,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Store:')
								])),
							$elm$html$Html$text(' a Shopify dev store, or a seeded mock API with ~40 products and ~20 customers.')
						]))
				]))
		]));
var $author$project$Design$idea = A4(
	$author$project$Design$docSection,
	'd-idea',
	'The idea',
	'Shoppers now arrive as agents. Tabard gives the merchant agents to answer them.',
	_List_fromArray(
		[
			A2(
			$elm$html$Html$p,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('lede')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('When a buyer agent from Muse or Dots shows up, Tabard opens a Band room for that session. The merchant\'s own agents join it: they verify the buyer agent, advise, price, check out, handle returns and turn away bad bots. The owner watches every room live from one console and steps in only when an agent asks for approval.')
				])),
			A2(
			$elm$html$Html$p,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text('Each merchant agent maps to one line of the P&L from the deck: '),
					A2(
					$elm$html$Html$b,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Sell more')
						])),
					$elm$html$Html$text(' (stylist, promo, win-back), '),
					A2(
					$elm$html$Html$b,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Run leaner')
						])),
					$elm$html$Html$text(' (service, store ops), '),
					A2(
					$elm$html$Html$b,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Lose less')
						])),
					$elm$html$Html$text(' (returns screener, gatekeeper).')
				]))
		]));
var $author$project$Design$liveFlowChart = 'sequenceDiagram\n  participant B as Shopper agent (Band)\n  participant C as @concierge (Band)\n  participant S as @stylist (Band)\n  participant P as @promo (Band + ZooWork)\n  participant T as Tavily\n  B->>C: "Do you have linen trousers in stock?"\n  C->>S: @stylist suggest something in stock\n  Note over S: pulls the request from its Band inbox\n  S->>C: "Try the linen wide-leg trouser, 23 in stock"\n  C->>P: @promo best price for this buyer?\n  P->>T: competitor prices (when drafting offers)\n  P->>B: "$131 for you (returning-customer rate)"\n  B->>C: "Accepted. Checking out."\n';
var $author$project$Design$integrations = A4(
	$author$project$Design$docSection,
	'd-live',
	'Sponsors, as built',
	'How Band, ZooWork and Tavily run in the shop today',
	_List_fromArray(
		[
			A2(
			$elm$html$Html$p,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('lede')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('Each sponsor is wired into the running app, not just the design. The Agents & integrations tab shows their live status, every Band room, and the ads the promo agent made.')
				])),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('sponsors')
				]),
			_List_fromArray(
				[
					A3(
					$author$project$Design$card,
					'Agent-to-agent rooms',
					'Band',
					_List_fromArray(
						[
							A2(
							$elm$html$Html$p,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Every Tabard room is a real Band chat room. Seven Band agents take part: concierge, stylist, promo, service, returns, gatekeeper, and a shopper agent that speaks for Muse and Dots buyers.')
								])),
							A2(
							$elm$html$Html$ul,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Each message is posted as the agent who said it, with @mentions for whoever should act.')
										])),
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('The concierge hands work to @stylist and @promo through Band: the specialist pulls the request from its own Band inbox ('),
											$author$project$Design$mono('GET /messages/next'),
											$elm$html$Html$text('), answers in the room and marks it processed.')
										])),
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('The owner opens team rooms and @mentions agents to discuss a plan.')
										]))
								]))
						])),
					A3(
					$author$project$Design$card,
					'Managed agents',
					'ZooWork',
					_List_fromArray(
						[
							A2(
							$elm$html$Html$p,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('The promo engine and the concierge are ZooWork managed agents on Claude Opus 5.5, one per store and role, created on first use with the role in their persona.')
								])),
							A2(
							$elm$html$Html$ul,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Promo agent picks the product, discount and copy; store rules still set price, margin and when the owner must approve.')
										])),
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('The same agent paints a 2400×840 billboard with ZooWork\'s designer skill; the owner chooses whether the room\'s board shows it.')
										])),
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('A shared importer agent turns scraped storefront text into a shop.')
										]))
								]))
						])),
					A3(
					$author$project$Design$card,
					'Web research',
					'Tavily',
					_List_fromArray(
						[
							A2(
							$elm$html$Html$p,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Brings the outside web into the store.')
								])),
							A2(
							$elm$html$Html$ul,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Open a shop from a TikTok Shop, Amazon or any store link: Tavily Extract reads the page, Tavily Search fills in what the page hides.')
										])),
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Every promo offer is priced against the web: the competitor price is the median of prices Tavily finds for that product.')
										]))
								]))
						]))
				])),
			A2(
			$elm$html$Html$h3,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text('One shopping session, end to end')
				])),
			$author$project$Design$diagram($author$project$Design$liveFlowChart)
		]));
var $author$project$Design$mission = function () {
	var row = function (cells) {
		return A2(
			$elm$html$Html$tr,
			_List_Nil,
			A2(
				$elm$core$List$map,
				function (c) {
					return A2(
						$elm$html$Html$td,
						_List_Nil,
						_List_fromArray(
							[c]));
				},
				cells));
	};
	return A4(
		$author$project$Design$docSection,
		'd-mission',
		'Mission control',
		'Every merchant\'s agents, every conversation, one screen',
		_List_fromArray(
			[
				A2(
				$elm$html$Html$p,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('lede')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('The console shows one store. Mission control answers the operator\'s question for the whole fleet: which of our agents are talking to which outside agents right now, what are they saying, and where does a person need to step in.')
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('screens')
					]),
				_List_fromArray(
					[
						A3(
						$author$project$Design$card,
						'Left',
						'Merchants',
						_List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Every store with its agents on duty, open rooms, revenue, bots blocked and decisions waiting. Click one to narrow everything to that store.')
									]))
							])),
						A3(
						$author$project$Design$card,
						'Center',
						'The wire',
						_List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Every agent message across all stores, newest first, as sender → receivers. Filter by lane, platform, handle or text. Pause holds new messages aside without losing them.')
									]))
							])),
						A3(
						$author$project$Design$card,
						'Right',
						'Thread + graph',
						_List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Click a message to open its whole room, with that message highlighted. The graph shows who talks to whom in the last hour; line weight is message count. Click a handle to filter the wire.')
									]))
							]))
					])),
				A2(
				$elm$html$Html$h3,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('Four lanes')
					])),
				A2(
				$elm$html$Html$ul,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$li,
						_List_Nil,
						_List_fromArray(
							[
								A2(
								$elm$html$Html$b,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Across companies.')
									])),
								$elm$html$Html$text(' A merchant agent and an outside agent (Muse, Dots, an unverified bot). This is the new channel the product exists for.')
							])),
						A2(
						$elm$html$Html$li,
						_List_Nil,
						_List_fromArray(
							[
								A2(
								$elm$html$Html$b,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Inside the store.')
									])),
								$elm$html$Html$text(' Merchant agents handing work to each other: the concierge @mentions the stylist, the service agent hands a refund to @returns.')
							])),
						A2(
						$elm$html$Html$li,
						_List_Nil,
						_List_fromArray(
							[
								A2(
								$elm$html$Html$b,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Staff.')
									])),
								$elm$html$Html$text(' A person stepped into a room.')
							])),
						A2(
						$elm$html$Html$li,
						_List_Nil,
						_List_fromArray(
							[
								A2(
								$elm$html$Html$b,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('System.')
									])),
								$elm$html$Html$text(' Gatekeeper verdicts and room notes.')
							]))
					])),
				A2(
				$elm$html$Html$h3,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('Who a message is to')
					])),
				A2(
				$elm$html$Html$p,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('Band rooms are group chats, so the API derives receivers: the handles @mentioned in the text; otherwise an agent or staff message goes to the room\'s buyer agent, and a buyer message goes to @concierge. System messages have no receiver, and a sender is never its own receiver. The graph collapses outside agents to their platform ('),
						$author$project$Design$mono('@muse/*'),
						$elm$html$Html$text(', '),
						$author$project$Design$mono('@dots/*'),
						$elm$html$Html$text(', '),
						$author$project$Design$mono('@unverified/*'),
						$elm$html$Html$text(') so it stays readable.')
					])),
				A2(
				$elm$html$Html$h3,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('Endpoints')
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('tbl-wrap panel')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$table,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('agents')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$thead,
								_List_Nil,
								_List_fromArray(
									[
										A2(
										$elm$html$Html$tr,
										_List_Nil,
										A2(
											$elm$core$List$map,
											function (h) {
												return A2(
													$elm$html$Html$th,
													_List_Nil,
													_List_fromArray(
														[
															$elm$html$Html$text(h)
														]));
											},
											_List_fromArray(
												['Endpoint', 'Returns'])))
									])),
								A2(
								$elm$html$Html$tbody,
								_List_Nil,
								_List_fromArray(
									[
										row(
										_List_fromArray(
											[
												$elm$html$Html$text('GET /api/mission'),
												$elm$html$Html$text('Fleet totals, plus each merchant with its counts and agents (busy, enabled, ZooWork or simulated, messages in the last hour)')
											])),
										row(
										_List_fromArray(
											[
												$elm$html$Html$text('GET /api/mission/wire'),
												$elm$html$Html$text('Agent messages oldest → newest. Filters: merchant, agent (matches sender or receiver), platform, after (message id, for polling), limit (≤ 500)')
											])),
										row(
										_List_fromArray(
											[
												$elm$html$Html$text('GET /api/mission/links?minutes=60'),
												$elm$html$Html$text('Sender → receiver pairs with message counts, busiest first (window up to 24 h)')
											])),
										row(
										_List_fromArray(
											[
												$elm$html$Html$text('GET /api/mission/rooms/:merchant/:room'),
												$elm$html$Html$text('One room\'s full thread, in the console\'s Room shape')
											])),
										row(
										_List_fromArray(
											[
												$elm$html$Html$text('GET /api/mission/stream'),
												$elm$html$Html$text('SSE. On connect: totals and every merchant. Then message events as they happen, totals when they change (at most every 2 s), merchant events when a store\'s counts change')
											]))
									]))
							]))
					])),
				$author$project$Design$codeBlock('// one wire item\n{ "id": 12345, "time": "10:41:03", "merchantId": 1, "merchant": "Linden & Oak",\n  "roomId": "r88", "roomKind": "shop", "platform": "Muse",\n  "from": "@promo", "fromRole": "agent", "to": ["@muse/priya.r"],\n  "text": "$268. That\'s the 10% returning-customer rate…",\n  "cites": ["tavily · competitor price · 820 ms"], "source": "zoowork" }\n\n// stream events\n{ "type": "message",  ...wire item }\n{ "type": "totals",   "merchants": 2, "live": 2, "openRooms": 7, "messagesLastHour": 143,\n                      "approvalsWaiting": 3, "blockedToday": 5, "revenueToday": 3412 }\n{ "type": "merchant", ...one merchant from GET /api/mission }'),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('callout')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$b,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Reliability.')
							])),
						$elm$html$Html$text(' The view loads the snapshot and the last 200 messages over REST, then switches to the stream. If the stream drops, it polls the wire every 3 s with after=<last id> and drops duplicates by id. If the API is unreachable, it shows sample data and retries every 10 s. While a mission stream is open, every merchant with simulation on keeps running.')
					]))
			]));
}();
var $elm$html$Html$nav = _VirtualDom_node('nav');
var $author$project$Design$protocol = A4(
	$author$project$Design$docSection,
	'd-room',
	'Room protocol',
	'Messages carry plain text and a typed payload',
	_List_fromArray(
		[
			A2(
			$elm$html$Html$p,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text('Agents talk in natural language so humans can follow along, and attach a JSON payload so the other side can act on it without guessing. The console renders the text and shows the payload under it.')
				])),
			$author$project$Design$codeBlock('// buyer agent → room\n{ "type": "intent",\n  "on_behalf_of": { "email_hash": "sha256:9f2c…", "consent": "purchase_upto_300_usd" },\n  "goal": "wool coat, size M, under $300, arrives by Fri Oct 9",\n  "platform": "muse", "signature": "ed25519:…" }\n\n// @promo → buyer agent\n{ "type": "offer", "offer_id": "of_8812", "sku": "LO-COAT-CAMEL-M",\n  "price": 268.00, "list": 298.00, "reason": "returning_customer_10pct",\n  "expires_at": "2026-10-03T18:00:00Z" }\n\n// @returns → console (needs a person)\n{ "type": "approval_request", "case": "RF-2207", "amount": 214.00,\n  "risk": 72, "signals": ["3rd return in 60d", "listed on resale site"],\n  "recommend": "deny_refund_offer_exchange" }\n\nMessage types: intent · question · recommendation · offer · cart · checkout\n               · refund_request · verdict · approval_request · handoff · block')
		]));
var $author$project$Design$risks = A4(
	$author$project$Design$docSection,
	'd-risks',
	'Risks and open questions',
	'Settle these first',
	_List_fromArray(
		[
			A2(
			$elm$html$Html$ul,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$li,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$elm$html$Html$b,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Real buyer agents.')
								])),
							$elm$html$Html$text(' No public way exists yet for Muse or Dots to join a Band room. Simulate them, and say so in the pitch.')
						])),
					A2(
					$elm$html$Html$li,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$elm$html$Html$b,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Identity.')
								])),
							$elm$html$Html$text(' The \"signature\" check is a design placeholder. In the demo, the gatekeeper trusts known Band handles and a shared secret per simulated platform.')
						])),
					A2(
					$elm$html$Html$li,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$elm$html$Html$b,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Voice in time.')
								])),
							$elm$html$Html$text(' Phone calls are the riskiest part. Fallback: a browser voice session, or a scripted call that still makes live Moss lookups.')
						])),
					A2(
					$elm$html$Html$li,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$elm$html$Html$b,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Entire\'s role.')
								])),
							$elm$html$Html$text(' Entire works on the development side (git checkpoints of agent sessions), not at runtime. Show it in the decision log as agent versions, and don\'t present it as a runtime monitor.')
						])),
					A2(
					$elm$html$Html$li,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$elm$html$Html$b,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Scope.')
								])),
							$elm$html$Html$text(' Build three agents well (concierge, stylist, returns) before adding promo and service.')
						]))
				]))
		]));
var $author$project$Design$sponsors = A4(
	$author$project$Design$docSection,
	'd-sponsors',
	'Sponsor roles',
	'Each sponsor does one clear job',
	_List_fromArray(
		[
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('sponsors')
				]),
			_List_fromArray(
				[
					A3(
					$author$project$Design$card,
					'Agent runtime',
					'ZooWork',
					_List_fromArray(
						[
							A2(
							$elm$html$Html$p,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Hosts every merchant agent as a managed agent, with its tools and the store\'s knowledge.')
								])),
							A2(
							$elm$html$Html$ul,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Concierge, stylist, promo, service, returns screener')
										])),
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Human approval step for refunds over $150 and for any price override. This is the \"Approve\" button in the console.')
										])),
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Builder UI lets the merchant edit agent policy without code')
										]))
								]))
						])),
					A3(
					$author$project$Design$card,
					'Agent-to-agent channel',
					'Band',
					_List_fromArray(
						[
							A2(
							$elm$html$Html$p,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('One room per shopper session. The buyer agent, merchant agents and staff all share it.')
								])),
							A2(
							$elm$html$Html$ul,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('@mentions route work: the concierge mentions @returns, and only that agent reads the message')
										])),
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Stable handles let the gatekeeper check who an agent is')
										])),
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Staff join the same room to take over')
										]))
								]))
						])),
					A3(
					$author$project$Design$card,
					'Fast retrieval',
					'Moss',
					_List_fromArray(
						[
							A2(
							$elm$html$Html$p,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Lookups under 10 ms over the catalog, policies and customer history. Fast enough for a live phone call.')
								])),
							A2(
							$elm$html$Html$ul,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Indexes: '),
											$author$project$Design$mono('catalog'),
											$elm$html$Html$text(', '),
											$author$project$Design$mono('policies'),
											$elm$html$Html$text(', '),
											$author$project$Design$mono('customer/{id}')
										])),
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Used by voice and chat agents on every turn')
										])),
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Not a voice engine: pair it with LiveKit or Pipecat')
										]))
								]))
						])),
					A3(
					$author$project$Design$card,
					'Outside world',
					'Tavily',
					_List_fromArray(
						[
							A2(
							$elm$html$Html$p,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Web search when the answer isn\'t in the store\'s own data.')
								])),
							A2(
							$elm$html$Html$ul,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Promo: competitor prices for the same item')
										])),
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Gatekeeper: look up an unknown agent operator or domain')
										])),
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Returns: check a resale listing for an item reported as defective')
										]))
								]))
						])),
					A3(
					$author$project$Design$card,
					'Agent provenance',
					'Entire',
					_List_fromArray(
						[
							A2(
							$elm$html$Html$p,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Checkpoints record the agent sessions behind each change to the agents\' prompts, policies and code.')
								])),
							A2(
							$elm$html$Html$ul,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('The decision log shows which agent version made each call')
										])),
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Lets you answer \"why did the screener start refusing this?\"')
										])),
									A2(
									$elm$html$Html$li,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Also documents your own hackathon build')
										]))
								]))
						]))
				]))
		]));
var $author$project$Design$toc = _List_fromArray(
	[
		_Utils_Tuple2('d-idea', 'The idea'),
		_Utils_Tuple2('d-arch', 'Architecture'),
		_Utils_Tuple2('d-sponsors', 'Sponsor roles'),
		_Utils_Tuple2('d-live', 'Sponsors, as built'),
		_Utils_Tuple2('d-agents', 'Merchant agents'),
		_Utils_Tuple2('d-room', 'Room protocol'),
		_Utils_Tuple2('d-flow', 'A session, step by step'),
		_Utils_Tuple2('d-voice', 'Phone calls'),
		_Utils_Tuple2('d-front', 'Front end'),
		_Utils_Tuple2('d-mission', 'Mission control'),
		_Utils_Tuple2('d-data', 'Data model'),
		_Utils_Tuple2('d-demo', 'Demo script'),
		_Utils_Tuple2('d-risks', 'Risks and open questions')
	]);
var $author$project$Design$voice = A4(
	$author$project$Design$docSection,
	'd-voice',
	'Phone calls',
	'The Call button on the customer desk',
	_List_fromArray(
		[
			$author$project$Design$steps(
			_List_fromArray(
				[
					_List_fromArray(
					[
						$elm$html$Html$text('The owner clicks '),
						A2(
						$elm$html$Html$b,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Call customer')
							])),
						$elm$html$Html$text('. The console asks the backend to start an outbound call through LiveKit or Pipecat with Twilio for the phone line. For the demo, a browser call is enough.')
					]),
					_List_fromArray(
					[
						$elm$html$Html$text('The '),
						A2(
						$elm$html$Html$b,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('@service')
							])),
						$elm$html$Html$text(' agent runs the voice loop: speech to text, then the LLM, then text to speech.')
					]),
					_List_fromArray(
					[
						$elm$html$Html$text('On every caller turn, '),
						A2(
						$elm$html$Html$b,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Moss')
							])),
						$elm$html$Html$text(' searches '),
						$author$project$Design$mono('customer/{id}'),
						$elm$html$Html$text(' and '),
						$author$project$Design$mono('policies'),
						$elm$html$Html$text(' and adds the hits to the prompt. Lookups take under 10 ms, so the agent doesn\'t leave silence on the line.')
					]),
					_List_fromArray(
					[
						$elm$html$Html$text('The call transcript is posted into the same Band room, so the call and the agent chat end up in one history.')
					])
				]))
		]));
var $author$project$Design$view = A2(
	$elm$html$Html$div,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('doc')
		]),
	_List_fromArray(
		[
			A2(
			$elm$html$Html$nav,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('toc'),
					A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Design sections')
				]),
			A2(
				$elm$core$List$map,
				function (_v0) {
					var anchor = _v0.a;
					var label = _v0.b;
					return A2(
						$elm$html$Html$a,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$href('#' + anchor)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(label)
							]));
				},
				$author$project$Design$toc)),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('docbody')
				]),
			_List_fromArray(
				[$author$project$Design$idea, $author$project$Design$architecture, $author$project$Design$sponsors, $author$project$Design$integrations, $author$project$Design$agents, $author$project$Design$protocol, $author$project$Design$flow, $author$project$Design$voice, $author$project$Design$frontEnd, $author$project$Design$mission, $author$project$Design$dataModel, $author$project$Design$demo, $author$project$Design$risks]))
		]));
var $author$project$Mission$FilterHandle = function (a) {
	return {$: 11, a: a};
};
var $author$project$Mission$FilterPlatform = function (a) {
	return {$: 12, a: a};
};
var $author$project$Mission$Search = function (a) {
	return {$: 14, a: a};
};
var $author$project$Mission$TogglePause = {$: 9};
var $elm$html$Html$aside = _VirtualDom_node('aside');
var $author$project$Mission$connBadge = function (conn) {
	switch (conn) {
		case 1:
			return A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('pill p-good')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('dot')
							]),
						_List_Nil),
						$elm$html$Html$text('Live stream')
					]));
		case 2:
			return A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('pill p-warn')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Live · polling every 3 s')
					]));
		case 0:
			return A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('pill p-neutral')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Connecting…')
					]));
		default:
			return A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('pill p-rose')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Offline · sample data')
					]));
	}
};
var $author$project$Mission$connNote = function (model) {
	var _v0 = model.l;
	if (_v0 === 3) {
		return 'Can\'t reach ' + (model.u + '/mission. Start the Tabard API (cd server && npm run dev). Retrying every 10 s.');
	} else {
		return 'Reading ' + (model.u + '/mission · every merchant, every agent conversation');
	}
};
var $elm$svg$Svg$trustedNode = _VirtualDom_nodeNS('http://www.w3.org/2000/svg');
var $elm$svg$Svg$circle = $elm$svg$Svg$trustedNode('circle');
var $elm$svg$Svg$Attributes$class = _VirtualDom_attribute('class');
var $elm$svg$Svg$Attributes$cx = _VirtualDom_attribute('cx');
var $elm$svg$Svg$Attributes$cy = _VirtualDom_attribute('cy');
var $elm$svg$Svg$Attributes$d = _VirtualDom_attribute('d');
var $elm$core$String$fromFloat = _String_fromNumber;
var $author$project$Mission$f = $elm$core$String$fromFloat;
var $elm$svg$Svg$g = $elm$svg$Svg$trustedNode('g');
var $author$project$Mission$collapse = F3(
	function (ours, platform, handle) {
		return (A2($elm$core$Set$member, handle, ours) || A2($elm$core$String$startsWith, '@staff', handle)) ? handle : ('@' + ($elm$core$String$toLower(platform) + '/*'));
	});
var $author$project$Mission$merchantHandles = function (model) {
	return $elm$core$Set$fromList(
		_Utils_ap(
			_List_fromArray(
				['@gatekeeper', '@concierge', '@stylist', '@promo', '@service', '@returns']),
			A2(
				$elm$core$List$concatMap,
				A2(
					$elm$core$Basics$composeR,
					function ($) {
						return $.Z;
					},
					$elm$core$List$map(
						function ($) {
							return $.v;
						})),
				model.ay)));
};
var $author$project$Mission$links = function (model) {
	var _v0 = _Utils_Tuple2(model.aY, model.q);
	if ((!_v0.a.$) && (_v0.b.$ === 1)) {
		var ls = _v0.a.a;
		var _v1 = _v0.b;
		return ls;
	} else {
		var ours = $author$project$Mission$merchantHandles(model);
		var pairs = A2(
			$elm$core$List$concatMap,
			function (i) {
				return A2(
					$elm$core$List$map,
					function (t) {
						return _Utils_Tuple2(
							A3($author$project$Mission$collapse, ours, i.a8, i.br),
							A3($author$project$Mission$collapse, ours, i.a8, t));
					},
					i.g);
			},
			A2(
				$elm$core$List$filter,
				function (i) {
					return i.ar !== 'sys';
				},
				A2(
					$elm$core$List$filter,
					function (i) {
						return _Utils_eq(model.q, $elm$core$Maybe$Nothing) || _Utils_eq(
							model.q,
							$elm$core$Maybe$Just(i.ag));
					},
					model.h)));
		return A2(
			$elm$core$List$map,
			function (_v2) {
				var _v3 = _v2.a;
				var from = _v3.a;
				var to = _v3.b;
				var c = _v2.b;
				return A3($author$project$Mission$Link, from, to, c);
			},
			$elm$core$Dict$toList(
				A3(
					$elm$core$List$foldl,
					F2(
						function (p, d) {
							return A3(
								$elm$core$Dict$update,
								p,
								function (c) {
									return $elm$core$Maybe$Just(
										A2($elm$core$Maybe$withDefault, 0, c) + 1);
								},
								d);
						}),
					$elm$core$Dict$empty,
					pairs)));
	}
};
var $elm$svg$Svg$path = $elm$svg$Svg$trustedNode('path');
var $elm$svg$Svg$Attributes$r = _VirtualDom_attribute('r');
var $author$project$Mission$shorten = function (s) {
	return ($elm$core$String$length(s) > 17) ? (A2($elm$core$String$left, 16, s) + '…') : s;
};
var $elm$svg$Svg$Attributes$strokeWidth = _VirtualDom_attribute('stroke-width');
var $elm$core$List$sum = function (numbers) {
	return A3($elm$core$List$foldl, $elm$core$Basics$add, 0, numbers);
};
var $elm$svg$Svg$svg = $elm$svg$Svg$trustedNode('svg');
var $elm$svg$Svg$text = $elm$virtual_dom$VirtualDom$text;
var $elm$svg$Svg$Attributes$textAnchor = _VirtualDom_attribute('text-anchor');
var $elm$svg$Svg$text_ = $elm$svg$Svg$trustedNode('text');
var $elm$svg$Svg$title = $elm$svg$Svg$trustedNode('title');
var $elm$svg$Svg$Attributes$viewBox = _VirtualDom_attribute('viewBox');
var $elm$svg$Svg$Attributes$width = _VirtualDom_attribute('width');
var $elm$svg$Svg$Attributes$x = _VirtualDom_attribute('x');
var $elm$svg$Svg$Attributes$y = _VirtualDom_attribute('y');
var $author$project$Mission$graph = function (model) {
	var x2 = 182;
	var x1 = 118;
	var ours = $author$project$Mission$merchantHandles(model);
	var ls = A2(
		$elm$core$List$take,
		14,
		A2(
			$elm$core$List$sortBy,
			function (l) {
				return -l.ad;
			},
			$author$project$Mission$links(model)));
	var maxCount = A2(
		$elm$core$Maybe$withDefault,
		1,
		$elm$core$List$maximum(
			A2(
				$elm$core$List$map,
				function ($) {
					return $.ad;
				},
				ls)));
	var total = function (keep) {
		return $elm$core$List$sum(
			A2(
				$elm$core$List$map,
				function ($) {
					return $.ad;
				},
				A2($elm$core$List$filter, keep, ls)));
	};
	var order = function (side) {
		return A2(
			$elm$core$List$sortBy,
			function (name) {
				return -total(
					function (l) {
						return _Utils_eq(
							side(l),
							name);
					});
			},
			$elm$core$Set$toList(
				$elm$core$Set$fromList(
					A2($elm$core$List$map, side, ls))));
	};
	var rights = order(
		function ($) {
			return $.g;
		});
	var lefts = order(
		function ($) {
			return $.br;
		});
	var rows = A2(
		$elm$core$Basics$max,
		$elm$core$List$length(lefts),
		$elm$core$List$length(rights));
	var yOf = F2(
		function (names, name) {
			return A2(
				$elm$core$Maybe$withDefault,
				0,
				A2(
					$elm$core$Maybe$map,
					function (_v2) {
						var i = _v2.a;
						return (16 + (i * 26)) + ((rows - $elm$core$List$length(names)) * 13);
					},
					$elm$core$List$head(
						A2(
							$elm$core$List$filter,
							function (_v1) {
								var n = _v1.b;
								return _Utils_eq(n, name);
							},
							A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, names)))));
		});
	var isOutside = function (n) {
		return (!A2($elm$core$Set$member, n, ours)) && (!A2($elm$core$String$startsWith, '@staff', n));
	};
	var nodeLabel = F4(
		function (anchor, x, names, name) {
			return A2(
				$elm$svg$Svg$g,
				_List_fromArray(
					[
						$elm$svg$Svg$Attributes$class(
						'node' + ((isOutside(name) ? ' outside' : ' ours') + (_Utils_eq(
							model.F,
							$elm$core$Maybe$Just(name)) ? ' on' : ''))),
						$elm$html$Html$Events$onClick(
						$author$project$Mission$FilterHandle(
							_Utils_eq(
								model.F,
								$elm$core$Maybe$Just(name)) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(name)))
					]),
				_List_fromArray(
					[
						A2(
						$elm$svg$Svg$circle,
						_List_fromArray(
							[
								$elm$svg$Svg$Attributes$cx(
								$author$project$Mission$f(x)),
								$elm$svg$Svg$Attributes$cy(
								$author$project$Mission$f(
									A2(yOf, names, name))),
								$elm$svg$Svg$Attributes$r('4')
							]),
						_List_Nil),
						A2(
						$elm$svg$Svg$text_,
						_List_fromArray(
							[
								$elm$svg$Svg$Attributes$x(
								$author$project$Mission$f(
									(anchor === 'end') ? (x - 8) : (x + 8))),
								$elm$svg$Svg$Attributes$y(
								$author$project$Mission$f(
									A2(yOf, names, name) + 4)),
								$elm$svg$Svg$Attributes$textAnchor(anchor)
							]),
						_List_fromArray(
							[
								$elm$svg$Svg$text(
								$author$project$Mission$shorten(name))
							]))
					]));
		});
	var h = (A2($elm$core$Basics$max, 1, rows) * 26) + 16;
	var edge = function (l) {
		var yb = A2(yOf, rights, l.g);
		var ya = A2(yOf, lefts, l.br);
		var dim = function () {
			var _v0 = model.F;
			if (!_v0.$) {
				var hf = _v0.a;
				return (!_Utils_eq(hf, l.br)) && (!_Utils_eq(hf, l.g));
			} else {
				return false;
			}
		}();
		var d = 'M' + ($author$project$Mission$f(x1) + (' ' + ($author$project$Mission$f(ya) + (' C' + ($author$project$Mission$f(150) + (' ' + ($author$project$Mission$f(ya) + (' ' + ($author$project$Mission$f(150) + (' ' + ($author$project$Mission$f(yb) + (' ' + ($author$project$Mission$f(x2) + (' ' + $author$project$Mission$f(yb)))))))))))))));
		return A2(
			$elm$svg$Svg$path,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$d(d),
					$elm$svg$Svg$Attributes$class(
					'edge' + (((isOutside(l.br) || isOutside(l.g)) ? ' across' : ' inside') + (dim ? ' dim' : ''))),
					$elm$svg$Svg$Attributes$strokeWidth(
					$author$project$Mission$f(1.5 + ((9 * l.ad) / maxCount)))
				]),
			_List_fromArray(
				[
					A2(
					$elm$svg$Svg$title,
					_List_Nil,
					_List_fromArray(
						[
							$elm$svg$Svg$text(
							l.br + (' → ' + (l.g + (': ' + ($elm$core$String$fromInt(l.ad) + ' messages')))))
						]))
				]));
	};
	return $elm$core$List$isEmpty(ls) ? A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('empty')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text('No conversations yet.')
			])) : A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('graph')
			]),
		_List_fromArray(
			[
				A2(
				$elm$svg$Svg$svg,
				_List_fromArray(
					[
						$elm$svg$Svg$Attributes$viewBox(
						'0 0 300 ' + $author$project$Mission$f(h)),
						$elm$svg$Svg$Attributes$width('100%'),
						A2($elm$html$Html$Attributes$attribute, 'role', 'img'),
						A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Who talks to whom')
					]),
				_Utils_ap(
					A2($elm$core$List$map, edge, ls),
					_Utils_ap(
						A2(
							$elm$core$List$map,
							A3(nodeLabel, 'end', x1, lefts),
							lefts),
						A2(
							$elm$core$List$map,
							A3(nodeLabel, 'start', x2, rights),
							rights)))),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('legend')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('k across')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('across companies')
							])),
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('k inside')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('inside the store')
							]))
					]))
			]));
};
var $elm$html$Html$small = _VirtualDom_node('small');
var $author$project$Mission$kpi = F3(
	function (tag, value_, note) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('kpi')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tag')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(tag)
						])),
					A2(
					$elm$html$Html$b,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('num')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(value_)
						])),
					A2(
					$elm$html$Html$small,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(note)
						]))
				]));
	});
var $author$project$Mission$ToggleLane = function (a) {
	return {$: 13, a: a};
};
var $author$project$Mission$boolString = function (b) {
	return b ? 'true' : 'false';
};
var $author$project$Mission$laneToggle = F3(
	function (model, key, label) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('lane lane-' + key),
					A2(
					$elm$html$Html$Attributes$attribute,
					'aria-pressed',
					$author$project$Mission$boolString(
						A2($elm$core$Set$member, key, model.G))),
					$elm$html$Html$Events$onClick(
					$author$project$Mission$ToggleLane(key))
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label)
				]));
	});
var $author$project$Mission$FilterMerchant = function (a) {
	return {$: 10, a: a};
};
var $author$project$Mission$merchantAll = function (model) {
	return A2(
		$elm$html$Html$button,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('room'),
				A2(
				$elm$html$Html$Attributes$attribute,
				'aria-current',
				$author$project$Mission$boolString(
					_Utils_eq(model.q, $elm$core$Maybe$Nothing))),
				$elm$html$Html$Events$onClick(
				$author$project$Mission$FilterMerchant($elm$core$Maybe$Nothing))
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('r1')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('who')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('All merchants')
							]))
					])),
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('intent')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(
						$elm$core$String$fromInt(
							$elm$core$List$length(model.h)) + ' messages on the wire')
					]))
			]));
};
var $author$project$Mission$agentChip = function (a) {
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$classList(
				_List_fromArray(
					[
						_Utils_Tuple2('chip', true),
						_Utils_Tuple2('busy', a.bi),
						_Utils_Tuple2('off', !a.bn)
					])),
				$elm$html$Html$Attributes$title(
				a.bA + (' · ' + (a.au + (' · ' + ($elm$core$String$fromInt(a.az) + (' msgs/h · ' + (a.bg ? 'ZooWork' : 'simulated')))))))
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(a.v)
			]));
};
var $elm$core$String$right = F2(
	function (n, string) {
		return (n < 1) ? '' : A3(
			$elm$core$String$slice,
			-n,
			$elm$core$String$length(string),
			string);
	});
var $author$project$Mission$money = function (n) {
	var group = function (s) {
		return ($elm$core$String$length(s) <= 3) ? s : (group(
			A2($elm$core$String$dropRight, 3, s)) + (',' + A2($elm$core$String$right, 3, s)));
	};
	return '$' + group(
		$elm$core$String$fromInt(n));
};
var $author$project$Mission$merchantCard = F2(
	function (model, m) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('room'),
					A2(
					$elm$html$Html$Attributes$attribute,
					'aria-current',
					$author$project$Mission$boolString(
						_Utils_eq(
							model.q,
							$elm$core$Maybe$Just(m.b)))),
					$elm$html$Html$Events$onClick(
					$author$project$Mission$FilterMerchant(
						$elm$core$Maybe$Just(m.b)))
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('r1')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('who')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(m.bA)
								])),
							(m._ > 0) ? A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('pill p-warn')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									$elm$core$String$fromInt(m._) + ' need you')
								])) : (m.av ? A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('pill p-good')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Live')
								])) : A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('pill p-neutral')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Idle')
								])))
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('intent')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							m.bj + (' · ' + ($elm$core$String$fromInt(m.aA) + (' rooms · ' + ($author$project$Mission$money(m.aD) + (' · ' + ($elm$core$String$fromInt(m.ao) + ' blocked')))))))
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('agents-row')
						]),
					A2($elm$core$List$map, $author$project$Mission$agentChip, m.Z)),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('handle')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							'last activity ' + A2($elm$core$Maybe$withDefault, '—', m.bx))
						]))
				]));
	});
var $author$project$Mission$pendingNote = function (model) {
	return $elm$core$List$isEmpty(model.t) ? '' : (' (' + ($elm$core$String$fromInt(
		$elm$core$List$length(model.t)) + ' new)'));
};
var $author$project$Mission$CloseThread = {$: 16};
var $author$project$Mission$pill = function (_v0) {
	var label = _v0.a;
	var tone = _v0.b;
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class(
				'pill ' + function () {
					switch (tone) {
						case 0:
							return 'p-good';
						case 1:
							return 'p-warn';
						case 2:
							return 'p-bad';
						case 3:
							return 'p-neutral';
						default:
							return 'p-rose';
					}
				}())
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(label)
			]));
};
var $author$project$Mission$threadPost = F2(
	function (item, p) {
		var k = function () {
			var _v1 = p.w;
			switch (_v1) {
				case 1:
					return 'buyer';
				case 2:
					return 'sys';
				default:
					return '';
			}
		}();
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$classList(
					_List_fromArray(
						[
							_Utils_Tuple2('msg ' + k, true),
							_Utils_Tuple2(
							'hit',
							_Utils_eq(p.br, item.br) && _Utils_eq(p.al, item.al))
						]))
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('from')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(p.br)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('body')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('text')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(p.al)
								])),
							$elm$core$List$isEmpty(p.M) ? $elm$html$Html$text('') : A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('cite')
								]),
							A2(
								$elm$core$List$map,
								function (c) {
									return A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$classList(
												_List_fromArray(
													[
														_Utils_Tuple2(
														'tv',
														A2($elm$core$String$startsWith, 'tavily', c))
													]))
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(c)
											]));
								},
								p.M)),
							function () {
							var _v0 = p.a7;
							if (!_v0.$) {
								var payload = _v0.a;
								return A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('payload')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(payload)
										]));
							} else {
								return $elm$html$Html$text('');
							}
						}(),
							p.a1 ? A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('approve')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Waiting for a person. Decide it in the merchant\'s console.')
										]))
								])) : $elm$html$Html$text('')
						]))
				]));
	});
var $author$project$Mission$viewThread = function (model) {
	var frame = F2(
		function (item, body) {
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('panel thread')
					]),
				A2(
					$elm$core$List$cons,
					A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('panel-h')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('label')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(item.p + (' · room ' + item.aE))
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('btn'),
										$elm$html$Html$Events$onClick($author$project$Mission$CloseThread),
										A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Close thread')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('×')
									]))
							])),
					body));
		});
	var _v0 = model.J;
	switch (_v0.$) {
		case 0:
			return $elm$html$Html$text('');
		case 1:
			var item = _v0.a;
			return A2(
				frame,
				item,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('empty')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Loading the room…')
							]))
					]));
		case 3:
			var item = _v0.a;
			return A2(
				frame,
				item,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('empty')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Couldn\'t load this room.')
							]))
					]));
		default:
			var item = _v0.a;
			var room = _v0.b;
			return A2(
				frame,
				item,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('roomhead')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h2,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text(room.as)
									])),
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('meta')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(room.v + (' · via ' + (room.a8 + (' · ' + (room.au + (' · opened ' + room.aB))))))
									])),
								$author$project$Mission$pill(room.aH)
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('members')
							]),
						A2(
							$elm$core$List$map,
							function (m) {
								return A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$classList(
											_List_fromArray(
												[
													_Utils_Tuple2('chip', true),
													_Utils_Tuple2(
													'buyer',
													_Utils_eq(m, room.v))
												]))
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(m)
										]));
							},
							room.ax)),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('feed thread-feed')
							]),
						A2(
							$elm$core$List$map,
							$author$project$Mission$threadPost(item),
							room.aC))
					]));
	}
};
var $author$project$Mission$Across = 0;
var $author$project$Mission$Inside = 1;
var $author$project$Mission$Staff = 2;
var $author$project$Mission$System = 3;
var $elm$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			$elm$core$List$any,
			A2($elm$core$Basics$composeL, $elm$core$Basics$not, isOkay),
			list);
	});
var $author$project$Mission$lane = F2(
	function (ours, item) {
		var _v0 = item.ar;
		switch (_v0) {
			case 'sys':
				return 3;
			case 'staff':
				return 2;
			case 'agent':
				return ((!$elm$core$List$isEmpty(item.g)) && A2(
					$elm$core$List$all,
					function (h) {
						return A2($elm$core$Set$member, h, ours);
					},
					item.g)) ? 1 : 0;
			default:
				return 0;
		}
	});
var $author$project$Mission$laneKey = function (l) {
	switch (l) {
		case 0:
			return 'across';
		case 1:
			return 'inside';
		case 2:
			return 'staff';
		default:
			return 'sys';
	}
};
var $author$project$Mission$visible = function (model) {
	var q = $elm$core$String$toLower(
		$elm$core$String$trim(model.aG));
	var ours = $author$project$Mission$merchantHandles(model);
	var matches = function (item) {
		return (_Utils_eq(model.q, $elm$core$Maybe$Nothing) || _Utils_eq(
			model.q,
			$elm$core$Maybe$Just(item.ag))) && (((model.S === '') || _Utils_eq(item.a8, model.S)) && (A2(
			$elm$core$Set$member,
			$author$project$Mission$laneKey(
				A2($author$project$Mission$lane, ours, item)),
			model.G) && (function () {
			var _v0 = model.F;
			if (_v0.$ === 1) {
				return true;
			} else {
				var h = _v0.a;
				return A2(
					$elm$core$List$member,
					h,
					A2(
						$elm$core$List$map,
						A2($author$project$Mission$collapse, ours, item.a8),
						A2($elm$core$List$cons, item.br, item.g)));
			}
		}() && ((q === '') || A2(
			$elm$core$String$contains,
			q,
			$elm$core$String$toLower(
				item.al + (' ' + (item.br + (' ' + (A2($elm$core$String$join, ' ', item.g) + (' ' + item.p)))))))))));
	};
	return A2($elm$core$List$filter, matches, model.h);
};
var $author$project$Mission$Open = function (a) {
	return {$: 15, a: a};
};
var $author$project$Mission$wireRow = F2(
	function (model, item) {
		var l = $author$project$Mission$laneKey(
			A2(
				$author$project$Mission$lane,
				$author$project$Mission$merchantHandles(model),
				item));
		var isOpen = function () {
			var _v1 = model.J;
			switch (_v1.$) {
				case 2:
					var i = _v1.a;
					return _Utils_eq(i.b, item.b);
				case 1:
					var i = _v1.a;
					return _Utils_eq(i.b, item.b);
				case 3:
					var i = _v1.a;
					return _Utils_eq(i.b, item.b);
				default:
					return false;
			}
		}();
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('wire-row lane-' + l),
					A2(
					$elm$html$Html$Attributes$attribute,
					'aria-current',
					$author$project$Mission$boolString(isOpen)),
					$elm$html$Html$Events$onClick(
					$author$project$Mission$Open(item))
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('wire-meta')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('mono')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(item.bY)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('store-tag')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(item.p)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('route mono')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('who-' + item.ar)
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(item.br)
										])),
									$elm$core$List$isEmpty(item.g) ? $elm$html$Html$text('') : A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('arrow')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(' → ')
										])),
									$elm$html$Html$text(
									A2($elm$core$String$join, ', ', item.g))
								])),
							function () {
							var _v0 = item.z;
							_v0$2:
							while (true) {
								if (!_v0.$) {
									switch (_v0.a) {
										case 'zoowork':
											return A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('pill p-good src')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('ZooWork')
													]));
										case 'sim':
											return A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('pill p-neutral src')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('sim')
													]));
										default:
											break _v0$2;
									}
								} else {
									break _v0$2;
								}
							}
							return $elm$html$Html$text('');
						}()
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('wire-text')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(item.al)
						])),
					$elm$core$List$isEmpty(item.M) ? $elm$html$Html$text('') : A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('cite')
						]),
					A2(
						$elm$core$List$map,
						function (c) {
							return A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$classList(
										_List_fromArray(
											[
												_Utils_Tuple2(
												'tv',
												A2($elm$core$String$startsWith, 'tavily', c))
											]))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(c)
									]));
						},
						item.M))
				]));
	});
var $author$project$Mission$view = function (model) {
	var platforms = $elm$core$Set$toList(
		$elm$core$Set$fromList(
			A2(
				$elm$core$List$map,
				function ($) {
					return $.a8;
				},
				model.h)));
	var items = $author$project$Mission$visible(model);
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('mission')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('mission-bar')
					]),
				_List_fromArray(
					[
						$author$project$Mission$connBadge(model.l),
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('note')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								$author$project$Mission$connNote(model))
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('kpis six')
					]),
				_List_fromArray(
					[
						A3(
						$author$project$Mission$kpi,
						'Merchants',
						$elm$core$String$fromInt(model.i.av) + (' / ' + $elm$core$String$fromInt(model.i.ay)),
						'stores with agents on duty'),
						A3(
						$author$project$Mission$kpi,
						'Rooms',
						$elm$core$String$fromInt(model.i.aA),
						'open conversations with outside agents'),
						A3(
						$author$project$Mission$kpi,
						'Traffic',
						$elm$core$String$fromInt(model.i.az),
						'agent messages in the last hour'),
						A3(
						$author$project$Mission$kpi,
						'Needs you',
						$elm$core$String$fromInt(model.i._),
						'decisions waiting for a person'),
						A3(
						$author$project$Mission$kpi,
						'Blocked',
						$elm$core$String$fromInt(model.i.ao),
						'bad bots turned away today'),
						A3(
						$author$project$Mission$kpi,
						'Revenue',
						$author$project$Mission$money(model.i.aD),
						'agent-assisted sales today')
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('mission-grid')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$aside,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('panel')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('panel-h')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('label')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Merchants')
											])),
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('pill p-neutral num')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												$elm$core$String$fromInt(
													$elm$core$List$length(model.ay)))
											]))
									])),
								A2(
								$elm$html$Html$ul,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('rooms')
									]),
								A2(
									$elm$core$List$cons,
									A2(
										$elm$html$Html$li,
										_List_Nil,
										_List_fromArray(
											[
												$author$project$Mission$merchantAll(model)
											])),
									A2(
										$elm$core$List$map,
										function (m) {
											return A2(
												$elm$html$Html$li,
												_List_Nil,
												_List_fromArray(
													[
														A2($author$project$Mission$merchantCard, model, m)
													]));
										},
										model.ay)))
							])),
						A2(
						$elm$html$Html$section,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('panel')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('panel-h')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('label')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('The wire · every agent message')
											])),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('btn'),
												$elm$html$Html$Events$onClick($author$project$Mission$TogglePause)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												model.R ? ('Resume' + $author$project$Mission$pendingNote(model)) : 'Pause')
											]))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('wire-filters')
									]),
								_List_fromArray(
									[
										A3($author$project$Mission$laneToggle, model, 'across', 'Across companies'),
										A3($author$project$Mission$laneToggle, model, 'inside', 'Inside the store'),
										A3($author$project$Mission$laneToggle, model, 'staff', 'Staff'),
										A3($author$project$Mission$laneToggle, model, 'sys', 'System'),
										A2(
										$elm$html$Html$select,
										_List_fromArray(
											[
												$elm$html$Html$Events$onInput($author$project$Mission$FilterPlatform),
												A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Platform')
											]),
										A2(
											$elm$core$List$cons,
											A2(
												$elm$html$Html$option,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$value(''),
														$elm$html$Html$Attributes$selected(model.S === '')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('All platforms')
													])),
											A2(
												$elm$core$List$map,
												function (p) {
													return A2(
														$elm$html$Html$option,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$value(p),
																$elm$html$Html$Attributes$selected(
																_Utils_eq(model.S, p))
															]),
														_List_fromArray(
															[
																$elm$html$Html$text(p)
															]));
												},
												platforms))),
										A2(
										$elm$html$Html$input,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('wire-search'),
												$elm$html$Html$Attributes$placeholder('Search messages, handles, stores'),
												$elm$html$Html$Attributes$value(model.aG),
												$elm$html$Html$Events$onInput($author$project$Mission$Search)
											]),
										_List_Nil)
									])),
								function () {
								var _v0 = model.F;
								if (!_v0.$) {
									var h = _v0.a;
									return A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('wire-active')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Showing messages to or from '),
												A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('chip')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(h)
													])),
												A2(
												$elm$html$Html$button,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('btn'),
														$elm$html$Html$Events$onClick(
														$author$project$Mission$FilterHandle($elm$core$Maybe$Nothing))
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('Clear')
													]))
											]));
								} else {
									return $elm$html$Html$text('');
								}
							}(),
								$elm$core$List$isEmpty(items) ? A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('empty')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('No messages match these filters yet.')
									])) : A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('wire')
									]),
								A2(
									$elm$core$List$map,
									$author$project$Mission$wireRow(model),
									items))
							])),
						A2(
						$elm$html$Html$aside,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('mission-side')
							]),
						_List_fromArray(
							[
								$author$project$Mission$viewThread(model),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('panel')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('panel-h')
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('label')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('Who talks to whom')
													])),
												A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('note')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('click a handle to filter')
													]))
											])),
										$author$project$Mission$graph(model)
									]))
							]))
					]))
			]));
};
var $author$project$Main$DecisionLog = 3;
var $author$project$Main$Refunds = 1;
var $author$project$Main$Security = 2;
var $author$project$Main$SelectTab = function (a) {
	return {$: 3, a: a};
};
var $author$project$Main$kpi = F3(
	function (tag, value, note) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('kpi')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tag')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(tag)
						])),
					A2(
					$elm$html$Html$b,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('num')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(value)
						])),
					A2(
					$elm$html$Html$small,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(note)
						]))
				]));
	});
var $author$project$Main$StartCall = {$: 10};
var $author$project$Main$TakeOver = {$: 9};
var $elm$html$Html$br = _VirtualDom_node('br');
var $author$project$Data$Purchase = F5(
	function (order, item, date, amount, outcome) {
		return {b6: amount, cg: date, cn: item, bD: order, cu: outcome};
	});
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $author$project$Data$customers = $elm$core$Dict$fromList(
	_List_fromArray(
		[
			_Utils_Tuple2(
			'c1',
			{
				aR: _List_fromArray(
					[
						A5($author$project$Data$Purchase, 'LO-54410', 'Merino crewneck, oat', 'Aug 30, 2026', 128, 'Kept'),
						A5($author$project$Data$Purchase, 'LO-52018', 'Linen wide-leg trouser', 'Jun 12, 2026', 146, 'Kept'),
						A5($author$project$Data$Purchase, 'LO-49903', 'Leather loafer 38', 'Mar 3, 2026', 210, 'Exchanged size'),
						A5($author$project$Data$Purchase, 'LO-47220', 'Cashmere scarf', 'Dec 9, 2025', 95, 'Kept')
					]),
				aS: 1840,
				bA: 'Priya Raman',
				aU: 11,
				aV: '+1 (718) 555-0142',
				aW: _List_fromArray(
					['Natural fibres', 'Earth tones', 'Ships to Brooklyn']),
				aX: 9,
				ai: 12,
				aZ: 'Customer since Mar 2023',
				a_: _List_fromArray(
					['Tops M', 'Coats M', 'Shoes 38']),
				a$: 'Gold'
			}),
			_Utils_Tuple2(
			'c2',
			{
				aR: _List_fromArray(
					[
						A5($author$project$Data$Purchase, 'LO-55790', 'Chelsea boot, black 44', 'Sep 21, 2026', 214, 'Refund requested'),
						A5($author$project$Data$Purchase, 'LO-54102', 'Waxed jacket L', 'Aug 14, 2026', 265, 'Refunded'),
						A5($author$project$Data$Purchase, 'LO-53011', 'Chelsea boot, brown 44', 'Jul 2, 2026', 214, 'Refunded'),
						A5($author$project$Data$Purchase, 'LO-51870', 'Wool beanie', 'May 20, 2026', 38, 'Kept')
					]),
				aS: 612,
				bA: 'Marcus Hale',
				aU: 5,
				aV: '+1 (312) 555-0187',
				aW: _List_fromArray(
					['Limited drops', 'Ships to a freight forwarder']),
				aX: 58,
				ai: 72,
				aZ: 'Customer since Jan 2026',
				a_: _List_fromArray(
					['Boots 44', 'Jackets L']),
				a$: 'Standard'
			}),
			_Utils_Tuple2(
			'c3',
			{
				aR: _List_fromArray(
					[
						A5($author$project$Data$Purchase, 'LO-55812', 'Quilted vest, olive S', 'Sep 28, 2026', 158, 'In transit, 2 days late'),
						A5($author$project$Data$Purchase, 'LO-53390', 'Poplin shirt, white S', 'Jul 19, 2026', 98, 'Kept'),
						A5($author$project$Data$Purchase, 'LO-50021', 'Cord trouser 27', 'Apr 2, 2026', 132, 'Kept')
					]),
				aS: 930,
				bA: 'Dana Kim',
				aU: 7,
				aV: '+1 (512) 555-0119',
				aW: _List_fromArray(
					['Gift wrapping', 'Ships to Austin']),
				aX: 14,
				ai: 8,
				aZ: 'Customer since Nov 2024',
				a_: _List_fromArray(
					['Tops S', 'Trousers 27']),
				a$: 'Silver'
			})
		]));
var $author$project$Data$customer = function (id) {
	return A2($elm$core$Dict$get, id, $author$project$Data$customers);
};
var $elm$html$Html$dl = _VirtualDom_node('dl');
var $elm$html$Html$dd = _VirtualDom_node('dd');
var $elm$html$Html$dt = _VirtualDom_node('dt');
var $elm$html$Html$i = _VirtualDom_node('i');
var $elm$virtual_dom$VirtualDom$style = _VirtualDom_style;
var $elm$html$Html$Attributes$style = $elm$virtual_dom$VirtualDom$style;
var $author$project$Main$fact = F4(
	function (label, value, ddAttrs, meter) {
		return A2(
			$elm$html$Html$div,
			_List_Nil,
			A2(
				$elm$core$List$cons,
				A2(
					$elm$html$Html$dt,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(label)
						])),
				A2(
					$elm$core$List$cons,
					A2(
						$elm$html$Html$dd,
						ddAttrs,
						_List_fromArray(
							[
								$elm$html$Html$text(value)
							])),
					function () {
						if (!meter.$) {
							var _v1 = meter.a;
							var pct = _v1.a;
							var color = _v1.b;
							return _List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('meter')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$i,
											_List_fromArray(
												[
													A2(
													$elm$html$Html$Attributes$style,
													'width',
													$elm$core$String$fromInt(pct) + '%'),
													A2($elm$html$Html$Attributes$style, 'background', color)
												]),
											_List_Nil)
										]))
								]);
						} else {
							return _List_Nil;
						}
					}())));
	});
var $author$project$Main$money = function (n) {
	var group = function (s) {
		return ($elm$core$String$length(s) <= 3) ? s : (group(
			A2($elm$core$String$dropRight, 3, s)) + (',' + A2($elm$core$String$right, 3, s)));
	};
	return '$' + group(
		$elm$core$String$fromInt(n));
};
var $author$project$Main$toneClass = function (tone) {
	switch (tone) {
		case 0:
			return 'p-good';
		case 1:
			return 'p-warn';
		case 2:
			return 'p-bad';
		case 3:
			return 'p-neutral';
		default:
			return 'p-rose';
	}
};
var $author$project$Main$pill = function (_v0) {
	var label = _v0.a;
	var tone = _v0.b;
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class(
				'pill ' + $author$project$Main$toneClass(tone))
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(label)
			]));
};
var $author$project$Main$riskTone = function (risk) {
	return (risk > 60) ? 2 : ((risk > 30) ? 1 : 0);
};
var $author$project$Main$toneVar = function (tone) {
	switch (tone) {
		case 2:
			return 'var(--bad)';
		case 1:
			return 'var(--warn)';
		default:
			return 'var(--good)';
	}
};
var $author$project$Main$EndCall = {$: 12};
var $author$project$Main$cites = function (items) {
	return $elm$core$List$isEmpty(items) ? _List_Nil : _List_fromArray(
		[
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('cite')
				]),
			A2(
				$elm$core$List$map,
				function (c) {
					return A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$classList(
								_List_fromArray(
									[
										_Utils_Tuple2(
										'tv',
										A2($elm$core$String$startsWith, 'tavily', c))
									]))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(c)
							]));
				},
				items))
		]);
};
var $elm$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (n <= 0) {
				return result;
			} else {
				var $temp$result = A2($elm$core$List$cons, value, result),
					$temp$n = n - 1,
					$temp$value = value;
				result = $temp$result;
				n = $temp$n;
				value = $temp$value;
				continue repeatHelp;
			}
		}
	});
var $elm$core$List$repeat = F2(
	function (n, value) {
		return A3($elm$core$List$repeatHelp, _List_Nil, n, value);
	});
var $elm$core$List$singleton = function (value) {
	return _List_fromArray(
		[value]);
};
var $author$project$Main$viewCall = F2(
	function (model, c) {
		var _v0 = model.o;
		switch (_v0.$) {
			case 0:
				return $elm$html$Html$text('');
			case 2:
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('call')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('status')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Call ended · transcript posted to the room')
										]))
								]))
						]));
			default:
				var shown = _v0.a;
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('call')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('status')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('On call · ' + c.aV)
										])),
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('wave'),
											A2($elm$html$Html$Attributes$attribute, 'aria-hidden', 'true')
										]),
									A2(
										$elm$core$List$repeat,
										5,
										A2($elm$html$Html$i, _List_Nil, _List_Nil)))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('calllog'),
									$elm$html$Html$Attributes$id('calllog')
								]),
							A2(
								$elm$core$List$map,
								function (l) {
									return A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('l')
											]),
										A2(
											$elm$core$List$cons,
											A2(
												$elm$html$Html$b,
												_List_Nil,
												_List_fromArray(
													[
														$elm$html$Html$text(l.cI + ':')
													])),
											A2(
												$elm$core$List$cons,
												$elm$html$Html$text(l.al),
												$author$project$Main$cites(
													A2(
														$elm$core$Maybe$withDefault,
														_List_Nil,
														A2($elm$core$Maybe$map, $elm$core$List$singleton, l.cd))))));
								},
								A2(
									$elm$core$List$take,
									shown,
									$author$project$Main$currentScript(model)))),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									A2($elm$html$Html$Attributes$style, 'display', 'flex'),
									A2($elm$html$Html$Attributes$style, 'gap', '8px'),
									A2($elm$html$Html$Attributes$style, 'flex-wrap', 'wrap')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('btn danger'),
											$elm$html$Html$Events$onClick($author$project$Main$EndCall)
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('End call')
										])),
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('note'),
											A2($elm$html$Html$Attributes$style, 'align-self', 'center')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Simulated. Voice: LiveKit · lookups: Moss')
										]))
								]))
						]));
		}
	});
var $author$project$Main$viewDesk = function (model) {
	var _v0 = $author$project$Main$currentRoom(model);
	if (_v0.$ === 1) {
		return _List_Nil;
	} else {
		var r = _v0.a;
		var _v1 = A2($elm$core$Maybe$andThen, $author$project$Data$customer, r.ap);
		if (_v1.$ === 1) {
			return _List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('panel-h')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('label')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Customer desk')
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('empty')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('This agent was blocked before it could link to a customer.'),
							A2($elm$html$Html$br, _List_Nil, _List_Nil),
							A2($elm$html$Html$br, _List_Nil, _List_Nil),
							$elm$html$Html$text('No account, no orders, nothing reserved.')
						]))
				]);
		} else {
			var c = _v1.a;
			var risk = $author$project$Main$toneVar(
				$author$project$Main$riskTone(c.ai));
			var returnColor = (c.aX > 40) ? 'var(--bad)' : 'var(--forest)';
			return _List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('panel-h')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('label')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Customer desk')
								])),
							$author$project$Main$pill(
							_Utils_Tuple2(c.a$, 4))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('who')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$h3,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text(c.bA)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('note')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(c.aZ + (' · represented by ' + r.v))
								]))
						])),
					A2(
					$elm$html$Html$dl,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('facts'),
							A2($elm$html$Html$Attributes$style, 'margin', '0')
						]),
					_List_fromArray(
						[
							A4(
							$author$project$Main$fact,
							'Lifetime value',
							$author$project$Main$money(c.aS),
							_List_Nil,
							$elm$core$Maybe$Nothing),
							A4(
							$author$project$Main$fact,
							'Orders',
							$elm$core$String$fromInt(c.aU),
							_List_Nil,
							$elm$core$Maybe$Nothing),
							A4(
							$author$project$Main$fact,
							'Return rate',
							$elm$core$String$fromInt(c.aX) + '%',
							_List_Nil,
							$elm$core$Maybe$Just(
								_Utils_Tuple2(c.aX, returnColor))),
							A4(
							$author$project$Main$fact,
							'Risk score',
							$elm$core$String$fromInt(c.ai) + ' / 100',
							_List_fromArray(
								[
									A2($elm$html$Html$Attributes$style, 'color', risk)
								]),
							$elm$core$Maybe$Just(
								_Utils_Tuple2(c.ai, risk)))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('prefs')
						]),
					A2(
						$elm$core$List$map,
						function (s) {
							return A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('chip')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(s)
									]));
						},
						_Utils_ap(c.a_, c.aW))),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('deskbtns')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('btn primary'),
									$elm$html$Html$Events$onClick($author$project$Main$StartCall)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Call customer')
								])),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('btn'),
									$elm$html$Html$Events$onClick($author$project$Main$TakeOver)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Take over room')
								]))
						])),
					A2($author$project$Main$viewCall, model, c),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('panel-h')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('label')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Purchase history')
								]))
						])),
					A2(
					$elm$html$Html$ul,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('orders')
						]),
					A2(
						$elm$core$List$map,
						function (h) {
							return A2(
								$elm$html$Html$li,
								_List_Nil,
								_List_fromArray(
									[
										A2(
										$elm$html$Html$span,
										_List_Nil,
										_List_fromArray(
											[
												$elm$html$Html$text(h.cn)
											])),
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('num')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												$author$project$Main$money(h.b6))
											])),
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('d mono')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(h.bD + (' · ' + h.cg))
											])),
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('d')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(h.cu)
											]))
									]));
						},
						c.aR))
				]);
		}
	}
};
var $author$project$Main$SelectRoom = function (a) {
	return {$: 4, a: a};
};
var $author$project$Main$customerName = function (r) {
	return A2(
		$elm$core$Maybe$withDefault,
		'Unknown buyer',
		A2(
			$elm$core$Maybe$map,
			function ($) {
				return $.bA;
			},
			A2($elm$core$Maybe$andThen, $author$project$Data$customer, r.ap)));
};
var $author$project$Main$viewRoomRow = F2(
	function (current, r) {
		return A2(
			$elm$html$Html$li,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('room'),
							A2(
							$elm$html$Html$Attributes$attribute,
							'aria-current',
							$author$project$Main$boolString(
								_Utils_eq(r.b, current))),
							$elm$html$Html$Events$onClick(
							$author$project$Main$SelectRoom(r.b))
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('r1')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('who')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											$author$project$Main$customerName(r))
										])),
									$author$project$Main$pill(r.aH)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('intent')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(r.as)
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('handle')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(r.v + (' · ' + (r.a8 + (' · ' + r.aB))))
								]))
						]))
				]));
	});
var $author$project$Data$AgentSeen = F5(
	function (handle, claims, checks, risk, result) {
		return {cc: checks, ce: claims, v: handle, cx: result, ai: risk};
	});
var $author$project$Data$agentsSeen = _List_fromArray(
	[
		A5(
		$author$project$Data$AgentSeen,
		'@muse/priya.r',
		'Muse',
		_List_fromArray(
			['Band handle', 'Signature', 'Rate']),
		12,
		_Utils_Tuple2('Allowed', 0)),
		A5(
		$author$project$Data$AgentSeen,
		'@dots/agent-7f21',
		'Dots',
		_List_fromArray(
			['Band handle', 'Signature', 'Rate']),
		28,
		_Utils_Tuple2('Allowed, watched', 1)),
		A5(
		$author$project$Data$AgentSeen,
		'@dots/agent-02aa',
		'Dots',
		_List_fromArray(
			['Band handle', 'Signature', 'Rate']),
		5,
		_Utils_Tuple2('Allowed', 0)),
		A5(
		$author$project$Data$AgentSeen,
		'@shopbot-x9',
		'Muse (false)',
		_List_fromArray(
			['No signature', 'Handle 3h old', '212 req / 10 min']),
		96,
		_Utils_Tuple2('Blocked', 2)),
		A5(
		$author$project$Data$AgentSeen,
		'@fastcart-77',
		'Unknown',
		_List_fromArray(
			['No signature', 'Tavily: reseller tool']),
		88,
		_Utils_Tuple2('Blocked', 2))
	]);
var $author$project$Main$reasons = function (items) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('reasons')
			]),
		A2(
			$elm$core$List$map,
			function (x) {
				return A2(
					$elm$html$Html$span,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(x)
						]));
			},
			items));
};
var $author$project$Data$Signal = F4(
	function (time, text, by, severity) {
		return {ca: by, cA: severity, al: text, bY: time};
	});
var $author$project$Data$signals = _List_fromArray(
	[
		A4(
		$author$project$Data$Signal,
		'10:37',
		'9 handles share one operator and all target the Field Runner drop',
		'@gatekeeper',
		_Utils_Tuple2('High', 2)),
		A4(
		$author$project$Data$Signal,
		'10:24',
		'Refund request on an item found listed on a resale site',
		'@returns',
		_Utils_Tuple2('High', 2)),
		A4(
		$author$project$Data$Signal,
		'09:58',
		'\'Not received\' claim, but the carrier shows a signature',
		'@returns',
		_Utils_Tuple2('Medium', 1)),
		A4(
		$author$project$Data$Signal,
		'09:12',
		'Promo code tried 31 times by one agent',
		'@promo',
		_Utils_Tuple2('Low', 3))
	]);
var $author$project$Main$table_ = F2(
	function (heads, rows) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('tbl-wrap')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$table,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$elm$html$Html$thead,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									$elm$html$Html$tr,
									_List_Nil,
									A2(
										$elm$core$List$map,
										function (h) {
											return A2(
												$elm$html$Html$th,
												_List_Nil,
												_List_fromArray(
													[
														$elm$html$Html$text(h)
													]));
										},
										heads))
								])),
							A2($elm$html$Html$tbody, _List_Nil, rows)
						]))
				]));
	});
var $author$project$Main$ComposeInput = function (a) {
	return {$: 7, a: a};
};
var $author$project$Main$ComposeSubmit = {$: 8};
var $elm$html$Html$Attributes$autocomplete = function (bool) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var $author$project$Main$Decide = F2(
	function (a, b) {
		return {$: 5, a: a, b: b};
	});
var $author$project$Main$viewPost = F2(
	function (decision, m) {
		var kindClass = function () {
			var _v2 = m.w;
			switch (_v2) {
				case 1:
					return 'buyer';
				case 2:
					return 'sys';
				default:
					return '';
			}
		}();
		var approval = function () {
			if (!m.a1) {
				return _List_Nil;
			} else {
				if (decision.$ === 1) {
					return _List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('approve')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Waiting for you')
										])),
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('btn primary'),
											$elm$html$Html$Events$onClick(
											A2($author$project$Main$Decide, 'RF-2207', 'Exchange offered'))
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Offer exchange')
										])),
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('btn'),
											$elm$html$Html$Events$onClick(
											A2($author$project$Main$Decide, 'RF-2207', 'Refunded'))
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Refund anyway')
										])),
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('btn danger'),
											$elm$html$Html$Events$onClick(
											A2($author$project$Main$Decide, 'RF-2207', 'Declined'))
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Decline')
										]))
								]))
						]);
				} else {
					var status = decision.a;
					return _List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('approve')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_Nil,
									_List_fromArray(
										[
											$elm$html$Html$text('Decision: '),
											A2(
											$elm$html$Html$b,
											_List_Nil,
											_List_fromArray(
												[
													$elm$html$Html$text(status)
												])),
											$elm$html$Html$text(' by you')
										]))
								]))
						]);
				}
			}
		}();
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('msg ' + kindClass)
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('from')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(m.br)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('body')
						]),
					_Utils_ap(
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('text')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(m.al)
									]))
							]),
						_Utils_ap(
							$author$project$Main$cites(m.M),
							_Utils_ap(
								function () {
									var _v0 = m.a7;
									if (!_v0.$) {
										var p = _v0.a;
										return _List_fromArray(
											[
												A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('payload')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(p)
													]))
											]);
									} else {
										return _List_Nil;
									}
								}(),
								approval))))
				]));
	});
var $author$project$Main$viewConversation = function (model) {
	var _v0 = $author$project$Main$currentRoom(model);
	if (_v0.$ === 1) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('empty')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('No room selected.')
				]));
	} else {
		var r = _v0.a;
		var decision = A2(
			$elm$core$Maybe$andThen,
			function ($) {
				return $.bm;
			},
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (f) {
						return f.b === 'RF-2207';
					},
					model.V)));
		return A2(
			$elm$html$Html$div,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('roomhead')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$h2,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text(
									$author$project$Main$customerName(r))
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('meta')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Band room '),
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('mono')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											r.b + ('-' + A2(
												$elm$core$String$filter,
												function (c) {
													return !A2(
														$elm$core$List$member,
														c,
														_List_fromArray(
															['@', '/', '.']));
												},
												r.v)))
										])),
									$elm$html$Html$text(' · via ' + (r.a8 + (' · ' + r.au)))
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('members')
						]),
					A2(
						$elm$core$List$map,
						function (m) {
							return A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$classList(
										_List_fromArray(
											[
												_Utils_Tuple2('chip', true),
												_Utils_Tuple2(
												'buyer',
												_Utils_eq(m, r.v))
											]))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(m)
									]));
						},
						r.ax)),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('feed'),
							$elm$html$Html$Attributes$id('feed'),
							A2($elm$html$Html$Attributes$attribute, 'aria-live', 'polite')
						]),
					A2(
						$elm$core$List$map,
						$author$project$Main$viewPost(decision),
						r.aC)),
					A2(
					$elm$html$Html$form,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('compose'),
							$elm$html$Html$Events$onSubmit($author$project$Main$ComposeSubmit)
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$id('composeInput'),
									$elm$html$Html$Attributes$placeholder('Step in as staff: @mention an agent or write to the buyer agent'),
									$elm$html$Html$Attributes$autocomplete(false),
									$elm$html$Html$Attributes$value(model.k),
									$elm$html$Html$Events$onInput($author$project$Main$ComposeInput)
								]),
							_List_Nil),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('btn primary'),
									$elm$html$Html$Attributes$type_('submit')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Send to room')
								]))
						]))
				]));
	}
};
var $author$project$Main$viewRefundRow = function (f) {
	var primaryAct = function () {
		var _v1 = f.cv;
		switch (_v1) {
			case 'Approve':
				return 'Refunded';
			case 'Ask for photo':
				return 'Photo requested';
			default:
				return 'Exchange offered';
		}
	}();
	var action = function () {
		var _v0 = f.bm;
		if (_v0.$ === 1) {
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('actions')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('btn primary'),
								$elm$html$Html$Events$onClick(
								A2($author$project$Main$Decide, f.b, primaryAct))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(f.cv)
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('btn'),
								$elm$html$Html$Events$onClick(
								A2($author$project$Main$Decide, f.b, 'Refunded'))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Refund')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('btn danger'),
								$elm$html$Html$Events$onClick(
								A2($author$project$Main$Decide, f.b, 'Declined'))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Decline')
							]))
					]));
		} else {
			var status = _v0.a;
			return A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('pill p-neutral')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(status)
					]));
		}
	}();
	return A2(
		$elm$html$Html$tr,
		_List_Nil,
		_List_fromArray(
			[
				A2(
				$elm$html$Html$td,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('mono')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(f.b),
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('sub')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(f.bD)
							]))
					])),
				A2(
				$elm$html$Html$td,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text(f.cf)
					])),
				A2(
				$elm$html$Html$td,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('num')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(
						$author$project$Main$money(f.b7))
					])),
				A2(
				$elm$html$Html$td,
				_List_Nil,
				_List_fromArray(
					[
						$author$project$Main$pill(
						_Utils_Tuple2(
							'Risk ' + $elm$core$String$fromInt(f.ai),
							$author$project$Main$riskTone(f.ai))),
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('sub')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(f.cv)
							]))
					])),
				A2(
				$elm$html$Html$td,
				_List_Nil,
				_List_fromArray(
					[
						$author$project$Main$reasons(f.cJ)
					])),
				A2(
				$elm$html$Html$td,
				_List_Nil,
				_List_fromArray(
					[action]))
			]));
};
var $author$project$Main$viewTab = function (model) {
	var _v0 = model.A;
	switch (_v0) {
		case 0:
			return $author$project$Main$viewConversation(model);
		case 1:
			return A2(
				$elm$html$Html$div,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('pad note')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('The returns screener scores every request. Refunds over $150, or with a risk score above 60, stop here and wait for a person (ZooWork approval step).')
							])),
						A2(
						$author$project$Main$table_,
						_List_fromArray(
							['Case', 'Customer', 'Amount', 'Screener', 'Why', 'Action']),
						A2($elm$core$List$map, $author$project$Main$viewRefundRow, model.V))
					]));
		case 2:
			return A2(
				$elm$html$Html$div,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('pad note')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Every agent is checked before it gets a room: Band identity, platform signature, rate limits, and a Tavily lookup on unknown operators.')
							])),
						A2(
						$author$project$Main$table_,
						_List_fromArray(
							['Agent', 'Claims to be', 'Checks', 'Risk', 'Result']),
						A2(
							$elm$core$List$map,
							function (a) {
								return A2(
									$elm$html$Html$tr,
									_List_Nil,
									_List_fromArray(
										[
											A2(
											$elm$html$Html$td,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('mono')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(a.v)
												])),
											A2(
											$elm$html$Html$td,
											_List_Nil,
											_List_fromArray(
												[
													$elm$html$Html$text(a.ce)
												])),
											A2(
											$elm$html$Html$td,
											_List_Nil,
											_List_fromArray(
												[
													$author$project$Main$reasons(a.cc)
												])),
											A2(
											$elm$html$Html$td,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('num')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(
													$elm$core$String$fromInt(a.ai))
												])),
											A2(
											$elm$html$Html$td,
											_List_Nil,
											_List_fromArray(
												[
													$author$project$Main$pill(a.cx)
												]))
										]));
							},
							$author$project$Data$agentsSeen)),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('pad')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('label')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Fraud signals today')
									]))
							])),
						A2(
						$author$project$Main$table_,
						_List_fromArray(
							['Time', 'Signal', 'Raised by', 'Severity']),
						A2(
							$elm$core$List$map,
							function (s) {
								return A2(
									$elm$html$Html$tr,
									_List_Nil,
									_List_fromArray(
										[
											A2(
											$elm$html$Html$td,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('mono')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(s.bY)
												])),
											A2(
											$elm$html$Html$td,
											_List_Nil,
											_List_fromArray(
												[
													$elm$html$Html$text(s.al)
												])),
											A2(
											$elm$html$Html$td,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('mono')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(s.ca)
												])),
											A2(
											$elm$html$Html$td,
											_List_Nil,
											_List_fromArray(
												[
													$author$project$Main$pill(s.cA)
												]))
										]));
							},
							$author$project$Data$signals))
					]));
		default:
			return A2(
				$elm$html$Html$div,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('pad note')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Each decision an agent makes is written down with the inputs it used. Agent prompt and policy changes are versioned in git with Entire Checkpoints, so you can see which version made the call.')
							])),
						A2(
						$author$project$Main$table_,
						_List_fromArray(
							['Time', 'Agent', 'Decision', 'Based on', 'Agent version']),
						A2(
							$elm$core$List$map,
							function (l) {
								return A2(
									$elm$html$Html$tr,
									_List_Nil,
									_List_fromArray(
										[
											A2(
											$elm$html$Html$td,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('mono')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(l.bY)
												])),
											A2(
											$elm$html$Html$td,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('mono')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(l.b4)
												])),
											A2(
											$elm$html$Html$td,
											_List_Nil,
											_List_fromArray(
												[
													$elm$html$Html$text(l.bm)
												])),
											A2(
											$elm$html$Html$td,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('note')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(l.b9)
												])),
											A2(
											$elm$html$Html$td,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('mono')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(l.cH)
												]))
										]));
							},
							model.aw))
					]));
	}
};
var $author$project$Main$viewConsole = function (model) {
	var waiting = $elm$core$List$length(
		A2(
			$elm$core$List$filter,
			function (f) {
				return _Utils_eq(f.bm, $elm$core$Maybe$Nothing);
			},
			model.V));
	return A2(
		$elm$html$Html$main_,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$id('view-console'),
				$elm$html$Html$Attributes$hidden(!(!model.j))
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('kpis')
					]),
				_List_fromArray(
					[
						A3($author$project$Main$kpi, 'Revenue', '$3,412', 'agent-assisted sales today · 14 orders'),
						A3($author$project$Main$kpi, 'Efficiency', '41', 'service rooms closed without staff'),
						A3(
						$author$project$Main$kpi,
						'Risk',
						$elm$core$String$fromInt(waiting),
						'refunds waiting for your approval'),
						A3($author$project$Main$kpi, 'Risk', '17', 'unverified bots refused entry')
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('console')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$aside,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('panel')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('panel-h')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('label')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Live rooms')
											])),
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('pill p-neutral num')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												$elm$core$String$fromInt(
													$elm$core$List$length(model.W)))
											]))
									])),
								A2(
								$elm$html$Html$ul,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('rooms')
									]),
								A2(
									$elm$core$List$map,
									$author$project$Main$viewRoomRow(model.D),
									model.W))
							])),
						A2(
						$elm$html$Html$section,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('panel')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('tabs'),
										A2($elm$html$Html$Attributes$attribute, 'role', 'tablist'),
										A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Room views')
									]),
								_List_fromArray(
									[
										A3(
										$author$project$Main$tabButton,
										'Conversation',
										!model.A,
										$author$project$Main$SelectTab(0)),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												A2($elm$html$Html$Attributes$attribute, 'role', 'tab'),
												$author$project$Main$ariaSelected(model.A === 1),
												$elm$html$Html$Events$onClick(
												$author$project$Main$SelectTab(1))
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Refunds'),
												A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('count')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(
														$elm$core$String$fromInt(waiting))
													]))
											])),
										A3(
										$author$project$Main$tabButton,
										'Security & fraud',
										model.A === 2,
										$author$project$Main$SelectTab(2)),
										A3(
										$author$project$Main$tabButton,
										'Decision log',
										model.A === 3,
										$author$project$Main$SelectTab(3))
									])),
								$author$project$Main$viewTab(model)
							])),
						A2(
						$elm$html$Html$aside,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('panel desk')
							]),
						$author$project$Main$viewDesk(model))
					]))
			]));
};
var $author$project$Main$view = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('wrap')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$header,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('top')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('brand')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h1,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Tabard')
									])),
								A2(
								$elm$html$Html$span,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Merchant copilot · answers the shopper\'s agent')
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('store')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('dot')
									]),
								_List_Nil),
								$elm$html$Html$text(' Linden & Oak · DTC apparel · agents online')
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('views'),
						A2($elm$html$Html$Attributes$attribute, 'role', 'tablist'),
						A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Views')
					]),
				_List_fromArray(
					[
						A3(
						$author$project$Main$tabButton,
						'Merchant console',
						!model.j,
						$author$project$Main$SelectView(0)),
						A3(
						$author$project$Main$tabButton,
						'Mission control',
						model.j === 1,
						$author$project$Main$SelectView(1)),
						A3(
						$author$project$Main$tabButton,
						'Agents & integrations',
						model.j === 2,
						$author$project$Main$SelectView(2)),
						A3(
						$author$project$Main$tabButton,
						'System design',
						model.j === 3,
						$author$project$Main$SelectView(3)),
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('sample')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Prototype · all store and customer data is sample data')
							]))
					])),
				$author$project$Main$viewConsole(model),
				A2(
				$elm$html$Html$main_,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('view-mission'),
						$elm$html$Html$Attributes$hidden(model.j !== 1)
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$map,
						$author$project$Main$MissionMsg,
						$author$project$Mission$view(model.ah))
					])),
				A2(
				$elm$html$Html$main_,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('view-agents'),
						$elm$html$Html$Attributes$hidden(model.j !== 2)
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$map,
						$author$project$Main$AgentsMsg,
						$author$project$Agents$view(model.Z))
					])),
				A2(
				$elm$html$Html$main_,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('view-design'),
						$elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('offstage', model.j !== 3)
							]))
					]),
				_List_fromArray(
					[$author$project$Design$view]))
			]));
};
var $author$project$Main$main = $elm$browser$Browser$element(
	{cm: $author$project$Main$init, cD: $author$project$Main$subscriptions, cG: $author$project$Main$update, j: $author$project$Main$view});
_Platform_export({'Main':{'init':$author$project$Main$main(
	A2(
		$elm$json$Json$Decode$andThen,
		function (saved) {
			return A2(
				$elm$json$Json$Decode$andThen,
				function (hash) {
					return A2(
						$elm$json$Json$Decode$andThen,
						function (api) {
							return $elm$json$Json$Decode$succeed(
								{u: api, af: hash, aF: saved});
						},
						A2($elm$json$Json$Decode$field, 'api', $elm$json$Json$Decode$string));
				},
				A2($elm$json$Json$Decode$field, 'hash', $elm$json$Json$Decode$string));
		},
		A2($elm$json$Json$Decode$field, 'saved', $elm$json$Json$Decode$string)))(0)}});}(this));