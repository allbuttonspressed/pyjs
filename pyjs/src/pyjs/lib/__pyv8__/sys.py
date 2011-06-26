# Initialize system values

def sys_init():
    global stdin
    stdin = pyv8_sys_get_stdin()
    
    global stdout
    stdout = pyv8_sys_get_stdout()

    global stderr
    stderr = pyv8_sys_get_stderr()

    global argv
    argv = pyv8_sys_get_argv()

    global path
    path = pyv8_sys_get_path()

