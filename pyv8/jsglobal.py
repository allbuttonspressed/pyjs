import sys
import PyV8

class FileWrapper(object):
    def __init__(self, fname, mode):
        self.f = open(fname, mode)

    def seek(self, seekto=None):
        if seekto is None:
            return self.f.seek()
        return self.f.seek(seekto)

    def close(self):
        return self.f.close()

    def write(self, bytes):
        return self.f.write(bytes)

    def read(self, bytes=None):
        if bytes is None:
            return self.f.read()
        return self.f.read(bytes)

# Create a python class to be used in the context
class Global(PyV8.JSClass):
    def __init__(self, argv=None, path=None):
        PyV8.JSClass.__init__(self)
        
        if argv is None:
            self.argv = sys.argv
        else:
            self.argv = argv
            
        if path is None:
            self.path = sys.path
        else:
            self.path = path
            
    # Funcs to initialize sys
    def pyv8_sys_get_stdin(self):
        return sys.stdin
    
    def pyv8_sys_get_stdout(self):
        return sys.stdout
    
    def pyv8_sys_get_stderr(self):
        return sys.stderr
    
    def pyv8_sys_get_argv(self):
        return self.argv[:]
    
    def pyv8_sys_get_path(self):
        return self.path[:]
    
    def pyv8_open(self, fname, mode):
        return FileWrapper(fname, mode)
   

        

    def pyv8_import_module(self, parent_name, module_name):
        #print "pyv8_import_module", parent_name, module_name
        exec "import " + module_name
        return locals()[module_name]
    
    def pyv8_load(self, modules):
        for i in range(len(modules)):
            fname = modules[i]
            try:
                fp = open(fname, 'r')
                # XXX: Very bad hack! Do something about encoding of Translator
                txt = fp.read().decode('latin1')
                fp.close()            
                x = self.__context__.eval(txt)
            except Exception, e:
                raise ImportError("Failed to load %s: '%s'" % (fname, e))