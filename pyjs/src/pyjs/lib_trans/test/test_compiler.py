import sys
sys.path[0:0] = ['/root/repos/pyjamas/pyjs/src/pyjs/lib_trans/']
import compiler

src = """
a = 1

def test():
    pass

with a as b:
    pass

@test
class X(object):
    pass

@test()
def test2():
    pass
"""
tree = compiler.parse(src)
print tree
