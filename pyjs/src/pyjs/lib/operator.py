import pyjslib as p

lt = None
le = None
eq = p.op_eq
ne = None
ge = None
gt = None
__lt__ = lt
__le__ = le
__eq__ = eq
__ne__ = ne
__ge__ = ge
__gt__ = gt

not_ = None
__not__ = not_

truth = p.bool

is_ = p.op_is

def is_not(a, b):
    return not is_(a, b)

abs = None
__abs__ = abs

and_ = None
__and__ = and_

floordiv = p.op_floordiv
__floordiv__ = floordiv

index = None
__index__ = index

inv = None
invert = p.op_invert
__inv__ = inv
__invert__ = invert

lshift = p.op_bitshiftleft
__lshift__ = lshift

mod = p.op_mod
__mod__ = mod

mul = p.op_mul
__mul__ = mul

neg = p.op_usub
__neg__ = neg

or_ = None
oper__ = None

pos = p.op_uadd
__pos__ = pos

pow = p.op_pow
__pow__ = pow

rshift = p.bitshiftright
__rshift__ = rshift

add = p.__op_add
__add__ = add

sub = p.op_sub
__sub__ = sub

truediv = p.op_truediv
__truediv__ = truediv

xor = None
__xor__ = xor

concat = None
__concat__ = concat

contains = None
__contains__ = contains

countOf = None

delitem = None
__delitem__ = delitem

getitem = None
__getitem__ = getitem

indexOf = None

setitem = None
__setitem__ = setitem

attrgetter = None
itemgetter = None
methodcaller = None

iadd = None
__iadd__ = iadd

iand = None
__iand__ = iand

iconcat = None
__iconcat__ = iconcat

ifloordiv = None
__ifloordiv__ = ifloordiv

ilshift = None
__ilshift__ = ilshift

imod = None
__imod__ = imod

imul = None
__imul__ = imul

ior = None
__ior__ = ior

ipow = None
__ipow__ = ipow

irshift = None
__irshift__ = irshift

isub = None
__isub__ = isub

itruediv = None
__itruediv__ = itruediv

ixor = None
__ixor__ = ixor