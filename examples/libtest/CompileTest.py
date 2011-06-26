"""
This module does no actual work. It simply consists of some tests which may
cause compile to fail. When you find a new compiler bug, first add the test
here, in commented-out form and add self.fail() with issue number.
When you've patched the bug, remove the comments.
"""

import UnitTest
gl = None
class CompileTest(UnitTest.UnitTest):
    def test_issue_432(self):
        #issue 432
        x, y = 1, 2
        del x, y
     
    def test_issue_433(self):
        #issue 433
        for x in [1, 2] + [3, 4]:
            pass

    def test_discard_expressions(self):
        (1, 2)
        x = 10
        x
        "some string"
        #self.fail("ast.Discard nodes, #584")
        
    def test_callfunc_expressions(self):
        s = "123"
        x = ('a' + 'b').strip()
        ("    " + s).rstrip()
        #self.fail("Callfunc over expressions, #591")
        
    def test_function_deep_args_unpacking(self):
        """
        def func(a, (b, (c, d)), e):
            return a + b + c + d + e
        self.assertEqual(func(1, (2, (3, 4)), 5), 15, 'Tuple unpacking for args not supported')
        """
        self.fail('Bug #527, Function deep args unpacking fails to compile')

    def test_subscript_tuple(self):
        """
        d = {}
        d[(1,2)] = 3
        x = d[1,2]
        """
        self.fail("Tuple subscripts issue #496")
        
    def test_set_literal(self):
        """
        s = {1,2,3}
        """
        self.fail("Set literals syntax, bug #621")

    def test_bad_import(self):
        try: import _nonexistentmodule
        except: pass

        try: import _importtimeerror
        except: pass
        
        """
        try: import _badsyntaxmodule
        except: pass
        """
        self.fail("try: import badcode/except does not catch SyntaxError, #592")

        """
        try: import _untranslatablemodule
        except: pass
        """
        self.fail("try: import badcode/except does not catch TranslationError, #592")
            
