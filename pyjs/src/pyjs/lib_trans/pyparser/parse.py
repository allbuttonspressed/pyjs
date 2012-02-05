# Copyright 2004-2005 Elemental Security, Inc. All Rights Reserved.
# Licensed to PSF under a Contributor Agreement.

"""Parser engine for the grammar tables generated by pgen.

The grammar table must be loaded first.

See Parser/parser.c in the Python distribution for additional info on
how this parsing engine works.

"""

import pytoken as token
import pysymbol as symbol

class Node:
    def __init__(self, type, value, context, children):
        self.type = type
        self.value = value
        self.context = context
        self.children = children
    def __repr__(self):
        if self.type > token.NT_OFFSET:
            res = "(%s" % symbol.sym_name[self.type]
        else:
            res = "(%s" % token.tok_name[self.type]
        if self.value:
            res += ", %s" % repr(self.value)
        if self.children:
            res += ", [%s]" % ', '.join(map(str, self.children))
        return res + ")"
    def ___repr__(self):
        cm = "None"
        if self.children:
            cm = "[%s]" % ', '.join(map(str, self.children))
        return "(%s, %s, %s, %s)" % (str(self.type), repr(self.value), str(self.context), cm)

class ParseError(Exception):
    """Exception to signal the parser is stuck."""

    def __init__(self, msg, type, value, context):
        Exception.__init__(self, "%s: type=%r, value=%r, context=%r" %
                           (msg, type, value, context))
        self.msg = msg
        self.type = type
        self.value = value
        self.context = context

class Parser(object):
    """Parser engine.

    The proper usage sequence is:

    p = Parser(grammar, [converter])  # create instance
    p.setup([start])                  # prepare for parsing
    <for each input token>:
        if p.addtoken(...):           # parse a token; may raise ParseError
            break
    root = p.rootnode                 # root of abstract syntax tree

    A Parser instance may be reused by calling setup() repeatedly.

    A Parser instance contains state pertaining to the current token
    sequence, and should not be used concurrently by different threads
    to parse separate token sequences.

    See driver.py for how to get input tokens by tokenizing a file or
    string.

    Parsing is complete when addtoken() returns True; the root of the
    abstract syntax tree can then be retrieved from the rootnode
    instance variable.  When a syntax error occurs, addtoken() raises
    the ParseError exception.  There is no error recovery; the parser
    cannot be used after a syntax error was reported (but it can be
    reinitialized by calling setup()).

    """

    def __init__(self, grammar, convert=None):
        """Constructor.

        The grammar argument is a grammar.Grammar instance; see the
        grammar module for more information.

        The parser is not ready yet for parsing; you must call the
        setup() method to get it started.

        The optional convert argument is a function mapping concrete
        syntax tree nodes to abstract syntax tree nodes.  If not
        given, no conversion is done and the syntax tree produced is
        the concrete syntax tree.  If given, it must be a function of
        two arguments, the first being the grammar (a grammar.Grammar
        instance), and the second being the concrete syntax tree node
        to be converted.  The syntax tree is converted from the bottom
        up.

        A concrete syntax tree node is a (type, value, context, nodes)
        tuple, where type is the node type (a token or symbol number),
        value is None for symbols and a string for tokens, context is
        None or an opaque value used for error reporting (typically a
        (lineno, offset) pair), and nodes is a list of children for
        symbols, and None for tokens.

        An abstract syntax tree node may be anything; this is entirely
        up to the converter function.

        """
        self.grammar = grammar
        self.convert = convert or (lambda grammar, node: node)

    def setup(self, start=None):
        """Prepare for parsing.

        This *must* be called before starting to parse.

        The optional argument is an alternative start symbol; it
        defaults to the grammar's start symbol.

        You can use a Parser instance to parse any number of programs;
        each time you call setup() the parser is reset to an initial
        state determined by the (implicit or explicit) start symbol.

        """
        if start is None:
            start = self.grammar.start
        # Each stack entry is a tuple: (dfa, state, node).
        # A node is a tuple: (type, value, context, children),
        # where children is a list of nodes or None, and context may be None.
        newnode = Node(start, None, None, [])
        stackentry = (self.grammar.dfas[start], 0, newnode)
        self.stack = [stackentry]
        self.rootnode = None
        self.used_names = set() # Aliased to self.rootnode.used_names in pop()

    def addtoken(self, type, value, context):
        """Add a token; return True iff this is the end of the program."""
        # Map from token to label
        ilabel = self.classify(type, value, context)
        # Loop until the token is shifted; may raise exceptions
        while True:
            dfa, state, node = self.stack[-1]
            states, first = dfa
            arcs = states[state]
            # Look for a state with this label
            for i, newstate in arcs:
                t, v = self.grammar.labels[i]
                if ilabel == i:
                    # Look it up in the list of labels
                    assert t < 256
                    # Shift a token; we're done with it
                    self.shift(type, value, newstate, context)
                    # Pop while we are in an accept-only state
                    state = newstate
                    while states[state] == [(0, state)]:
                        self.pop()
                        if not self.stack:
                            # Done parsing!
                            return True
                        dfa, state, node = self.stack[-1]
                        states, first = dfa
                    # Done with this token
                    return False
                elif t >= 256:
                    # See if it's a symbol and if we're in its first set
                    itsdfa = self.grammar.dfas[t]
                    itsstates, itsfirst = itsdfa
                    if ilabel in itsfirst:
                        # Push a symbol
                        self.push(t, self.grammar.dfas[t], newstate, context)
                        break # To continue the outer while loop
            else:
                if (0, state) in arcs:
                    # An accepting state, pop it and try something else
                    self.pop()
                    if not self.stack:
                        # Done parsing, but another token is input
                        raise ParseError("too much input",
                                         type, value, context)
                else:
                    # No success finding a transition
                    raise ParseError("bad input", type, value, context)

    def classify(self, type, value, context):
        """Turn a token into a label.  (Internal)"""
        if type == token.NAME:
            # Keep a listing of all used names
            self.used_names.add(value)
            # Check for reserved words
            ilabel = self.grammar.keywords.get(value)
            if ilabel is not None:
                return ilabel
        ilabel = self.grammar.tokens.get(type)
        if ilabel is None:
            raise ParseError("bad token", type, value, context)
        return ilabel

    def shift(self, type, value, newstate, context):
        """Shift a token.  (Internal)"""
        dfa, state, node = self.stack[-1]
        newnode = Node(type, value, context, None)
        newnode = self.convert(self.grammar, newnode)
        if newnode is not None:
            node.children.append(newnode)
        self.stack[-1] = (dfa, newstate, node)

    def push(self, type, newdfa, newstate, context):
        """Push a nonterminal.  (Internal)"""
        dfa, state, node = self.stack[-1]
        newnode = Node(type, None, context, [])
        self.stack[-1] = (dfa, newstate, node)
        self.stack.append((newdfa, 0, newnode))

    def pop(self):
        """Pop a nonterminal.  (Internal)"""
        popdfa, popstate, popnode = self.stack.pop()
        newnode = self.convert(self.grammar, popnode)
        if newnode is not None:
            if self.stack:
                dfa, state, node = self.stack[-1]
                node.children.append(newnode)
            else:
                self.rootnode = newnode
                #self.rootnode.used_names = self.used_names
