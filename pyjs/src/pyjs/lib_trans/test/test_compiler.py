from UnitTest import UnitTest
from textwrap import dedent
import os.path
import sys
sys.path[0:0] = [os.path.dirname(os.path.dirname(os.path.abspath(__file__)))]
import compiler
import traceback

class CompilerTest(UnitTest):
    def _test_compile(self, code, codestr):
        code2 = dedent(code) + "\n"
        tree = compiler.parse(code2)
        self.assertEqual(str(tree.node), codestr)

    def test_statements(self):
        statements = [
            ("a + 1",
             "Stmt([Discard(Add(Name('a'), Const(1)))])"),
            
            ("a = 1",
             "Stmt([Assign([AssName('a', 'OP_ASSIGN')], Const(1))])"),
            
            ("def test(): pass",
             "Stmt([Function(None, 'test', (), (), False,"
             " False, None, Stmt([Pass()]))])"),
            
            ("with a as b: pass",
             "Stmt([With(Name('a'), AssName('b', 'OP_ASSIGN'),"
             " Stmt([Pass()]))])"),
            
            ("""
            def test(a, b=123, **kw):
                yield b
            """,
               "Stmt([Function(None, 'test', ['a', 'b', 'kw'],"
               " [Const(123)], False, True, None,"
               " Stmt([Discard(Yield(Name('b')))]))])"),
            
            ("""
            @dec
            class X(object):
                pass
            """,
               "Stmt([Class('X', [Name('object')], None,"
               " Stmt([Pass()]), Decorators([Name('dec')]))])"),
            
            ("""
            @dec()
            def test():
                pass
            """,
               "Stmt([Function(Decorators([CallFunc(Name('dec'), [], None, None)]),"
               " 'test', (), (), False, False, None, Stmt([Pass()]))])"),
        
        ]
            
        for code, codestr in statements:
            try:
                self._test_compile(code, codestr)
            except Exception:
                traceback.print_exc()

from RunTests import RunTests
def test_main():
    t = RunTests()
    t.add(CompilerTest)
    t.start_test()

if __name__ == '__main__':
    test_main()

