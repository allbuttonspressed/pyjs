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

    def test_slice_span(self):
        """
        self.assertEqual([1,2,3,4][::2], [1,3])
        """
        self.fail("Slice span, #364, #434, #577, #582")


    def test_discard_expressions(self):
        """
        (1, 2)
        x = 10
        x
        "some string"
        """
        self.fail("ast.Discard nodes, #584")
        
    def test_callfunc_expressions(self):
        """
        s = "123"
        x = ('a' + 'b').strip()
        ("    " + s).rstrip()
        """
        self.fail("Callfunc over expressions, #591")
        
    def test_for_args(self):
        class X(object):
            pass
        x = X()
        x.a = 1
        for x.a in [3,4,5]:
            print x.a
        self.assertEqual(x.a, 5)
        
        global gl
        for gl in [1,2,3]:
            pass
        self.assertEqual(globals()['gl'], 3)
        
        d = {}
        for d['zz'] in [1,2,3]:
            pass
        self.assertEqual(d, {'zz': 3})
        
        l = [1]
        for l[0] in [1,2,3]:
            pass
        self.assertEqual(l, [3])
        
        l = [1,3,4]
        for l[1:2] in [[5,6,7]]:
            pass
        self.assertEqual(l, [1, 5, 6, 7, 4])
        
    def test_deep_tuple_unpacking(self):
        x = ((1, 2), 3, (4, 5))
        (a, b), c, (d, e) = x
        for (a, b), c, (d, e) in [x]*5:
            pass
        x = (1, (2, (3, (4, 5), 6), 7), 8, (9, 10))
        a1, (b1, (c1, (d1, d2), c2), b2), a2, a3 = x
        #a1, (b1, (c1, *c2), b2), a2, a3 = x # Py3 syntax
        
        class X(object):
            pass
        x = X()
        x.a = 1
        d = {}
        l = [1,3,4]
        l[1:2], x.a, d['zz'] = ((10, 11), 20, 30)
        self.assertEqual(l, [1, 10, 11, 4])
        self.assertEqual(x.a, 20)
        self.assertEqual(d, {'zz': 30})
        
        #self.fail("Bug #527 Tuple unpacking not supported for more than one level")

    def test_subscript_tuple(self):
        """
        d = {}
        d[(1,2)] = 3
        x = d[1,2]
        """
        self.fail("Tuple subscripts issue #496")

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
            
