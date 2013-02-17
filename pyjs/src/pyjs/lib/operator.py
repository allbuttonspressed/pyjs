from __pyjamas__ import JS

def _noimpl(*args):
    raise Exception("This operator is not implemented")

lt = _noimpl
le = _noimpl
eq = JS("@{{:op_eq}}")
ne = _noimpl
ge = _noimpl
gt = _noimpl
__lt__ = lt
__le__ = le
__eq__ = eq
__ne__ = ne
__ge__ = ge
__gt__ = gt

not_ = _noimpl
__not__ = not_

truth = JS("@{{:bool}}")

is_ = JS("@{{:op_is}}")

def is_not(a, b):
    return not is_(a, b)

abs = _noimpl
__abs__ = abs

and_ = _noimpl
__and__ = and_

floordiv = JS("@{{:op_floordiv}}")
__floordiv__ = floordiv

index = _noimpl
__index__ = index

inv = _noimpl
invert = JS("@{{:op_invert}}")
__inv__ = inv
__invert__ = invert

lshift = JS("@{{:op_bitshiftleft}}")
__lshift__ = lshift

mod = JS("@{{:op_mod}}")
__mod__ = mod

mul = JS("@{{:op_mul}}")
__mul__ = mul

neg = JS("@{{:op_usub}}")
__neg__ = neg

or_ = _noimpl
oper__ = _noimpl

pos = JS("@{{:op_uadd}}")
__pos__ = pos

pow = JS("@{{:op_pow}}")
__pow__ = pow

rshift = JS("@{{:op_bitshiftright}}")
__rshift__ = rshift

add = JS("@{{:__op_add}}")
__add__ = add

sub = JS("@{{:op_sub}}")
__sub__ = sub

truediv = JS("@{{:op_truediv}}")
__truediv__ = truediv

xor = _noimpl
__xor__ = xor

concat = _noimpl
__concat__ = concat

contains = _noimpl
__contains__ = contains

countOf = _noimpl

delitem = _noimpl
__delitem__ = delitem

getitem = _noimpl
__getitem__ = getitem

indexOf = _noimpl

setitem = _noimpl
__setitem__ = setitem

attrgetter = _noimpl
itemgetter = _noimpl
methodcaller = _noimpl

iadd = _noimpl
__iadd__ = iadd

iand = _noimpl
__iand__ = iand

iconcat = _noimpl
__iconcat__ = iconcat

ifloordiv = _noimpl
__ifloordiv__ = ifloordiv

ilshift = _noimpl
__ilshift__ = ilshift

imod = _noimpl
__imod__ = imod

imul = _noimpl
__imul__ = imul

ior = _noimpl
__ior__ = ior

ipow = _noimpl
__ipow__ = ipow

irshift = _noimpl
__irshift__ = irshift

isub = _noimpl
__isub__ = isub

itruediv = _noimpl
__itruediv__ = itruediv

ixor = _noimpl
__ixor__ = ixor

# Removed in 3.x
delslice = JS("@{{:__delslice}}")
getslice = JS("@{{:__getslice}}")
setslice = JS("@{{:__setslice}}")
div = JS("@{{:op_div}}")
isCallable = JS("@{{:isFunction}}")
isMappingType = JS("@{{:isIteratable}}")
isNumberType = JS("@{{:isNumber}}")
isSequenceType = JS("@{{:isIteratable}}")
repeat = _noimpl
