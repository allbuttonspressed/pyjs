# note: please be advised to use the decorator method, jsonremote,
# as shown in pyjs.jsonrpc.
# the __call__ system which was added here does not have a documented
# example but and has been moved to JSONRPCServiceBase.

from pyjs.jsonrpc import JSONRPCServiceBase, jsonremote

class JSONRPCService(JSONRPCServiceBase):

    def serve(self):
        return self.process(request.body.read())

    def __call__(self,func):
        self.methods[func.__name__]=func
        return func

