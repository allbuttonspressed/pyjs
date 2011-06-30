from UnitTest import UnitTest
import sys 

class Syntax27Test(UnitTest):
    def testSetLiteral(self):
        s = {1,2,3,1,2,3,1,2,3}
        self.assertEqual(s, set([1,2,3]))
        s = {1, 2, None, True, False, 2, 2, ('a',)}
        self.assertEqual(s, set([False, True, 2, ('a',), None]))     

    def testSetComprehensions(self):
        s = sum({i*i for i in range(100) if i&1 == 1})
        self.assertEqual(s, 166650)
        
        s = {2*y + x + 1 for x in (0,) for y in (1,)}
        self.assertEqual(s, set([3]))
        
        l = list(sorted({(i,j) for i in range(3) for j in range(4)}))
        self.assertEqual(l, [(0, 0), (0, 1), (0, 2), (0, 3), (1, 0), (1, 1), (1, 2), (1, 3), (2, 0), (2, 1), (2, 2), (2, 3)])
        
        l = list(sorted({(i,j) for i in range(4) for j in range(i)}))
        self.assertEqual(l, [(1, 0), (2, 0), (2, 1), (3, 0), (3, 1), (3, 2)])
        
        i = 20
        s = sum({i*i for i in range(100)})
        self.assertEqual(s, 328350)
        self.assertEqual(i, 20)
        
        def srange(n):
            return {i for i in range(n)}
        l = list(sorted(srange(10)))
        self.assertEqual(l, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        
        lrange = lambda n:  {i for i in range(n)}
        l = list(sorted(lrange(10)))
        self.assertEqual(l, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        
        def grange(n):
            for x in {i for i in range(n)}:
                yield x
        l = list(sorted(grange(5)))
        self.assertEqual(l, [0, 1, 2, 3, 4])
        
        s = {None for i in range(10)}
        self.assertEqual(s, set([None]))
        
        items = {(lambda i=i: i) for i in range(5)}
        s = {x() for x in items}
        self.assertEqual(s, set(range(5)))
        
        items = {(lambda: i) for i in range(5)}
        s = {x() for x in items}
        self.assertEqual(s, set([4]))
        
        items = {(lambda: y) for i in range(5)}
        y = 2
        s = {x() for x in items}
        self.assertEqual(s, set([2]))
        
        def test_func():
            items = {(lambda i=i: i) for i in range(5)}
            return {x() for x in items}
        self.assertEqual(test_func(), set(range(5)))
                    
