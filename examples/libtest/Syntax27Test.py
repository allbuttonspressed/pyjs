from UnitTest import UnitTest
import sys 

class Syntax27Test(UnitTest):
    def testSetLiteral(self):
        s = {1, 2, None, True, False, 2, 2, ('a',)}
        self.assertEqual(s, set([False, True, 2, ('a',), None]))     

