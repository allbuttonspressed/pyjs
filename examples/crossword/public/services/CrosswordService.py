#!/usr/bin/env python

import os
from string import split, strip
import xml.dom.minidom

def get_directory_info(prefix, pth, recursive):
    res = []
    directory = os.listdir(pth)
    directory.sort()
    for p in directory:
        if p[0] != '.':
            subp = os.path.join(pth, p)
            p = os.path.join(prefix, p)
            if recursive and os.path.isdir(subp):
                res.append([p, get_directory_info(prefix, subp, 1)])
            else:
                res.append([p, None])
    return res

def av(c, v):
    return c.attributes[v].nodeValue

def get_cells(dom):
    cells = []
    for c in dom:
        x = int(av(c, 'x'))
        y = int(av(c, 'y'))
        v = None
        if c.hasAttribute('solution'):
            v = av(c, 'solution')
        cells.append({'x': x, 'y': y, 'value': v})
    return cells

def get_words(dom):
    words = {}
    for c in dom:
        x = av(c, 'x')
        y = av(c, 'y')
        if '-' in x:
            y = int(y)
            yd = 0
            x = x.split("-")
            x = map(int, x)
            xd = x[1] - x[0]
            x = x[0]
        else:
            x = int(x)
            xd = 0
            y = y.split("-")
            y = map(int, y)
            yd = y[1] - y[0]
            y = y[0]
        num = int(av(c, 'id'))
        word = { 'x': x, 'y': y, 'xd': xd, 'yd': yd, 'id': num,
               }
        words[num] = word
    return words

def get_clues(dom):
    title = dom.getElementsByTagName("title")[0]
    title = "".join(map(lambda x: x.toxml(), title.childNodes))
    dclues = dom.getElementsByTagName("clue")
    clues = {}
    for c in dclues:
        num = int(av(c, 'word'))
        clue = { 'word': unicode(c.childNodes[0].data),
                 'format': int(av(c, 'format')),
                 'number': int(av(c, 'number')),
                 'id': num,
               }
        clues[num] = clue
    return {'title': title, 'clues': clues}

def get_size(dom):
    c = dom.getElementsByTagName("grid")[0]
    return (int(av(c, 'width')), int(av(c, 'height')))
    
class Service:
    def get_crossword(self):
        """ return list of directory, including indicating whether each
            path is a directory or not
        """
        pth = os.path.join(os.getcwd(), "data")
        pth = os.path.join(pth, "test.xml")
        f = open(pth)
        txt = f.read()
        dom = xml.dom.minidom.parseString(txt)
        dclues = dom.getElementsByTagName("clues")
        across = get_clues(dclues[0])
        down = get_clues(dclues[1])
        words = get_words(dom.getElementsByTagName("word"))
        cells = get_cells(dom.getElementsByTagName("cell"))
        width, height = get_size(dom)
        res = {'across': across, 'down': down,
               'width': width, 'height': height,
               'cells': cells, 'words': words,
               }
        return res

from jsonrpc.cgihandler import handleCGIRequest

handleCGIRequest(Service())

def test():
    s = Service()
    print s.get_crossword()

#if __name__ == '__main__':
#    test()
