# Crossword Puzzle Loader Demo
# Copyright (C) 2011 Camille Dalmeras
#
#   This program is free software: you can redistribute it and/or modify
#   it under the terms of the GNU Affero General Public License as published by
#   the Free Software Foundation, either version 3 of the License, or
#   (at your option) any later version.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU Affero General Public License for more details.
#
#   You should have received a copy of the GNU Affero General Public License
#   along with this program.  If not, see <http://www.gnu.org/licenses/>.

import pyjd

from pyjamas.ui.RootPanel import RootPanel
from pyjamas.ui.SimplePanel import SimplePanel
from pyjamas.ui.HTML import HTML
from pyjamas.ui.Label import Label
from pyjamas.ui.Button import Button
from pyjamas.ui.HorizontalPanel import HorizontalPanel
from pyjamas.ui.AbsolutePanel import AbsolutePanel
from pyjamas.ui.ScrollPanel import ScrollPanel
from pyjamas.ui.Grid import Grid
from pyjamas.ui.TextBox import TextBox
from pyjamas.ui.FocusPanel import FocusPanel
from pyjamas.ui.Image import Image
from pyjamas.ui.DockPanel import DockPanel
from pyjamas.ui.DeckPanel import DeckPanel
from pyjamas.ui import HasHorizontalAlignment
from pyjamas.ui import HasVerticalAlignment
from pyjamas.ui import HasAlignment
from pyjamas.ui import Event
from pyjamas.ui import KeyboardListener
from pyjamas.ui.PopupPanel import PopupPanel
from pyjamas import Window
from pyjamas import DOM
from pyjamas.ui.Tooltip import TooltipListener

#from pyjamas.HorizSplitPanel import HorizontalSplitPanel

from pyjamas.JSONService import JSONProxy

from pyjamas.Timer import Timer
from menu import CrossMenuBar

def copy(ind):
    res = {}
    for (k, v) in ind.items():
        r1 = {}
        if k.isdigit(): # argh!  bug in pyjd json handling! int turns to string
            k = int(k) 
        if isinstance(v, dict):
            v = copy(v)
        res[k] = v
    return res


class ClueDialog(PopupPanel):
    def __init__(self, xword):
        PopupPanel.__init__(self, True)

        clue = xword.find_clue()
        print clue
        contents = HTML(clue)
        contents.setWidth("200px")
        self.setWidget(contents)
        row = xword.word_selected_pos[0]
        col = xword.word_selected_pos[1]
        cell = xword.tp.tp.getWidget(row, col)

        self.setStyleName("clue-popup")
        left = cell.getAbsoluteLeft() + 40
        top = cell.getAbsoluteTop() + 40
        self.setPopupPosition(left, top)
        self.show()

class CrossGame(DockPanel):

    def __init__(self):

        DockPanel.__init__(self)

        self.deck = DeckPanel(StyleName="gwt-TabPanelBottom",
                              Height="100%", Width="100%")
        self.cross = Crossword()
        self.solution = CrossGrid()
        self.deck.insert(self.cross, 0)
        self.deck.insert(self.solution, 1)
        self.menu = CrossMenuBar(self)
        self.add(self.menu, DockPanel.NORTH)
        self.add(self.deck, DockPanel.CENTER)
        self.setCellWidth(self.deck, "100%")
        self.setCellHeight(self.deck, "100%")
        self.deck.showWidget(0)

        # add brief advice on how to return to puzzle
        self.tt = TooltipListener("Click solution to return.")
        self.solution.addMouseListener(self.tt)
        self.solution.addClickListener(self)

        # trigger getting the crossword
        self.remote = InfoServicePython()
        self.remote.get_crossword(self)

        # deal with window resizes at some point
        width = Window.getClientWidth()
        height = Window.getClientHeight()

        self.onWindowResized(width, height)
        Window.addWindowResizeListener(self)

  
    def onClick(self, listener):
        if listener == self.solution:
            self.deck.showWidget(0)
            self.tt.hide()
            
    def onWindowResized(self, width, height):
        return

    def show_solution(self):
        if Window.confirm("Do you wish to display the solution?"):
            self.deck.showWidget(1)

    def onRemoteResponse(self, response, request_info):
        method = request_info.method
        if method == "get_crossword":
            self.cross.create_crossword(response)
            self.solution.resize(self.cross.cross_height, self.cross.cross_width)
            self.solution.fill_crossword(self.cross.letters)

    def onRemoteError(self, code, message, request_info):
        RootPanel().add(HTML("Server Error" + str(code)))
        RootPanel().add(HTML(str(message)))

class CrossGrid(FocusPanel):

    def __init__(self, **kwargs):

        FocusPanel.__init__(self)
        self.tp = Grid(StyleName='crossword',
                       CellSpacing="0px", CellPadding="0px",
                       zIndex=0)
        self.add(self.tp)
        self.cf = self.tp.getCellFormatter()
  
    def addTableListener(self, listener):
        self.tp.addTableListener(listener)

    def highlight_cursor(self, row, col, highlight):
        """ highlights (or dehighlights) the currently selected cell
        """
        self.cf._setStyleName(row, col, "cross-square-word-cursor",
                                      highlight)

    def resize(self, width, height):
        self.tp.resize(width, height)

    def highlight_selected(self, word, highlight):
        """ highlights (or dehighlights) the currently-selected word
        """
        x1 = word['x']
        y1 = word['y']
        x2 = x1 + word['xd']
        y2 = y1 + word['yd']
        for x in range(x1, x2+1):
            for y in range(y1, y2+1):
                self.cf._setStyleName(y-1, x-1, "cross-square-word-select",
                                      highlight)

    def set_grid_value(self, clue, y, x):

        style = clue and "cross-square" or "cross-square-block"
        clue = clue or '&nbsp;'
        self.tp.setWidget(y, x, HTML(clue, StyleName=style))
        self.cf.setAlignment(y, x,  HasAlignment.ALIGN_CENTER,
                                    HasAlignment.ALIGN_MIDDLE)

    def fill_crossword(self, letters):

        # set up the letters (demo)
        for c in letters:
            x = c['x']
            y = c['y']
            clue = c['value']
            self.set_grid_value(clue, y, x)


class InfoServicePython(JSONProxy):
    def __init__(self):
            JSONProxy.__init__(self, "/crosswordservice/CrosswordService.py",
                    ["get_crossword",
                     ])

class Crossword(SimplePanel):

    def __init__(self):

        #AbsolutePanel.__init__(self, Size=("100%", "100%"))
        SimplePanel.__init__(self)

        # grid for crossword
        self.tp = CrossGrid()
        self.add(self.tp)
        self.cd = None

        self.word_selected = None
        self.word_selected_pos = None

        self.tp.addTableListener(self)
        self.tp.addKeyboardListener(self)
        self.tp.setFocus(True)

    def onKeyDown(self, sender, keycode, modifiers):

        # check up/down/left/right cursor keys
        if keycode == KeyboardListener.KEY_UP or \
           keycode == KeyboardListener.KEY_LEFT:
            self.move_cursor(-1)
            return
        elif keycode == KeyboardListener.KEY_DOWN or \
           keycode == KeyboardListener.KEY_RIGHT:
            self.move_cursor(1)
            return
        
        # check the key is a letter, and there's a grid position highlighted
        val = chr(keycode)
        if not val.isalpha() or not self.word_selected_pos:
            return

        # update value
        row = self.word_selected_pos[0]
        col = self.word_selected_pos[1]
        self.tp.set_grid_value(val, row, col)

        # move cursor onwards (if possible)
        self.move_cursor(1)

    def move_cursor(self, dirn):

        word = self.words[self.word_selected]
        x1 = word['x']
        y1 = word['y']
        xd = word['xd']
        yd = word['yd']
        x2 = x1 + xd
        y2 = y1 + yd

        row = self.word_selected_pos[0]
        col = self.word_selected_pos[1]

        if dirn == 1 and x2 == col+1 and y2 == row+1:
            return

        if dirn == -1 and x1 == col+1 and y1 == row+1:
            return

        self.highlight_cursor(False)
        self.word_selected_pos = (row + (yd and dirn), col + (xd and dirn))
        self.highlight_cursor(True)
        #self.highlight_input(True)

    def onKeyUp(self, sender, keycode, modifiers):
        pass

    def onKeyPress(self, sender, keycode, modifiers):
        pass

    def highlight_cursor(self, highlight):
        """ highlights (or dehighlights) the currently selected cell
        """
        row = self.word_selected_pos[0]
        col = self.word_selected_pos[1]
        self.tp.highlight_cursor(row, col, highlight)

    def highlight_selected(self, highlight):
        """ highlights (or dehighlights) the currently-selected word
        """
        word = self.words[self.word_selected]
        self.tp.highlight_selected(word, highlight)

    def _find_clue(self, clues):
        num = self.word_selected
        print num, clues
        if not clues.has_key(num):
            return None
        clue = clues[num]
        return "%s (%d)" % (clue['word'], clue['format'])

    def find_clue(self):
        return self._find_clue(self.across['clues']) or \
               self._find_clue(self.down['clues'])

    def check_word_range(self, word, row, col):
        """ checks if a word is "hit" by the row/col selected
        """
        x1 = word['x']
        y1 = word['y']
        x2 = x1 + word['xd']
        y2 = y1 + word['yd']
        for x in range(x1, x2+1):
            for y in range(y1, y2+1):
                if x == col and y == row:
                    return True
        return False
            
    def find_word(self, row, col):
        found_words = []
        for (num, word) in self.words.items():
            if self.check_word_range(word, row, col):
                found_words.append(num)
        return found_words
            
    def onCellClicked(self, listener, row, col):

        # find the words first
        words_found = self.find_word(row+1, col+1)

        # de-highlight the word found
        if self.word_selected is not None:
            self.highlight_selected(False)

        # de-highlight cursor
        if self.word_selected_pos is not None:
            self.highlight_cursor(False)

        if not words_found:
            self.word_selected_pos = None
            return

        new_word = words_found[0] # pick any one

        # work out which one to highlight
        if self.word_selected in words_found:
            # see if the same letter was clicked, first
            if self.word_selected_pos is not None and \
               (self.word_selected_pos[0] != row or \
                self.word_selected_pos[1] != col):
                # it wasn't (the same letter): keep the same word
                new_word = self.word_selected
            else:
                # whoops, same letter clicked: pick the other alternative
                for w in words_found:
                    if w != self.word_selected:
                        new_word = w
                        break

        # store current word and cursor pos, highlight word and pos, show clue
        self.word_selected = new_word
        self.word_selected_pos = (row, col)
        self.highlight_selected(True)
        self.highlight_cursor(True)

        # show the clue popup
        if self.cd is not None:
            self.cd.hide()
            del self.cd
        self.cd = ClueDialog(self)

    def onWindowResized(self, width, height):
        self.remote.get_crossword(self)
        return
        #self.hp.setWidth("%dpx" % (width - self.tree_width))
        #self.hp.setHeight("%dpx" % (height - 20))
        self.cp1.setHeight("%dpx" % (height - 30))
        self.cp2.setHeight("%dpx" % (height - 30))
        self.rps.setHeight("%dpx" % (height - 30))
        self.horzpanel1.setHeight("%dpx" % (height - 20))

    def create_crossword(self, cross):
        """ creates the crossword, records all info from the server
        """

        # take a copy of everything
        self.words = copy(cross['words'])
        self.across = copy(cross['across'])
        self.down = copy(cross['down'])
        self.cross_height = cross['height']
        self.cross_width = cross['width']

        # set up the letters (demo)
        self.letters = []
        cells = cross["cells"]
        l = len(cells)
        self.tp.resize(self.cross_height, self.cross_width)
        for c in cells:
            x = c['x'] - 1
            y = c['y'] - 1
            clue = c['value']
            self.letters.append({'x': x, 'y': y, 'value': clue})
            self.tp.set_grid_value(clue and "&nbsp;" or None, y, x)

    def fill_crossword(self):

        # set up the letters (demo)
        for c in self.letters:
            x = c['x']
            y = c['y']
            clue = c['value']
            self.set_grid_value(clue, y, x)

    def fill_right_grid(self, data):
        index = data.get('index')
        name = data.get('name')
        if data.has_key('items'):
            self.rp.add_items(data.get('items'), name, index)
        elif data.has_key('html'):
            self.rp.add_html(data.get('html'), name, index)

class InfoServicePython(JSONProxy):
    def __init__(self):
            JSONProxy.__init__(self, "/crosswordservice/CrosswordService.py",
                    ["get_crossword",
                     ])



if __name__ == '__main__':
    pyjd.setup("http://127.0.0.1/examples/crossword/public/Crossword.html")
    app = CrossGame()
    RootPanel("crossword").add(app)
    pyjd.run()

