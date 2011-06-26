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
    # Funcs to initialize sys
    def pyv8_sys_get_stdin(self):
        return sys.stdin
    
    def pyv8_sys_get_stdout(self):
        return sys.stdout
    
    def pyv8_sys_get_stderr(self):
        return sys.stderr
    
    def pyv8_sys_get_argv(self):
        # Should trim compiler args
        return sys.argv
    
    def pyv8_sys_get_path(self):
        # Should provide some kind of paths
        return []
    
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