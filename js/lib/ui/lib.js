/**
 * smartlib核心库
 */
var smartlib = window.smartlib || {};
(function($) {
	$.ui = {};
	//获取dom
	$.getDom = function(id) {
        try {
            return document.getElementById(id);
        } catch (e) {
            return document.all[id];
        }
    };
	//接口定义
	$.interFace = function() {
        var target = this.clone(arguments[0]) || {}, i = 1, length = arguments.length, deep = false, options;
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if (typeof target !== "object")
            target = {};
        if (length == i) {
            target = this;
            --i;
        }

        for (; i < length; i++)
            if ((options = arguments[i]) != null)
				for (var name in options) {
					var src = target[name], copy = options[name];
					if (target === copy)
						continue;
					if (deep && copy && typeof copy === "object" && !copy.nodeType)
						target[name] = this.objExtend(deep,
									src || (copy.length != null ? [] : {})
								, copy);
					else if (copy !== undefined)
						target[name] = copy;
				}
        return target;
    };
	//继承
	$.extend = function(subClass, superClass, methods) {
		var _methods = methods || {};
        if (superClass) {
            var _f = function() {};
            _f.prototype = superClass.prototype;
			subClass.prototype = new _f();
			subClass.prototype.constructor = subClass;
			subClass.prototype.superClass = superClass.prototype;
            _f = null;
        }
        //扩展原型链
        for (var key in _methods) {
           subClass.prototype[key] = _methods[key]; 
        }
		_methods = null;
		return subClass;
    };
	//克隆对象
	$.clone = function() {
		var f = arguments[0], superObject = f || [];
		if (typeof superObject == 'object') {
			if (superObject.length != undefined) {
				f = [];
				for (var i = 0, ilen = superObject.length; i < ilen; i++) {
					if (superObject[i] === undefined)
						continue;
					if (superObject[i] != null && typeof superObject[i] == 'object') {
						if (superObject[i].length != undefined) {
							f[i] = superObject[i].slice(0);
						} else {
							f[i] = superObject[i];
						}
					} else
						f[i] = superObject[i];
				}
			} else {
				f = {};
				for (var i in superObject) {
					if (superObject[i] === undefined)
						continue;
					if (superObject[i] != null && typeof superObject[i] == 'object') {
						if (superObject[i].length != undefined) {
							f[i] = superObject[i].slice(0);
						} else {
							f[i] = superObject[i];
						}
					} else
						f[i] = superObject[i];
				}
			}
		}
		superObject = null;
        return f;
    };
})(smartlib);
