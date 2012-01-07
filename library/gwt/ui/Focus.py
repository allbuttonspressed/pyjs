# Copyright 2006 James Tauber and contributors
# Copyright (C) 2009 Luke Kenneth Casson Leighton <lkcl@lkcl.net>
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
from pyjamas import DOM
from __pyjamas__ import JS

# global focus handler shared by all focusable
JS("""
var focusHandler = null;
""")

def ensureFocusHandler():
    JS("""
    return (focusHandler !== null) ? focusHandler : (focusHandler =
            @{{createFocusHandler}}());
    """)

def createFocusHandler():
    JS("""
    return function(evt) {
      // This function is called directly as an event handler, so 'this' is
      // set up by the browser to be the input on which the event is fired. We
      // call focus() in a timeout or the element may be blurred when this event
      // ends.
      var div = this.parentNode;
      if (div.onfocus) {
        $wnd.setTimeout(function() {
          div.focus();
        }, 0);
      } 
    };
    """)

def createFocusable0():
    JS("""
    var div = $doc.createElement('div');
    div.tabIndex = 0;

    var input = $doc.createElement('input');
    input.type = 'text';
    input.style.opacity = 0;
    input.style.zIndex = -1;
    input.style.width = '1px';
    input.style.height = '1px';
    input.style.overflow = 'hidden';
    input.style.position = 'absolute';

    input.addEventListener( 'focus', focusHandler, false);

    div.appendChild(input);
    return div;
    """)

def blur(elem):
    elem.blur()

#def createFocusable():
#    e = DOM.createDiv()
#    e.tabIndex = 0
#    return e

def createFocusable():
    return createFocusable0(ensureFocusHandler());

def focus(elem):
    elem.focus()

def getTabIndex(elem):
    return elem.tabIndex

def setAccessKey(elem, key):
    elem.accessKey = key

def setTabIndex(elem, index):
    elem.tabIndex = index


class FocusMixin:

    def getTabIndex(self):
        return getTabIndex(self.getElement())

    def setAccessKey(self, key):
        setAccessKey(self.getElement(), key)

    def setFocus(self, focused):
        if (focused):
            focus(self.getElement())
        else:
            blur(self.getElement())

    def setTabIndex(self, index):
        setTabIndex(self.getElement(), index)

    def isEnabled(self):
        try:
            return not DOM.getBooleanAttribute(self.getElement(), "disabled")
        except TypeError:
            return True
        except AttributeError:
            return True

    def setEnabled(self, enabled):
        DOM.setBooleanAttribute(self.getElement(), "disabled", not enabled)

    def isReadonly(self):
        try:
            return not DOM.getBooleanAttribute(self.getElement(), "readOnly")
        except TypeError:
            return True
        except AttributeError:
            return True
    
    def setReadonly(self, readonly):
        DOM.setBooleanAttribute(self.getElement(), "readOnly", readonly)

