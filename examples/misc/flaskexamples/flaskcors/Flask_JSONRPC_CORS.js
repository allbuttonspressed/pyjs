/* start module: Flask_JSONRPC_CORS */
$pyjs.loaded_modules['Flask_JSONRPC_CORS'] = function (__mod_name__) {
	if($pyjs.loaded_modules['Flask_JSONRPC_CORS'].__was_initialized__) return $pyjs.loaded_modules['Flask_JSONRPC_CORS'];
	var $m = $pyjs.loaded_modules["Flask_JSONRPC_CORS"];
	$m.__repr__ = function() { return "<module: Flask_JSONRPC_CORS>"; };
	$m.__was_initialized__ = true;
	if ((__mod_name__ === null) || (typeof __mod_name__ == 'undefined')) __mod_name__ = 'Flask_JSONRPC_CORS';
	$m.__name__ = __mod_name__;


	$m['pyjd'] = $p['___import___']('pyjd', null);
	$m['RootPanel'] = $p['___import___']('pyjamas.ui.RootPanel.RootPanel', null, null, false);
	$m['TextArea'] = $p['___import___']('pyjamas.ui.TextArea.TextArea', null, null, false);
	$m['Label'] = $p['___import___']('pyjamas.ui.Label.Label', null, null, false);
	$m['Button'] = $p['___import___']('pyjamas.ui.Button.Button', null, null, false);
	$m['HTML'] = $p['___import___']('pyjamas.ui.HTML.HTML', null, null, false);
	$m['VerticalPanel'] = $p['___import___']('pyjamas.ui.VerticalPanel.VerticalPanel', null, null, false);
	$m['HorizontalPanel'] = $p['___import___']('pyjamas.ui.HorizontalPanel.HorizontalPanel', null, null, false);
	$m['ListBox'] = $p['___import___']('pyjamas.ui.ListBox.ListBox', null, null, false);
	$m['JSONProxy'] = $p['___import___']('pyjamas.JSONService.JSONProxy', null, null, false);
	$m['JSONRPCExample'] = (function(){
		var $cls_definition = new Object();
		var $method;
		$cls_definition.__module__ = 'Flask_JSONRPC_CORS';
		$method = $pyjs__bind_method2('onModuleLoad', function() {
			if (this.__is_instance__ === true) {
				var self = this;
			} else {
				var self = arguments[0];
			}
			var info,buttons,python_buttons,$iter2_nextval,$iter1_nextval,$iter1_type,$iter2_iter,$iter2_type,$iter1_iter,$add2,i,$iter2_idx,$add1,$iter1_array,method_panel,panel,method,$iter2_array,$iter1_idx;
			$p['setattr'](self, 'TEXT_WAITING', 'Waiting for response...');
			$p['setattr'](self, 'TEXT_ERROR', 'Server Error');
			$p['setattr'](self, 'METHOD_ECHO', 'Echo');
			$p['setattr'](self, 'METHOD_REVERSE', 'Reverse');
			$p['setattr'](self, 'METHOD_UPPERCASE', 'UPPERCASE');
			$p['setattr'](self, 'METHOD_LOWERCASE', 'lowercase');
			$p['setattr'](self, 'METHOD_NONEXISTANT', 'Non existant');
			$p['setattr'](self, 'methods', $p['list']([$p['getattr'](self, 'METHOD_ECHO'), $p['getattr'](self, 'METHOD_REVERSE'), $p['getattr'](self, 'METHOD_UPPERCASE'), $p['getattr'](self, 'METHOD_LOWERCASE'), $p['getattr'](self, 'METHOD_NONEXISTANT')]));
			$p['setattr'](self, 'remote_php', (typeof EchoServicePHP == "undefined"?$m.EchoServicePHP:EchoServicePHP)());
			$p['setattr'](self, 'remote_py', $p['list']([(typeof EchoServicePython == "undefined"?$m.EchoServicePython:EchoServicePython)(), $pyjs_kwargs_call(null, (typeof EchoServicePython == "undefined"?$m.EchoServicePython:EchoServicePython), null, null, [{server:'flask'}])]));
			$p['setattr'](self, 'status', $m['Label']());
			$p['setattr'](self, 'text_area', $m['TextArea']());
			self['text_area']['setText']($p['__op_add']($add1='{\x27Test\x27} [\x22String\x22]\x0A\x09Test Tab\x0ATest Newline\x0A\x0Aafter newline\x0A',$add2='Literal String:\x0A{\x27Test\x27} [\x5C\x22String\x5C\x22]\x0A'));
			self['text_area']['setCharacterWidth'](80);
			self['text_area']['setVisibleLines'](8);
			$p['setattr'](self, 'method_list', $m['ListBox']());
			self['method_list']['setName']('hello');
			self['method_list']['setVisibleItemCount'](1);
			$iter1_iter = $p['getattr'](self, 'methods');
			$iter1_nextval=$p['__iter_prepare']($iter1_iter,false);
			while (typeof($p['__wrapped_next']($iter1_nextval).$nextval) != 'undefined') {
				method = $iter1_nextval.$nextval;
				self['method_list']['addItem'](method);
			}
			self['method_list']['setSelectedIndex'](0);
			method_panel = $m['HorizontalPanel']();
			method_panel['add']($m['HTML']('Remote string method to call: '));
			method_panel['add']($p['getattr'](self, 'method_list'));
			method_panel['setSpacing'](8);
			$p['setattr'](self, 'button_php', $m['Button']('Send to PHP Service', self));
			python_buttons = $p['list']([$m['Button']('Send to Python Service', self), $m['Button']('Send to Flask view function (localhost:5000)', self)]);
			buttons = $m['HorizontalPanel']();
			buttons['add']($p['getattr'](self, 'button_php'));
			$p['setattr'](self, 'python_buttons', $p['dict']([]));
			$iter2_iter = $p['range']($p['len'](python_buttons));
			$iter2_nextval=$p['__iter_prepare']($iter2_iter,false);
			while (typeof($p['__wrapped_next']($iter2_nextval).$nextval) != 'undefined') {
				i = $iter2_nextval.$nextval;
				buttons['add'](python_buttons.__getitem__(i));
				$p['getattr'](self, 'python_buttons').__setitem__(python_buttons.__getitem__(i), $p['getattr'](self, 'remote_py').__getitem__(i));
			}
			buttons['setSpacing'](8);
			info = '\x3Ch2\x3EJSON-RPC Example\x3C/h2\x3E\x0A        \x3Cp\x3EThis example demonstrates the calling of server services with\x0A           \x3Ca href=\x22http://json-rpc.org/\x22\x3EJSON-RPC\x3C/a\x3E.\x0A        \x3C/p\x3E\x0A        \x3Cp\x3EEnter some text below, and press a button to send the text\x0A           to an Echo service on your server. An echo service simply sends the exact same text back that it receives.\x0A           \x3C/p\x3E';
			panel = $m['VerticalPanel']();
			panel['add']($m['HTML'](info));
			panel['add']($p['getattr'](self, 'text_area'));
			panel['add'](method_panel);
			panel['add'](buttons);
			panel['add']($p['getattr'](self, 'status'));
			$m['RootPanel']()['add'](panel);
			return null;
		}
	, 1, [null,null,['self']]);
		$cls_definition['onModuleLoad'] = $method;
		$method = $pyjs__bind_method2('onClick', function(sender) {
			if (this.__is_instance__ === true) {
				var self = this;
			} else {
				var self = arguments[0];
				sender = arguments[1];
			}
			var remote_py,text,method,$add3,$add4,id;
			method = $p['getattr'](self, 'methods').__getitem__(self['method_list']['getSelectedIndex']());
			text = self['text_area']['getText']();
			if ($p['bool']($p['op_eq'](sender, $p['getattr'](self, 'button_php')))) {
				if ($p['bool']($p['op_eq'](method, $p['getattr'](self, 'METHOD_ECHO')))) {
					id = self['remote_php']['echo'](text, self);
				}
				else if ($p['bool']($p['op_eq'](method, $p['getattr'](self, 'METHOD_REVERSE')))) {
					id = self['remote_php']['callMethod']('reverse', $p['list']([text]), self);
				}
				else if ($p['bool']($p['op_eq'](method, $p['getattr'](self, 'METHOD_UPPERCASE')))) {
					id = self['remote_php']['uppercase'](text, self);
				}
				else if ($p['bool']($p['op_eq'](method, $p['getattr'](self, 'METHOD_LOWERCASE')))) {
					id = $pyjs_kwargs_call(self['remote_php'], 'lowercase', null, null, [{msg:text}, self]);
				}
				else if ($p['bool']($p['op_eq'](method, $p['getattr'](self, 'METHOD_NONEXISTANT')))) {
					id = self['remote_php']['nonexistant'](text, self);
				}
			}
			else if ($p['bool']($p['getattr'](self, 'python_buttons').__contains__(sender))) {
				remote_py = $p['getattr'](self, 'python_buttons').__getitem__(sender);
				if ($p['bool']($p['op_eq'](method, $p['getattr'](self, 'METHOD_ECHO')))) {
					id = remote_py['echo'](text, self);
				}
				else if ($p['bool']($p['op_eq'](method, $p['getattr'](self, 'METHOD_REVERSE')))) {
					id = remote_py['reverse'](text, self);
				}
				else if ($p['bool']($p['op_eq'](method, $p['getattr'](self, 'METHOD_UPPERCASE')))) {
					id = remote_py['uppercase'](text, self);
				}
				else if ($p['bool']($p['op_eq'](method, $p['getattr'](self, 'METHOD_LOWERCASE')))) {
					id = remote_py['lowercase'](text, self);
				}
				else if ($p['bool']($p['op_eq'](method, $p['getattr'](self, 'METHOD_NONEXISTANT')))) {
					id = remote_py['nonexistant'](text, self);
				}
			}
			else {
				self['status']['setText']($p['__op_add']($add3=$p['getattr'](self, 'TEXT_WAITING'),$add4=' unrecognized method'));
			}
			return null;
		}
	, 1, [null,null,['self'],['sender']]);
		$cls_definition['onClick'] = $method;
		$method = $pyjs__bind_method2('onRemoteResponse', function(response, request_info) {
			if (this.__is_instance__ === true) {
				var self = this;
			} else {
				var self = arguments[0];
				response = arguments[1];
				request_info = arguments[2];
			}

			self['status']['setText'](response);
			return null;
		}
	, 1, [null,null,['self'],['response'],['request_info']]);
		$cls_definition['onRemoteResponse'] = $method;
		$method = $pyjs__bind_method2('onRemoteError', function(code, errobj, request_info) {
			if (this.__is_instance__ === true) {
				var self = this;
			} else {
				var self = arguments[0];
				code = arguments[1];
				errobj = arguments[2];
				request_info = arguments[3];
			}
			var message;
			message = errobj.__getitem__('message');
			if ($p['bool'](!$p['op_eq'](code, 0))) {
				self['status']['setText']($p['sprintf']('HTTP error %d: %s', $p['tuple']([code, message])));
			}
			else {
				code = errobj.__getitem__('code');
				self['status']['setText']($p['sprintf']('JSONRPC Error %s: %s', $p['tuple']([code, message])));
			}
			return null;
		}
	, 1, [null,null,['self'],['code'],['errobj'],['request_info']]);
		$cls_definition['onRemoteError'] = $method;
		var $bases = new Array(pyjslib.object);
		var $data = $p['dict']();
		for (var $item in $cls_definition) { $data.__setitem__($item, $cls_definition[$item]); }
		return $p['_create_class']('JSONRPCExample', $p['tuple']($bases), $data);
	})();
	$m['EchoServicePHP'] = (function(){
		var $cls_definition = new Object();
		var $method;
		$cls_definition.__module__ = 'Flask_JSONRPC_CORS';
		$method = $pyjs__bind_method2('__init__', function() {
			if (this.__is_instance__ === true) {
				var self = this;
			} else {
				var self = arguments[0];
			}

			$m['JSONProxy']['__init__'](self, 'services/EchoService.php', $p['list'](['echo', 'reverse', 'uppercase', 'lowercase', 'nonexistant']));
			return null;
		}
	, 1, [null,null,['self']]);
		$cls_definition['__init__'] = $method;
		var $bases = new Array($m['JSONProxy']);
		var $data = $p['dict']();
		for (var $item in $cls_definition) { $data.__setitem__($item, $cls_definition[$item]); }
		return $p['_create_class']('EchoServicePHP', $p['tuple']($bases), $data);
	})();
	$m['EchoServicePython'] = (function(){
		var $cls_definition = new Object();
		var $method;
		$cls_definition.__module__ = 'Flask_JSONRPC_CORS';
		$method = $pyjs__bind_method2('__init__', function(server) {
			if (this.__is_instance__ === true) {
				var self = this;
			} else {
				var self = arguments[0];
				server = arguments[1];
			}
			if (typeof server == 'undefined') server=arguments.callee.__args__[3][1];
			var methods;
			methods = $p['list'](['echo', 'reverse', 'uppercase', 'lowercase', 'nonexistant']);
			if ($p['bool']($p['op_eq'](server, 'mod_python'))) {
				$m['JSONProxy']['__init__'](self, 'services/EchoService.py', methods);
			}
			else if ($p['bool']($p['op_eq'](server, 'flask'))) {
				$m['JSONProxy']['__init__'](self, 'http://localhost:5000/json_echo/', methods);
			}
			return null;
		}
	, 1, [null,null,['self'],['server', 'mod_python']]);
		$cls_definition['__init__'] = $method;
		var $bases = new Array($m['JSONProxy']);
		var $data = $p['dict']();
		for (var $item in $cls_definition) { $data.__setitem__($item, $cls_definition[$item]); }
		return $p['_create_class']('EchoServicePython', $p['tuple']($bases), $data);
	})();
	if ($p['bool']($p['op_eq']((typeof __name__ == "undefined"?$m.__name__:__name__), '__main__'))) {
		$m['pyjd']['setup']('http://127.0.0.1:8000/public/JSONRPCExample.html');
		$m['app'] = $m['JSONRPCExample']();
		$m['app']['onModuleLoad']();
		$m['pyjd']['run']();
	}
	return this;
}; /* end Flask_JSONRPC_CORS */


/* end module: Flask_JSONRPC_CORS */


/*
PYJS_DEPS: ['pyjd', 'pyjamas.ui.RootPanel.RootPanel', 'pyjamas', 'pyjamas.ui', 'pyjamas.ui.RootPanel', 'pyjamas.ui.TextArea.TextArea', 'pyjamas.ui.TextArea', 'pyjamas.ui.Label.Label', 'pyjamas.ui.Label', 'pyjamas.ui.Button.Button', 'pyjamas.ui.Button', 'pyjamas.ui.HTML.HTML', 'pyjamas.ui.HTML', 'pyjamas.ui.VerticalPanel.VerticalPanel', 'pyjamas.ui.VerticalPanel', 'pyjamas.ui.HorizontalPanel.HorizontalPanel', 'pyjamas.ui.HorizontalPanel', 'pyjamas.ui.ListBox.ListBox', 'pyjamas.ui.ListBox', 'pyjamas.JSONService.JSONProxy', 'pyjamas.JSONService']
*/
