
import pyjd

from pyjamas.ui.RootPanel import RootPanel
from pyjamas.ui.FocusPanel import FocusPanel
from pyjamas.ui.VerticalPanel import VerticalPanel
from pyjamas.ui.HorizontalPanel import HorizontalPanel
from pyjamas.ui.SimplePanel import SimplePanel
from pyjamas.ui.MenuBar import MenuBar
from pyjamas.ui.MenuItem import MenuItem
from pyjamas.ui.Grid import Grid
from pyjamas.ui.DialogBox import DialogBox
from pyjamas.ui.PopupPanel import PopupPanel
from pyjamas.ui.TextBox import TextBox
from pyjamas.ui.Button import Button
from pyjamas.ui.Label import Label
from pyjamas.ui.HTMLPanel import HTMLPanel
from pyjamas.ui import Event
from pyjamas import DOM
from pyjamas import Window

class CrossMenuBar(MenuBar):
    def __init__(self, game):
        super(CrossMenuBar, self).__init__()
        
        self.addItem(MenuItem('Solution', MenuCmd(game, 'solution')))
        self.addItem(MenuItem('Hint', MenuCmd(game, 'hint')))
        self.addItem(MenuItem('Errors', MenuCmd(game, 'errors')))
        self.addItem(MenuItem('Help', MenuCmd(game, 'about')))
    
class MenuCmd:
    def __init__(self, game, command):
        self.game = game
        self.command = command
    
    def execute(self):
        if self.command == 'errors':
            self.game.show_errors()
        elif self.command == 'hint':
            self.game.show_hint()
        elif self.command == 'solution':
            self.game.show_solution()
        elif self.command == 'about':
            self.show_about()
    
    def close_dialog(self, event):
        self.dialog.hide()
    
    def show_about(self):
        self.dialog = PopupPanel(StyleName='about', autoHide=True)
        
        contents = HTMLPanel('', StyleName='contents')
        self.dialog.setWidget(contents)
        
        html = '<p class="pyjamas">Crossword Puzzle written in Python with ' \
                    '<a href="http://pyjs.org" target="_blank">Pyjamas</a><p>' \
               '<p class="comments">Send comments to ' \
                    '<a href="mailto:lkcl@lkcl.net">' \
                        'lkcl@lkcl.net</a>.<p>'
        contents.setHTML(html)
        
        left = (Window.getClientWidth() - 294) / 2
        top = (Window.getClientHeight() - 112) / 2
        self.dialog.setPopupPosition(left, top)
        self.dialog.show()

