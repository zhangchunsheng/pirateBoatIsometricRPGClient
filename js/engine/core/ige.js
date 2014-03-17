function printStackTrace(t) {
	t = t || {
		guess : !0
	};
	for (var e = t.e || null, i = !!t.guess, o = new printStackTrace.implementation, s = o.run(e), n = i ? o.guessAnonymousFunctions(s) : s, r = 0; 4 > r; r++)
		n.shift();
	return n
}
printStackTrace.implementation = function () {}, printStackTrace.implementation.prototype = {
	run : function (t) {
		t = t || this.createException();
		var e = this.mode(t);
		return e === "other" ? this.other(arguments.callee) : this[e](t)
	},
	createException : function () {
		try {
			return this.undef(),
			null
		} catch (t) {
			return t
		}
	},
	mode : function (t) {
		return this._mode = t.arguments && t.stack ? "chrome" : t.message && typeof window != "undefined" && window.opera ? t.stacktrace ? "opera10" : "opera" : t.stack ? "firefox" : "other"
	},
	instrumentFunction : function (t, e, i) {
		t = t || window;
		var o = t[e];
		t[e] = function () {
			return i.call(this, printStackTrace().slice(4)),
			t[e]._instrumented.apply(this, arguments)
		},
		t[e]._instrumented = o
	},
	deinstrumentFunction : function (t, e) {
		t[e].constructor === Function && t[e]._instrumented && t[e]._instrumented.constructor === Function && (t[e] = t[e]._instrumented)
	},
	chrome : function (t) {
		var e = (t.stack + "\n").replace(/^\S[^\(]+?[\n$]/gm, "").replace(/^\s+at\s+/gm, "").replace(/^([^\(]+?)([\n$])/gm, "{anonymous}()@$1$2").replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, "{anonymous}()@$1").split("\n");
		return e.pop(),
		e
	},
	firefox : function (t) {
		return t.stack.replace(/(?:\n@:0)?\s+$/m, "").replace(/^\(/gm, "{anonymous}(").split("\n")
	},
	opera10 : function (t) {
		var e,
		i,
		o,
		s = t.stacktrace,
		n = s.split("\n"),
		r = "{anonymous}",
		a = /.*line (\d+), column (\d+) in ((<anonymous function\:?\s*(\S+))|([^\(]+)\([^\)]*\))(?: in )?(.*)\s*$/i;
		for (e = 2, i = 0, o = n.length; o - 2 > e; e++)
			if (a.test(n[e])) {
				var h = RegExp.$6 + ":" + RegExp.$1 + ":" + RegExp.$2,
				l = RegExp.$3;
				l = l.replace(/<anonymous function\:?\s?(\S+)?>/g, r),
				n[i++] = l + "@" + h
			}
		return n.splice(i, n.length - i),
		n
	},
	opera : function (t) {
		var e,
		i,
		o,
		s = t.message.split("\n"),
		n = "{anonymous}",
		r = /Line\s+(\d+).*script\s+(http\S+)(?:.*in\s+function\s+(\S+))?/i;
		for (e = 4, i = 0, o = s.length; o > e; e += 2)
			r.test(s[e]) && (s[i++] = (RegExp.$3 ? RegExp.$3 + "()@" + RegExp.$2 + RegExp.$1 : n + "()@" + RegExp.$2 + ":" + RegExp.$1) + " -- " + s[e + 1].replace(/^\s+/, ""));
		return s.splice(i, s.length - i),
		s
	},
	other : function (t) {
		var e,
		i,
		o = "{anonymous}",
		s = /function\s*([\w\-$]+)?\s*\(/i,
		n = [],
		r = 10;
		while (t && r > n.length)
			e = s.test(t + "") ? RegExp.$1 || o : o, i = Array.prototype.slice.call(t.arguments || []), n[n.length] = e + "(" + this.stringifyArguments(i) + ")", t = t.caller;
		return n
	},
	stringifyArguments : function (t) {
		for (var e = Array.prototype.slice, i = 0; t.length > i; ++i) {
			var o = t[i];
			o === void 0 ? t[i] = "undefined" : o === null ? t[i] = "null" : o.constructor && (o.constructor === Array ? t[i] = 3 > o.length ? "[" + this.stringifyArguments(o) + "]" : "[" + this.stringifyArguments(e.call(o, 0, 1)) + "..." + this.stringifyArguments(e.call(o, -1)) + "]" : o.constructor === Object ? t[i] = "#object" : o.constructor === Function ? t[i] = "#function" : o.constructor === String && (t[i] = '"' + o + '"'))
		}
		return t.join(",")
	},
	sourceCache : {},
	ajax : function (t) {
		var e = this.createXMLHTTPObject();
		if (e)
			return e.open("GET", t, !1), e.send(""), e.responseText
	},
	createXMLHTTPObject : function () {
		for (var t, e = [function () {
					return new XMLHttpRequest
				}, function () {
					return new ActiveXObject("Msxml2.XMLHTTP")
				}, function () {
					return new ActiveXObject("Msxml3.XMLHTTP")
				}, function () {
					return new ActiveXObject("Microsoft.XMLHTTP")
				}
			], i = 0; e.length > i; i++)
			try {
				return t = e[i](),
				this.createXMLHTTPObject = e[i],
				t
			} catch (o) {}
			
	},
	isSameDomain : function (t) {
		return t.indexOf(location.hostname) !== -1
	},
	getSource : function (t) {
		return t in this.sourceCache || (this.sourceCache[t] = this.ajax(t).split("\n")),
		this.sourceCache[t]
	},
	guessAnonymousFunctions : function (t) {
		for (var e = 0; t.length > e; ++e) {
			var i = /\{anonymous\}\(.*\)@(\w+:\/\/([\-\w\.]+)+(:\d+)?[^:]+):(\d+):?(\d+)?/,
			o = t[e],
			s = i.exec(o);
			if (s) {
				var n = s[1],
				r = s[4],
				a = s[7] || 0;
				if (n && this.isSameDomain(n) && r) {
					var h = this.guessAnonymousFunction(n, r, a);
					t[e] = o.replace("{anonymous}", h)
				}
			}
		}
		return t
	},
	guessAnonymousFunction : function (t, e) {
		var i;
		try {
			i = this.findFunctionName(this.getSource(t), e)
		} catch (o) {
			i = "getSource failed with url: " + t + ", exception: " + (o + "")
		}
		return i
	},
	findFunctionName : function (t, e) {
		for (var i, o, s = /function\s+([^(]*?)\s*\(([^)]*)\)/, n = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function\b/, r = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(?:eval|new Function)\b/, a = "", h = 10, l = 0; h > l; ++l)
			if (i = t[e - l]) {
				if (a = i + a, o = n.exec(a), o && o[1])
					return o[1];
				if (o = s.exec(a), o && o[1])
					return o[1];
				if (o = r.exec(a), o && o[1])
					return o[1]
			}
		return "(?)"
	}
}, ige = null, igeVersion = "1.1.0", igeClassStore = {}, igeDebug = {
	_enabled : !0,
	_node : typeof module != "undefined" && module.exports !== void 0,
	_level : ["log", "warning", "error"],
	_stacks : !0,
	_throwErrors : !0,
	_timing : !0,
	enabled : function (t) {
		return t !== void 0 ? (this._enabled = t, t || (this._timing = !1, ige && ige.showStats(0)), this) : this._enabled
	}
}, igeDebug._node && (igeDebug._util = require("util")), Object.defineProperty(Object.prototype, "tween", {
	enumerable : !1,
	writable : !0,
	configurable : !0
}), Object.prototype.tween = function (t, e, i) {
	var o = (new IgeTween).targetObj(this).properties(t).duration(e);
	return i && (i.beforeTween && o.beforeTween(i.beforeTween), i.afterTween && o.afterTween(i.afterTween), i.easing && o.easing(i.easing), i.startTime && o.startTime(i.startTime)),
	o
}, Object.defineProperty(Object.prototype, "theSameAs", {
	enumerable : !1,
	writable : !0,
	configurable : !0
}), Object.prototype.theSameAs = function (t) {
	return JSON.stringify(this) === JSON.stringify(t)
}, Object.defineProperty(Array.prototype, "clone", {
	enumerable : !1,
	writable : !0,
	configurable : !0
}), Array.prototype.clone = function () {
	var t,
	e = [];
	for (t in this)
		this.hasOwnProperty(t) && (e[t] = this[t]instanceof Array ? this[t].clone() : this[t]);
	return e
}, Object.defineProperty(Array.prototype, "pull", {
	enumerable : !1,
	writable : !0,
	configurable : !0
}), Array.prototype.pull = function (t) {
	var e = this.indexOf(t);
	return e > -1 ? (this.splice(e, 1), e) : -1
}, Object.defineProperty(Array.prototype, "each", {
	enumerable : !1,
	writable : !0,
	configurable : !0
}), Array.prototype.each = function (t) {
	var e,
	i = this.length;
	for (e = 0; i > e; e++)
		t(this[e])
}, Object.defineProperty(Array.prototype, "eachReverse", {
	enumerable : !1,
	writable : !0,
	configurable : !0
}), Array.prototype.eachReverse = function (t) {
	var e,
	i = this.length;
	for (e = i - 1; e >= 0; e--)
		t(this[e])
}, Object.defineProperty(Array.prototype, "destroyAll", {
	enumerable : !1,
	writable : !0,
	configurable : !0
}), Array.prototype.destroyAll = function () {
	var t,
	e = this.length;
	for (t = e - 1; t >= 0; t--)
		typeof this[t].destroy == "function" && this[t].destroy()
}, Object.defineProperty(Array.prototype, "eachIsolated", {
	enumerable : !1,
	writable : !0,
	configurable : !0
}), Array.prototype.eachIsolated = function (t) {
	var e,
	i = [],
	o = i.length;
	for (e = 0; o > e; e++)
		i[e] = this[e];
	for (e = 0; o > e; e++)
		t(i[e])
}, Object.defineProperty(Math, "PI180", {
	enumerable : !1,
	writable : !0,
	configurable : !0
}), Math.PI180 = Math.PI / 180, Object.defineProperty(Math, "PI180R", {
	enumerable : !1,
	writable : !0,
	configurable : !0
}), Math.PI180R = 180 / Math.PI, Object.defineProperty(Math, "radians", {
	enumerable : !1,
	writable : !0,
	configurable : !0
}), Math.radians = function (t) {
	return t * Math.PI180
}, Object.defineProperty(Math, "degrees", {
	enumerable : !1,
	writable : !0,
	configurable : !0
}), Math.degrees = function (t) {
	return t * Math.PI180R
}, Object.defineProperty(Math, "distance", {
	enumerable : !1,
	writable : !0,
	configurable : !0
}), Math.distance = function (t, e, i, o) {
	return Math.sqrt((t - i) * (t - i) + (e - o) * (e - o))
}, typeof CanvasRenderingContext2D != "undefined" && (Object.defineProperty(CanvasRenderingContext2D.prototype, "circle", {
		enumerable : !1,
		writable : !0,
		configurable : !0
	}), Object.defineProperty(CanvasRenderingContext2D.prototype, "strokeCircle", {
		enumerable : !1,
		writable : !0,
		configurable : !0
	}), Object.defineProperty(CanvasRenderingContext2D.prototype, "fillCircle", {
		enumerable : !1,
		writable : !0,
		configurable : !0
	}), CanvasRenderingContext2D.prototype.circle = function (t, e, i) {
	this.arc(t, e, i, 0, 2 * Math.PI, !1)
}, CanvasRenderingContext2D.prototype.strokeCircle = function (t, e, i) {
	this.save(),
	this.beginPath(),
	this.arc(t, e, i, 0, 2 * Math.PI, !1),
	this.stroke(),
	this.restore()
}, CanvasRenderingContext2D.prototype.fillCircle = function (t, e, i) {
	this.save(),
	this.beginPath(),
	this.arc(t, e, i, 0, 2 * Math.PI, !1),
	this.fill(),
	this.restore()
}), typeof ImageData != "undefined" && (Object.defineProperty(ImageData.prototype, "pixelAt", {
		enumerable : !1,
		writable : !0,
		configurable : !0
	}), ImageData.prototype.pixelAt = function (t, e) {
	var i = this.data,
	o = e * this.width * 4 + t * 4;
	return {
		r : i[o],
		g : i[o + 1],
		b : i[o + 2],
		a : i[o + 3]
	}
}, Object.defineProperty(ImageData.prototype, "isTransparent", {
		enumerable : !1,
		writable : !0,
		configurable : !0
	}), ImageData.prototype.isTransparent = function (t, e) {
	var i = this.data,
	o = e * this.width * 4 + t * 4;
	return i[o + 3] === 0
}, Object.defineProperty(ImageData.prototype, "makeTransparent", {
		enumerable : !1,
		writable : !0,
		configurable : !0
	}), ImageData.prototype.makeTransparent = function (t, e) {
	var i = this.data,
	o = e * this.width * 4 + t * 4;
	i[o + 3] = 0
});
var disableContextMenu = function (t) {
	t !== null && (t.oncontextmenu = function () {
		return !1
	})
};
Array.prototype.indexOf || (Object.defineProperty(Array.prototype, "indexOf", {
		enumerable : !1,
		writable : !0,
		configurable : !0
	}), Array.prototype.indexOf = function (t) {
	var e,
	i = this.length;
	for (e = 0; i > e; e++)
		if (this[e] === t)
			return e;
	return -1
}), requestAnimFrame = typeof window != "undefined" ? function () {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (t) {
		setTimeout(function () {
			t((new Date).getTime())
		}, 1e3 / 60)
	}
}
() : function () {
	return function (t) {
		setTimeout(function () {
			t((new Date).getTime())
		}, 1e3 / 60)
	}
}
(), typeof console == "object" ? typeof console.log == "function" && (console.info === void 0 && (console.info = console.log), console.warn === void 0 && (console.warn = console.log)) : console = {
	log : function () {},
	warn : function () {},
	info : function () {},
	error : function () {}
	
}, typeof JSON.decycle != "function" && (JSON.decycle = function decycle(t) {
	"use strict";
	var e = [],
	i = [];
	return function o(t, s) {
		var n,
		r,
		a;
		switch (typeof t) {
		case "object":
			if (!t)
				return null;
			for (n = 0; e.length > n; n += 1)
				if (e[n] === t)
					return {
						$ref : i[n]
					};
			if (e.push(t), i.push(s), Object.prototype.toString.apply(t) === "[object Array]")
				for (a = [], n = 0; t.length > n; n += 1)
					a[n] = o(t[n], s + "[" + n + "]");
			else {
				a = {};
				for (r in t)
					Object.prototype.hasOwnProperty.call(t, r) && (a[r] = o(t[r], s + "[" + JSON.stringify(r) + "]"))
			}
			return a;
		case "number":
		case "string":
		case "boolean":
			return t
		}
	}
	(t, "$")
}), typeof JSON.retrocycle != "function" && (JSON.retrocycle = function retrocycle($) {
	"use strict";
	var px = /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;
	return function rez(value) {
		var i,
		item,
		name,
		path;
		if (value && typeof value == "object")
			if (Object.prototype.toString.apply(value) === "[object Array]")
				for (i = 0; value.length > i; i += 1)
					item = value[i], item && typeof item == "object" && (path = item.$ref, typeof path == "string" && px.test(path) ? value[i] = eval(path) : rez(item));
			else
				for (name in value)
					typeof value[name] == "object" && (item = value[name], item && (path = item.$ref, typeof path == "string" && px.test(path) ? value[name] = eval(path) : rez(item)))
	}
	($),
	$
});
var IgeClass = function () {
	var t = !1,
	e = /xyz/.test(function () {}) ? /\b_super\b/ : /.*/,
	i = function () {},
	o = function (t, e, i) {
		if (igeDebug._enabled) {
			var o,
			s = "";
			if (e = e || "log", i !== void 0 && console.warn(i), (e === "warning" || e === "error") && igeDebug._stacks && (igeDebug._node ? (o = Error().stack, console.log("Stack:", o)) : typeof printStackTrace == "function" && console.log("Stack:", printStackTrace().join("\n ---- "))), e === "error") {
				if (igeDebug._throwErrors)
					throw s + "IGE *" + e + "* [" + (this._classId || this.prototype._classId) + "] : " + t;
				console.log(s + "IGE *" + e + "* [" + (this._classId || this.prototype._classId) + "] : " + t)
			} else
				console.log(s + "IGE *" + e + "* [" + (this._classId || this.prototype._classId) + "] : " + t)
		}
		return this
	},
	s = function () {
		return this._classId
	},
	n = function (t, e) {
		var i = new t(this, e);
		return this[i.componentId] = i,
		this._components.push(i),
		this
	},
	r = function (t) {
		return this[t] && this[t].destroy && this[t].destroy(),
		this._components && this._components.pull(this[t]),
		delete this[t],
		this
	},
	a = function (t, e) {
		var i,
		o = t.prototype || t;
		for (i in o)
			o.hasOwnProperty(i) && (e || this[i] === void 0) && (this[i] = o[i]);
		return this
	},
	h = function (t, e) {
		return t !== void 0 ? e !== void 0 ? (this._data[t] = e, this) : this._data[t] : void 0
	};
	return i.extend = function () {
		function i() {
			this._data = {},
			!t && this.init && (this._components = [], typeof ige != "undefined" && (this.ige = ige), this.init.apply(this, arguments))
		}
		var l,
		c,
		m,
		_,
		u,
		p,
		y,
		d = this.prototype,
		x = arguments[arguments.length - 1],
		f = arguments[0];
		if (!x.classId)
			throw console.log(x), "Cannot create a new class without giving the class a classId property!";
		if (igeClassStore[x.classId])
			throw 'Cannot create class with classId "' + x.classId + '" because a class with that ID has already been created!';
		t = !0,
		c = new this,
		t = !1;
		for (l in x)
			typeof x[l] == "function" && typeof d[l] == "function" && e.test(x[l]) ? (c["__" + l] = x[l], c[l] = function (t, e) {
				return function () {
					var i,
					o = this._super;
					return this._super = d[t],
					i = e["__" + t].apply(this, arguments),
					this._super = o,
					i
				}
			}
				(l, c)) : c[l] = x[l];
		if (arguments.length > 1 && f && f.length)
			for (u = 0; f.length > u; u++) {
				m = f[u],
				y = m.extension.prototype || m.extension,
				_ = m.overwrite;
				for (p in y)
					y.hasOwnProperty(p) && (_ || c[p] === void 0) && (c[p] = y[p])
			}
		return i.prototype = c,
		i.prototype.constructor = i,
		i.extend = arguments.callee,
		i.prototype.log = o,
		i.prototype.data = h,
		i.prototype.classId = s,
		i.prototype._classId = x.classId || "IgeClass",
		i.prototype.addComponent = n,
		i.prototype.removeComponent = r,
		i.prototype.implement = a,
		igeClassStore[x.classId] = i,
		i
	},
	i.prototype._classId = "IgeClass",
	i
}
();
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeClass);
var IgeEventingClass = IgeClass.extend({
		classId : "IgeEventingClass",
		on : function (t, e, i, o, s) {
			var n,
			r,
			a,
			h,
			l,
			c,
			m,
			_,
			u,
			p = this;
			if (this._eventListeners = this._eventListeners || {}, typeof e == "function") {
				if (typeof t == "string")
					return n = {
						call : e,
						context : i,
						oneShot : o,
						sendEventName : s
					},
				h = this._eventListeners[t] = this._eventListeners[t] || [],
				r = !0,
				a = h.indexOf(n),
				a > -1 && (r = !1),
				r && h.push(n),
				n;
				if (t.length) {
					l = [],
					l[0] = 0,
					l[1] = 0,
					l[3] = function () {
						l[1]++,
						l[0] === l[1] && e.apply(i || p)
					};
					for (c in t)
						t.hasOwnProperty(c) && (m = t[c], _ = m[0], u = m[1], l[0]++, _.on(u, l[3], null, !0, !0))
				}
			} else
				typeof t != "string" && (t = "*Multi-Event*"), this.log('Cannot register event listener for event "' + t + '" because the passed callback is not a function!', "error")
		},
		emit : function (t, e) {
			if (this._eventListeners && this._eventListeners[t]) {
				var i,
				o,
				s,
				n,
				r,
				a,
				h = this._eventListeners[t].length,
				l = this._eventListeners[t].length - 1;
				if (h) {
					if (i = [], typeof e == "object" && e !== null && e[0] !== null && e[0] !== void 0)
						for (o in e)
							e.hasOwnProperty(o) && (i[o] = e[o]);
					else
						i = [e];
					s = !1,
					this._eventListeners._processing = !0;
					while (h--)
						n = l - h, r = this._eventListeners[t][n], r.sendEventName && (i = [t]), a = r.call.apply(r.context || this, i), a === !0 && (s = !0), r.oneShot && (this.off(t, r), l--);
					if (this._eventListeners && (this._eventListeners._processing = !1, this._processRemovals()), s)
						return 1
				}
			}
		},
		_processRemovals : function () {
			if (this._eventListeners) {
				var t,
				e,
				i,
				o = this._eventListeners._removeQueue;
				if (o) {
					t = o.length;
					while (t--)
						e = o[t], i = this.off(e[0], e[1]), o[2] && o[2](i)
				}
				delete this._eventListeners._removeQueue
			}
		},
		off : function (t, e, i) {
			if (this._eventListeners) {
				if (this._eventListeners._processing)
					return this._eventListeners._removeQueue = this._eventListeners._removeQueue || [], this._eventListeners._removeQueue.push([t, e, i]), -1;
				if (this._eventListeners[t]) {
					var o = this._eventListeners[t].indexOf(e);
					if (o > -1)
						return this._eventListeners[t].splice(o, 1), i && i(!0), !0;
					this.log('Failed to cancel event listener for event named "' + t + '" !', "warning", e)
				} else
					this.log("Failed to cancel event listener!")
			}
			return i && i(!1),
			!1
		},
		eventList : function () {
			return this._eventListeners
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeEventingClass);
var IgePoint = IgeClass.extend({
		classId : "IgePoint",
		init : function (t, e, i, o) {
			return o === void 0 ? this._floor = !0 : this.floor(o),
			this.x = t = t !== void 0 ? t : 0,
			this.y = e = e !== void 0 ? e : 0,
			this.z = i = i !== void 0 ? i : 0,
			this._floor ? (this.x2 = Math.floor(t / 2), this.y2 = Math.floor(e / 2), this.z2 = Math.floor(i / 2)) : (this.x2 = t / 2, this.y2 = e / 2, this.z2 = i / 2),
			this
		},
		floor : function (t) {
			return t !== void 0 ? (this._floor = t, this) : this._floor
		},
		compare : function (t) {
			return t && this.x === t.x && this.y === t.y && this.z === t.z
		},
		toIso : function () {
			var t = this.x - this.y,
			e = -this.z * 1.2247 + (this.x + this.y) * .5;
			return {
				x : t,
				y : e
			}
		},
		thisToIso : function () {
			var t = this.toIso();
			return this.x = t.x,
			this.y = t.y,
			this.z = 0,
			this
		},
		to2d : function () {
			var t = this.y + this.x / 2,
			e = this.y - this.x / 2;
			return {
				x : t,
				y : e
			}
		},
		thisTo2d : function () {
			var t = this.to2d();
			return this.x = t.x,
			this.y = t.y,
			this.z = 0,
			this
		},
		addPoint : function (t) {
			return new IgePoint(this.x + t.x, this.y + t.y, this.z + t.z)
		},
		thisAddPoint : function (t) {
			return this.x += t.x,
			this.y += t.y,
			this.z += t.z,
			this
		},
		minusPoint : function (t) {
			return new IgePoint(this.x - t.x, this.y - t.y, this.z - t.z)
		},
		thisMinusPoint : function (t) {
			return this.x -= t.x,
			this.y -= t.y,
			this.z -= t.z,
			this
		},
		multiply : function (t, e, i) {
			return new IgePoint(this.x * t, this.y * e, this.z * i)
		},
		multiplyPoint : function (t) {
			return new IgePoint(this.x * t.x, this.y * t.y, this.z * t.z)
		},
		thisMultiply : function (t, e, i) {
			return this.x *= t,
			this.y *= e,
			this.z *= i,
			this
		},
		divide : function (t, e, i) {
			return new IgePoint(this.x / t, this.y / e, this.z / i)
		},
		thisDivide : function (t, e, i) {
			return this.x /= t,
			this.y /= e,
			this.z /= i,
			this
		},
		clone : function () {
			return new IgePoint(this.x, this.y, this.z)
		},
		interpolate : function (t, e, i, o) {
			var s = t.x - this.x,
			n = t.y - this.y,
			r = t.z - this.z,
			a = o - e,
			h = a - (i - e),
			l = h / a;
			return new IgePoint(t.x - s * l, t.y - n * l, t.z - r * l)
		},
		toString : function (t) {
			return t === void 0 && (t = 2),
			this.x.toFixed(t) + "," + this.y.toFixed(t) + "," + this.z.toFixed(t)
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgePoint);
var IgePoly2d = IgeClass.extend({
		classId : "IgePoly2d",
		init : function () {
			this._poly = [],
			this._scale = new IgePoint(1, 1, 1)
		},
		scale : function (t, e) {
			return t !== void 0 && e !== void 0 ? (this._scale.x = t, this._scale.y = e, this) : this._scale
		},
		multiply : function (t) {
			if (t !== void 0) {
				var e,
				i = this._poly,
				o = i.length;
				for (e = 0; o > e; e++)
					i[e].x *= t, i[e].y *= t
			}
			return this
		},
		divide : function (t) {
			if (t !== void 0) {
				var e,
				i = this._poly,
				o = i.length;
				for (e = 0; o > e; e++)
					i[e].x /= t, i[e].y /= t
			}
			return this
		},
		addPoint : function (t, e) {
			return this._poly.push(new IgePoint(t, e, 0)),
			this
		},
		length : function () {
			return this._poly.length
		},
		pointInPoly : function (t) {
			var e,
			i = this._poly,
			o = i.length,
			s = o - 1,
			n = 0;
			for (e = 0; o > e; s = e++)
				i[e].y > t.y != i[s].y > t.y && (i[s].x - i[e].x) * (t.y - i[e].y) / (i[s].y - i[e].y) + i[e].x > t.x && (n = !n);
			return n
		},
		clone : function () {
			var t,
			e = new IgePoly2d,
			i = this._poly,
			o = i.length;
			for (t = 0; o > t; t++)
				e.addPoint(i[t].x, i[t].y);
			return e.scale(this._scale.x, this._scale.y),
			e
		},
		clockWiseTriangle : function () {
			var t,
			e,
			i,
			o,
			s = this._poly;
			return e = s[0],
			i = s[1],
			o = s[2],
			t = e.x * i.y + i.x * o.y + o.x * e.y - i.y * o.x - o.y * e.x - e.y * i.x,
			t > 0
		},
		makeClockWiseTriangle : function () {
			if (!this.clockWiseTriangle()) {
				var t = (this._poly[0], this._poly[1]),
				e = this._poly[2];
				this._poly[2] = t,
				this._poly[1] = e
			}
		},
		triangulate : function () {
			var t,
			e,
			i,
			o,
			s,
			n = this._poly,
			r = [],
			a = this.triangulationIndices();
			for (t = 0; a.length > t; t += 3)
				e = n[a[t]], i = n[a[t + 1]], o = n[a[t + 2]], s = new IgePoly2d, s.addPoint(e.x, e.y), s.addPoint(i.x, i.y), s.addPoint(o.x, o.y), s.makeClockWiseTriangle(), r.push(s);
			return r
		},
		triangulationIndices : function () {
			var t,
			e,
			i,
			o,
			s,
			n,
			r,
			a,
			h,
			l,
			c = [],
			m = this._poly.length,
			_ = [],
			u = [];
			if (3 > m)
				return c;
			if (this._area() > 0)
				for (_ = 0; m > _; _++)
					u[_] = _;
			else
				for (_ = 0; m > _; _++)
					u[_] = m - 1 - _;
			for (t = m, e = 2 * t, i = 0, _ = t - 1; t > 2; ) {
				if (0 >= e--)
					return c;
				if (o = _, t > o || (o = 0), _ = o + 1, t > _ || (_ = 0), s = _ + 1, t > s || (s = 0), this._snip(o, _, s, t, u)) {
					for (n = u[o], r = u[_], a = u[s], c.push(n), c.push(r), c.push(a), i++, h = _, l = _ + 1; t > l; l++)
						u[h] = u[l], h++;
					t--,
					e = 2 * t
				}
			}
			return c.reverse(),
			c
		},
		_area : function () {
			var t,
			e,
			i,
			o = this._poly.length,
			s = 0,
			n = 0;
			for (t = o - 1; o > n; t = n++)
				e = this._poly[t], i = this._poly[n], s += e.x * i.y - i.x * e.y;
			return s * .5
		},
		_snip : function (t, e, i, o, s) {
			var n,
			r,
			a = this._poly[s[t]],
			h = this._poly[s[e]],
			l = this._poly[s[i]];
			if (1e-5 > (h.x - a.x) * (l.y - a.y) - (h.y - a.y) * (l.x - a.x))
				return !1;
			for (n = 0; o > n; n++)
				if (n != t && n != e && n != i && (r = this._poly[s[n]], this._insideTriangle(a, h, l, r)))
					return !1;
			return !0
		},
		_insideTriangle : function (t, e, i, o) {
			var s,
			n,
			r,
			a,
			h,
			l,
			c,
			m,
			_,
			u,
			p,
			y,
			d,
			x,
			f;
			return s = i.x - e.x,
			n = i.y - e.y,
			r = t.x - i.x,
			a = t.y - i.y,
			h = e.x - t.x,
			l = e.y - t.y,
			c = o.x - t.x,
			m = o.y - t.y,
			_ = o.x - e.x,
			u = o.y - e.y,
			p = o.x - i.x,
			y = o.y - i.y,
			f = s * u - n * _,
			d = h * m - l * c,
			x = r * y - a * p,
			f >= 0 && x >= 0 && d >= 0
		},
		render : function (t) {
			var e,
			i = this._poly,
			o = i.length,
			s = this._scale.x,
			n = this._scale.y;
			for (t.beginPath(), t.moveTo(i[0].x * s, i[0].y * n), e = 1; o > e; e++)
				t.lineTo(i[e].x * s, i[e].y * n);
			return t.lineTo(i[0].x * s, i[0].y * n),
			t.stroke(),
			this
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgePoly2d);
var IgeRect = IgeClass.extend({
		classId : "IgeRect",
		init : function (t, e, i, o) {
			return this.x = t = t !== void 0 ? t : 0,
			this.y = e = e !== void 0 ? e : 0,
			this.width = i = i !== void 0 ? i : 0,
			this.height = o = o !== void 0 ? o : 0,
			this
		},
		minusPoint : function (t) {
			return new IgeRect(this.x - t.x, this.y - t.y, this.width, this.height)
		},
		compare : function (t) {
			return t && this.x === t.x && this.y === t.y && this.width === t.width && this.height === t.height
		},
		xyInside : function (t, e) {
			return t >= this.x && e > this.y && this.x + this.width >= t && this.y + this.height >= e
		},
		pointInside : function (t) {
			return x >= this.x && t.y > this.y && this.x + this.width >= t.x && this.y + this.height >= t.y
		},
		rectIntersect : function (t) {
			if (t) {
				var e = this.x,
				i = this.y,
				o = this.width,
				s = this.height,
				n = t.x,
				r = t.y,
				a = t.width,
				h = t.height,
				l = e + o,
				c = i + s,
				m = n + a,
				_ = r + h;
				if (m > e && l > n && _ > i && c > r)
					return !0
			}
			return !1
		},
		toString : function (t) {
			return t === void 0 && (t = 2),
			this.x.toFixed(t) + "," + this.y.toFixed(t) + "," + this.width.toFixed(t) + "," + this.height.toFixed(t)
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeRect);
var IgeMatrix2d = function () {
	this.matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1],
	this._rotateOrigin = new IgePoint(0, 0, 0),
	this._scaleOrigin = new IgePoint(0, 0, 0)
};
IgeMatrix2d.prototype = {
	matrix : null,
	transformCoord : function (t) {
		var e = t.x,
		i = t.y,
		o = this.matrix;
		return t.x = e * o[0] + i * o[1] + o[2],
		t.y = e * o[3] + i * o[4] + o[5],
		(isNaN(o[0]) || isNaN(o[1]) || isNaN(o[2]) || isNaN(o[3]) || isNaN(o[4]) || isNaN(o[5])) && this.log("The matrix operation produced a NaN value!", "error"),
		t
	},
	transformCoordInverse : function (t) {
		var e = t.x,
		i = t.y,
		o = this.matrix;
		return t.x = e * o[0] - i * o[1] + o[2],
		t.y = e * o[3] + i * o[4] - o[5],
		(isNaN(o[0]) || isNaN(o[1]) || isNaN(o[2]) || isNaN(o[3]) || isNaN(o[4]) || isNaN(o[5])) && this.log("The matrix operation produced a NaN value!", "error"),
		t
	},
	transform : function (t) {
		var e,
		i = t.length;
		for (e = 0; i > e; e++)
			this.transformCoord(t[e]);
		return t
	},
	_newRotate : function (t) {
		var e = new IgeMatrix2d;
		return e.rotateTo(t),
		e
	},
	rotateBy : function (t) {
		var e = new IgeMatrix2d;
		return e.translateBy(this._rotateOrigin.x, this._rotateOrigin.y),
		e.rotateTo(t),
		e.translateBy(-this._rotateOrigin.x, -this._rotateOrigin.y),
		this.multiply(e),
		this
	},
	rotateTo : function (t) {
		var e = this.matrix,
		i = Math.cos(t),
		o = Math.sin(t);
		return e[0] = i,
		e[1] = -o,
		e[3] = o,
		e[4] = i,
		(isNaN(e[0]) || isNaN(e[1]) || isNaN(e[2]) || isNaN(e[3]) || isNaN(e[4]) || isNaN(e[5])) && this.log("The matrix operation produced a NaN value!", "error"),
		this
	},
	rotationRadians : function () {
		return Math.asin(this.matrix[3])
	},
	rotationDegrees : function () {
		return Math.degrees(Math.acos(this.matrix[0]))
	},
	_newScale : function (t, e) {
		var i = new IgeMatrix2d;
		return i.matrix[0] = t,
		i.matrix[4] = e,
		i
	},
	scaleBy : function (t, e) {
		var i = new IgeMatrix2d;
		return i.matrix[0] = t,
		i.matrix[4] = e,
		this.multiply(i),
		this
	},
	scaleTo : function (t, e) {
		var i = this.matrix;
		return i[0] = t,
		i[4] = e,
		(isNaN(i[0]) || isNaN(i[1]) || isNaN(i[2]) || isNaN(i[3]) || isNaN(i[4]) || isNaN(i[5])) && this.log("The matrix operation produced a NaN value!", "error"),
		this
	},
	_newTranslate : function (t, e) {
		var i = new IgeMatrix2d;
		return i.matrix[2] = t,
		i.matrix[5] = e,
		i
	},
	translateBy : function (t, e) {
		var i = new IgeMatrix2d;
		return i.matrix[2] = t,
		i.matrix[5] = e,
		this.multiply(i),
		this
	},
	translateTo : function (t, e) {
		var i = this.matrix;
		return i[2] = t,
		i[5] = e,
		(isNaN(i[0]) || isNaN(i[1]) || isNaN(i[2]) || isNaN(i[3]) || isNaN(i[4]) || isNaN(i[5])) && this.log("The matrix operation produced a NaN value!", "error"),
		this
	},
	copy : function (t) {
		t = t.matrix;
		var e = this.matrix;
		return e[0] = t[0],
		e[1] = t[1],
		e[2] = t[2],
		e[3] = t[3],
		e[4] = t[4],
		e[5] = t[5],
		e[6] = t[6],
		e[7] = t[7],
		e[8] = t[8],
		this
	},
	identity : function () {
		var t = this.matrix;
		return t[0] = 1,
		t[1] = 0,
		t[2] = 0,
		t[3] = 0,
		t[4] = 1,
		t[5] = 0,
		t[6] = 0,
		t[7] = 0,
		t[8] = 1,
		this
	},
	multiply : function (t) {
		var e = this.matrix,
		i = t.matrix,
		o = e[0],
		s = e[1],
		n = e[2],
		r = e[3],
		a = e[4],
		h = e[5],
		l = e[6],
		c = e[7],
		m = e[8],
		_ = i[0],
		u = i[1],
		p = i[2],
		y = i[3],
		d = i[4],
		x = i[5],
		f = i[6],
		g = i[7],
		v = i[8];
		return e[0] = o * _ + s * y + n * f,
		e[1] = o * u + s * d + n * g,
		e[2] = o * p + s * x + n * v,
		e[3] = r * _ + a * y + h * f,
		e[4] = r * u + a * d + h * g,
		e[5] = r * p + a * x + h * v,
		e[6] = l * _ + c * y + m * f,
		e[7] = l * u + c * d + m * g,
		e[8] = l * p + c * x + m * v,
		this
	},
	premultiply : function (t) {
		var e = t.matrix[0] * this.matrix[0] + t.matrix[1] * this.matrix[3] + t.matrix[2] * this.matrix[6],
		i = t.matrix[0] * this.matrix[1] + t.matrix[1] * this.matrix[4] + t.matrix[2] * this.matrix[7],
		o = t.matrix[0] * this.matrix[2] + t.matrix[1] * this.matrix[5] + t.matrix[2] * this.matrix[8],
		s = t.matrix[3] * this.matrix[0] + t.matrix[4] * this.matrix[3] + t.matrix[5] * this.matrix[6],
		n = t.matrix[3] * this.matrix[1] + t.matrix[4] * this.matrix[4] + t.matrix[5] * this.matrix[7],
		r = t.matrix[3] * this.matrix[2] + t.matrix[4] * this.matrix[5] + t.matrix[5] * this.matrix[8],
		a = t.matrix[6] * this.matrix[0] + t.matrix[7] * this.matrix[3] + t.matrix[8] * this.matrix[6],
		h = t.matrix[6] * this.matrix[1] + t.matrix[7] * this.matrix[4] + t.matrix[8] * this.matrix[7],
		l = t.matrix[6] * this.matrix[2] + t.matrix[7] * this.matrix[5] + t.matrix[8] * this.matrix[8];
		return this.matrix[0] = e,
		this.matrix[1] = i,
		this.matrix[2] = o,
		this.matrix[3] = s,
		this.matrix[4] = n,
		this.matrix[5] = r,
		this.matrix[6] = a,
		this.matrix[7] = h,
		this.matrix[8] = l,
		this
	},
	getInverse : function () {
		var t = this.matrix,
		e = t[0],
		i = t[1],
		o = t[2],
		s = t[3],
		n = t[4],
		r = t[5],
		a = t[6],
		h = t[7],
		l = t[8],
		c = new IgeMatrix2d,
		m = e * (n * l - h * r) - s * (i * l - h * o) + a * (i * r - n * o);
		if (m === 0)
			return null;
		var _ = c.matrix;
		return _[0] = n * l - r * h,
		_[1] = o * h - i * l,
		_[2] = i * r - o * n,
		_[3] = r * a - s * l,
		_[4] = e * l - o * a,
		_[5] = o * s - e * r,
		_[6] = s * h - n * a,
		_[7] = i * a - e * h,
		_[8] = e * n - i * s,
		c.multiplyScalar(1 / m),
		c
	},
	multiplyScalar : function (t) {
		var e;
		for (e = 0; 9 > e; e++)
			this.matrix[e] *= t;
		return this
	},
	transformRenderingContextSet : function (t) {
		var e = this.matrix;
		return t.setTransform(e[0], e[3], e[1], e[4], e[2], e[5]),
		this
	},
	transformRenderingContext : function (t) {
		var e = this.matrix;
		return t.transform(e[0], e[3], e[1], e[4], e[2], e[5]),
		this
	}
}, typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeMatrix2d);
var IgeAnimationComponent = IgeEventingClass.extend({
		classId : "IgeAnimationComponent",
		componentId : "animation",
		init : function (t) {
			this._entity = t,
			this._anims = {},
			t.addBehaviour("tween", this._update)
		},
		define : function (t, e, i, o, s) {
			if (e && e.length) {
				var n,
				r;
				if (this._anims.length = this._anims.length || 0, s === void 0 && (s = !0), s)
					for (n = 0; e.length > n; n++)
						if (r = e[n], typeof r == "string") {
							if (!this._entity._texture) {
								this.log("You can increase the performance of id-based cell animations by specifying the animation.define AFTER you have assigned your sprite sheet to the entity on entity with ID: " + this._entity.id(), "warning");
								break
							}
							r = this._entity._texture.cellIdToIndex(r)
						}
				var a = 1e3 / i | 0;
				this._anims[t] = {
					frames : e,
					frameTime : a,
					loop : o !== void 0 ? o : -1,
					frameCount : e.length,
					totalTime : e.length * a,
					currentDelta : 0,
					currentLoop : 0
				},
				this._anims.length++
			} else
				this.log("Cannot define an animation without a frame array!", "error");
			return this._entity
		},
		setFps : function (t, e) {
			if (this._anims) {
				var i = this._anims[t];
				i && (i.frameTime = 1e3 / e | 0, i.totalTime = i.frameCount * i.frameTime)
			}
			return this._entity
		},
		setAllFps : function (t) {
			if (this._anims)
				for (id in this._anims)
					this._anims.hasOwnProperty(id) && this.setFps(id, t);
			return this._entity
		},
		playing : function () {
			return this._playing
		},
		start : function (t, e) {
			if (this._anims) {
				var i = this._anims[t];
				i ? (i.currentDelta = 0, i.currentLoop = 0, i.startTime = ige._currentTime, this._anim = i, this._animId = t, e !== void 0 && (this._completeCallback = e.onComplete, this._loopCallback = e.onLoop, this._stoppedCallback = e.onStopped), this._playing = !0, this.emit("started", i)) : this.log('Cannot set animation to "' + t + '" because the animation does not exist!', "warning")
			} else
				this.log('Cannot set animation to "' + t + '" because no animations have been defined with defineAnim(...);', "warning");
			return this._entity
		},
		select : function (t, e) {
			return this._animId !== t && this.start(t, e),
			this._entity
		},
		stop : function () {
			return this._stoppedCallback && this._stoppedCallback.call(this),
			this.emit("stopped", this._anim),
			this._playing = !1,
			delete this._anim,
			delete this._animId,
			delete this._completeCallback,
			delete this._loopCallback,
			delete this._stoppedCallback,
			this._entity
		},
		_update : function () {
			var t = this.animation;
			if (t._anim) {
				var e,
				i,
				o,
				s = ige._tickDelta,
				n = t._anim;
				n.currentDelta += s,
				n.currentDelta > n.totalTime && (n.loop ? n.loop === -1 ? (e = n.currentDelta / n.totalTime, Math.abs(e) > 1 && (n.currentDelta -= (e | 0) * n.totalTime), t._loopCallback && t._loopCallback.call(t), t.emit("loopComplete", n)) : (n.currentLoop++, n.loop > 0 && n.loop >= n.currentLoop ? (e = n.currentDelta / n.totalTime, Math.abs(e) > 1 && (n.currentDelta -= (e | 0) * n.totalTime), t._loopCallback && t._loopCallback.call(t), t.emit("loopComplete", n)) : (t._completeCallback && t._completeCallback.call(t, []), t.emit("complete", n), t.stop())) : (t._completeCallback && t._completeCallback.call(t), t.emit("complete", n), t.stop())),
				o = n.currentDelta / n.frameTime | 0,
				n.frameCount > o || (o = n.frameCount - 1),
				i = n.frames[o],
				typeof i == "string" ? t._entity.cellById(i) : t._entity.cell(i)
			}
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeAnimationComponent);
var IgeVelocityComponent = IgeClass.extend({
		classId : "IgeVelocityComponent",
		componentId : "velocity",
		init : function (t) {
			this._entity = t,
			this._velocity = new IgePoint(0, 0, 0),
			this._friction = new IgePoint(1, 1, 1),
			t.addBehaviour("velocity", this._behaviour)
		},
		_behaviour : function (t) {
			this.velocity.tick(t)
		},
		byAngleAndPower : function (t, e, i) {
			var o = this._velocity,
			s = Math.cos(t) * e,
			n = Math.sin(t) * e,
			r = 0;
			return i ? (o.x += s, o.y += n, o.z += r) : (o.x = s, o.y = n, o.z = r),
			this._entity
		},
		xyz : function (t, e, i, o) {
			var s = this._velocity;
			return o ? (s.x += t, s.y += e, s.z += i) : (s.x = t, s.y = e, s.z = i),
			this._entity
		},
		x : function (t, e) {
			var i = this._velocity;
			return e ? i.x += t : i.x = t,
			this._entity
		},
		y : function (t, e) {
			var i = this._velocity;
			return e ? i.y += t : i.y = t,
			this._entity
		},
		z : function (t, e) {
			var i = this._velocity;
			return e ? i.z += t : i.z = y,
			this._entity
		},
		vector3 : function (t, e) {
			typeof t.scale != "number" && (t.scale = 1);
			var i = this._velocity,
			o = t.x,
			s = t.y,
			n = t.z;
			return e ? (i.x += o, i.y += s, i.z += n) : (i.x = o, i.y = s, i.z = n),
			this._entity
		},
		friction : function (t) {
			var e = 1 - t;
			return 0 > e && (e = 0),
			this._friction = new IgePoint(e, e, e),
			this._entity
		},
		linearForce : function (t, e) {
			e /= 1e3;
			var i = t * Math.PI / 180,
			o = Math.cos(i) * e,
			s = Math.sin(i) * e,
			n = o * s;
			return this._linearForce = new IgePoint(o, s, n),
			this._entity
		},
		linearForceXYZ : function (t, e, i) {
			return this._linearForce = new IgePoint(t, e, i),
			this._entity
		},
		linearForceVector3 : function (t, e, i) {
			var o = this._linearForce = this._linearForce || new IgePoint(0, 0, 0),
			s = t.x / 1e3,
			n = t.y / 1e3,
			r = t.z / 1e3;
			return i ? (o.x += s || 0, o.y += n || 0, o.z += r || 0) : (o.x = s || 0, o.y = n || 0, o.z = r || 0),
			this._entity
		},
		_applyLinearForce : function (t) {
			if (this._linearForce) {
				var e = this._velocity;
				e.x += this._linearForce.x * t,
				e.y += this._linearForce.y * t,
				e.z += this._linearForce.z * t
			}
		},
		_applyFriction : function () {
			var t = this._velocity,
			e = this._friction;
			t.x *= e.x,
			t.y *= e.y,
			t.z *= e.z
		},
		tick : function () {
			var t,
			e,
			i,
			o = ige._tickDelta,
			s = this._velocity;
			o && (this._applyLinearForce(o), t = s.x * o, e = s.y * o, i = s.z * o, (t || e || i) && this._entity.translateBy(t, e, i))
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeVelocityComponent);
var IgeTweenComponent = IgeClass.extend({
		classId : "IgeTweenComponent",
		componentId : "tween",
		init : function (t) {
			this._entity = t,
			this._transform = t.transform,
			this._tweens = [],
			t.addBehaviour("tween", this.update)
		},
		start : function (t) {
			return t._startTime > ige._currentTime ? this._tweens.push(t) : (t._currentStep = 0, this._setupStep(t, !1) && this._tweens.push(t)),
			this.enable(),
			t
		},
		_setupStep : function (t, e) {
			var i,
			o,
			s,
			n = t._targetObj,
			r = t._steps[t._currentStep],
			a = [];
			if (r && (i = r.props), n) {
				t._currentStep !== 0 || e ? t._startTime = ige._currentTime : t._startTime === void 0 && (t._startTime = ige._currentTime),
				o = r.durationMs ? r.durationMs : t._durationMs,
				t._selectedEasing = r.easing ? r.easing : t._easing,
				t._endTime = t._startTime + o;
				for (s in i)
					i.hasOwnProperty(s) && a.push({
						targetObj : n,
						propName : s,
						deltaVal : i[s] - (r.isDelta ? 0 : n[s]),
						oldDelta : 0
					});
				return t._targetData = a,
				t._destTime = t._endTime - t._startTime,
				t
			}
			this.log('Cannot start tweening properties of the specified object "' + obj + '" because it does not exist!', "error")
		},
		stop : function (t) {
			return this._tweens.pull(t),
			this._tweens.length || this.disable(),
			this
		},
		stopAll : function () {
			return this.disable(),
			delete this._tweens,
			this._tweens = [],
			this
		},
		enable : function () {
			return this._tweening || (this._tweening = !0),
			this
		},
		disable : function () {
			return this._tweening && (this._tweening = !1),
			this
		},
		update : function () {
			var t = this.tween;
			if (t._tweens && t._tweens.length) {
				var e,
				i,
				o,
				s,
				n,
				r,
				a,
				h,
				l,
				c,
				m,
				_,
				u = ige._tickStart,
				p = t._tweens,
				y = p.length;
				while (y--)
					if (e = p[y], m = !1, e._started || u >= e._startTime)
						if (e._started || (e._currentStep === -1 && (e._currentStep = 0, t._setupStep(e, !1)), typeof e._beforeTween == "function" && (e._beforeTween(e), delete e._beforeTween), typeof e._beforeStep == "function" && (c = e._stepDirection ? e._steps.length - (e._currentStep + 1) : e._currentStep, e._beforeStep(e, c)), e._started = !0), i = u - e._startTime, o = e._destTime, s = e._selectedEasing, o > i) {
							h = e._targetData;
							for (l in h)
								if (h.hasOwnProperty(l)) {
									n = h[l];
									var _ = t.easing[s](i, n.deltaVal, o);
									n.targetObj[n.propName] += _ - n.oldDelta,
									n.oldDelta = _
								}
						} else {
							h = e._targetData;
							for (l in h)
								if (h.hasOwnProperty(l)) {
									n = h[l],
									r = n.targetObj,
									a = r[n.propName],
									_ = o !== 0 ? t.easing[s](o, n.deltaVal, o) : n.deltaVal,
									a += _ - n.oldDelta;
									var d = Math.pow(10, 15 - (a.toFixed(0) + "").length);
									r[n.propName] = Math.round(a * d) / d
								}
							typeof e._afterStep == "function" && (c = e._stepDirection ? e._steps.length - (e._currentStep + 1) : e._currentStep, e._afterStep(e, c)),
							e._steps.length === e._currentStep + 1 ? (e._repeatMode ? (e._repeatCount !== -1 && (e._repeatedCount++, e._repeatCount === e._repeatedCount && (m = !0)), m || (e._repeatMode === 1 && (e._currentStep = 0), e._repeatMode === 2 && (e._stepDirection = !e._stepDirection, e._steps.reverse(), e._currentStep = 1), typeof e._stepsComplete == "function" && e._stepsComplete(e, e._currentStep), typeof e._beforeStep == "function" && (c = e._stepDirection ? e._steps.length - (e._currentStep + 1) : e._currentStep, e._beforeStep(e, c)), t._setupStep(e, !0))) : m = !0, m && (e.stop(), typeof e._afterTween == "function" && (e._afterTween(e), delete e._afterTween))) : (e._currentStep++, typeof e._beforeStep == "function" && (c = e._stepDirection ? e._steps.length - (e._currentStep + 1) : e._currentStep, e._beforeStep(e, c)), t._setupStep(e, !0))
						}
			}
		},
		easing : {
			none : function (t, e, i) {
				return e * t / i
			},
			inQuad : function (t, e, i) {
				return e * (t /= i) * t
			},
			outQuad : function (t, e, i) {
				return -e * (t /= i) * (t - 2)
			},
			inOutQuad : function (t, e, i) {
				return 1 > (t /= i / 2) ? e / 2 * t * t : -e / 2 * (--t * (t - 2) - 1)
			},
			inCubic : function (t, e, i) {
				return e * (t /= i) * t * t
			},
			outCubic : function (t, e, i) {
				return e * ((t = t / i - 1) * t * t + 1)
			},
			inOutCubic : function (t, e, i) {
				return 1 > (t /= i / 2) ? e / 2 * t * t * t : e / 2 * ((t -= 2) * t * t + 2)
			},
			outInCubic : function (t, e, i) {
				return i / 2 > t ? this.outCubic(t * 2, e / 2, i) : this.inCubic(t * 2 - i, e / 2, e / 2, i)
			},
			inQuart : function (t, e, i) {
				return e * (t /= i) * t * t * t
			},
			outQuart : function (t, e, i) {
				return -e * ((t = t / i - 1) * t * t * t - 1)
			},
			inOutQuart : function (t, e, i) {
				return 1 > (t /= i / 2) ? e / 2 * t * t * t * t : -e / 2 * ((t -= 2) * t * t * t - 2)
			},
			outInQuart : function (t, e, i) {
				return i / 2 > t ? this.outQuart(t * 2, e / 2, i) : this.inQuart(t * 2 - i, e / 2, e / 2, i)
			},
			inQuint : function (t, e, i) {
				return e * (t /= i) * t * t * t * t
			},
			outQuint : function (t, e, i) {
				return e * ((t = t / i - 1) * t * t * t * t + 1)
			},
			inOutQuint : function (t, e, i) {
				return 1 > (t /= i / 2) ? e / 2 * t * t * t * t * t : e / 2 * ((t -= 2) * t * t * t * t + 2)
			},
			outInQuint : function (t, e, i) {
				return i / 2 > t ? this.outQuint(t * 2, e / 2, i) : this.inQuint(t * 2 - i, e / 2, e / 2, i)
			},
			inSine : function (t, e, i) {
				return -e * Math.cos(t / i * (Math.PI / 2)) + e
			},
			outSine : function (t, e, i) {
				return e * Math.sin(t / i * (Math.PI / 2))
			},
			inOutSine : function (t, e, i) {
				return -e / 2 * (Math.cos(Math.PI * t / i) - 1)
			},
			outInSine : function (t, e, i) {
				return i / 2 > t ? this.outSine(t * 2, e / 2, i) : this.inSine(t * 2 - i, e / 2, e / 2, i)
			},
			inExpo : function (t, e, i) {
				return t === 0 ? 0 : e * Math.pow(2, 10 * (t / i - 1)) - e * .001
			},
			outExpo : function (t, e, i) {
				return t === i ? e : e * 1.001 * (-Math.pow(2, -10 * t / i) + 1)
			},
			inOutExpo : function (t, e, i) {
				return t === 0 ? 0 : t === i ? e : 1 > (t /= i / 2) ? e / 2 * Math.pow(2, 10 * (t - 1)) - e * 5e-4 : e / 2 * 1.0005 * (-Math.pow(2, -10 * --t) + 2)
			},
			outInExpo : function (t, e, i) {
				return i / 2 > t ? this.outExpo(t * 2, e / 2, i) : this.inExpo(t * 2 - i, e / 2, e / 2, i)
			},
			inCirc : function (t, e, i) {
				return -e * (Math.sqrt(1 - (t /= i) * t) - 1)
			},
			outCirc : function (t, e, i) {
				return e * Math.sqrt(1 - (t = t / i - 1) * t)
			},
			inOutCirc : function (t, e, i) {
				return 1 > (t /= i / 2) ? -e / 2 * (Math.sqrt(1 - t * t) - 1) : e / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1)
			},
			outInCirc : function (t, e, i) {
				return i / 2 > t ? this.outCirc(t * 2, e / 2, i) : this.inCirc(t * 2 - i, e / 2, e / 2, i)
			},
			inElastic : function (t, e, i, o, s) {
				var n;
				return t === 0 ? 0 : (t /= i) === 1 ? e : (s || (s = i * .3), !o || Math.abs(e) > o ? (o = e, n = s / 4) : n = s / (2 * Math.PI) * Math.asin(e / o),  - (o * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * i - n) * 2 * Math.PI / s)))
			},
			outElastic : function (t, e, i, o, s) {
				var n;
				return t === 0 ? 0 : (t /= i) === 1 ? e : (s || (s = i * .3), !o || Math.abs(e) > o ? (o = e, n = s / 4) : n = s / (2 * Math.PI) * Math.asin(e / o), o * Math.pow(2, -10 * t) * Math.sin((t * i - n) * 2 * Math.PI / s) + e)
			},
			inOutElastic : function (t, e, i, o, s) {
				var n;
				return t === 0 ? 0 : (t /= i / 2) === 2 ? e : (s || (s = i * .3 * 1.5), !o || Math.abs(e) > o ? (o = e, n = s / 4) : n = s / (2 * Math.PI) * Math.asin(e / o), 1 > t ?  - .5 * o * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * i - n) * 2 * Math.PI / s) : o * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * i - n) * 2 * Math.PI / s) * .5 + e)
			},
			outInElastic : function (t, e, i, o, s) {
				return i / 2 > t ? this.outElastic(t * 2, e / 2, i, o, s) : this.inElastic(t * 2 - i, e / 2, e / 2, i, o, s)
			},
			inBack : function (t, e, i, o) {
				return o === void 0 && (o = 1.70158),
				e * (t /= i) * t * ((o + 1) * t - o)
			},
			outBack : function (t, e, i, o) {
				return o === void 0 && (o = 1.70158),
				e * ((t = t / i - 1) * t * ((o + 1) * t + o) + 1)
			},
			inOutBack : function (t, e, i, o) {
				return o === void 0 && (o = 1.70158),
				1 > (t /= i / 2) ? e / 2 * t * t * (((o *= 1.525) + 1) * t - o) : e / 2 * ((t -= 2) * t * (((o *= 1.525) + 1) * t + o) + 2)
			},
			outInBack : function (t, e, i, o) {
				return i / 2 > t ? this.outBack(t * 2, e / 2, i, o) : this.inBack(t * 2 - i, e / 2, e / 2, i, o)
			},
			inBounce : function (t, e, i) {
				return e - this.outBounce(i - t, 0, e, i)
			},
			outBounce : function (t, e, i) {
				return 1 / 2.75 > (t /= i) ? e * 7.5625 * t * t : 2 / 2.75 > t ? e * (7.5625 * (t -= 1.5 / 2.75) * t + .75) : 2.5 / 2.75 > t ? e * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) : e * (7.5625 * (t -= 2.625 / 2.75) * t + .984375)
			},
			inOutBounce : function (t, e, i) {
				return i / 2 > t ? this.inBounce(t * 2, 0, e, i) * .5 : this.outBounce(t * 2 - i, 0, e, i) * .5 + e * .5
			},
			outInBounce : function (t, e, i) {
				return i / 2 > t ? this.outBounce(t * 2, e / 2, i) : this.inBounce(t * 2 - i, e / 2, e / 2, i)
			}
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeTweenComponent);
var IgePathComponent = IgeEventingClass.extend({
		classId : "IgePathComponent",
		componentId : "path",
		init : function (t) {
			this._entity = t,
			this._transform = t.transform,
			this._paths = [],
			this._currentPathIndex = -1,
			this._traverseDirection = 0,
			this._targetCellIndex = -1,
			this._targetCellArrivalTime = 0,
			this._active = !1,
			this._paused = !1,
			this._warnTime = 0,
			this._autoStop = !0,
			this._startTime = null,
			this._speed = .1,
			t.addBehaviour("path", this._updateBehaviour, !1),
			t.addBehaviour("path", this._tickBehaviour, !0)
		},
		add : function (t) {
			return t !== void 0 && (t.length ? this._paths.push(t) : this.log("Cannot add an empty path to the path queue!", "warning")),
			this._entity
		},
		current : function (t) {
			return t !== void 0 ? (this._currentPathIndex = t, this._entity) : this._currentPathIndex
		},
		previousTargetPoint : function () {
			if (this._paths.length) {
				var t = this._targetCellIndex > 0 ? this._targetCellIndex - 1 : this._targetCellIndex,
				e = this._entity._parent,
				i = this._paths[this._currentPathIndex][t];
				return new IgePoint(i.x * e._tileWidth, i.y * e._tileHeight, 0)
			}
		},
		currentTargetPoint : function () {
			if (this._paths.length) {
				var t = this._entity._parent,
				e = this._paths[this._currentPathIndex][this._targetCellIndex];
				return new IgePoint(e.x * t._tileWidth, e.y * t._tileHeight, 0)
			}
		},
		previousTargetCell : function () {
			if (this._paths.length) {
				var t = this._targetCellIndex > 0 ? this._targetCellIndex - 1 : this._targetCellIndex;
				return this._paths[this._currentPathIndex][t]
			}
		},
		currentTargetCell : function () {
			return this._paths.length ? this._paths[this._currentPathIndex][this._targetCellIndex] : void 0
		},
		currentDirection : function () {
			var t = this.currentTargetCell(),
			e = "";
			if (t && (e = t.direction, this._entity._mode === 1))
				switch (e) {
				case "E":
					e = "SE";
					break;
				case "S":
					e = "SW";
					break;
				case "W":
					e = "NW";
					break;
				case "N":
					e = "NE";
					break;
				case "NE":
					e = "E";
					break;
				case "SW":
					e = "W";
					break;
				case "NW":
					e = "N";
					break;
				case "SE":
					e = "S"
				}
			return e
		},
		warnTime : function (t) {
			return t !== void 0 ? (this._warnTime = t, this._entity) : this._warnTime
		},
		autoStop : function (t) {
			return t !== void 0 ? (this._autoStop = t, this._entity) : this._autoStop
		},
		drawPath : function (t) {
			return t !== void 0 ? (this._drawPath = t, this._entity) : this._drawPath
		},
		drawPathGlow : function (t) {
			return t !== void 0 ? (this._drawPathGlow = t, this._entity) : this._drawPathGlow
		},
		drawPathText : function (t) {
			return t !== void 0 ? (this._drawPathText = t, this._entity) : this._drawPathText
		},
		speed : function (t) {
			return t !== void 0 ? (this._speed = t, this._entity) : this._speed
		},
		start : function (t) {
			return this._active || (this._paths.length ? (this._currentPathIndex === -1 && (this._currentPathIndex = 0), this._targetCellIndex === -1 && (this._targetCellIndex = 0), t === void 0 && (t = ige._currentTime), this._paused && (this._targetCellArrivalTime += t - this._pauseTime, this._paused = !1), this._startTime = t, this._currentTime = this._startTime, this._active = !0, this.emit("started", this._entity)) : this.log("Cannot start path because no paths have been added!", "warning")),
			this._entity
		},
		endPoint : function () {
			var t,
			e,
			i = this._paths,
			o = this._paths.length;
			return o ? (t = i[o - 1], e = t.length, t[e - 1]) : null
		},
		pause : function () {
			return this._active = !1,
			this._paused = !0,
			this._pauseTime = ige._currentTime,
			this.emit("paused", this._entity),
			this._entity
		},
		stop : function () {
			return this._active = !1,
			this.emit("stopped", this._entity),
			this._entity
		},
		clear : function () {
			return this._active && this.stop(),
			this._paths = [],
			this._currentPathIndex = -1,
			this._targetCellIndex = -1,
			this._targetCellArrivalTime = 0,
			this.emit("cleared", this._entity),
			this._entity
		},
		_updateBehaviour : function () {
			if (this.path._active) {
				var t,
				e,
				i,
				o = this.path,
				s = o._paths[o._currentPathIndex],
				n = this._translate,
				r = s[o._targetCellIndex];
				if (o._currentTime = ige._currentTime, r)
					if (t = {
							x : r.x * this._parent._tileWidth,
							y : r.y * this._parent._tileHeight
						}, s)
						if (o._targetCellArrivalTime <= o._currentTime || t.x === n.x && t.y === n.y) {
							if (o.emit("pointComplete", this), o._targetCellIndex++, !s[o._targetCellIndex] && (this.translateTo(t.x, t.y, n.z), o.emit("pathComplete", this), o._targetCellIndex = 0, o._currentPathIndex++, !o._paths[o._currentPathIndex]))
								return o.clear(), o.emit("traversalComplete", this), !1;
							s = o._paths[o._currentPathIndex],
							r = s[o._targetCellIndex],
							t = {
								x : r.x * this._parent._tileWidth,
								y : r.y * this._parent._tileHeight
							},
							i = Math.distance(n.x, n.y, t.x, t.y),
							o._targetCellArrivalTime = o._currentTime + i / o._speed
						} else
							e = o._positionAlongVector(n, t, o._speed, ige._tickDelta), this.translateTo(e.x, e.y, n.z);
					else
						o.stop()
			}
		},
		_tickBehaviour : function (t) {
			ige.isServer || this.path._drawPathToCtx(this, t)
		},
		_drawPathToCtx : function (t, e) {
			if (this._paths.length) {
				var i,
				o,
				s,
				n,
				r,
				a,
				h,
				l = this;
				if (i = l._active ? l._paths[l._currentPathIndex] : l._paths[0], i && l._drawPath) {
					e.save(),
					a = 0;
					while (l._paths[a]) {
						for (r = l._paths[a], o = void 0, n = 0; r.length > n; n++) {
							if (a === l._currentPathIndex ? (e.strokeStyle = "#0096ff", e.fillStyle = "#0096ff") : (e.strokeStyle = "#fff000", e.fillStyle = "#fff000"), s = t._parent.isometricMounts() ? new IgePoint(r[n].x * t._parent._tileWidth, r[n].y * t._parent._tileHeight, 0).toIso() : new IgePoint(r[n].x * t._parent._tileWidth, r[n].y * t._parent._tileHeight, 0), o) {
								if (l._drawPathGlow) {
									e.globalAlpha = .1;
									for (var c = 3; c >= 0; c--)
										e.lineWidth = (c + 1) * 4 - 3.5, e.beginPath(), e.moveTo(o.x, o.y), e.lineTo(s.x, s.y), (l._currentPathIndex > a || a === l._currentPathIndex && l._targetCellIndex > n) && (e.strokeStyle = "#666666", e.fillStyle = "#333333"), c === 0 && (e.globalAlpha = 1), e.stroke()
								} else
									e.beginPath(), e.moveTo(o.x, o.y), e.lineTo(s.x, s.y), (l._currentPathIndex > a || a === l._currentPathIndex && l._targetCellIndex > n) && (e.strokeStyle = "#666666", e.fillStyle = "#333333"), e.stroke();
								a === l._currentPathIndex && n === l._targetCellIndex ? (e.save(), e.translate(s.x, s.y), e.rotate(45 * Math.PI / 180), e.translate(-s.x, -s.y), e.fillStyle = "#d024ea", e.fillRect(s.x - 5, s.y - 5, 10, 10), e.restore()) : e.fillRect(s.x - 2.5, s.y - 2.5, 5, 5)
							} else
								e.beginPath(), e.arc(s.x, s.y, 5, 0, Math.PI * 2, !0), e.closePath(), l._currentPathIndex > a && (e.fillStyle = "#666666"), e.fill(), l._drawPathText && (e.save(), e.fillStyle = "#eade24", l._drawPathGlow && (e.shadowOffsetX = 1, e.shadowOffsetY = 2, e.shadowBlur = 4, e.shadowColor = "rgba(0, 0, 0, 1)"), h = "Entity: " + t.id(), e.fillText(h, s.x - Math.floor(e.measureText(h).width / 2), s.y - 22), h = "Path " + a + " (" + r[n].x + ", " + r[n].y + ")", e.fillText(h, s.x - Math.floor(e.measureText(h).width / 2), s.y - 10), e.restore());
							o = s
						}
						a++
					}
					e.restore()
				}
			}
		},
		_positionAlongVector : function (t, e, i, o) {
			var s = new IgePoint(0, 0, 0),
			n = e.y - t.y,
			r = e.x - t.x,
			a = Math.distance(t.x, t.y, e.x, e.y),
			h = i * r / a,
			l = i * n / a;
			return a > 0 && (s.x = t.x + h * o, s.y = t.y + l * o),
			s
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgePathComponent);
var IgeInputComponent = IgeEventingClass.extend({
		classId : "IgeInputComponent",
		componentId : "input",
		init : function () {
			this._eventQueue = [],
			this._eventControl = {
				_cancelled : !1,
				stopPropagation : function () {
					this._cancelled = !0
				}
			},
			this.tick(),
			this.mouse = {
				dblClick : -302,
				down : -301,
				up : -300,
				move : -259,
				wheel : -258,
				wheelUp : -257,
				wheelDown : -256,
				x : -255,
				y : -254,
				button1 : -253,
				button2 : -252,
				button3 : -251
			},
			this.pad1 = {
				button1 : -250,
				button2 : -249,
				button3 : -248,
				button4 : -247,
				button5 : -246,
				button6 : -245,
				button7 : -244,
				button8 : -243,
				button9 : -242,
				button10 : -241,
				button11 : -240,
				button12 : -239,
				button13 : -238,
				button14 : -237,
				button15 : -236,
				button16 : -235,
				button17 : -234,
				button18 : -233,
				button19 : -232,
				button20 : -231,
				stick1 : -230,
				stick2 : -229,
				stick1Up : -228,
				stick1Down : -227,
				stick1Left : -226,
				stick1Right : -225,
				stick2Up : -224,
				stick2Down : -223,
				stick2Left : -222,
				stick2Right : -221
			},
			this.pad2 = {
				button1 : -220,
				button2 : -219,
				button3 : -218,
				button4 : -217,
				button5 : -216,
				button6 : -215,
				button7 : -214,
				button8 : -213,
				button9 : -212,
				button10 : -211,
				button11 : -210,
				button12 : -209,
				button13 : -208,
				button14 : -207,
				button15 : -206,
				button16 : -205,
				button17 : -204,
				button18 : -203,
				button19 : -202,
				button20 : -201,
				stick1 : -200,
				stick2 : -199,
				stick1Up : -198,
				stick1Down : -197,
				stick1Left : -196,
				stick1Right : -195,
				stick2Up : -194,
				stick2Down : -193,
				stick2Left : -192,
				stick2Right : -191
			},
			this.key = {
				shift : -3,
				ctrl : -2,
				alt : -1,
				backspace : 8,
				tab : 9,
				enter : 13,
				escape : 27,
				space : 32,
				pageUp : 33,
				pageDown : 34,
				end : 35,
				home : 36,
				left : 37,
				up : 38,
				right : 39,
				down : 40,
				insert : 45,
				del : 46,
				0 : 48,
				1 : 49,
				2 : 50,
				3 : 51,
				4 : 52,
				5 : 53,
				6 : 54,
				7 : 55,
				8 : 56,
				9 : 57,
				a : 65,
				b : 66,
				c : 67,
				d : 68,
				e : 69,
				f : 70,
				g : 71,
				h : 72,
				i : 73,
				j : 74,
				k : 75,
				l : 76,
				m : 77,
				n : 78,
				o : 79,
				p : 80,
				q : 81,
				r : 82,
				s : 83,
				t : 84,
				u : 85,
				v : 86,
				w : 87,
				x : 88,
				y : 89,
				z : 90
			},
			this._controlMap = [],
			this._state = [],
			this._state[this.mouse.x] = 0,
			this._state[this.mouse.y] = 0
		},
		debug : function (t) {
			return t !== void 0 ? (this._debug = t, this) : this._debug
		},
		setupListeners : function (t) {
			this.log("Setting up input event listeners..."),
			this._canvas = t;
			var e = this;
			this._evRef = {
				mousedown : function (t) {
					t.igeType = "mouse",
					e._rationalise(t),
					e._mouseDown(t)
				},
				mouseup : function (t) {
					t.igeType = "mouse",
					e._rationalise(t),
					e._mouseUp(t)
				},
				mousemove : function (t) {
					t.igeType = "mouse",
					e._rationalise(t),
					e._mouseMove(t)
				},
				mousewheel : function (t) {
					t.igeType = "mouse",
					e._rationalise(t),
					e._mouseWheel(t)
				},
				touchmove : function (t) {
					t.igeType = "touch",
					e._rationalise(t, !0),
					e._mouseMove(t)
				},
				touchstart : function (t) {
					t.igeType = "touch",
					e._rationalise(t, !0),
					e._mouseDown(t)
				},
				touchend : function (t) {
					t.igeType = "touch",
					e._rationalise(t, !0),
					e._mouseUp(t)
				},
				contextmenu : function (t) {
					t.preventDefault()
				},
				keydown : function (t) {
					t.igeType = "key",
					e._rationalise(t),
					e._keyDown(t)
				},
				keyup : function (t) {
					t.igeType = "key",
					e._rationalise(t),
					e._keyUp(t)
				}
			},
			t.addEventListener("mousedown", this._evRef.mousedown, !1),
			t.addEventListener("mouseup", this._evRef.mouseup, !1),
			t.addEventListener("mousemove", this._evRef.mousemove, !1),
			t.addEventListener("mousewheel", this._evRef.mousewheel, !1),
			t.addEventListener("touchmove", this._evRef.touchmove, !1),
			t.addEventListener("touchstart", this._evRef.touchstart, !1),
			t.addEventListener("touchend", this._evRef.touchend, !1),
			t.addEventListener("contextmenu", this._evRef.contextmenu, !1),
			window.addEventListener("keydown", this._evRef.keydown, !1),
			window.addEventListener("keyup", this._evRef.keyup, !1)
		},
		destroyListeners : function () {
			this.log("Removing input event listeners...");
			var t = this._canvas;
			t.removeEventListener("mousedown", this._evRef.mousedown, !1),
			t.removeEventListener("mouseup", this._evRef.mouseup, !1),
			t.removeEventListener("mousemove", this._evRef.mousemove, !1),
			t.removeEventListener("mousewheel", this._evRef.mousewheel, !1),
			t.removeEventListener("touchmove", this._evRef.touchmove, !1),
			t.removeEventListener("touchstart", this._evRef.touchstart, !1),
			t.removeEventListener("touchend", this._evRef.touchend, !1),
			t.removeEventListener("contextmenu", this._evRef.contextmenu, !1),
			window.removeEventListener("keydown", this._evRef.keydown, !1),
			window.removeEventListener("keyup", this._evRef.keyup, !1)
		},
		_rationalise : function (t, e) {
			if (t.igeType === "key" && t.keyCode === 8) {
				var i = t.srcElement || t.target;
				i.tagName.toLowerCase() === "body" && t.preventDefault()
			}
			t.igeType === "touch" && t.preventDefault(),
			e ? (t.button = 0, t.changedTouches && t.changedTouches.length && (t.igePageX = t.changedTouches[0].pageX, t.igePageY = t.changedTouches[0].pageY)) : (t.igePageX = t.pageX, t.igePageY = t.pageY),
			t.igeX = t.igePageX - this._canvas.offsetLeft,
			t.igeY = t.igePageY - this._canvas.offsetTop,
			this.emit("inputEvent", t)
		},
		_mouseDown : function (t) {
			this._debug && console.log("Mouse Down", t),
			this._updateMouseData(t);
			var e = t.igeX - ige._geometry.x2,
			i = t.igeY - ige._geometry.y2,
			o = this;
			t.igeBaseX = e,
			t.igeBaseY = i,
			t.button === 0 && (this._state[this.mouse.button1] = !0),
			t.button === 1 && (this._state[this.mouse.button2] = !0),
			t.button === 2 && (this._state[this.mouse.button3] = !0),
			this.mouseDown = t,
			this.queueEvent(this, function () {
				o.emit("mouseDown", [t, e, i, t.button + 1])
			})
		},
		_mouseUp : function (t) {
			this._debug && console.log("Mouse Up", t),
			this._updateMouseData(t);
			var e = t.igeX - ige._geometry.x2,
			i = t.igeY - ige._geometry.y2,
			o = this;
			t.igeBaseX = e,
			t.igeBaseY = i,
			t.button === 0 && (this._state[this.mouse.button1] = !1),
			t.button === 1 && (this._state[this.mouse.button2] = !1),
			t.button === 2 && (this._state[this.mouse.button3] = !1),
			this.mouseUp = t,
			this.queueEvent(this, function () {
				o.emit("mouseUp", [t, e, i, t.button + 1])
			})
		},
		_mouseMove : function (t) {
			ige._mouseOverVp = this._updateMouseData(t);
			var e = t.igeX - ige._geometry.x2,
			i = t.igeY - ige._geometry.y2,
			o = this;
			t.igeBaseX = e,
			t.igeBaseY = i,
			this._state[this.mouse.x] = e,
			this._state[this.mouse.y] = i,
			this.mouseMove = t,
			this.queueEvent(this, function () {
				o.emit("mouseMove", [t, e, i, t.button + 1])
			})
		},
		_mouseWheel : function (t) {
			this._updateMouseData(t);
			var e = t.igeX - ige._geometry.x2,
			i = t.igeY - ige._geometry.y2,
			o = this;
			t.igeBaseX = e,
			t.igeBaseY = i,
			this._state[this.mouse.wheel] = t.wheelDelta,
			t.wheelDelta > 0 ? this._state[this.mouse.wheelUp] = !0 : this._state[this.mouse.wheelDown] = !0,
			this.mouseWheel = t,
			this.queueEvent(this, function () {
				o.emit("mouseWheel", [t, e, i, t.button + 1])
			})
		},
		_keyDown : function (t) {
			var e = this;
			this._state[t.keyCode] = !0,
			this.queueEvent(this, function () {
				e.emit("keyDown", [t, t.keyCode])
			})
		},
		_keyUp : function (t) {
			var e = this;
			this._state[t.keyCode] = !1,
			this.queueEvent(this, function () {
				e.emit("keyUp", [t, t.keyCode])
			})
		},
		_updateMouseData : function (t) {
			var e,
			i,
			o = ige._children,
			s = o.length,
			n = t.igeX - ige._geometry.x / 2,
			r = t.igeY - ige._geometry.y / 2;
			ige._mousePos.x = n,
			ige._mousePos.y = r;
			while (s--)
				if (e = o[o.length - (s + 1)], n > e._translate.x - e._geometry.x / 2 && e._translate.x + e._geometry.x / 2 > n && r > e._translate.y - e._geometry.y / 2 && e._translate.y + e._geometry.y / 2 > r) {
					e._mousePos = new IgePoint(Math.floor((n - e._translate.x) / e.camera._scale.x + e.camera._translate.x), Math.floor((r - e._translate.y) / e.camera._scale.y + e.camera._translate.y), 0),
					i = e,
					t.igeViewport = e;
					break
				}
			return i
		},
		mapAction : function (t, e) {
			this._controlMap[t] = e
		},
		actionVal : function (t) {
			return this._state[this._controlMap[t]]
		},
		actionState : function (t) {
			var e = this._state[this._controlMap[t]];
			return !!e
		},
		val : function (t) {
			return this._state[t]
		},
		state : function (t) {
			return !!this._state[t]
		},
		stopPropagation : function () {
			return this._eventControl._cancelled = !0,
			this
		},
		queueEvent : function (t, e, i) {
			return e !== void 0 && this._eventQueue.push([t, e, i]),
			this
		},
		tick : function () {
			var t = this._eventQueue,
			e = t.length,
			i = this._eventControl;
			while (e--)
				if (t[e][1].apply(t[e][0], [i, t[e][2]]), i._cancelled)
					break;
			this._eventQueue = [],
			this._eventControl._cancelled = !1,
			this.dblClick = !1,
			this.mouseMove = !1,
			this.mouseDown = !1,
			this.mouseUp = !1,
			this.mouseWheel = !1
		},
		emit : function (t, e) {
			if (this._eventListeners && this._eventListeners[t]) {
				var i,
				o,
				s,
				n,
				r,
				a,
				h = this._eventListeners[t].length,
				l = this._eventListeners[t].length - 1,
				c = this._eventControl;
				if (h) {
					if (i = [], typeof e == "object" && e !== null && e[0] !== null)
						for (o in e)
							e.hasOwnProperty(o) && (i[o] = e[o]);
					else
						i = [e];
					s = !1,
					this._eventListeners._processing = !0;
					while (h--) {
						if (c._cancelled)
							break;
						n = l - h,
						r = this._eventListeners[t][n],
						r.sendEventName && (i = [t]),
						a = r.call.apply(r.context || this, i),
						(a === !0 || c._cancelled === !0) && (s = !0),
						r.oneShot && this.off(t, r)
					}
					if (this._eventListeners._processing = !1, this._processRemovals(), s)
						return 1
				}
			}
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeInputComponent);
var IgeMousePanComponent = IgeEventingClass.extend({
		classId : "IgeMousePanComponent",
		componentId : "mousePan",
		init : function (t, e) {
			this._entity = t,
			this._options = e,
			this._enabled = !1,
			this._startThreshold = 5
		},
		startThreshold : function (t) {
			return t !== void 0 ? (this._startThreshold = t, this._entity) : this._startThreshold
		},
		limit : function (t) {
			return t !== void 0 ? (this._limit = t, this._entity) : this._limit
		},
		enabled : function (t) {
			var e = this;
			return t !== void 0 ? (this._enabled = t, this._panPreStart = !1, this._panStarted = !1, this._enabled ? (this._entity.mouseDown(function (t) {
						e._mouseDown(t)
					}), this._entity.mouseMove(function (t) {
						e._mouseMove(t)
					}), this._entity.mouseUp(function (t) {
						e._mouseUp(t)
					})) : (delete this._panStartMouse, delete this._panStartCamera), this._entity) : this._enabled
		},
		_mouseDown : function (t) {
			if (!this._panStarted && this._enabled && t.igeViewport.id() === this._entity.id()) {
				var e = ige._mousePos;
				this._panStartMouse = e.clone(),
				this._panStartCamera = {
					x : this._entity.camera._translate.x,
					y : this._entity.camera._translate.y
				},
				this._panPreStart = !0,
				this._panStarted = !1
			}
		},
		_mouseMove : function () {
			if (this._enabled && this._panStartMouse) {
				var t = ige._mousePos,
				e = {
					x : this._panStartMouse.x - t.x,
					y : this._panStartMouse.y - t.y
				},
				i = Math.abs(e.x),
				o = Math.abs(e.y),
				s = e.x / this._entity.camera._scale.x + this._panStartCamera.x,
				n = e.y / this._entity.camera._scale.y + this._panStartCamera.y;
				this._limit && (this._limit.x > s && (s = this._limit.x), s > this._limit.x + this._limit.width && (s = this._limit.x + this._limit.width), this._limit.y > n && (n = this._limit.y), n > this._limit.y + this._limit.height && (n = this._limit.y + this._limit.height)),
				this._panPreStart ? (i > this._startThreshold || o > this._startThreshold) && (this._entity.camera.translateTo(s, n, 0), this.emit("panStart"), this._panPreStart = !1, this._panStarted = !0, this.emit("panMove")) : (this._entity.camera.translateTo(s, n, 0), this.emit("panMove"))
			}
		},
		_mouseUp : function () {
			if (this._enabled)
				if (this._panStarted) {
					if (this._panStartMouse) {
						var t = ige._mousePos,
						e = {
							x : this._panStartMouse.x - t.x,
							y : this._panStartMouse.y - t.y
						},
						i = e.x / this._entity.camera._scale.x + this._panStartCamera.x,
						o = e.y / this._entity.camera._scale.y + this._panStartCamera.y;
						this._limit && (this._limit.x > i && (i = this._limit.x), i > this._limit.x + this._limit.width && (i = this._limit.x + this._limit.width), this._limit.y > o && (o = this._limit.y), o > this._limit.y + this._limit.height && (o = this._limit.y + this._limit.height)),
						this._entity.camera.translateTo(i, o, 0),
						delete this._panStartMouse,
						delete this._panStartCamera,
						this.emit("panEnd"),
						this._panStarted = !1
					}
				} else
					delete this._panStartMouse, delete this._panStartCamera, this._panStarted = !1
		}
	}), IgeMouseZoomComponent = IgeEventingClass.extend({
		classId : "IgeMouseZoomComponent",
		componentId : "mouseZoom",
		init : function (t, e) {
			this._entity = t,
			this._options = e,
			this._enabled = !1
		},
		enabled : function (t) {
			var e = this;
			return t !== void 0 ? (this._enabled = t, this._enabled ? (this._entity.mouseDown(function (t) {
						e._mouseDown(t)
					}), this._entity.mouseMove(function (t) {
						e._mouseMove(t)
					}), this._entity.mouseUp(function (t) {
						e._mouseUp(t)
					})) : (delete this._zoomStartMouse, delete this._zoomStartCamera), this._entity) : this._enabled
		},
		_mouseDown : function (t) {
			if (this._enabled && t.igeViewport.id() === this._entity.id()) {
				var e = ige._mousePos;
				this._zoomStartMouse = {
					x : e.x,
					y : e.y
				},
				this._zoomStartCamera = {
					x : this._entity.camera._scale.x,
					y : this._entity.camera._scale.y
				}
			}
		},
		_mouseMove : function () {
			if (this._enabled && this._zoomStartMouse) {
				var t = ige._mousePos,
				e = {
					x :  - (this._zoomStartMouse.x - t.x) / 100,
					y :  - (this._zoomStartMouse.y - t.y) / 100
				};
				this._entity.camera.scaleTo(e.x + this._zoomStartCamera.x > .02 ? e.x + this._zoomStartCamera.x : .02, e.x + this._zoomStartCamera.x > .02 ? e.x + this._zoomStartCamera.x : .02, 0)
			}
		},
		_mouseUp : function () {
			if (this._enabled && this._zoomStartMouse) {
				var t = ige._mousePos,
				e = {
					x :  - (this._zoomStartMouse.x - t.x) / 100,
					y :  - (this._zoomStartMouse.y - t.y) / 100
				};
				this._entity.camera.scaleTo(e.x + this._zoomStartCamera.x > .02 ? e.x + this._zoomStartCamera.x : .02, e.x + this._zoomStartCamera.x > .02 ? e.x + this._zoomStartCamera.x : .02, 0),
				delete this._zoomStartMouse,
				delete this._zoomStartCamera
			}
		}
	}), IgeTiledComponent = IgeClass.extend({
		classId : "IgeTiledComponent",
		componentId : "tiled",
		init : function (t, e) {
			this._entity = t,
			this._options = e
		},
		loadJson : function (t, e) {
			var i,
			o = this;
			typeof t == "string" ? ige.isServer ? this.log("URL-based Tiled data is only available client-side. If you want to load Tiled map data on the server please include the map file in your ServerConfig.js file and then specify the map's data object instead of the URL.", "error") : (i = document.createElement("script"), i.src = t, i.onload = function () {
				o.log("Tiled data loaded, processing..."),
				o._processData(tiled, e)
			}, document.getElementsByTagName("head")[0].appendChild(i)) : o._processData(t, e)
		},
		_processData : function (t, e) {
			var i,
			o,
			s,
			n,
			r,
			a,
			h,
			l,
			c,
			m,
			_,
			u,
			p,
			y,
			d,
			x = ige.isServer === !0 ? IgeTileMap2d : IgeTextureMap,
			f = t.width,
			g = t.height,
			v = t.layers,
			b = v.length,
			w = [],
			C = {},
			D = t.tilesets,
			B = D.length,
			S = B,
			I = 0,
			A = [],
			M = [];
			if (m = function () {
				for (_ = 0; b > _; _++) {
					if (i = v[_], o = i.type, o === "tilelayer") {
						if (s = i.data, w[_] = (new x).id(i.name).tileWidth(t.tilewidth).tileHeight(t.tilewidth).depth(_), w[_].type = o, t.orientation === "isometric" && w[_].isometricMounts(!0), C[i.name] = w[_], B = D.length, !ige.isServer)
							for (u = 0; B > u; u++)
								w[_].addTexture(M[u]);
							for (n = s.length, y = 0; g > y; y++)
								for (p = 0; f > p; p++)
									d = p + y * f, s[d] > 0 && s[d] !== 2147483712 && (ige.isServer ? w[_].occupyTile(p, y, 1, 1, s[d]) : (a = A[s[d]], a && (h = s[d] - (a._tiledStartingId - 1), w[_].paintTile(p, y, w[_]._textureList.indexOf(a), h))))
						}
						o === "objectgroup" && (w[_] = i)
					}
					e(w, C)
				}, ige.isServer)m();
			else {
				l = function (t, e, i) {
					return function () {
						var e,
						o;
						new IgeCellSheet(i.image, this.width / i.tilewidth, this.height / i.tileheight).id(i.name).on("loaded", function () {
							for (o = this.cellCount(), this._tiledStartingId = i.firstgid, e = 0; o > e; e++)
								A[this._tiledStartingId + e] = this;
							t.push(this),
							I++,
							I === S && m()
						})
					}
				};
				while (B--)
					c = new Image, r = D[B], c.onload = l(M, B, r), c.src = r.image
			}
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeTiledComponent);
var IgeEntityManagerComponent = IgeClass.extend({
		classId : "IgeEntityManagerComponent",
		componentId : "entityManager",
		init : function (t, e) {
			this._entity = t,
			this._options = e,
			this._entity.pointToTile || this.log("Warning, IgeEntityManagerComponent is only meant to be added to a tile map!", "warning"),
			this._maps = [],
			this._overwatchMode = 0,
			this._removeMode = 0,
			this._createArr = [],
			this._removeArr = [],
			t.addBehaviour("entityManager", this._behaviour)
		},
		addMap : function (t) {
			return t !== void 0 && this._maps.push(t),
			this._entity
		},
		active : function (t) {
			return t !== void 0 ? (this._active = t, this._entity) : this._active
		},
		maxCreatePerTick : function (t) {
			return t !== void 0 ? (this._maxCreatePerTick = t, this._entity) : this._maxCreatePerTick
		},
		maxRemovePerTick : function (t) {
			return t !== void 0 ? (this._maxRemovePerTick = t, this._entity) : this._maxRemovePerTick
		},
		overwatchMode : function (t) {
			return t !== void 0 ? (this._overwatchMode = t, this._entity) : this._overwatchMode
		},
		createCheck : function (t) {
			return t !== void 0 ? (this._createCheck = t, this._entity) : this._createCheck
		},
		createEntityFromMapData : function (t) {
			return t !== void 0 ? (this._createEntityFromMapData = t, this._entity) : this._createEntityFromMapData
		},
		removeCheck : function (t) {
			return t !== void 0 ? (this._removeCheck = t, this._entity) : this._removeCheck
		},
		trackTranslate : function (t) {
			return t !== void 0 ? (this._trackTranslateTarget = t, this) : this._trackTranslateTarget
		},
		unTrackTranslate : function () {
			delete this._trackTranslateTarget
		},
		areaCenter : function (t, e) {
			if (t !== void 0 && e !== void 0) {
				var i,
				o = this._entity;
				return o._mode === 0 && (i = o._translate),
				o._mode === 1 && (i = o._translate.toIso()),
				t -= i.x,
				e -= i.y,
				this._areaCenter = new IgePoint(t, e, 0),
				this._entity
			}
			return this._areaCenter
		},
		areaRect : function (t, e, i, o) {
			return t !== void 0 && e !== void 0 && i !== void 0 && o !== void 0 ? (this._areaRect = new IgeRect(t, e, i, o), this._entity) : this._areaRect
		},
		areaRectAutoSize : function (t, e) {
			return t !== void 0 ? (this._areaRectAutoSize = t, this._areaRectAutoSizeOptions = e, this._entity) : this._areaRectAutoSize
		},
		currentArea : function () {
			this._trackTranslateTarget && (entTranslate = this._trackTranslateTarget.isometric() === !0 ? this._trackTranslateTarget._translate.toIso() : this._trackTranslateTarget._translate, this.areaCenter(entTranslate.x, entTranslate.y));
			var t = this._areaRect,
			e = this._areaCenter;
			return t && e ? new IgeRect(Math.floor(t.x + e.x), Math.floor(t.y + e.y), Math.floor(t.width), Math.floor(t.height)) : new IgeRect(0, 0, 0, 0)
		},
		removeMode : function (t) {
			return t !== void 0 ? (this._removeMode = t, this._entity) : this._removeMode
		},
		_behaviour : function (t) {
			var e,
			i,
			o,
			s,
			n,
			r,
			a,
			h,
			l,
			c,
			m,
			_,
			u,
			p,
			y,
			d,
			x = this.entityManager,
			f = this._children,
			g = f.length,
			v = x._maps;
			if (x._areaRect && !ige._resized || !x._areaRectAutoSize || x._resizeEvent(), e = x.currentArea(), x._areaCenter && x._areaRect && !e.compare(x._lastArea)) {
				a = this.pointToTile(x._areaCenter),
				h = a.x,
				l = a.y,
				c = Math.ceil(e.width / this._tileWidth),
				m = Math.ceil(e.height / this._tileHeight),
				e.x -= this._tileWidth,
				e.y -= this._tileHeight / 2,
				e.width += this._tileWidth * 2,
				e.height += this._tileHeight,
				this._mountMode === 0 && (i = new IgeRect(h - Math.floor(c / 2) - 1, l - Math.floor(m / 2) - 1, h + Math.floor(c / 2) + 1 - (h - Math.floor(c / 2) - 1), l + Math.floor(m / 2) + 1 - (l - Math.floor(m / 2) - 1))),
				this._mountMode === 1 && (y = Math.abs(c) > Math.abs(m) ? c : m, d = .6, i = new IgeRect(h - Math.floor(y * d), l - Math.floor(y * d), h + Math.floor(y * d) + 1 - (h - Math.floor(y * d)), l + Math.floor(y * d) + 1 - (l - Math.floor(y * d)))),
				this._drawBounds && (t.strokeStyle = "#ff0000", t.strokeRect(e.x, e.y, e.width, e.height), this._highlightTileRect = i),
				s = this.map;
				while (g--)
					o = f[g], (!x._removeCheck || x._removeCheck(o)) && (i.rectIntersect(o._occupiedRect) || x._removeArr.push(o));
				for (n in v)
					if (v.hasOwnProperty(n))
						for (s = v[n], r = s.map._mapData, u = i.y; i.y + i.height > u; u++)
							if (r[u])
								for (_ = i.x; i.x + i.width > _; _++)
									p = r[u][_], p && (!x._createCheck || x._createCheck(s, _, u, p)) && x._createArr.push([s, _, u, p]);
				x._lastArea = e,
				x.processQueues()
			}
		},
		processQueues : function () {
			var t,
			e = this._createArr,
			i = e.length,
			o = this._maxCreatePerTick !== void 0 ? this._maxCreatePerTick : 0,
			s = this._createEntityFromMapData,
			n = this._removeArr,
			r = n.length,
			a = this._maxRemovePerTick !== void 0 ? this._maxRemovePerTick : 0;
			for (o && i > o && (i = o), a && r > a && (r = a), t = 0; r > t; t++)
				this._removeMode === 0 && n.shift().destroy();
			for (t = 0; i > t; t++)
				s.apply(this, e.shift())
		},
		_resizeEvent : function () {
			if (this._areaRectAutoSize) {
				var t = this._entity._parent._geometry,
				e = 0,
				i = 0;
				this._areaRectAutoSizeOptions && (this._areaRectAutoSizeOptions.bufferMultiple && (e = t.x * this._areaRectAutoSizeOptions.bufferMultiple.x - t.x, i = t.y * this._areaRectAutoSizeOptions.bufferMultiple.y - t.y), this._areaRectAutoSizeOptions.bufferPixels && (e = this._areaRectAutoSizeOptions.bufferPixels.x, i = this._areaRectAutoSizeOptions.bufferPixels.y)),
				this.areaRect(-Math.floor((t.x + e) / 2), -Math.floor((t.y + i) / 2), t.x + e, t.y + i),
				this._caching > 0 && this._resizeCacheCanvas()
			}
		}
	}), Box2D = {};
(function (t, e) {
	function i() {}
	
	!(Object.prototype.defineProperty instanceof Function) && Object.prototype.__defineGetter__ instanceof Function && Object.prototype.__defineSetter__ instanceof Function && (Object.defineProperty = function (t, e, i) {
		i.get instanceof Function && t.__defineGetter__(e, i.get),
		i.set instanceof Function && t.__defineSetter__(e, i.set)
	}),
	t.inherit = function (t, e) {
		var o = t;
		i.prototype = e.prototype,
		t.prototype = new i,
		t.prototype.constructor = o
	},
	t.generateCallback = function (t, e) {
		return function () {
			e.apply(t, arguments)
		}
	},
	t.NVector = function (t) {
		t === e && (t = 0);
		for (var i = Array(t || 0), o = 0; t > o; ++o)
			i[o] = 0;
		return i
	},
	t.is = function (t, i) {
		return t === null ? !1 : i instanceof Function && t instanceof i ? !0 : t.constructor.__implements != e && t.constructor.__implements[i] ? !0 : !1
	},
	t.parseUInt = function (t) {
		return Math.abs(parseInt(t))
	}
})(Box2D);
var Vector = Array, Vector_a2j_Number = Box2D.NVector;
Box2D === void 0 && (Box2D = {}), Box2D.Collision === void 0 && (Box2D.Collision = {}), Box2D.Collision.Shapes === void 0 && (Box2D.Collision.Shapes = {}), Box2D.Common === void 0 && (Box2D.Common = {}), Box2D.Common.Math === void 0 && (Box2D.Common.Math = {}), Box2D.Dynamics === void 0 && (Box2D.Dynamics = {}), Box2D.Dynamics.Contacts === void 0 && (Box2D.Dynamics.Contacts = {}), Box2D.Dynamics.Controllers === void 0 && (Box2D.Dynamics.Controllers = {}), Box2D.Dynamics.Joints === void 0 && (Box2D.Dynamics.Joints = {}), function () {
	function t() {
		t.b2AABB.apply(this, arguments)
	}
	function e() {
		e.b2Bound.apply(this, arguments)
	}
	function i() {
		i.b2BoundValues.apply(this, arguments),
		this.constructor === i && this.b2BoundValues.apply(this, arguments)
	}
	function o() {
		o.b2Collision.apply(this, arguments)
	}
	function s() {
		s.b2ContactID.apply(this, arguments),
		this.constructor === s && this.b2ContactID.apply(this, arguments)
	}
	function n() {
		n.b2ContactPoint.apply(this, arguments)
	}
	function r() {
		r.b2Distance.apply(this, arguments)
	}
	function a() {
		a.b2DistanceInput.apply(this, arguments)
	}
	function h() {
		h.b2DistanceOutput.apply(this, arguments)
	}
	function l() {
		l.b2DistanceProxy.apply(this, arguments)
	}
	function c() {
		c.b2DynamicTree.apply(this, arguments),
		this.constructor === c && this.b2DynamicTree.apply(this, arguments)
	}
	function m() {
		m.b2DynamicTreeBroadPhase.apply(this, arguments)
	}
	function _() {
		_.b2DynamicTreeNode.apply(this, arguments)
	}
	function u() {
		u.b2DynamicTreePair.apply(this, arguments)
	}
	function p() {
		p.b2Manifold.apply(this, arguments),
		this.constructor === p && this.b2Manifold.apply(this, arguments)
	}
	function y() {
		y.b2ManifoldPoint.apply(this, arguments),
		this.constructor === y && this.b2ManifoldPoint.apply(this, arguments)
	}
	function d() {
		d.b2Point.apply(this, arguments)
	}
	function x() {
		x.b2RayCastInput.apply(this, arguments),
		this.constructor === x && this.b2RayCastInput.apply(this, arguments)
	}
	function f() {
		f.b2RayCastOutput.apply(this, arguments)
	}
	function g() {
		g.b2Segment.apply(this, arguments)
	}
	function v() {
		v.b2SeparationFunction.apply(this, arguments)
	}
	function b() {
		b.b2Simplex.apply(this, arguments),
		this.constructor === b && this.b2Simplex.apply(this, arguments)
	}
	function w() {
		w.b2SimplexCache.apply(this, arguments)
	}
	function C() {
		C.b2SimplexVertex.apply(this, arguments)
	}
	function D() {
		D.b2TimeOfImpact.apply(this, arguments)
	}
	function B() {
		B.b2TOIInput.apply(this, arguments)
	}
	function S() {
		S.b2WorldManifold.apply(this, arguments),
		this.constructor === S && this.b2WorldManifold.apply(this, arguments)
	}
	function I() {
		I.ClipVertex.apply(this, arguments)
	}
	function A() {
		A.Features.apply(this, arguments)
	}
	function M() {
		M.b2CircleShape.apply(this, arguments),
		this.constructor === M && this.b2CircleShape.apply(this, arguments)
	}
	function T() {
		T.b2EdgeChainDef.apply(this, arguments),
		this.constructor === T && this.b2EdgeChainDef.apply(this, arguments)
	}
	function V() {
		V.b2EdgeShape.apply(this, arguments),
		this.constructor === V && this.b2EdgeShape.apply(this, arguments)
	}
	function P() {
		P.b2MassData.apply(this, arguments)
	}
	function R() {
		R.b2PolygonShape.apply(this, arguments),
		this.constructor === R && this.b2PolygonShape.apply(this, arguments)
	}
	function k() {
		k.b2Shape.apply(this, arguments),
		this.constructor === k && this.b2Shape.apply(this, arguments)
	}
	function L() {
		L.b2Color.apply(this, arguments),
		this.constructor === L && this.b2Color.apply(this, arguments)
	}
	function F() {
		F.b2Settings.apply(this, arguments)
	}
	function G() {
		G.b2Mat22.apply(this, arguments),
		this.constructor === G && this.b2Mat22.apply(this, arguments)
	}
	function z() {
		z.b2Mat33.apply(this, arguments),
		this.constructor === z && this.b2Mat33.apply(this, arguments)
	}
	function E() {
		E.b2Math.apply(this, arguments)
	}
	function J() {
		J.b2Sweep.apply(this, arguments)
	}
	function O() {
		O.b2Transform.apply(this, arguments),
		this.constructor === O && this.b2Transform.apply(this, arguments)
	}
	function N() {
		N.b2Vec2.apply(this, arguments),
		this.constructor === N && this.b2Vec2.apply(this, arguments)
	}
	function W() {
		W.b2Vec3.apply(this, arguments),
		this.constructor === W && this.b2Vec3.apply(this, arguments)
	}
	function j() {
		j.b2Body.apply(this, arguments),
		this.constructor === j && this.b2Body.apply(this, arguments)
	}
	function U() {
		U.b2BodyDef.apply(this, arguments),
		this.constructor === U && this.b2BodyDef.apply(this, arguments)
	}
	function q() {
		q.b2ContactFilter.apply(this, arguments)
	}
	function X() {
		X.b2ContactImpulse.apply(this, arguments)
	}
	function Y() {
		Y.b2ContactListener.apply(this, arguments)
	}
	function H() {
		H.b2ContactManager.apply(this, arguments),
		this.constructor === H && this.b2ContactManager.apply(this, arguments)
	}
	function K() {
		K.b2DebugDraw.apply(this, arguments),
		this.constructor === K && this.b2DebugDraw.apply(this, arguments)
	}
	function Z() {
		Z.b2DestructionListener.apply(this, arguments)
	}
	function Q() {
		Q.b2FilterData.apply(this, arguments)
	}
	function $() {
		$.b2Fixture.apply(this, arguments),
		this.constructor === $ && this.b2Fixture.apply(this, arguments)
	}
	function te() {
		te.b2FixtureDef.apply(this, arguments),
		this.constructor === te && this.b2FixtureDef.apply(this, arguments)
	}
	function ee() {
		ee.b2Island.apply(this, arguments),
		this.constructor === ee && this.b2Island.apply(this, arguments)
	}
	function ie() {
		ie.b2TimeStep.apply(this, arguments)
	}
	function oe() {
		oe.b2World.apply(this, arguments),
		this.constructor === oe && this.b2World.apply(this, arguments)
	}
	function se() {
		se.b2CircleContact.apply(this, arguments)
	}
	function ne() {
		ne.b2Contact.apply(this, arguments),
		this.constructor === ne && this.b2Contact.apply(this, arguments)
	}
	function re() {
		re.b2ContactConstraint.apply(this, arguments),
		this.constructor === re && this.b2ContactConstraint.apply(this, arguments)
	}
	function ae() {
		ae.b2ContactConstraintPoint.apply(this, arguments)
	}
	function he() {
		he.b2ContactEdge.apply(this, arguments)
	}
	function le() {
		le.b2ContactFactory.apply(this, arguments),
		this.constructor === le && this.b2ContactFactory.apply(this, arguments)
	}
	function ce() {
		ce.b2ContactRegister.apply(this, arguments)
	}
	function me() {
		me.b2ContactResult.apply(this, arguments)
	}
	function _e() {
		_e.b2ContactSolver.apply(this, arguments),
		this.constructor === _e && this.b2ContactSolver.apply(this, arguments)
	}
	function ue() {
		ue.b2EdgeAndCircleContact.apply(this, arguments)
	}
	function pe() {
		pe.b2NullContact.apply(this, arguments),
		this.constructor === pe && this.b2NullContact.apply(this, arguments)
	}
	function ye() {
		ye.b2PolyAndCircleContact.apply(this, arguments)
	}
	function de() {
		de.b2PolyAndEdgeContact.apply(this, arguments)
	}
	function xe() {
		xe.b2PolygonContact.apply(this, arguments)
	}
	function fe() {
		fe.b2PositionSolverManifold.apply(this, arguments),
		this.constructor === fe && this.b2PositionSolverManifold.apply(this, arguments)
	}
	function ge() {
		ge.b2BuoyancyController.apply(this, arguments)
	}
	function ve() {
		ve.b2ConstantAccelController.apply(this, arguments)
	}
	function be() {
		be.b2ConstantForceController.apply(this, arguments)
	}
	function we() {
		we.b2Controller.apply(this, arguments)
	}
	function Ce() {
		Ce.b2ControllerEdge.apply(this, arguments)
	}
	function De() {
		De.b2GravityController.apply(this, arguments)
	}
	function Be() {
		Be.b2TensorDampingController.apply(this, arguments)
	}
	function Se() {
		Se.b2DistanceJoint.apply(this, arguments),
		this.constructor === Se && this.b2DistanceJoint.apply(this, arguments)
	}
	function Ie() {
		Ie.b2DistanceJointDef.apply(this, arguments),
		this.constructor === Ie && this.b2DistanceJointDef.apply(this, arguments)
	}
	function Ae() {
		Ae.b2FrictionJoint.apply(this, arguments),
		this.constructor === Ae && this.b2FrictionJoint.apply(this, arguments)
	}
	function Me() {
		Me.b2FrictionJointDef.apply(this, arguments),
		this.constructor === Me && this.b2FrictionJointDef.apply(this, arguments)
	}
	function Te() {
		Te.b2GearJoint.apply(this, arguments),
		this.constructor === Te && this.b2GearJoint.apply(this, arguments)
	}
	function Ve() {
		Ve.b2GearJointDef.apply(this, arguments),
		this.constructor === Ve && this.b2GearJointDef.apply(this, arguments)
	}
	function Pe() {
		Pe.b2Jacobian.apply(this, arguments)
	}
	function Re() {
		Re.b2Joint.apply(this, arguments),
		this.constructor === Re && this.b2Joint.apply(this, arguments)
	}
	function ke() {
		ke.b2JointDef.apply(this, arguments),
		this.constructor === ke && this.b2JointDef.apply(this, arguments)
	}
	function Le() {
		Le.b2JointEdge.apply(this, arguments)
	}
	function Fe() {
		Fe.b2LineJoint.apply(this, arguments),
		this.constructor === Fe && this.b2LineJoint.apply(this, arguments)
	}
	function Ge() {
		Ge.b2LineJointDef.apply(this, arguments),
		this.constructor === Ge && this.b2LineJointDef.apply(this, arguments)
	}
	function ze() {
		ze.b2MouseJoint.apply(this, arguments),
		this.constructor === ze && this.b2MouseJoint.apply(this, arguments)
	}
	function Ee() {
		Ee.b2MouseJointDef.apply(this, arguments),
		this.constructor === Ee && this.b2MouseJointDef.apply(this, arguments)
	}
	function Je() {
		Je.b2PrismaticJoint.apply(this, arguments),
		this.constructor === Je && this.b2PrismaticJoint.apply(this, arguments)
	}
	function Oe() {
		Oe.b2PrismaticJointDef.apply(this, arguments),
		this.constructor === Oe && this.b2PrismaticJointDef.apply(this, arguments)
	}
	function Ne() {
		Ne.b2PulleyJoint.apply(this, arguments),
		this.constructor === Ne && this.b2PulleyJoint.apply(this, arguments)
	}
	function We() {
		We.b2PulleyJointDef.apply(this, arguments),
		this.constructor === We && this.b2PulleyJointDef.apply(this, arguments)
	}
	function je() {
		je.b2RevoluteJoint.apply(this, arguments),
		this.constructor === je && this.b2RevoluteJoint.apply(this, arguments)
	}
	function Ue() {
		Ue.b2RevoluteJointDef.apply(this, arguments),
		this.constructor === Ue && this.b2RevoluteJointDef.apply(this, arguments)
	}
	function qe() {
		qe.b2WeldJoint.apply(this, arguments),
		this.constructor === qe && this.b2WeldJoint.apply(this, arguments)
	}
	function Xe() {
		Xe.b2WeldJointDef.apply(this, arguments),
		this.constructor === Xe && this.b2WeldJointDef.apply(this, arguments)
	}
	Box2D.Collision.IBroadPhase = "Box2D.Collision.IBroadPhase",
	Box2D.Collision.b2AABB = t,
	Box2D.Collision.b2Bound = e,
	Box2D.Collision.b2BoundValues = i,
	Box2D.Collision.b2Collision = o,
	Box2D.Collision.b2ContactID = s,
	Box2D.Collision.b2ContactPoint = n,
	Box2D.Collision.b2Distance = r,
	Box2D.Collision.b2DistanceInput = a,
	Box2D.Collision.b2DistanceOutput = h,
	Box2D.Collision.b2DistanceProxy = l,
	Box2D.Collision.b2DynamicTree = c,
	Box2D.Collision.b2DynamicTreeBroadPhase = m,
	Box2D.Collision.b2DynamicTreeNode = _,
	Box2D.Collision.b2DynamicTreePair = u,
	Box2D.Collision.b2Manifold = p,
	Box2D.Collision.b2ManifoldPoint = y,
	Box2D.Collision.b2Point = d,
	Box2D.Collision.b2RayCastInput = x,
	Box2D.Collision.b2RayCastOutput = f,
	Box2D.Collision.b2Segment = g,
	Box2D.Collision.b2SeparationFunction = v,
	Box2D.Collision.b2Simplex = b,
	Box2D.Collision.b2SimplexCache = w,
	Box2D.Collision.b2SimplexVertex = C,
	Box2D.Collision.b2TimeOfImpact = D,
	Box2D.Collision.b2TOIInput = B,
	Box2D.Collision.b2WorldManifold = S,
	Box2D.Collision.ClipVertex = I,
	Box2D.Collision.Features = A,
	Box2D.Collision.Shapes.b2CircleShape = M,
	Box2D.Collision.Shapes.b2EdgeChainDef = T,
	Box2D.Collision.Shapes.b2EdgeShape = V,
	Box2D.Collision.Shapes.b2MassData = P,
	Box2D.Collision.Shapes.b2PolygonShape = R,
	Box2D.Collision.Shapes.b2Shape = k,
	Box2D.Common.b2internal = "Box2D.Common.b2internal",
	Box2D.Common.b2Color = L,
	Box2D.Common.b2Settings = F,
	Box2D.Common.Math.b2Mat22 = G,
	Box2D.Common.Math.b2Mat33 = z,
	Box2D.Common.Math.b2Math = E,
	Box2D.Common.Math.b2Sweep = J,
	Box2D.Common.Math.b2Transform = O,
	Box2D.Common.Math.b2Vec2 = N,
	Box2D.Common.Math.b2Vec3 = W,
	Box2D.Dynamics.b2Body = j,
	Box2D.Dynamics.b2BodyDef = U,
	Box2D.Dynamics.b2ContactFilter = q,
	Box2D.Dynamics.b2ContactImpulse = X,
	Box2D.Dynamics.b2ContactListener = Y,
	Box2D.Dynamics.b2ContactManager = H,
	Box2D.Dynamics.b2DebugDraw = K,
	Box2D.Dynamics.b2DestructionListener = Z,
	Box2D.Dynamics.b2FilterData = Q,
	Box2D.Dynamics.b2Fixture = $,
	Box2D.Dynamics.b2FixtureDef = te,
	Box2D.Dynamics.b2Island = ee,
	Box2D.Dynamics.b2TimeStep = ie,
	Box2D.Dynamics.b2World = oe,
	Box2D.Dynamics.Contacts.b2CircleContact = se,
	Box2D.Dynamics.Contacts.b2Contact = ne,
	Box2D.Dynamics.Contacts.b2ContactConstraint = re,
	Box2D.Dynamics.Contacts.b2ContactConstraintPoint = ae,
	Box2D.Dynamics.Contacts.b2ContactEdge = he,
	Box2D.Dynamics.Contacts.b2ContactFactory = le,
	Box2D.Dynamics.Contacts.b2ContactRegister = ce,
	Box2D.Dynamics.Contacts.b2ContactResult = me,
	Box2D.Dynamics.Contacts.b2ContactSolver = _e,
	Box2D.Dynamics.Contacts.b2EdgeAndCircleContact = ue,
	Box2D.Dynamics.Contacts.b2NullContact = pe,
	Box2D.Dynamics.Contacts.b2PolyAndCircleContact = ye,
	Box2D.Dynamics.Contacts.b2PolyAndEdgeContact = de,
	Box2D.Dynamics.Contacts.b2PolygonContact = xe,
	Box2D.Dynamics.Contacts.b2PositionSolverManifold = fe,
	Box2D.Dynamics.Controllers.b2BuoyancyController = ge,
	Box2D.Dynamics.Controllers.b2ConstantAccelController = ve,
	Box2D.Dynamics.Controllers.b2ConstantForceController = be,
	Box2D.Dynamics.Controllers.b2Controller = we,
	Box2D.Dynamics.Controllers.b2ControllerEdge = Ce,
	Box2D.Dynamics.Controllers.b2GravityController = De,
	Box2D.Dynamics.Controllers.b2TensorDampingController = Be,
	Box2D.Dynamics.Joints.b2DistanceJoint = Se,
	Box2D.Dynamics.Joints.b2DistanceJointDef = Ie,
	Box2D.Dynamics.Joints.b2FrictionJoint = Ae,
	Box2D.Dynamics.Joints.b2FrictionJointDef = Me,
	Box2D.Dynamics.Joints.b2GearJoint = Te,
	Box2D.Dynamics.Joints.b2GearJointDef = Ve,
	Box2D.Dynamics.Joints.b2Jacobian = Pe,
	Box2D.Dynamics.Joints.b2Joint = Re,
	Box2D.Dynamics.Joints.b2JointDef = ke,
	Box2D.Dynamics.Joints.b2JointEdge = Le,
	Box2D.Dynamics.Joints.b2LineJoint = Fe,
	Box2D.Dynamics.Joints.b2LineJointDef = Ge,
	Box2D.Dynamics.Joints.b2MouseJoint = ze,
	Box2D.Dynamics.Joints.b2MouseJointDef = Ee,
	Box2D.Dynamics.Joints.b2PrismaticJoint = Je,
	Box2D.Dynamics.Joints.b2PrismaticJointDef = Oe,
	Box2D.Dynamics.Joints.b2PulleyJoint = Ne,
	Box2D.Dynamics.Joints.b2PulleyJointDef = We,
	Box2D.Dynamics.Joints.b2RevoluteJoint = je,
	Box2D.Dynamics.Joints.b2RevoluteJointDef = Ue,
	Box2D.Dynamics.Joints.b2WeldJoint = qe,
	Box2D.Dynamics.Joints.b2WeldJointDef = Xe
}
(), Box2D.postDefs = [], function () {
	var t = Box2D.Collision.Shapes.b2CircleShape,
	e = (Box2D.Collision.Shapes.b2EdgeChainDef, Box2D.Collision.Shapes.b2EdgeShape, Box2D.Collision.Shapes.b2MassData, Box2D.Collision.Shapes.b2PolygonShape),
	i = Box2D.Collision.Shapes.b2Shape,
	o = (Box2D.Common.b2Color, Box2D.Common.b2internal, Box2D.Common.b2Settings),
	s = (Box2D.Common.Math.b2Mat22, Box2D.Common.Math.b2Mat33, Box2D.Common.Math.b2Math),
	n = Box2D.Common.Math.b2Sweep,
	r = Box2D.Common.Math.b2Transform,
	a = Box2D.Common.Math.b2Vec2,
	h = (Box2D.Common.Math.b2Vec3, Box2D.Collision.b2AABB),
	l = Box2D.Collision.b2Bound,
	c = Box2D.Collision.b2BoundValues,
	m = Box2D.Collision.b2Collision,
	_ = Box2D.Collision.b2ContactID,
	u = Box2D.Collision.b2ContactPoint,
	p = Box2D.Collision.b2Distance,
	y = Box2D.Collision.b2DistanceInput,
	d = Box2D.Collision.b2DistanceOutput,
	x = Box2D.Collision.b2DistanceProxy,
	f = Box2D.Collision.b2DynamicTree,
	g = Box2D.Collision.b2DynamicTreeBroadPhase,
	v = Box2D.Collision.b2DynamicTreeNode,
	b = Box2D.Collision.b2DynamicTreePair,
	w = Box2D.Collision.b2Manifold,
	C = Box2D.Collision.b2ManifoldPoint,
	D = Box2D.Collision.b2Point,
	B = Box2D.Collision.b2RayCastInput,
	S = Box2D.Collision.b2RayCastOutput,
	I = Box2D.Collision.b2Segment,
	A = Box2D.Collision.b2SeparationFunction,
	M = Box2D.Collision.b2Simplex,
	T = Box2D.Collision.b2SimplexCache,
	V = Box2D.Collision.b2SimplexVertex,
	P = Box2D.Collision.b2TimeOfImpact,
	R = Box2D.Collision.b2TOIInput,
	k = Box2D.Collision.b2WorldManifold,
	L = Box2D.Collision.ClipVertex,
	F = Box2D.Collision.Features,
	G = Box2D.Collision.IBroadPhase;
	h.b2AABB = function () {
		this.lowerBound = new a,
		this.upperBound = new a
	},
	h.prototype.IsValid = function () {
		var t = this.upperBound.x - this.lowerBound.x,
		e = this.upperBound.y - this.lowerBound.y,
		i = t >= 0 && e >= 0;
		return i = i && this.lowerBound.IsValid() && this.upperBound.IsValid()
	},
	h.prototype.GetCenter = function () {
		return new a((this.lowerBound.x + this.upperBound.x) / 2, (this.lowerBound.y + this.upperBound.y) / 2)
	},
	h.prototype.GetExtents = function () {
		return new a((this.upperBound.x - this.lowerBound.x) / 2, (this.upperBound.y - this.lowerBound.y) / 2)
	},
	h.prototype.Contains = function (t) {
		var e = !0;
		return e = e && t.lowerBound.x >= this.lowerBound.x,
		e = e && t.lowerBound.y >= this.lowerBound.y,
		e = e && this.upperBound.x >= t.upperBound.x,
		e = e && this.upperBound.y >= t.upperBound.y
	},
	h.prototype.RayCast = function (t, e) {
		var i = -Number.MAX_VALUE,
		o = Number.MAX_VALUE,
		s = e.p1.x,
		n = e.p1.y,
		r = e.p2.x - e.p1.x,
		a = e.p2.y - e.p1.y,
		h = Math.abs(r),
		l = Math.abs(a),
		c = t.normal,
		m = 0,
		_ = 0,
		u = 0,
		p = 0,
		y = 0;
		if (Number.MIN_VALUE > h) {
			if (this.lowerBound.x > s || s > this.upperBound.x)
				return !1
		} else if (m = 1 / r, _ = (this.lowerBound.x - s) * m, u = (this.upperBound.x - s) * m, y = -1, _ > u && (p = _, _ = u, u = p, y = 1), _ > i && (c.x = y, c.y = 0, i = _), o = Math.min(o, u), i > o)
			return !1;
		if (Number.MIN_VALUE > l) {
			if (this.lowerBound.y > n || n > this.upperBound.y)
				return !1
		} else if (m = 1 / a, _ = (this.lowerBound.y - n) * m, u = (this.upperBound.y - n) * m, y = -1, _ > u && (p = _, _ = u, u = p, y = 1), _ > i && (c.y = y, c.x = 0, i = _), o = Math.min(o, u), i > o)
			return !1;
		return t.fraction = i,
		!0
	},
	h.prototype.TestOverlap = function (t) {
		var e = t.lowerBound.x - this.upperBound.x,
		i = t.lowerBound.y - this.upperBound.y,
		o = this.lowerBound.x - t.upperBound.x,
		s = this.lowerBound.y - t.upperBound.y;
		return e > 0 || i > 0 ? !1 : o > 0 || s > 0 ? !1 : !0
	},
	h.Combine = function (t, e) {
		var i = new h;
		return i.Combine(t, e),
		i
	},
	h.prototype.Combine = function (t, e) {
		this.lowerBound.x = Math.min(t.lowerBound.x, e.lowerBound.x),
		this.lowerBound.y = Math.min(t.lowerBound.y, e.lowerBound.y),
		this.upperBound.x = Math.max(t.upperBound.x, e.upperBound.x),
		this.upperBound.y = Math.max(t.upperBound.y, e.upperBound.y)
	},
	l.b2Bound = function () {},
	l.prototype.IsLower = function () {
		return (this.value & 1) == 0
	},
	l.prototype.IsUpper = function () {
		return (this.value & 1) == 1
	},
	l.prototype.Swap = function (t) {
		var e = this.value,
		i = this.proxy,
		o = this.stabbingCount;
		this.value = t.value,
		this.proxy = t.proxy,
		this.stabbingCount = t.stabbingCount,
		t.value = e,
		t.proxy = i,
		t.stabbingCount = o
	},
	c.b2BoundValues = function () {},
	c.prototype.b2BoundValues = function () {
		this.lowerValues = new Vector_a2j_Number,
		this.lowerValues[0] = 0,
		this.lowerValues[1] = 0,
		this.upperValues = new Vector_a2j_Number,
		this.upperValues[0] = 0,
		this.upperValues[1] = 0
	},
	m.b2Collision = function () {},
	m.ClipSegmentToLine = function (t, e, i, o) {
		o === void 0 && (o = 0);
		var s,
		n = 0;
		s = e[0];
		var r = s.v;
		s = e[1];
		var a = s.v,
		h = i.x * r.x + i.y * r.y - o,
		l = i.x * a.x + i.y * a.y - o;
		if (h > 0 || t[n++].Set(e[0]), l > 0 || t[n++].Set(e[1]), 0 > h * l) {
			var c = h / (h - l);
			s = t[n];
			var m = s.v;
			m.x = r.x + c * (a.x - r.x),
			m.y = r.y + c * (a.y - r.y),
			s = t[n];
			var _;
			h > 0 ? (_ = e[0], s.id = _.id) : (_ = e[1], s.id = _.id),
			++n
		}
		return n
	},
	m.EdgeSeparation = function (t, e, i, o, s) {
		i === void 0 && (i = 0),
		parseInt(t.m_vertexCount);
		var n,
		r,
		a = t.m_vertices,
		h = t.m_normals,
		l = parseInt(o.m_vertexCount),
		c = o.m_vertices;
		n = e.R,
		r = h[i];
		var m = n.col1.x * r.x + n.col2.x * r.y,
		_ = n.col1.y * r.x + n.col2.y * r.y;
		n = s.R;
		for (var u = n.col1.x * m + n.col1.y * _, p = n.col2.x * m + n.col2.y * _, y = 0, d = Number.MAX_VALUE, x = 0; l > x; ++x) {
			r = c[x];
			var f = r.x * u + r.y * p;
			d > f && (d = f, y = x)
		}
		r = a[i],
		n = e.R;
		var g = e.position.x + (n.col1.x * r.x + n.col2.x * r.y),
		v = e.position.y + (n.col1.y * r.x + n.col2.y * r.y);
		r = c[y],
		n = s.R;
		var b = s.position.x + (n.col1.x * r.x + n.col2.x * r.y),
		w = s.position.y + (n.col1.y * r.x + n.col2.y * r.y);
		b -= g,
		w -= v;
		var C = b * m + w * _;
		return C
	},
	m.FindMaxSeparation = function (t, e, i, o, s) {
		var n,
		r,
		a = parseInt(e.m_vertexCount),
		h = e.m_normals;
		r = s.R,
		n = o.m_centroid;
		var l = s.position.x + (r.col1.x * n.x + r.col2.x * n.y),
		c = s.position.y + (r.col1.y * n.x + r.col2.y * n.y);
		r = i.R,
		n = e.m_centroid,
		l -= i.position.x + (r.col1.x * n.x + r.col2.x * n.y),
		c -= i.position.y + (r.col1.y * n.x + r.col2.y * n.y);
		for (var _ = l * i.R.col1.x + c * i.R.col1.y, u = l * i.R.col2.x + c * i.R.col2.y, p = 0, y = -Number.MAX_VALUE, d = 0; a > d; ++d) {
			n = h[d];
			var x = n.x * _ + n.y * u;
			x > y && (y = x, p = d)
		}
		var f = m.EdgeSeparation(e, i, p, o, s),
		g = parseInt(0 > p - 1 ? a - 1 : p - 1),
		v = m.EdgeSeparation(e, i, g, o, s),
		b = parseInt(a > p + 1 ? p + 1 : 0),
		w = m.EdgeSeparation(e, i, b, o, s),
		C = 0,
		D = 0,
		B = 0;
		if (v > f && v > w)
			B = -1, C = g, D = v;
		else {
			if (f >= w)
				return t[0] = p, f;
			B = 1,
			C = b,
			D = w
		}
		for (; ; ) {
			if (p = B == -1 ? 0 > C - 1 ? a - 1 : C - 1 : a > C + 1 ? C + 1 : 0, f = m.EdgeSeparation(e, i, p, o, s), D >= f)
				break;
			C = p,
			D = f
		}
		return t[0] = C,
		D
	},
	m.FindIncidentEdge = function (t, e, i, o, s, n) {
		o === void 0 && (o = 0),
		parseInt(e.m_vertexCount);
		var r,
		a,
		h = e.m_normals,
		l = parseInt(s.m_vertexCount),
		c = s.m_vertices,
		m = s.m_normals;
		r = i.R,
		a = h[o];
		var _ = r.col1.x * a.x + r.col2.x * a.y,
		u = r.col1.y * a.x + r.col2.y * a.y;
		r = n.R;
		var p = r.col1.x * _ + r.col1.y * u;
		u = r.col2.x * _ + r.col2.y * u,
		_ = p;
		for (var y = 0, d = Number.MAX_VALUE, x = 0; l > x; ++x) {
			a = m[x];
			var f = _ * a.x + u * a.y;
			d > f && (d = f, y = x)
		}
		var g,
		v = parseInt(y),
		b = parseInt(l > v + 1 ? v + 1 : 0);
		g = t[0],
		a = c[v],
		r = n.R,
		g.v.x = n.position.x + (r.col1.x * a.x + r.col2.x * a.y),
		g.v.y = n.position.y + (r.col1.y * a.x + r.col2.y * a.y),
		g.id.features.referenceEdge = o,
		g.id.features.incidentEdge = v,
		g.id.features.incidentVertex = 0,
		g = t[1],
		a = c[b],
		r = n.R,
		g.v.x = n.position.x + (r.col1.x * a.x + r.col2.x * a.y),
		g.v.y = n.position.y + (r.col1.y * a.x + r.col2.y * a.y),
		g.id.features.referenceEdge = o,
		g.id.features.incidentEdge = b,
		g.id.features.incidentVertex = 1
	},
	m.MakeClipPointVector = function () {
		var t = new Vector(2);
		return t[0] = new L,
		t[1] = new L,
		t
	},
	m.CollidePolygons = function (t, e, i, s, n) {
		var r;
		t.m_pointCount = 0;
		var a = e.m_radius + s.m_radius,
		h = 0;
		m.s_edgeAO[0] = h;
		var l = m.FindMaxSeparation(m.s_edgeAO, e, i, s, n);
		if (h = m.s_edgeAO[0], a >= l) {
			var c = 0;
			m.s_edgeBO[0] = c;
			var _ = m.FindMaxSeparation(m.s_edgeBO, s, n, e, i);
			if (c = m.s_edgeBO[0], a >= _) {
				var u,
				p,
				y,
				d,
				x,
				f = 0,
				g = 0,
				v = .98,
				b = .001;
				_ > v * l + b ? (u = s, p = e, y = n, d = i, f = c, t.m_type = w.e_faceB, g = 1) : (u = e, p = s, y = i, d = n, f = h, t.m_type = w.e_faceA, g = 0);
				var C = m.s_incidentEdge;
				m.FindIncidentEdge(C, u, y, f, p, d);
				var D,
				B = parseInt(u.m_vertexCount),
				S = u.m_vertices,
				I = S[f];
				D = B > f + 1 ? S[parseInt(f + 1)] : S[0];
				var A = m.s_localTangent;
				A.Set(D.x - I.x, D.y - I.y),
				A.Normalize();
				var M = m.s_localNormal;
				M.x = A.y,
				M.y = -A.x;
				var T = m.s_planePoint;
				T.Set(.5 * (I.x + D.x), .5 * (I.y + D.y));
				var V = m.s_tangent;
				x = y.R,
				V.x = x.col1.x * A.x + x.col2.x * A.y,
				V.y = x.col1.y * A.x + x.col2.y * A.y;
				var P = m.s_tangent2;
				P.x = -V.x,
				P.y = -V.y;
				var R = m.s_normal;
				R.x = V.y,
				R.y = -V.x;
				var k = m.s_v11,
				L = m.s_v12;
				k.x = y.position.x + (x.col1.x * I.x + x.col2.x * I.y),
				k.y = y.position.y + (x.col1.y * I.x + x.col2.y * I.y),
				L.x = y.position.x + (x.col1.x * D.x + x.col2.x * D.y),
				L.y = y.position.y + (x.col1.y * D.x + x.col2.y * D.y);
				var F = R.x * k.x + R.y * k.y,
				G = -V.x * k.x - V.y * k.y + a,
				z = V.x * L.x + V.y * L.y + a,
				E = m.s_clipPoints1,
				J = m.s_clipPoints2,
				O = 0;
				if (O = m.ClipSegmentToLine(E, C, P, G), O >= 2 && (O = m.ClipSegmentToLine(J, E, V, z), O >= 2)) {
					t.m_localPlaneNormal.SetV(M),
					t.m_localPoint.SetV(T);
					for (var N = 0, W = 0; o.b2_maxManifoldPoints > W; ++W) {
						r = J[W];
						var j = R.x * r.v.x + R.y * r.v.y - F;
						if (a >= j) {
							var U = t.m_points[N];
							x = d.R;
							var q = r.v.x - d.position.x,
							X = r.v.y - d.position.y;
							U.m_localPoint.x = q * x.col1.x + X * x.col1.y,
							U.m_localPoint.y = q * x.col2.x + X * x.col2.y,
							U.m_id.Set(r.id),
							U.m_id.features.flip = g,
							++N
						}
					}
					t.m_pointCount = N
				}
			}
		}
	},
	m.CollideCircles = function (t, e, i, o, s) {
		t.m_pointCount = 0;
		var n,
		r;
		n = i.R,
		r = e.m_p;
		var a = i.position.x + (n.col1.x * r.x + n.col2.x * r.y),
		h = i.position.y + (n.col1.y * r.x + n.col2.y * r.y);
		n = s.R,
		r = o.m_p;
		var l = s.position.x + (n.col1.x * r.x + n.col2.x * r.y),
		c = s.position.y + (n.col1.y * r.x + n.col2.y * r.y),
		m = l - a,
		_ = c - h,
		u = m * m + _ * _,
		p = e.m_radius + o.m_radius;
		u > p * p || (t.m_type = w.e_circles, t.m_localPoint.SetV(e.m_p), t.m_localPlaneNormal.SetZero(), t.m_pointCount = 1, t.m_points[0].m_localPoint.SetV(o.m_p), t.m_points[0].m_id.key = 0)
	},
	m.CollidePolygonAndCircle = function (t, e, i, o, s) {
		t.m_pointCount = 0;
		var n,
		r,
		a = 0,
		h = 0;
		r = s.R,
		n = o.m_p;
		var l = s.position.x + (r.col1.x * n.x + r.col2.x * n.y),
		c = s.position.y + (r.col1.y * n.x + r.col2.y * n.y);
		a = l - i.position.x,
		h = c - i.position.y,
		r = i.R;
		for (var m = a * r.col1.x + h * r.col1.y, _ = a * r.col2.x + h * r.col2.y, u = 0, p = -Number.MAX_VALUE, y = e.m_radius + o.m_radius, d = parseInt(e.m_vertexCount), x = e.m_vertices, f = e.m_normals, g = 0; d > g; ++g) {
			n = x[g],
			a = m - n.x,
			h = _ - n.y,
			n = f[g];
			var v = n.x * a + n.y * h;
			if (v > y)
				return;
			v > p && (p = v, u = g)
		}
		var b = parseInt(u),
		C = parseInt(d > b + 1 ? b + 1 : 0),
		D = x[b],
		B = x[C];
		if (Number.MIN_VALUE > p)
			return t.m_pointCount = 1, t.m_type = w.e_faceA, t.m_localPlaneNormal.SetV(f[u]), t.m_localPoint.x = .5 * (D.x + B.x), t.m_localPoint.y = .5 * (D.y + B.y), t.m_points[0].m_localPoint.SetV(o.m_p), t.m_points[0].m_id.key = 0, void 0;
		var S = (m - D.x) * (B.x - D.x) + (_ - D.y) * (B.y - D.y),
		I = (m - B.x) * (D.x - B.x) + (_ - B.y) * (D.y - B.y);
		if (0 < S)
			if (0 < I) {
				var A = .5 * (D.x + B.x),
				M = .5 * (D.y + B.y);
				if (p = (m - A) * f[b].x + (_ - M) * f[b].y, p > y)
					return;
				t.m_pointCount = 1,
				t.m_type = w.e_faceA,
				t.m_localPlaneNormal.x = f[b].x,
				t.m_localPlaneNormal.y = f[b].y,
				t.m_localPlaneNormal.Normalize(),
				t.m_localPoint.Set(A, M),
				t.m_points[0].m_localPoint.SetV(o.m_p),
				t.m_points[0].m_id.key = 0
			} else {
				if ((m - B.x) * (m - B.x) + (_ - B.y) * (_ - B.y) > y * y)
					return;
				t.m_pointCount = 1,
				t.m_type = w.e_faceA,
				t.m_localPlaneNormal.x = m - B.x,
				t.m_localPlaneNormal.y = _ - B.y,
				t.m_localPlaneNormal.Normalize(),
				t.m_localPoint.SetV(B),
				t.m_points[0].m_localPoint.SetV(o.m_p),
				t.m_points[0].m_id.key = 0
			}
		else {
			if ((m - D.x) * (m - D.x) + (_ - D.y) * (_ - D.y) > y * y)
				return;
			t.m_pointCount = 1,
			t.m_type = w.e_faceA,
			t.m_localPlaneNormal.x = m - D.x,
			t.m_localPlaneNormal.y = _ - D.y,
			t.m_localPlaneNormal.Normalize(),
			t.m_localPoint.SetV(D),
			t.m_points[0].m_localPoint.SetV(o.m_p),
			t.m_points[0].m_id.key = 0
		}
	},
	m.TestOverlap = function (t, e) {
		var i = e.lowerBound,
		o = t.upperBound,
		s = i.x - o.x,
		n = i.y - o.y;
		i = t.lowerBound,
		o = e.upperBound;
		var r = i.x - o.x,
		a = i.y - o.y;
		return s > 0 || n > 0 ? !1 : r > 0 || a > 0 ? !1 : !0
	},
	Box2D.postDefs.push(function () {
		Box2D.Collision.b2Collision.s_incidentEdge = m.MakeClipPointVector(),
		Box2D.Collision.b2Collision.s_clipPoints1 = m.MakeClipPointVector(),
		Box2D.Collision.b2Collision.s_clipPoints2 = m.MakeClipPointVector(),
		Box2D.Collision.b2Collision.s_edgeAO = new Vector_a2j_Number(1),
		Box2D.Collision.b2Collision.s_edgeBO = new Vector_a2j_Number(1),
		Box2D.Collision.b2Collision.s_localTangent = new a,
		Box2D.Collision.b2Collision.s_localNormal = new a,
		Box2D.Collision.b2Collision.s_planePoint = new a,
		Box2D.Collision.b2Collision.s_normal = new a,
		Box2D.Collision.b2Collision.s_tangent = new a,
		Box2D.Collision.b2Collision.s_tangent2 = new a,
		Box2D.Collision.b2Collision.s_v11 = new a,
		Box2D.Collision.b2Collision.s_v12 = new a,
		Box2D.Collision.b2Collision.b2CollidePolyTempVec = new a,
		Box2D.Collision.b2Collision.b2_nullFeature = 255
	}),
	_.b2ContactID = function () {
		this.features = new F
	},
	_.prototype.b2ContactID = function () {
		this.features._m_id = this
	},
	_.prototype.Set = function (t) {
		this.key = t._key
	},
	_.prototype.Copy = function () {
		var t = new _;
		return t.key = this.key,
		t
	},
	Object.defineProperty(_.prototype, "key", {
		enumerable : !1,
		configurable : !0,
		get : function () {
			return this._key
		}
	}),
	Object.defineProperty(_.prototype, "key", {
		enumerable : !1,
		configurable : !0,
		set : function (t) {
			t === void 0 && (t = 0),
			this._key = t,
			this.features._referenceEdge = this._key & 255,
			this.features._incidentEdge = (this._key & 65280) >> 8 & 255,
			this.features._incidentVertex = (this._key & 16711680) >> 16 & 255,
			this.features._flip = (this._key & 4278190080) >> 24 & 255
		}
	}),
	u.b2ContactPoint = function () {
		this.position = new a,
		this.velocity = new a,
		this.normal = new a,
		this.id = new _
	},
	p.b2Distance = function () {},
	p.Distance = function (t, e, i) {
		++p.b2_gjkCalls;
		var n = i.proxyA,
		r = i.proxyB,
		h = i.transformA,
		l = i.transformB,
		c = p.s_simplex;
		c.ReadCache(e, n, h, r, l);
		var m,
		_ = c.m_vertices,
		u = 20,
		y = p.s_saveA,
		d = p.s_saveB,
		x = 0,
		f = c.GetClosestPoint(),
		g = f.LengthSquared(),
		v = g,
		b = 0,
		w = 0;
		while (u > w) {
			for (x = c.m_count, b = 0; x > b; b++)
				y[b] = _[b].indexA, d[b] = _[b].indexB;
			switch (c.m_count) {
			case 1:
				break;
			case 2:
				c.Solve2();
				break;
			case 3:
				c.Solve3();
				break;
			default:
				o.b2Assert(!1)
			}
			if (c.m_count == 3)
				break;
			m = c.GetClosestPoint(),
			v = m.LengthSquared(),
			g = v;
			var C = c.GetSearchDirection();
			if (Number.MIN_VALUE * Number.MIN_VALUE > C.LengthSquared())
				break;
			var D = _[c.m_count];
			D.indexA = n.GetSupport(s.MulTMV(h.R, C.GetNegative())),
			D.wA = s.MulX(h, n.GetVertex(D.indexA)),
			D.indexB = r.GetSupport(s.MulTMV(l.R, C)),
			D.wB = s.MulX(l, r.GetVertex(D.indexB)),
			D.w = s.SubtractVV(D.wB, D.wA),
			++w,
			++p.b2_gjkIters;
			var B = !1;
			for (b = 0; x > b; b++)
				if (D.indexA == y[b] && D.indexB == d[b]) {
					B = !0;
					break
				}
			if (B)
				break;
			++c.m_count
		}
		if (p.b2_gjkMaxIters = s.Max(p.b2_gjkMaxIters, w), c.GetWitnessPoints(t.pointA, t.pointB), t.distance = s.SubtractVV(t.pointA, t.pointB).Length(), t.iterations = w, c.WriteCache(e), i.useRadii) {
			var S = n.m_radius,
			I = r.m_radius;
			if (t.distance > S + I && t.distance > Number.MIN_VALUE) {
				t.distance -= S + I;
				var A = s.SubtractVV(t.pointB, t.pointA);
				A.Normalize(),
				t.pointA.x += S * A.x,
				t.pointA.y += S * A.y,
				t.pointB.x -= I * A.x,
				t.pointB.y -= I * A.y
			} else
				m = new a, m.x = .5 * (t.pointA.x + t.pointB.x), m.y = .5 * (t.pointA.y + t.pointB.y), t.pointA.x = t.pointB.x = m.x, t.pointA.y = t.pointB.y = m.y, t.distance = 0
		}
	},
	Box2D.postDefs.push(function () {
		Box2D.Collision.b2Distance.s_simplex = new M,
		Box2D.Collision.b2Distance.s_saveA = new Vector_a2j_Number(3),
		Box2D.Collision.b2Distance.s_saveB = new Vector_a2j_Number(3)
	}),
	y.b2DistanceInput = function () {},
	d.b2DistanceOutput = function () {
		this.pointA = new a,
		this.pointB = new a
	},
	x.b2DistanceProxy = function () {},
	x.prototype.Set = function (s) {
		switch (s.GetType()) {
		case i.e_circleShape:
			var n = s instanceof t ? s : null;
			this.m_vertices = new Vector(1, !0),
			this.m_vertices[0] = n.m_p,
			this.m_count = 1,
			this.m_radius = n.m_radius;
			break;
		case i.e_polygonShape:
			var r = s instanceof e ? s : null;
			this.m_vertices = r.m_vertices,
			this.m_count = r.m_vertexCount,
			this.m_radius = r.m_radius;
			break;
		default:
			o.b2Assert(!1)
		}
	},
	x.prototype.GetSupport = function (t) {
		for (var e = 0, i = this.m_vertices[0].x * t.x + this.m_vertices[0].y * t.y, o = 1; this.m_count > o; ++o) {
			var s = this.m_vertices[o].x * t.x + this.m_vertices[o].y * t.y;
			s > i && (e = o, i = s)
		}
		return e
	},
	x.prototype.GetSupportVertex = function (t) {
		for (var e = 0, i = this.m_vertices[0].x * t.x + this.m_vertices[0].y * t.y, o = 1; this.m_count > o; ++o) {
			var s = this.m_vertices[o].x * t.x + this.m_vertices[o].y * t.y;
			s > i && (e = o, i = s)
		}
		return this.m_vertices[e]
	},
	x.prototype.GetVertexCount = function () {
		return this.m_count
	},
	x.prototype.GetVertex = function (t) {
		return t === void 0 && (t = 0),
		o.b2Assert(t >= 0 && this.m_count > t),
		this.m_vertices[t]
	},
	f.b2DynamicTree = function () {},
	f.prototype.b2DynamicTree = function () {
		this.m_root = null,
		this.m_freeList = null,
		this.m_path = 0,
		this.m_insertionCount = 0
	},
	f.prototype.CreateProxy = function (t, e) {
		var i = this.AllocateNode(),
		s = o.b2_aabbExtension,
		n = o.b2_aabbExtension;
		return i.aabb.lowerBound.x = t.lowerBound.x - s,
		i.aabb.lowerBound.y = t.lowerBound.y - n,
		i.aabb.upperBound.x = t.upperBound.x + s,
		i.aabb.upperBound.y = t.upperBound.y + n,
		i.userData = e,
		this.InsertLeaf(i),
		i
	},
	f.prototype.DestroyProxy = function (t) {
		this.RemoveLeaf(t),
		this.FreeNode(t)
	},
	f.prototype.MoveProxy = function (t, e, i) {
		if (o.b2Assert(t.IsLeaf()), t.aabb.Contains(e))
			return !1;
		this.RemoveLeaf(t);
		var s = o.b2_aabbExtension + o.b2_aabbMultiplier * (i.x > 0 ? i.x : -i.x),
		n = o.b2_aabbExtension + o.b2_aabbMultiplier * (i.y > 0 ? i.y : -i.y);
		return t.aabb.lowerBound.x = e.lowerBound.x - s,
		t.aabb.lowerBound.y = e.lowerBound.y - n,
		t.aabb.upperBound.x = e.upperBound.x + s,
		t.aabb.upperBound.y = e.upperBound.y + n,
		this.InsertLeaf(t),
		!0
	},
	f.prototype.Rebalance = function (t) {
		if (t === void 0 && (t = 0), this.m_root != null)
			for (var e = 0; t > e; e++) {
				var i = this.m_root,
				o = 0;
				while (i.IsLeaf() == 0)
					i = this.m_path >> o & 1 ? i.child2 : i.child1, o = o + 1 & 31;
				++this.m_path,
				this.RemoveLeaf(i),
				this.InsertLeaf(i)
			}
	},
	f.prototype.GetFatAABB = function (t) {
		return t.aabb
	},
	f.prototype.GetUserData = function (t) {
		return t.userData
	},
	f.prototype.Query = function (t, e) {
		if (this.m_root != null) {
			var i = new Vector,
			o = 0;
			i[o++] = this.m_root;
			while (o > 0) {
				var s = i[--o];
				if (s.aabb.TestOverlap(e))
					if (s.IsLeaf()) {
						var n = t(s);
						if (!n)
							return
					} else
						i[o++] = s.child1, i[o++] = s.child2
			}
		}
	},
	f.prototype.RayCast = function (t, e) {
		if (this.m_root != null) {
			var i = e.p1,
			o = e.p2,
			n = s.SubtractVV(i, o);
			n.Normalize();
			var r = s.CrossFV(1, n),
			a = s.AbsV(r),
			l = e.maxFraction,
			c = new h,
			m = 0,
			_ = 0;
			m = i.x + l * (o.x - i.x),
			_ = i.y + l * (o.y - i.y),
			c.lowerBound.x = Math.min(i.x, m),
			c.lowerBound.y = Math.min(i.y, _),
			c.upperBound.x = Math.max(i.x, m),
			c.upperBound.y = Math.max(i.y, _);
			var u = new Vector,
			p = 0;
			u[p++] = this.m_root;
			while (p > 0) {
				var y = u[--p];
				if (y.aabb.TestOverlap(c) != 0) {
					var d = y.aabb.GetCenter(),
					x = y.aabb.GetExtents(),
					f = Math.abs(r.x * (i.x - d.x) + r.y * (i.y - d.y)) - a.x * x.x - a.y * x.y;
					if (0 >= f)
						if (y.IsLeaf()) {
							var g = new B;
							if (g.p1 = e.p1, g.p2 = e.p2, g.maxFraction = e.maxFraction, l = t(g, y), l == 0)
								return;
							l > 0 && (m = i.x + l * (o.x - i.x), _ = i.y + l * (o.y - i.y), c.lowerBound.x = Math.min(i.x, m), c.lowerBound.y = Math.min(i.y, _), c.upperBound.x = Math.max(i.x, m), c.upperBound.y = Math.max(i.y, _))
						} else
							u[p++] = y.child1, u[p++] = y.child2
				}
			}
		}
	},
	f.prototype.AllocateNode = function () {
		if (this.m_freeList) {
			var t = this.m_freeList;
			return this.m_freeList = t.parent,
			t.parent = null,
			t.child1 = null,
			t.child2 = null,
			t
		}
		return new v
	},
	f.prototype.FreeNode = function (t) {
		t.parent = this.m_freeList,
		this.m_freeList = t
	},
	f.prototype.InsertLeaf = function (t) {
		if (++this.m_insertionCount, this.m_root == null)
			return this.m_root = t, this.m_root.parent = null, void 0;
		var e = t.aabb.GetCenter(),
		i = this.m_root;
		if (i.IsLeaf() == 0)
			do {
				var o = i.child1,
				s = i.child2,
				n = Math.abs((o.aabb.lowerBound.x + o.aabb.upperBound.x) / 2 - e.x) + Math.abs((o.aabb.lowerBound.y + o.aabb.upperBound.y) / 2 - e.y),
				r = Math.abs((s.aabb.lowerBound.x + s.aabb.upperBound.x) / 2 - e.x) + Math.abs((s.aabb.lowerBound.y + s.aabb.upperBound.y) / 2 - e.y);
				i = r > n ? o : s
			} while (i.IsLeaf() == 0);
		var a = i.parent,
		h = this.AllocateNode();
		if (h.parent = a, h.userData = null, h.aabb.Combine(t.aabb, i.aabb), a) {
			i.parent.child1 == i ? a.child1 = h : a.child2 = h,
			h.child1 = i,
			h.child2 = t,
			i.parent = h,
			t.parent = h;
			do {
				if (a.aabb.Contains(h.aabb))
					break;
				a.aabb.Combine(a.child1.aabb, a.child2.aabb),
				h = a,
				a = a.parent
			} while (a)
		} else
			h.child1 = i, h.child2 = t, i.parent = h, t.parent = h, this.m_root = h
	},
	f.prototype.RemoveLeaf = function (t) {
		if (t == this.m_root)
			return this.m_root = null, void 0;
		var e,
		i = t.parent,
		o = i.parent;
		if (e = i.child1 == t ? i.child2 : i.child1, o) {
			o.child1 == i ? o.child1 = e : o.child2 = e,
			e.parent = o,
			this.FreeNode(i);
			while (o) {
				var s = o.aabb;
				if (o.aabb = h.Combine(o.child1.aabb, o.child2.aabb), s.Contains(o.aabb))
					break;
				o = o.parent
			}
		} else
			this.m_root = e, e.parent = null, this.FreeNode(i)
	},
	g.b2DynamicTreeBroadPhase = function () {
		this.m_tree = new f,
		this.m_moveBuffer = new Vector,
		this.m_pairBuffer = new Vector,
		this.m_pairCount = 0
	},
	g.prototype.CreateProxy = function (t, e) {
		var i = this.m_tree.CreateProxy(t, e);
		return ++this.m_proxyCount,
		this.BufferMove(i),
		i
	},
	g.prototype.DestroyProxy = function (t) {
		this.UnBufferMove(t),
		--this.m_proxyCount,
		this.m_tree.DestroyProxy(t)
	},
	g.prototype.MoveProxy = function (t, e, i) {
		var o = this.m_tree.MoveProxy(t, e, i);
		o && this.BufferMove(t)
	},
	g.prototype.TestOverlap = function (t, e) {
		var i = this.m_tree.GetFatAABB(t),
		o = this.m_tree.GetFatAABB(e);
		return i.TestOverlap(o)
	},
	g.prototype.GetUserData = function (t) {
		return this.m_tree.GetUserData(t)
	},
	g.prototype.GetFatAABB = function (t) {
		return this.m_tree.GetFatAABB(t)
	},
	g.prototype.GetProxyCount = function () {
		return this.m_proxyCount
	},
	g.prototype.UpdatePairs = function (t) {
		function e(t) {
			if (t == o)
				return !0;
			i.m_pairCount == i.m_pairBuffer.length && (i.m_pairBuffer[i.m_pairCount] = new b);
			var e = i.m_pairBuffer[i.m_pairCount];
			return e.proxyA = o > t ? t : o,
			e.proxyB = o > t ? o : t,
			++i.m_pairCount,
			!0
		}
		var i = this;
		i.m_pairCount = 0;
		var o,
		s = 0;
		for (s = 0; i.m_moveBuffer.length > s; ++s) {
			o = i.m_moveBuffer[s];
			var n = i.m_tree.GetFatAABB(o);
			i.m_tree.Query(e, n)
		}
		i.m_moveBuffer.length = 0;
		for (var s = 0; i.m_pairCount > s; ) {
			var r = i.m_pairBuffer[s],
			a = i.m_tree.GetUserData(r.proxyA),
			h = i.m_tree.GetUserData(r.proxyB);
			t(a, h),
			++s;
			while (i.m_pairCount > s) {
				var l = i.m_pairBuffer[s];
				if (l.proxyA != r.proxyA || l.proxyB != r.proxyB)
					break;
				++s
			}
		}
	},
	g.prototype.Query = function (t, e) {
		this.m_tree.Query(t, e)
	},
	g.prototype.RayCast = function (t, e) {
		this.m_tree.RayCast(t, e)
	},
	g.prototype.Validate = function () {},
	g.prototype.Rebalance = function (t) {
		t === void 0 && (t = 0),
		this.m_tree.Rebalance(t)
	},
	g.prototype.BufferMove = function (t) {
		this.m_moveBuffer[this.m_moveBuffer.length] = t
	},
	g.prototype.UnBufferMove = function (t) {
		var e = parseInt(this.m_moveBuffer.indexOf(t));
		this.m_moveBuffer.splice(e, 1)
	},
	g.prototype.ComparePairs = function () {
		return 0
	},
	g.__implements = {},
	g.__implements[G] = !0,
	v.b2DynamicTreeNode = function () {
		this.aabb = new h
	},
	v.prototype.IsLeaf = function () {
		return this.child1 == null
	},
	b.b2DynamicTreePair = function () {},
	w.b2Manifold = function () {
		this.m_pointCount = 0
	},
	w.prototype.b2Manifold = function () {
		this.m_points = new Vector(o.b2_maxManifoldPoints);
		for (var t = 0; o.b2_maxManifoldPoints > t; t++)
			this.m_points[t] = new C;
		this.m_localPlaneNormal = new a,
		this.m_localPoint = new a
	},
	w.prototype.Reset = function () {
		for (var t = 0; o.b2_maxManifoldPoints > t; t++)
			(this.m_points[t]instanceof C ? this.m_points[t] : null).Reset();
		this.m_localPlaneNormal.SetZero(),
		this.m_localPoint.SetZero(),
		this.m_type = 0,
		this.m_pointCount = 0
	},
	w.prototype.Set = function (t) {
		this.m_pointCount = t.m_pointCount;
		for (var e = 0; o.b2_maxManifoldPoints > e; e++)
			(this.m_points[e]instanceof C ? this.m_points[e] : null).Set(t.m_points[e]);
		this.m_localPlaneNormal.SetV(t.m_localPlaneNormal),
		this.m_localPoint.SetV(t.m_localPoint),
		this.m_type = t.m_type
	},
	w.prototype.Copy = function () {
		var t = new w;
		return t.Set(this),
		t
	},
	Box2D.postDefs.push(function () {
		Box2D.Collision.b2Manifold.e_circles = 1,
		Box2D.Collision.b2Manifold.e_faceA = 2,
		Box2D.Collision.b2Manifold.e_faceB = 4
	}),
	C.b2ManifoldPoint = function () {
		this.m_localPoint = new a,
		this.m_id = new _
	},
	C.prototype.b2ManifoldPoint = function () {
		this.Reset()
	},
	C.prototype.Reset = function () {
		this.m_localPoint.SetZero(),
		this.m_normalImpulse = 0,
		this.m_tangentImpulse = 0,
		this.m_id.key = 0
	},
	C.prototype.Set = function (t) {
		this.m_localPoint.SetV(t.m_localPoint),
		this.m_normalImpulse = t.m_normalImpulse,
		this.m_tangentImpulse = t.m_tangentImpulse,
		this.m_id.Set(t.m_id)
	},
	D.b2Point = function () {
		this.p = new a
	},
	D.prototype.Support = function (t, e, i) {
		return e === void 0 && (e = 0),
		i === void 0 && (i = 0),
		this.p
	},
	D.prototype.GetFirstVertex = function () {
		return this.p
	},
	B.b2RayCastInput = function () {
		this.p1 = new a,
		this.p2 = new a
	},
	B.prototype.b2RayCastInput = function (t, e, i) {
		t === void 0 && (t = null),
		e === void 0 && (e = null),
		i === void 0 && (i = 1),
		t && this.p1.SetV(t),
		e && this.p2.SetV(e),
		this.maxFraction = i
	},
	S.b2RayCastOutput = function () {
		this.normal = new a
	},
	I.b2Segment = function () {
		this.p1 = new a,
		this.p2 = new a
	},
	I.prototype.TestSegment = function (t, e, i, o) {
		o === void 0 && (o = 0);
		var s = i.p1,
		n = i.p2.x - s.x,
		r = i.p2.y - s.y,
		a = this.p2.x - this.p1.x,
		h = this.p2.y - this.p1.y,
		l = h,
		c = -a,
		m = 100 * Number.MIN_VALUE,
		_ =  - (n * l + r * c);
		if (_ > m) {
			var u = s.x - this.p1.x,
			p = s.y - this.p1.y,
			y = u * l + p * c;
			if (y >= 0 && o * _ >= y) {
				var d = -n * p + r * u;
				if (d >= -m * _ && _ * (1 + m) >= d) {
					y /= _;
					var x = Math.sqrt(l * l + c * c);
					return l /= x,
					c /= x,
					t[0] = y,
					e.Set(l, c),
					!0
				}
			}
		}
		return !1
	},
	I.prototype.Extend = function (t) {
		this.ExtendForward(t),
		this.ExtendBackward(t)
	},
	I.prototype.ExtendForward = function (t) {
		var e = this.p2.x - this.p1.x,
		i = this.p2.y - this.p1.y,
		o = Math.min(e > 0 ? (t.upperBound.x - this.p1.x) / e : 0 > e ? (t.lowerBound.x - this.p1.x) / e : Number.POSITIVE_INFINITY, i > 0 ? (t.upperBound.y - this.p1.y) / i : 0 > i ? (t.lowerBound.y - this.p1.y) / i : Number.POSITIVE_INFINITY);
		this.p2.x = this.p1.x + e * o,
		this.p2.y = this.p1.y + i * o
	},
	I.prototype.ExtendBackward = function (t) {
		var e = -this.p2.x + this.p1.x,
		i = -this.p2.y + this.p1.y,
		o = Math.min(e > 0 ? (t.upperBound.x - this.p2.x) / e : 0 > e ? (t.lowerBound.x - this.p2.x) / e : Number.POSITIVE_INFINITY, i > 0 ? (t.upperBound.y - this.p2.y) / i : 0 > i ? (t.lowerBound.y - this.p2.y) / i : Number.POSITIVE_INFINITY);
		this.p1.x = this.p2.x + e * o,
		this.p1.y = this.p2.y + i * o
	},
	A.b2SeparationFunction = function () {
		this.m_localPoint = new a,
		this.m_axis = new a
	},
	A.prototype.Initialize = function (t, e, i, n, r) {
		this.m_proxyA = e,
		this.m_proxyB = n;
		var h = parseInt(t.count);
		o.b2Assert(h > 0 && 3 > h);
		var l,
		c,
		m,
		_,
		u,
		p,
		y,
		d,
		x = 0,
		f = 0,
		g = 0,
		v = 0,
		b = 0,
		w = 0,
		C = 0,
		D = 0;
		if (h == 1)
			this.m_type = A.e_points, l = this.m_proxyA.GetVertex(t.indexA[0]), _ = this.m_proxyB.GetVertex(t.indexB[0]), d = l, y = i.R, x = i.position.x + (y.col1.x * d.x + y.col2.x * d.y), f = i.position.y + (y.col1.y * d.x + y.col2.y * d.y), d = _, y = r.R, g = r.position.x + (y.col1.x * d.x + y.col2.x * d.y), v = r.position.y + (y.col1.y * d.x + y.col2.y * d.y), this.m_axis.x = g - x, this.m_axis.y = v - f, this.m_axis.Normalize();
		else if (t.indexB[0] == t.indexB[1])
			this.m_type = A.e_faceA, c = this.m_proxyA.GetVertex(t.indexA[0]), m = this.m_proxyA.GetVertex(t.indexA[1]), _ = this.m_proxyB.GetVertex(t.indexB[0]), this.m_localPoint.x = .5 * (c.x + m.x), this.m_localPoint.y = .5 * (c.y + m.y), this.m_axis = s.CrossVF(s.SubtractVV(m, c), 1), this.m_axis.Normalize(), d = this.m_axis, y = i.R, b = y.col1.x * d.x + y.col2.x * d.y, w = y.col1.y * d.x + y.col2.y * d.y, d = this.m_localPoint, y = i.R, x = i.position.x + (y.col1.x * d.x + y.col2.x * d.y), f = i.position.y + (y.col1.y * d.x + y.col2.y * d.y), d = _, y = r.R, g = r.position.x + (y.col1.x * d.x + y.col2.x * d.y), v = r.position.y + (y.col1.y * d.x + y.col2.y * d.y), C = (g - x) * b + (v - f) * w, 0 > C && this.m_axis.NegativeSelf();
		else if (t.indexA[0] == t.indexA[0])
			this.m_type = A.e_faceB, u = this.m_proxyB.GetVertex(t.indexB[0]), p = this.m_proxyB.GetVertex(t.indexB[1]), l = this.m_proxyA.GetVertex(t.indexA[0]), this.m_localPoint.x = .5 * (u.x + p.x), this.m_localPoint.y = .5 * (u.y + p.y), this.m_axis = s.CrossVF(s.SubtractVV(p, u), 1), this.m_axis.Normalize(), d = this.m_axis, y = r.R, b = y.col1.x * d.x + y.col2.x * d.y, w = y.col1.y * d.x + y.col2.y * d.y, d = this.m_localPoint, y = r.R, g = r.position.x + (y.col1.x * d.x + y.col2.x * d.y), v = r.position.y + (y.col1.y * d.x + y.col2.y * d.y), d = l, y = i.R, x = i.position.x + (y.col1.x * d.x + y.col2.x * d.y), f = i.position.y + (y.col1.y * d.x + y.col2.y * d.y), C = (x - g) * b + (f - v) * w, 0 > C && this.m_axis.NegativeSelf();
		else {
			c = this.m_proxyA.GetVertex(t.indexA[0]),
			m = this.m_proxyA.GetVertex(t.indexA[1]),
			u = this.m_proxyB.GetVertex(t.indexB[0]),
			p = this.m_proxyB.GetVertex(t.indexB[1]),
			s.MulX(i, l);
			var B = s.MulMV(i.R, s.SubtractVV(m, c));
			s.MulX(r, _);
			var S = s.MulMV(r.R, s.SubtractVV(p, u)),
			I = B.x * B.x + B.y * B.y,
			M = S.x * S.x + S.y * S.y,
			T = s.SubtractVV(S, B),
			V = B.x * T.x + B.y * T.y,
			P = S.x * T.x + S.y * T.y,
			R = B.x * S.x + B.y * S.y,
			k = I * M - R * R;
			C = 0,
			k != 0 && (C = s.Clamp((R * P - V * M) / k, 0, 1));
			var L = (R * C + P) / M;
			0 > L && (L = 0, C = s.Clamp((R - V) / I, 0, 1)),
			l = new a,
			l.x = c.x + C * (m.x - c.x),
			l.y = c.y + C * (m.y - c.y),
			_ = new a,
			_.x = u.x + C * (p.x - u.x),
			_.y = u.y + C * (p.y - u.y),
			C == 0 || C == 1 ? (this.m_type = A.e_faceB, this.m_axis = s.CrossVF(s.SubtractVV(p, u), 1), this.m_axis.Normalize(), this.m_localPoint = _, d = this.m_axis, y = r.R, b = y.col1.x * d.x + y.col2.x * d.y, w = y.col1.y * d.x + y.col2.y * d.y, d = this.m_localPoint, y = r.R, g = r.position.x + (y.col1.x * d.x + y.col2.x * d.y), v = r.position.y + (y.col1.y * d.x + y.col2.y * d.y), d = l, y = i.R, x = i.position.x + (y.col1.x * d.x + y.col2.x * d.y), f = i.position.y + (y.col1.y * d.x + y.col2.y * d.y), D = (x - g) * b + (f - v) * w, 0 > C && this.m_axis.NegativeSelf()) : (this.m_type = A.e_faceA, this.m_axis = s.CrossVF(s.SubtractVV(m, c), 1), this.m_localPoint = l, d = this.m_axis, y = i.R, b = y.col1.x * d.x + y.col2.x * d.y, w = y.col1.y * d.x + y.col2.y * d.y, d = this.m_localPoint, y = i.R, x = i.position.x + (y.col1.x * d.x + y.col2.x * d.y), f = i.position.y + (y.col1.y * d.x + y.col2.y * d.y), d = _, y = r.R, g = r.position.x + (y.col1.x * d.x + y.col2.x * d.y), v = r.position.y + (y.col1.y * d.x + y.col2.y * d.y), D = (g - x) * b + (v - f) * w, 0 > C && this.m_axis.NegativeSelf())
		}
	},
	A.prototype.Evaluate = function (t, e) {
		var i,
		n,
		r,
		a,
		h,
		l,
		c,
		m = 0;
		switch (this.m_type) {
		case A.e_points:
			return i = s.MulTMV(t.R, this.m_axis),
			n = s.MulTMV(e.R, this.m_axis.GetNegative()),
			r = this.m_proxyA.GetSupportVertex(i),
			a = this.m_proxyB.GetSupportVertex(n),
			h = s.MulX(t, r),
			l = s.MulX(e, a),
			m = (l.x - h.x) * this.m_axis.x + (l.y - h.y) * this.m_axis.y;
		case A.e_faceA:
			return c = s.MulMV(t.R, this.m_axis),
			h = s.MulX(t, this.m_localPoint),
			n = s.MulTMV(e.R, c.GetNegative()),
			a = this.m_proxyB.GetSupportVertex(n),
			l = s.MulX(e, a),
			m = (l.x - h.x) * c.x + (l.y - h.y) * c.y;
		case A.e_faceB:
			return c = s.MulMV(e.R, this.m_axis),
			l = s.MulX(e, this.m_localPoint),
			i = s.MulTMV(t.R, c.GetNegative()),
			r = this.m_proxyA.GetSupportVertex(i),
			h = s.MulX(t, r),
			m = (h.x - l.x) * c.x + (h.y - l.y) * c.y;
		default:
			return o.b2Assert(!1),
			0
		}
	},
	Box2D.postDefs.push(function () {
		Box2D.Collision.b2SeparationFunction.e_points = 1,
		Box2D.Collision.b2SeparationFunction.e_faceA = 2,
		Box2D.Collision.b2SeparationFunction.e_faceB = 4
	}),
	M.b2Simplex = function () {
		this.m_v1 = new V,
		this.m_v2 = new V,
		this.m_v3 = new V,
		this.m_vertices = new Vector(3)
	},
	M.prototype.b2Simplex = function () {
		this.m_vertices[0] = this.m_v1,
		this.m_vertices[1] = this.m_v2,
		this.m_vertices[2] = this.m_v3
	},
	M.prototype.ReadCache = function (t, e, i, n, r) {
		o.b2Assert(t.count >= 0 && 3 >= t.count);
		var a,
		h;
		this.m_count = t.count;
		for (var l = this.m_vertices, c = 0; this.m_count > c; c++) {
			var m = l[c];
			m.indexA = t.indexA[c],
			m.indexB = t.indexB[c],
			a = e.GetVertex(m.indexA),
			h = n.GetVertex(m.indexB),
			m.wA = s.MulX(i, a),
			m.wB = s.MulX(r, h),
			m.w = s.SubtractVV(m.wB, m.wA),
			m.a = 0
		}
		if (this.m_count > 1) {
			var _ = t.metric,
			u = this.GetMetric();
			(.5 * _ > u || u > 2 * _ || Number.MIN_VALUE > u) && (this.m_count = 0)
		}
		this.m_count == 0 && (m = l[0], m.indexA = 0, m.indexB = 0, a = e.GetVertex(0), h = n.GetVertex(0), m.wA = s.MulX(i, a), m.wB = s.MulX(r, h), m.w = s.SubtractVV(m.wB, m.wA), this.m_count = 1)
	},
	M.prototype.WriteCache = function (t) {
		t.metric = this.GetMetric(),
		t.count = Box2D.parseUInt(this.m_count);
		for (var e = this.m_vertices, i = 0; this.m_count > i; i++)
			t.indexA[i] = Box2D.parseUInt(e[i].indexA), t.indexB[i] = Box2D.parseUInt(e[i].indexB)
	},
	M.prototype.GetSearchDirection = function () {
		switch (this.m_count) {
		case 1:
			return this.m_v1.w.GetNegative();
		case 2:
			var t = s.SubtractVV(this.m_v2.w, this.m_v1.w),
			e = s.CrossVV(t, this.m_v1.w.GetNegative());
			return e > 0 ? s.CrossFV(1, t) : s.CrossVF(t, 1);
		default:
			return o.b2Assert(!1),
			new a
		}
	},
	M.prototype.GetClosestPoint = function () {
		switch (this.m_count) {
		case 0:
			return o.b2Assert(!1),
			new a;
		case 1:
			return this.m_v1.w;
		case 2:
			return new a(this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y);
		default:
			return o.b2Assert(!1),
			new a
		}
	},
	M.prototype.GetWitnessPoints = function (t, e) {
		switch (this.m_count) {
		case 0:
			o.b2Assert(!1);
			break;
		case 1:
			t.SetV(this.m_v1.wA),
			e.SetV(this.m_v1.wB);
			break;
		case 2:
			t.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x,
			t.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y,
			e.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x,
			e.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y;
			break;
		case 3:
			e.x = t.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x,
			e.y = t.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y;
			break;
		default:
			o.b2Assert(!1)
		}
	},
	M.prototype.GetMetric = function () {
		switch (this.m_count) {
		case 0:
			return o.b2Assert(!1),
			0;
		case 1:
			return 0;
		case 2:
			return s.SubtractVV(this.m_v1.w, this.m_v2.w).Length();
		case 3:
			return s.CrossVV(s.SubtractVV(this.m_v2.w, this.m_v1.w), s.SubtractVV(this.m_v3.w, this.m_v1.w));
		default:
			return o.b2Assert(!1),
			0
		}
	},
	M.prototype.Solve2 = function () {
		var t = this.m_v1.w,
		e = this.m_v2.w,
		i = s.SubtractVV(e, t),
		o =  - (t.x * i.x + t.y * i.y);
		if (0 >= o)
			return this.m_v1.a = 1, this.m_count = 1, void 0;
		var n = e.x * i.x + e.y * i.y;
		if (0 >= n)
			return this.m_v2.a = 1, this.m_count = 1, this.m_v1.Set(this.m_v2), void 0;
		var r = 1 / (n + o);
		this.m_v1.a = n * r,
		this.m_v2.a = o * r,
		this.m_count = 2
	},
	M.prototype.Solve3 = function () {
		var t = this.m_v1.w,
		e = this.m_v2.w,
		i = this.m_v3.w,
		o = s.SubtractVV(e, t),
		n = s.Dot(t, o),
		r = s.Dot(e, o),
		a = r,
		h = -n,
		l = s.SubtractVV(i, t),
		c = s.Dot(t, l),
		m = s.Dot(i, l),
		_ = m,
		u = -c,
		p = s.SubtractVV(i, e),
		y = s.Dot(e, p),
		d = s.Dot(i, p),
		x = d,
		f = -y,
		g = s.CrossVV(o, l),
		v = g * s.CrossVV(e, i),
		b = g * s.CrossVV(i, t),
		w = g * s.CrossVV(t, e);
		if (0 >= h && 0 >= u)
			return this.m_v1.a = 1, this.m_count = 1, void 0;
		if (a > 0 && h > 0 && 0 >= w) {
			var C = 1 / (a + h);
			return this.m_v1.a = a * C,
			this.m_v2.a = h * C,
			this.m_count = 2,
			void 0
		}
		if (_ > 0 && u > 0 && 0 >= b) {
			var D = 1 / (_ + u);
			return this.m_v1.a = _ * D,
			this.m_v3.a = u * D,
			this.m_count = 2,
			this.m_v2.Set(this.m_v3),
			void 0
		}
		if (0 >= a && 0 >= f)
			return this.m_v2.a = 1, this.m_count = 1, this.m_v1.Set(this.m_v2), void 0;
		if (0 >= _ && 0 >= x)
			return this.m_v3.a = 1, this.m_count = 1, this.m_v1.Set(this.m_v3), void 0;
		if (x > 0 && f > 0 && 0 >= v) {
			var B = 1 / (x + f);
			return this.m_v2.a = x * B,
			this.m_v3.a = f * B,
			this.m_count = 2,
			this.m_v1.Set(this.m_v3),
			void 0
		}
		var S = 1 / (v + b + w);
		this.m_v1.a = v * S,
		this.m_v2.a = b * S,
		this.m_v3.a = w * S,
		this.m_count = 3
	},
	T.b2SimplexCache = function () {
		this.indexA = new Vector_a2j_Number(3),
		this.indexB = new Vector_a2j_Number(3)
	},
	V.b2SimplexVertex = function () {},
	V.prototype.Set = function (t) {
		this.wA.SetV(t.wA),
		this.wB.SetV(t.wB),
		this.w.SetV(t.w),
		this.a = t.a,
		this.indexA = t.indexA,
		this.indexB = t.indexB
	},
	P.b2TimeOfImpact = function () {},
	P.TimeOfImpact = function (t) {
		++P.b2_toiCalls;
		var e = t.proxyA,
		i = t.proxyB,
		n = t.sweepA,
		r = t.sweepB;
		o.b2Assert(n.t0 == r.t0),
		o.b2Assert(1 - n.t0 > Number.MIN_VALUE);
		var a = e.m_radius + i.m_radius,
		h = t.tolerance,
		l = 0,
		c = 1e3,
		m = 0,
		_ = 0;
		for (P.s_cache.count = 0, P.s_distanceInput.useRadii = !1; ; ) {
			if (n.GetTransform(P.s_xfA, l), r.GetTransform(P.s_xfB, l), P.s_distanceInput.proxyA = e, P.s_distanceInput.proxyB = i, P.s_distanceInput.transformA = P.s_xfA, P.s_distanceInput.transformB = P.s_xfB, p.Distance(P.s_distanceOutput, P.s_cache, P.s_distanceInput), 0 >= P.s_distanceOutput.distance) {
				l = 1;
				break
			}
			P.s_fcn.Initialize(P.s_cache, e, P.s_xfA, i, P.s_xfB);
			var u = P.s_fcn.Evaluate(P.s_xfA, P.s_xfB);
			if (0 >= u) {
				l = 1;
				break
			}
			if (m == 0 && (_ = u > a ? s.Max(a - h, .75 * a) : s.Max(u - h, .02 * a)), .5 * h > u - _) {
				if (m == 0) {
					l = 1;
					break
				}
				break
			}
			var y = l,
			d = l,
			x = 1,
			f = u;
			n.GetTransform(P.s_xfA, x),
			r.GetTransform(P.s_xfB, x);
			var g = P.s_fcn.Evaluate(P.s_xfA, P.s_xfB);
			if (g >= _) {
				l = 1;
				break
			}
			for (var v = 0; ; ) {
				var b = 0;
				b = v & 1 ? d + (_ - f) * (x - d) / (g - f) : .5 * (d + x),
				n.GetTransform(P.s_xfA, b),
				r.GetTransform(P.s_xfB, b);
				var w = P.s_fcn.Evaluate(P.s_xfA, P.s_xfB);
				if (.025 * h > s.Abs(w - _)) {
					y = b;
					break
				}
				if (w > _ ? (d = b, f = w) : (x = b, g = w), ++v, ++P.b2_toiRootIters, v == 50)
					break
			}
			if (P.b2_toiMaxRootIters = s.Max(P.b2_toiMaxRootIters, v), (1 + 100 * Number.MIN_VALUE) * l > y)
				break;
			if (l = y, m++, ++P.b2_toiIters, m == c)
				break
		}
		return P.b2_toiMaxIters = s.Max(P.b2_toiMaxIters, m),
		l
	},
	Box2D.postDefs.push(function () {
		Box2D.Collision.b2TimeOfImpact.b2_toiCalls = 0,
		Box2D.Collision.b2TimeOfImpact.b2_toiIters = 0,
		Box2D.Collision.b2TimeOfImpact.b2_toiMaxIters = 0,
		Box2D.Collision.b2TimeOfImpact.b2_toiRootIters = 0,
		Box2D.Collision.b2TimeOfImpact.b2_toiMaxRootIters = 0,
		Box2D.Collision.b2TimeOfImpact.s_cache = new T,
		Box2D.Collision.b2TimeOfImpact.s_distanceInput = new y,
		Box2D.Collision.b2TimeOfImpact.s_xfA = new r,
		Box2D.Collision.b2TimeOfImpact.s_xfB = new r,
		Box2D.Collision.b2TimeOfImpact.s_fcn = new A,
		Box2D.Collision.b2TimeOfImpact.s_distanceOutput = new d
	}),
	R.b2TOIInput = function () {
		this.proxyA = new x,
		this.proxyB = new x,
		this.sweepA = new n,
		this.sweepB = new n
	},
	k.b2WorldManifold = function () {
		this.m_normal = new a
	},
	k.prototype.b2WorldManifold = function () {
		this.m_points = new Vector(o.b2_maxManifoldPoints);
		for (var t = 0; o.b2_maxManifoldPoints > t; t++)
			this.m_points[t] = new a
	},
	k.prototype.Initialize = function (t, e, i, o, s) {
		if (i === void 0 && (i = 0), s === void 0 && (s = 0), t.m_pointCount != 0) {
			var n,
			r,
			a = 0,
			h = 0,
			l = 0,
			c = 0,
			m = 0,
			_ = 0,
			u = 0;
			switch (t.m_type) {
			case w.e_circles:
				r = e.R,
				n = t.m_localPoint;
				var p = e.position.x + r.col1.x * n.x + r.col2.x * n.y,
				y = e.position.y + r.col1.y * n.x + r.col2.y * n.y;
				r = o.R,
				n = t.m_points[0].m_localPoint;
				var d = o.position.x + r.col1.x * n.x + r.col2.x * n.y,
				x = o.position.y + r.col1.y * n.x + r.col2.y * n.y,
				f = d - p,
				g = x - y,
				v = f * f + g * g;
				if (v > Number.MIN_VALUE * Number.MIN_VALUE) {
					var b = Math.sqrt(v);
					this.m_normal.x = f / b,
					this.m_normal.y = g / b
				} else
					this.m_normal.x = 1, this.m_normal.y = 0;
				var C = p + i * this.m_normal.x,
				D = y + i * this.m_normal.y,
				B = d - s * this.m_normal.x,
				S = x - s * this.m_normal.y;
				this.m_points[0].x = .5 * (C + B),
				this.m_points[0].y = .5 * (D + S);
				break;
			case w.e_faceA:
				for (r = e.R, n = t.m_localPlaneNormal, h = r.col1.x * n.x + r.col2.x * n.y, l = r.col1.y * n.x + r.col2.y * n.y, r = e.R, n = t.m_localPoint, c = e.position.x + r.col1.x * n.x + r.col2.x * n.y, m = e.position.y + r.col1.y * n.x + r.col2.y * n.y, this.m_normal.x = h, this.m_normal.y = l, a = 0; t.m_pointCount > a; a++)
					r = o.R, n = t.m_points[a].m_localPoint, _ = o.position.x + r.col1.x * n.x + r.col2.x * n.y, u = o.position.y + r.col1.y * n.x + r.col2.y * n.y, this.m_points[a].x = _ + .5 * (i - (_ - c) * h - (u - m) * l - s) * h, this.m_points[a].y = u + .5 * (i - (_ - c) * h - (u - m) * l - s) * l;
				break;
			case w.e_faceB:
				for (r = o.R, n = t.m_localPlaneNormal, h = r.col1.x * n.x + r.col2.x * n.y, l = r.col1.y * n.x + r.col2.y * n.y, r = o.R, n = t.m_localPoint, c = o.position.x + r.col1.x * n.x + r.col2.x * n.y, m = o.position.y + r.col1.y * n.x + r.col2.y * n.y, this.m_normal.x = -h, this.m_normal.y = -l, a = 0; t.m_pointCount > a; a++)
					r = e.R, n = t.m_points[a].m_localPoint, _ = e.position.x + r.col1.x * n.x + r.col2.x * n.y, u = e.position.y + r.col1.y * n.x + r.col2.y * n.y, this.m_points[a].x = _ + .5 * (s - (_ - c) * h - (u - m) * l - i) * h, this.m_points[a].y = u + .5 * (s - (_ - c) * h - (u - m) * l - i) * l
			}
		}
	},
	L.ClipVertex = function () {
		this.v = new a,
		this.id = new _
	},
	L.prototype.Set = function (t) {
		this.v.SetV(t.v),
		this.id.Set(t.id)
	},
	F.Features = function () {},
	Object.defineProperty(F.prototype, "referenceEdge", {
		enumerable : !1,
		configurable : !0,
		get : function () {
			return this._referenceEdge
		}
	}),
	Object.defineProperty(F.prototype, "referenceEdge", {
		enumerable : !1,
		configurable : !0,
		set : function (t) {
			t === void 0 && (t = 0),
			this._referenceEdge = t,
			this._m_id._key = this._m_id._key & 4294967040 | this._referenceEdge & 255
		}
	}),
	Object.defineProperty(F.prototype, "incidentEdge", {
		enumerable : !1,
		configurable : !0,
		get : function () {
			return this._incidentEdge
		}
	}),
	Object.defineProperty(F.prototype, "incidentEdge", {
		enumerable : !1,
		configurable : !0,
		set : function (t) {
			t === void 0 && (t = 0),
			this._incidentEdge = t,
			this._m_id._key = this._m_id._key & 4294902015 | this._incidentEdge << 8 & 65280
		}
	}),
	Object.defineProperty(F.prototype, "incidentVertex", {
		enumerable : !1,
		configurable : !0,
		get : function () {
			return this._incidentVertex
		}
	}),
	Object.defineProperty(F.prototype, "incidentVertex", {
		enumerable : !1,
		configurable : !0,
		set : function (t) {
			t === void 0 && (t = 0),
			this._incidentVertex = t,
			this._m_id._key = this._m_id._key & 4278255615 | this._incidentVertex << 16 & 16711680
		}
	}),
	Object.defineProperty(F.prototype, "flip", {
		enumerable : !1,
		configurable : !0,
		get : function () {
			return this._flip
		}
	}),
	Object.defineProperty(F.prototype, "flip", {
		enumerable : !1,
		configurable : !0,
		set : function (t) {
			t === void 0 && (t = 0),
			this._flip = t,
			this._m_id._key = this._m_id._key & 16777215 | this._flip << 24 & 4278190080
		}
	})
}
(), function () {
	var t = (Box2D.Common.b2Color, Box2D.Common.b2internal, Box2D.Common.b2Settings),
	e = Box2D.Collision.Shapes.b2CircleShape,
	i = Box2D.Collision.Shapes.b2EdgeChainDef,
	o = Box2D.Collision.Shapes.b2EdgeShape,
	s = Box2D.Collision.Shapes.b2MassData,
	n = Box2D.Collision.Shapes.b2PolygonShape,
	r = Box2D.Collision.Shapes.b2Shape,
	a = Box2D.Common.Math.b2Mat22,
	h = (Box2D.Common.Math.b2Mat33, Box2D.Common.Math.b2Math),
	l = (Box2D.Common.Math.b2Sweep, Box2D.Common.Math.b2Transform),
	c = Box2D.Common.Math.b2Vec2,
	m = (Box2D.Common.Math.b2Vec3, Box2D.Dynamics.b2Body, Box2D.Dynamics.b2BodyDef, Box2D.Dynamics.b2ContactFilter, Box2D.Dynamics.b2ContactImpulse, Box2D.Dynamics.b2ContactListener, Box2D.Dynamics.b2ContactManager, Box2D.Dynamics.b2DebugDraw, Box2D.Dynamics.b2DestructionListener, Box2D.Dynamics.b2FilterData, Box2D.Dynamics.b2Fixture, Box2D.Dynamics.b2FixtureDef, Box2D.Dynamics.b2Island, Box2D.Dynamics.b2TimeStep, Box2D.Dynamics.b2World, Box2D.Collision.b2AABB, Box2D.Collision.b2Bound, Box2D.Collision.b2BoundValues, Box2D.Collision.b2Collision, Box2D.Collision.b2ContactID, Box2D.Collision.b2ContactPoint, Box2D.Collision.b2Distance),
	_ = Box2D.Collision.b2DistanceInput,
	u = Box2D.Collision.b2DistanceOutput,
	p = Box2D.Collision.b2DistanceProxy,
	y = (Box2D.Collision.b2DynamicTree, Box2D.Collision.b2DynamicTreeBroadPhase, Box2D.Collision.b2DynamicTreeNode, Box2D.Collision.b2DynamicTreePair, Box2D.Collision.b2Manifold, Box2D.Collision.b2ManifoldPoint, Box2D.Collision.b2Point, Box2D.Collision.b2RayCastInput, Box2D.Collision.b2RayCastOutput, Box2D.Collision.b2Segment, Box2D.Collision.b2SeparationFunction, Box2D.Collision.b2Simplex, Box2D.Collision.b2SimplexCache);
	Box2D.Collision.b2SimplexVertex,
	Box2D.Collision.b2TimeOfImpact,
	Box2D.Collision.b2TOIInput,
	Box2D.Collision.b2WorldManifold,
	Box2D.Collision.ClipVertex,
	Box2D.Collision.Features,
	Box2D.Collision.IBroadPhase,
	Box2D.inherit(e, Box2D.Collision.Shapes.b2Shape),
	e.prototype.__super = Box2D.Collision.Shapes.b2Shape.prototype,
	e.b2CircleShape = function () {
		Box2D.Collision.Shapes.b2Shape.b2Shape.apply(this, arguments),
		this.m_p = new c
	},
	e.prototype.Copy = function () {
		var t = new e;
		return t.Set(this),
		t
	},
	e.prototype.Set = function (t) {
		if (this.__super.Set.call(this, t), Box2D.is(t, e)) {
			var i = t instanceof e ? t : null;
			this.m_p.SetV(i.m_p)
		}
	},
	e.prototype.TestPoint = function (t, e) {
		var i = t.R,
		o = t.position.x + (i.col1.x * this.m_p.x + i.col2.x * this.m_p.y),
		s = t.position.y + (i.col1.y * this.m_p.x + i.col2.y * this.m_p.y);
		return o = e.x - o,
		s = e.y - s,
		this.m_radius * this.m_radius >= o * o + s * s
	},
	e.prototype.RayCast = function (t, e, i) {
		var o = i.R,
		s = i.position.x + (o.col1.x * this.m_p.x + o.col2.x * this.m_p.y),
		n = i.position.y + (o.col1.y * this.m_p.x + o.col2.y * this.m_p.y),
		r = e.p1.x - s,
		a = e.p1.y - n,
		h = r * r + a * a - this.m_radius * this.m_radius,
		l = e.p2.x - e.p1.x,
		c = e.p2.y - e.p1.y,
		m = r * l + a * c,
		_ = l * l + c * c,
		u = m * m - _ * h;
		if (0 > u || Number.MIN_VALUE > _)
			return !1;
		var p =  - (m + Math.sqrt(u));
		return 0 > p || p > e.maxFraction * _ ? !1 : (p /= _, t.fraction = p, t.normal.x = r + p * l, t.normal.y = a + p * c, t.normal.Normalize(), !0)
	},
	e.prototype.ComputeAABB = function (t, e) {
		var i = e.R,
		o = e.position.x + (i.col1.x * this.m_p.x + i.col2.x * this.m_p.y),
		s = e.position.y + (i.col1.y * this.m_p.x + i.col2.y * this.m_p.y);
		t.lowerBound.Set(o - this.m_radius, s - this.m_radius),
		t.upperBound.Set(o + this.m_radius, s + this.m_radius)
	},
	e.prototype.ComputeMass = function (e, i) {
		i === void 0 && (i = 0),
		e.mass = i * t.b2_pi * this.m_radius * this.m_radius,
		e.center.SetV(this.m_p),
		e.I = e.mass * (.5 * this.m_radius * this.m_radius + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y))
	},
	e.prototype.ComputeSubmergedArea = function (t, e, i, o) {
		e === void 0 && (e = 0);
		var s = h.MulX(i, this.m_p),
		n =  - (h.Dot(t, s) - e);
		if (-this.m_radius + Number.MIN_VALUE > n)
			return 0;
		if (n > this.m_radius)
			return o.SetV(s), Math.PI * this.m_radius * this.m_radius;
		var r = this.m_radius * this.m_radius,
		a = n * n,
		l = r * (Math.asin(n / this.m_radius) + Math.PI / 2) + n * Math.sqrt(r - a),
		c = -2 / 3 * Math.pow(r - a, 1.5) / l;
		return o.x = s.x + t.x * c,
		o.y = s.y + t.y * c,
		l
	},
	e.prototype.GetLocalPosition = function () {
		return this.m_p
	},
	e.prototype.SetLocalPosition = function (t) {
		this.m_p.SetV(t)
	},
	e.prototype.GetRadius = function () {
		return this.m_radius
	},
	e.prototype.SetRadius = function (t) {
		t === void 0 && (t = 0),
		this.m_radius = t
	},
	e.prototype.b2CircleShape = function (t) {
		t === void 0 && (t = 0),
		this.__super.b2Shape.call(this),
		this.m_type = r.e_circleShape,
		this.m_radius = t
	},
	i.b2EdgeChainDef = function () {},
	i.prototype.b2EdgeChainDef = function () {
		this.vertexCount = 0,
		this.isALoop = !0,
		this.vertices = []
	},
	Box2D.inherit(o, Box2D.Collision.Shapes.b2Shape),
	o.prototype.__super = Box2D.Collision.Shapes.b2Shape.prototype,
	o.b2EdgeShape = function () {
		Box2D.Collision.Shapes.b2Shape.b2Shape.apply(this, arguments),
		this.s_supportVec = new c,
		this.m_v1 = new c,
		this.m_v2 = new c,
		this.m_coreV1 = new c,
		this.m_coreV2 = new c,
		this.m_normal = new c,
		this.m_direction = new c,
		this.m_cornerDir1 = new c,
		this.m_cornerDir2 = new c
	},
	o.prototype.TestPoint = function () {
		return !1
	},
	o.prototype.RayCast = function (t, e, i) {
		var o,
		s = e.p2.x - e.p1.x,
		n = e.p2.y - e.p1.y;
		o = i.R;
		var r = i.position.x + (o.col1.x * this.m_v1.x + o.col2.x * this.m_v1.y),
		a = i.position.y + (o.col1.y * this.m_v1.x + o.col2.y * this.m_v1.y),
		h = i.position.y + (o.col1.y * this.m_v2.x + o.col2.y * this.m_v2.y) - a,
		l =  - (i.position.x + (o.col1.x * this.m_v2.x + o.col2.x * this.m_v2.y) - r),
		c = 100 * Number.MIN_VALUE,
		m =  - (s * h + n * l);
		if (m > c) {
			var _ = e.p1.x - r,
			u = e.p1.y - a,
			p = _ * h + u * l;
			if (p >= 0 && e.maxFraction * m >= p) {
				var y = -s * u + n * _;
				if (y >= -c * m && m * (1 + c) >= y) {
					p /= m,
					t.fraction = p;
					var d = Math.sqrt(h * h + l * l);
					return t.normal.x = h / d,
					t.normal.y = l / d,
					!0
				}
			}
		}
		return !1
	},
	o.prototype.ComputeAABB = function (t, e) {
		var i = e.R,
		o = e.position.x + (i.col1.x * this.m_v1.x + i.col2.x * this.m_v1.y),
		s = e.position.y + (i.col1.y * this.m_v1.x + i.col2.y * this.m_v1.y),
		n = e.position.x + (i.col1.x * this.m_v2.x + i.col2.x * this.m_v2.y),
		r = e.position.y + (i.col1.y * this.m_v2.x + i.col2.y * this.m_v2.y);
		n > o ? (t.lowerBound.x = o, t.upperBound.x = n) : (t.lowerBound.x = n, t.upperBound.x = o),
		r > s ? (t.lowerBound.y = s, t.upperBound.y = r) : (t.lowerBound.y = r, t.upperBound.y = s)
	},
	o.prototype.ComputeMass = function (t, e) {
		e === void 0 && (e = 0),
		t.mass = 0,
		t.center.SetV(this.m_v1),
		t.I = 0
	},
	o.prototype.ComputeSubmergedArea = function (t, e, i, o) {
		e === void 0 && (e = 0);
		var s = new c(t.x * e, t.y * e),
		n = h.MulX(i, this.m_v1),
		r = h.MulX(i, this.m_v2),
		a = h.Dot(t, n) - e,
		l = h.Dot(t, r) - e;
		if (a > 0) {
			if (l > 0)
				return 0;
			n.x = -l / (a - l) * n.x + a / (a - l) * r.x,
			n.y = -l / (a - l) * n.y + a / (a - l) * r.y
		} else
			l > 0 && (r.x = -l / (a - l) * n.x + a / (a - l) * r.x, r.y = -l / (a - l) * n.y + a / (a - l) * r.y);
		return o.x = (s.x + n.x + r.x) / 3,
		o.y = (s.y + n.y + r.y) / 3,
		.5 * ((n.x - s.x) * (r.y - s.y) - (n.y - s.y) * (r.x - s.x))
	},
	o.prototype.GetLength = function () {
		return this.m_length
	},
	o.prototype.GetVertex1 = function () {
		return this.m_v1
	},
	o.prototype.GetVertex2 = function () {
		return this.m_v2
	},
	o.prototype.GetCoreVertex1 = function () {
		return this.m_coreV1
	},
	o.prototype.GetCoreVertex2 = function () {
		return this.m_coreV2
	},
	o.prototype.GetNormalVector = function () {
		return this.m_normal
	},
	o.prototype.GetDirectionVector = function () {
		return this.m_direction
	},
	o.prototype.GetCorner1Vector = function () {
		return this.m_cornerDir1
	},
	o.prototype.GetCorner2Vector = function () {
		return this.m_cornerDir2
	},
	o.prototype.Corner1IsConvex = function () {
		return this.m_cornerConvex1
	},
	o.prototype.Corner2IsConvex = function () {
		return this.m_cornerConvex2
	},
	o.prototype.GetFirstVertex = function (t) {
		var e = t.R;
		return new c(t.position.x + (e.col1.x * this.m_coreV1.x + e.col2.x * this.m_coreV1.y), t.position.y + (e.col1.y * this.m_coreV1.x + e.col2.y * this.m_coreV1.y))
	},
	o.prototype.GetNextEdge = function () {
		return this.m_nextEdge
	},
	o.prototype.GetPrevEdge = function () {
		return this.m_prevEdge
	},
	o.prototype.Support = function (t, e, i) {
		e === void 0 && (e = 0),
		i === void 0 && (i = 0);
		var o = t.R,
		s = t.position.x + (o.col1.x * this.m_coreV1.x + o.col2.x * this.m_coreV1.y),
		n = t.position.y + (o.col1.y * this.m_coreV1.x + o.col2.y * this.m_coreV1.y),
		r = t.position.x + (o.col1.x * this.m_coreV2.x + o.col2.x * this.m_coreV2.y),
		a = t.position.y + (o.col1.y * this.m_coreV2.x + o.col2.y * this.m_coreV2.y);
		return s * e + n * i > r * e + a * i ? (this.s_supportVec.x = s, this.s_supportVec.y = n) : (this.s_supportVec.x = r, this.s_supportVec.y = a),
		this.s_supportVec
	},
	o.prototype.b2EdgeShape = function (e, i) {
		this.__super.b2Shape.call(this),
		this.m_type = r.e_edgeShape,
		this.m_prevEdge = null,
		this.m_nextEdge = null,
		this.m_v1 = e,
		this.m_v2 = i,
		this.m_direction.Set(this.m_v2.x - this.m_v1.x, this.m_v2.y - this.m_v1.y),
		this.m_length = this.m_direction.Normalize(),
		this.m_normal.Set(this.m_direction.y, -this.m_direction.x),
		this.m_coreV1.Set(-t.b2_toiSlop * (this.m_normal.x - this.m_direction.x) + this.m_v1.x, -t.b2_toiSlop * (this.m_normal.y - this.m_direction.y) + this.m_v1.y),
		this.m_coreV2.Set(-t.b2_toiSlop * (this.m_normal.x + this.m_direction.x) + this.m_v2.x, -t.b2_toiSlop * (this.m_normal.y + this.m_direction.y) + this.m_v2.y),
		this.m_cornerDir1 = this.m_normal,
		this.m_cornerDir2.Set(-this.m_normal.x, -this.m_normal.y)
	},
	o.prototype.SetPrevEdge = function (t, e, i, o) {
		this.m_prevEdge = t,
		this.m_coreV1 = e,
		this.m_cornerDir1 = i,
		this.m_cornerConvex1 = o
	},
	o.prototype.SetNextEdge = function (t, e, i, o) {
		this.m_nextEdge = t,
		this.m_coreV2 = e,
		this.m_cornerDir2 = i,
		this.m_cornerConvex2 = o
	},
	s.b2MassData = function () {
		this.mass = 0,
		this.center = new c(0, 0),
		this.I = 0
	},
	Box2D.inherit(n, Box2D.Collision.Shapes.b2Shape),
	n.prototype.__super = Box2D.Collision.Shapes.b2Shape.prototype,
	n.b2PolygonShape = function () {
		Box2D.Collision.Shapes.b2Shape.b2Shape.apply(this, arguments)
	},
	n.prototype.Copy = function () {
		var t = new n;
		return t.Set(this),
		t
	},
	n.prototype.Set = function (t) {
		if (this.__super.Set.call(this, t), Box2D.is(t, n)) {
			var e = t instanceof n ? t : null;
			this.m_centroid.SetV(e.m_centroid),
			this.m_vertexCount = e.m_vertexCount,
			this.Reserve(this.m_vertexCount);
			for (var i = 0; this.m_vertexCount > i; i++)
				this.m_vertices[i].SetV(e.m_vertices[i]), this.m_normals[i].SetV(e.m_normals[i])
		}
	},
	n.prototype.SetAsArray = function (t, e) {
		e === void 0 && (e = 0);
		var i,
		o = new Vector,
		s = 0;
		for (s = 0; t.length > s; ++s)
			i = t[s], o.push(i);
		this.SetAsVector(o, e)
	},
	n.AsArray = function (t, e) {
		e === void 0 && (e = 0);
		var i = new n;
		return i.SetAsArray(t, e),
		i
	},
	n.prototype.SetAsVector = function (e, i) {
		i === void 0 && (i = 0),
		i == 0 && (i = e.length),
		t.b2Assert(i >= 2),
		this.m_vertexCount = i,
		this.Reserve(i);
		var o = 0;
		for (o = 0; this.m_vertexCount > o; o++)
			this.m_vertices[o].SetV(e[o]);
		for (o = 0; this.m_vertexCount > o; ++o) {
			var s = parseInt(o),
			r = parseInt(this.m_vertexCount > o + 1 ? o + 1 : 0),
			a = h.SubtractVV(this.m_vertices[r], this.m_vertices[s]);
			t.b2Assert(a.LengthSquared() > Number.MIN_VALUE),
			this.m_normals[o].SetV(h.CrossVF(a, 1)),
			this.m_normals[o].Normalize()
		}
		this.m_centroid = n.ComputeCentroid(this.m_vertices, this.m_vertexCount)
	},
	n.AsVector = function (t, e) {
		e === void 0 && (e = 0);
		var i = new n;
		return i.SetAsVector(t, e),
		i
	},
	n.prototype.SetAsBox = function (t, e) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		this.m_vertexCount = 4,
		this.Reserve(4),
		this.m_vertices[0].Set(-t, -e),
		this.m_vertices[1].Set(t, -e),
		this.m_vertices[2].Set(t, e),
		this.m_vertices[3].Set(-t, e),
		this.m_normals[0].Set(0, -1),
		this.m_normals[1].Set(1, 0),
		this.m_normals[2].Set(0, 1),
		this.m_normals[3].Set(-1, 0),
		this.m_centroid.SetZero()
	},
	n.AsBox = function (t, e) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0);
		var i = new n;
		return i.SetAsBox(t, e),
		i
	},
	n.prototype.SetAsOrientedBox = function (t, e, i, o) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		i === void 0 && (i = null),
		o === void 0 && (o = 0),
		this.m_vertexCount = 4,
		this.Reserve(4),
		this.m_vertices[0].Set(-t, -e),
		this.m_vertices[1].Set(t, -e),
		this.m_vertices[2].Set(t, e),
		this.m_vertices[3].Set(-t, e),
		this.m_normals[0].Set(0, -1),
		this.m_normals[1].Set(1, 0),
		this.m_normals[2].Set(0, 1),
		this.m_normals[3].Set(-1, 0),
		this.m_centroid = i;
		var s = new l;
		s.position = i,
		s.R.Set(o);
		for (var n = 0; this.m_vertexCount > n; ++n)
			this.m_vertices[n] = h.MulX(s, this.m_vertices[n]), this.m_normals[n] = h.MulMV(s.R, this.m_normals[n])
	},
	n.AsOrientedBox = function (t, e, i, o) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		i === void 0 && (i = null),
		o === void 0 && (o = 0);
		var s = new n;
		return s.SetAsOrientedBox(t, e, i, o),
		s
	},
	n.prototype.SetAsEdge = function (t, e) {
		this.m_vertexCount = 2,
		this.Reserve(2),
		this.m_vertices[0].SetV(t),
		this.m_vertices[1].SetV(e),
		this.m_centroid.x = .5 * (t.x + e.x),
		this.m_centroid.y = .5 * (t.y + e.y),
		this.m_normals[0] = h.CrossVF(h.SubtractVV(e, t), 1),
		this.m_normals[0].Normalize(),
		this.m_normals[1].x = -this.m_normals[0].x,
		this.m_normals[1].y = -this.m_normals[0].y
	},
	n.AsEdge = function (t, e) {
		var i = new n;
		return i.SetAsEdge(t, e),
		i
	},
	n.prototype.TestPoint = function (t, e) {
		for (var i, o = t.R, s = e.x - t.position.x, n = e.y - t.position.y, r = s * o.col1.x + n * o.col1.y, a = s * o.col2.x + n * o.col2.y, h = 0; this.m_vertexCount > h; ++h) {
			i = this.m_vertices[h],
			s = r - i.x,
			n = a - i.y,
			i = this.m_normals[h];
			var l = i.x * s + i.y * n;
			if (l > 0)
				return !1
		}
		return !0
	},
	n.prototype.RayCast = function (t, e, i) {
		var o,
		s,
		n = 0,
		r = e.maxFraction,
		a = 0,
		h = 0;
		a = e.p1.x - i.position.x,
		h = e.p1.y - i.position.y,
		o = i.R;
		var l = a * o.col1.x + h * o.col1.y,
		c = a * o.col2.x + h * o.col2.y;
		a = e.p2.x - i.position.x,
		h = e.p2.y - i.position.y,
		o = i.R;
		for (var m = a * o.col1.x + h * o.col1.y, _ = a * o.col2.x + h * o.col2.y, u = m - l, p = _ - c, y = parseInt(-1), d = 0; this.m_vertexCount > d; ++d) {
			s = this.m_vertices[d],
			a = s.x - l,
			h = s.y - c,
			s = this.m_normals[d];
			var x = s.x * a + s.y * h,
			f = s.x * u + s.y * p;
			if (f == 0) {
				if (0 > x)
					return !1
			} else
				0 > f && n * f > x ? (n = x / f, y = d) : f > 0 && r * f > x && (r = x / f);
			if (n - Number.MIN_VALUE > r)
				return !1
		}
		return 0 > y ? !1 : (t.fraction = n, o = i.R, s = this.m_normals[y], t.normal.x = o.col1.x * s.x + o.col2.x * s.y, t.normal.y = o.col1.y * s.x + o.col2.y * s.y, !0)
	},
	n.prototype.ComputeAABB = function (t, e) {
		for (var i = e.R, o = this.m_vertices[0], s = e.position.x + (i.col1.x * o.x + i.col2.x * o.y), n = e.position.y + (i.col1.y * o.x + i.col2.y * o.y), r = s, a = n, h = 1; this.m_vertexCount > h; ++h) {
			o = this.m_vertices[h];
			var l = e.position.x + (i.col1.x * o.x + i.col2.x * o.y),
			c = e.position.y + (i.col1.y * o.x + i.col2.y * o.y);
			s = l > s ? s : l,
			n = c > n ? n : c,
			r = r > l ? r : l,
			a = a > c ? a : c
		}
		t.lowerBound.x = s - this.m_radius,
		t.lowerBound.y = n - this.m_radius,
		t.upperBound.x = r + this.m_radius,
		t.upperBound.y = a + this.m_radius
	},
	n.prototype.ComputeMass = function (t, e) {
		if (e === void 0 && (e = 0), this.m_vertexCount == 2)
			return t.center.x = .5 * (this.m_vertices[0].x + this.m_vertices[1].x), t.center.y = .5 * (this.m_vertices[0].y + this.m_vertices[1].y), t.mass = 0, t.I = 0, void 0;
		for (var i = 0, o = 0, s = 0, n = 0, r = 0, a = 0, h = 1 / 3, l = 0; this.m_vertexCount > l; ++l) {
			var c = this.m_vertices[l],
			m = this.m_vertexCount > l + 1 ? this.m_vertices[parseInt(l + 1)] : this.m_vertices[0],
			_ = c.x - r,
			u = c.y - a,
			p = m.x - r,
			y = m.y - a,
			d = _ * y - u * p,
			x = .5 * d;
			s += x,
			i += x * h * (r + c.x + m.x),
			o += x * h * (a + c.y + m.y);
			var f = r,
			g = a,
			v = _,
			b = u,
			w = p,
			C = y,
			D = h * (.25 * (v * v + w * v + w * w) + (f * v + f * w)) + .5 * f * f,
			B = h * (.25 * (b * b + C * b + C * C) + (g * b + g * C)) + .5 * g * g;
			n += d * (D + B)
		}
		t.mass = e * s,
		i *= 1 / s,
		o *= 1 / s,
		t.center.Set(i, o),
		t.I = e * n
	},
	n.prototype.ComputeSubmergedArea = function (t, e, i, o) {
		e === void 0 && (e = 0);
		var n = h.MulTMV(i.R, t),
		r = e - h.Dot(t, i.position),
		a = new Vector_a2j_Number,
		l = 0,
		m = parseInt(-1),
		_ = parseInt(-1),
		u = !1,
		p = 0;
		for (p = 0; this.m_vertexCount > p; ++p) {
			a[p] = h.Dot(n, this.m_vertices[p]) - r;
			var y = -Number.MIN_VALUE > a[p];
			p > 0 && (y ? u || (m = p - 1, l++) : u && (_ = p - 1, l++)),
			u = y
		}
		switch (l) {
		case 0:
			if (u) {
				var d = new s;
				return this.ComputeMass(d, 1),
				o.SetV(h.MulX(i, d.center)),
				d.mass
			}
			return 0;
		case 1:
			m == -1 ? m = this.m_vertexCount - 1 : _ = this.m_vertexCount - 1
		}
		var x,
		f = parseInt((m + 1) % this.m_vertexCount),
		g = parseInt((_ + 1) % this.m_vertexCount),
		v = (0 - a[m]) / (a[f] - a[m]),
		b = (0 - a[_]) / (a[g] - a[_]),
		w = new c(this.m_vertices[m].x * (1 - v) + this.m_vertices[f].x * v, this.m_vertices[m].y * (1 - v) + this.m_vertices[f].y * v),
		C = new c(this.m_vertices[_].x * (1 - b) + this.m_vertices[g].x * b, this.m_vertices[_].y * (1 - b) + this.m_vertices[g].y * b),
		D = 0,
		B = new c,
		S = this.m_vertices[f];
		p = f;
		while (p != g) {
			p = (p + 1) % this.m_vertexCount,
			x = p == g ? C : this.m_vertices[p];
			var I = .5 * ((S.x - w.x) * (x.y - w.y) - (S.y - w.y) * (x.x - w.x));
			D += I,
			B.x += I * (w.x + S.x + x.x) / 3,
			B.y += I * (w.y + S.y + x.y) / 3,
			S = x
		}
		return B.Multiply(1 / D),
		o.SetV(h.MulX(i, B)),
		D
	},
	n.prototype.GetVertexCount = function () {
		return this.m_vertexCount
	},
	n.prototype.GetVertices = function () {
		return this.m_vertices
	},
	n.prototype.GetNormals = function () {
		return this.m_normals
	},
	n.prototype.GetSupport = function (t) {
		for (var e = 0, i = this.m_vertices[0].x * t.x + this.m_vertices[0].y * t.y, o = 1; this.m_vertexCount > o; ++o) {
			var s = this.m_vertices[o].x * t.x + this.m_vertices[o].y * t.y;
			s > i && (e = o, i = s)
		}
		return e
	},
	n.prototype.GetSupportVertex = function (t) {
		for (var e = 0, i = this.m_vertices[0].x * t.x + this.m_vertices[0].y * t.y, o = 1; this.m_vertexCount > o; ++o) {
			var s = this.m_vertices[o].x * t.x + this.m_vertices[o].y * t.y;
			s > i && (e = o, i = s)
		}
		return this.m_vertices[e]
	},
	n.prototype.Validate = function () {
		return !1
	},
	n.prototype.b2PolygonShape = function () {
		this.__super.b2Shape.call(this),
		this.m_type = r.e_polygonShape,
		this.m_centroid = new c,
		this.m_vertices = new Vector,
		this.m_normals = new Vector
	},
	n.prototype.Reserve = function (t) {
		t === void 0 && (t = 0);
		for (var e = parseInt(this.m_vertices.length); t > e; e++)
			this.m_vertices[e] = new c, this.m_normals[e] = new c
	},
	n.ComputeCentroid = function (t, e) {
		e === void 0 && (e = 0);
		for (var i = new c, o = 0, s = 0, n = 0, r = 1 / 3, a = 0; e > a; ++a) {
			var h = t[a],
			l = e > a + 1 ? t[parseInt(a + 1)] : t[0],
			m = h.x - s,
			_ = h.y - n,
			u = l.x - s,
			p = l.y - n,
			y = m * p - _ * u,
			d = .5 * y;
			o += d,
			i.x += d * r * (s + h.x + l.x),
			i.y += d * r * (n + h.y + l.y)
		}
		return i.x *= 1 / o,
		i.y *= 1 / o,
		i
	},
	n.ComputeOBB = function (t, e, i) {
		i === void 0 && (i = 0);
		var o = 0,
		s = new Vector(i + 1);
		for (o = 0; i > o; ++o)
			s[o] = e[o];
		s[i] = s[0];
		var n = Number.MAX_VALUE;
		for (o = 1; i >= o; ++o) {
			var r = s[parseInt(o - 1)],
			a = s[o].x - r.x,
			h = s[o].y - r.y,
			l = Math.sqrt(a * a + h * h);
			a /= l,
			h /= l;
			for (var c = -h, m = a, _ = Number.MAX_VALUE, u = Number.MAX_VALUE, p = -Number.MAX_VALUE, y = -Number.MAX_VALUE, d = 0; i > d; ++d) {
				var x = s[d].x - r.x,
				f = s[d].y - r.y,
				g = a * x + h * f,
				v = c * x + m * f;
				_ > g && (_ = g),
				u > v && (u = v),
				g > p && (p = g),
				v > y && (y = v)
			}
			var b = (p - _) * (y - u);
			if (.95 * n > b) {
				n = b,
				t.R.col1.x = a,
				t.R.col1.y = h,
				t.R.col2.x = c,
				t.R.col2.y = m;
				var w = .5 * (_ + p),
				C = .5 * (u + y),
				D = t.R;
				t.center.x = r.x + (D.col1.x * w + D.col2.x * C),
				t.center.y = r.y + (D.col1.y * w + D.col2.y * C),
				t.extents.x = .5 * (p - _),
				t.extents.y = .5 * (y - u)
			}
		}
	},
	Box2D.postDefs.push(function () {
		Box2D.Collision.Shapes.b2PolygonShape.s_mat = new a
	}),
	r.b2Shape = function () {},
	r.prototype.Copy = function () {
		return null
	},
	r.prototype.Set = function (t) {
		this.m_radius = t.m_radius
	},
	r.prototype.GetType = function () {
		return this.m_type
	},
	r.prototype.TestPoint = function () {
		return !1
	},
	r.prototype.RayCast = function () {
		return !1
	},
	r.prototype.ComputeAABB = function () {},
	r.prototype.ComputeMass = function (t, e) {
		e === void 0 && (e = 0)
	},
	r.prototype.ComputeSubmergedArea = function (t, e) {
		return e === void 0 && (e = 0),
		0
	},
	r.TestOverlap = function (t, e, i, o) {
		var s = new _;
		s.proxyA = new p,
		s.proxyA.Set(t),
		s.proxyB = new p,
		s.proxyB.Set(i),
		s.transformA = e,
		s.transformB = o,
		s.useRadii = !0;
		var n = new y;
		n.count = 0;
		var r = new u;
		return m.Distance(r, n, s),
		10 * Number.MIN_VALUE > r.distance
	},
	r.prototype.b2Shape = function () {
		this.m_type = r.e_unknownShape,
		this.m_radius = t.b2_linearSlop
	},
	Box2D.postDefs.push(function () {
		Box2D.Collision.Shapes.b2Shape.e_unknownShape = parseInt(-1),
		Box2D.Collision.Shapes.b2Shape.e_circleShape = 0,
		Box2D.Collision.Shapes.b2Shape.e_polygonShape = 1,
		Box2D.Collision.Shapes.b2Shape.e_edgeShape = 2,
		Box2D.Collision.Shapes.b2Shape.e_shapeTypeCount = 3,
		Box2D.Collision.Shapes.b2Shape.e_hitCollide = 1,
		Box2D.Collision.Shapes.b2Shape.e_missCollide = 0,
		Box2D.Collision.Shapes.b2Shape.e_startsInsideCollide = parseInt(-1)
	})
}
(), function () {
	var t = Box2D.Common.b2Color,
	e = (Box2D.Common.b2internal, Box2D.Common.b2Settings),
	i = (Box2D.Common.Math.b2Mat22, Box2D.Common.Math.b2Mat33, Box2D.Common.Math.b2Math);
	Box2D.Common.Math.b2Sweep,
	Box2D.Common.Math.b2Transform,
	Box2D.Common.Math.b2Vec2,
	Box2D.Common.Math.b2Vec3,
	t.b2Color = function () {
		this._r = 0,
		this._g = 0,
		this._b = 0
	},
	t.prototype.b2Color = function (t, e, o) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		o === void 0 && (o = 0),
		this._r = Box2D.parseUInt(255 * i.Clamp(t, 0, 1)),
		this._g = Box2D.parseUInt(255 * i.Clamp(e, 0, 1)),
		this._b = Box2D.parseUInt(255 * i.Clamp(o, 0, 1))
	},
	t.prototype.Set = function (t, e, o) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		o === void 0 && (o = 0),
		this._r = Box2D.parseUInt(255 * i.Clamp(t, 0, 1)),
		this._g = Box2D.parseUInt(255 * i.Clamp(e, 0, 1)),
		this._b = Box2D.parseUInt(255 * i.Clamp(o, 0, 1))
	},
	Object.defineProperty(t.prototype, "r", {
		enumerable : !1,
		configurable : !0,
		set : function (t) {
			t === void 0 && (t = 0),
			this._r = Box2D.parseUInt(255 * i.Clamp(t, 0, 1))
		}
	}),
	Object.defineProperty(t.prototype, "g", {
		enumerable : !1,
		configurable : !0,
		set : function (t) {
			t === void 0 && (t = 0),
			this._g = Box2D.parseUInt(255 * i.Clamp(t, 0, 1))
		}
	}),
	Object.defineProperty(t.prototype, "b", {
		enumerable : !1,
		configurable : !0,
		set : function (t) {
			t === void 0 && (t = 0),
			this._b = Box2D.parseUInt(255 * i.Clamp(t, 0, 1))
		}
	}),
	Object.defineProperty(t.prototype, "color", {
		enumerable : !1,
		configurable : !0,
		get : function () {
			return this._r << 16 | this._g << 8 | this._b
		}
	}),
	e.b2Settings = function () {},
	e.b2MixFriction = function (t, e) {
		return t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		Math.sqrt(t * e)
	},
	e.b2MixRestitution = function (t, e) {
		return t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		t > e ? t : e
	},
	e.b2Assert = function (t) {
		if (!t)
			throw "Assertion Failed"
	},
	Box2D.postDefs.push(function () {
		Box2D.Common.b2Settings.VERSION = "2.1alpha",
		Box2D.Common.b2Settings.USHRT_MAX = 65535,
		Box2D.Common.b2Settings.b2_pi = Math.PI,
		Box2D.Common.b2Settings.b2_maxManifoldPoints = 2,
		Box2D.Common.b2Settings.b2_aabbExtension = .1,
		Box2D.Common.b2Settings.b2_aabbMultiplier = 2,
		Box2D.Common.b2Settings.b2_polygonRadius = 2 * e.b2_linearSlop,
		Box2D.Common.b2Settings.b2_linearSlop = .005,
		Box2D.Common.b2Settings.b2_angularSlop = 2 / 180 * e.b2_pi,
		Box2D.Common.b2Settings.b2_toiSlop = 8 * e.b2_linearSlop,
		Box2D.Common.b2Settings.b2_maxTOIContactsPerIsland = 32,
		Box2D.Common.b2Settings.b2_maxTOIJointsPerIsland = 32,
		Box2D.Common.b2Settings.b2_velocityThreshold = 1,
		Box2D.Common.b2Settings.b2_maxLinearCorrection = .2,
		Box2D.Common.b2Settings.b2_maxAngularCorrection = 8 / 180 * e.b2_pi,
		Box2D.Common.b2Settings.b2_maxTranslation = 2,
		Box2D.Common.b2Settings.b2_maxTranslationSquared = e.b2_maxTranslation * e.b2_maxTranslation,
		Box2D.Common.b2Settings.b2_maxRotation = .5 * e.b2_pi,
		Box2D.Common.b2Settings.b2_maxRotationSquared = e.b2_maxRotation * e.b2_maxRotation,
		Box2D.Common.b2Settings.b2_contactBaumgarte = .2,
		Box2D.Common.b2Settings.b2_timeToSleep = .5,
		Box2D.Common.b2Settings.b2_linearSleepTolerance = .01,
		Box2D.Common.b2Settings.b2_angularSleepTolerance = 2 / 180 * e.b2_pi
	})
}
(), function () {
	var t = (Box2D.Collision.b2AABB, Box2D.Common.b2Color, Box2D.Common.b2internal, Box2D.Common.b2Settings, Box2D.Common.Math.b2Mat22),
	e = Box2D.Common.Math.b2Mat33,
	i = Box2D.Common.Math.b2Math,
	o = Box2D.Common.Math.b2Sweep,
	s = Box2D.Common.Math.b2Transform,
	n = Box2D.Common.Math.b2Vec2,
	r = Box2D.Common.Math.b2Vec3;
	t.b2Mat22 = function () {
		this.col1 = new n,
		this.col2 = new n
	},
	t.prototype.b2Mat22 = function () {
		this.SetIdentity()
	},
	t.FromAngle = function (e) {
		e === void 0 && (e = 0);
		var i = new t;
		return i.Set(e),
		i
	},
	t.FromVV = function (e, i) {
		var o = new t;
		return o.SetVV(e, i),
		o
	},
	t.prototype.Set = function (t) {
		t === void 0 && (t = 0);
		var e = Math.cos(t),
		i = Math.sin(t);
		this.col1.x = e,
		this.col2.x = -i,
		this.col1.y = i,
		this.col2.y = e
	},
	t.prototype.SetVV = function (t, e) {
		this.col1.SetV(t),
		this.col2.SetV(e)
	},
	t.prototype.Copy = function () {
		var e = new t;
		return e.SetM(this),
		e
	},
	t.prototype.SetM = function (t) {
		this.col1.SetV(t.col1),
		this.col2.SetV(t.col2)
	},
	t.prototype.AddM = function (t) {
		this.col1.x += t.col1.x,
		this.col1.y += t.col1.y,
		this.col2.x += t.col2.x,
		this.col2.y += t.col2.y
	},
	t.prototype.SetIdentity = function () {
		this.col1.x = 1,
		this.col2.x = 0,
		this.col1.y = 0,
		this.col2.y = 1
	},
	t.prototype.SetZero = function () {
		this.col1.x = 0,
		this.col2.x = 0,
		this.col1.y = 0,
		this.col2.y = 0
	},
	t.prototype.GetAngle = function () {
		return Math.atan2(this.col1.y, this.col1.x)
	},
	t.prototype.GetInverse = function (t) {
		var e = this.col1.x,
		i = this.col2.x,
		o = this.col1.y,
		s = this.col2.y,
		n = e * s - i * o;
		return n != 0 && (n = 1 / n),
		t.col1.x = n * s,
		t.col2.x = -n * i,
		t.col1.y = -n * o,
		t.col2.y = n * e,
		t
	},
	t.prototype.Solve = function (t, e, i) {
		e === void 0 && (e = 0),
		i === void 0 && (i = 0);
		var o = this.col1.x,
		s = this.col2.x,
		n = this.col1.y,
		r = this.col2.y,
		a = o * r - s * n;
		return a != 0 && (a = 1 / a),
		t.x = a * (r * e - s * i),
		t.y = a * (o * i - n * e),
		t
	},
	t.prototype.Abs = function () {
		this.col1.Abs(),
		this.col2.Abs()
	},
	e.b2Mat33 = function () {
		this.col1 = new r,
		this.col2 = new r,
		this.col3 = new r
	},
	e.prototype.b2Mat33 = function (t, e, i) {
		t === void 0 && (t = null),
		e === void 0 && (e = null),
		i === void 0 && (i = null),
		t || e || i ? (this.col1.SetV(t), this.col2.SetV(e), this.col3.SetV(i)) : (this.col1.SetZero(), this.col2.SetZero(), this.col3.SetZero())
	},
	e.prototype.SetVVV = function (t, e, i) {
		this.col1.SetV(t),
		this.col2.SetV(e),
		this.col3.SetV(i)
	},
	e.prototype.Copy = function () {
		return new e(this.col1, this.col2, this.col3)
	},
	e.prototype.SetM = function (t) {
		this.col1.SetV(t.col1),
		this.col2.SetV(t.col2),
		this.col3.SetV(t.col3)
	},
	e.prototype.AddM = function (t) {
		this.col1.x += t.col1.x,
		this.col1.y += t.col1.y,
		this.col1.z += t.col1.z,
		this.col2.x += t.col2.x,
		this.col2.y += t.col2.y,
		this.col2.z += t.col2.z,
		this.col3.x += t.col3.x,
		this.col3.y += t.col3.y,
		this.col3.z += t.col3.z
	},
	e.prototype.SetIdentity = function () {
		this.col1.x = 1,
		this.col2.x = 0,
		this.col3.x = 0,
		this.col1.y = 0,
		this.col2.y = 1,
		this.col3.y = 0,
		this.col1.z = 0,
		this.col2.z = 0,
		this.col3.z = 1
	},
	e.prototype.SetZero = function () {
		this.col1.x = 0,
		this.col2.x = 0,
		this.col3.x = 0,
		this.col1.y = 0,
		this.col2.y = 0,
		this.col3.y = 0,
		this.col1.z = 0,
		this.col2.z = 0,
		this.col3.z = 0
	},
	e.prototype.Solve22 = function (t, e, i) {
		e === void 0 && (e = 0),
		i === void 0 && (i = 0);
		var o = this.col1.x,
		s = this.col2.x,
		n = this.col1.y,
		r = this.col2.y,
		a = o * r - s * n;
		return a != 0 && (a = 1 / a),
		t.x = a * (r * e - s * i),
		t.y = a * (o * i - n * e),
		t
	},
	e.prototype.Solve33 = function (t, e, i, o) {
		e === void 0 && (e = 0),
		i === void 0 && (i = 0),
		o === void 0 && (o = 0);
		var s = this.col1.x,
		n = this.col1.y,
		r = this.col1.z,
		a = this.col2.x,
		h = this.col2.y,
		l = this.col2.z,
		c = this.col3.x,
		m = this.col3.y,
		_ = this.col3.z,
		u = s * (h * _ - l * m) + n * (l * c - a * _) + r * (a * m - h * c);
		return u != 0 && (u = 1 / u),
		t.x = u * (e * (h * _ - l * m) + i * (l * c - a * _) + o * (a * m - h * c)),
		t.y = u * (s * (i * _ - o * m) + n * (o * c - e * _) + r * (e * m - i * c)),
		t.z = u * (s * (h * o - l * i) + n * (l * e - a * o) + r * (a * i - h * e)),
		t
	},
	i.b2Math = function () {},
	i.IsValid = function (t) {
		return t === void 0 && (t = 0),
		isFinite(t)
	},
	i.Dot = function (t, e) {
		return t.x * e.x + t.y * e.y
	},
	i.CrossVV = function (t, e) {
		return t.x * e.y - t.y * e.x
	},
	i.CrossVF = function (t, e) {
		e === void 0 && (e = 0);
		var i = new n(e * t.y, -e * t.x);
		return i
	},
	i.CrossFV = function (t, e) {
		t === void 0 && (t = 0);
		var i = new n(-t * e.y, t * e.x);
		return i
	},
	i.MulMV = function (t, e) {
		var i = new n(t.col1.x * e.x + t.col2.x * e.y, t.col1.y * e.x + t.col2.y * e.y);
		return i
	},
	i.MulTMV = function (t, e) {
		var o = new n(i.Dot(e, t.col1), i.Dot(e, t.col2));
		return o
	},
	i.MulX = function (t, e) {
		var o = i.MulMV(t.R, e);
		return o.x += t.position.x,
		o.y += t.position.y,
		o
	},
	i.MulXT = function (t, e) {
		var o = i.SubtractVV(e, t.position),
		s = o.x * t.R.col1.x + o.y * t.R.col1.y;
		return o.y = o.x * t.R.col2.x + o.y * t.R.col2.y,
		o.x = s,
		o
	},
	i.AddVV = function (t, e) {
		var i = new n(t.x + e.x, t.y + e.y);
		return i
	},
	i.SubtractVV = function (t, e) {
		var i = new n(t.x - e.x, t.y - e.y);
		return i
	},
	i.Distance = function (t, e) {
		var i = t.x - e.x,
		o = t.y - e.y;
		return Math.sqrt(i * i + o * o)
	},
	i.DistanceSquared = function (t, e) {
		var i = t.x - e.x,
		o = t.y - e.y;
		return i * i + o * o
	},
	i.MulFV = function (t, e) {
		t === void 0 && (t = 0);
		var i = new n(t * e.x, t * e.y);
		return i
	},
	i.AddMM = function (e, o) {
		var s = t.FromVV(i.AddVV(e.col1, o.col1), i.AddVV(e.col2, o.col2));
		return s
	},
	i.MulMM = function (e, o) {
		var s = t.FromVV(i.MulMV(e, o.col1), i.MulMV(e, o.col2));
		return s
	},
	i.MulTMM = function (e, o) {
		var s = new n(i.Dot(e.col1, o.col1), i.Dot(e.col2, o.col1)),
		r = new n(i.Dot(e.col1, o.col2), i.Dot(e.col2, o.col2)),
		a = t.FromVV(s, r);
		return a
	},
	i.Abs = function (t) {
		return t === void 0 && (t = 0),
		t > 0 ? t : -t
	},
	i.AbsV = function (t) {
		var e = new n(i.Abs(t.x), i.Abs(t.y));
		return e
	},
	i.AbsM = function (e) {
		var o = t.FromVV(i.AbsV(e.col1), i.AbsV(e.col2));
		return o
	},
	i.Min = function (t, e) {
		return t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		e > t ? t : e
	},
	i.MinV = function (t, e) {
		var o = new n(i.Min(t.x, e.x), i.Min(t.y, e.y));
		return o
	},
	i.Max = function (t, e) {
		return t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		t > e ? t : e
	},
	i.MaxV = function (t, e) {
		var o = new n(i.Max(t.x, e.x), i.Max(t.y, e.y));
		return o
	},
	i.Clamp = function (t, e, i) {
		return t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		i === void 0 && (i = 0),
		e > t ? e : t > i ? i : t
	},
	i.ClampV = function (t, e, o) {
		return i.MaxV(e, i.MinV(t, o))
	},
	i.Swap = function (t, e) {
		var i = t[0];
		t[0] = e[0],
		e[0] = i
	},
	i.Random = function () {
		return Math.random() * 2 - 1
	},
	i.RandomRange = function (t, e) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0);
		var i = Math.random();
		return i = (e - t) * i + t
	},
	i.NextPowerOfTwo = function (t) {
		return t === void 0 && (t = 0),
		t |= t >> 1 & 2147483647,
		t |= t >> 2 & 1073741823,
		t |= t >> 4 & 268435455,
		t |= t >> 8 & 16777215,
		t |= t >> 16 & 65535,
		t + 1
	},
	i.IsPowerOfTwo = function (t) {
		t === void 0 && (t = 0);
		var e = t > 0 && (t & t - 1) == 0;
		return e
	},
	Box2D.postDefs.push(function () {
		Box2D.Common.Math.b2Math.b2Vec2_zero = new n(0, 0),
		Box2D.Common.Math.b2Math.b2Mat22_identity = t.FromVV(new n(1, 0), new n(0, 1)),
		Box2D.Common.Math.b2Math.b2Transform_identity = new s(i.b2Vec2_zero, i.b2Mat22_identity)
	}),
	o.b2Sweep = function () {
		this.localCenter = new n,
		this.c0 = new n,
		this.c = new n
	},
	o.prototype.Set = function (t) {
		this.localCenter.SetV(t.localCenter),
		this.c0.SetV(t.c0),
		this.c.SetV(t.c),
		this.a0 = t.a0,
		this.a = t.a,
		this.t0 = t.t0
	},
	o.prototype.Copy = function () {
		var t = new o;
		return t.localCenter.SetV(this.localCenter),
		t.c0.SetV(this.c0),
		t.c.SetV(this.c),
		t.a0 = this.a0,
		t.a = this.a,
		t.t0 = this.t0,
		t
	},
	o.prototype.GetTransform = function (t, e) {
		e === void 0 && (e = 0),
		t.position.x = (1 - e) * this.c0.x + e * this.c.x,
		t.position.y = (1 - e) * this.c0.y + e * this.c.y;
		var i = (1 - e) * this.a0 + e * this.a;
		t.R.Set(i);
		var o = t.R;
		t.position.x -= o.col1.x * this.localCenter.x + o.col2.x * this.localCenter.y,
		t.position.y -= o.col1.y * this.localCenter.x + o.col2.y * this.localCenter.y
	},
	o.prototype.Advance = function (t) {
		if (t === void 0 && (t = 0), t > this.t0 && 1 - this.t0 > Number.MIN_VALUE) {
			var e = (t - this.t0) / (1 - this.t0);
			this.c0.x = (1 - e) * this.c0.x + e * this.c.x,
			this.c0.y = (1 - e) * this.c0.y + e * this.c.y,
			this.a0 = (1 - e) * this.a0 + e * this.a,
			this.t0 = t
		}
	},
	s.b2Transform = function () {
		this.position = new n,
		this.R = new t
	},
	s.prototype.b2Transform = function (t, e) {
		t === void 0 && (t = null),
		e === void 0 && (e = null),
		t && (this.position.SetV(t), this.R.SetM(e))
	},
	s.prototype.Initialize = function (t, e) {
		this.position.SetV(t),
		this.R.SetM(e)
	},
	s.prototype.SetIdentity = function () {
		this.position.SetZero(),
		this.R.SetIdentity()
	},
	s.prototype.Set = function (t) {
		this.position.SetV(t.position),
		this.R.SetM(t.R)
	},
	s.prototype.GetAngle = function () {
		return Math.atan2(this.R.col1.y, this.R.col1.x)
	},
	n.b2Vec2 = function () {},
	n.prototype.b2Vec2 = function (t, e) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		this.x = t,
		this.y = e
	},
	n.prototype.SetZero = function () {
		this.x = 0,
		this.y = 0
	},
	n.prototype.Set = function (t, e) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		this.x = t,
		this.y = e
	},
	n.prototype.SetV = function (t) {
		this.x = t.x,
		this.y = t.y
	},
	n.prototype.GetNegative = function () {
		return new n(-this.x, -this.y)
	},
	n.prototype.NegativeSelf = function () {
		this.x = -this.x,
		this.y = -this.y
	},
	n.Make = function (t, e) {
		return t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		new n(t, e)
	},
	n.prototype.Copy = function () {
		return new n(this.x, this.y)
	},
	n.prototype.Add = function (t) {
		this.x += t.x,
		this.y += t.y
	},
	n.prototype.Subtract = function (t) {
		this.x -= t.x,
		this.y -= t.y
	},
	n.prototype.Multiply = function (t) {
		t === void 0 && (t = 0),
		this.x *= t,
		this.y *= t
	},
	n.prototype.MulM = function (t) {
		var e = this.x;
		this.x = t.col1.x * e + t.col2.x * this.y,
		this.y = t.col1.y * e + t.col2.y * this.y
	},
	n.prototype.MulTM = function (t) {
		var e = i.Dot(this, t.col1);
		this.y = i.Dot(this, t.col2),
		this.x = e
	},
	n.prototype.CrossVF = function (t) {
		t === void 0 && (t = 0);
		var e = this.x;
		this.x = t * this.y,
		this.y = -t * e
	},
	n.prototype.CrossFV = function (t) {
		t === void 0 && (t = 0);
		var e = this.x;
		this.x = -t * this.y,
		this.y = t * e
	},
	n.prototype.MinV = function (t) {
		this.x = t.x > this.x ? this.x : t.x,
		this.y = t.y > this.y ? this.y : t.y
	},
	n.prototype.MaxV = function (t) {
		this.x = this.x > t.x ? this.x : t.x,
		this.y = this.y > t.y ? this.y : t.y
	},
	n.prototype.Abs = function () {
		0 > this.x && (this.x = -this.x),
		0 > this.y && (this.y = -this.y)
	},
	n.prototype.Length = function () {
		return Math.sqrt(this.x * this.x + this.y * this.y)
	},
	n.prototype.LengthSquared = function () {
		return this.x * this.x + this.y * this.y
	},
	n.prototype.Normalize = function () {
		var t = Math.sqrt(this.x * this.x + this.y * this.y);
		if (Number.MIN_VALUE > t)
			return 0;
		var e = 1 / t;
		return this.x *= e,
		this.y *= e,
		t
	},
	n.prototype.IsValid = function () {
		return i.IsValid(this.x) && i.IsValid(this.y)
	},
	r.b2Vec3 = function () {},
	r.prototype.b2Vec3 = function (t, e, i) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		i === void 0 && (i = 0),
		this.x = t,
		this.y = e,
		this.z = i
	},
	r.prototype.SetZero = function () {
		this.x = this.y = this.z = 0
	},
	r.prototype.Set = function (t, e, i) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		i === void 0 && (i = 0),
		this.x = t,
		this.y = e,
		this.z = i
	},
	r.prototype.SetV = function (t) {
		this.x = t.x,
		this.y = t.y,
		this.z = t.z
	},
	r.prototype.GetNegative = function () {
		return new r(-this.x, -this.y, -this.z)
	},
	r.prototype.NegativeSelf = function () {
		this.x = -this.x,
		this.y = -this.y,
		this.z = -this.z
	},
	r.prototype.Copy = function () {
		return new r(this.x, this.y, this.z)
	},
	r.prototype.Add = function (t) {
		this.x += t.x,
		this.y += t.y,
		this.z += t.z
	},
	r.prototype.Subtract = function (t) {
		this.x -= t.x,
		this.y -= t.y,
		this.z -= t.z
	},
	r.prototype.Multiply = function (t) {
		t === void 0 && (t = 0),
		this.x *= t,
		this.y *= t,
		this.z *= t
	}
}
(), function () {
	var t = (Box2D.Dynamics.Controllers.b2ControllerEdge, Box2D.Common.Math.b2Mat22, Box2D.Common.Math.b2Mat33, Box2D.Common.Math.b2Math),
	e = Box2D.Common.Math.b2Sweep,
	i = Box2D.Common.Math.b2Transform,
	o = Box2D.Common.Math.b2Vec2,
	s = (Box2D.Common.Math.b2Vec3, Box2D.Common.b2Color),
	n = (Box2D.Common.b2internal, Box2D.Common.b2Settings),
	r = Box2D.Collision.b2AABB,
	a = (Box2D.Collision.b2Bound, Box2D.Collision.b2BoundValues, Box2D.Collision.b2Collision, Box2D.Collision.b2ContactID, Box2D.Collision.b2ContactPoint),
	h = (Box2D.Collision.b2Distance, Box2D.Collision.b2DistanceInput, Box2D.Collision.b2DistanceOutput, Box2D.Collision.b2DistanceProxy, Box2D.Collision.b2DynamicTree, Box2D.Collision.b2DynamicTreeBroadPhase),
	l = (Box2D.Collision.b2DynamicTreeNode, Box2D.Collision.b2DynamicTreePair, Box2D.Collision.b2Manifold, Box2D.Collision.b2ManifoldPoint, Box2D.Collision.b2Point, Box2D.Collision.b2RayCastInput),
	c = Box2D.Collision.b2RayCastOutput,
	m = (Box2D.Collision.b2Segment, Box2D.Collision.b2SeparationFunction, Box2D.Collision.b2Simplex, Box2D.Collision.b2SimplexCache, Box2D.Collision.b2SimplexVertex, Box2D.Collision.b2TimeOfImpact, Box2D.Collision.b2TOIInput, Box2D.Collision.b2WorldManifold, Box2D.Collision.ClipVertex, Box2D.Collision.Features, Box2D.Collision.IBroadPhase, Box2D.Collision.Shapes.b2CircleShape),
	_ = (Box2D.Collision.Shapes.b2EdgeChainDef, Box2D.Collision.Shapes.b2EdgeShape),
	u = Box2D.Collision.Shapes.b2MassData,
	p = Box2D.Collision.Shapes.b2PolygonShape,
	y = Box2D.Collision.Shapes.b2Shape,
	d = Box2D.Dynamics.b2Body,
	x = Box2D.Dynamics.b2BodyDef,
	f = Box2D.Dynamics.b2ContactFilter,
	g = Box2D.Dynamics.b2ContactImpulse,
	v = Box2D.Dynamics.b2ContactListener,
	b = Box2D.Dynamics.b2ContactManager,
	w = Box2D.Dynamics.b2DebugDraw,
	C = Box2D.Dynamics.b2DestructionListener,
	D = Box2D.Dynamics.b2FilterData,
	B = Box2D.Dynamics.b2Fixture,
	S = Box2D.Dynamics.b2FixtureDef,
	I = Box2D.Dynamics.b2Island,
	A = Box2D.Dynamics.b2TimeStep,
	M = Box2D.Dynamics.b2World,
	T = (Box2D.Dynamics.Contacts.b2CircleContact, Box2D.Dynamics.Contacts.b2Contact),
	V = (Box2D.Dynamics.Contacts.b2ContactConstraint, Box2D.Dynamics.Contacts.b2ContactConstraintPoint, Box2D.Dynamics.Contacts.b2ContactEdge, Box2D.Dynamics.Contacts.b2ContactFactory),
	P = (Box2D.Dynamics.Contacts.b2ContactRegister, Box2D.Dynamics.Contacts.b2ContactResult, Box2D.Dynamics.Contacts.b2ContactSolver),
	R = (Box2D.Dynamics.Contacts.b2EdgeAndCircleContact, Box2D.Dynamics.Contacts.b2NullContact, Box2D.Dynamics.Contacts.b2PolyAndCircleContact, Box2D.Dynamics.Contacts.b2PolyAndEdgeContact, Box2D.Dynamics.Contacts.b2PolygonContact, Box2D.Dynamics.Contacts.b2PositionSolverManifold, Box2D.Dynamics.Controllers.b2Controller, Box2D.Dynamics.Joints.b2DistanceJoint, Box2D.Dynamics.Joints.b2DistanceJointDef, Box2D.Dynamics.Joints.b2FrictionJoint, Box2D.Dynamics.Joints.b2FrictionJointDef, Box2D.Dynamics.Joints.b2GearJoint, Box2D.Dynamics.Joints.b2GearJointDef, Box2D.Dynamics.Joints.b2Jacobian, Box2D.Dynamics.Joints.b2Joint),
	k = (Box2D.Dynamics.Joints.b2JointDef, Box2D.Dynamics.Joints.b2JointEdge, Box2D.Dynamics.Joints.b2LineJoint, Box2D.Dynamics.Joints.b2LineJointDef, Box2D.Dynamics.Joints.b2MouseJoint, Box2D.Dynamics.Joints.b2MouseJointDef, Box2D.Dynamics.Joints.b2PrismaticJoint, Box2D.Dynamics.Joints.b2PrismaticJointDef, Box2D.Dynamics.Joints.b2PulleyJoint);
	Box2D.Dynamics.Joints.b2PulleyJointDef,
	Box2D.Dynamics.Joints.b2RevoluteJoint,
	Box2D.Dynamics.Joints.b2RevoluteJointDef,
	Box2D.Dynamics.Joints.b2WeldJoint,
	Box2D.Dynamics.Joints.b2WeldJointDef,
	d.b2Body = function () {
		this.m_xf = new i,
		this.m_sweep = new e,
		this.m_linearVelocity = new o,
		this.m_force = new o
	},
	d.prototype.connectEdges = function (e, i, o) {
		o === void 0 && (o = 0);
		var s = Math.atan2(i.GetDirectionVector().y, i.GetDirectionVector().x),
		r = Math.tan((s - o) * .5),
		a = t.MulFV(r, i.GetDirectionVector());
		a = t.SubtractVV(a, i.GetNormalVector()),
		a = t.MulFV(n.b2_toiSlop, a),
		a = t.AddVV(a, i.GetVertex1());
		var h = t.AddVV(e.GetDirectionVector(), i.GetDirectionVector());
		h.Normalize();
		var l = t.Dot(e.GetDirectionVector(), i.GetNormalVector()) > 0;
		return e.SetNextEdge(i, a, h, l),
		i.SetPrevEdge(e, a, h, l),
		s
	},
	d.prototype.CreateFixture = function (t) {
		if (this.m_world.IsLocked() == 1)
			return null;
		var e = new B;
		if (e.Create(this, this.m_xf, t), this.m_flags & d.e_activeFlag) {
			var i = this.m_world.m_contactManager.m_broadPhase;
			e.CreateProxy(i, this.m_xf)
		}
		return e.m_next = this.m_fixtureList,
		this.m_fixtureList = e,
		++this.m_fixtureCount,
		e.m_body = this,
		e.m_density > 0 && this.ResetMassData(),
		this.m_world.m_flags |= M.e_newFixture,
		e
	},
	d.prototype.CreateFixture2 = function (t, e) {
		e === void 0 && (e = 0);
		var i = new S;
		return i.shape = t,
		i.density = e,
		this.CreateFixture(i)
	},
	d.prototype.DestroyFixture = function (t) {
		if (this.m_world.IsLocked() != 1) {
			var e = this.m_fixtureList,
			i = null,
			o = !1;
			while (e != null) {
				if (e == t) {
					i ? i.m_next = t.m_next : this.m_fixtureList = t.m_next,
					o = !0;
					break
				}
				i = e,
				e = e.m_next
			}
			var s = this.m_contactList;
			while (s) {
				var n = s.contact;
				s = s.next;
				var r = n.GetFixtureA(),
				a = n.GetFixtureB();
				(t == r || t == a) && this.m_world.m_contactManager.Destroy(n)
			}
			if (this.m_flags & d.e_activeFlag) {
				var h = this.m_world.m_contactManager.m_broadPhase;
				t.DestroyProxy(h)
			}
			t.Destroy(),
			t.m_body = null,
			t.m_next = null,
			--this.m_fixtureCount,
			this.ResetMassData()
		}
	},
	d.prototype.SetPositionAndAngle = function (t, e) {
		e === void 0 && (e = 0);
		var i;
		if (this.m_world.IsLocked() != 1) {
			this.m_xf.R.Set(e),
			this.m_xf.position.SetV(t);
			var o = this.m_xf.R,
			s = this.m_sweep.localCenter;
			this.m_sweep.c.x = o.col1.x * s.x + o.col2.x * s.y,
			this.m_sweep.c.y = o.col1.y * s.x + o.col2.y * s.y,
			this.m_sweep.c.x += this.m_xf.position.x,
			this.m_sweep.c.y += this.m_xf.position.y,
			this.m_sweep.c0.SetV(this.m_sweep.c),
			this.m_sweep.a0 = this.m_sweep.a = e;
			var n = this.m_world.m_contactManager.m_broadPhase;
			for (i = this.m_fixtureList; i; i = i.m_next)
				i.Synchronize(n, this.m_xf, this.m_xf);
			this.m_world.m_contactManager.FindNewContacts()
		}
	},
	d.prototype.SetTransform = function (t) {
		this.SetPositionAndAngle(t.position, t.GetAngle())
	},
	d.prototype.GetTransform = function () {
		return this.m_xf
	},
	d.prototype.GetPosition = function () {
		return this.m_xf.position
	},
	d.prototype.SetPosition = function (t) {
		this.SetPositionAndAngle(t, this.GetAngle())
	},
	d.prototype.GetAngle = function () {
		return this.m_sweep.a
	},
	d.prototype.SetAngle = function (t) {
		t === void 0 && (t = 0),
		this.SetPositionAndAngle(this.GetPosition(), t)
	},
	d.prototype.GetWorldCenter = function () {
		return this.m_sweep.c
	},
	d.prototype.GetLocalCenter = function () {
		return this.m_sweep.localCenter
	},
	d.prototype.SetLinearVelocity = function (t) {
		this.m_type != d.b2_staticBody && this.m_linearVelocity.SetV(t)
	},
	d.prototype.GetLinearVelocity = function () {
		return this.m_linearVelocity
	},
	d.prototype.SetAngularVelocity = function (t) {
		t === void 0 && (t = 0),
		this.m_type != d.b2_staticBody && (this.m_angularVelocity = t)
	},
	d.prototype.GetAngularVelocity = function () {
		return this.m_angularVelocity
	},
	d.prototype.GetDefinition = function () {
		var t = new x;
		return t.type = this.GetType(),
		t.allowSleep = (this.m_flags & d.e_allowSleepFlag) == d.e_allowSleepFlag,
		t.angle = this.GetAngle(),
		t.angularDamping = this.m_angularDamping,
		t.angularVelocity = this.m_angularVelocity,
		t.fixedRotation = (this.m_flags & d.e_fixedRotationFlag) == d.e_fixedRotationFlag,
		t.bullet = (this.m_flags & d.e_bulletFlag) == d.e_bulletFlag,
		t.awake = (this.m_flags & d.e_awakeFlag) == d.e_awakeFlag,
		t.linearDamping = this.m_linearDamping,
		t.linearVelocity.SetV(this.GetLinearVelocity()),
		t.position = this.GetPosition(),
		t.userData = this.GetUserData(),
		t
	},
	d.prototype.ApplyForce = function (t, e) {
		this.m_type == d.b2_dynamicBody && (this.IsAwake() == 0 && this.SetAwake(!0), this.m_force.x += t.x, this.m_force.y += t.y, this.m_torque += (e.x - this.m_sweep.c.x) * t.y - (e.y - this.m_sweep.c.y) * t.x)
	},
	d.prototype.ApplyTorque = function (t) {
		t === void 0 && (t = 0),
		this.m_type == d.b2_dynamicBody && (this.IsAwake() == 0 && this.SetAwake(!0), this.m_torque += t)
	},
	d.prototype.ApplyImpulse = function (t, e) {
		this.m_type == d.b2_dynamicBody && (this.IsAwake() == 0 && this.SetAwake(!0), this.m_linearVelocity.x += this.m_invMass * t.x, this.m_linearVelocity.y += this.m_invMass * t.y, this.m_angularVelocity += this.m_invI * ((e.x - this.m_sweep.c.x) * t.y - (e.y - this.m_sweep.c.y) * t.x))
	},
	d.prototype.Split = function (e) {
		for (var i, o = this.GetLinearVelocity().Copy(), s = this.GetAngularVelocity(), n = this.GetWorldCenter(), r = this, a = this.m_world.CreateBody(this.GetDefinition()), h = r.m_fixtureList; h; )
			if (e(h)) {
				var l = h.m_next;
				i ? i.m_next = l : r.m_fixtureList = l,
				r.m_fixtureCount--,
				h.m_next = a.m_fixtureList,
				a.m_fixtureList = h,
				a.m_fixtureCount++,
				h.m_body = a,
				h = l
			} else
				i = h, h = h.m_next;
		r.ResetMassData(),
		a.ResetMassData();
		var c = r.GetWorldCenter(),
		m = a.GetWorldCenter(),
		_ = t.AddVV(o, t.CrossFV(s, t.SubtractVV(c, n))),
		u = t.AddVV(o, t.CrossFV(s, t.SubtractVV(m, n)));
		return r.SetLinearVelocity(_),
		a.SetLinearVelocity(u),
		r.SetAngularVelocity(s),
		a.SetAngularVelocity(s),
		r.SynchronizeFixtures(),
		a.SynchronizeFixtures(),
		a
	},
	d.prototype.Merge = function (t) {
		var e;
		for (e = t.m_fixtureList; e; ) {
			var i = e.m_next;
			t.m_fixtureCount--,
			e.m_next = this.m_fixtureList,
			this.m_fixtureList = e,
			this.m_fixtureCount++,
			e.m_body = s,
			e = i
		}
		o.m_fixtureCount = 0;
		var o = this,
		s = t;
		o.GetWorldCenter(),
		s.GetWorldCenter(),
		o.GetLinearVelocity().Copy(),
		s.GetLinearVelocity().Copy(),
		o.GetAngularVelocity(),
		s.GetAngularVelocity(),
		o.ResetMassData(),
		this.SynchronizeFixtures()
	},
	d.prototype.GetMass = function () {
		return this.m_mass
	},
	d.prototype.GetInertia = function () {
		return this.m_I
	},
	d.prototype.GetMassData = function (t) {
		t.mass = this.m_mass,
		t.I = this.m_I,
		t.center.SetV(this.m_sweep.localCenter)
	},
	d.prototype.SetMassData = function (e) {
		if (n.b2Assert(this.m_world.IsLocked() == 0), this.m_world.IsLocked() != 1 && this.m_type == d.b2_dynamicBody) {
			this.m_invMass = 0,
			this.m_I = 0,
			this.m_invI = 0,
			this.m_mass = e.mass,
			this.m_mass > 0 || (this.m_mass = 1),
			this.m_invMass = 1 / this.m_mass,
			e.I > 0 && (this.m_flags & d.e_fixedRotationFlag) == 0 && (this.m_I = e.I - this.m_mass * (e.center.x * e.center.x + e.center.y * e.center.y), this.m_invI = 1 / this.m_I);
			var i = this.m_sweep.c.Copy();
			this.m_sweep.localCenter.SetV(e.center),
			this.m_sweep.c0.SetV(t.MulX(this.m_xf, this.m_sweep.localCenter)),
			this.m_sweep.c.SetV(this.m_sweep.c0),
			this.m_linearVelocity.x += this.m_angularVelocity *  - (this.m_sweep.c.y - i.y),
			this.m_linearVelocity.y += this.m_angularVelocity *  + (this.m_sweep.c.x - i.x)
		}
	},
	d.prototype.ResetMassData = function () {
		if (this.m_mass = 0, this.m_invMass = 0, this.m_I = 0, this.m_invI = 0, this.m_sweep.localCenter.SetZero(), this.m_type != d.b2_staticBody && this.m_type != d.b2_kinematicBody) {
			for (var e = o.Make(0, 0), i = this.m_fixtureList; i; i = i.m_next)
				if (i.m_density != 0) {
					var s = i.GetMassData();
					this.m_mass += s.mass,
					e.x += s.center.x * s.mass,
					e.y += s.center.y * s.mass,
					this.m_I += s.I
				}
			this.m_mass > 0 ? (this.m_invMass = 1 / this.m_mass, e.x *= this.m_invMass, e.y *= this.m_invMass) : (this.m_mass = 1, this.m_invMass = 1),
			this.m_I > 0 && (this.m_flags & d.e_fixedRotationFlag) == 0 ? (this.m_I -= this.m_mass * (e.x * e.x + e.y * e.y), this.m_I *= this.m_inertiaScale, n.b2Assert(this.m_I > 0), this.m_invI = 1 / this.m_I) : (this.m_I = 0, this.m_invI = 0);
			var r = this.m_sweep.c.Copy();
			this.m_sweep.localCenter.SetV(e),
			this.m_sweep.c0.SetV(t.MulX(this.m_xf, this.m_sweep.localCenter)),
			this.m_sweep.c.SetV(this.m_sweep.c0),
			this.m_linearVelocity.x += this.m_angularVelocity *  - (this.m_sweep.c.y - r.y),
			this.m_linearVelocity.y += this.m_angularVelocity *  + (this.m_sweep.c.x - r.x)
		}
	},
	d.prototype.GetWorldPoint = function (t) {
		var e = this.m_xf.R,
		i = new o(e.col1.x * t.x + e.col2.x * t.y, e.col1.y * t.x + e.col2.y * t.y);
		return i.x += this.m_xf.position.x,
		i.y += this.m_xf.position.y,
		i
	},
	d.prototype.GetWorldVector = function (e) {
		return t.MulMV(this.m_xf.R, e)
	},
	d.prototype.GetLocalPoint = function (e) {
		return t.MulXT(this.m_xf, e)
	},
	d.prototype.GetLocalVector = function (e) {
		return t.MulTMV(this.m_xf.R, e)
	},
	d.prototype.GetLinearVelocityFromWorldPoint = function (t) {
		return new o(this.m_linearVelocity.x - this.m_angularVelocity * (t.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (t.x - this.m_sweep.c.x))
	},
	d.prototype.GetLinearVelocityFromLocalPoint = function (t) {
		var e = this.m_xf.R,
		i = new o(e.col1.x * t.x + e.col2.x * t.y, e.col1.y * t.x + e.col2.y * t.y);
		return i.x += this.m_xf.position.x,
		i.y += this.m_xf.position.y,
		new o(this.m_linearVelocity.x - this.m_angularVelocity * (i.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (i.x - this.m_sweep.c.x))
	},
	d.prototype.GetLinearDamping = function () {
		return this.m_linearDamping
	},
	d.prototype.SetLinearDamping = function (t) {
		t === void 0 && (t = 0),
		this.m_linearDamping = t
	},
	d.prototype.GetAngularDamping = function () {
		return this.m_angularDamping
	},
	d.prototype.SetAngularDamping = function (t) {
		t === void 0 && (t = 0),
		this.m_angularDamping = t
	},
	d.prototype.SetType = function (t) {
		if (t === void 0 && (t = 0), this.m_type != t) {
			this.m_type = t,
			this.ResetMassData(),
			this.m_type == d.b2_staticBody && (this.m_linearVelocity.SetZero(), this.m_angularVelocity = 0),
			this.SetAwake(!0),
			this.m_force.SetZero(),
			this.m_torque = 0;
			for (var e = this.m_contactList; e; e = e.next)
				e.contact.FlagForFiltering()
		}
	},
	d.prototype.GetType = function () {
		return this.m_type
	},
	d.prototype.SetBullet = function (t) {
		t ? this.m_flags |= d.e_bulletFlag : this.m_flags &= ~d.e_bulletFlag
	},
	d.prototype.IsBullet = function () {
		return (this.m_flags & d.e_bulletFlag) == d.e_bulletFlag
	},
	d.prototype.SetSleepingAllowed = function (t) {
		t ? this.m_flags |= d.e_allowSleepFlag : (this.m_flags &= ~d.e_allowSleepFlag, this.SetAwake(!0))
	},
	d.prototype.SetAwake = function (t) {
		t ? (this.m_flags |= d.e_awakeFlag, this.m_sleepTime = 0) : (this.m_flags &= ~d.e_awakeFlag, this.m_sleepTime = 0, this.m_linearVelocity.SetZero(), this.m_angularVelocity = 0, this.m_force.SetZero(), this.m_torque = 0)
	},
	d.prototype.IsAwake = function () {
		return (this.m_flags & d.e_awakeFlag) == d.e_awakeFlag
	},
	d.prototype.SetFixedRotation = function (t) {
		t ? this.m_flags |= d.e_fixedRotationFlag : this.m_flags &= ~d.e_fixedRotationFlag,
		this.ResetMassData()
	},
	d.prototype.IsFixedRotation = function () {
		return (this.m_flags & d.e_fixedRotationFlag) == d.e_fixedRotationFlag
	},
	d.prototype.SetActive = function (t) {
		if (t != this.IsActive()) {
			var e,
			i;
			if (t)
				for (this.m_flags |= d.e_activeFlag, e = this.m_world.m_contactManager.m_broadPhase, i = this.m_fixtureList; i; i = i.m_next)
					i.CreateProxy(e, this.m_xf);
			else {
				for (this.m_flags &= ~d.e_activeFlag, e = this.m_world.m_contactManager.m_broadPhase, i = this.m_fixtureList; i; i = i.m_next)
					i.DestroyProxy(e);
				var o = this.m_contactList;
				while (o) {
					var s = o;
					o = o.next,
					this.m_world.m_contactManager.Destroy(s.contact)
				}
				this.m_contactList = null
			}
		}
	},
	d.prototype.IsActive = function () {
		return (this.m_flags & d.e_activeFlag) == d.e_activeFlag
	},
	d.prototype.IsSleepingAllowed = function () {
		return (this.m_flags & d.e_allowSleepFlag) == d.e_allowSleepFlag
	},
	d.prototype.GetFixtureList = function () {
		return this.m_fixtureList
	},
	d.prototype.GetJointList = function () {
		return this.m_jointList
	},
	d.prototype.GetControllerList = function () {
		return this.m_controllerList
	},
	d.prototype.GetContactList = function () {
		return this.m_contactList
	},
	d.prototype.GetNext = function () {
		return this.m_next
	},
	d.prototype.GetUserData = function () {
		return this.m_userData
	},
	d.prototype.SetUserData = function (t) {
		this.m_userData = t
	},
	d.prototype.GetWorld = function () {
		return this.m_world
	},
	d.prototype.b2Body = function (t, e) {
		this.m_flags = 0,
		t.bullet && (this.m_flags |= d.e_bulletFlag),
		t.fixedRotation && (this.m_flags |= d.e_fixedRotationFlag),
		t.allowSleep && (this.m_flags |= d.e_allowSleepFlag),
		t.awake && (this.m_flags |= d.e_awakeFlag),
		t.active && (this.m_flags |= d.e_activeFlag),
		this.m_world = e,
		this.m_xf.position.SetV(t.position),
		this.m_xf.R.Set(t.angle),
		this.m_sweep.localCenter.SetZero(),
		this.m_sweep.t0 = 1,
		this.m_sweep.a0 = this.m_sweep.a = t.angle;
		var i = this.m_xf.R,
		o = this.m_sweep.localCenter;
		this.m_sweep.c.x = i.col1.x * o.x + i.col2.x * o.y,
		this.m_sweep.c.y = i.col1.y * o.x + i.col2.y * o.y,
		this.m_sweep.c.x += this.m_xf.position.x,
		this.m_sweep.c.y += this.m_xf.position.y,
		this.m_sweep.c0.SetV(this.m_sweep.c),
		this.m_jointList = null,
		this.m_controllerList = null,
		this.m_contactList = null,
		this.m_controllerCount = 0,
		this.m_prev = null,
		this.m_next = null,
		this.m_linearVelocity.SetV(t.linearVelocity),
		this.m_angularVelocity = t.angularVelocity,
		this.m_linearDamping = t.linearDamping,
		this.m_angularDamping = t.angularDamping,
		this.m_force.Set(0, 0),
		this.m_torque = 0,
		this.m_sleepTime = 0,
		this.m_type = t.type,
		this.m_type == d.b2_dynamicBody ? (this.m_mass = 1, this.m_invMass = 1) : (this.m_mass = 0, this.m_invMass = 0),
		this.m_I = 0,
		this.m_invI = 0,
		this.m_inertiaScale = t.inertiaScale,
		this.m_userData = t.userData,
		this.m_fixtureList = null,
		this.m_fixtureCount = 0
	},
	d.prototype.SynchronizeFixtures = function () {
		var t = d.s_xf1;
		t.R.Set(this.m_sweep.a0);
		var e = t.R,
		i = this.m_sweep.localCenter;
		t.position.x = this.m_sweep.c0.x - (e.col1.x * i.x + e.col2.x * i.y),
		t.position.y = this.m_sweep.c0.y - (e.col1.y * i.x + e.col2.y * i.y);
		var o,
		s = this.m_world.m_contactManager.m_broadPhase;
		for (o = this.m_fixtureList; o; o = o.m_next)
			o.Synchronize(s, t, this.m_xf)
	},
	d.prototype.SynchronizeTransform = function () {
		this.m_xf.R.Set(this.m_sweep.a);
		var t = this.m_xf.R,
		e = this.m_sweep.localCenter;
		this.m_xf.position.x = this.m_sweep.c.x - (t.col1.x * e.x + t.col2.x * e.y),
		this.m_xf.position.y = this.m_sweep.c.y - (t.col1.y * e.x + t.col2.y * e.y)
	},
	d.prototype.ShouldCollide = function (t) {
		if (this.m_type != d.b2_dynamicBody && t.m_type != d.b2_dynamicBody)
			return !1;
		for (var e = this.m_jointList; e; e = e.next)
			if (e.other == t && e.joint.m_collideConnected == 0)
				return !1;
		return !0
	},
	d.prototype.Advance = function (t) {
		t === void 0 && (t = 0),
		this.m_sweep.Advance(t),
		this.m_sweep.c.SetV(this.m_sweep.c0),
		this.m_sweep.a = this.m_sweep.a0,
		this.SynchronizeTransform()
	},
	Box2D.postDefs.push(function () {
		Box2D.Dynamics.b2Body.s_xf1 = new i,
		Box2D.Dynamics.b2Body.e_islandFlag = 1,
		Box2D.Dynamics.b2Body.e_awakeFlag = 2,
		Box2D.Dynamics.b2Body.e_allowSleepFlag = 4,
		Box2D.Dynamics.b2Body.e_bulletFlag = 8,
		Box2D.Dynamics.b2Body.e_fixedRotationFlag = 16,
		Box2D.Dynamics.b2Body.e_activeFlag = 32,
		Box2D.Dynamics.b2Body.b2_staticBody = 0,
		Box2D.Dynamics.b2Body.b2_kinematicBody = 1,
		Box2D.Dynamics.b2Body.b2_dynamicBody = 2
	}),
	x.b2BodyDef = function () {
		this.position = new o,
		this.linearVelocity = new o
	},
	x.prototype.b2BodyDef = function () {
		this.userData = null,
		this.position.Set(0, 0),
		this.angle = 0,
		this.linearVelocity.Set(0, 0),
		this.angularVelocity = 0,
		this.linearDamping = 0,
		this.angularDamping = 0,
		this.allowSleep = !0,
		this.awake = !0,
		this.fixedRotation = !1,
		this.bullet = !1,
		this.type = d.b2_staticBody,
		this.active = !0,
		this.inertiaScale = 1
	},
	f.b2ContactFilter = function () {},
	f.prototype.ShouldCollide = function (t, e) {
		var i = t.GetFilterData(),
		o = e.GetFilterData();
		if (i.groupIndex == o.groupIndex && i.groupIndex != 0)
			return i.groupIndex > 0;
		var s = (i.maskBits & o.categoryBits) != 0 && (i.categoryBits & o.maskBits) != 0;
		return s
	},
	f.prototype.RayCollide = function (t, e) {
		return t ? this.ShouldCollide(t instanceof B ? t : null, e) : !0
	},
	Box2D.postDefs.push(function () {
		Box2D.Dynamics.b2ContactFilter.b2_defaultFilter = new f
	}),
	g.b2ContactImpulse = function () {
		this.normalImpulses = new Vector_a2j_Number(n.b2_maxManifoldPoints),
		this.tangentImpulses = new Vector_a2j_Number(n.b2_maxManifoldPoints)
	},
	v.b2ContactListener = function () {},
	v.prototype.BeginContact = function () {},
	v.prototype.EndContact = function () {},
	v.prototype.PreSolve = function () {},
	v.prototype.PostSolve = function () {},
	Box2D.postDefs.push(function () {
		Box2D.Dynamics.b2ContactListener.b2_defaultListener = new v
	}),
	b.b2ContactManager = function () {},
	b.prototype.b2ContactManager = function () {
		this.m_world = null,
		this.m_contactCount = 0,
		this.m_contactFilter = f.b2_defaultFilter,
		this.m_contactListener = v.b2_defaultListener,
		this.m_contactFactory = new V(this.m_allocator),
		this.m_broadPhase = new h
	},
	b.prototype.AddPair = function (t, e) {
		var i = t instanceof B ? t : null,
		o = e instanceof B ? e : null,
		s = i.GetBody(),
		n = o.GetBody();
		if (s != n) {
			var r = n.GetContactList();
			while (r) {
				if (r.other == s) {
					var a = r.contact.GetFixtureA(),
					h = r.contact.GetFixtureB();
					if (a == i && h == o)
						return;
					if (a == o && h == i)
						return
				}
				r = r.next
			}
			if (n.ShouldCollide(s) != 0 && this.m_contactFilter.ShouldCollide(i, o) != 0) {
				var l = this.m_contactFactory.Create(i, o);
				i = l.GetFixtureA(),
				o = l.GetFixtureB(),
				s = i.m_body,
				n = o.m_body,
				l.m_prev = null,
				l.m_next = this.m_world.m_contactList,
				this.m_world.m_contactList != null && (this.m_world.m_contactList.m_prev = l),
				this.m_world.m_contactList = l,
				l.m_nodeA.contact = l,
				l.m_nodeA.other = n,
				l.m_nodeA.prev = null,
				l.m_nodeA.next = s.m_contactList,
				s.m_contactList != null && (s.m_contactList.prev = l.m_nodeA),
				s.m_contactList = l.m_nodeA,
				l.m_nodeB.contact = l,
				l.m_nodeB.other = s,
				l.m_nodeB.prev = null,
				l.m_nodeB.next = n.m_contactList,
				n.m_contactList != null && (n.m_contactList.prev = l.m_nodeB),
				n.m_contactList = l.m_nodeB,
				++this.m_world.m_contactCount
			}
		}
	},
	b.prototype.FindNewContacts = function () {
		this.m_broadPhase.UpdatePairs(Box2D.generateCallback(this, this.AddPair))
	},
	b.prototype.Destroy = function (t) {
		var e = t.GetFixtureA(),
		i = t.GetFixtureB(),
		o = e.GetBody(),
		s = i.GetBody();
		t.IsTouching() && this.m_contactListener.EndContact(t),
		t.m_prev && (t.m_prev.m_next = t.m_next),
		t.m_next && (t.m_next.m_prev = t.m_prev),
		t == this.m_world.m_contactList && (this.m_world.m_contactList = t.m_next),
		t.m_nodeA.prev && (t.m_nodeA.prev.next = t.m_nodeA.next),
		t.m_nodeA.next && (t.m_nodeA.next.prev = t.m_nodeA.prev),
		t.m_nodeA == o.m_contactList && (o.m_contactList = t.m_nodeA.next),
		t.m_nodeB.prev && (t.m_nodeB.prev.next = t.m_nodeB.next),
		t.m_nodeB.next && (t.m_nodeB.next.prev = t.m_nodeB.prev),
		t.m_nodeB == s.m_contactList && (s.m_contactList = t.m_nodeB.next),
		this.m_contactFactory.Destroy(t),
		--this.m_contactCount
	},
	b.prototype.Collide = function () {
		var t = this.m_world.m_contactList;
		while (t) {
			var e = t.GetFixtureA(),
			i = t.GetFixtureB(),
			o = e.GetBody(),
			s = i.GetBody();
			if (o.IsAwake() != 0 || s.IsAwake() != 0) {
				if (t.m_flags & T.e_filterFlag) {
					if (s.ShouldCollide(o) == 0) {
						var n = t;
						t = n.GetNext(),
						this.Destroy(n);
						continue
					}
					if (this.m_contactFilter.ShouldCollide(e, i) == 0) {
						n = t,
						t = n.GetNext(),
						this.Destroy(n);
						continue
					}
					t.m_flags &= ~T.e_filterFlag
				}
				var r = e.m_proxy,
				a = i.m_proxy;
				if (r && a) {
					var h = this.m_broadPhase.TestOverlap(r, a);
					if (h == 0) {
						n = t,
						t = n.GetNext(),
						this.Destroy(n);
						continue
					}
				}
				t.Update(this.m_contactListener),
				t = t.GetNext()
			} else
				t = t.GetNext()
		}
	},
	Box2D.postDefs.push(function () {
		Box2D.Dynamics.b2ContactManager.s_evalCP = new a
	}),
	w.b2DebugDraw = function () {},
	w.prototype.b2DebugDraw = function () {},
	w.prototype.SetFlags = function (t) {
		t === void 0 && (t = 0)
	},
	w.prototype.GetFlags = function () {},
	w.prototype.AppendFlags = function (t) {
		t === void 0 && (t = 0)
	},
	w.prototype.ClearFlags = function (t) {
		t === void 0 && (t = 0)
	},
	w.prototype.SetSprite = function () {},
	w.prototype.GetSprite = function () {},
	w.prototype.SetDrawScale = function (t) {
		t === void 0 && (t = 0)
	},
	w.prototype.GetDrawScale = function () {},
	w.prototype.SetLineThickness = function (t) {
		t === void 0 && (t = 0)
	},
	w.prototype.GetLineThickness = function () {},
	w.prototype.SetAlpha = function (t) {
		t === void 0 && (t = 0)
	},
	w.prototype.GetAlpha = function () {},
	w.prototype.SetFillAlpha = function (t) {
		t === void 0 && (t = 0)
	},
	w.prototype.GetFillAlpha = function () {},
	w.prototype.SetXFormScale = function (t) {
		t === void 0 && (t = 0)
	},
	w.prototype.GetXFormScale = function () {},
	w.prototype.DrawPolygon = function (t, e) {
		e === void 0 && (e = 0)
	},
	w.prototype.DrawSolidPolygon = function (t, e) {
		e === void 0 && (e = 0)
	},
	w.prototype.DrawCircle = function (t, e) {
		e === void 0 && (e = 0)
	},
	w.prototype.DrawSolidCircle = function (t, e) {
		e === void 0 && (e = 0)
	},
	w.prototype.DrawSegment = function () {},
	w.prototype.DrawTransform = function () {},
	Box2D.postDefs.push(function () {
		Box2D.Dynamics.b2DebugDraw.e_shapeBit = 1,
		Box2D.Dynamics.b2DebugDraw.e_jointBit = 2,
		Box2D.Dynamics.b2DebugDraw.e_aabbBit = 4,
		Box2D.Dynamics.b2DebugDraw.e_pairBit = 8,
		Box2D.Dynamics.b2DebugDraw.e_centerOfMassBit = 16,
		Box2D.Dynamics.b2DebugDraw.e_controllerBit = 32
	}),
	C.b2DestructionListener = function () {},
	C.prototype.SayGoodbyeJoint = function () {},
	C.prototype.SayGoodbyeFixture = function () {},
	D.b2FilterData = function () {
		this.categoryBits = 1,
		this.maskBits = 65535,
		this.groupIndex = 0
	},
	D.prototype.Copy = function () {
		var t = new D;
		return t.categoryBits = this.categoryBits,
		t.maskBits = this.maskBits,
		t.groupIndex = this.groupIndex,
		t
	},
	B.b2Fixture = function () {
		this.m_filter = new D
	},
	B.prototype.GetType = function () {
		return this.m_shape.GetType()
	},
	B.prototype.GetShape = function () {
		return this.m_shape
	},
	B.prototype.SetSensor = function (t) {
		if (this.m_isSensor != t && (this.m_isSensor = t, this.m_body != null)) {
			var e = this.m_body.GetContactList();
			while (e) {
				var i = e.contact,
				o = i.GetFixtureA(),
				s = i.GetFixtureB();
				(o == this || s == this) && i.SetSensor(o.IsSensor() || s.IsSensor()),
				e = e.next
			}
		}
	},
	B.prototype.IsSensor = function () {
		return this.m_isSensor
	},
	B.prototype.SetFilterData = function (t) {
		if (this.m_filter = t.Copy(), !this.m_body) {
			var e = this.m_body.GetContactList();
			while (e) {
				var i = e.contact,
				o = i.GetFixtureA(),
				s = i.GetFixtureB();
				(o == this || s == this) && i.FlagForFiltering(),
				e = e.next
			}
		}
	},
	B.prototype.GetFilterData = function () {
		return this.m_filter.Copy()
	},
	B.prototype.GetBody = function () {
		return this.m_body
	},
	B.prototype.GetNext = function () {
		return this.m_next
	},
	B.prototype.GetUserData = function () {
		return this.m_userData
	},
	B.prototype.SetUserData = function (t) {
		this.m_userData = t
	},
	B.prototype.TestPoint = function (t) {
		return this.m_shape.TestPoint(this.m_body.GetTransform(), t)
	},
	B.prototype.RayCast = function (t, e) {
		return this.m_shape.RayCast(t, e, this.m_body.GetTransform())
	},
	B.prototype.GetMassData = function (t) {
		return t === void 0 && (t = null),
		t == null && (t = new u),
		this.m_shape.ComputeMass(t, this.m_density),
		t
	},
	B.prototype.SetDensity = function (t) {
		t === void 0 && (t = 0),
		this.m_density = t
	},
	B.prototype.GetDensity = function () {
		return this.m_density
	},
	B.prototype.GetFriction = function () {
		return this.m_friction
	},
	B.prototype.SetFriction = function (t) {
		t === void 0 && (t = 0),
		this.m_friction = t
	},
	B.prototype.GetRestitution = function () {
		return this.m_restitution
	},
	B.prototype.SetRestitution = function (t) {
		t === void 0 && (t = 0),
		this.m_restitution = t
	},
	B.prototype.GetAABB = function () {
		return this.m_aabb
	},
	B.prototype.b2Fixture = function () {
		this.m_aabb = new r,
		this.m_userData = null,
		this.m_body = null,
		this.m_next = null,
		this.m_shape = null,
		this.m_density = 0,
		this.m_friction = 0,
		this.m_restitution = 0
	},
	B.prototype.Create = function (t, e, i) {
		this.m_userData = i.userData,
		this.m_friction = i.friction,
		this.m_restitution = i.restitution,
		this.m_body = t,
		this.m_next = null,
		this.m_filter = i.filter.Copy(),
		this.m_isSensor = i.isSensor,
		this.m_shape = i.shape.Copy(),
		this.m_density = i.density
	},
	B.prototype.Destroy = function () {
		this.m_shape = null
	},
	B.prototype.CreateProxy = function (t, e) {
		this.m_shape.ComputeAABB(this.m_aabb, e),
		this.m_proxy = t.CreateProxy(this.m_aabb, this)
	},
	B.prototype.DestroyProxy = function (t) {
		this.m_proxy != null && (t.DestroyProxy(this.m_proxy), this.m_proxy = null)
	},
	B.prototype.Synchronize = function (e, i, o) {
		if (this.m_proxy) {
			var s = new r,
			n = new r;
			this.m_shape.ComputeAABB(s, i),
			this.m_shape.ComputeAABB(n, o),
			this.m_aabb.Combine(s, n);
			var a = t.SubtractVV(o.position, i.position);
			e.MoveProxy(this.m_proxy, this.m_aabb, a)
		}
	},
	S.b2FixtureDef = function () {
		this.filter = new D
	},
	S.prototype.b2FixtureDef = function () {
		this.shape = null,
		this.userData = null,
		this.friction = .2,
		this.restitution = 0,
		this.density = 0,
		this.filter.categoryBits = 1,
		this.filter.maskBits = 65535,
		this.filter.groupIndex = 0,
		this.isSensor = !1
	},
	I.b2Island = function () {},
	I.prototype.b2Island = function () {
		this.m_bodies = new Vector,
		this.m_contacts = new Vector,
		this.m_joints = new Vector
	},
	I.prototype.Initialize = function (t, e, i, o, s, n) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		i === void 0 && (i = 0);
		var r = 0;
		for (this.m_bodyCapacity = t, this.m_contactCapacity = e, this.m_jointCapacity = i, this.m_bodyCount = 0, this.m_contactCount = 0, this.m_jointCount = 0, this.m_allocator = o, this.m_listener = s, this.m_contactSolver = n, r = this.m_bodies.length; t > r; r++)
			this.m_bodies[r] = null;
		for (r = this.m_contacts.length; e > r; r++)
			this.m_contacts[r] = null;
		for (r = this.m_joints.length; i > r; r++)
			this.m_joints[r] = null
	},
	I.prototype.Clear = function () {
		this.m_bodyCount = 0,
		this.m_contactCount = 0,
		this.m_jointCount = 0
	},
	I.prototype.Solve = function (e, i, o) {
		var s,
		r,
		a = 0,
		h = 0,
		l = i.x,
		c = i.y;
		for (a = 0; this.m_bodyCount > a; ++a)
			s = this.m_bodies[a], s.GetType() == d.b2_dynamicBody && (s.m_nonGravitic ? (s.m_linearVelocity.x += e.dt * s.m_invMass * s.m_force.x, s.m_linearVelocity.y += e.dt * s.m_invMass * s.m_force.y) : (s.m_linearVelocity.x += e.dt * (l + s.m_invMass * s.m_force.x), s.m_linearVelocity.y += e.dt * (c + s.m_invMass * s.m_force.y)), s.m_angularVelocity += e.dt * s.m_invI * s.m_torque, s.m_linearVelocity.Multiply(t.Clamp(1 - e.dt * s.m_linearDamping, 0, 1)), s.m_angularVelocity *= t.Clamp(1 - e.dt * s.m_angularDamping, 0, 1));
		this.m_contactSolver.Initialize(e, this.m_contacts, this.m_contactCount, this.m_allocator);
		var m = this.m_contactSolver;
		for (m.InitVelocityConstraints(e), a = 0; this.m_jointCount > a; ++a)
			r = this.m_joints[a], r.InitVelocityConstraints(e);
		for (a = 0; e.velocityIterations > a; ++a) {
			for (h = 0; this.m_jointCount > h; ++h)
				r = this.m_joints[h], r.SolveVelocityConstraints(e);
			m.SolveVelocityConstraints()
		}
		for (a = 0; this.m_jointCount > a; ++a)
			r = this.m_joints[a], r.FinalizeVelocityConstraints();
		for (m.FinalizeVelocityConstraints(), a = 0; this.m_bodyCount > a; ++a)
			if (s = this.m_bodies[a], s.GetType() != d.b2_staticBody) {
				var _ = e.dt * s.m_linearVelocity.x,
				u = e.dt * s.m_linearVelocity.y;
				_ * _ + u * u > n.b2_maxTranslationSquared && (s.m_linearVelocity.Normalize(), s.m_linearVelocity.x *= n.b2_maxTranslation * e.inv_dt, s.m_linearVelocity.y *= n.b2_maxTranslation * e.inv_dt);
				var p = e.dt * s.m_angularVelocity;
				p * p > n.b2_maxRotationSquared && (s.m_angularVelocity = 0 > s.m_angularVelocity ? -n.b2_maxRotation * e.inv_dt : n.b2_maxRotation * e.inv_dt),
				s.m_sweep.c0.SetV(s.m_sweep.c),
				s.m_sweep.a0 = s.m_sweep.a,
				s.m_sweep.c.x += e.dt * s.m_linearVelocity.x,
				s.m_sweep.c.y += e.dt * s.m_linearVelocity.y,
				s.m_sweep.a += e.dt * s.m_angularVelocity,
				s.SynchronizeTransform()
			}
		for (a = 0; e.positionIterations > a; ++a) {
			var y = m.SolvePositionConstraints(n.b2_contactBaumgarte),
			x = !0;
			for (h = 0; this.m_jointCount > h; ++h) {
				r = this.m_joints[h];
				var f = r.SolvePositionConstraints(n.b2_contactBaumgarte);
				x = x && f
			}
			if (y && x)
				break
		}
		if (this.Report(m.m_constraints), o) {
			var g = Number.MAX_VALUE,
			v = n.b2_linearSleepTolerance * n.b2_linearSleepTolerance,
			b = n.b2_angularSleepTolerance * n.b2_angularSleepTolerance;
			for (a = 0; this.m_bodyCount > a; ++a)
				s = this.m_bodies[a], s.GetType() != d.b2_staticBody && ((s.m_flags & d.e_allowSleepFlag) == 0 && (s.m_sleepTime = 0, g = 0), (s.m_flags & d.e_allowSleepFlag) == 0 || s.m_angularVelocity * s.m_angularVelocity > b || t.Dot(s.m_linearVelocity, s.m_linearVelocity) > v ? (s.m_sleepTime = 0, g = 0) : (s.m_sleepTime += e.dt, g = t.Min(g, s.m_sleepTime)));
			if (g >= n.b2_timeToSleep)
				for (a = 0; this.m_bodyCount > a; ++a)
					s = this.m_bodies[a], s.SetAwake(!1)
		}
	},
	I.prototype.SolveTOI = function (t) {
		var e = 0,
		i = 0;
		this.m_contactSolver.Initialize(t, this.m_contacts, this.m_contactCount, this.m_allocator);
		var o = this.m_contactSolver;
		for (e = 0; this.m_jointCount > e; ++e)
			this.m_joints[e].InitVelocityConstraints(t);
		for (e = 0; t.velocityIterations > e; ++e)
			for (o.SolveVelocityConstraints(), i = 0; this.m_jointCount > i; ++i)
				this.m_joints[i].SolveVelocityConstraints(t);
		for (e = 0; this.m_bodyCount > e; ++e) {
			var s = this.m_bodies[e];
			if (s.GetType() != d.b2_staticBody) {
				var r = t.dt * s.m_linearVelocity.x,
				a = t.dt * s.m_linearVelocity.y;
				r * r + a * a > n.b2_maxTranslationSquared && (s.m_linearVelocity.Normalize(), s.m_linearVelocity.x *= n.b2_maxTranslation * t.inv_dt, s.m_linearVelocity.y *= n.b2_maxTranslation * t.inv_dt);
				var h = t.dt * s.m_angularVelocity;
				h * h > n.b2_maxRotationSquared && (s.m_angularVelocity = 0 > s.m_angularVelocity ? -n.b2_maxRotation * t.inv_dt : n.b2_maxRotation * t.inv_dt),
				s.m_sweep.c0.SetV(s.m_sweep.c),
				s.m_sweep.a0 = s.m_sweep.a,
				s.m_sweep.c.x += t.dt * s.m_linearVelocity.x,
				s.m_sweep.c.y += t.dt * s.m_linearVelocity.y,
				s.m_sweep.a += t.dt * s.m_angularVelocity,
				s.SynchronizeTransform()
			}
		}
		var l = .75;
		for (e = 0; t.positionIterations > e; ++e) {
			var c = o.SolvePositionConstraints(l),
			m = !0;
			for (i = 0; this.m_jointCount > i; ++i) {
				var _ = this.m_joints[i].SolvePositionConstraints(n.b2_contactBaumgarte);
				m = m && _
			}
			if (c && m)
				break
		}
		this.Report(o.m_constraints)
	},
	I.prototype.Report = function (t) {
		if (this.m_listener != null)
			for (var e = 0; this.m_contactCount > e; ++e) {
				for (var i = this.m_contacts[e], o = t[e], s = 0; o.pointCount > s; ++s)
					I.s_impulse.normalImpulses[s] = o.points[s].normalImpulse, I.s_impulse.tangentImpulses[s] = o.points[s].tangentImpulse;
				this.m_listener.PostSolve(i, I.s_impulse)
			}
	},
	I.prototype.AddBody = function (t) {
		t.m_islandIndex = this.m_bodyCount,
		this.m_bodies[this.m_bodyCount++] = t
	},
	I.prototype.AddContact = function (t) {
		this.m_contacts[this.m_contactCount++] = t
	},
	I.prototype.AddJoint = function (t) {
		this.m_joints[this.m_jointCount++] = t
	},
	Box2D.postDefs.push(function () {
		Box2D.Dynamics.b2Island.s_impulse = new g
	}),
	A.b2TimeStep = function () {},
	A.prototype.Set = function (t) {
		this.dt = t.dt,
		this.inv_dt = t.inv_dt,
		this.positionIterations = t.positionIterations,
		this.velocityIterations = t.velocityIterations,
		this.warmStarting = t.warmStarting
	},
	M.b2World = function () {
		this.s_stack = new Vector,
		this.m_contactManager = new b,
		this.m_contactSolver = new P,
		this.m_island = new I
	},
	M.prototype.b2World = function (t, e) {
		this.m_destructionListener = null,
		this.m_debugDraw = null,
		this.m_bodyList = null,
		this.m_contactList = null,
		this.m_jointList = null,
		this.m_controllerList = null,
		this.m_bodyCount = 0,
		this.m_contactCount = 0,
		this.m_jointCount = 0,
		this.m_controllerCount = 0,
		M.m_warmStarting = !0,
		M.m_continuousPhysics = !0,
		this.m_allowSleep = e,
		this.m_gravity = t,
		this.m_inv_dt0 = 0,
		this.m_contactManager.m_world = this;
		var i = new x;
		this.m_groundBody = this.CreateBody(i)
	},
	M.prototype.SetDestructionListener = function (t) {
		this.m_destructionListener = t
	},
	M.prototype.SetContactFilter = function (t) {
		this.m_contactManager.m_contactFilter = t
	},
	M.prototype.SetContactListener = function (t) {
		this.m_contactManager.m_contactListener = t
	},
	M.prototype.SetDebugDraw = function (t) {
		this.m_debugDraw = t
	},
	M.prototype.SetBroadPhase = function (t) {
		var e = this.m_contactManager.m_broadPhase;
		this.m_contactManager.m_broadPhase = t;
		for (var i = this.m_bodyList; i; i = i.m_next)
			for (var o = i.m_fixtureList; o; o = o.m_next)
				o.m_proxy = t.CreateProxy(e.GetFatAABB(o.m_proxy), o)
	},
	M.prototype.Validate = function () {
		this.m_contactManager.m_broadPhase.Validate()
	},
	M.prototype.GetProxyCount = function () {
		return this.m_contactManager.m_broadPhase.GetProxyCount()
	},
	M.prototype.CreateBody = function (t) {
		if (this.IsLocked() == 1)
			return null;
		var e = new d(t, this);
		return e.m_prev = null,
		e.m_next = this.m_bodyList,
		this.m_bodyList && (this.m_bodyList.m_prev = e),
		this.m_bodyList = e,
		++this.m_bodyCount,
		e
	},
	M.prototype.DestroyBody = function (t) {
		if (this.IsLocked() != 1) {
			var e = t.m_jointList;
			while (e) {
				var i = e;
				e = e.next,
				this.m_destructionListener && this.m_destructionListener.SayGoodbyeJoint(i.joint),
				this.DestroyJoint(i.joint)
			}
			var o = t.m_controllerList;
			while (o) {
				var s = o;
				o = o.nextController,
				s.controller.RemoveBody(t)
			}
			var n = t.m_contactList;
			while (n) {
				var r = n;
				n = n.next,
				this.m_contactManager.Destroy(r.contact)
			}
			t.m_contactList = null;
			var a = t.m_fixtureList;
			while (a) {
				var h = a;
				a = a.m_next,
				this.m_destructionListener && this.m_destructionListener.SayGoodbyeFixture(h),
				h.DestroyProxy(this.m_contactManager.m_broadPhase),
				h.Destroy()
			}
			t.m_fixtureList = null,
			t.m_fixtureCount = 0,
			t.m_prev && (t.m_prev.m_next = t.m_next),
			t.m_next && (t.m_next.m_prev = t.m_prev),
			t == this.m_bodyList && (this.m_bodyList = t.m_next),
			--this.m_bodyCount
		}
	},
	M.prototype.CreateJoint = function (t) {
		var e = R.Create(t, null);
		e.m_prev = null,
		e.m_next = this.m_jointList,
		this.m_jointList && (this.m_jointList.m_prev = e),
		this.m_jointList = e,
		++this.m_jointCount,
		e.m_edgeA.joint = e,
		e.m_edgeA.other = e.m_bodyB,
		e.m_edgeA.prev = null,
		e.m_edgeA.next = e.m_bodyA.m_jointList,
		e.m_bodyA.m_jointList && (e.m_bodyA.m_jointList.prev = e.m_edgeA),
		e.m_bodyA.m_jointList = e.m_edgeA,
		e.m_edgeB.joint = e,
		e.m_edgeB.other = e.m_bodyA,
		e.m_edgeB.prev = null,
		e.m_edgeB.next = e.m_bodyB.m_jointList,
		e.m_bodyB.m_jointList && (e.m_bodyB.m_jointList.prev = e.m_edgeB),
		e.m_bodyB.m_jointList = e.m_edgeB;
		var i = t.bodyA,
		o = t.bodyB;
		if (t.collideConnected == 0) {
			var s = o.GetContactList();
			while (s)
				s.other == i && s.contact.FlagForFiltering(), s = s.next
		}
		return e
	},
	M.prototype.DestroyJoint = function (t) {
		var e = t.m_collideConnected;
		t.m_prev && (t.m_prev.m_next = t.m_next),
		t.m_next && (t.m_next.m_prev = t.m_prev),
		t == this.m_jointList && (this.m_jointList = t.m_next);
		var i = t.m_bodyA,
		o = t.m_bodyB;
		if (i.SetAwake(!0), o.SetAwake(!0), t.m_edgeA.prev && (t.m_edgeA.prev.next = t.m_edgeA.next), t.m_edgeA.next && (t.m_edgeA.next.prev = t.m_edgeA.prev), t.m_edgeA == i.m_jointList && (i.m_jointList = t.m_edgeA.next), t.m_edgeA.prev = null, t.m_edgeA.next = null, t.m_edgeB.prev && (t.m_edgeB.prev.next = t.m_edgeB.next), t.m_edgeB.next && (t.m_edgeB.next.prev = t.m_edgeB.prev), t.m_edgeB == o.m_jointList && (o.m_jointList = t.m_edgeB.next), t.m_edgeB.prev = null, t.m_edgeB.next = null, R.Destroy(t, null), --this.m_jointCount, e == 0) {
			var s = o.GetContactList();
			while (s)
				s.other == i && s.contact.FlagForFiltering(), s = s.next
		}
	},
	M.prototype.AddController = function (t) {
		return t.m_next = this.m_controllerList,
		t.m_prev = null,
		this.m_controllerList = t,
		t.m_world = this,
		this.m_controllerCount++,
		t
	},
	M.prototype.RemoveController = function (t) {
		t.m_prev && (t.m_prev.m_next = t.m_next),
		t.m_next && (t.m_next.m_prev = t.m_prev),
		this.m_controllerList == t && (this.m_controllerList = t.m_next),
		this.m_controllerCount--
	},
	M.prototype.CreateController = function (t) {
		if (t.m_world != this)
			throw Error("Controller can only be a member of one world");
		return t.m_next = this.m_controllerList,
		t.m_prev = null,
		this.m_controllerList && (this.m_controllerList.m_prev = t),
		this.m_controllerList = t,
		++this.m_controllerCount,
		t.m_world = this,
		t
	},
	M.prototype.DestroyController = function (t) {
		t.Clear(),
		t.m_next && (t.m_next.m_prev = t.m_prev),
		t.m_prev && (t.m_prev.m_next = t.m_next),
		t == this.m_controllerList && (this.m_controllerList = t.m_next),
		--this.m_controllerCount
	},
	M.prototype.SetWarmStarting = function (t) {
		M.m_warmStarting = t
	},
	M.prototype.SetContinuousPhysics = function (t) {
		M.m_continuousPhysics = t
	},
	M.prototype.GetBodyCount = function () {
		return this.m_bodyCount
	},
	M.prototype.GetJointCount = function () {
		return this.m_jointCount
	},
	M.prototype.GetContactCount = function () {
		return this.m_contactCount
	},
	M.prototype.SetGravity = function (t) {
		this.m_gravity = t
	},
	M.prototype.GetGravity = function () {
		return this.m_gravity
	},
	M.prototype.GetGroundBody = function () {
		return this.m_groundBody
	},
	M.prototype.Step = function (t, e, i) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		i === void 0 && (i = 0),
		this.m_flags & M.e_newFixture && (this.m_contactManager.FindNewContacts(), this.m_flags &= ~M.e_newFixture),
		this.m_flags |= M.e_locked;
		var o = M.s_timestep2;
		o.dt = t,
		o.velocityIterations = e,
		o.positionIterations = i,
		o.inv_dt = t > 0 ? 1 / t : 0,
		o.dtRatio = this.m_inv_dt0 * t,
		o.warmStarting = M.m_warmStarting,
		this.m_contactManager.Collide(),
		o.dt > 0 && this.Solve(o),
		M.m_continuousPhysics && o.dt > 0 && this.SolveTOI(o),
		o.dt > 0 && (this.m_inv_dt0 = o.inv_dt),
		this.m_flags &= ~M.e_locked
	},
	M.prototype.ClearForces = function () {
		for (var t = this.m_bodyList; t; t = t.m_next)
			t.m_force.SetZero(), t.m_torque = 0
	},
	M.prototype.DrawDebugData = function () {
		if (this.m_debugDraw != null) {
			this.m_debugDraw.m_sprite.graphics.clear();
			var t,
			e,
			i,
			n,
			a,
			h = this.m_debugDraw.GetFlags();
			new o,
			new o,
			new o;
			var l;
			new r,
			new r;
			var c = [new o, new o, new o, new o],
			m = new s(0, 0, 0);
			if (h & w.e_shapeBit)
				for (t = this.m_bodyList; t; t = t.m_next)
					for (l = t.m_xf, e = t.GetFixtureList(); e; e = e.m_next)
						i = e.GetShape(), t.IsActive() == 0 ? (m.Set(.5, .5, .3), this.DrawShape(i, l, m)) : t.GetType() == d.b2_staticBody ? (m.Set(.5, .9, .5), this.DrawShape(i, l, m)) : t.GetType() == d.b2_kinematicBody ? (m.Set(.5, .5, .9), this.DrawShape(i, l, m)) : t.IsAwake() == 0 ? (m.Set(.6, .6, .6), this.DrawShape(i, l, m)) : (m.Set(.9, .7, .7), this.DrawShape(i, l, m));
			if (h & w.e_jointBit)
				for (n = this.m_jointList; n; n = n.m_next)
					this.DrawJoint(n);
			if (h & w.e_controllerBit)
				for (var _ = this.m_controllerList; _; _ = _.m_next)
					_.Draw(this.m_debugDraw);
			if (h & w.e_pairBit) {
				m.Set(.3, .9, .9);
				for (var u = this.m_contactManager.m_contactList; u; u = u.GetNext()) {
					var p = u.GetFixtureA(),
					y = u.GetFixtureB(),
					x = p.GetAABB().GetCenter(),
					f = y.GetAABB().GetCenter();
					this.m_debugDraw.DrawSegment(x, f, m)
				}
			}
			if (h & w.e_aabbBit)
				for (a = this.m_contactManager.m_broadPhase, c = [new o, new o, new o, new o], t = this.m_bodyList; t; t = t.GetNext())
					if (t.IsActive() != 0)
						for (e = t.GetFixtureList(); e; e = e.GetNext()) {
							var g = a.GetFatAABB(e.m_proxy);
							c[0].Set(g.lowerBound.x, g.lowerBound.y),
							c[1].Set(g.upperBound.x, g.lowerBound.y),
							c[2].Set(g.upperBound.x, g.upperBound.y),
							c[3].Set(g.lowerBound.x, g.upperBound.y),
							this.m_debugDraw.DrawPolygon(c, 4, m)
						}
			if (h & w.e_centerOfMassBit)
				for (t = this.m_bodyList; t; t = t.m_next)
					l = M.s_xf, l.R = t.m_xf.R, l.position = t.GetWorldCenter(), this.m_debugDraw.DrawTransform(l)
		}
	},
	M.prototype.QueryAABB = function (t, e) {
		function i(e) {
			return t(s.GetUserData(e))
		}
		var o = this,
		s = o.m_contactManager.m_broadPhase;
		s.Query(i, e)
	},
	M.prototype.QueryShape = function (t, e, o) {
		function s(i) {
			var s = a.GetUserData(i)instanceof B ? a.GetUserData(i) : null;
			return y.TestOverlap(e, o, s.GetShape(), s.GetBody().GetTransform()) ? t(s) : !0
		}
		var n = this;
		o === void 0 && (o = null),
		o == null && (o = new i, o.SetIdentity());
		var a = n.m_contactManager.m_broadPhase,
		h = new r;
		e.ComputeAABB(h, o),
		a.Query(s, h)
	},
	M.prototype.QueryPoint = function (t, e) {
		function i(i) {
			var o = s.GetUserData(i)instanceof B ? s.GetUserData(i) : null;
			return o.TestPoint(e) ? t(o) : !0
		}
		var o = this,
		s = o.m_contactManager.m_broadPhase,
		a = new r;
		a.lowerBound.Set(e.x - n.b2_linearSlop, e.y - n.b2_linearSlop),
		a.upperBound.Set(e.x + n.b2_linearSlop, e.y + n.b2_linearSlop),
		s.Query(i, a)
	},
	M.prototype.RayCast = function (t, e, i) {
		function s(s, n) {
			var h = r.GetUserData(n),
			l = h instanceof B ? h : null,
			c = l.RayCast(a, s);
			if (c) {
				var m = a.fraction,
				_ = new o((1 - m) * e.x + m * i.x, (1 - m) * e.y + m * i.y);
				return t(l, _, a.normal, m)
			}
			return s.maxFraction
		}
		var n = this,
		r = n.m_contactManager.m_broadPhase,
		a = new c,
		h = new l(e, i);
		r.RayCast(s, h)
	},
	M.prototype.RayCastOne = function (t, e) {
		function i(t, e, i, s) {
			return s === void 0 && (s = 0),
			o = t,
			s
		}
		var o,
		s = this;
		return s.RayCast(i, t, e),
		o
	},
	M.prototype.RayCastAll = function (t, e) {
		function i(t, e, i, o) {
			return o === void 0 && (o = 0),
			s[s.length] = t,
			1
		}
		var o = this,
		s = new Vector;
		return o.RayCast(i, t, e),
		s
	},
	M.prototype.GetBodyList = function () {
		return this.m_bodyList
	},
	M.prototype.GetJointList = function () {
		return this.m_jointList
	},
	M.prototype.GetContactList = function () {
		return this.m_contactList
	},
	M.prototype.IsLocked = function () {
		return (this.m_flags & M.e_locked) > 0
	},
	M.prototype.Solve = function (t) {
		for (var e, i = this.m_controllerList; i; i = i.m_next)
			i.Step(t);
		var o = this.m_island;
		for (o.Initialize(this.m_bodyCount, this.m_contactCount, this.m_jointCount, null, this.m_contactManager.m_contactListener, this.m_contactSolver), e = this.m_bodyList; e; e = e.m_next)
			e.m_flags &= ~d.e_islandFlag;
		for (var s = this.m_contactList; s; s = s.m_next)
			s.m_flags &= ~T.e_islandFlag;
		for (var n = this.m_jointList; n; n = n.m_next)
			n.m_islandFlag = !1;
		parseInt(this.m_bodyCount);
		for (var r = this.s_stack, a = this.m_bodyList; a; a = a.m_next)
			if (!(a.m_flags & d.e_islandFlag) && a.IsAwake() != 0 && a.IsActive() != 0 && a.GetType() != d.b2_staticBody) {
				o.Clear();
				var h = 0;
				r[h++] = a,
				a.m_flags |= d.e_islandFlag;
				while (h > 0)
					if (e = r[--h], o.AddBody(e), e.IsAwake() == 0 && e.SetAwake(!0), e.GetType() != d.b2_staticBody) {
						for (var l, c = e.m_contactList; c; c = c.next)
							c.contact.m_flags & T.e_islandFlag || c.contact.IsSensor() != 1 && c.contact.IsEnabled() != 0 && c.contact.IsTouching() != 0 && (o.AddContact(c.contact), c.contact.m_flags |= T.e_islandFlag, l = c.other, l.m_flags & d.e_islandFlag || (r[h++] = l, l.m_flags |= d.e_islandFlag));
						for (var m = e.m_jointList; m; m = m.next)
							m.joint.m_islandFlag != 1 && (l = m.other, l.IsActive() != 0 && (o.AddJoint(m.joint), m.joint.m_islandFlag = !0, l.m_flags & d.e_islandFlag || (r[h++] = l, l.m_flags |= d.e_islandFlag)))
					}
				o.Solve(t, this.m_gravity, this.m_allowSleep);
				for (var _ = 0; o.m_bodyCount > _; ++_)
					e = o.m_bodies[_], e.GetType() == d.b2_staticBody && (e.m_flags &= ~d.e_islandFlag)
			}
		for (_ = 0; r.length > _; ++_) {
			if (!r[_])
				break;
			r[_] = null
		}
		for (e = this.m_bodyList; e; e = e.m_next)
			e.IsAwake() != 0 && e.IsActive() != 0 && e.GetType() != d.b2_staticBody && e.SynchronizeFixtures();
		this.m_contactManager.FindNewContacts()
	},
	M.prototype.SolveTOI = function (t) {
		var e,
		i,
		o,
		s,
		r,
		a,
		h,
		l = this.m_island;
		l.Initialize(this.m_bodyCount, n.b2_maxTOIContactsPerIsland, n.b2_maxTOIJointsPerIsland, null, this.m_contactManager.m_contactListener, this.m_contactSolver);
		var c = M.s_queue;
		for (e = this.m_bodyList; e; e = e.m_next)
			e.m_flags &= ~d.e_islandFlag, e.m_sweep.t0 = 0;
		var m;
		for (m = this.m_contactList; m; m = m.m_next)
			m.m_flags &= ~(T.e_toiFlag | T.e_islandFlag);
		for (h = this.m_jointList; h; h = h.m_next)
			h.m_islandFlag = !1;
		for (; ; ) {
			var _ = null,
			u = 1;
			for (m = this.m_contactList; m; m = m.m_next)
				if (m.IsSensor() != 1 && m.IsEnabled() != 0 && m.IsContinuous() != 0) {
					var p = 1;
					if (m.m_flags & T.e_toiFlag)
						p = m.m_toi;
					else {
						if (i = m.m_fixtureA, o = m.m_fixtureB, s = i.m_body, r = o.m_body, !(s.GetType() == d.b2_dynamicBody && s.IsAwake() != 0 || r.GetType() == d.b2_dynamicBody && r.IsAwake() != 0))
							continue;
						var y = s.m_sweep.t0;
						r.m_sweep.t0 > s.m_sweep.t0 ? (y = r.m_sweep.t0, s.m_sweep.Advance(y)) : s.m_sweep.t0 > r.m_sweep.t0 && (y = s.m_sweep.t0, r.m_sweep.Advance(y)),
						p = m.ComputeTOI(s.m_sweep, r.m_sweep),
						n.b2Assert(p >= 0 && 1 >= p),
						p > 0 && 1 > p && (p = (1 - p) * y + p, p > 1 && (p = 1)),
						m.m_toi = p,
						m.m_flags |= T.e_toiFlag
					}
					p > Number.MIN_VALUE && u > p && (_ = m, u = p)
				}
			if (_ == null || u > 1 - 100 * Number.MIN_VALUE)
				break;
			if (i = _.m_fixtureA, o = _.m_fixtureB, s = i.m_body, r = o.m_body, M.s_backupA.Set(s.m_sweep), M.s_backupB.Set(r.m_sweep), s.Advance(u), r.Advance(u), _.Update(this.m_contactManager.m_contactListener), _.m_flags &= ~T.e_toiFlag, _.IsSensor() != 1 && _.IsEnabled() != 0) {
				if (_.IsTouching() != 0) {
					var x = s;
					x.GetType() != d.b2_dynamicBody && (x = r),
					l.Clear();
					var f = 0,
					g = 0;
					c[f + g++] = x,
					x.m_flags |= d.e_islandFlag;
					while (g > 0)
						if (e = c[f++], --g, l.AddBody(e), e.IsAwake() == 0 && e.SetAwake(!0), e.GetType() == d.b2_dynamicBody) {
							for (a = e.m_contactList; a; a = a.next) {
								if (l.m_contactCount == l.m_contactCapacity)
									break;
								if (!(a.contact.m_flags & T.e_islandFlag) && a.contact.IsSensor() != 1 && a.contact.IsEnabled() != 0 && a.contact.IsTouching() != 0) {
									l.AddContact(a.contact),
									a.contact.m_flags |= T.e_islandFlag;
									var v = a.other;
									v.m_flags & d.e_islandFlag || (v.GetType() != d.b2_staticBody && (v.Advance(u), v.SetAwake(!0)), c[f + g] = v, ++g, v.m_flags |= d.e_islandFlag)
								}
							}
							for (var b = e.m_jointList; b; b = b.next)
								l.m_jointCount != l.m_jointCapacity && b.joint.m_islandFlag != 1 && (v = b.other, v.IsActive() != 0 && (l.AddJoint(b.joint), b.joint.m_islandFlag = !0, v.m_flags & d.e_islandFlag || (v.GetType() != d.b2_staticBody && (v.Advance(u), v.SetAwake(!0)), c[f + g] = v, ++g, v.m_flags |= d.e_islandFlag)))
						}
					var w = M.s_timestep;
					w.warmStarting = !1,
					w.dt = (1 - u) * t.dt,
					w.inv_dt = 1 / w.dt,
					w.dtRatio = 0,
					w.velocityIterations = t.velocityIterations,
					w.positionIterations = t.positionIterations,
					l.SolveTOI(w);
					var C = 0;
					for (C = 0; l.m_bodyCount > C; ++C)
						if (e = l.m_bodies[C], e.m_flags &= ~d.e_islandFlag, e.IsAwake() != 0 && e.GetType() == d.b2_dynamicBody)
							for (e.SynchronizeFixtures(), a = e.m_contactList; a; a = a.next)
								a.contact.m_flags &= ~T.e_toiFlag;
					for (C = 0; l.m_contactCount > C; ++C)
						m = l.m_contacts[C], m.m_flags &= ~(T.e_toiFlag | T.e_islandFlag);
					for (C = 0; l.m_jointCount > C; ++C)
						h = l.m_joints[C], h.m_islandFlag = !1;
					this.m_contactManager.FindNewContacts()
				}
			} else
				s.m_sweep.Set(M.s_backupA), r.m_sweep.Set(M.s_backupB), s.SynchronizeTransform(), r.SynchronizeTransform()
		}
	},
	M.prototype.DrawJoint = function (t) {
		var e = t.GetBodyA(),
		i = t.GetBodyB(),
		o = e.m_xf,
		s = i.m_xf,
		n = o.position,
		r = s.position,
		a = t.GetAnchorA(),
		h = t.GetAnchorB(),
		l = M.s_jointColor;
		switch (t.m_type) {
		case R.e_distanceJoint:
			this.m_debugDraw.DrawSegment(a, h, l);
			break;
		case R.e_pulleyJoint:
			var c = t instanceof k ? t : null,
			m = c.GetGroundAnchorA(),
			_ = c.GetGroundAnchorB();
			this.m_debugDraw.DrawSegment(m, a, l),
			this.m_debugDraw.DrawSegment(_, h, l),
			this.m_debugDraw.DrawSegment(m, _, l);
			break;
		case R.e_mouseJoint:
			this.m_debugDraw.DrawSegment(a, h, l);
			break;
		default:
			e != this.m_groundBody && this.m_debugDraw.DrawSegment(n, a, l),
			this.m_debugDraw.DrawSegment(a, h, l),
			i != this.m_groundBody && this.m_debugDraw.DrawSegment(r, h, l)
		}
	},
	M.prototype.DrawShape = function (e, i, o) {
		switch (e.m_type) {
		case y.e_circleShape:
			var s = e instanceof m ? e : null,
			n = t.MulX(i, s.m_p),
			r = s.m_radius,
			a = i.R.col1;
			this.m_debugDraw.DrawSolidCircle(n, r, a, o);
			break;
		case y.e_polygonShape:
			var h = 0,
			l = e instanceof p ? e : null,
			c = parseInt(l.GetVertexCount()),
			u = l.GetVertices(),
			d = new Vector(c);
			for (h = 0; c > h; ++h)
				d[h] = t.MulX(i, u[h]);
			this.m_debugDraw.DrawSolidPolygon(d, c, o);
			break;
		case y.e_edgeShape:
			var x = e instanceof _ ? e : null;
			this.m_debugDraw.DrawSegment(t.MulX(i, x.GetVertex1()), t.MulX(i, x.GetVertex2()), o)
		}
	},
	Box2D.postDefs.push(function () {
		Box2D.Dynamics.b2World.s_timestep2 = new A,
		Box2D.Dynamics.b2World.s_xf = new i,
		Box2D.Dynamics.b2World.s_backupA = new e,
		Box2D.Dynamics.b2World.s_backupB = new e,
		Box2D.Dynamics.b2World.s_timestep = new A,
		Box2D.Dynamics.b2World.s_queue = new Vector,
		Box2D.Dynamics.b2World.s_jointColor = new s(.5, .8, .8),
		Box2D.Dynamics.b2World.e_newFixture = 1,
		Box2D.Dynamics.b2World.e_locked = 2
	})
}
(), function () {
	var t = Box2D.Collision.Shapes.b2CircleShape,
	e = (Box2D.Collision.Shapes.b2EdgeChainDef, Box2D.Collision.Shapes.b2EdgeShape),
	i = (Box2D.Collision.Shapes.b2MassData, Box2D.Collision.Shapes.b2PolygonShape),
	o = Box2D.Collision.Shapes.b2Shape,
	s = Box2D.Dynamics.Contacts.b2CircleContact,
	n = Box2D.Dynamics.Contacts.b2Contact,
	r = Box2D.Dynamics.Contacts.b2ContactConstraint,
	a = Box2D.Dynamics.Contacts.b2ContactConstraintPoint,
	h = Box2D.Dynamics.Contacts.b2ContactEdge,
	l = Box2D.Dynamics.Contacts.b2ContactFactory,
	c = Box2D.Dynamics.Contacts.b2ContactRegister,
	m = Box2D.Dynamics.Contacts.b2ContactResult,
	_ = Box2D.Dynamics.Contacts.b2ContactSolver,
	u = Box2D.Dynamics.Contacts.b2EdgeAndCircleContact,
	p = Box2D.Dynamics.Contacts.b2NullContact,
	y = Box2D.Dynamics.Contacts.b2PolyAndCircleContact,
	d = Box2D.Dynamics.Contacts.b2PolyAndEdgeContact,
	x = Box2D.Dynamics.Contacts.b2PolygonContact,
	f = Box2D.Dynamics.Contacts.b2PositionSolverManifold,
	g = Box2D.Dynamics.b2Body,
	v = (Box2D.Dynamics.b2BodyDef, Box2D.Dynamics.b2ContactFilter, Box2D.Dynamics.b2ContactImpulse, Box2D.Dynamics.b2ContactListener, Box2D.Dynamics.b2ContactManager, Box2D.Dynamics.b2DebugDraw, Box2D.Dynamics.b2DestructionListener, Box2D.Dynamics.b2FilterData, Box2D.Dynamics.b2Fixture, Box2D.Dynamics.b2FixtureDef, Box2D.Dynamics.b2Island, Box2D.Dynamics.b2TimeStep),
	b = (Box2D.Dynamics.b2World, Box2D.Common.b2Color, Box2D.Common.b2internal, Box2D.Common.b2Settings),
	w = Box2D.Common.Math.b2Mat22,
	C = (Box2D.Common.Math.b2Mat33, Box2D.Common.Math.b2Math),
	D = (Box2D.Common.Math.b2Sweep, Box2D.Common.Math.b2Transform, Box2D.Common.Math.b2Vec2),
	B = (Box2D.Common.Math.b2Vec3, Box2D.Collision.b2AABB, Box2D.Collision.b2Bound, Box2D.Collision.b2BoundValues, Box2D.Collision.b2Collision),
	S = Box2D.Collision.b2ContactID,
	I = (Box2D.Collision.b2ContactPoint, Box2D.Collision.b2Distance, Box2D.Collision.b2DistanceInput, Box2D.Collision.b2DistanceOutput, Box2D.Collision.b2DistanceProxy, Box2D.Collision.b2DynamicTree, Box2D.Collision.b2DynamicTreeBroadPhase, Box2D.Collision.b2DynamicTreeNode, Box2D.Collision.b2DynamicTreePair, Box2D.Collision.b2Manifold),
	A = (Box2D.Collision.b2ManifoldPoint, Box2D.Collision.b2Point, Box2D.Collision.b2RayCastInput, Box2D.Collision.b2RayCastOutput, Box2D.Collision.b2Segment, Box2D.Collision.b2SeparationFunction, Box2D.Collision.b2Simplex, Box2D.Collision.b2SimplexCache, Box2D.Collision.b2SimplexVertex, Box2D.Collision.b2TimeOfImpact),
	M = Box2D.Collision.b2TOIInput,
	T = Box2D.Collision.b2WorldManifold;
	Box2D.Collision.ClipVertex,
	Box2D.Collision.Features,
	Box2D.Collision.IBroadPhase,
	Box2D.inherit(s, Box2D.Dynamics.Contacts.b2Contact),
	s.prototype.__super = Box2D.Dynamics.Contacts.b2Contact.prototype,
	s.b2CircleContact = function () {
		Box2D.Dynamics.Contacts.b2Contact.b2Contact.apply(this, arguments)
	},
	s.Create = function () {
		return new s
	},
	s.Destroy = function () {},
	s.prototype.Reset = function (t, e) {
		this.__super.Reset.call(this, t, e)
	},
	s.prototype.Evaluate = function () {
		var e = this.m_fixtureA.GetBody(),
		i = this.m_fixtureB.GetBody();
		B.CollideCircles(this.m_manifold, this.m_fixtureA.GetShape()instanceof t ? this.m_fixtureA.GetShape() : null, e.m_xf, this.m_fixtureB.GetShape()instanceof t ? this.m_fixtureB.GetShape() : null, i.m_xf)
	},
	n.b2Contact = function () {
		this.m_nodeA = new h,
		this.m_nodeB = new h,
		this.m_manifold = new I,
		this.m_oldManifold = new I
	},
	n.prototype.GetManifold = function () {
		return this.m_manifold
	},
	n.prototype.GetWorldManifold = function (t) {
		var e = this.m_fixtureA.GetBody(),
		i = this.m_fixtureB.GetBody(),
		o = this.m_fixtureA.GetShape(),
		s = this.m_fixtureB.GetShape();
		t.Initialize(this.m_manifold, e.GetTransform(), o.m_radius, i.GetTransform(), s.m_radius)
	},
	n.prototype.IsTouching = function () {
		return (this.m_flags & n.e_touchingFlag) == n.e_touchingFlag
	},
	n.prototype.IsContinuous = function () {
		return (this.m_flags & n.e_continuousFlag) == n.e_continuousFlag
	},
	n.prototype.SetSensor = function (t) {
		t ? this.m_flags |= n.e_sensorFlag : this.m_flags &= ~n.e_sensorFlag
	},
	n.prototype.IsSensor = function () {
		return (this.m_flags & n.e_sensorFlag) == n.e_sensorFlag
	},
	n.prototype.SetEnabled = function (t) {
		t ? this.m_flags |= n.e_enabledFlag : this.m_flags &= ~n.e_enabledFlag
	},
	n.prototype.IsEnabled = function () {
		return (this.m_flags & n.e_enabledFlag) == n.e_enabledFlag
	},
	n.prototype.GetNext = function () {
		return this.m_next
	},
	n.prototype.GetFixtureA = function () {
		return this.m_fixtureA
	},
	n.prototype.GetFixtureB = function () {
		return this.m_fixtureB
	},
	n.prototype.FlagForFiltering = function () {
		this.m_flags |= n.e_filterFlag
	},
	n.prototype.b2Contact = function () {},
	n.prototype.Reset = function (t, e) {
		if (t === void 0 && (t = null), e === void 0 && (e = null), this.m_flags = n.e_enabledFlag, !t || !e)
			return this.m_fixtureA = null, this.m_fixtureB = null, void 0;
		(t.IsSensor() || e.IsSensor()) && (this.m_flags |= n.e_sensorFlag);
		var i = t.GetBody(),
		o = e.GetBody();
		(i.GetType() != g.b2_dynamicBody || i.IsBullet() || o.GetType() != g.b2_dynamicBody || o.IsBullet()) && (this.m_flags |= n.e_continuousFlag),
		this.m_fixtureA = t,
		this.m_fixtureB = e,
		this.m_manifold.m_pointCount = 0,
		this.m_prev = null,
		this.m_next = null,
		this.m_nodeA.contact = null,
		this.m_nodeA.prev = null,
		this.m_nodeA.next = null,
		this.m_nodeA.other = null,
		this.m_nodeB.contact = null,
		this.m_nodeB.prev = null,
		this.m_nodeB.next = null,
		this.m_nodeB.other = null
	},
	n.prototype.Update = function (t) {
		var e = this.m_oldManifold;
		this.m_oldManifold = this.m_manifold,
		this.m_manifold = e,
		this.m_flags |= n.e_enabledFlag;
		var i = !1,
		s = (this.m_flags & n.e_touchingFlag) == n.e_touchingFlag,
		r = this.m_fixtureA.m_body,
		a = this.m_fixtureB.m_body,
		h = this.m_fixtureA.m_aabb.TestOverlap(this.m_fixtureB.m_aabb);
		if (this.m_flags & n.e_sensorFlag) {
			if (h) {
				var l = this.m_fixtureA.GetShape(),
				c = this.m_fixtureB.GetShape(),
				m = r.GetTransform(),
				_ = a.GetTransform();
				i = o.TestOverlap(l, m, c, _)
			}
			this.m_manifold.m_pointCount = 0
		} else {
			if (r.GetType() != g.b2_dynamicBody || r.IsBullet() || a.GetType() != g.b2_dynamicBody || a.IsBullet() ? this.m_flags |= n.e_continuousFlag : this.m_flags &= ~n.e_continuousFlag, h) {
				this.Evaluate(),
				i = this.m_manifold.m_pointCount > 0;
				for (var u = 0; this.m_manifold.m_pointCount > u; ++u) {
					var p = this.m_manifold.m_points[u];
					p.m_normalImpulse = 0,
					p.m_tangentImpulse = 0;
					for (var y = p.m_id, d = 0; this.m_oldManifold.m_pointCount > d; ++d) {
						var x = this.m_oldManifold.m_points[d];
						if (x.m_id.key == y.key) {
							p.m_normalImpulse = x.m_normalImpulse,
							p.m_tangentImpulse = x.m_tangentImpulse;
							break
						}
					}
				}
			} else
				this.m_manifold.m_pointCount = 0;
			i != s && (r.SetAwake(!0), a.SetAwake(!0))
		}
		i ? this.m_flags |= n.e_touchingFlag : this.m_flags &= ~n.e_touchingFlag,
		s == 0 && i == 1 && t.BeginContact(this),
		s == 1 && i == 0 && t.EndContact(this),
		(this.m_flags & n.e_sensorFlag) == 0 && t.PreSolve(this, this.m_oldManifold)
	},
	n.prototype.Evaluate = function () {},
	n.prototype.ComputeTOI = function (t, e) {
		return n.s_input.proxyA.Set(this.m_fixtureA.GetShape()),
		n.s_input.proxyB.Set(this.m_fixtureB.GetShape()),
		n.s_input.sweepA = t,
		n.s_input.sweepB = e,
		n.s_input.tolerance = b.b2_linearSlop,
		A.TimeOfImpact(n.s_input)
	},
	Box2D.postDefs.push(function () {
		Box2D.Dynamics.Contacts.b2Contact.e_sensorFlag = 1,
		Box2D.Dynamics.Contacts.b2Contact.e_continuousFlag = 2,
		Box2D.Dynamics.Contacts.b2Contact.e_islandFlag = 4,
		Box2D.Dynamics.Contacts.b2Contact.e_toiFlag = 8,
		Box2D.Dynamics.Contacts.b2Contact.e_touchingFlag = 16,
		Box2D.Dynamics.Contacts.b2Contact.e_enabledFlag = 32,
		Box2D.Dynamics.Contacts.b2Contact.e_filterFlag = 64,
		Box2D.Dynamics.Contacts.b2Contact.s_input = new M
	}),
	r.b2ContactConstraint = function () {
		this.localPlaneNormal = new D,
		this.localPoint = new D,
		this.normal = new D,
		this.normalMass = new w,
		this.K = new w
	},
	r.prototype.b2ContactConstraint = function () {
		this.points = new Vector(b.b2_maxManifoldPoints);
		for (var t = 0; b.b2_maxManifoldPoints > t; t++)
			this.points[t] = new a
	},
	a.b2ContactConstraintPoint = function () {
		this.localPoint = new D,
		this.rA = new D,
		this.rB = new D
	},
	h.b2ContactEdge = function () {},
	l.b2ContactFactory = function () {},
	l.prototype.b2ContactFactory = function (t) {
		this.m_allocator = t,
		this.InitializeRegisters()
	},
	l.prototype.AddType = function (t, e, i, o) {
		i === void 0 && (i = 0),
		o === void 0 && (o = 0),
		this.m_registers[i][o].createFcn = t,
		this.m_registers[i][o].destroyFcn = e,
		this.m_registers[i][o].primary = !0,
		i != o && (this.m_registers[o][i].createFcn = t, this.m_registers[o][i].destroyFcn = e, this.m_registers[o][i].primary = !1)
	},
	l.prototype.InitializeRegisters = function () {
		this.m_registers = new Vector(o.e_shapeTypeCount);
		for (var t = 0; o.e_shapeTypeCount > t; t++) {
			this.m_registers[t] = new Vector(o.e_shapeTypeCount);
			for (var e = 0; o.e_shapeTypeCount > e; e++)
				this.m_registers[t][e] = new c
		}
		this.AddType(s.Create, s.Destroy, o.e_circleShape, o.e_circleShape),
		this.AddType(y.Create, y.Destroy, o.e_polygonShape, o.e_circleShape),
		this.AddType(x.Create, x.Destroy, o.e_polygonShape, o.e_polygonShape),
		this.AddType(u.Create, u.Destroy, o.e_edgeShape, o.e_circleShape),
		this.AddType(d.Create, d.Destroy, o.e_polygonShape, o.e_edgeShape)
	},
	l.prototype.Create = function (t, e) {
		var i,
		o = parseInt(t.GetType()),
		s = parseInt(e.GetType()),
		n = this.m_registers[o][s];
		if (n.pool)
			return i = n.pool, n.pool = i.m_next, n.poolCount--, i.Reset(t, e), i;
		var r = n.createFcn;
		return r != null ? n.primary ? (i = r(this.m_allocator), i.Reset(t, e), i) : (i = r(this.m_allocator), i.Reset(e, t), i) : null
	},
	l.prototype.Destroy = function (t) {
		t.m_manifold.m_pointCount > 0 && (t.m_fixtureA.m_body.SetAwake(!0), t.m_fixtureB.m_body.SetAwake(!0));
		var e = parseInt(t.m_fixtureA.GetType()),
		i = parseInt(t.m_fixtureB.GetType()),
		o = this.m_registers[e][i];
		o.poolCount++,
		t.m_next = o.pool,
		o.pool = t;
		var s = o.destroyFcn;
		s(t, this.m_allocator)
	},
	c.b2ContactRegister = function () {},
	m.b2ContactResult = function () {
		this.position = new D,
		this.normal = new D,
		this.id = new S
	},
	_.b2ContactSolver = function () {
		this.m_step = new v,
		this.m_constraints = new Vector
	},
	_.prototype.b2ContactSolver = function () {},
	_.prototype.Initialize = function (t, e, i, o) {
		i === void 0 && (i = 0);
		var s;
		this.m_step.Set(t),
		this.m_allocator = o;
		var n = 0;
		this.m_constraintCount = i;
		while (this.m_constraintCount > this.m_constraints.length)
			this.m_constraints[this.m_constraints.length] = new r;
		for (n = 0; i > n; ++n) {
			s = e[n];
			var a = s.m_fixtureA,
			h = s.m_fixtureB,
			l = a.m_shape,
			c = h.m_shape,
			m = l.m_radius,
			u = c.m_radius,
			p = a.m_body,
			y = h.m_body,
			d = s.GetManifold(),
			x = b.b2MixFriction(a.GetFriction(), h.GetFriction()),
			f = b.b2MixRestitution(a.GetRestitution(), h.GetRestitution()),
			g = p.m_linearVelocity.x,
			v = p.m_linearVelocity.y,
			w = y.m_linearVelocity.x,
			C = y.m_linearVelocity.y,
			D = p.m_angularVelocity,
			B = y.m_angularVelocity;
			b.b2Assert(d.m_pointCount > 0),
			_.s_worldManifold.Initialize(d, p.m_xf, m, y.m_xf, u);
			var S = _.s_worldManifold.m_normal.x,
			I = _.s_worldManifold.m_normal.y,
			A = this.m_constraints[n];
			A.bodyA = p,
			A.bodyB = y,
			A.manifold = d,
			A.normal.x = S,
			A.normal.y = I,
			A.pointCount = d.m_pointCount,
			A.friction = x,
			A.restitution = f,
			A.localPlaneNormal.x = d.m_localPlaneNormal.x,
			A.localPlaneNormal.y = d.m_localPlaneNormal.y,
			A.localPoint.x = d.m_localPoint.x,
			A.localPoint.y = d.m_localPoint.y,
			A.radius = m + u,
			A.type = d.m_type;
			for (var M = 0; A.pointCount > M; ++M) {
				var T = d.m_points[M],
				V = A.points[M];
				V.normalImpulse = T.m_normalImpulse,
				V.tangentImpulse = T.m_tangentImpulse,
				V.localPoint.SetV(T.m_localPoint);
				var P = V.rA.x = _.s_worldManifold.m_points[M].x - p.m_sweep.c.x,
				R = V.rA.y = _.s_worldManifold.m_points[M].y - p.m_sweep.c.y,
				k = V.rB.x = _.s_worldManifold.m_points[M].x - y.m_sweep.c.x,
				L = V.rB.y = _.s_worldManifold.m_points[M].y - y.m_sweep.c.y,
				F = P * I - R * S,
				G = k * I - L * S;
				F *= F,
				G *= G;
				var z = p.m_invMass + y.m_invMass + p.m_invI * F + y.m_invI * G;
				V.normalMass = 1 / z;
				var E = p.m_mass * p.m_invMass + y.m_mass * y.m_invMass;
				E += p.m_mass * p.m_invI * F + y.m_mass * y.m_invI * G,
				V.equalizedMass = 1 / E;
				var J = I,
				O = -S,
				N = P * O - R * J,
				W = k * O - L * J;
				N *= N,
				W *= W;
				var j = p.m_invMass + y.m_invMass + p.m_invI * N + y.m_invI * W;
				V.tangentMass = 1 / j,
				V.velocityBias = 0;
				var U = w + -B * L - g - -D * R,
				q = C + B * k - v - D * P,
				X = A.normal.x * U + A.normal.y * q;
				-b.b2_velocityThreshold > X && (V.velocityBias += -A.restitution * X)
			}
			if (A.pointCount == 2) {
				var Y = A.points[0],
				H = A.points[1],
				K = p.m_invMass,
				Z = p.m_invI,
				Q = y.m_invMass,
				$ = y.m_invI,
				te = Y.rA.x * I - Y.rA.y * S,
				ee = Y.rB.x * I - Y.rB.y * S,
				ie = H.rA.x * I - H.rA.y * S,
				oe = H.rB.x * I - H.rB.y * S,
				se = K + Q + Z * te * te + $ * ee * ee,
				ne = K + Q + Z * ie * ie + $ * oe * oe,
				re = K + Q + Z * te * ie + $ * ee * oe,
				ae = 100;
				ae * (se * ne - re * re) > se * se ? (A.K.col1.Set(se, re), A.K.col2.Set(re, ne), A.K.GetInverse(A.normalMass)) : A.pointCount = 1
			}
		}
	},
	_.prototype.InitVelocityConstraints = function (t) {
		for (var e = 0; this.m_constraintCount > e; ++e) {
			var i = this.m_constraints[e],
			o = i.bodyA,
			s = i.bodyB,
			n = o.m_invMass,
			r = o.m_invI,
			a = s.m_invMass,
			h = s.m_invI,
			l = i.normal.x,
			c = i.normal.y,
			m = c,
			_ = -l,
			u = 0,
			p = 0;
			if (t.warmStarting)
				for (p = i.pointCount, u = 0; p > u; ++u) {
					var y = i.points[u];
					y.normalImpulse *= t.dtRatio,
					y.tangentImpulse *= t.dtRatio;
					var d = y.normalImpulse * l + y.tangentImpulse * m,
					x = y.normalImpulse * c + y.tangentImpulse * _;
					o.m_angularVelocity -= r * (y.rA.x * x - y.rA.y * d),
					o.m_linearVelocity.x -= n * d,
					o.m_linearVelocity.y -= n * x,
					s.m_angularVelocity += h * (y.rB.x * x - y.rB.y * d),
					s.m_linearVelocity.x += a * d,
					s.m_linearVelocity.y += a * x
				}
			else
				for (p = i.pointCount, u = 0; p > u; ++u) {
					var f = i.points[u];
					f.normalImpulse = 0,
					f.tangentImpulse = 0
				}
		}
	},
	_.prototype.SolveVelocityConstraints = function () {
		for (var t, e, i = 0, o = 0, s = 0, n = 0, r = 0, a = 0, h = 0, l = 0, c = 0, m = 0, _ = 0, u = 0, p = 0, y = 0, d = 0, x = 0, f = 0; this.m_constraintCount > f; ++f) {
			var g = this.m_constraints[f],
			v = g.bodyA,
			b = g.bodyB,
			w = v.m_angularVelocity,
			D = b.m_angularVelocity,
			B = v.m_linearVelocity,
			S = b.m_linearVelocity,
			I = v.m_invMass,
			A = v.m_invI,
			M = b.m_invMass,
			T = b.m_invI,
			V = g.normal.x,
			P = g.normal.y,
			R = P,
			k = -V,
			L = g.friction;
			for (i = 0; g.pointCount > i; i++)
				t = g.points[i], o = S.x - D * t.rB.y - B.x + w * t.rA.y, s = S.y + D * t.rB.x - B.y - w * t.rA.x, r = o * R + s * k, a = t.tangentMass * -r, h = L * t.normalImpulse, l = C.Clamp(t.tangentImpulse + a, -h, h), a = l - t.tangentImpulse, c = a * R, m = a * k, B.x -= I * c, B.y -= I * m, w -= A * (t.rA.x * m - t.rA.y * c), S.x += M * c, S.y += M * m, D += T * (t.rB.x * m - t.rB.y * c), t.tangentImpulse = l;
			if (parseInt(g.pointCount), g.pointCount == 1)
				t = g.points[0], o = S.x + -D * t.rB.y - B.x - -w * t.rA.y, s = S.y + D * t.rB.x - B.y - w * t.rA.x, n = o * V + s * P, a = -t.normalMass * (n - t.velocityBias), l = t.normalImpulse + a, l = l > 0 ? l : 0, a = l - t.normalImpulse, c = a * V, m = a * P, B.x -= I * c, B.y -= I * m, w -= A * (t.rA.x * m - t.rA.y * c), S.x += M * c, S.y += M * m, D += T * (t.rB.x * m - t.rB.y * c), t.normalImpulse = l;
			else {
				var F = g.points[0],
				G = g.points[1],
				z = F.normalImpulse,
				E = G.normalImpulse,
				J = S.x - D * F.rB.y - B.x + w * F.rA.y,
				O = S.y + D * F.rB.x - B.y - w * F.rA.x,
				N = S.x - D * G.rB.y - B.x + w * G.rA.y,
				W = S.y + D * G.rB.x - B.y - w * G.rA.x,
				j = J * V + O * P,
				U = N * V + W * P,
				q = j - F.velocityBias,
				X = U - G.velocityBias;
				for (e = g.K, q -= e.col1.x * z + e.col2.x * E, X -= e.col1.y * z + e.col2.y * E; ; ) {
					e = g.normalMass;
					var Y =  - (e.col1.x * q + e.col2.x * X),
					H =  - (e.col1.y * q + e.col2.y * X);
					if (Y >= 0 && H >= 0) {
						_ = Y - z,
						u = H - E,
						p = _ * V,
						y = _ * P,
						d = u * V,
						x = u * P,
						B.x -= I * (p + d),
						B.y -= I * (y + x),
						w -= A * (F.rA.x * y - F.rA.y * p + G.rA.x * x - G.rA.y * d),
						S.x += M * (p + d),
						S.y += M * (y + x),
						D += T * (F.rB.x * y - F.rB.y * p + G.rB.x * x - G.rB.y * d),
						F.normalImpulse = Y,
						G.normalImpulse = H;
						break
					}
					if (Y = -F.normalMass * q, H = 0, j = 0, U = g.K.col1.y * Y + X, Y >= 0 && U >= 0) {
						_ = Y - z,
						u = H - E,
						p = _ * V,
						y = _ * P,
						d = u * V,
						x = u * P,
						B.x -= I * (p + d),
						B.y -= I * (y + x),
						w -= A * (F.rA.x * y - F.rA.y * p + G.rA.x * x - G.rA.y * d),
						S.x += M * (p + d),
						S.y += M * (y + x),
						D += T * (F.rB.x * y - F.rB.y * p + G.rB.x * x - G.rB.y * d),
						F.normalImpulse = Y,
						G.normalImpulse = H;
						break
					}
					if (Y = 0, H = -G.normalMass * X, j = g.K.col2.x * H + q, U = 0, H >= 0 && j >= 0) {
						_ = Y - z,
						u = H - E,
						p = _ * V,
						y = _ * P,
						d = u * V,
						x = u * P,
						B.x -= I * (p + d),
						B.y -= I * (y + x),
						w -= A * (F.rA.x * y - F.rA.y * p + G.rA.x * x - G.rA.y * d),
						S.x += M * (p + d),
						S.y += M * (y + x),
						D += T * (F.rB.x * y - F.rB.y * p + G.rB.x * x - G.rB.y * d),
						F.normalImpulse = Y,
						G.normalImpulse = H;
						break
					}
					if (Y = 0, H = 0, j = q, U = X, j >= 0 && U >= 0) {
						_ = Y - z,
						u = H - E,
						p = _ * V,
						y = _ * P,
						d = u * V,
						x = u * P,
						B.x -= I * (p + d),
						B.y -= I * (y + x),
						w -= A * (F.rA.x * y - F.rA.y * p + G.rA.x * x - G.rA.y * d),
						S.x += M * (p + d),
						S.y += M * (y + x),
						D += T * (F.rB.x * y - F.rB.y * p + G.rB.x * x - G.rB.y * d),
						F.normalImpulse = Y,
						G.normalImpulse = H;
						break
					}
					break
				}
			}
			v.m_angularVelocity = w,
			b.m_angularVelocity = D
		}
	},
	_.prototype.FinalizeVelocityConstraints = function () {
		for (var t = 0; this.m_constraintCount > t; ++t)
			for (var e = this.m_constraints[t], i = e.manifold, o = 0; e.pointCount > o; ++o) {
				var s = i.m_points[o],
				n = e.points[o];
				s.m_normalImpulse = n.normalImpulse,
				s.m_tangentImpulse = n.tangentImpulse
			}
	},
	_.prototype.SolvePositionConstraints = function (t) {
		t === void 0 && (t = 0);
		for (var e = 0, i = 0; this.m_constraintCount > i; i++) {
			var o = this.m_constraints[i],
			s = o.bodyA,
			n = o.bodyB,
			r = s.m_mass * s.m_invMass,
			a = s.m_mass * s.m_invI,
			h = n.m_mass * n.m_invMass,
			l = n.m_mass * n.m_invI;
			_.s_psm.Initialize(o);
			for (var c = _.s_psm.m_normal, m = 0; o.pointCount > m; m++) {
				var u = o.points[m],
				p = _.s_psm.m_points[m],
				y = _.s_psm.m_separations[m],
				d = p.x - s.m_sweep.c.x,
				x = p.y - s.m_sweep.c.y,
				f = p.x - n.m_sweep.c.x,
				g = p.y - n.m_sweep.c.y;
				e = y > e ? e : y;
				var v = C.Clamp(t * (y + b.b2_linearSlop), -b.b2_maxLinearCorrection, 0),
				w = -u.equalizedMass * v,
				D = w * c.x,
				B = w * c.y;
				s.m_sweep.c.x -= r * D,
				s.m_sweep.c.y -= r * B,
				s.m_sweep.a -= a * (d * B - x * D),
				s.SynchronizeTransform(),
				n.m_sweep.c.x += h * D,
				n.m_sweep.c.y += h * B,
				n.m_sweep.a += l * (f * B - g * D),
				n.SynchronizeTransform()
			}
		}
		return e > -1.5 * b.b2_linearSlop
	},
	Box2D.postDefs.push(function () {
		Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold = new T,
		Box2D.Dynamics.Contacts.b2ContactSolver.s_psm = new f
	}),
	Box2D.inherit(u, Box2D.Dynamics.Contacts.b2Contact),
	u.prototype.__super = Box2D.Dynamics.Contacts.b2Contact.prototype,
	u.b2EdgeAndCircleContact = function () {
		Box2D.Dynamics.Contacts.b2Contact.b2Contact.apply(this, arguments)
	},
	u.Create = function () {
		return new u
	},
	u.Destroy = function () {},
	u.prototype.Reset = function (t, e) {
		this.__super.Reset.call(this, t, e)
	},
	u.prototype.Evaluate = function () {
		var i = this.m_fixtureA.GetBody(),
		o = this.m_fixtureB.GetBody();
		this.b2CollideEdgeAndCircle(this.m_manifold, this.m_fixtureA.GetShape()instanceof e ? this.m_fixtureA.GetShape() : null, i.m_xf, this.m_fixtureB.GetShape()instanceof t ? this.m_fixtureB.GetShape() : null, o.m_xf)
	},
	u.prototype.b2CollideEdgeAndCircle = function () {},
	Box2D.inherit(p, Box2D.Dynamics.Contacts.b2Contact),
	p.prototype.__super = Box2D.Dynamics.Contacts.b2Contact.prototype,
	p.b2NullContact = function () {
		Box2D.Dynamics.Contacts.b2Contact.b2Contact.apply(this, arguments)
	},
	p.prototype.b2NullContact = function () {
		this.__super.b2Contact.call(this)
	},
	p.prototype.Evaluate = function () {},
	Box2D.inherit(y, Box2D.Dynamics.Contacts.b2Contact),
	y.prototype.__super = Box2D.Dynamics.Contacts.b2Contact.prototype,
	y.b2PolyAndCircleContact = function () {
		Box2D.Dynamics.Contacts.b2Contact.b2Contact.apply(this, arguments)
	},
	y.Create = function () {
		return new y
	},
	y.Destroy = function () {},
	y.prototype.Reset = function (t, e) {
		this.__super.Reset.call(this, t, e),
		b.b2Assert(t.GetType() == o.e_polygonShape),
		b.b2Assert(e.GetType() == o.e_circleShape)
	},
	y.prototype.Evaluate = function () {
		var e = this.m_fixtureA.m_body,
		o = this.m_fixtureB.m_body;
		B.CollidePolygonAndCircle(this.m_manifold, this.m_fixtureA.GetShape()instanceof i ? this.m_fixtureA.GetShape() : null, e.m_xf, this.m_fixtureB.GetShape()instanceof t ? this.m_fixtureB.GetShape() : null, o.m_xf)
	},
	Box2D.inherit(d, Box2D.Dynamics.Contacts.b2Contact),
	d.prototype.__super = Box2D.Dynamics.Contacts.b2Contact.prototype,
	d.b2PolyAndEdgeContact = function () {
		Box2D.Dynamics.Contacts.b2Contact.b2Contact.apply(this, arguments)
	},
	d.Create = function () {
		return new d
	},
	d.Destroy = function () {},
	d.prototype.Reset = function (t, e) {
		this.__super.Reset.call(this, t, e),
		b.b2Assert(t.GetType() == o.e_polygonShape),
		b.b2Assert(e.GetType() == o.e_edgeShape)
	},
	d.prototype.Evaluate = function () {
		var t = this.m_fixtureA.GetBody(),
		o = this.m_fixtureB.GetBody();
		this.b2CollidePolyAndEdge(this.m_manifold, this.m_fixtureA.GetShape()instanceof i ? this.m_fixtureA.GetShape() : null, t.m_xf, this.m_fixtureB.GetShape()instanceof e ? this.m_fixtureB.GetShape() : null, o.m_xf)
	},
	d.prototype.b2CollidePolyAndEdge = function () {},
	Box2D.inherit(x, Box2D.Dynamics.Contacts.b2Contact),
	x.prototype.__super = Box2D.Dynamics.Contacts.b2Contact.prototype,
	x.b2PolygonContact = function () {
		Box2D.Dynamics.Contacts.b2Contact.b2Contact.apply(this, arguments)
	},
	x.Create = function () {
		return new x
	},
	x.Destroy = function () {},
	x.prototype.Reset = function (t, e) {
		this.__super.Reset.call(this, t, e)
	},
	x.prototype.Evaluate = function () {
		var t = this.m_fixtureA.GetBody(),
		e = this.m_fixtureB.GetBody();
		B.CollidePolygons(this.m_manifold, this.m_fixtureA.GetShape()instanceof i ? this.m_fixtureA.GetShape() : null, t.m_xf, this.m_fixtureB.GetShape()instanceof i ? this.m_fixtureB.GetShape() : null, e.m_xf)
	},
	f.b2PositionSolverManifold = function () {},
	f.prototype.b2PositionSolverManifold = function () {
		this.m_normal = new D,
		this.m_separations = new Vector_a2j_Number(b.b2_maxManifoldPoints),
		this.m_points = new Vector(b.b2_maxManifoldPoints);
		for (var t = 0; b.b2_maxManifoldPoints > t; t++)
			this.m_points[t] = new D
	},
	f.prototype.Initialize = function (t) {
		b.b2Assert(t.pointCount > 0);
		var e,
		i,
		o = 0,
		s = 0,
		n = 0,
		r = 0,
		a = 0;
		switch (t.type) {
		case I.e_circles:
			e = t.bodyA.m_xf.R,
			i = t.localPoint;
			var h = t.bodyA.m_xf.position.x + (e.col1.x * i.x + e.col2.x * i.y),
			l = t.bodyA.m_xf.position.y + (e.col1.y * i.x + e.col2.y * i.y);
			e = t.bodyB.m_xf.R,
			i = t.points[0].localPoint;
			var c = t.bodyB.m_xf.position.x + (e.col1.x * i.x + e.col2.x * i.y),
			m = t.bodyB.m_xf.position.y + (e.col1.y * i.x + e.col2.y * i.y),
			_ = c - h,
			u = m - l,
			p = _ * _ + u * u;
			if (p > Number.MIN_VALUE * Number.MIN_VALUE) {
				var y = Math.sqrt(p);
				this.m_normal.x = _ / y,
				this.m_normal.y = u / y
			} else
				this.m_normal.x = 1, this.m_normal.y = 0;
			this.m_points[0].x = .5 * (h + c),
			this.m_points[0].y = .5 * (l + m),
			this.m_separations[0] = _ * this.m_normal.x + u * this.m_normal.y - t.radius;
			break;
		case I.e_faceA:
			for (e = t.bodyA.m_xf.R, i = t.localPlaneNormal, this.m_normal.x = e.col1.x * i.x + e.col2.x * i.y, this.m_normal.y = e.col1.y * i.x + e.col2.y * i.y, e = t.bodyA.m_xf.R, i = t.localPoint, r = t.bodyA.m_xf.position.x + (e.col1.x * i.x + e.col2.x * i.y), a = t.bodyA.m_xf.position.y + (e.col1.y * i.x + e.col2.y * i.y), e = t.bodyB.m_xf.R, o = 0; t.pointCount > o; ++o)
				i = t.points[o].localPoint, s = t.bodyB.m_xf.position.x + (e.col1.x * i.x + e.col2.x * i.y), n = t.bodyB.m_xf.position.y + (e.col1.y * i.x + e.col2.y * i.y), this.m_separations[o] = (s - r) * this.m_normal.x + (n - a) * this.m_normal.y - t.radius, this.m_points[o].x = s, this.m_points[o].y = n;
			break;
		case I.e_faceB:
			for (e = t.bodyB.m_xf.R, i = t.localPlaneNormal, this.m_normal.x = e.col1.x * i.x + e.col2.x * i.y, this.m_normal.y = e.col1.y * i.x + e.col2.y * i.y, e = t.bodyB.m_xf.R, i = t.localPoint, r = t.bodyB.m_xf.position.x + (e.col1.x * i.x + e.col2.x * i.y), a = t.bodyB.m_xf.position.y + (e.col1.y * i.x + e.col2.y * i.y), e = t.bodyA.m_xf.R, o = 0; t.pointCount > o; ++o)
				i = t.points[o].localPoint, s = t.bodyA.m_xf.position.x + (e.col1.x * i.x + e.col2.x * i.y), n = t.bodyA.m_xf.position.y + (e.col1.y * i.x + e.col2.y * i.y), this.m_separations[o] = (s - r) * this.m_normal.x + (n - a) * this.m_normal.y - t.radius, this.m_points[o].Set(s, n);
			this.m_normal.x *= -1,
			this.m_normal.y *= -1
		}
	},
	Box2D.postDefs.push(function () {
		Box2D.Dynamics.Contacts.b2PositionSolverManifold.circlePointA = new D,
		Box2D.Dynamics.Contacts.b2PositionSolverManifold.circlePointB = new D
	})
}
(), function () {
	var t = (Box2D.Dynamics.b2Body, Box2D.Dynamics.b2BodyDef, Box2D.Dynamics.b2ContactFilter, Box2D.Dynamics.b2ContactImpulse, Box2D.Dynamics.b2ContactListener, Box2D.Dynamics.b2ContactManager, Box2D.Dynamics.b2DebugDraw, Box2D.Dynamics.b2DestructionListener, Box2D.Dynamics.b2FilterData, Box2D.Dynamics.b2Fixture, Box2D.Dynamics.b2FixtureDef, Box2D.Dynamics.b2Island, Box2D.Dynamics.b2TimeStep, Box2D.Dynamics.b2World, Box2D.Common.Math.b2Mat22),
	e = (Box2D.Common.Math.b2Mat33, Box2D.Common.Math.b2Math),
	i = (Box2D.Common.Math.b2Sweep, Box2D.Common.Math.b2Transform, Box2D.Common.Math.b2Vec2),
	o = (Box2D.Common.Math.b2Vec3, Box2D.Common.b2Color),
	s = (Box2D.Common.b2internal, Box2D.Common.b2Settings, Box2D.Collision.Shapes.b2CircleShape, Box2D.Collision.Shapes.b2EdgeChainDef, Box2D.Collision.Shapes.b2EdgeShape, Box2D.Collision.Shapes.b2MassData, Box2D.Collision.Shapes.b2PolygonShape, Box2D.Collision.Shapes.b2Shape, Box2D.Dynamics.Controllers.b2BuoyancyController),
	n = Box2D.Dynamics.Controllers.b2ConstantAccelController,
	r = Box2D.Dynamics.Controllers.b2ConstantForceController,
	a = Box2D.Dynamics.Controllers.b2Controller,
	h = Box2D.Dynamics.Controllers.b2ControllerEdge,
	l = Box2D.Dynamics.Controllers.b2GravityController,
	c = Box2D.Dynamics.Controllers.b2TensorDampingController;
	Box2D.inherit(s, Box2D.Dynamics.Controllers.b2Controller),
	s.prototype.__super = Box2D.Dynamics.Controllers.b2Controller.prototype,
	s.b2BuoyancyController = function () {
		Box2D.Dynamics.Controllers.b2Controller.b2Controller.apply(this, arguments),
		this.normal = new i(0, -1),
		this.offset = 0,
		this.density = 0,
		this.velocity = new i(0, 0),
		this.linearDrag = 2,
		this.angularDrag = 1,
		this.useDensity = !1,
		this.useWorldGravity = !0,
		this.gravity = null
	},
	s.prototype.Step = function () {
		if (this.m_bodyList) {
			this.useWorldGravity && (this.gravity = this.GetWorld().GetGravity().Copy());
			for (var t = this.m_bodyList; t; t = t.nextBody) {
				var e = t.body;
				if (e.IsAwake() != 0) {
					for (var o = new i, s = new i, n = 0, r = 0, a = e.GetFixtureList(); a; a = a.GetNext()) {
						var h = new i,
						l = a.GetShape().ComputeSubmergedArea(this.normal, this.offset, e.GetTransform(), h);
						n += l,
						o.x += l * h.x,
						o.y += l * h.y;
						var c = 0;
						c = this.useDensity ? 1 : 1,
						r += l * c,
						s.x += l * h.x * c,
						s.y += l * h.y * c
					}
					if (o.x /= n, o.y /= n, s.x /= r, s.y /= r, n >= Number.MIN_VALUE) {
						var m = this.gravity.GetNegative();
						m.Multiply(this.density * n),
						e.ApplyForce(m, s);
						var _ = e.GetLinearVelocityFromWorldPoint(o);
						_.Subtract(this.velocity),
						_.Multiply(-this.linearDrag * n),
						e.ApplyForce(_, o),
						e.ApplyTorque(-e.GetInertia() / e.GetMass() * n * e.GetAngularVelocity() * this.angularDrag)
					}
				}
			}
		}
	},
	s.prototype.Draw = function (t) {
		var e = 1e3,
		s = new i,
		n = new i;
		s.x = this.normal.x * this.offset + this.normal.y * e,
		s.y = this.normal.y * this.offset - this.normal.x * e,
		n.x = this.normal.x * this.offset - this.normal.y * e,
		n.y = this.normal.y * this.offset + this.normal.x * e;
		var r = new o(0, 0, 1);
		t.DrawSegment(s, n, r)
	},
	Box2D.inherit(n, Box2D.Dynamics.Controllers.b2Controller),
	n.prototype.__super = Box2D.Dynamics.Controllers.b2Controller.prototype,
	n.b2ConstantAccelController = function () {
		Box2D.Dynamics.Controllers.b2Controller.b2Controller.apply(this, arguments),
		this.A = new i(0, 0)
	},
	n.prototype.Step = function (t) {
		for (var e = new i(this.A.x * t.dt, this.A.y * t.dt), o = this.m_bodyList; o; o = o.nextBody) {
			var s = o.body;
			s.IsAwake() && s.SetLinearVelocity(new i(s.GetLinearVelocity().x + e.x, s.GetLinearVelocity().y + e.y))
		}
	},
	Box2D.inherit(r, Box2D.Dynamics.Controllers.b2Controller),
	r.prototype.__super = Box2D.Dynamics.Controllers.b2Controller.prototype,
	r.b2ConstantForceController = function () {
		Box2D.Dynamics.Controllers.b2Controller.b2Controller.apply(this, arguments),
		this.F = new i(0, 0)
	},
	r.prototype.Step = function () {
		for (var t = this.m_bodyList; t; t = t.nextBody) {
			var e = t.body;
			e.IsAwake() && e.ApplyForce(this.F, e.GetWorldCenter())
		}
	},
	a.b2Controller = function () {},
	a.prototype.Step = function () {},
	a.prototype.Draw = function () {},
	a.prototype.AddBody = function (t) {
		var e = new h;
		e.controller = this,
		e.body = t,
		e.nextBody = this.m_bodyList,
		e.prevBody = null,
		this.m_bodyList = e,
		e.nextBody && (e.nextBody.prevBody = e),
		this.m_bodyCount++,
		e.nextController = t.m_controllerList,
		e.prevController = null,
		t.m_controllerList = e,
		e.nextController && (e.nextController.prevController = e),
		t.m_controllerCount++
	},
	a.prototype.RemoveBody = function (t) {
		var e = t.m_controllerList;
		while (e && e.controller != this)
			e = e.nextController;
		e.prevBody && (e.prevBody.nextBody = e.nextBody),
		e.nextBody && (e.nextBody.prevBody = e.prevBody),
		e.nextController && (e.nextController.prevController = e.prevController),
		e.prevController && (e.prevController.nextController = e.nextController),
		this.m_bodyList == e && (this.m_bodyList = e.nextBody),
		t.m_controllerList == e && (t.m_controllerList = e.nextController),
		t.m_controllerCount--,
		this.m_bodyCount--
	},
	a.prototype.Clear = function () {
		while (this.m_bodyList)
			this.RemoveBody(this.m_bodyList.body)
	},
	a.prototype.GetNext = function () {
		return this.m_next
	},
	a.prototype.GetWorld = function () {
		return this.m_world
	},
	a.prototype.GetBodyList = function () {
		return this.m_bodyList
	},
	h.b2ControllerEdge = function () {},
	Box2D.inherit(l, Box2D.Dynamics.Controllers.b2Controller),
	l.prototype.__super = Box2D.Dynamics.Controllers.b2Controller.prototype,
	l.b2GravityController = function () {
		Box2D.Dynamics.Controllers.b2Controller.b2Controller.apply(this, arguments),
		this.G = 1,
		this.invSqr = !0
	},
	l.prototype.Step = function () {
		var t = null,
		e = null,
		o = null,
		s = 0,
		n = null,
		r = null,
		a = null,
		h = 0,
		l = 0,
		c = 0,
		m = null;
		if (this.invSqr)
			for (t = this.m_bodyList; t; t = t.nextBody)
				for (e = t.body, o = e.GetWorldCenter(), s = e.GetMass(), n = this.m_bodyList; n != t; n = n.nextBody)
					r = n.body, a = r.GetWorldCenter(), h = a.x - o.x, l = a.y - o.y, c = h * h + l * l, Number.MIN_VALUE > c || (m = new i(h, l), m.Multiply(this.G / c / Math.sqrt(c) * s * r.GetMass()), e.IsAwake() && e.ApplyForce(m, o), m.Multiply(-1), r.IsAwake() && r.ApplyForce(m, a));
		else
			for (t = this.m_bodyList; t; t = t.nextBody)
				for (e = t.body, o = e.GetWorldCenter(), s = e.GetMass(), n = this.m_bodyList; n != t; n = n.nextBody)
					r = n.body, a = r.GetWorldCenter(), h = a.x - o.x, l = a.y - o.y, c = h * h + l * l, Number.MIN_VALUE > c || (m = new i(h, l), m.Multiply(this.G / c * s * r.GetMass()), e.IsAwake() && e.ApplyForce(m, o), m.Multiply(-1), r.IsAwake() && r.ApplyForce(m, a))
	},
	Box2D.inherit(c, Box2D.Dynamics.Controllers.b2Controller),
	c.prototype.__super = Box2D.Dynamics.Controllers.b2Controller.prototype,
	c.b2TensorDampingController = function () {
		Box2D.Dynamics.Controllers.b2Controller.b2Controller.apply(this, arguments),
		this.T = new t,
		this.maxTimestep = 0
	},
	c.prototype.SetAxisAligned = function (t, e) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		this.T.col1.x = -t,
		this.T.col1.y = 0,
		this.T.col2.x = 0,
		this.T.col2.y = -e,
		this.maxTimestep = t > 0 || e > 0 ? 1 / Math.max(t, e) : 0
	},
	c.prototype.Step = function (t) {
		var o = t.dt;
		if (o > Number.MIN_VALUE) {
			o > this.maxTimestep && this.maxTimestep > 0 && (o = this.maxTimestep);
			for (var s = this.m_bodyList; s; s = s.nextBody) {
				var n = s.body;
				if (n.IsAwake()) {
					var r = n.GetWorldVector(e.MulMV(this.T, n.GetLocalVector(n.GetLinearVelocity())));
					n.SetLinearVelocity(new i(n.GetLinearVelocity().x + r.x * o, n.GetLinearVelocity().y + r.y * o))
				}
			}
		}
	}
}
(), function () {
	var t = (Box2D.Common.b2Color, Box2D.Common.b2internal, Box2D.Common.b2Settings),
	e = Box2D.Common.Math.b2Mat22,
	i = Box2D.Common.Math.b2Mat33,
	o = Box2D.Common.Math.b2Math,
	s = (Box2D.Common.Math.b2Sweep, Box2D.Common.Math.b2Transform, Box2D.Common.Math.b2Vec2),
	n = Box2D.Common.Math.b2Vec3,
	r = Box2D.Dynamics.Joints.b2DistanceJoint,
	a = Box2D.Dynamics.Joints.b2DistanceJointDef,
	h = Box2D.Dynamics.Joints.b2FrictionJoint,
	l = Box2D.Dynamics.Joints.b2FrictionJointDef,
	c = Box2D.Dynamics.Joints.b2GearJoint,
	m = Box2D.Dynamics.Joints.b2GearJointDef,
	_ = Box2D.Dynamics.Joints.b2Jacobian,
	u = Box2D.Dynamics.Joints.b2Joint,
	p = Box2D.Dynamics.Joints.b2JointDef,
	y = Box2D.Dynamics.Joints.b2JointEdge,
	d = Box2D.Dynamics.Joints.b2LineJoint,
	x = Box2D.Dynamics.Joints.b2LineJointDef,
	f = Box2D.Dynamics.Joints.b2MouseJoint,
	g = Box2D.Dynamics.Joints.b2MouseJointDef,
	v = Box2D.Dynamics.Joints.b2PrismaticJoint,
	b = Box2D.Dynamics.Joints.b2PrismaticJointDef,
	w = Box2D.Dynamics.Joints.b2PulleyJoint,
	C = Box2D.Dynamics.Joints.b2PulleyJointDef,
	D = Box2D.Dynamics.Joints.b2RevoluteJoint,
	B = Box2D.Dynamics.Joints.b2RevoluteJointDef,
	S = Box2D.Dynamics.Joints.b2WeldJoint,
	I = Box2D.Dynamics.Joints.b2WeldJointDef;
	Box2D.Dynamics.b2Body,
	Box2D.Dynamics.b2BodyDef,
	Box2D.Dynamics.b2ContactFilter,
	Box2D.Dynamics.b2ContactImpulse,
	Box2D.Dynamics.b2ContactListener,
	Box2D.Dynamics.b2ContactManager,
	Box2D.Dynamics.b2DebugDraw,
	Box2D.Dynamics.b2DestructionListener,
	Box2D.Dynamics.b2FilterData,
	Box2D.Dynamics.b2Fixture,
	Box2D.Dynamics.b2FixtureDef,
	Box2D.Dynamics.b2Island,
	Box2D.Dynamics.b2TimeStep,
	Box2D.Dynamics.b2World,
	Box2D.inherit(r, Box2D.Dynamics.Joints.b2Joint),
	r.prototype.__super = Box2D.Dynamics.Joints.b2Joint.prototype,
	r.b2DistanceJoint = function () {
		Box2D.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
		this.m_localAnchor1 = new s,
		this.m_localAnchor2 = new s,
		this.m_u = new s
	},
	r.prototype.GetAnchorA = function () {
		return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
	},
	r.prototype.GetAnchorB = function () {
		return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
	},
	r.prototype.GetReactionForce = function (t) {
		return t === void 0 && (t = 0),
		new s(t * this.m_impulse * this.m_u.x, t * this.m_impulse * this.m_u.y)
	},
	r.prototype.GetReactionTorque = function (t) {
		return t === void 0 && (t = 0),
		0
	},
	r.prototype.GetLength = function () {
		return this.m_length
	},
	r.prototype.SetLength = function (t) {
		t === void 0 && (t = 0),
		this.m_length = t
	},
	r.prototype.GetFrequency = function () {
		return this.m_frequencyHz
	},
	r.prototype.SetFrequency = function (t) {
		t === void 0 && (t = 0),
		this.m_frequencyHz = t
	},
	r.prototype.GetDampingRatio = function () {
		return this.m_dampingRatio
	},
	r.prototype.SetDampingRatio = function (t) {
		t === void 0 && (t = 0),
		this.m_dampingRatio = t
	},
	r.prototype.b2DistanceJoint = function (t) {
		this.__super.b2Joint.call(this, t),
		this.m_localAnchor1.SetV(t.localAnchorA),
		this.m_localAnchor2.SetV(t.localAnchorB),
		this.m_length = t.length,
		this.m_frequencyHz = t.frequencyHz,
		this.m_dampingRatio = t.dampingRatio,
		this.m_impulse = 0,
		this.m_gamma = 0,
		this.m_bias = 0
	},
	r.prototype.InitVelocityConstraints = function (e) {
		var i,
		o = 0,
		s = this.m_bodyA,
		n = this.m_bodyB;
		i = s.m_xf.R;
		var r = this.m_localAnchor1.x - s.m_sweep.localCenter.x,
		a = this.m_localAnchor1.y - s.m_sweep.localCenter.y;
		o = i.col1.x * r + i.col2.x * a,
		a = i.col1.y * r + i.col2.y * a,
		r = o,
		i = n.m_xf.R;
		var h = this.m_localAnchor2.x - n.m_sweep.localCenter.x,
		l = this.m_localAnchor2.y - n.m_sweep.localCenter.y;
		o = i.col1.x * h + i.col2.x * l,
		l = i.col1.y * h + i.col2.y * l,
		h = o,
		this.m_u.x = n.m_sweep.c.x + h - s.m_sweep.c.x - r,
		this.m_u.y = n.m_sweep.c.y + l - s.m_sweep.c.y - a;
		var c = Math.sqrt(this.m_u.x * this.m_u.x + this.m_u.y * this.m_u.y);
		c > t.b2_linearSlop ? this.m_u.Multiply(1 / c) : this.m_u.SetZero();
		var m = r * this.m_u.y - a * this.m_u.x,
		_ = h * this.m_u.y - l * this.m_u.x,
		u = s.m_invMass + s.m_invI * m * m + n.m_invMass + n.m_invI * _ * _;
		if (this.m_mass = u != 0 ? 1 / u : 0, this.m_frequencyHz > 0) {
			var p = c - this.m_length,
			y = 2 * Math.PI * this.m_frequencyHz,
			d = 2 * this.m_mass * this.m_dampingRatio * y,
			x = this.m_mass * y * y;
			this.m_gamma = e.dt * (d + e.dt * x),
			this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0,
			this.m_bias = p * e.dt * x * this.m_gamma,
			this.m_mass = u + this.m_gamma,
			this.m_mass = this.m_mass != 0 ? 1 / this.m_mass : 0
		}
		if (e.warmStarting) {
			this.m_impulse *= e.dtRatio;
			var f = this.m_impulse * this.m_u.x,
			g = this.m_impulse * this.m_u.y;
			s.m_linearVelocity.x -= s.m_invMass * f,
			s.m_linearVelocity.y -= s.m_invMass * g,
			s.m_angularVelocity -= s.m_invI * (r * g - a * f),
			n.m_linearVelocity.x += n.m_invMass * f,
			n.m_linearVelocity.y += n.m_invMass * g,
			n.m_angularVelocity += n.m_invI * (h * g - l * f)
		} else
			this.m_impulse = 0
	},
	r.prototype.SolveVelocityConstraints = function () {
		var t,
		e = this.m_bodyA,
		i = this.m_bodyB;
		t = e.m_xf.R;
		var o = this.m_localAnchor1.x - e.m_sweep.localCenter.x,
		s = this.m_localAnchor1.y - e.m_sweep.localCenter.y,
		n = t.col1.x * o + t.col2.x * s;
		s = t.col1.y * o + t.col2.y * s,
		o = n,
		t = i.m_xf.R;
		var r = this.m_localAnchor2.x - i.m_sweep.localCenter.x,
		a = this.m_localAnchor2.y - i.m_sweep.localCenter.y;
		n = t.col1.x * r + t.col2.x * a,
		a = t.col1.y * r + t.col2.y * a,
		r = n;
		var h = e.m_linearVelocity.x + -e.m_angularVelocity * s,
		l = e.m_linearVelocity.y + e.m_angularVelocity * o,
		c = i.m_linearVelocity.x + -i.m_angularVelocity * a,
		m = i.m_linearVelocity.y + i.m_angularVelocity * r,
		_ = this.m_u.x * (c - h) + this.m_u.y * (m - l),
		u = -this.m_mass * (_ + this.m_bias + this.m_gamma * this.m_impulse);
		this.m_impulse += u;
		var p = u * this.m_u.x,
		y = u * this.m_u.y;
		e.m_linearVelocity.x -= e.m_invMass * p,
		e.m_linearVelocity.y -= e.m_invMass * y,
		e.m_angularVelocity -= e.m_invI * (o * y - s * p),
		i.m_linearVelocity.x += i.m_invMass * p,
		i.m_linearVelocity.y += i.m_invMass * y,
		i.m_angularVelocity += i.m_invI * (r * y - a * p)
	},
	r.prototype.SolvePositionConstraints = function (e) {
		e === void 0 && (e = 0);
		var i;
		if (this.m_frequencyHz > 0)
			return !0;
		var s = this.m_bodyA,
		n = this.m_bodyB;
		i = s.m_xf.R;
		var r = this.m_localAnchor1.x - s.m_sweep.localCenter.x,
		a = this.m_localAnchor1.y - s.m_sweep.localCenter.y,
		h = i.col1.x * r + i.col2.x * a;
		a = i.col1.y * r + i.col2.y * a,
		r = h,
		i = n.m_xf.R;
		var l = this.m_localAnchor2.x - n.m_sweep.localCenter.x,
		c = this.m_localAnchor2.y - n.m_sweep.localCenter.y;
		h = i.col1.x * l + i.col2.x * c,
		c = i.col1.y * l + i.col2.y * c,
		l = h;
		var m = n.m_sweep.c.x + l - s.m_sweep.c.x - r,
		_ = n.m_sweep.c.y + c - s.m_sweep.c.y - a,
		u = Math.sqrt(m * m + _ * _);
		m /= u,
		_ /= u;
		var p = u - this.m_length;
		p = o.Clamp(p, -t.b2_maxLinearCorrection, t.b2_maxLinearCorrection);
		var y = -this.m_mass * p;
		this.m_u.Set(m, _);
		var d = y * this.m_u.x,
		x = y * this.m_u.y;
		return s.m_sweep.c.x -= s.m_invMass * d,
		s.m_sweep.c.y -= s.m_invMass * x,
		s.m_sweep.a -= s.m_invI * (r * x - a * d),
		n.m_sweep.c.x += n.m_invMass * d,
		n.m_sweep.c.y += n.m_invMass * x,
		n.m_sweep.a += n.m_invI * (l * x - c * d),
		s.SynchronizeTransform(),
		n.SynchronizeTransform(),
		t.b2_linearSlop > o.Abs(p)
	},
	Box2D.inherit(a, Box2D.Dynamics.Joints.b2JointDef),
	a.prototype.__super = Box2D.Dynamics.Joints.b2JointDef.prototype,
	a.b2DistanceJointDef = function () {
		Box2D.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments),
		this.localAnchorA = new s,
		this.localAnchorB = new s
	},
	a.prototype.b2DistanceJointDef = function () {
		this.__super.b2JointDef.call(this),
		this.type = u.e_distanceJoint,
		this.length = 1,
		this.frequencyHz = 0,
		this.dampingRatio = 0
	},
	a.prototype.Initialize = function (t, e, i, o) {
		this.bodyA = t,
		this.bodyB = e,
		this.localAnchorA.SetV(this.bodyA.GetLocalPoint(i)),
		this.localAnchorB.SetV(this.bodyB.GetLocalPoint(o));
		var s = o.x - i.x,
		n = o.y - i.y;
		this.length = Math.sqrt(s * s + n * n),
		this.frequencyHz = 0,
		this.dampingRatio = 0
	},
	Box2D.inherit(h, Box2D.Dynamics.Joints.b2Joint),
	h.prototype.__super = Box2D.Dynamics.Joints.b2Joint.prototype,
	h.b2FrictionJoint = function () {
		Box2D.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
		this.m_localAnchorA = new s,
		this.m_localAnchorB = new s,
		this.m_linearMass = new e,
		this.m_linearImpulse = new s
	},
	h.prototype.GetAnchorA = function () {
		return this.m_bodyA.GetWorldPoint(this.m_localAnchorA)
	},
	h.prototype.GetAnchorB = function () {
		return this.m_bodyB.GetWorldPoint(this.m_localAnchorB)
	},
	h.prototype.GetReactionForce = function (t) {
		return t === void 0 && (t = 0),
		new s(t * this.m_linearImpulse.x, t * this.m_linearImpulse.y)
	},
	h.prototype.GetReactionTorque = function (t) {
		return t === void 0 && (t = 0),
		t * this.m_angularImpulse
	},
	h.prototype.SetMaxForce = function (t) {
		t === void 0 && (t = 0),
		this.m_maxForce = t
	},
	h.prototype.GetMaxForce = function () {
		return this.m_maxForce
	},
	h.prototype.SetMaxTorque = function (t) {
		t === void 0 && (t = 0),
		this.m_maxTorque = t
	},
	h.prototype.GetMaxTorque = function () {
		return this.m_maxTorque
	},
	h.prototype.b2FrictionJoint = function (t) {
		this.__super.b2Joint.call(this, t),
		this.m_localAnchorA.SetV(t.localAnchorA),
		this.m_localAnchorB.SetV(t.localAnchorB),
		this.m_linearMass.SetZero(),
		this.m_angularMass = 0,
		this.m_linearImpulse.SetZero(),
		this.m_angularImpulse = 0,
		this.m_maxForce = t.maxForce,
		this.m_maxTorque = t.maxTorque
	},
	h.prototype.InitVelocityConstraints = function (t) {
		var i,
		o = 0,
		s = this.m_bodyA,
		n = this.m_bodyB;
		i = s.m_xf.R;
		var r = this.m_localAnchorA.x - s.m_sweep.localCenter.x,
		a = this.m_localAnchorA.y - s.m_sweep.localCenter.y;
		o = i.col1.x * r + i.col2.x * a,
		a = i.col1.y * r + i.col2.y * a,
		r = o,
		i = n.m_xf.R;
		var h = this.m_localAnchorB.x - n.m_sweep.localCenter.x,
		l = this.m_localAnchorB.y - n.m_sweep.localCenter.y;
		o = i.col1.x * h + i.col2.x * l,
		l = i.col1.y * h + i.col2.y * l,
		h = o;
		var c = s.m_invMass,
		m = n.m_invMass,
		_ = s.m_invI,
		u = n.m_invI,
		p = new e;
		if (p.col1.x = c + m, p.col2.x = 0, p.col1.y = 0, p.col2.y = c + m, p.col1.x += _ * a * a, p.col2.x += -_ * r * a, p.col1.y += -_ * r * a, p.col2.y += _ * r * r, p.col1.x += u * l * l, p.col2.x += -u * h * l, p.col1.y += -u * h * l, p.col2.y += u * h * h, p.GetInverse(this.m_linearMass), this.m_angularMass = _ + u, this.m_angularMass > 0 && (this.m_angularMass = 1 / this.m_angularMass), t.warmStarting) {
			this.m_linearImpulse.x *= t.dtRatio,
			this.m_linearImpulse.y *= t.dtRatio,
			this.m_angularImpulse *= t.dtRatio;
			var y = this.m_linearImpulse;
			s.m_linearVelocity.x -= c * y.x,
			s.m_linearVelocity.y -= c * y.y,
			s.m_angularVelocity -= _ * (r * y.y - a * y.x + this.m_angularImpulse),
			n.m_linearVelocity.x += m * y.x,
			n.m_linearVelocity.y += m * y.y,
			n.m_angularVelocity += u * (h * y.y - l * y.x + this.m_angularImpulse)
		} else
			this.m_linearImpulse.SetZero(), this.m_angularImpulse = 0
	},
	h.prototype.SolveVelocityConstraints = function (t) {
		var e,
		i = 0,
		n = this.m_bodyA,
		r = this.m_bodyB,
		a = n.m_linearVelocity,
		h = n.m_angularVelocity,
		l = r.m_linearVelocity,
		c = r.m_angularVelocity,
		m = n.m_invMass,
		_ = r.m_invMass,
		u = n.m_invI,
		p = r.m_invI;
		e = n.m_xf.R;
		var y = this.m_localAnchorA.x - n.m_sweep.localCenter.x,
		d = this.m_localAnchorA.y - n.m_sweep.localCenter.y;
		i = e.col1.x * y + e.col2.x * d,
		d = e.col1.y * y + e.col2.y * d,
		y = i,
		e = r.m_xf.R;
		var x = this.m_localAnchorB.x - r.m_sweep.localCenter.x,
		f = this.m_localAnchorB.y - r.m_sweep.localCenter.y;
		i = e.col1.x * x + e.col2.x * f,
		f = e.col1.y * x + e.col2.y * f,
		x = i;
		var g = 0,
		v = c - h,
		b = -this.m_angularMass * v,
		w = this.m_angularImpulse;
		g = t.dt * this.m_maxTorque,
		this.m_angularImpulse = o.Clamp(this.m_angularImpulse + b, -g, g),
		b = this.m_angularImpulse - w,
		h -= u * b,
		c += p * b;
		var C = l.x - c * f - a.x + h * d,
		D = l.y + c * x - a.y - h * y,
		B = o.MulMV(this.m_linearMass, new s(-C, -D)),
		S = this.m_linearImpulse.Copy();
		this.m_linearImpulse.Add(B),
		g = t.dt * this.m_maxForce,
		this.m_linearImpulse.LengthSquared() > g * g && (this.m_linearImpulse.Normalize(), this.m_linearImpulse.Multiply(g)),
		B = o.SubtractVV(this.m_linearImpulse, S),
		a.x -= m * B.x,
		a.y -= m * B.y,
		h -= u * (y * B.y - d * B.x),
		l.x += _ * B.x,
		l.y += _ * B.y,
		c += p * (x * B.y - f * B.x),
		n.m_angularVelocity = h,
		r.m_angularVelocity = c
	},
	h.prototype.SolvePositionConstraints = function (t) {
		return t === void 0 && (t = 0),
		!0
	},
	Box2D.inherit(l, Box2D.Dynamics.Joints.b2JointDef),
	l.prototype.__super = Box2D.Dynamics.Joints.b2JointDef.prototype,
	l.b2FrictionJointDef = function () {
		Box2D.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments),
		this.localAnchorA = new s,
		this.localAnchorB = new s
	},
	l.prototype.b2FrictionJointDef = function () {
		this.__super.b2JointDef.call(this),
		this.type = u.e_frictionJoint,
		this.maxForce = 0,
		this.maxTorque = 0
	},
	l.prototype.Initialize = function (t, e, i) {
		this.bodyA = t,
		this.bodyB = e,
		this.localAnchorA.SetV(this.bodyA.GetLocalPoint(i)),
		this.localAnchorB.SetV(this.bodyB.GetLocalPoint(i))
	},
	Box2D.inherit(c, Box2D.Dynamics.Joints.b2Joint),
	c.prototype.__super = Box2D.Dynamics.Joints.b2Joint.prototype,
	c.b2GearJoint = function () {
		Box2D.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
		this.m_groundAnchor1 = new s,
		this.m_groundAnchor2 = new s,
		this.m_localAnchor1 = new s,
		this.m_localAnchor2 = new s,
		this.m_J = new _
	},
	c.prototype.GetAnchorA = function () {
		return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
	},
	c.prototype.GetAnchorB = function () {
		return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
	},
	c.prototype.GetReactionForce = function (t) {
		return t === void 0 && (t = 0),
		new s(t * this.m_impulse * this.m_J.linearB.x, t * this.m_impulse * this.m_J.linearB.y)
	},
	c.prototype.GetReactionTorque = function (t) {
		t === void 0 && (t = 0);
		var e = this.m_bodyB.m_xf.R,
		i = this.m_localAnchor1.x - this.m_bodyB.m_sweep.localCenter.x,
		o = this.m_localAnchor1.y - this.m_bodyB.m_sweep.localCenter.y,
		s = e.col1.x * i + e.col2.x * o;
		o = e.col1.y * i + e.col2.y * o,
		i = s;
		var n = this.m_impulse * this.m_J.linearB.x,
		r = this.m_impulse * this.m_J.linearB.y;
		return t * (this.m_impulse * this.m_J.angularB - i * r + o * n)
	},
	c.prototype.GetRatio = function () {
		return this.m_ratio
	},
	c.prototype.SetRatio = function (t) {
		t === void 0 && (t = 0),
		this.m_ratio = t
	},
	c.prototype.b2GearJoint = function (t) {
		this.__super.b2Joint.call(this, t);
		var e = parseInt(t.joint1.m_type),
		i = parseInt(t.joint2.m_type);
		this.m_revolute1 = null,
		this.m_prismatic1 = null,
		this.m_revolute2 = null,
		this.m_prismatic2 = null;
		var o = 0,
		s = 0;
		this.m_ground1 = t.joint1.GetBodyA(),
		this.m_bodyA = t.joint1.GetBodyB(),
		e == u.e_revoluteJoint ? (this.m_revolute1 = t.joint1 instanceof D ? t.joint1 : null, this.m_groundAnchor1.SetV(this.m_revolute1.m_localAnchor1), this.m_localAnchor1.SetV(this.m_revolute1.m_localAnchor2), o = this.m_revolute1.GetJointAngle()) : (this.m_prismatic1 = t.joint1 instanceof v ? t.joint1 : null, this.m_groundAnchor1.SetV(this.m_prismatic1.m_localAnchor1), this.m_localAnchor1.SetV(this.m_prismatic1.m_localAnchor2), o = this.m_prismatic1.GetJointTranslation()),
		this.m_ground2 = t.joint2.GetBodyA(),
		this.m_bodyB = t.joint2.GetBodyB(),
		i == u.e_revoluteJoint ? (this.m_revolute2 = t.joint2 instanceof D ? t.joint2 : null, this.m_groundAnchor2.SetV(this.m_revolute2.m_localAnchor1), this.m_localAnchor2.SetV(this.m_revolute2.m_localAnchor2), s = this.m_revolute2.GetJointAngle()) : (this.m_prismatic2 = t.joint2 instanceof v ? t.joint2 : null, this.m_groundAnchor2.SetV(this.m_prismatic2.m_localAnchor1), this.m_localAnchor2.SetV(this.m_prismatic2.m_localAnchor2), s = this.m_prismatic2.GetJointTranslation()),
		this.m_ratio = t.ratio,
		this.m_constant = o + this.m_ratio * s,
		this.m_impulse = 0
	},
	c.prototype.InitVelocityConstraints = function (t) {
		var e,
		i,
		o = this.m_ground1,
		s = this.m_ground2,
		n = this.m_bodyA,
		r = this.m_bodyB,
		a = 0,
		h = 0,
		l = 0,
		c = 0,
		m = 0,
		_ = 0,
		u = 0;
		this.m_J.SetZero(),
		this.m_revolute1 ? (this.m_J.angularA = -1, u += n.m_invI) : (e = o.m_xf.R, i = this.m_prismatic1.m_localXAxis1, a = e.col1.x * i.x + e.col2.x * i.y, h = e.col1.y * i.x + e.col2.y * i.y, e = n.m_xf.R, l = this.m_localAnchor1.x - n.m_sweep.localCenter.x, c = this.m_localAnchor1.y - n.m_sweep.localCenter.y, _ = e.col1.x * l + e.col2.x * c, c = e.col1.y * l + e.col2.y * c, l = _, m = l * h - c * a, this.m_J.linearA.Set(-a, -h), this.m_J.angularA = -m, u += n.m_invMass + n.m_invI * m * m),
		this.m_revolute2 ? (this.m_J.angularB = -this.m_ratio, u += this.m_ratio * this.m_ratio * r.m_invI) : (e = s.m_xf.R, i = this.m_prismatic2.m_localXAxis1, a = e.col1.x * i.x + e.col2.x * i.y, h = e.col1.y * i.x + e.col2.y * i.y, e = r.m_xf.R, l = this.m_localAnchor2.x - r.m_sweep.localCenter.x, c = this.m_localAnchor2.y - r.m_sweep.localCenter.y, _ = e.col1.x * l + e.col2.x * c, c = e.col1.y * l + e.col2.y * c, l = _, m = l * h - c * a, this.m_J.linearB.Set(-this.m_ratio * a, -this.m_ratio * h), this.m_J.angularB = -this.m_ratio * m, u += this.m_ratio * this.m_ratio * (r.m_invMass + r.m_invI * m * m)),
		this.m_mass = u > 0 ? 1 / u : 0,
		t.warmStarting ? (n.m_linearVelocity.x += n.m_invMass * this.m_impulse * this.m_J.linearA.x, n.m_linearVelocity.y += n.m_invMass * this.m_impulse * this.m_J.linearA.y, n.m_angularVelocity += n.m_invI * this.m_impulse * this.m_J.angularA, r.m_linearVelocity.x += r.m_invMass * this.m_impulse * this.m_J.linearB.x, r.m_linearVelocity.y += r.m_invMass * this.m_impulse * this.m_J.linearB.y, r.m_angularVelocity += r.m_invI * this.m_impulse * this.m_J.angularB) : this.m_impulse = 0
	},
	c.prototype.SolveVelocityConstraints = function () {
		var t = this.m_bodyA,
		e = this.m_bodyB,
		i = this.m_J.Compute(t.m_linearVelocity, t.m_angularVelocity, e.m_linearVelocity, e.m_angularVelocity),
		o = -this.m_mass * i;
		this.m_impulse += o,
		t.m_linearVelocity.x += t.m_invMass * o * this.m_J.linearA.x,
		t.m_linearVelocity.y += t.m_invMass * o * this.m_J.linearA.y,
		t.m_angularVelocity += t.m_invI * o * this.m_J.angularA,
		e.m_linearVelocity.x += e.m_invMass * o * this.m_J.linearB.x,
		e.m_linearVelocity.y += e.m_invMass * o * this.m_J.linearB.y,
		e.m_angularVelocity += e.m_invI * o * this.m_J.angularB
	},
	c.prototype.SolvePositionConstraints = function (e) {
		e === void 0 && (e = 0);
		var i = 0,
		o = this.m_bodyA,
		s = this.m_bodyB,
		n = 0,
		r = 0;
		n = this.m_revolute1 ? this.m_revolute1.GetJointAngle() : this.m_prismatic1.GetJointTranslation(),
		r = this.m_revolute2 ? this.m_revolute2.GetJointAngle() : this.m_prismatic2.GetJointTranslation();
		var a = this.m_constant - (n + this.m_ratio * r),
		h = -this.m_mass * a;
		return o.m_sweep.c.x += o.m_invMass * h * this.m_J.linearA.x,
		o.m_sweep.c.y += o.m_invMass * h * this.m_J.linearA.y,
		o.m_sweep.a += o.m_invI * h * this.m_J.angularA,
		s.m_sweep.c.x += s.m_invMass * h * this.m_J.linearB.x,
		s.m_sweep.c.y += s.m_invMass * h * this.m_J.linearB.y,
		s.m_sweep.a += s.m_invI * h * this.m_J.angularB,
		o.SynchronizeTransform(),
		s.SynchronizeTransform(),
		t.b2_linearSlop > i
	},
	Box2D.inherit(m, Box2D.Dynamics.Joints.b2JointDef),
	m.prototype.__super = Box2D.Dynamics.Joints.b2JointDef.prototype,
	m.b2GearJointDef = function () {
		Box2D.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments)
	},
	m.prototype.b2GearJointDef = function () {
		this.__super.b2JointDef.call(this),
		this.type = u.e_gearJoint,
		this.joint1 = null,
		this.joint2 = null,
		this.ratio = 1
	},
	_.b2Jacobian = function () {
		this.linearA = new s,
		this.linearB = new s
	},
	_.prototype.SetZero = function () {
		this.linearA.SetZero(),
		this.angularA = 0,
		this.linearB.SetZero(),
		this.angularB = 0
	},
	_.prototype.Set = function (t, e, i, o) {
		e === void 0 && (e = 0),
		o === void 0 && (o = 0),
		this.linearA.SetV(t),
		this.angularA = e,
		this.linearB.SetV(i),
		this.angularB = o
	},
	_.prototype.Compute = function (t, e, i, o) {
		return e === void 0 && (e = 0),
		o === void 0 && (o = 0),
		this.linearA.x * t.x + this.linearA.y * t.y + this.angularA * e + (this.linearB.x * i.x + this.linearB.y * i.y) + this.angularB * o
	},
	u.b2Joint = function () {
		this.m_edgeA = new y,
		this.m_edgeB = new y,
		this.m_localCenterA = new s,
		this.m_localCenterB = new s
	},
	u.prototype.GetType = function () {
		return this.m_type
	},
	u.prototype.GetAnchorA = function () {
		return null
	},
	u.prototype.GetAnchorB = function () {
		return null
	},
	u.prototype.GetReactionForce = function (t) {
		return t === void 0 && (t = 0),
		null
	},
	u.prototype.GetReactionTorque = function (t) {
		return t === void 0 && (t = 0),
		0
	},
	u.prototype.GetBodyA = function () {
		return this.m_bodyA
	},
	u.prototype.GetBodyB = function () {
		return this.m_bodyB
	},
	u.prototype.GetNext = function () {
		return this.m_next
	},
	u.prototype.GetUserData = function () {
		return this.m_userData
	},
	u.prototype.SetUserData = function (t) {
		this.m_userData = t
	},
	u.prototype.IsActive = function () {
		return this.m_bodyA.IsActive() && this.m_bodyB.IsActive()
	},
	u.Create = function (t) {
		var e = null;
		switch (t.type) {
		case u.e_distanceJoint:
			e = new r(t instanceof a ? t : null);
			break;
		case u.e_mouseJoint:
			e = new f(t instanceof g ? t : null);
			break;
		case u.e_prismaticJoint:
			e = new v(t instanceof b ? t : null);
			break;
		case u.e_revoluteJoint:
			e = new D(t instanceof B ? t : null);
			break;
		case u.e_pulleyJoint:
			e = new w(t instanceof C ? t : null);
			break;
		case u.e_gearJoint:
			e = new c(t instanceof m ? t : null);
			break;
		case u.e_lineJoint:
			e = new d(t instanceof x ? t : null);
			break;
		case u.e_weldJoint:
			e = new S(t instanceof I ? t : null);
			break;
		case u.e_frictionJoint:
			e = new h(t instanceof l ? t : null);
			break;
		default:
		}
		return e
	},
	u.Destroy = function () {},
	u.prototype.b2Joint = function (e) {
		t.b2Assert(e.bodyA != e.bodyB),
		this.m_type = e.type,
		this.m_prev = null,
		this.m_next = null,
		this.m_bodyA = e.bodyA,
		this.m_bodyB = e.bodyB,
		this.m_collideConnected = e.collideConnected,
		this.m_islandFlag = !1,
		this.m_userData = e.userData
	},
	u.prototype.InitVelocityConstraints = function () {},
	u.prototype.SolveVelocityConstraints = function () {},
	u.prototype.FinalizeVelocityConstraints = function () {},
	u.prototype.SolvePositionConstraints = function (t) {
		return t === void 0 && (t = 0),
		!1
	},
	Box2D.postDefs.push(function () {
		Box2D.Dynamics.Joints.b2Joint.e_unknownJoint = 0,
		Box2D.Dynamics.Joints.b2Joint.e_revoluteJoint = 1,
		Box2D.Dynamics.Joints.b2Joint.e_prismaticJoint = 2,
		Box2D.Dynamics.Joints.b2Joint.e_distanceJoint = 3,
		Box2D.Dynamics.Joints.b2Joint.e_pulleyJoint = 4,
		Box2D.Dynamics.Joints.b2Joint.e_mouseJoint = 5,
		Box2D.Dynamics.Joints.b2Joint.e_gearJoint = 6,
		Box2D.Dynamics.Joints.b2Joint.e_lineJoint = 7,
		Box2D.Dynamics.Joints.b2Joint.e_weldJoint = 8,
		Box2D.Dynamics.Joints.b2Joint.e_frictionJoint = 9,
		Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit = 0,
		Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit = 1,
		Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit = 2,
		Box2D.Dynamics.Joints.b2Joint.e_equalLimits = 3
	}),
	p.b2JointDef = function () {},
	p.prototype.b2JointDef = function () {
		this.type = u.e_unknownJoint,
		this.userData = null,
		this.bodyA = null,
		this.bodyB = null,
		this.collideConnected = !1
	},
	y.b2JointEdge = function () {},
	Box2D.inherit(d, Box2D.Dynamics.Joints.b2Joint),
	d.prototype.__super = Box2D.Dynamics.Joints.b2Joint.prototype,
	d.b2LineJoint = function () {
		Box2D.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
		this.m_localAnchor1 = new s,
		this.m_localAnchor2 = new s,
		this.m_localXAxis1 = new s,
		this.m_localYAxis1 = new s,
		this.m_axis = new s,
		this.m_perp = new s,
		this.m_K = new e,
		this.m_impulse = new s
	},
	d.prototype.GetAnchorA = function () {
		return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
	},
	d.prototype.GetAnchorB = function () {
		return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
	},
	d.prototype.GetReactionForce = function (t) {
		return t === void 0 && (t = 0),
		new s(t * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x), t * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y))
	},
	d.prototype.GetReactionTorque = function (t) {
		return t === void 0 && (t = 0),
		t * this.m_impulse.y
	},
	d.prototype.GetJointTranslation = function () {
		var t = this.m_bodyA,
		e = this.m_bodyB,
		i = t.GetWorldPoint(this.m_localAnchor1),
		o = e.GetWorldPoint(this.m_localAnchor2),
		s = o.x - i.x,
		n = o.y - i.y,
		r = t.GetWorldVector(this.m_localXAxis1),
		a = r.x * s + r.y * n;
		return a
	},
	d.prototype.GetJointSpeed = function () {
		var t,
		e = this.m_bodyA,
		i = this.m_bodyB;
		t = e.m_xf.R;
		var o = this.m_localAnchor1.x - e.m_sweep.localCenter.x,
		s = this.m_localAnchor1.y - e.m_sweep.localCenter.y,
		n = t.col1.x * o + t.col2.x * s;
		s = t.col1.y * o + t.col2.y * s,
		o = n,
		t = i.m_xf.R;
		var r = this.m_localAnchor2.x - i.m_sweep.localCenter.x,
		a = this.m_localAnchor2.y - i.m_sweep.localCenter.y;
		n = t.col1.x * r + t.col2.x * a,
		a = t.col1.y * r + t.col2.y * a,
		r = n;
		var h = e.m_sweep.c.x + o,
		l = e.m_sweep.c.y + s,
		c = i.m_sweep.c.x + r,
		m = i.m_sweep.c.y + a,
		_ = c - h,
		u = m - l,
		p = e.GetWorldVector(this.m_localXAxis1),
		y = e.m_linearVelocity,
		d = i.m_linearVelocity,
		x = e.m_angularVelocity,
		f = i.m_angularVelocity,
		g = _ * -x * p.y + u * x * p.x + (p.x * (d.x + -f * a - y.x - -x * s) + p.y * (d.y + f * r - y.y - x * o));
		return g
	},
	d.prototype.IsLimitEnabled = function () {
		return this.m_enableLimit
	},
	d.prototype.EnableLimit = function (t) {
		this.m_bodyA.SetAwake(!0),
		this.m_bodyB.SetAwake(!0),
		this.m_enableLimit = t
	},
	d.prototype.GetLowerLimit = function () {
		return this.m_lowerTranslation
	},
	d.prototype.GetUpperLimit = function () {
		return this.m_upperTranslation
	},
	d.prototype.SetLimits = function (t, e) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		this.m_bodyA.SetAwake(!0),
		this.m_bodyB.SetAwake(!0),
		this.m_lowerTranslation = t,
		this.m_upperTranslation = e
	},
	d.prototype.IsMotorEnabled = function () {
		return this.m_enableMotor
	},
	d.prototype.EnableMotor = function (t) {
		this.m_bodyA.SetAwake(!0),
		this.m_bodyB.SetAwake(!0),
		this.m_enableMotor = t
	},
	d.prototype.SetMotorSpeed = function (t) {
		t === void 0 && (t = 0),
		this.m_bodyA.SetAwake(!0),
		this.m_bodyB.SetAwake(!0),
		this.m_motorSpeed = t
	},
	d.prototype.GetMotorSpeed = function () {
		return this.m_motorSpeed
	},
	d.prototype.SetMaxMotorForce = function (t) {
		t === void 0 && (t = 0),
		this.m_bodyA.SetAwake(!0),
		this.m_bodyB.SetAwake(!0),
		this.m_maxMotorForce = t
	},
	d.prototype.GetMaxMotorForce = function () {
		return this.m_maxMotorForce
	},
	d.prototype.GetMotorForce = function () {
		return this.m_motorImpulse
	},
	d.prototype.b2LineJoint = function (t) {
		this.__super.b2Joint.call(this, t),
		this.m_localAnchor1.SetV(t.localAnchorA),
		this.m_localAnchor2.SetV(t.localAnchorB),
		this.m_localXAxis1.SetV(t.localAxisA),
		this.m_localYAxis1.x = -this.m_localXAxis1.y,
		this.m_localYAxis1.y = this.m_localXAxis1.x,
		this.m_impulse.SetZero(),
		this.m_motorMass = 0,
		this.m_motorImpulse = 0,
		this.m_lowerTranslation = t.lowerTranslation,
		this.m_upperTranslation = t.upperTranslation,
		this.m_maxMotorForce = t.maxMotorForce,
		this.m_motorSpeed = t.motorSpeed,
		this.m_enableLimit = t.enableLimit,
		this.m_enableMotor = t.enableMotor,
		this.m_limitState = u.e_inactiveLimit,
		this.m_axis.SetZero(),
		this.m_perp.SetZero()
	},
	d.prototype.InitVelocityConstraints = function (e) {
		var i,
		s = this.m_bodyA,
		n = this.m_bodyB,
		r = 0;
		this.m_localCenterA.SetV(s.GetLocalCenter()),
		this.m_localCenterB.SetV(n.GetLocalCenter());
		var a = s.GetTransform();
		n.GetTransform(),
		i = s.m_xf.R;
		var h = this.m_localAnchor1.x - this.m_localCenterA.x,
		l = this.m_localAnchor1.y - this.m_localCenterA.y;
		r = i.col1.x * h + i.col2.x * l,
		l = i.col1.y * h + i.col2.y * l,
		h = r,
		i = n.m_xf.R;
		var c = this.m_localAnchor2.x - this.m_localCenterB.x,
		m = this.m_localAnchor2.y - this.m_localCenterB.y;
		r = i.col1.x * c + i.col2.x * m,
		m = i.col1.y * c + i.col2.y * m,
		c = r;
		var _ = n.m_sweep.c.x + c - s.m_sweep.c.x - h,
		p = n.m_sweep.c.y + m - s.m_sweep.c.y - l;
		this.m_invMassA = s.m_invMass,
		this.m_invMassB = n.m_invMass,
		this.m_invIA = s.m_invI,
		this.m_invIB = n.m_invI,
		this.m_axis.SetV(o.MulMV(a.R, this.m_localXAxis1)),
		this.m_a1 = (_ + h) * this.m_axis.y - (p + l) * this.m_axis.x,
		this.m_a2 = c * this.m_axis.y - m * this.m_axis.x,
		this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2,
		this.m_motorMass = this.m_motorMass > Number.MIN_VALUE ? 1 / this.m_motorMass : 0,
		this.m_perp.SetV(o.MulMV(a.R, this.m_localYAxis1)),
		this.m_s1 = (_ + h) * this.m_perp.y - (p + l) * this.m_perp.x,
		this.m_s2 = c * this.m_perp.y - m * this.m_perp.x;
		var y = this.m_invMassA,
		d = this.m_invMassB,
		x = this.m_invIA,
		f = this.m_invIB;
		if (this.m_K.col1.x = y + d + x * this.m_s1 * this.m_s1 + f * this.m_s2 * this.m_s2, this.m_K.col1.y = x * this.m_s1 * this.m_a1 + f * this.m_s2 * this.m_a2, this.m_K.col2.x = this.m_K.col1.y, this.m_K.col2.y = y + d + x * this.m_a1 * this.m_a1 + f * this.m_a2 * this.m_a2, this.m_enableLimit) {
			var g = this.m_axis.x * _ + this.m_axis.y * p;
			2 * t.b2_linearSlop > o.Abs(this.m_upperTranslation - this.m_lowerTranslation) ? this.m_limitState = u.e_equalLimits : g > this.m_lowerTranslation ? this.m_upperTranslation > g ? (this.m_limitState = u.e_inactiveLimit, this.m_impulse.y = 0) : this.m_limitState != u.e_atUpperLimit && (this.m_limitState = u.e_atUpperLimit, this.m_impulse.y = 0) : this.m_limitState != u.e_atLowerLimit && (this.m_limitState = u.e_atLowerLimit, this.m_impulse.y = 0)
		} else
			this.m_limitState = u.e_inactiveLimit;
		if (this.m_enableMotor == 0 && (this.m_motorImpulse = 0), e.warmStarting) {
			this.m_impulse.x *= e.dtRatio,
			this.m_impulse.y *= e.dtRatio,
			this.m_motorImpulse *= e.dtRatio;
			var v = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x,
			b = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y,
			w = this.m_impulse.x * this.m_s1 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a1,
			C = this.m_impulse.x * this.m_s2 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a2;
			s.m_linearVelocity.x -= this.m_invMassA * v,
			s.m_linearVelocity.y -= this.m_invMassA * b,
			s.m_angularVelocity -= this.m_invIA * w,
			n.m_linearVelocity.x += this.m_invMassB * v,
			n.m_linearVelocity.y += this.m_invMassB * b,
			n.m_angularVelocity += this.m_invIB * C
		} else
			this.m_impulse.SetZero(), this.m_motorImpulse = 0
	},
	d.prototype.SolveVelocityConstraints = function (t) {
		var e = this.m_bodyA,
		i = this.m_bodyB,
		n = e.m_linearVelocity,
		r = e.m_angularVelocity,
		a = i.m_linearVelocity,
		h = i.m_angularVelocity,
		l = 0,
		c = 0,
		m = 0,
		_ = 0;
		if (this.m_enableMotor && this.m_limitState != u.e_equalLimits) {
			var p = this.m_axis.x * (a.x - n.x) + this.m_axis.y * (a.y - n.y) + this.m_a2 * h - this.m_a1 * r,
			y = this.m_motorMass * (this.m_motorSpeed - p),
			d = this.m_motorImpulse,
			x = t.dt * this.m_maxMotorForce;
			this.m_motorImpulse = o.Clamp(this.m_motorImpulse + y, -x, x),
			y = this.m_motorImpulse - d,
			l = y * this.m_axis.x,
			c = y * this.m_axis.y,
			m = y * this.m_a1,
			_ = y * this.m_a2,
			n.x -= this.m_invMassA * l,
			n.y -= this.m_invMassA * c,
			r -= this.m_invIA * m,
			a.x += this.m_invMassB * l,
			a.y += this.m_invMassB * c,
			h += this.m_invIB * _
		}
		var f = this.m_perp.x * (a.x - n.x) + this.m_perp.y * (a.y - n.y) + this.m_s2 * h - this.m_s1 * r;
		if (this.m_enableLimit && this.m_limitState != u.e_inactiveLimit) {
			var g = this.m_axis.x * (a.x - n.x) + this.m_axis.y * (a.y - n.y) + this.m_a2 * h - this.m_a1 * r,
			v = this.m_impulse.Copy(),
			b = this.m_K.Solve(new s, -f, -g);
			this.m_impulse.Add(b),
			this.m_limitState == u.e_atLowerLimit ? this.m_impulse.y = o.Max(this.m_impulse.y, 0) : this.m_limitState == u.e_atUpperLimit && (this.m_impulse.y = o.Min(this.m_impulse.y, 0));
			var w = -f - (this.m_impulse.y - v.y) * this.m_K.col2.x,
			C = 0;
			C = this.m_K.col1.x != 0 ? w / this.m_K.col1.x + v.x : v.x,
			this.m_impulse.x = C,
			b.x = this.m_impulse.x - v.x,
			b.y = this.m_impulse.y - v.y,
			l = b.x * this.m_perp.x + b.y * this.m_axis.x,
			c = b.x * this.m_perp.y + b.y * this.m_axis.y,
			m = b.x * this.m_s1 + b.y * this.m_a1,
			_ = b.x * this.m_s2 + b.y * this.m_a2,
			n.x -= this.m_invMassA * l,
			n.y -= this.m_invMassA * c,
			r -= this.m_invIA * m,
			a.x += this.m_invMassB * l,
			a.y += this.m_invMassB * c,
			h += this.m_invIB * _
		} else {
			var D = 0;
			D = this.m_K.col1.x != 0 ? -f / this.m_K.col1.x : 0,
			this.m_impulse.x += D,
			l = D * this.m_perp.x,
			c = D * this.m_perp.y,
			m = D * this.m_s1,
			_ = D * this.m_s2,
			n.x -= this.m_invMassA * l,
			n.y -= this.m_invMassA * c,
			r -= this.m_invIA * m,
			a.x += this.m_invMassB * l,
			a.y += this.m_invMassB * c,
			h += this.m_invIB * _
		}
		e.m_linearVelocity.SetV(n),
		e.m_angularVelocity = r,
		i.m_linearVelocity.SetV(a),
		i.m_angularVelocity = h
	},
	d.prototype.SolvePositionConstraints = function (i) {
		i === void 0 && (i = 0);
		var n,
		r = this.m_bodyA,
		a = this.m_bodyB,
		h = r.m_sweep.c,
		l = r.m_sweep.a,
		c = a.m_sweep.c,
		m = a.m_sweep.a,
		_ = 0,
		u = 0,
		p = 0,
		y = 0,
		d = 0,
		x = 0,
		f = 0,
		g = !1,
		v = 0,
		b = e.FromAngle(l),
		w = e.FromAngle(m);
		n = b;
		var C = this.m_localAnchor1.x - this.m_localCenterA.x,
		D = this.m_localAnchor1.y - this.m_localCenterA.y;
		_ = n.col1.x * C + n.col2.x * D,
		D = n.col1.y * C + n.col2.y * D,
		C = _,
		n = w;
		var B = this.m_localAnchor2.x - this.m_localCenterB.x,
		S = this.m_localAnchor2.y - this.m_localCenterB.y;
		_ = n.col1.x * B + n.col2.x * S,
		S = n.col1.y * B + n.col2.y * S,
		B = _;
		var I = c.x + B - h.x - C,
		A = c.y + S - h.y - D;
		if (this.m_enableLimit) {
			this.m_axis = o.MulMV(b, this.m_localXAxis1),
			this.m_a1 = (I + C) * this.m_axis.y - (A + D) * this.m_axis.x,
			this.m_a2 = B * this.m_axis.y - S * this.m_axis.x;
			var M = this.m_axis.x * I + this.m_axis.y * A;
			2 * t.b2_linearSlop > o.Abs(this.m_upperTranslation - this.m_lowerTranslation) ? (v = o.Clamp(M, -t.b2_maxLinearCorrection, t.b2_maxLinearCorrection), x = o.Abs(M), g = !0) : M > this.m_lowerTranslation ? this.m_upperTranslation > M || (v = o.Clamp(M - this.m_upperTranslation + t.b2_linearSlop, 0, t.b2_maxLinearCorrection), x = M - this.m_upperTranslation, g = !0) : (v = o.Clamp(M - this.m_lowerTranslation + t.b2_linearSlop, -t.b2_maxLinearCorrection, 0), x = this.m_lowerTranslation - M, g = !0)
		}
		this.m_perp = o.MulMV(b, this.m_localYAxis1),
		this.m_s1 = (I + C) * this.m_perp.y - (A + D) * this.m_perp.x,
		this.m_s2 = B * this.m_perp.y - S * this.m_perp.x;
		var T = new s,
		V = this.m_perp.x * I + this.m_perp.y * A;
		if (x = o.Max(x, o.Abs(V)), f = 0, g)
			u = this.m_invMassA, p = this.m_invMassB, y = this.m_invIA, d = this.m_invIB, this.m_K.col1.x = u + p + y * this.m_s1 * this.m_s1 + d * this.m_s2 * this.m_s2, this.m_K.col1.y = y * this.m_s1 * this.m_a1 + d * this.m_s2 * this.m_a2, this.m_K.col2.x = this.m_K.col1.y, this.m_K.col2.y = u + p + y * this.m_a1 * this.m_a1 + d * this.m_a2 * this.m_a2, this.m_K.Solve(T, -V, -v);
		else {
			u = this.m_invMassA,
			p = this.m_invMassB,
			y = this.m_invIA,
			d = this.m_invIB;
			var P = u + p + y * this.m_s1 * this.m_s1 + d * this.m_s2 * this.m_s2,
			R = 0;
			R = P != 0 ? -V / P : 0,
			T.x = R,
			T.y = 0
		}
		var k = T.x * this.m_perp.x + T.y * this.m_axis.x,
		L = T.x * this.m_perp.y + T.y * this.m_axis.y,
		F = T.x * this.m_s1 + T.y * this.m_a1,
		G = T.x * this.m_s2 + T.y * this.m_a2;
		return h.x -= this.m_invMassA * k,
		h.y -= this.m_invMassA * L,
		l -= this.m_invIA * F,
		c.x += this.m_invMassB * k,
		c.y += this.m_invMassB * L,
		m += this.m_invIB * G,
		r.m_sweep.a = l,
		a.m_sweep.a = m,
		r.SynchronizeTransform(),
		a.SynchronizeTransform(),
		t.b2_linearSlop >= x && t.b2_angularSlop >= f
	},
	Box2D.inherit(x, Box2D.Dynamics.Joints.b2JointDef),
	x.prototype.__super = Box2D.Dynamics.Joints.b2JointDef.prototype,
	x.b2LineJointDef = function () {
		Box2D.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments),
		this.localAnchorA = new s,
		this.localAnchorB = new s,
		this.localAxisA = new s
	},
	x.prototype.b2LineJointDef = function () {
		this.__super.b2JointDef.call(this),
		this.type = u.e_lineJoint,
		this.localAxisA.Set(1, 0),
		this.enableLimit = !1,
		this.lowerTranslation = 0,
		this.upperTranslation = 0,
		this.enableMotor = !1,
		this.maxMotorForce = 0,
		this.motorSpeed = 0
	},
	x.prototype.Initialize = function (t, e, i, o) {
		this.bodyA = t,
		this.bodyB = e,
		this.localAnchorA = this.bodyA.GetLocalPoint(i),
		this.localAnchorB = this.bodyB.GetLocalPoint(i),
		this.localAxisA = this.bodyA.GetLocalVector(o)
	},
	Box2D.inherit(f, Box2D.Dynamics.Joints.b2Joint),
	f.prototype.__super = Box2D.Dynamics.Joints.b2Joint.prototype,
	f.b2MouseJoint = function () {
		Box2D.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
		this.K = new e,
		this.K1 = new e,
		this.K2 = new e,
		this.m_localAnchor = new s,
		this.m_target = new s,
		this.m_impulse = new s,
		this.m_mass = new e,
		this.m_C = new s
	},
	f.prototype.GetAnchorA = function () {
		return this.m_target
	},
	f.prototype.GetAnchorB = function () {
		return this.m_bodyB.GetWorldPoint(this.m_localAnchor)
	},
	f.prototype.GetReactionForce = function (t) {
		return t === void 0 && (t = 0),
		new s(t * this.m_impulse.x, t * this.m_impulse.y)
	},
	f.prototype.GetReactionTorque = function (t) {
		return t === void 0 && (t = 0),
		0
	},
	f.prototype.GetTarget = function () {
		return this.m_target
	},
	f.prototype.SetTarget = function (t) {
		this.m_bodyB.IsAwake() == 0 && this.m_bodyB.SetAwake(!0),
		this.m_target = t
	},
	f.prototype.GetMaxForce = function () {
		return this.m_maxForce
	},
	f.prototype.SetMaxForce = function (t) {
		t === void 0 && (t = 0),
		this.m_maxForce = t
	},
	f.prototype.GetFrequency = function () {
		return this.m_frequencyHz
	},
	f.prototype.SetFrequency = function (t) {
		t === void 0 && (t = 0),
		this.m_frequencyHz = t
	},
	f.prototype.GetDampingRatio = function () {
		return this.m_dampingRatio
	},
	f.prototype.SetDampingRatio = function (t) {
		t === void 0 && (t = 0),
		this.m_dampingRatio = t
	},
	f.prototype.b2MouseJoint = function (t) {
		this.__super.b2Joint.call(this, t),
		this.m_target.SetV(t.target);
		var e = this.m_target.x - this.m_bodyB.m_xf.position.x,
		i = this.m_target.y - this.m_bodyB.m_xf.position.y,
		o = this.m_bodyB.m_xf.R;
		this.m_localAnchor.x = e * o.col1.x + i * o.col1.y,
		this.m_localAnchor.y = e * o.col2.x + i * o.col2.y,
		this.m_maxForce = t.maxForce,
		this.m_impulse.SetZero(),
		this.m_frequencyHz = t.frequencyHz,
		this.m_dampingRatio = t.dampingRatio,
		this.m_beta = 0,
		this.m_gamma = 0
	},
	f.prototype.InitVelocityConstraints = function (t) {
		var e = this.m_bodyB,
		i = e.GetMass(),
		o = 2 * Math.PI * this.m_frequencyHz,
		s = 2 * i * this.m_dampingRatio * o,
		n = i * o * o;
		this.m_gamma = t.dt * (s + t.dt * n),
		this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0,
		this.m_beta = t.dt * n * this.m_gamma;
		var r;
		r = e.m_xf.R;
		var a = this.m_localAnchor.x - e.m_sweep.localCenter.x,
		h = this.m_localAnchor.y - e.m_sweep.localCenter.y,
		l = r.col1.x * a + r.col2.x * h;
		h = r.col1.y * a + r.col2.y * h,
		a = l;
		var c = e.m_invMass,
		m = e.m_invI;
		this.K1.col1.x = c,
		this.K1.col2.x = 0,
		this.K1.col1.y = 0,
		this.K1.col2.y = c,
		this.K2.col1.x = m * h * h,
		this.K2.col2.x = -m * a * h,
		this.K2.col1.y = -m * a * h,
		this.K2.col2.y = m * a * a,
		this.K.SetM(this.K1),
		this.K.AddM(this.K2),
		this.K.col1.x += this.m_gamma,
		this.K.col2.y += this.m_gamma,
		this.K.GetInverse(this.m_mass),
		this.m_C.x = e.m_sweep.c.x + a - this.m_target.x,
		this.m_C.y = e.m_sweep.c.y + h - this.m_target.y,
		e.m_angularVelocity *= .98,
		this.m_impulse.x *= t.dtRatio,
		this.m_impulse.y *= t.dtRatio,
		e.m_linearVelocity.x += c * this.m_impulse.x,
		e.m_linearVelocity.y += c * this.m_impulse.y,
		e.m_angularVelocity += m * (a * this.m_impulse.y - h * this.m_impulse.x)
	},
	f.prototype.SolveVelocityConstraints = function (t) {
		var e,
		i = this.m_bodyB,
		o = 0,
		s = 0;
		e = i.m_xf.R;
		var n = this.m_localAnchor.x - i.m_sweep.localCenter.x,
		r = this.m_localAnchor.y - i.m_sweep.localCenter.y;
		o = e.col1.x * n + e.col2.x * r,
		r = e.col1.y * n + e.col2.y * r,
		n = o;
		var a = i.m_linearVelocity.x + -i.m_angularVelocity * r,
		h = i.m_linearVelocity.y + i.m_angularVelocity * n;
		e = this.m_mass,
		o = a + this.m_beta * this.m_C.x + this.m_gamma * this.m_impulse.x,
		s = h + this.m_beta * this.m_C.y + this.m_gamma * this.m_impulse.y;
		var l =  - (e.col1.x * o + e.col2.x * s),
		c =  - (e.col1.y * o + e.col2.y * s),
		m = this.m_impulse.x,
		_ = this.m_impulse.y;
		this.m_impulse.x += l,
		this.m_impulse.y += c;
		var u = t.dt * this.m_maxForce;
		this.m_impulse.LengthSquared() > u * u && this.m_impulse.Multiply(u / this.m_impulse.Length()),
		l = this.m_impulse.x - m,
		c = this.m_impulse.y - _,
		i.m_linearVelocity.x += i.m_invMass * l,
		i.m_linearVelocity.y += i.m_invMass * c,
		i.m_angularVelocity += i.m_invI * (n * c - r * l)
	},
	f.prototype.SolvePositionConstraints = function (t) {
		return t === void 0 && (t = 0),
		!0
	},
	Box2D.inherit(g, Box2D.Dynamics.Joints.b2JointDef),
	g.prototype.__super = Box2D.Dynamics.Joints.b2JointDef.prototype,
	g.b2MouseJointDef = function () {
		Box2D.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments),
		this.target = new s
	},
	g.prototype.b2MouseJointDef = function () {
		this.__super.b2JointDef.call(this),
		this.type = u.e_mouseJoint,
		this.maxForce = 0,
		this.frequencyHz = 5,
		this.dampingRatio = .7
	},
	Box2D.inherit(v, Box2D.Dynamics.Joints.b2Joint),
	v.prototype.__super = Box2D.Dynamics.Joints.b2Joint.prototype,
	v.b2PrismaticJoint = function () {
		Box2D.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
		this.m_localAnchor1 = new s,
		this.m_localAnchor2 = new s,
		this.m_localXAxis1 = new s,
		this.m_localYAxis1 = new s,
		this.m_axis = new s,
		this.m_perp = new s,
		this.m_K = new i,
		this.m_impulse = new n
	},
	v.prototype.GetAnchorA = function () {
		return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
	},
	v.prototype.GetAnchorB = function () {
		return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
	},
	v.prototype.GetReactionForce = function (t) {
		return t === void 0 && (t = 0),
		new s(t * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x), t * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y))
	},
	v.prototype.GetReactionTorque = function (t) {
		return t === void 0 && (t = 0),
		t * this.m_impulse.y
	},
	v.prototype.GetJointTranslation = function () {
		var t = this.m_bodyA,
		e = this.m_bodyB,
		i = t.GetWorldPoint(this.m_localAnchor1),
		o = e.GetWorldPoint(this.m_localAnchor2),
		s = o.x - i.x,
		n = o.y - i.y,
		r = t.GetWorldVector(this.m_localXAxis1),
		a = r.x * s + r.y * n;
		return a
	},
	v.prototype.GetJointSpeed = function () {
		var t,
		e = this.m_bodyA,
		i = this.m_bodyB;
		t = e.m_xf.R;
		var o = this.m_localAnchor1.x - e.m_sweep.localCenter.x,
		s = this.m_localAnchor1.y - e.m_sweep.localCenter.y,
		n = t.col1.x * o + t.col2.x * s;
		s = t.col1.y * o + t.col2.y * s,
		o = n,
		t = i.m_xf.R;
		var r = this.m_localAnchor2.x - i.m_sweep.localCenter.x,
		a = this.m_localAnchor2.y - i.m_sweep.localCenter.y;
		n = t.col1.x * r + t.col2.x * a,
		a = t.col1.y * r + t.col2.y * a,
		r = n;
		var h = e.m_sweep.c.x + o,
		l = e.m_sweep.c.y + s,
		c = i.m_sweep.c.x + r,
		m = i.m_sweep.c.y + a,
		_ = c - h,
		u = m - l,
		p = e.GetWorldVector(this.m_localXAxis1),
		y = e.m_linearVelocity,
		d = i.m_linearVelocity,
		x = e.m_angularVelocity,
		f = i.m_angularVelocity,
		g = _ * -x * p.y + u * x * p.x + (p.x * (d.x + -f * a - y.x - -x * s) + p.y * (d.y + f * r - y.y - x * o));
		return g
	},
	v.prototype.IsLimitEnabled = function () {
		return this.m_enableLimit
	},
	v.prototype.EnableLimit = function (t) {
		this.m_bodyA.SetAwake(!0),
		this.m_bodyB.SetAwake(!0),
		this.m_enableLimit = t
	},
	v.prototype.GetLowerLimit = function () {
		return this.m_lowerTranslation
	},
	v.prototype.GetUpperLimit = function () {
		return this.m_upperTranslation
	},
	v.prototype.SetLimits = function (t, e) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		this.m_bodyA.SetAwake(!0),
		this.m_bodyB.SetAwake(!0),
		this.m_lowerTranslation = t,
		this.m_upperTranslation = e
	},
	v.prototype.IsMotorEnabled = function () {
		return this.m_enableMotor
	},
	v.prototype.EnableMotor = function (t) {
		this.m_bodyA.SetAwake(!0),
		this.m_bodyB.SetAwake(!0),
		this.m_enableMotor = t
	},
	v.prototype.SetMotorSpeed = function (t) {
		t === void 0 && (t = 0),
		this.m_bodyA.SetAwake(!0),
		this.m_bodyB.SetAwake(!0),
		this.m_motorSpeed = t
	},
	v.prototype.GetMotorSpeed = function () {
		return this.m_motorSpeed
	},
	v.prototype.SetMaxMotorForce = function (t) {
		t === void 0 && (t = 0),
		this.m_bodyA.SetAwake(!0),
		this.m_bodyB.SetAwake(!0),
		this.m_maxMotorForce = t
	},
	v.prototype.GetMotorForce = function () {
		return this.m_motorImpulse
	},
	v.prototype.b2PrismaticJoint = function (t) {
		this.__super.b2Joint.call(this, t),
		this.m_localAnchor1.SetV(t.localAnchorA),
		this.m_localAnchor2.SetV(t.localAnchorB),
		this.m_localXAxis1.SetV(t.localAxisA),
		this.m_localYAxis1.x = -this.m_localXAxis1.y,
		this.m_localYAxis1.y = this.m_localXAxis1.x,
		this.m_refAngle = t.referenceAngle,
		this.m_impulse.SetZero(),
		this.m_motorMass = 0,
		this.m_motorImpulse = 0,
		this.m_lowerTranslation = t.lowerTranslation,
		this.m_upperTranslation = t.upperTranslation,
		this.m_maxMotorForce = t.maxMotorForce,
		this.m_motorSpeed = t.motorSpeed,
		this.m_enableLimit = t.enableLimit,
		this.m_enableMotor = t.enableMotor,
		this.m_limitState = u.e_inactiveLimit,
		this.m_axis.SetZero(),
		this.m_perp.SetZero()
	},
	v.prototype.InitVelocityConstraints = function (e) {
		var i,
		s = this.m_bodyA,
		n = this.m_bodyB,
		r = 0;
		this.m_localCenterA.SetV(s.GetLocalCenter()),
		this.m_localCenterB.SetV(n.GetLocalCenter());
		var a = s.GetTransform();
		n.GetTransform(),
		i = s.m_xf.R;
		var h = this.m_localAnchor1.x - this.m_localCenterA.x,
		l = this.m_localAnchor1.y - this.m_localCenterA.y;
		r = i.col1.x * h + i.col2.x * l,
		l = i.col1.y * h + i.col2.y * l,
		h = r,
		i = n.m_xf.R;
		var c = this.m_localAnchor2.x - this.m_localCenterB.x,
		m = this.m_localAnchor2.y - this.m_localCenterB.y;
		r = i.col1.x * c + i.col2.x * m,
		m = i.col1.y * c + i.col2.y * m,
		c = r;
		var _ = n.m_sweep.c.x + c - s.m_sweep.c.x - h,
		p = n.m_sweep.c.y + m - s.m_sweep.c.y - l;
		this.m_invMassA = s.m_invMass,
		this.m_invMassB = n.m_invMass,
		this.m_invIA = s.m_invI,
		this.m_invIB = n.m_invI,
		this.m_axis.SetV(o.MulMV(a.R, this.m_localXAxis1)),
		this.m_a1 = (_ + h) * this.m_axis.y - (p + l) * this.m_axis.x,
		this.m_a2 = c * this.m_axis.y - m * this.m_axis.x,
		this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2,
		this.m_motorMass > Number.MIN_VALUE && (this.m_motorMass = 1 / this.m_motorMass),
		this.m_perp.SetV(o.MulMV(a.R, this.m_localYAxis1)),
		this.m_s1 = (_ + h) * this.m_perp.y - (p + l) * this.m_perp.x,
		this.m_s2 = c * this.m_perp.y - m * this.m_perp.x;
		var y = this.m_invMassA,
		d = this.m_invMassB,
		x = this.m_invIA,
		f = this.m_invIB;
		if (this.m_K.col1.x = y + d + x * this.m_s1 * this.m_s1 + f * this.m_s2 * this.m_s2, this.m_K.col1.y = x * this.m_s1 + f * this.m_s2, this.m_K.col1.z = x * this.m_s1 * this.m_a1 + f * this.m_s2 * this.m_a2, this.m_K.col2.x = this.m_K.col1.y, this.m_K.col2.y = x + f, this.m_K.col2.z = x * this.m_a1 + f * this.m_a2, this.m_K.col3.x = this.m_K.col1.z, this.m_K.col3.y = this.m_K.col2.z, this.m_K.col3.z = y + d + x * this.m_a1 * this.m_a1 + f * this.m_a2 * this.m_a2, this.m_enableLimit) {
			var g = this.m_axis.x * _ + this.m_axis.y * p;
			2 * t.b2_linearSlop > o.Abs(this.m_upperTranslation - this.m_lowerTranslation) ? this.m_limitState = u.e_equalLimits : g > this.m_lowerTranslation ? this.m_upperTranslation > g ? (this.m_limitState = u.e_inactiveLimit, this.m_impulse.z = 0) : this.m_limitState != u.e_atUpperLimit && (this.m_limitState = u.e_atUpperLimit, this.m_impulse.z = 0) : this.m_limitState != u.e_atLowerLimit && (this.m_limitState = u.e_atLowerLimit, this.m_impulse.z = 0)
		} else
			this.m_limitState = u.e_inactiveLimit;
		if (this.m_enableMotor == 0 && (this.m_motorImpulse = 0), e.warmStarting) {
			this.m_impulse.x *= e.dtRatio,
			this.m_impulse.y *= e.dtRatio,
			this.m_motorImpulse *= e.dtRatio;
			var v = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x,
			b = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y,
			w = this.m_impulse.x * this.m_s1 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a1,
			C = this.m_impulse.x * this.m_s2 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a2;
			s.m_linearVelocity.x -= this.m_invMassA * v,
			s.m_linearVelocity.y -= this.m_invMassA * b,
			s.m_angularVelocity -= this.m_invIA * w,
			n.m_linearVelocity.x += this.m_invMassB * v,
			n.m_linearVelocity.y += this.m_invMassB * b,
			n.m_angularVelocity += this.m_invIB * C
		} else
			this.m_impulse.SetZero(), this.m_motorImpulse = 0
	},
	v.prototype.SolveVelocityConstraints = function (t) {
		var e = this.m_bodyA,
		i = this.m_bodyB,
		r = e.m_linearVelocity,
		a = e.m_angularVelocity,
		h = i.m_linearVelocity,
		l = i.m_angularVelocity,
		c = 0,
		m = 0,
		_ = 0,
		p = 0;
		if (this.m_enableMotor && this.m_limitState != u.e_equalLimits) {
			var y = this.m_axis.x * (h.x - r.x) + this.m_axis.y * (h.y - r.y) + this.m_a2 * l - this.m_a1 * a,
			d = this.m_motorMass * (this.m_motorSpeed - y),
			x = this.m_motorImpulse,
			f = t.dt * this.m_maxMotorForce;
			this.m_motorImpulse = o.Clamp(this.m_motorImpulse + d, -f, f),
			d = this.m_motorImpulse - x,
			c = d * this.m_axis.x,
			m = d * this.m_axis.y,
			_ = d * this.m_a1,
			p = d * this.m_a2,
			r.x -= this.m_invMassA * c,
			r.y -= this.m_invMassA * m,
			a -= this.m_invIA * _,
			h.x += this.m_invMassB * c,
			h.y += this.m_invMassB * m,
			l += this.m_invIB * p
		}
		var g = this.m_perp.x * (h.x - r.x) + this.m_perp.y * (h.y - r.y) + this.m_s2 * l - this.m_s1 * a,
		v = l - a;
		if (this.m_enableLimit && this.m_limitState != u.e_inactiveLimit) {
			var b = this.m_axis.x * (h.x - r.x) + this.m_axis.y * (h.y - r.y) + this.m_a2 * l - this.m_a1 * a,
			w = this.m_impulse.Copy(),
			C = this.m_K.Solve33(new n, -g, -v, -b);
			this.m_impulse.Add(C),
			this.m_limitState == u.e_atLowerLimit ? this.m_impulse.z = o.Max(this.m_impulse.z, 0) : this.m_limitState == u.e_atUpperLimit && (this.m_impulse.z = o.Min(this.m_impulse.z, 0));
			var D = -g - (this.m_impulse.z - w.z) * this.m_K.col3.x,
			B = -v - (this.m_impulse.z - w.z) * this.m_K.col3.y,
			S = this.m_K.Solve22(new s, D, B);
			S.x += w.x,
			S.y += w.y,
			this.m_impulse.x = S.x,
			this.m_impulse.y = S.y,
			C.x = this.m_impulse.x - w.x,
			C.y = this.m_impulse.y - w.y,
			C.z = this.m_impulse.z - w.z,
			c = C.x * this.m_perp.x + C.z * this.m_axis.x,
			m = C.x * this.m_perp.y + C.z * this.m_axis.y,
			_ = C.x * this.m_s1 + C.y + C.z * this.m_a1,
			p = C.x * this.m_s2 + C.y + C.z * this.m_a2,
			r.x -= this.m_invMassA * c,
			r.y -= this.m_invMassA * m,
			a -= this.m_invIA * _,
			h.x += this.m_invMassB * c,
			h.y += this.m_invMassB * m,
			l += this.m_invIB * p
		} else {
			var I = this.m_K.Solve22(new s, -g, -v);
			this.m_impulse.x += I.x,
			this.m_impulse.y += I.y,
			c = I.x * this.m_perp.x,
			m = I.x * this.m_perp.y,
			_ = I.x * this.m_s1 + I.y,
			p = I.x * this.m_s2 + I.y,
			r.x -= this.m_invMassA * c,
			r.y -= this.m_invMassA * m,
			a -= this.m_invIA * _,
			h.x += this.m_invMassB * c,
			h.y += this.m_invMassB * m,
			l += this.m_invIB * p
		}
		e.m_linearVelocity.SetV(r),
		e.m_angularVelocity = a,
		i.m_linearVelocity.SetV(h),
		i.m_angularVelocity = l
	},
	v.prototype.SolvePositionConstraints = function (i) {
		i === void 0 && (i = 0);
		var r,
		a = this.m_bodyA,
		h = this.m_bodyB,
		l = a.m_sweep.c,
		c = a.m_sweep.a,
		m = h.m_sweep.c,
		_ = h.m_sweep.a,
		u = 0,
		p = 0,
		y = 0,
		d = 0,
		x = 0,
		f = 0,
		g = 0,
		v = !1,
		b = 0,
		w = e.FromAngle(c),
		C = e.FromAngle(_);
		r = w;
		var D = this.m_localAnchor1.x - this.m_localCenterA.x,
		B = this.m_localAnchor1.y - this.m_localCenterA.y;
		u = r.col1.x * D + r.col2.x * B,
		B = r.col1.y * D + r.col2.y * B,
		D = u,
		r = C;
		var S = this.m_localAnchor2.x - this.m_localCenterB.x,
		I = this.m_localAnchor2.y - this.m_localCenterB.y;
		u = r.col1.x * S + r.col2.x * I,
		I = r.col1.y * S + r.col2.y * I,
		S = u;
		var A = m.x + S - l.x - D,
		M = m.y + I - l.y - B;
		if (this.m_enableLimit) {
			this.m_axis = o.MulMV(w, this.m_localXAxis1),
			this.m_a1 = (A + D) * this.m_axis.y - (M + B) * this.m_axis.x,
			this.m_a2 = S * this.m_axis.y - I * this.m_axis.x;
			var T = this.m_axis.x * A + this.m_axis.y * M;
			2 * t.b2_linearSlop > o.Abs(this.m_upperTranslation - this.m_lowerTranslation) ? (b = o.Clamp(T, -t.b2_maxLinearCorrection, t.b2_maxLinearCorrection), f = o.Abs(T), v = !0) : T > this.m_lowerTranslation ? this.m_upperTranslation > T || (b = o.Clamp(T - this.m_upperTranslation + t.b2_linearSlop, 0, t.b2_maxLinearCorrection), f = T - this.m_upperTranslation, v = !0) : (b = o.Clamp(T - this.m_lowerTranslation + t.b2_linearSlop, -t.b2_maxLinearCorrection, 0), f = this.m_lowerTranslation - T, v = !0)
		}
		this.m_perp = o.MulMV(w, this.m_localYAxis1),
		this.m_s1 = (A + D) * this.m_perp.y - (M + B) * this.m_perp.x,
		this.m_s2 = S * this.m_perp.y - I * this.m_perp.x;
		var V = new n,
		P = this.m_perp.x * A + this.m_perp.y * M,
		R = _ - c - this.m_refAngle;
		if (f = o.Max(f, o.Abs(P)), g = o.Abs(R), v)
			p = this.m_invMassA, y = this.m_invMassB, d = this.m_invIA, x = this.m_invIB, this.m_K.col1.x = p + y + d * this.m_s1 * this.m_s1 + x * this.m_s2 * this.m_s2, this.m_K.col1.y = d * this.m_s1 + x * this.m_s2, this.m_K.col1.z = d * this.m_s1 * this.m_a1 + x * this.m_s2 * this.m_a2, this.m_K.col2.x = this.m_K.col1.y, this.m_K.col2.y = d + x, this.m_K.col2.z = d * this.m_a1 + x * this.m_a2, this.m_K.col3.x = this.m_K.col1.z, this.m_K.col3.y = this.m_K.col2.z, this.m_K.col3.z = p + y + d * this.m_a1 * this.m_a1 + x * this.m_a2 * this.m_a2, this.m_K.Solve33(V, -P, -R, -b);
		else {
			p = this.m_invMassA,
			y = this.m_invMassB,
			d = this.m_invIA,
			x = this.m_invIB;
			var k = p + y + d * this.m_s1 * this.m_s1 + x * this.m_s2 * this.m_s2,
			L = d * this.m_s1 + x * this.m_s2,
			F = d + x;
			this.m_K.col1.Set(k, L, 0),
			this.m_K.col2.Set(L, F, 0);
			var G = this.m_K.Solve22(new s, -P, -R);
			V.x = G.x,
			V.y = G.y,
			V.z = 0
		}
		var z = V.x * this.m_perp.x + V.z * this.m_axis.x,
		E = V.x * this.m_perp.y + V.z * this.m_axis.y,
		J = V.x * this.m_s1 + V.y + V.z * this.m_a1,
		O = V.x * this.m_s2 + V.y + V.z * this.m_a2;
		return l.x -= this.m_invMassA * z,
		l.y -= this.m_invMassA * E,
		c -= this.m_invIA * J,
		m.x += this.m_invMassB * z,
		m.y += this.m_invMassB * E,
		_ += this.m_invIB * O,
		a.m_sweep.a = c,
		h.m_sweep.a = _,
		a.SynchronizeTransform(),
		h.SynchronizeTransform(),
		t.b2_linearSlop >= f && t.b2_angularSlop >= g
	},
	Box2D.inherit(b, Box2D.Dynamics.Joints.b2JointDef),
	b.prototype.__super = Box2D.Dynamics.Joints.b2JointDef.prototype,
	b.b2PrismaticJointDef = function () {
		Box2D.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments),
		this.localAnchorA = new s,
		this.localAnchorB = new s,
		this.localAxisA = new s
	},
	b.prototype.b2PrismaticJointDef = function () {
		this.__super.b2JointDef.call(this),
		this.type = u.e_prismaticJoint,
		this.localAxisA.Set(1, 0),
		this.referenceAngle = 0,
		this.enableLimit = !1,
		this.lowerTranslation = 0,
		this.upperTranslation = 0,
		this.enableMotor = !1,
		this.maxMotorForce = 0,
		this.motorSpeed = 0
	},
	b.prototype.Initialize = function (t, e, i, o) {
		this.bodyA = t,
		this.bodyB = e,
		this.localAnchorA = this.bodyA.GetLocalPoint(i),
		this.localAnchorB = this.bodyB.GetLocalPoint(i),
		this.localAxisA = this.bodyA.GetLocalVector(o),
		this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
	},
	Box2D.inherit(w, Box2D.Dynamics.Joints.b2Joint),
	w.prototype.__super = Box2D.Dynamics.Joints.b2Joint.prototype,
	w.b2PulleyJoint = function () {
		Box2D.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
		this.m_groundAnchor1 = new s,
		this.m_groundAnchor2 = new s,
		this.m_localAnchor1 = new s,
		this.m_localAnchor2 = new s,
		this.m_u1 = new s,
		this.m_u2 = new s
	},
	w.prototype.GetAnchorA = function () {
		return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
	},
	w.prototype.GetAnchorB = function () {
		return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
	},
	w.prototype.GetReactionForce = function (t) {
		return t === void 0 && (t = 0),
		new s(t * this.m_impulse * this.m_u2.x, t * this.m_impulse * this.m_u2.y)
	},
	w.prototype.GetReactionTorque = function (t) {
		return t === void 0 && (t = 0),
		0
	},
	w.prototype.GetGroundAnchorA = function () {
		var t = this.m_ground.m_xf.position.Copy();
		return t.Add(this.m_groundAnchor1),
		t
	},
	w.prototype.GetGroundAnchorB = function () {
		var t = this.m_ground.m_xf.position.Copy();
		return t.Add(this.m_groundAnchor2),
		t
	},
	w.prototype.GetLength1 = function () {
		var t = this.m_bodyA.GetWorldPoint(this.m_localAnchor1),
		e = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x,
		i = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y,
		o = t.x - e,
		s = t.y - i;
		return Math.sqrt(o * o + s * s)
	},
	w.prototype.GetLength2 = function () {
		var t = this.m_bodyB.GetWorldPoint(this.m_localAnchor2),
		e = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x,
		i = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y,
		o = t.x - e,
		s = t.y - i;
		return Math.sqrt(o * o + s * s)
	},
	w.prototype.GetRatio = function () {
		return this.m_ratio
	},
	w.prototype.b2PulleyJoint = function (t) {
		this.__super.b2Joint.call(this, t),
		this.m_ground = this.m_bodyA.m_world.m_groundBody,
		this.m_groundAnchor1.x = t.groundAnchorA.x - this.m_ground.m_xf.position.x,
		this.m_groundAnchor1.y = t.groundAnchorA.y - this.m_ground.m_xf.position.y,
		this.m_groundAnchor2.x = t.groundAnchorB.x - this.m_ground.m_xf.position.x,
		this.m_groundAnchor2.y = t.groundAnchorB.y - this.m_ground.m_xf.position.y,
		this.m_localAnchor1.SetV(t.localAnchorA),
		this.m_localAnchor2.SetV(t.localAnchorB),
		this.m_ratio = t.ratio,
		this.m_constant = t.lengthA + this.m_ratio * t.lengthB,
		this.m_maxLength1 = o.Min(t.maxLengthA, this.m_constant - this.m_ratio * w.b2_minPulleyLength),
		this.m_maxLength2 = o.Min(t.maxLengthB, (this.m_constant - w.b2_minPulleyLength) / this.m_ratio),
		this.m_impulse = 0,
		this.m_limitImpulse1 = 0,
		this.m_limitImpulse2 = 0
	},
	w.prototype.InitVelocityConstraints = function (e) {
		var i,
		o = this.m_bodyA,
		s = this.m_bodyB;
		i = o.m_xf.R;
		var n = this.m_localAnchor1.x - o.m_sweep.localCenter.x,
		r = this.m_localAnchor1.y - o.m_sweep.localCenter.y,
		a = i.col1.x * n + i.col2.x * r;
		r = i.col1.y * n + i.col2.y * r,
		n = a,
		i = s.m_xf.R;
		var h = this.m_localAnchor2.x - s.m_sweep.localCenter.x,
		l = this.m_localAnchor2.y - s.m_sweep.localCenter.y;
		a = i.col1.x * h + i.col2.x * l,
		l = i.col1.y * h + i.col2.y * l,
		h = a;
		var c = o.m_sweep.c.x + n,
		m = o.m_sweep.c.y + r,
		_ = s.m_sweep.c.x + h,
		p = s.m_sweep.c.y + l,
		y = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x,
		d = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y,
		x = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x,
		f = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
		this.m_u1.Set(c - y, m - d),
		this.m_u2.Set(_ - x, p - f);
		var g = this.m_u1.Length(),
		v = this.m_u2.Length();
		g > t.b2_linearSlop ? this.m_u1.Multiply(1 / g) : this.m_u1.SetZero(),
		v > t.b2_linearSlop ? this.m_u2.Multiply(1 / v) : this.m_u2.SetZero();
		var b = this.m_constant - g - this.m_ratio * v;
		b > 0 ? (this.m_state = u.e_inactiveLimit, this.m_impulse = 0) : this.m_state = u.e_atUpperLimit,
		this.m_maxLength1 > g ? (this.m_limitState1 = u.e_inactiveLimit, this.m_limitImpulse1 = 0) : this.m_limitState1 = u.e_atUpperLimit,
		this.m_maxLength2 > v ? (this.m_limitState2 = u.e_inactiveLimit, this.m_limitImpulse2 = 0) : this.m_limitState2 = u.e_atUpperLimit;
		var w = n * this.m_u1.y - r * this.m_u1.x,
		C = h * this.m_u2.y - l * this.m_u2.x;
		if (this.m_limitMass1 = o.m_invMass + o.m_invI * w * w, this.m_limitMass2 = s.m_invMass + s.m_invI * C * C, this.m_pulleyMass = this.m_limitMass1 + this.m_ratio * this.m_ratio * this.m_limitMass2, this.m_limitMass1 = 1 / this.m_limitMass1, this.m_limitMass2 = 1 / this.m_limitMass2, this.m_pulleyMass = 1 / this.m_pulleyMass, e.warmStarting) {
			this.m_impulse *= e.dtRatio,
			this.m_limitImpulse1 *= e.dtRatio,
			this.m_limitImpulse2 *= e.dtRatio;
			var D = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.x,
			B = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.y,
			S = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.x,
			I = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.y;
			o.m_linearVelocity.x += o.m_invMass * D,
			o.m_linearVelocity.y += o.m_invMass * B,
			o.m_angularVelocity += o.m_invI * (n * B - r * D),
			s.m_linearVelocity.x += s.m_invMass * S,
			s.m_linearVelocity.y += s.m_invMass * I,
			s.m_angularVelocity += s.m_invI * (h * I - l * S)
		} else
			this.m_impulse = 0, this.m_limitImpulse1 = 0, this.m_limitImpulse2 = 0
	},
	w.prototype.SolveVelocityConstraints = function () {
		var t,
		e = this.m_bodyA,
		i = this.m_bodyB;
		t = e.m_xf.R;
		var s = this.m_localAnchor1.x - e.m_sweep.localCenter.x,
		n = this.m_localAnchor1.y - e.m_sweep.localCenter.y,
		r = t.col1.x * s + t.col2.x * n;
		n = t.col1.y * s + t.col2.y * n,
		s = r,
		t = i.m_xf.R;
		var a = this.m_localAnchor2.x - i.m_sweep.localCenter.x,
		h = this.m_localAnchor2.y - i.m_sweep.localCenter.y;
		r = t.col1.x * a + t.col2.x * h,
		h = t.col1.y * a + t.col2.y * h,
		a = r;
		var l = 0,
		c = 0,
		m = 0,
		_ = 0,
		p = 0,
		y = 0,
		d = 0,
		x = 0,
		f = 0,
		g = 0,
		v = 0;
		this.m_state == u.e_atUpperLimit && (l = e.m_linearVelocity.x + -e.m_angularVelocity * n, c = e.m_linearVelocity.y + e.m_angularVelocity * s, m = i.m_linearVelocity.x + -i.m_angularVelocity * h, _ = i.m_linearVelocity.y + i.m_angularVelocity * a, f =  - (this.m_u1.x * l + this.m_u1.y * c) - this.m_ratio * (this.m_u2.x * m + this.m_u2.y * _), g = this.m_pulleyMass * -f, v = this.m_impulse, this.m_impulse = o.Max(0, this.m_impulse + g), g = this.m_impulse - v, p = -g * this.m_u1.x, y = -g * this.m_u1.y, d = -this.m_ratio * g * this.m_u2.x, x = -this.m_ratio * g * this.m_u2.y, e.m_linearVelocity.x += e.m_invMass * p, e.m_linearVelocity.y += e.m_invMass * y, e.m_angularVelocity += e.m_invI * (s * y - n * p), i.m_linearVelocity.x += i.m_invMass * d, i.m_linearVelocity.y += i.m_invMass * x, i.m_angularVelocity += i.m_invI * (a * x - h * d)),
		this.m_limitState1 == u.e_atUpperLimit && (l = e.m_linearVelocity.x + -e.m_angularVelocity * n, c = e.m_linearVelocity.y + e.m_angularVelocity * s, f =  - (this.m_u1.x * l + this.m_u1.y * c), g = -this.m_limitMass1 * f, v = this.m_limitImpulse1, this.m_limitImpulse1 = o.Max(0, this.m_limitImpulse1 + g), g = this.m_limitImpulse1 - v, p = -g * this.m_u1.x, y = -g * this.m_u1.y, e.m_linearVelocity.x += e.m_invMass * p, e.m_linearVelocity.y += e.m_invMass * y, e.m_angularVelocity += e.m_invI * (s * y - n * p)),
		this.m_limitState2 == u.e_atUpperLimit && (m = i.m_linearVelocity.x + -i.m_angularVelocity * h, _ = i.m_linearVelocity.y + i.m_angularVelocity * a, f =  - (this.m_u2.x * m + this.m_u2.y * _), g = -this.m_limitMass2 * f, v = this.m_limitImpulse2, this.m_limitImpulse2 = o.Max(0, this.m_limitImpulse2 + g), g = this.m_limitImpulse2 - v, d = -g * this.m_u2.x, x = -g * this.m_u2.y, i.m_linearVelocity.x += i.m_invMass * d, i.m_linearVelocity.y += i.m_invMass * x, i.m_angularVelocity += i.m_invI * (a * x - h * d))
	},
	w.prototype.SolvePositionConstraints = function (e) {
		e === void 0 && (e = 0);
		var i,
		s = this.m_bodyA,
		n = this.m_bodyB,
		r = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x,
		a = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y,
		h = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x,
		l = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y,
		c = 0,
		m = 0,
		_ = 0,
		p = 0,
		y = 0,
		d = 0,
		x = 0,
		f = 0,
		g = 0,
		v = 0,
		b = 0,
		w = 0,
		C = 0,
		D = 0;
		return this.m_state == u.e_atUpperLimit && (i = s.m_xf.R, c = this.m_localAnchor1.x - s.m_sweep.localCenter.x, m = this.m_localAnchor1.y - s.m_sweep.localCenter.y, C = i.col1.x * c + i.col2.x * m, m = i.col1.y * c + i.col2.y * m, c = C, i = n.m_xf.R, _ = this.m_localAnchor2.x - n.m_sweep.localCenter.x, p = this.m_localAnchor2.y - n.m_sweep.localCenter.y, C = i.col1.x * _ + i.col2.x * p, p = i.col1.y * _ + i.col2.y * p, _ = C, y = s.m_sweep.c.x + c, d = s.m_sweep.c.y + m, x = n.m_sweep.c.x + _, f = n.m_sweep.c.y + p, this.m_u1.Set(y - r, d - a), this.m_u2.Set(x - h, f - l), g = this.m_u1.Length(), v = this.m_u2.Length(), g > t.b2_linearSlop ? this.m_u1.Multiply(1 / g) : this.m_u1.SetZero(), v > t.b2_linearSlop ? this.m_u2.Multiply(1 / v) : this.m_u2.SetZero(), b = this.m_constant - g - this.m_ratio * v, D = o.Max(D, -b), b = o.Clamp(b + t.b2_linearSlop, -t.b2_maxLinearCorrection, 0), w = -this.m_pulleyMass * b, y = -w * this.m_u1.x, d = -w * this.m_u1.y, x = -this.m_ratio * w * this.m_u2.x, f = -this.m_ratio * w * this.m_u2.y, s.m_sweep.c.x += s.m_invMass * y, s.m_sweep.c.y += s.m_invMass * d, s.m_sweep.a += s.m_invI * (c * d - m * y), n.m_sweep.c.x += n.m_invMass * x, n.m_sweep.c.y += n.m_invMass * f, n.m_sweep.a += n.m_invI * (_ * f - p * x), s.SynchronizeTransform(), n.SynchronizeTransform()),
		this.m_limitState1 == u.e_atUpperLimit && (i = s.m_xf.R, c = this.m_localAnchor1.x - s.m_sweep.localCenter.x, m = this.m_localAnchor1.y - s.m_sweep.localCenter.y, C = i.col1.x * c + i.col2.x * m, m = i.col1.y * c + i.col2.y * m, c = C, y = s.m_sweep.c.x + c, d = s.m_sweep.c.y + m, this.m_u1.Set(y - r, d - a), g = this.m_u1.Length(), g > t.b2_linearSlop ? (this.m_u1.x *= 1 / g, this.m_u1.y *= 1 / g) : this.m_u1.SetZero(), b = this.m_maxLength1 - g, D = o.Max(D, -b), b = o.Clamp(b + t.b2_linearSlop, -t.b2_maxLinearCorrection, 0), w = -this.m_limitMass1 * b, y = -w * this.m_u1.x, d = -w * this.m_u1.y, s.m_sweep.c.x += s.m_invMass * y, s.m_sweep.c.y += s.m_invMass * d, s.m_sweep.a += s.m_invI * (c * d - m * y), s.SynchronizeTransform()),
		this.m_limitState2 == u.e_atUpperLimit && (i = n.m_xf.R, _ = this.m_localAnchor2.x - n.m_sweep.localCenter.x, p = this.m_localAnchor2.y - n.m_sweep.localCenter.y, C = i.col1.x * _ + i.col2.x * p, p = i.col1.y * _ + i.col2.y * p, _ = C, x = n.m_sweep.c.x + _, f = n.m_sweep.c.y + p, this.m_u2.Set(x - h, f - l), v = this.m_u2.Length(), v > t.b2_linearSlop ? (this.m_u2.x *= 1 / v, this.m_u2.y *= 1 / v) : this.m_u2.SetZero(), b = this.m_maxLength2 - v, D = o.Max(D, -b), b = o.Clamp(b + t.b2_linearSlop, -t.b2_maxLinearCorrection, 0), w = -this.m_limitMass2 * b, x = -w * this.m_u2.x, f = -w * this.m_u2.y, n.m_sweep.c.x += n.m_invMass * x, n.m_sweep.c.y += n.m_invMass * f, n.m_sweep.a += n.m_invI * (_ * f - p * x), n.SynchronizeTransform()),
		t.b2_linearSlop > D
	},
	Box2D.postDefs.push(function () {
		Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength = 2
	}),
	Box2D.inherit(C, Box2D.Dynamics.Joints.b2JointDef),
	C.prototype.__super = Box2D.Dynamics.Joints.b2JointDef.prototype,
	C.b2PulleyJointDef = function () {
		Box2D.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments),
		this.groundAnchorA = new s,
		this.groundAnchorB = new s,
		this.localAnchorA = new s,
		this.localAnchorB = new s
	},
	C.prototype.b2PulleyJointDef = function () {
		this.__super.b2JointDef.call(this),
		this.type = u.e_pulleyJoint,
		this.groundAnchorA.Set(-1, 1),
		this.groundAnchorB.Set(1, 1),
		this.localAnchorA.Set(-1, 0),
		this.localAnchorB.Set(1, 0),
		this.lengthA = 0,
		this.maxLengthA = 0,
		this.lengthB = 0,
		this.maxLengthB = 0,
		this.ratio = 1,
		this.collideConnected = !0
	},
	C.prototype.Initialize = function (t, e, i, o, s, n, r) {
		r === void 0 && (r = 0),
		this.bodyA = t,
		this.bodyB = e,
		this.groundAnchorA.SetV(i),
		this.groundAnchorB.SetV(o),
		this.localAnchorA = this.bodyA.GetLocalPoint(s),
		this.localAnchorB = this.bodyB.GetLocalPoint(n);
		var a = s.x - i.x,
		h = s.y - i.y;
		this.lengthA = Math.sqrt(a * a + h * h);
		var l = n.x - o.x,
		c = n.y - o.y;
		this.lengthB = Math.sqrt(l * l + c * c),
		this.ratio = r;
		var m = this.lengthA + this.ratio * this.lengthB;
		this.maxLengthA = m - this.ratio * w.b2_minPulleyLength,
		this.maxLengthB = (m - w.b2_minPulleyLength) / this.ratio
	},
	Box2D.inherit(D, Box2D.Dynamics.Joints.b2Joint),
	D.prototype.__super = Box2D.Dynamics.Joints.b2Joint.prototype,
	D.b2RevoluteJoint = function () {
		Box2D.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
		this.K = new e,
		this.K1 = new e,
		this.K2 = new e,
		this.K3 = new e,
		this.impulse3 = new n,
		this.impulse2 = new s,
		this.reduced = new s,
		this.m_localAnchor1 = new s,
		this.m_localAnchor2 = new s,
		this.m_impulse = new n,
		this.m_mass = new i
	},
	D.prototype.GetAnchorA = function () {
		return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
	},
	D.prototype.GetAnchorB = function () {
		return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
	},
	D.prototype.GetReactionForce = function (t) {
		return t === void 0 && (t = 0),
		new s(t * this.m_impulse.x, t * this.m_impulse.y)
	},
	D.prototype.GetReactionTorque = function (t) {
		return t === void 0 && (t = 0),
		t * this.m_impulse.z
	},
	D.prototype.GetJointAngle = function () {
		return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle
	},
	D.prototype.GetJointSpeed = function () {
		return this.m_bodyB.m_angularVelocity - this.m_bodyA.m_angularVelocity
	},
	D.prototype.IsLimitEnabled = function () {
		return this.m_enableLimit
	},
	D.prototype.EnableLimit = function (t) {
		this.m_enableLimit = t
	},
	D.prototype.GetLowerLimit = function () {
		return this.m_lowerAngle
	},
	D.prototype.GetUpperLimit = function () {
		return this.m_upperAngle
	},
	D.prototype.SetLimits = function (t, e) {
		t === void 0 && (t = 0),
		e === void 0 && (e = 0),
		this.m_lowerAngle = t,
		this.m_upperAngle = e
	},
	D.prototype.IsMotorEnabled = function () {
		return this.m_bodyA.SetAwake(!0),
		this.m_bodyB.SetAwake(!0),
		this.m_enableMotor
	},
	D.prototype.EnableMotor = function (t) {
		this.m_enableMotor = t
	},
	D.prototype.SetMotorSpeed = function (t) {
		t === void 0 && (t = 0),
		this.m_bodyA.SetAwake(!0),
		this.m_bodyB.SetAwake(!0),
		this.m_motorSpeed = t
	},
	D.prototype.GetMotorSpeed = function () {
		return this.m_motorSpeed
	},
	D.prototype.SetMaxMotorTorque = function (t) {
		t === void 0 && (t = 0),
		this.m_maxMotorTorque = t
	},
	D.prototype.GetMotorTorque = function () {
		return this.m_maxMotorTorque
	},
	D.prototype.b2RevoluteJoint = function (t) {
		this.__super.b2Joint.call(this, t),
		this.m_localAnchor1.SetV(t.localAnchorA),
		this.m_localAnchor2.SetV(t.localAnchorB),
		this.m_referenceAngle = t.referenceAngle,
		this.m_impulse.SetZero(),
		this.m_motorImpulse = 0,
		this.m_lowerAngle = t.lowerAngle,
		this.m_upperAngle = t.upperAngle,
		this.m_maxMotorTorque = t.maxMotorTorque,
		this.m_motorSpeed = t.motorSpeed,
		this.m_enableLimit = t.enableLimit,
		this.m_enableMotor = t.enableMotor,
		this.m_limitState = u.e_inactiveLimit
	},
	D.prototype.InitVelocityConstraints = function (e) {
		var i,
		s = this.m_bodyA,
		n = this.m_bodyB,
		r = 0;
		this.m_enableMotor || this.m_enableLimit,
		i = s.m_xf.R;
		var a = this.m_localAnchor1.x - s.m_sweep.localCenter.x,
		h = this.m_localAnchor1.y - s.m_sweep.localCenter.y;
		r = i.col1.x * a + i.col2.x * h,
		h = i.col1.y * a + i.col2.y * h,
		a = r,
		i = n.m_xf.R;
		var l = this.m_localAnchor2.x - n.m_sweep.localCenter.x,
		c = this.m_localAnchor2.y - n.m_sweep.localCenter.y;
		r = i.col1.x * l + i.col2.x * c,
		c = i.col1.y * l + i.col2.y * c,
		l = r;
		var m = s.m_invMass,
		_ = n.m_invMass,
		p = s.m_invI,
		y = n.m_invI;
		if (this.m_mass.col1.x = m + _ + h * h * p + c * c * y, this.m_mass.col2.x = -h * a * p - c * l * y, this.m_mass.col3.x = -h * p - c * y, this.m_mass.col1.y = this.m_mass.col2.x, this.m_mass.col2.y = m + _ + a * a * p + l * l * y, this.m_mass.col3.y = a * p + l * y, this.m_mass.col1.z = this.m_mass.col3.x, this.m_mass.col2.z = this.m_mass.col3.y, this.m_mass.col3.z = p + y, this.m_motorMass = 1 / (p + y), this.m_enableMotor == 0 && (this.m_motorImpulse = 0), this.m_enableLimit) {
			var d = n.m_sweep.a - s.m_sweep.a - this.m_referenceAngle;
			2 * t.b2_angularSlop > o.Abs(this.m_upperAngle - this.m_lowerAngle) ? this.m_limitState = u.e_equalLimits : d > this.m_lowerAngle ? this.m_upperAngle > d ? (this.m_limitState = u.e_inactiveLimit, this.m_impulse.z = 0) : (this.m_limitState != u.e_atUpperLimit && (this.m_impulse.z = 0), this.m_limitState = u.e_atUpperLimit) : (this.m_limitState != u.e_atLowerLimit && (this.m_impulse.z = 0), this.m_limitState = u.e_atLowerLimit)
		} else
			this.m_limitState = u.e_inactiveLimit;
		if (e.warmStarting) {
			this.m_impulse.x *= e.dtRatio,
			this.m_impulse.y *= e.dtRatio,
			this.m_motorImpulse *= e.dtRatio;
			var x = this.m_impulse.x,
			f = this.m_impulse.y;
			s.m_linearVelocity.x -= m * x,
			s.m_linearVelocity.y -= m * f,
			s.m_angularVelocity -= p * (a * f - h * x + this.m_motorImpulse + this.m_impulse.z),
			n.m_linearVelocity.x += _ * x,
			n.m_linearVelocity.y += _ * f,
			n.m_angularVelocity += y * (l * f - c * x + this.m_motorImpulse + this.m_impulse.z)
		} else
			this.m_impulse.SetZero(), this.m_motorImpulse = 0
	},
	D.prototype.SolveVelocityConstraints = function (t) {
		var e,
		i = this.m_bodyA,
		s = this.m_bodyB,
		n = 0,
		r = 0,
		a = 0,
		h = 0,
		l = 0,
		c = 0,
		m = i.m_linearVelocity,
		_ = i.m_angularVelocity,
		p = s.m_linearVelocity,
		y = s.m_angularVelocity,
		d = i.m_invMass,
		x = s.m_invMass,
		f = i.m_invI,
		g = s.m_invI;
		if (this.m_enableMotor && this.m_limitState != u.e_equalLimits) {
			var v = y - _ - this.m_motorSpeed,
			b = this.m_motorMass * -v,
			w = this.m_motorImpulse,
			C = t.dt * this.m_maxMotorTorque;
			this.m_motorImpulse = o.Clamp(this.m_motorImpulse + b, -C, C),
			b = this.m_motorImpulse - w,
			_ -= f * b,
			y += g * b
		}
		if (this.m_enableLimit && this.m_limitState != u.e_inactiveLimit) {
			e = i.m_xf.R,
			a = this.m_localAnchor1.x - i.m_sweep.localCenter.x,
			h = this.m_localAnchor1.y - i.m_sweep.localCenter.y,
			n = e.col1.x * a + e.col2.x * h,
			h = e.col1.y * a + e.col2.y * h,
			a = n,
			e = s.m_xf.R,
			l = this.m_localAnchor2.x - s.m_sweep.localCenter.x,
			c = this.m_localAnchor2.y - s.m_sweep.localCenter.y,
			n = e.col1.x * l + e.col2.x * c,
			c = e.col1.y * l + e.col2.y * c,
			l = n;
			var D = p.x + -y * c - m.x - -_ * h,
			B = p.y + y * l - m.y - _ * a,
			S = y - _;
			this.m_mass.Solve33(this.impulse3, -D, -B, -S),
			this.m_limitState == u.e_equalLimits ? this.m_impulse.Add(this.impulse3) : this.m_limitState == u.e_atLowerLimit ? (r = this.m_impulse.z + this.impulse3.z, 0 > r && (this.m_mass.Solve22(this.reduced, -D, -B), this.impulse3.x = this.reduced.x, this.impulse3.y = this.reduced.y, this.impulse3.z = -this.m_impulse.z, this.m_impulse.x += this.reduced.x, this.m_impulse.y += this.reduced.y, this.m_impulse.z = 0)) : this.m_limitState == u.e_atUpperLimit && (r = this.m_impulse.z + this.impulse3.z, r > 0 && (this.m_mass.Solve22(this.reduced, -D, -B), this.impulse3.x = this.reduced.x, this.impulse3.y = this.reduced.y, this.impulse3.z = -this.m_impulse.z, this.m_impulse.x += this.reduced.x, this.m_impulse.y += this.reduced.y, this.m_impulse.z = 0)),
			m.x -= d * this.impulse3.x,
			m.y -= d * this.impulse3.y,
			_ -= f * (a * this.impulse3.y - h * this.impulse3.x + this.impulse3.z),
			p.x += x * this.impulse3.x,
			p.y += x * this.impulse3.y,
			y += g * (l * this.impulse3.y - c * this.impulse3.x + this.impulse3.z)
		} else {
			e = i.m_xf.R,
			a = this.m_localAnchor1.x - i.m_sweep.localCenter.x,
			h = this.m_localAnchor1.y - i.m_sweep.localCenter.y,
			n = e.col1.x * a + e.col2.x * h,
			h = e.col1.y * a + e.col2.y * h,
			a = n,
			e = s.m_xf.R,
			l = this.m_localAnchor2.x - s.m_sweep.localCenter.x,
			c = this.m_localAnchor2.y - s.m_sweep.localCenter.y,
			n = e.col1.x * l + e.col2.x * c,
			c = e.col1.y * l + e.col2.y * c,
			l = n;
			var I = p.x + -y * c - m.x - -_ * h,
			A = p.y + y * l - m.y - _ * a;
			this.m_mass.Solve22(this.impulse2, -I, -A),
			this.m_impulse.x += this.impulse2.x,
			this.m_impulse.y += this.impulse2.y,
			m.x -= d * this.impulse2.x,
			m.y -= d * this.impulse2.y,
			_ -= f * (a * this.impulse2.y - h * this.impulse2.x),
			p.x += x * this.impulse2.x,
			p.y += x * this.impulse2.y,
			y += g * (l * this.impulse2.y - c * this.impulse2.x)
		}
		i.m_linearVelocity.SetV(m),
		i.m_angularVelocity = _,
		s.m_linearVelocity.SetV(p),
		s.m_angularVelocity = y
	},
	D.prototype.SolvePositionConstraints = function (e) {
		e === void 0 && (e = 0);
		var i,
		s = 0,
		n = this.m_bodyA,
		r = this.m_bodyB,
		a = 0,
		h = 0,
		l = 0,
		c = 0,
		m = 0;
		if (this.m_enableLimit && this.m_limitState != u.e_inactiveLimit) {
			var _ = r.m_sweep.a - n.m_sweep.a - this.m_referenceAngle,
			p = 0;
			this.m_limitState == u.e_equalLimits ? (s = o.Clamp(_ - this.m_lowerAngle, -t.b2_maxAngularCorrection, t.b2_maxAngularCorrection), p = -this.m_motorMass * s, a = o.Abs(s)) : this.m_limitState == u.e_atLowerLimit ? (s = _ - this.m_lowerAngle, a = -s, s = o.Clamp(s + t.b2_angularSlop, -t.b2_maxAngularCorrection, 0), p = -this.m_motorMass * s) : this.m_limitState == u.e_atUpperLimit && (s = _ - this.m_upperAngle, a = s, s = o.Clamp(s - t.b2_angularSlop, 0, t.b2_maxAngularCorrection), p = -this.m_motorMass * s),
			n.m_sweep.a -= n.m_invI * p,
			r.m_sweep.a += r.m_invI * p,
			n.SynchronizeTransform(),
			r.SynchronizeTransform()
		}
		i = n.m_xf.R;
		var y = this.m_localAnchor1.x - n.m_sweep.localCenter.x,
		d = this.m_localAnchor1.y - n.m_sweep.localCenter.y;
		l = i.col1.x * y + i.col2.x * d,
		d = i.col1.y * y + i.col2.y * d,
		y = l,
		i = r.m_xf.R;
		var x = this.m_localAnchor2.x - r.m_sweep.localCenter.x,
		f = this.m_localAnchor2.y - r.m_sweep.localCenter.y;
		l = i.col1.x * x + i.col2.x * f,
		f = i.col1.y * x + i.col2.y * f,
		x = l;
		var g = r.m_sweep.c.x + x - n.m_sweep.c.x - y,
		v = r.m_sweep.c.y + f - n.m_sweep.c.y - d,
		b = g * g + v * v,
		w = Math.sqrt(b);
		h = w;
		var C = n.m_invMass,
		B = r.m_invMass,
		S = n.m_invI,
		I = r.m_invI,
		A = 10 * t.b2_linearSlop;
		if (b > A * A) {
			var M = C + B,
			T = 1 / M;
			c = T * -g,
			m = T * -v;
			var V = .5;
			n.m_sweep.c.x -= V * C * c,
			n.m_sweep.c.y -= V * C * m,
			r.m_sweep.c.x += V * B * c,
			r.m_sweep.c.y += V * B * m,
			g = r.m_sweep.c.x + x - n.m_sweep.c.x - y,
			v = r.m_sweep.c.y + f - n.m_sweep.c.y - d
		}
		return this.K1.col1.x = C + B,
		this.K1.col2.x = 0,
		this.K1.col1.y = 0,
		this.K1.col2.y = C + B,
		this.K2.col1.x = S * d * d,
		this.K2.col2.x = -S * y * d,
		this.K2.col1.y = -S * y * d,
		this.K2.col2.y = S * y * y,
		this.K3.col1.x = I * f * f,
		this.K3.col2.x = -I * x * f,
		this.K3.col1.y = -I * x * f,
		this.K3.col2.y = I * x * x,
		this.K.SetM(this.K1),
		this.K.AddM(this.K2),
		this.K.AddM(this.K3),
		this.K.Solve(D.tImpulse, -g, -v),
		c = D.tImpulse.x,
		m = D.tImpulse.y,
		n.m_sweep.c.x -= n.m_invMass * c,
		n.m_sweep.c.y -= n.m_invMass * m,
		n.m_sweep.a -= n.m_invI * (y * m - d * c),
		r.m_sweep.c.x += r.m_invMass * c,
		r.m_sweep.c.y += r.m_invMass * m,
		r.m_sweep.a += r.m_invI * (x * m - f * c),
		n.SynchronizeTransform(),
		r.SynchronizeTransform(),
		t.b2_linearSlop >= h && t.b2_angularSlop >= a
	},
	Box2D.postDefs.push(function () {
		Box2D.Dynamics.Joints.b2RevoluteJoint.tImpulse = new s
	}),
	Box2D.inherit(B, Box2D.Dynamics.Joints.b2JointDef),
	B.prototype.__super = Box2D.Dynamics.Joints.b2JointDef.prototype,
	B.b2RevoluteJointDef = function () {
		Box2D.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments),
		this.localAnchorA = new s,
		this.localAnchorB = new s
	},
	B.prototype.b2RevoluteJointDef = function () {
		this.__super.b2JointDef.call(this),
		this.type = u.e_revoluteJoint,
		this.localAnchorA.Set(0, 0),
		this.localAnchorB.Set(0, 0),
		this.referenceAngle = 0,
		this.lowerAngle = 0,
		this.upperAngle = 0,
		this.maxMotorTorque = 0,
		this.motorSpeed = 0,
		this.enableLimit = !1,
		this.enableMotor = !1
	},
	B.prototype.Initialize = function (t, e, i) {
		this.bodyA = t,
		this.bodyB = e,
		this.localAnchorA = this.bodyA.GetLocalPoint(i),
		this.localAnchorB = this.bodyB.GetLocalPoint(i),
		this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
	},
	Box2D.inherit(S, Box2D.Dynamics.Joints.b2Joint),
	S.prototype.__super = Box2D.Dynamics.Joints.b2Joint.prototype,
	S.b2WeldJoint = function () {
		Box2D.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
		this.m_localAnchorA = new s,
		this.m_localAnchorB = new s,
		this.m_impulse = new n,
		this.m_mass = new i
	},
	S.prototype.GetAnchorA = function () {
		return this.m_bodyA.GetWorldPoint(this.m_localAnchorA)
	},
	S.prototype.GetAnchorB = function () {
		return this.m_bodyB.GetWorldPoint(this.m_localAnchorB)
	},
	S.prototype.GetReactionForce = function (t) {
		return t === void 0 && (t = 0),
		new s(t * this.m_impulse.x, t * this.m_impulse.y)
	},
	S.prototype.GetReactionTorque = function (t) {
		return t === void 0 && (t = 0),
		t * this.m_impulse.z
	},
	S.prototype.b2WeldJoint = function (t) {
		this.__super.b2Joint.call(this, t),
		this.m_localAnchorA.SetV(t.localAnchorA),
		this.m_localAnchorB.SetV(t.localAnchorB),
		this.m_referenceAngle = t.referenceAngle,
		this.m_impulse.SetZero(),
		this.m_mass = new i
	},
	S.prototype.InitVelocityConstraints = function (t) {
		var e,
		i = 0,
		o = this.m_bodyA,
		s = this.m_bodyB;
		e = o.m_xf.R;
		var n = this.m_localAnchorA.x - o.m_sweep.localCenter.x,
		r = this.m_localAnchorA.y - o.m_sweep.localCenter.y;
		i = e.col1.x * n + e.col2.x * r,
		r = e.col1.y * n + e.col2.y * r,
		n = i,
		e = s.m_xf.R;
		var a = this.m_localAnchorB.x - s.m_sweep.localCenter.x,
		h = this.m_localAnchorB.y - s.m_sweep.localCenter.y;
		i = e.col1.x * a + e.col2.x * h,
		h = e.col1.y * a + e.col2.y * h,
		a = i;
		var l = o.m_invMass,
		c = s.m_invMass,
		m = o.m_invI,
		_ = s.m_invI;
		this.m_mass.col1.x = l + c + r * r * m + h * h * _,
		this.m_mass.col2.x = -r * n * m - h * a * _,
		this.m_mass.col3.x = -r * m - h * _,
		this.m_mass.col1.y = this.m_mass.col2.x,
		this.m_mass.col2.y = l + c + n * n * m + a * a * _,
		this.m_mass.col3.y = n * m + a * _,
		this.m_mass.col1.z = this.m_mass.col3.x,
		this.m_mass.col2.z = this.m_mass.col3.y,
		this.m_mass.col3.z = m + _,
		t.warmStarting ? (this.m_impulse.x *= t.dtRatio, this.m_impulse.y *= t.dtRatio, this.m_impulse.z *= t.dtRatio, o.m_linearVelocity.x -= l * this.m_impulse.x, o.m_linearVelocity.y -= l * this.m_impulse.y, o.m_angularVelocity -= m * (n * this.m_impulse.y - r * this.m_impulse.x + this.m_impulse.z), s.m_linearVelocity.x += c * this.m_impulse.x, s.m_linearVelocity.y += c * this.m_impulse.y, s.m_angularVelocity += _ * (a * this.m_impulse.y - h * this.m_impulse.x + this.m_impulse.z)) : this.m_impulse.SetZero()
	},
	S.prototype.SolveVelocityConstraints = function () {
		var t,
		e = 0,
		i = this.m_bodyA,
		o = this.m_bodyB,
		s = i.m_linearVelocity,
		r = i.m_angularVelocity,
		a = o.m_linearVelocity,
		h = o.m_angularVelocity,
		l = i.m_invMass,
		c = o.m_invMass,
		m = i.m_invI,
		_ = o.m_invI;
		t = i.m_xf.R;
		var u = this.m_localAnchorA.x - i.m_sweep.localCenter.x,
		p = this.m_localAnchorA.y - i.m_sweep.localCenter.y;
		e = t.col1.x * u + t.col2.x * p,
		p = t.col1.y * u + t.col2.y * p,
		u = e,
		t = o.m_xf.R;
		var y = this.m_localAnchorB.x - o.m_sweep.localCenter.x,
		d = this.m_localAnchorB.y - o.m_sweep.localCenter.y;
		e = t.col1.x * y + t.col2.x * d,
		d = t.col1.y * y + t.col2.y * d,
		y = e;
		var x = a.x - h * d - s.x + r * p,
		f = a.y + h * y - s.y - r * u,
		g = h - r,
		v = new n;
		this.m_mass.Solve33(v, -x, -f, -g),
		this.m_impulse.Add(v),
		s.x -= l * v.x,
		s.y -= l * v.y,
		r -= m * (u * v.y - p * v.x + v.z),
		a.x += c * v.x,
		a.y += c * v.y,
		h += _ * (y * v.y - d * v.x + v.z),
		i.m_angularVelocity = r,
		o.m_angularVelocity = h
	},
	S.prototype.SolvePositionConstraints = function (e) {
		e === void 0 && (e = 0);
		var i,
		s = 0,
		r = this.m_bodyA,
		a = this.m_bodyB;
		i = r.m_xf.R;
		var h = this.m_localAnchorA.x - r.m_sweep.localCenter.x,
		l = this.m_localAnchorA.y - r.m_sweep.localCenter.y;
		s = i.col1.x * h + i.col2.x * l,
		l = i.col1.y * h + i.col2.y * l,
		h = s,
		i = a.m_xf.R;
		var c = this.m_localAnchorB.x - a.m_sweep.localCenter.x,
		m = this.m_localAnchorB.y - a.m_sweep.localCenter.y;
		s = i.col1.x * c + i.col2.x * m,
		m = i.col1.y * c + i.col2.y * m,
		c = s;
		var _ = r.m_invMass,
		u = a.m_invMass,
		p = r.m_invI,
		y = a.m_invI,
		d = a.m_sweep.c.x + c - r.m_sweep.c.x - h,
		x = a.m_sweep.c.y + m - r.m_sweep.c.y - l,
		f = a.m_sweep.a - r.m_sweep.a - this.m_referenceAngle,
		g = 10 * t.b2_linearSlop,
		v = Math.sqrt(d * d + x * x),
		b = o.Abs(f);
		v > g && (p *= 1, y *= 1),
		this.m_mass.col1.x = _ + u + l * l * p + m * m * y,
		this.m_mass.col2.x = -l * h * p - m * c * y,
		this.m_mass.col3.x = -l * p - m * y,
		this.m_mass.col1.y = this.m_mass.col2.x,
		this.m_mass.col2.y = _ + u + h * h * p + c * c * y,
		this.m_mass.col3.y = h * p + c * y,
		this.m_mass.col1.z = this.m_mass.col3.x,
		this.m_mass.col2.z = this.m_mass.col3.y,
		this.m_mass.col3.z = p + y;
		var w = new n;
		return this.m_mass.Solve33(w, -d, -x, -f),
		r.m_sweep.c.x -= _ * w.x,
		r.m_sweep.c.y -= _ * w.y,
		r.m_sweep.a -= p * (h * w.y - l * w.x + w.z),
		a.m_sweep.c.x += u * w.x,
		a.m_sweep.c.y += u * w.y,
		a.m_sweep.a += y * (c * w.y - m * w.x + w.z),
		r.SynchronizeTransform(),
		a.SynchronizeTransform(),
		t.b2_linearSlop >= v && t.b2_angularSlop >= b
	},
	Box2D.inherit(I, Box2D.Dynamics.Joints.b2JointDef),
	I.prototype.__super = Box2D.Dynamics.Joints.b2JointDef.prototype,
	I.b2WeldJointDef = function () {
		Box2D.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments),
		this.localAnchorA = new s,
		this.localAnchorB = new s
	},
	I.prototype.b2WeldJointDef = function () {
		this.__super.b2JointDef.call(this),
		this.type = u.e_weldJoint,
		this.referenceAngle = 0
	},
	I.prototype.Initialize = function (t, e, i) {
		this.bodyA = t,
		this.bodyB = e,
		this.localAnchorA.SetV(this.bodyA.GetLocalPoint(i)),
		this.localAnchorB.SetV(this.bodyB.GetLocalPoint(i)),
		this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
	}
}
(), function () {
	var t = Box2D.Dynamics.b2DebugDraw;
	t.b2DebugDraw = function () {
		this.m_drawScale = 1,
		this.m_lineThickness = 1,
		this.m_alpha = 1,
		this.m_fillAlpha = 1,
		this.m_xformScale = 1;
		var t = this;
		this.m_sprite = {
			graphics : {
				clear : function () {},
				setTranslation : function (e, i) {
					t.m_ctx.translate(e, i)
				}
			}
		}
	},
	t.prototype._color = function (t, e) {
		return "rgba(" + ((t & 16711680) >> 16) + "," + ((t & 65280) >> 8) + "," + (t & 255) + "," + e + ")"
	},
	t.prototype.b2DebugDraw = function () {
		this.m_drawFlags = 0
	},
	t.prototype.SetFlags = function (t) {
		t === void 0 && (t = 0),
		this.m_drawFlags = t
	},
	t.prototype.GetFlags = function () {
		return this.m_drawFlags
	},
	t.prototype.AppendFlags = function (t) {
		t === void 0 && (t = 0),
		this.m_drawFlags |= t
	},
	t.prototype.ClearFlags = function (t) {
		t === void 0 && (t = 0),
		this.m_drawFlags &= ~t
	},
	t.prototype.SetSprite = function (t) {
		this.m_ctx = t
	},
	t.prototype.GetSprite = function () {
		return this.m_ctx
	},
	t.prototype.SetDrawScale = function (t) {
		t === void 0 && (t = 0),
		this.m_drawScale = t
	},
	t.prototype.GetDrawScale = function () {
		return this.m_drawScale
	},
	t.prototype.SetLineThickness = function (t) {
		t === void 0 && (t = 0),
		this.m_lineThickness = t,
		this.m_ctx.strokeWidth = t
	},
	t.prototype.GetLineThickness = function () {
		return this.m_lineThickness
	},
	t.prototype.SetAlpha = function (t) {
		t === void 0 && (t = 0),
		this.m_alpha = t
	},
	t.prototype.GetAlpha = function () {
		return this.m_alpha
	},
	t.prototype.SetFillAlpha = function (t) {
		t === void 0 && (t = 0),
		this.m_fillAlpha = t
	},
	t.prototype.GetFillAlpha = function () {
		return this.m_fillAlpha
	},
	t.prototype.SetXFormScale = function (t) {
		t === void 0 && (t = 0),
		this.m_xformScale = t
	},
	t.prototype.GetXFormScale = function () {
		return this.m_xformScale
	},
	t.prototype.DrawPolygon = function (t, e, i) {
		if (e) {
			var o = this.m_ctx,
			s = this.m_drawScale;
			o.beginPath(),
			o.strokeStyle = this._color(i.color, this.m_alpha),
			o.moveTo(t[0].x * s, t[0].y * s);
			for (var n = 1; e > n; n++)
				o.lineTo(t[n].x * s, t[n].y * s);
			o.lineTo(t[0].x * s, t[0].y * s),
			o.closePath(),
			o.stroke()
		}
	},
	t.prototype.DrawSolidPolygon = function (t, e, i) {
		if (e) {
			var o = this.m_ctx,
			s = this.m_drawScale;
			o.beginPath(),
			o.strokeStyle = this._color(i.color, this.m_alpha),
			o.fillStyle = this._color(i.color, this.m_fillAlpha),
			o.moveTo(t[0].x * s, t[0].y * s);
			for (var n = 1; e > n; n++)
				o.lineTo(t[n].x * s, t[n].y * s);
			o.lineTo(t[0].x * s, t[0].y * s),
			o.closePath(),
			o.fill(),
			o.stroke()
		}
	},
	t.prototype.DrawCircle = function (t, e, i) {
		if (e) {
			var o = this.m_ctx,
			s = this.m_drawScale;
			o.beginPath(),
			o.strokeStyle = this._color(i.color, this.m_alpha),
			o.arc(t.x * s, t.y * s, e * s, 0, Math.PI * 2, !0),
			o.closePath(),
			o.stroke()
		}
	},
	t.prototype.DrawSolidCircle = function (t, e, i, o) {
		if (e) {
			var s = this.m_ctx,
			n = this.m_drawScale,
			r = t.x * n,
			a = t.y * n;
			s.moveTo(0, 0),
			s.beginPath(),
			s.strokeStyle = this._color(o.color, this.m_alpha),
			s.fillStyle = this._color(o.color, this.m_fillAlpha),
			s.arc(r, a, e * n, 0, Math.PI * 2, !0),
			s.moveTo(r, a),
			s.lineTo((t.x + i.x * e) * n, (t.y + i.y * e) * n),
			s.closePath(),
			s.fill(),
			s.stroke()
		}
	},
	t.prototype.DrawSegment = function (t, e, i) {
		var o = this.m_ctx,
		s = this.m_drawScale;
		o.strokeStyle = this._color(i.color, this.m_alpha),
		o.beginPath(),
		o.moveTo(t.x * s, t.y * s),
		o.lineTo(e.x * s, e.y * s),
		o.closePath(),
		o.stroke()
	},
	t.prototype.DrawTransform = function (t) {
		var e = this.m_ctx,
		i = this.m_drawScale;
		e.beginPath(),
		e.strokeStyle = this._color(16711680, this.m_alpha),
		e.moveTo(t.position.x * i, t.position.y * i),
		e.lineTo((t.position.x + this.m_xformScale * t.R.col1.x) * i, (t.position.y + this.m_xformScale * t.R.col1.y) * i),
		e.strokeStyle = this._color(65280, this.m_alpha),
		e.moveTo(t.position.x * i, t.position.y * i),
		e.lineTo((t.position.x + this.m_xformScale * t.R.col2.x) * i, (t.position.y + this.m_xformScale * t.R.col2.y) * i),
		e.closePath(),
		e.stroke()
	}
}
();
var i;
for (i = 0; Box2D.postDefs.length > i; ++i)
	Box2D.postDefs[i]();
delete Box2D.postDefs, typeof window == "undefined" && (exports.Box2D = Box2D);
var IgeCocoonJsComponent = IgeEventingClass.extend({
		classId : "IgeCocoonJsComponent",
		componentId : "cocoonJs",
		init : function () {
			this.detected = typeof ext != "undefined" && ext.IDTK_APP !== void 0,
			this.detected && this.log("CocoonJS support enabled!")
		},
		showInputDialog : function (t, e, i, o, s, n) {
			this.detected ? (t = t || "", e = e || "", i = i || "", o = o || "text", s = s || "Cancel", n = n || "OK", ext.IDTK_APP.makeCall("showTextDialog", t, e, i, o, s, n)) : this.log("Cannot open CocoonJS input dialog! CocoonJS is not detected!", "error")
		},
		showWebView : function (t) {
			this.detected && (ext.IDTK_APP.makeCall("forward", "ext.IDTK_APP.makeCall('loadPath', '" + t + "')"), ext.IDTK_APP.makeCall("forward", "ext.IDTK_APP.makeCall('show');"))
		},
		hideWebView : function () {
			this.detected && ext.IDTK_APP.makeCall("forward", "ext.IDTK_APP.makeCall('hide');")
		}
	}), IgeUiPositionExtension = {
	left : function (t) {
		return t !== void 0 ? (this._uiX = t, this._uiXAlign = "left", this._updateUiPosition(), this) : this._uiX
	},
	center : function (t) {
		return t !== void 0 ? (this._uiX = t, this._uiXAlign = "center", this._updateUiPosition(), this) : this._uiX
	},
	right : function (t) {
		return t !== void 0 ? (this._uiX = t, this._uiXAlign = "right", this._updateUiPosition(), this) : this._uiX
	},
	top : function (t) {
		return t !== void 0 ? (this._uiY = t, this._uiYAlign = "top", this._updateUiPosition(), this) : this._uiY
	},
	middle : function (t) {
		return t !== void 0 ? (this._uiY = t, this._uiYAlign = "middle", this._updateUiPosition(), this) : this._uiY
	},
	bottom : function (t) {
		return t !== void 0 ? (this._uiY = t, this._uiYAlign = "bottom", this._updateUiPosition(), this) : this._uiY
	},
	width : function (t, e, i, o) {
		if (t !== void 0) {
			if (this._uiWidth = t, this._widthModifier = i !== void 0 ? i : 0, typeof t == "string")
				if (this._parent) {
					var s,
					n,
					r = this._parent._geometry.x,
					a = parseInt(t, 10);
					s = r / 100 * a + this._widthModifier | 0,
					e && (n = s / this._geometry.x, this.height(this._geometry.y / n, !1, 0, o)),
					this._width = s,
					this._geometry.x = s,
					this._geometry.x2 = Math.floor(this._geometry.x / 2)
				} else {
					var r = ige._geometry.x,
					a = parseInt(t, 10);
					this._geometry.x = r / 100 * a + this._widthModifier | 0,
					this._geometry.x2 = Math.floor(this._geometry.x / 2),
					this._width = this._geometry.x
				}
			else {
				if (e) {
					var n = t / this._geometry.x;
					this.height(this._geometry.y * n, !1, 0, o)
				}
				this._width = t,
				this._geometry.x = t,
				this._geometry.x2 = Math.floor(this._geometry.x / 2)
			}
			return o || this._updateUiPosition(),
			this
		}
		return this._width
	},
	height : function (t, e, i, o) {
		if (t !== void 0) {
			if (this._uiHeight = t, this._heightModifier = i !== void 0 ? i : 0, typeof t == "string")
				if (this._parent) {
					var s,
					n,
					r = this._parent._geometry.y,
					a = parseInt(t, 10);
					s = r / 100 * a + this._heightModifier | 0,
					e && (n = s / this._geometry.y, this.width(this._geometry.x / n, !1, 0, o)),
					this._height = s,
					this._geometry.y = s,
					this._geometry.y2 = Math.floor(this._geometry.y / 2)
				} else {
					var r = ige._geometry.y,
					a = parseInt(t, 10);
					this._geometry.y = r / 100 * a + this._heightModifier | 0,
					this._geometry.y2 = Math.floor(this._geometry.y / 2),
					this._height = this._geometry.y
				}
			else {
				if (e) {
					var n = t / this._geometry.y;
					this.width(this._geometry.x * n, !1, 0, o)
				}
				this._height = t,
				this._geometry.y = t,
				this._geometry.y2 = Math.floor(this._geometry.y / 2)
			}
			return o || this._updateUiPosition(),
			this
		}
		return this._height
	},
	autoScaleX : function (t, e) {
		return t !== void 0 ? (this._autoScaleX = t, this._autoScaleLockAspect = e, this._updateUiPosition(), this) : this._autoScaleX
	},
	autoScaleY : function (t, e) {
		return t !== void 0 ? (this._autoScaleY = t, this._autoScaleLockAspect = e, this._updateUiPosition(), this) : this._autoScaleY
	},
	_updateUiPosition : function () {
		if (this._parent) {
			var t,
			e,
			i,
			o = this._parent._geometry,
			s = this._geometry.multiplyPoint(this._scale);
			this._autoScaleX && (t = parseInt(this._autoScaleX, 10), e = o.x / 100 * t, i = e / this._geometry.x, this._scale.x = i, this._autoScaleLockAspect && (this._scale.y = i)),
			this._autoScaleY && (t = parseInt(this._autoScaleY, 10), e = o.y / 100 * t, i = e / this._geometry.y, this._scale.y = i, this._autoScaleLockAspect && (this._scale.x = i)),
			this._uiWidth && this.width(this._uiWidth, !1, this._widthModifier, !0),
			this._uiHeight && this.height(this._uiHeight, !1, this._heightModifier, !0),
			this._uiXAlign === "right" ? this._translate.x = Math.floor(o.x2 - s.x2 - this._uiX) : this._uiXAlign === "center" ? this._translate.x = Math.floor(this._uiX) : this._uiXAlign === "left" && (this._translate.x = Math.floor(this._uiX + s.x2 - o.x2)),
			this._uiYAlign === "bottom" ? this._translate.y = Math.floor(o.y2 - s.y2 - this._uiY) : this._uiYAlign === "middle" ? this._translate.y = Math.floor(this._uiY) : this._uiYAlign === "top" && (this._translate.y = Math.floor(this._uiY + s.y2 - o.y2)),
			this.dirty(!0)
		}
	}
};
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeUiPositionExtension);
var IgeUiStyleExtension = {
	backgroundImage : function (t, e) {
		if (t && t.image) {
			if (e || (e = "no-repeat"), this._patternRepeat = e, this._patternTexture = t, this._backgroundSize ? (t.resize(this._backgroundSize.x, this._backgroundSize.y), this._patternWidth = this._backgroundSize.x, this._patternHeight = this._backgroundSize.y) : (this._patternWidth = t.image.width, this._patternHeight = t.image.height), this._cell > 1) {
				var i = document.createElement("canvas"),
				o = i.getContext("2d"),
				s = t._cells[this._cell];
				i.width = s[2],
				i.height = s[3],
				o.drawImage(t.image, s[0], s[1], s[2], s[3], 0, 0, s[2], s[3]),
				this._patternFill = ige._ctx.createPattern(i, e)
			} else
				this._patternFill = ige._ctx.createPattern(t.image, e);
			return t.restoreOriginal(),
			this.dirty(!0),
			this
		}
		return this._patternFill
	},
	backgroundSize : function (t, e) {
		return t !== void 0 && e !== void 0 ? (typeof t == "string" && (t = this._geometry.x / 100 * parseInt(t, 10)), typeof e == "string" && (e = this._geometry.y / 100 * parseInt(e, 10)), this._backgroundSize = {
				x : t,
				y : e
			}, this._patternTexture && this._patternRepeat && this.backgroundImage(this._patternTexture, this._patternRepeat), this.dirty(!0), this) : this._backgroundSize
	},
	backgroundColor : function (t) {
		return t !== void 0 ? (this._backgroundColor = t, this.dirty(!0), this) : this._backgroundColor
	},
	backgroundPosition : function (t, e) {
		return t !== void 0 && e !== void 0 ? (this._backgroundPosition = {
				x : t,
				y : e
			}, this.dirty(!0), this) : this._backgroundPosition
	},
	borderColor : function (t) {
		return t !== void 0 ? (this._borderColor = t, this._borderLeftColor = t, this._borderTopColor = t, this._borderRightColor = t, this._borderBottomColor = t, this.dirty(!0), this) : this._borderColor
	},
	borderLeftColor : function (t) {
		return t !== void 0 ? (this._borderLeftColor = t, this.dirty(!0), this) : this._borderLeftColor
	},
	borderTopColor : function (t) {
		return t !== void 0 ? (this._borderTopColor = t, this.dirty(!0), this) : this._borderTopColor
	},
	borderRightColor : function (t) {
		return t !== void 0 ? (this._borderRightColor = t, this.dirty(!0), this) : this._borderRightColor
	},
	borderBottomColor : function (t) {
		return t !== void 0 ? (this._borderBottomColor = t, this.dirty(!0), this) : this._borderBottomColor
	},
	borderWidth : function (t) {
		return t !== void 0 ? (this._borderWidth = t, this._borderLeftWidth = t, this._borderTopWidth = t, this._borderRightWidth = t, this._borderBottomWidth = t, this.dirty(!0), this) : this._borderWidth
	},
	borderLeftWidth : function (t) {
		return t !== void 0 ? (this._borderLeftWidth = t, this.dirty(!0), this) : this._borderLeftWidth
	},
	borderTopWidth : function (t) {
		return t !== void 0 ? (this._borderTopWidth = t, this.dirty(!0), this) : this._borderTopWidth
	},
	borderRightWidth : function (t) {
		return t !== void 0 ? (this._borderRightWidth = t, this.dirty(!0), this) : this._borderRightWidth
	},
	borderBottomWidth : function (t) {
		return t !== void 0 ? (this._borderBottomWidth = t, this.dirty(!0), this) : this._borderBottomWidth
	},
	borderRadius : function (t) {
		return t !== void 0 ? (this._borderRadius = t, this._borderTopLeftRadius = t, this._borderTopRightRadius = t, this._borderBottomRightRadius = t, this._borderBottomLeftRadius = t, this.dirty(!0), this) : this._borderRadius
	},
	padding : function (t, e, i, o) {
		return this._paddingLeft = t,
		this._paddingTop = e,
		this._paddingRight = i,
		this._paddingBottom = o,
		this.dirty(!0),
		this
	},
	paddingLeft : function (t) {
		return t !== void 0 ? (this._paddingLeft = t, this.dirty(!0), this) : this._paddingLeft
	},
	paddingTop : function (t) {
		return t !== void 0 ? (this._paddingTop = t, this.dirty(!0), this) : this._paddingTop
	},
	paddingRight : function (t) {
		return t !== void 0 ? (this._paddingRight = t, this.dirty(!0), this) : this._paddingRight
	},
	paddingBottom : function (t) {
		return t !== void 0 ? (this._paddingBottom = t, this.dirty(!0), this) : this._paddingBottom
	}
};
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeUiStyleExtension);
var nullMethod = function () {}, IgeDummyContext = {
	dummy : !0,
	save : nullMethod,
	restore : nullMethod,
	translate : nullMethod,
	rotate : nullMethod,
	scale : nullMethod,
	drawImage : nullMethod,
	fillRect : nullMethod,
	strokeRect : nullMethod,
	stroke : nullMethod,
	fill : nullMethod,
	rect : nullMethod,
	moveTo : nullMethod,
	lineTo : nullMethod,
	arc : nullMethod,
	clearRect : nullMethod,
	beginPath : nullMethod,
	clip : nullMethod,
	transform : nullMethod,
	setTransform : nullMethod,
	fillText : nullMethod
};
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeDummyContext);
var IgePathNode = IgePoint.extend({
		classId : "IgePathNode",
		init : function (t, e, i, o, s, n, r) {
			this.z = 0,
			this.x = t,
			this.y = e,
			this.g = i + o,
			this.h = s,
			this.moveCost = o,
			this.f = i + s,
			this.link = n,
			this.hash = t + "," + e,
			this.listType = 0,
			this.direction = r
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgePathNode);
var IgePathFinder = IgeEventingClass.extend({
		classId : "IgePathFinder",
		init : function () {
			this._neighbourLimit = 1e3,
			this._squareCost = 10,
			this._diagonalCost = 10
		},
		squareCost : function (t) {
			return t !== void 0 ? (this._squareCost = t, this) : this._squareCost
		},
		diagonalCost : function (t) {
			return t !== void 0 ? (this._diagonalCost = t, this) : this._diagonalCost
		},
		neighbourLimit : function (t) {
			return t !== void 0 ? (this._neighbourLimit = t, this) : this._neighbourLimit
		},
		aStar : function (t, e, i, o, s, n, r) {
			var a,
			h,
			l,
			c,
			m,
			_,
			u,
			p,
			y,
			d,
			x,
			f,
			g,
			v = [],
			b = [],
			w = {};
			if (s === void 0 && (s = !0), n === void 0 && (n = !1), x = t.map._mapData, d = x[i.y] && x[i.y][i.x] ? x[i.y][i.x] : null, !r && !o(d, i.x, i.y))
				return this.emit("noPathFound"), [];
			a = new IgePathNode(e.x, e.y, 0, 0, this._heuristic(e.x, e.y, i.x, i.y, 10)),
			a.link = 1,
			v.push(a),
			w[a.hash] = a,
			a.listType = 1,
			g = a;
			while (v.length) {
				if (v.length > this._neighbourLimit) {
					this.emit("exceededLimit");
					break
				}
				h = 0,
				l = v.length;
				while (l--)
					v[h].f > v[l].f && (h = l);
				if (c = v[h], c.x === i.x && c.y === i.y) {
					m = c,
					_ = [];
					while (m.link)
						_.push(m), m = m.link;
					return this.emit("pathFound", _),
					_.reverse()
				}
				v.splice(h, 1),
				b.push(c),
				c.listType = -1,
				u = this._getNeighbours(c, i, t, o, s, n),
				p = u.length;
				while (p--)
					y = u[p], f = w[y.hash], f && f.listType === -1 || (f && f.listType === 1 ? f.g > y.g && (f.link = y.link, f.g = y.g, f.f = y.f) : (v.push(y), w[y.hash] = y, y.listType = 1, f = y)), (!g || g.h > f.h) && (g = f)
			}
			if (!r || r && !g)
				return this.emit("noPathFound"), [];
			m = g,
			_ = [];
			while (m.link)
				_.push(m), m = m.link;
			return _ = _.reverse(),
			this.emit("pathFound", _),
			_
		},
		_getNeighbours : function (t, e, i, o, s, n) {
			var r,
			a,
			h = [],
			l = t.x,
			c = t.y,
			m = 0,
			_ = 0,
			u = i.map._mapData,
			p = u[c] && u[c][l] ? u[c][l] : void 0;
			return s && (m = l - 1, _ = c, a = u[_] && u[_][m] ? u[_][m] : null, o(a, m, _, p, l, c) && (r = new IgePathNode(m, _, t.g, this._squareCost, this._heuristic(m, _, e.x, e.y, this._squareCost), t, "W"), h.push(r)), m = l + 1, _ = c, a = u[_] && u[_][m] ? u[_][m] : null, o(a, m, _, p, l, c) && (r = new IgePathNode(m, _, t.g, this._squareCost, this._heuristic(m, _, e.x, e.y, this._squareCost), t, "E"), h.push(r)), m = l, _ = c - 1, a = u[_] && u[_][m] ? u[_][m] : null, o(a, m, _, p, l, c) && (r = new IgePathNode(m, _, t.g, this._squareCost, this._heuristic(m, _, e.x, e.y, this._squareCost), t, "N"), h.push(r)), m = l, _ = c + 1, a = u[_] && u[_][m] ? u[_][m] : null, o(a, m, _, p, l, c) && (r = new IgePathNode(m, _, t.g, this._squareCost, this._heuristic(m, _, e.x, e.y, this._squareCost), t, "S"), h.push(r))),
			n && (m = l - 1, _ = c - 1, a = u[_] && u[_][m] ? u[_][m] : null, o(a, m, _, p, l, c) && (r = new IgePathNode(m, _, t.g, this._diagonalCost, this._heuristic(m, _, e.x, e.y, this._diagonalCost), t, "NW"), h.push(r)), m = l + 1, _ = c - 1, a = u[_] && u[_][m] ? u[_][m] : null, o(a, m, _, p, l, c) && (r = new IgePathNode(m, _, t.g, this._diagonalCost, this._heuristic(m, _, e.x, e.y, this._diagonalCost), t, "NE"), h.push(r)), m = l - 1, _ = c + 1, a = u[_] && u[_][m] ? u[_][m] : null, o(a, m, _, p, l, c) && (r = new IgePathNode(m, _, t.g, this._diagonalCost, this._heuristic(m, _, e.x, e.y, this._diagonalCost), t, "SW"), h.push(r)), m = l + 1, _ = c + 1, a = u[_] && u[_][m] ? u[_][m] : null, o(a, m, _, p, l, c) && (r = new IgePathNode(m, _, t.g, this._diagonalCost, this._heuristic(m, _, e.x, e.y, this._diagonalCost), t, "SE"), h.push(r))),
			h
		},
		_heuristic : function (t, e, i, o, s) {
			return s * (Math.abs(t - i) + Math.abs(e - o))
		},
		as : function (t, e) {
			var i = [];
			i.push(e)
		},
		_as : function () {}
		
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgePathFinder);
var IgeTween = IgeClass.extend({
		classId : "IgeTween",
		init : function (t, e, i, o) {
			this._targetObj = t,
			this._steps = [],
			this._currentStep = -1,
			e !== void 0 && this.stepTo(e),
			this._durationMs = i !== void 0 ? i : 0,
			this._started = !1,
			this._stepDirection = !1,
			o && o.easing ? this.easing(o.easing) : this.easing("none"),
			o && o.startTime !== void 0 && this.startTime(o.startTime),
			o && o.beforeTween !== void 0 && this.beforeTween(o.beforeTween),
			o && o.afterTween !== void 0 && this.afterTween(o.afterTween)
		},
		targetObj : function (t) {
			return t !== void 0 && (this._targetObj = t),
			this
		},
		properties : function (t) {
			return t !== void 0 && (this._steps = [], this._currentStep = -1, this.stepTo(t)),
			this
		},
		repeatMode : function (t, e) {
			return t !== void 0 ? (this._repeatMode = t, this.repeatCount(e), this) : this._repeatMode
		},
		repeatCount : function (t) {
			return t !== void 0 ? (this._repeatCount = t, this._repeatedCount = 0, this) : this._repeatCount
		},
		step : function (t, e, i) {
			return this.log("The step method has been renamed to stepTo(). Please update your code as the step() method will soon be removed.", "warning"),
			this.stepTo(t, e, i),
			this
		},
		stepTo : function (t, e, i, o) {
			return t !== void 0 && this._steps.push({
				props : t,
				durationMs : e,
				easing : i,
				isDelta : o
			}),
			this
		},
		stepBy : function (t, e, i) {
			return this.stepTo(t, e, i, !0),
			this
		},
		duration : function (t) {
			return t !== void 0 && (this._durationMs = t),
			this
		},
		beforeTween : function (t) {
			return t !== void 0 && (this._beforeTween = t),
			this
		},
		afterTween : function (t) {
			return t !== void 0 && (this._afterTween = t),
			this
		},
		beforeStep : function (t) {
			return t !== void 0 && (this._beforeStep = t),
			this
		},
		afterStep : function (t) {
			return t !== void 0 && (this._afterStep = t),
			this
		},
		easing : function (t) {
			return t !== void 0 && (this._easing = t),
			this
		},
		startTime : function (t) {
			return t !== void 0 && (this._startTime = t),
			this
		},
		start : function (t) {
			return t !== void 0 && this.startTime(t + ige._currentTime),
			ige.tween.start(this),
			this._targetObj._tweenArr = this._targetObj._tweenArr || [],
			this._targetObj._tweenArr.push(this),
			this
		},
		stop : function () {
			return ige.tween.stop(this),
			this._targetObj._tweenArr && this._targetObj._tweenArr.pull(this),
			this
		},
		startAll : function () {
			return this._targetObj._tweenArr && this._targetObj._tweenArr.eachReverse(function (t) {
				t.start()
			}),
			this
		},
		stopAll : function () {
			return this._targetObj._tweenArr && this._targetObj._tweenArr.eachReverse(function (t) {
				t.stop()
			}),
			this
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeTween);
var IgeTexture = IgeEventingClass.extend({
		classId : "IgeTexture",
		IgeTexture : !0,
		init : function (t) {
			this._cells = [],
			this._smoothing = ige._globalSmoothing;
			var e = typeof t;
			e === "string" && t && this.url(t),
			e === "object" && this.assignSmartTextureImage(t)
		},
		id : function (t) {
			if (t !== void 0) {
				if (!ige._register[t])
					return this._id && ige._register[this._id] && ige.unRegister(this), this._id = t, ige.register(this), this;
				this.log('Cannot set ID of object to "' + t + '" because that ID is already in use by another object!', "error")
			}
			return this._id || (this._id = this._url ? ige.newIdFromString(this._url) : ige.newIdHex(), ige.register(this)),
			this._id
		},
		url : function (t) {
			return t !== void 0 ? (this._url = t, t.substr(t.length - 2, 2) === "js" ? this._loadScript(t) : this._loadImage(t), this) : this._url
		},
		_loadImage : function (t) {
			var e,
			i = this;
			ige.isServer || (ige.textureLoadStart(t, this), ige._textureImageStore[t] ? (e = this.image = this._originalImage = ige._textureImageStore[t], e._igeTextures.push(this), e._loaded && (i._mode = 0, i.sizeX(e.width), i.sizeY(e.height), e.width % 2 && this.log("This texture's width is not divisible by 2 which will cause the texture to use sub-pixel rendering resulting in a blurred image. This may also slow down the renderer on some browsers. Image file: " + this._url, "warning"), e.height % 2 && this.log("This texture's height is not divisible by 2 which will cause the texture to use sub-pixel rendering resulting in a blurred image. This may also slow down the renderer on some browsers. Image file: " + this._url, "warning"), i._cells[1] = [0, 0, i._sizeX, i._sizeY], i._loaded = !0, setTimeout(function () {
							i.emit("loaded"),
							ige.textureLoadEnd(t, i)
						}, 1))) : (e = ige._textureImageStore[t] = this.image = this._originalImage = new Image, e._igeTextures = e._igeTextures || [], e._igeTextures.push(this), e.onload = function () {
					e._loaded = !0,
					ige.log("Texture image (" + t + ") loaded successfully"),
					e.width % 2 && i.log("The texture " + t + " width (" + e.width + ") is not divisible by 2 to a whole number! This can cause rendering artifacts. It can also cause performance issues on some GPUs. Please make sure your texture width is divisible by 2!", "warning"),
					e.height % 2 && i.log("The texture " + t + " height (" + e.height + ") is not divisible by 2 to a whole number! This can cause rendering artifacts. It can also cause performance issues on some GPUs. Please make sure your texture height is divisible by 2!", "warning");
					var o,
					s,
					n = e._igeTextures,
					r = n.length;
					for (o = 0; r > o; o++)
						s = n[o], s._mode = 0, s.sizeX(e.width), s.sizeY(e.height), s._cells[1] = [0, 0, s._sizeX, s._sizeY], s._loaded = !0, s.emit("loaded"), ige.textureLoadEnd(t, i)
				}, e.src = t))
		},
		_loadScript : function (scriptUrl) {
			var textures = ige.textures,
			rs_sandboxContext,
			self = this,
			scriptElem;
			ige.textureLoadStart(scriptUrl, this),
			ige.isServer || (scriptElem = document.createElement("script"), scriptElem.onload = function (data) {
				self.log('Texture script "' + scriptUrl + '" loaded successfully'),
				eval(data),
				self._mode = 1,
				self.script = image,
				typeof image.init == "function" && image.init.apply(image, [self]),
				self._loaded = !0,
				self.emit("loaded"),
				ige.textureLoadEnd(scriptUrl, self)
			}, scriptElem.addEventListener("error", function () {
					self.log("Error loading smart texture script file: " + scriptUrl, "error")
				}, !0), scriptElem.src = scriptUrl, document.getElementsByTagName("head")[0].appendChild(scriptElem))
		},
		assignSmartTextureImage : function (t) {
			var e = (ige.textures, this);
			e._mode = 1,
			e.script = t,
			typeof t.init == "function" && t.init.apply(t, [e]),
			e._loaded = !0,
			e.emit("loaded")
		},
		_setImage : function (t) {
			var e;
			ige.isServer || (e = this.image = this._originalImage = t, e._igeTextures = e._igeTextures || [], e._loaded = !0, this._mode = 0, this.sizeX(e.width), this.sizeY(e.height), this._cells[1] = [0, 0, this._sizeX, this._sizeY])
		},
		textureFromCell : function (t) {
			var e = new IgeTexture,
			i = this;
			return this._loaded ? this._textureFromCell(e, t) : this.on("loaded", function () {
				i._textureFromCell(e, t)
			}),
			e
		},
		_textureFromCell : function (t, e) {
			var i,
			o,
			s,
			n;
			i = typeof e == "string" ? this.cellIdToIndex(e) : e,
			this._cells[i] ? (o = this._cells[i], s = document.createElement("canvas"), n = s.getContext("2d"), this._smoothing ? (n.imageSmoothingEnabled = !0, n.webkitImageSmoothingEnabled = !0, n.mozImageSmoothingEnabled = !0) : (n.imageSmoothingEnabled = !1, n.webkitImageSmoothingEnabled = !1, n.mozImageSmoothingEnabled = !1), s.width = o[2], s.height = o[3], n.drawImage(this._originalImage, o[0], o[1], o[2], o[3], 0, 0, o[2], o[3]), t._setImage(s), t._loaded = !0, setTimeout(function () {
					t.emit("loaded")
				}, 1)) : this.log("Unable to create new texture from passed cell index (" + e + ") because the cell does not exist!", "warning")
		},
		sizeX : function (t) {
			this._sizeX = t
		},
		sizeY : function (t) {
			this._sizeY = t
		},
		resize : function (t, e, i) {
			this._originalImage && (this._loaded ? (this._textureCtx || (this._textureCanvas = document.createElement("canvas")), this._textureCanvas.width = t, this._textureCanvas.height = e, this._textureCtx = this._textureCanvas.getContext("2d"), this._smoothing ? (this._textureCtx.imageSmoothingEnabled = !0, this._textureCtx.webkitImageSmoothingEnabled = !0, this._textureCtx.mozImageSmoothingEnabled = !0) : (this._textureCtx.imageSmoothingEnabled = !1, this._textureCtx.webkitImageSmoothingEnabled = !1, this._textureCtx.mozImageSmoothingEnabled = !1), i || this._textureCtx.drawImage(this._originalImage, 0, 0, this._originalImage.width, this._originalImage.height, 0, 0, t, e), this.image = this._textureCanvas) : this.log("Cannot resize texture because the texture image (" + this._url + ") has not loaded into memory yet!", "error"))
		},
		resizeByPercent : function (t, e, i) {
			this._originalImage && (this._loaded ? (t = Math.floor(this.image.width / 100 * t), e = Math.floor(this.image.height / 100 * e), this._textureCtx || (this._textureCanvas = document.createElement("canvas")), this._textureCanvas.width = t, this._textureCanvas.height = e, this._textureCtx = this._textureCanvas.getContext("2d"), this._smoothing ? (this._textureCtx.imageSmoothingEnabled = !0, this._textureCtx.webkitImageSmoothingEnabled = !0, this._textureCtx.mozImageSmoothingEnabled = !0) : (this._textureCtx.imageSmoothingEnabled = !1, this._textureCtx.webkitImageSmoothingEnabled = !1, this._textureCtx.mozImageSmoothingEnabled = !1), i || this._textureCtx.drawImage(this._originalImage, 0, 0, this._originalImage.width, this._originalImage.height, 0, 0, t, e), this.image = this._textureCanvas) : this.log("Cannot resize texture because the texture image (" + this._url + ") has not loaded into memory yet!", "error"))
		},
		restoreOriginal : function () {
			this.image = this._originalImage,
			delete this._textureCtx,
			delete this._textureCanvas
		},
		smoothing : function (t) {
			return t !== void 0 ? (this._smoothing = t, this) : this._smoothing
		},
		render : function (t, e) {
			if (e._cell !== null) {
				if (this._smoothing ? (ige._ctx.imageSmoothingEnabled = !0, ige._ctx.webkitImageSmoothingEnabled = !0, ige._ctx.mozImageSmoothingEnabled = !0) : (ige._ctx.imageSmoothingEnabled = !1, ige._ctx.webkitImageSmoothingEnabled = !1, ige._ctx.mozImageSmoothingEnabled = !1), this._mode === 0) {
					var i = this._cells[e._cell],
					o = e._geometry,
					s = e._renderPos;
					i ? (this._preFilter && this._textureCtx && (this._textureCtx.save(), this._preFilter(this._textureCanvas, this._textureCtx, this._originalImage, this, this._preFilterData), this._textureCtx.restore()), t.drawImage(this.image, i[0], i[1], i[2], i[3], s.x, s.y, o.x, o.y), ige._drawCount++) : this.log("Cannot render texture using cell " + e._cell + " because the cell does not exist in the assigned texture!", "error")
				}
				this._mode === 1 && (t.save(), this.script.render(t, e, this), t.restore(), ige._drawCount++)
			}
		},
		preFilter : function (t, e) {
			return t !== void 0 ? (this._originalImage && (this._textureCtx || (this._textureCanvas = document.createElement("canvas"), this._textureCanvas.width = this._originalImage.width, this._textureCanvas.height = this._originalImage.height, this._textureCtx = this._textureCanvas.getContext("2d"), this._smoothing ? (this._textureCtx.imageSmoothingEnabled = !0, this._textureCtx.webkitImageSmoothingEnabled = !0, this._textureCtx.mozImageSmoothingEnabled = !0) : (this._textureCtx.imageSmoothingEnabled = !1, this._textureCtx.webkitImageSmoothingEnabled = !1, this._textureCtx.mozImageSmoothingEnabled = !1)), this.image = this._textureCanvas, this._preFilter = t, this._preFilterData = e), this) : (this.log("Cannot use pre-filter, no filter method was passed!", "warning"), this._preFilter)
		},
		applyFilter : function (t, e) {
			return this._loaded ? t !== void 0 ? this._originalImage && (this._textureCtx || (this._textureCanvas = document.createElement("canvas"), this._textureCanvas.width = this._originalImage.width, this._textureCanvas.height = this._originalImage.height, this._textureCtx = this._textureCanvas.getContext("2d"), this._smoothing ? (this._textureCtx.imageSmoothingEnabled = !0, this._textureCtx.webkitImageSmoothingEnabled = !0, this._textureCtx.mozImageSmoothingEnabled = !0) : (this._textureCtx.imageSmoothingEnabled = !1, this._textureCtx.webkitImageSmoothingEnabled = !1, this._textureCtx.mozImageSmoothingEnabled = !1)), this.image = this._textureCanvas, this._textureCtx.save(), t(this._textureCanvas, this._textureCtx, this._originalImage, this, e), this._textureCtx.restore()) : this.log("Cannot apply filter, no filter method was passed!", "warning") : this.log("Cannot apply filter, the texture you are trying to apply the filter to has not yet loaded!", "error"),
			this
		},
		stringify : function () {
			var t = "new " + this.classId() + "('" + this._url + "')";
			return t += ".id('" + this.id() + "')",
			t += this._stringify()
		},
		destroy : function () {
			delete this._eventListeners,
			this.image && this.image._igeTextures && this.image._igeTextures.pull(this),
			ige._textureStore.pull(this),
			delete this.image,
			delete this.script,
			delete this._textureCanvas,
			delete this._textureCtx,
			this._destroyed = !0
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeTexture);
var IgeCellSheet = IgeTexture.extend({
		classId : "IgeCellSheet",
		IgeSpriteSheet : !0,
		init : function (t, e, i) {
			var o = this;
			o.horizontalCells(e || 1),
			o.verticalCells(i || 1),
			this.on("loaded", function () {
				o.image ? (o._sheetImage = this.image, o._applyCells()) : o.log("Cannot create cell-sheet because texture has not loaded an image!", "error")
			}),
			this._super(t)
		},
		cellCount : function () {
			return this.horizontalCells() * this.verticalCells()
		},
		horizontalCells : function (t) {
			return t !== void 0 ? (this._cellColumns = t, this) : this._cellColumns
		},
		verticalCells : function (t) {
			return t !== void 0 ? (this._cellRows = t, this) : this._cellRows
		},
		_applyCells : function () {
			var t,
			e,
			i,
			o,
			s,
			n,
			r,
			a,
			h;
			if (this.image && this._cellRows && this._cellColumns)
				if (t = this._sizeX, e = this._sizeY, i = this._cellRows, o = this._cellColumns, s = this._cellWidth = t / o, n = this._cellHeight = e / i, s !== parseInt(s, 10) && this.log("Cell width is a floating-point number! (Image Width " + t + " / Number of Columns " + o + " = " + s + ") in file: " + this._url, "warning"), n !== parseInt(n, 10) && this.log("Cell height is a floating-point number! (Image Height " + e + " / Number of Rows " + i + " = " + n + ")  in file: " + this._url, "warning"), i > 1 || o > 1)
					for (r = 1; i * o >= r; r++)
						h = Math.ceil(r / o) - 1, a = r - o * h - 1, this._cells[r] = [a * s, h * n, s, n];
				else
					this._cells[1] = [0, 0, this._sizeX, this._sizeY]
		},
		stringify : function () {
			var t = "new " + this.classId() + "('" + this.url() + "', " + this.horizontalCells() + ", " + this.verticalCells() + ")";
			return t += ".id('" + this.id() + "');"
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeTexture);
var IgeSpriteSheet = IgeTexture.extend({
		classId : "IgeSpriteSheet",
		IgeSpriteSheet : !0,
		init : function (t, e) {
			var i = this;
			this.on("loaded", function () {
				if (i.image) {
					i._sheetImage = this.image;
					var t;
					for (e || (this.log("No cell data provided for sprite sheet, attempting to automatically detect sprite bounds..."), e = this.detectCells(this._sheetImage)), t = 0; e.length > t; t++)
						i._cells[t + 1] = e[t], this._checkModulus && (e[t][2] % 2 && this.log("This texture's cell definition defines a cell width is not divisible by 2 which can cause the texture to use sub-pixel rendering resulting in a blurred image. This may also slow down the renderer on some browsers. Image file: " + this._url, "warning", e[t]), e[t][3] % 2 && this.log("This texture's cell definition defines a cell height is not divisible by 2 which can cause the texture to use sub-pixel rendering resulting in a blurred image. This may also slow down the renderer on some browsers. Image file: " + this._url, "warning", e[t]))
				} else
					i.log("Cannot create cell-sheet because texture has not loaded an image!", "error")
			}),
			this._super(t)
		},
		detectCells : function (t) {
			var e,
			i,
			o,
			s,
			n = document.createElement("canvas"),
			r = n.getContext("2d"),
			a = [];
			for (n.width = t.width, n.height = t.height, r.drawImage(t, 0, 0), e = r.getImageData(0, 0, n.width, n.height), o = 0; n.height > o; o++)
				for (i = 0; n.width > i; i++)
					if (!e.isTransparent(i, o) && !this._pixelInRects(a, i, o)) {
						if (s = this._determineRect(e, i, o), !s)
							return this.log("Cannot automatically determine sprite bounds!", "warning"), [];
						a.push(s)
					}
			return a
		},
		_pixelInRects : function (t, e, i) {
			var o,
			s,
			n = t.length;
			for (o = 0; n > o; o++)
				if (s = t[o], !(s.x > e || e > s.x + s.width || s.y > i || i > s.y + s.height))
					return !0;
			return !1
		},
		_determineRect : function (t, e, i) {
			var o,
			s = [{
					x : e,
					y : i
				}
			],
			n = {
				x : e,
				y : i,
				width : 1,
				height : 1
			};
			while (s.length)
				o = s.shift(), o.x > n.x + n.width && (n.width = o.x - n.x + 1), o.y > n.y + n.height && (n.height = o.y - n.y + 1), n.x > o.x && (n.width += n.x - o.x, n.x = o.x), n.y > o.y && (n.height += n.y - o.y, n.y = o.y), t.isTransparent(o.x - 1, o.y - 1) || (t.makeTransparent(o.x - 1, o.y - 1), s.push({
						x : o.x - 1,
						y : o.y - 1
					})), t.isTransparent(o.x, o.y - 1) || (t.makeTransparent(o.x, o.y - 1), s.push({
						x : o.x,
						y : o.y - 1
					})), t.isTransparent(o.x + 1, o.y - 1) || (t.makeTransparent(o.x + 1, o.y - 1), s.push({
						x : o.x + 1,
						y : o.y - 1
					})), t.isTransparent(o.x - 1, o.y) || (t.makeTransparent(o.x - 1, o.y), s.push({
						x : o.x - 1,
						y : o.y
					})), t.isTransparent(o.x + 1, o.y) || (t.makeTransparent(o.x + 1, o.y), s.push({
						x : o.x + 1,
						y : o.y
					})), t.isTransparent(o.x - 1, o.y + 1) || (t.makeTransparent(o.x - 1, o.y + 1), s.push({
						x : o.x - 1,
						y : o.y + 1
					})), t.isTransparent(o.x, o.y + 1) || (t.makeTransparent(o.x, o.y + 1), s.push({
						x : o.x,
						y : o.y + 1
					})), t.isTransparent(o.x + 1, o.y + 1) || (t.makeTransparent(o.x + 1, o.y + 1), s.push({
						x : o.x + 1,
						y : o.y + 1
					}));
			return [n.x, n.y, n.width, n.height]
		},
		cellCount : function () {
			return this._cells.length
		},
		cellIdToIndex : function (t) {
			var e,
			i = this._cells;
			for (e = 1; i.length > e; e++)
				if (i[e][4] === t)
					return e;
			return -1
		},
		stringify : function () {
			var t = "new " + this.classId() + "('" + this.url() + "', " + (this._cells + "") + ")";
			return t += ".id('" + this.id() + "');"
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeSpriteSheet);
var IgeFontSheet = IgeTexture.extend({
		classId : "IgeFontSheet",
		init : function (t) {
			this._super(t),
			arguments[1] && this.log("Font sheets no longer accept a caching limit value. All font output is now cached by default via the actual font entity - fontEntity.cache(true);", "warning"),
			this._noDimensions = !0,
			this.on("loaded", function () {
				if (this.image)
					if (this._sheetImage = this.image, this._fontData = this.decodeHeader(), this._charCodeMap = this._fontData.characters.charCodes, this._charPosMap = this._fontData.characters.charPosition, this._measuredWidthMap = this._fontData.characters.measuredWidth, this._pixelWidthMap = this._fontData.characters.pixelWidth, this._fontData) {
						var t = this._fontData.font;
						this.log("Loaded font sheet for font: " + t.fontName + " @ " + t.fontSize + t.fontSizeUnit + " in " + t.fontColor)
					} else
						this.log("Could not load data header for font sheet: " + this.image.src, "error")
			})
		},
		decodeHeader : function () {
			var t = document.createElement("canvas"),
			e = t.getContext("2d");
			return t.width = this.image.width,
			t.height = 1,
			e.drawImage(this.image, 0, 0),
			this._decode(t, 0, 0, this.image.width)
		},
		_decode : function (t, e, i, o) {
			"use strict";
			var s,
			n = t.getContext("2d"),
			r = n.getImageData(e, i, o, t.height).data,
			a = !0,
			h = 0,
			l = "";
			while (a) {
				if (s = r[h] + "" + " " + (r[h + 1] + "") + " " + (r[h + 2] + ""), s === "3 2 1")
					return a = !1, JSON.parse(l);
				l += String.fromCharCode(r[h]) + String.fromCharCode(r[h + 1]) + String.fromCharCode(r[h + 2]),
				h += 4,
				h > r.length && (a = !1, console.log("Image JSON Decode Error!"))
			}
		},
		lineHeightModifier : function (t) {
			t !== void 0 && (this._lineHeightModifier = t)
		},
		render : function (t, e) {
			if (e._text && this._loaded) {
				var i,
				o,
				s,
				n,
				r,
				a = t,
				h = e._text,
				l = [],
				c = this._charCodeMap,
				m = this._charPosMap,
				_ = this._measuredWidthMap,
				u = this._pixelWidthMap,
				p = 0,
				y = 0,
				d = 0,
				x = 0,
				f = 0,
				g = 0,
				v = [],
				b = this._sizeY - 2,
				w = 0,
				C = 0;
				switch (h.indexOf("\n") > -1 ? l = h.split("\n") : l.push(h), n = b * l.length, e._textAlignY) {
				case 0:
					x =  - (b * l.length / 2) - e._textLineSpacing * ((l.length - 1) / 2);
					break;
				case 1:
					x =  - (b * l.length / 2) - e._textLineSpacing * ((l.length - 1) / 2);
					break;
				case 2:
					x =  - (b * l.length / 2) - e._textLineSpacing * ((l.length - 1) / 2)
				}
				for (o = 0; l.length > o; o++) {
					for (i = l[o], s = 0; i.length > s; s++)
						r = c[i.charCodeAt(s)], w += _[r] || 0;
					v[o] = w,
					w > C && (C = w),
					w = 0
				}
				switch (e._textAlignX) {
				case 0:
					d = -e._geometry.x2;
					break;
				case 1:
					d = -C / 2;
					break;
				case 2:
					d = e._geometry.x2 - C
				}
				for (o = 0; l.length > o; o++) {
					switch (i = l[o], y = b * o + e._textLineSpacing * o, e._textAlignX) {
					case 0:
						p = -e._geometry.x2;
						break;
					case 1:
						p = -v[o] / 2;
						break;
					case 2:
						p = e._geometry.x2 - v[o]
					}
					for (s = 0; i.length > s; s++)
						r = c[i.charCodeAt(s)], a.drawImage(this.image, m[r], 2, u[r], this._sizeY - 2, Math.floor(f + p), Math.floor(g + x + y), u[r], this._sizeY - 2), e._colorOverlay && (a.save(), a.globalCompositeOperation = "source-atop", a.fillStyle = e._colorOverlay, a.fillRect(Math.floor(f + p), Math.floor(g + x + y), u[r], this._sizeY - 2), a.restore()), p += _[r] || 0, ige._drawCount++;
					p = 0
				}
			}
		},
		destroy : function () {
			this.image = null,
			this.script = null
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeFontSheet);
var IgeFontSmartTexture = {
	render : function (t, e) {
		if (e._nativeFont && e._text) {
			var i,
			o,
			s,
			n,
			r,
			a = e._text,
			h = [];
			for (t.font = e._nativeFont, t.textBaseline = "middle", e._colorOverlay && (t.fillStyle = e._colorOverlay), e._textAlignX === 0 && (t.textAlign = "left", t.translate(-e._geometry.x2, 0)), e._textAlignX === 1 && (t.textAlign = "center"), e._textAlignX === 2 && (t.textAlign = "right", t.translate(e._geometry.x2, 0)), e._nativeStroke && (t.lineWidth = e._nativeStroke, t.strokeStyle = e._nativeStrokeColor ? e._nativeStrokeColor : e._colorOverlay), a.indexOf("\n") > -1 ? h = a.split("\n") : h.push(a), n = Math.floor(e._geometry.y / h.length), o =  - ((n + e._textLineSpacing) / 2) * (h.length - 1), r = 0; h.length > r; r++)
				s = o + n * r + e._textLineSpacing * r, i = t.measureText(h[r]), e._nativeStroke && t.strokeText(h[r], 0, s), t.fillText(h[r], 0, s)
		}
	}
}, IgeObject = IgeEventingClass.extend({
		classId : "IgeObject",
		init : function () {
			this._newBorn = !0,
			this._alive = !0,
			this._mode = 0,
			this._mountMode = 0,
			this._parent = null,
			this._children = [],
			this._layer = 0,
			this._depth = 0,
			this._dirty = !0,
			this._depthSortMode = 0,
			this._timeStream = [],
			this._inView = !0
		},
		alive : function (t) {
			return t !== void 0 ? (this._alive = t, this) : this._alive
		},
		id : function (t) {
			if (t !== void 0) {
				if (t === this._id)
					return this;
				if (!ige._register[t])
					return this._id && ige._register[this._id] && ige.unRegister(this), this._id = t, ige.register(this), this;
				ige._register[t] !== this && this.log('Cannot set ID of object to "' + t + '" because that ID is already in use by another object!', "error")
			}
			return this._id || (this._id = ige.newIdHex(), ige.register(this)),
			this._id
		},
		category : function (t) {
			return t !== void 0 ? (this._category && this._category !== t && ige.categoryUnRegister(this), this._category = t, t && ige.categoryRegister(this), this) : this._category
		},
		group : function () {
			this.log("The group() method has been renamed to category(). Please update your code.", "error")
		},
		addGroup : function () {
			var t,
			e,
			i = arguments.length;
			while (i--)
				if (t = arguments[i], t instanceof Array) {
					e = t.length;
					while (e--)
						this._groups && this._groups.indexOf(t[e]) !== -1 || (this._groups = this._groups || [], this._groups.push(t[e]), ige.groupRegister(this, t[e]))
				} else
					this._groups && this._groups.indexOf(t) !== -1 || (this._groups = this._groups || [], this._groups.push(t), ige.groupRegister(this, t));
			return this
		},
		inGroup : function (t, e) {
			return t ? e ? this.inAllGroups(t) : this.inAnyGroup(t) : !1
		},
		inAllGroups : function (t) {
			var e,
			i;
			if (!(t instanceof Array))
				return this._groups && this._groups.indexOf(t) !== -1;
			i = t.length;
			while (i--)
				if (e = t[i], e && (!this._groups || this._groups.indexOf(e) === -1))
					return !1;
			return !0
		},
		inAnyGroup : function (t) {
			var e,
			i;
			if (!(t instanceof Array))
				return this._groups && this._groups.indexOf(t) > -1;
			i = t.length;
			while (i--)
				if (e = t[i], e && this._groups && this._groups.indexOf(e) > -1)
					return !0;
			return !1
		},
		groups : function () {
			return this._groups || []
		},
		groupCount : function () {
			return this._groups ? this._groups.length : 0
		},
		removeGroup : function () {
			if (this._groups) {
				var t,
				e,
				i = arguments.length;
				while (i--)
					if (t = arguments[i], t instanceof Array) {
						e = t.length;
						while (e--)
							this._groups.pull(t[e]), ige.groupUnRegister(this, t[e])
					} else
						this._groups.pull(t), ige.groupUnRegister(this, t)
			}
			return this
		},
		removeAllGroups : function () {
			if (this._groups) {
				var t = this._groups,
				e = t.length;
				while (e--)
					ige.groupUnRegister(this, t[e]);
				delete this._groups
			}
			return this
		},
		addBehaviour : function (t, e, i) {
			if (typeof t == "string") {
				if (typeof e == "function")
					return i ? (this._tickBehaviours = this._tickBehaviours || [], this._tickBehaviours.push({
							id : t,
							method : e
						})) : (this._updateBehaviours = this._updateBehaviours || [], this._updateBehaviours.push({
							id : t,
							method : e
						})), this;
				this.log("The behaviour you passed is not a function! The second parameter of the call must be a function!", "error")
			} else
				this.log("Cannot add behaviour to object because the specified behaviour id is not a string. You must provide two parameters with the addBehaviour() call, an id:String and a behaviour:Function. Adding a behaviour with an id allows you to remove it by it's id at a later stage!", "error");
			return !1
		},
		removeBehaviour : function (t, e) {
			if (t !== void 0) {
				var i,
				o;
				if (i = e ? this._tickBehaviours : this._updateBehaviours) {
					o = i.length;
					while (o--)
						if (i[o].id === t)
							return i.splice(o, 1), this
				}
			}
			return !1
		},
		drawBounds : function (t) {
			return t !== void 0 ? (this._drawBounds = t, this) : this._drawBounds
		},
		drawBoundsData : function (t) {
			return t !== void 0 ? (this._drawBoundsData = t, this) : this._drawBoundsData
		},
		drawMouse : function (t) {
			return t !== void 0 ? (this._drawMouse = t, this) : this._drawMouse
		},
		parent : function () {
			return this._parent
		},
		children : function () {
			return this._children
		},
		mount : function (t) {
			if (t) {
				if (t._children) {
					if (this.id(), this._parent) {
						if (this._parent === t)
							return this;
						this.unMount()
					}
					return this._parent = t,
					!this._ignoreCamera && this._parent._ignoreCamera && (this._ignoreCamera = this._parent._ignoreCamera),
					t._children.push(this),
					this._parent._childMounted(this),
					t.updateTransform(),
					t.aabb(!0),
					this.emit("mounted", this._parent),
					this
				}
				return !1
			}
			this.log("Cannot mount non-existent object!", "error")
		},
		unMount : function () {
			if (this._parent) {
				var t = this._parent._children,
				e = t.indexOf(this);
				return e > -1 ? (t.splice(e, 1), this._parent._childUnMounted(this), this._parent = null, this) : !1
			}
			return !1
		},
		clone : function () {},
		mode : function (t) {
			return t !== void 0 ? (this._mode = t, this) : this._mode
		},
		isometric : function (t) {
			return t === !0 ? (this._mode = 1, this) : t === !1 ? (this._mode = 0, this) : this._mode === 1
		},
		isometricMounts : function (t) {
			return t === !0 ? (this._mountMode = 1, this) : t === !1 ? (this._mountMode = 0, this) : this._mountMode === 1
		},
		indestructible : function (t) {
			return t !== void 0 ? (this._indestructible = t, this) : this._indestructible
		},
		layer : function (t) {
			return t !== void 0 ? (this._layer = t, this) : this._layer
		},
		depth : function (t) {
			return t !== void 0 ? (this._depth = t, this) : this._depth
		},
		destroyChildren : function () {
			var t,
			e = this._children;
			if (e) {
				t = e.length;
				while (t--)
					e[t].destroy()
			}
			return delete this._children,
			this
		},
		destroyBehaviours : function () {
			delete this._updateBehaviours,
			delete this._tickBehaviours
		},
		destroyComponents : function () {
			var t,
			e = this._components;
			if (e) {
				t = e.length;
				while (t--)
					e[t].destroy && e[t].destroy()
			}
			return delete this._components,
			this
		},
		dirty : function (t) {
			return t !== void 0 ? (this._dirty = t, this._parent && this._parent.dirty(t), this) : this._dirty
		},
		depthSortMode : function (t) {
			return t !== void 0 ? (this._depthSortMode = t, this) : this._depthSortMode
		},
		depthSortChildren : function () {
			if (this._depthSortMode !== -1) {
				var t,
				e,
				i,
				o,
				s = this._children;
				if (s && (t = s.length, t > 1))
					if (this._mountMode === 1) {
						if (this._depthSortMode === 0) {
							for (e = {
									adj : [],
									c : [],
									p : [],
									order : [],
									order_ind : t - 1
								}, i = 0; t > i; ++i)
								for (e.c[i] = 0, e.p[i] = -1, o = i + 1; t > o; ++o)
									e.adj[i] = e.adj[i] || [], e.adj[o] = e.adj[o] || [], s[i]._inView && s[o]._inView && s[i]._projectionOverlap && s[o]._projectionOverlap && s[i]._projectionOverlap(s[o]) && (s[i].isBehind(s[o]) ? e.adj[o].push(i) : e.adj[i].push(o));
							for (i = 0; t > i; ++i)
								e.c[i] === 0 && this._depthSortVisit(i, e);
							for (i = 0; e.order.length > i; i++)
								s[e.order[i]].depth(i);
							this._children.sort(function (t, e) {
								var i = e._layer - t._layer;
								return i === 0 ? e._depth - t._depth : i
							})
						}
						if (this._depthSortMode === 1 && this._children.sort(function (t, e) {
								var i = e._layer - t._layer;
								return i === 0 ? t.isBehind(e) ? -1 : 1 : i
							}), this._depthSortMode === 2) {
							while (t--)
								e = s[t], o = e._translate, o && (e._depth = o.x + o.y + o.z);
							this._children.sort(function (t, e) {
								var i = e._layer - t._layer;
								return i === 0 ? e._depth - t._depth : i
							})
						}
					} else
						this._children.sort(function (t, e) {
							var i = e._layer - t._layer;
							return i === 0 ? e._depth - t._depth : i
						})
			}
		},
		viewChecking : function (t) {
			return t !== void 0 ? (this._viewChecking = t, this) : this._viewChecking
		},
		viewCheckChildren : function () {
			if (ige._currentViewport) {
				var t,
				e = this._children,
				i = e.length,
				o = ige._currentViewport.viewArea();
				while (i--)
					t = e[i], t._inView = t._alwaysInView ? !0 : t.aabb ? o.rectIntersect(t.aabb(!0)) ? !0 : !1 : !1
			}
			return this
		},
		update : function (t) {
			if (this._alive) {
				this._newBorn && (this._newBorn = !1);
				var e,
				i,
				o,
				s = this._children;
				if (s)
					if (e = s.length, e && !ige._headless && (igeDebug._timing ? (ige._timeSpentLastTick[this.id()] || (ige._timeSpentLastTick[this.id()] = {}), i = (new Date).getTime(), this.depthSortChildren(), o = (new Date).getTime() - i, ige._timeSpentLastTick[this.id()].depthSortChildren = o) : this.depthSortChildren()), igeDebug._timing)
						while (e--)
							i = (new Date).getTime(), s[e].update(t), o = (new Date).getTime() - i, s[e] && (ige._timeSpentInTick[s[e].id()] || (ige._timeSpentInTick[s[e].id()] = 0), ige._timeSpentLastTick[s[e].id()] || (ige._timeSpentLastTick[s[e].id()] = {}), ige._timeSpentInTick[s[e].id()] += o, ige._timeSpentLastTick[s[e].id()].tick = o);
					else
						while (e--)
							s[e].update(t)
			}
		},
		tick : function (t) {
			if (this._alive) {
				var e,
				i,
				o,
				s = this._children;
				if (this._viewChecking && this.viewCheckChildren(), s)
					if (e = s.length, igeDebug._timing)
						while (e--)
							s[e]._newBorn || (t.save(), i = (new Date).getTime(), s[e].tick(t), o = (new Date).getTime() - i, s[e] && (ige._timeSpentInTick[s[e].id()] || (ige._timeSpentInTick[s[e].id()] = 0), ige._timeSpentLastTick[s[e].id()] || (ige._timeSpentLastTick[s[e].id()] = {}), ige._timeSpentInTick[s[e].id()] += o, ige._timeSpentLastTick[s[e].id()].tick = o), t.restore());
					else
						while (e--)
							s[e]._newBorn || (t.save(), s[e].tick(t), t.restore())
			}
		},
		_depthSortVisit : function (t, e) {
			var i,
			o,
			s = e.adj[t],
			n = s.length;
			for (e.c[t] = 1, i = 0; n > i; ++i)
				o = s[i], e.c[o] === 0 && (e.p[o] = t, this._depthSortVisit(o, e));
			e.c[t] = 2,
			e.order[e.order_ind] = t,
			--e.order_ind
		},
		_resizeEvent : function (t) {
			var e,
			i = this._children;
			if (i) {
				e = i.length;
				while (e--)
					i[e]._resizeEvent(t)
			}
		},
		_processUpdateBehaviours : function () {
			var t,
			e = this._updateBehaviours;
			if (e) {
				t = e.length;
				while (t--)
					e[t].method.apply(this, arguments)
			}
		},
		_processTickBehaviours : function () {
			var t,
			e = this._tickBehaviours;
			if (e) {
				t = e.length;
				while (t--)
					e[t].method.apply(this, arguments)
			}
		},
		_childMounted : function () {
			this._resizeEvent(null)
		},
		_childUnMounted : function () {},
		destroy : function () {
			return this.unMount(),
			this._children && this.destroyChildren(),
			this.destroyComponents(),
			this.destroyBehaviours(),
			ige.unRegister(this),
			ige.categoryUnRegister(this),
			ige.groupUnRegister(this),
			this._alive = !1,
			delete this._eventListeners,
			this
		},
		stringify : function () {
			var t = "new " + this.classId() + "()";
			return t += ".id('" + this.id() + "')",
			this.parent() && (t += ".mount(ige.$('" + this.parent().id() + "'))"),
			t += this._stringify()
		},
		_stringify : function () {
			var t,
			e = "";
			for (t in this)
				if (this.hasOwnProperty(t) && this[t] !== void 0)
					switch (t) {
					case "_category":
						e += ".category(" + this.category() + ")";
						break;
					case "_drawBounds":
						e += ".drawBounds(" + this.drawBounds() + ")";
						break;
					case "_drawBoundsData":
						e += ".drawBoundsData(" + this.drawBoundsData() + ")";
						break;
					case "_drawMouse":
						e += ".drawMouse(" + this.drawMouse() + ")";
						break;
					case "_mode":
						e += ".mode(" + this.mode() + ")";
						break;
					case "_isometricMounts":
						e += ".isometricMounts(" + this.isometricMounts() + ")";
						break;
					case "_indestructible":
						e += ".indestructible(" + this.indestructible() + ")";
						break;
					case "_layer":
						e += ".layer(" + this.layer() + ")";
						break;
					case "_depth":
						e += ".depth(" + this.depth() + ")"
					}
			return e
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeObject);
var IgeEntity = IgeObject.extend({
		classId : "IgeEntity",
		init : function () {
			this._super(),
			this._width = void 0,
			this._height = void 0,
			this._anchor = new IgePoint(0, 0, 0),
			this._renderPos = {
				x : 0,
				y : 0
			},
			this._opacity = 1,
			this._cell = 1,
			this._deathTime = void 0,
			this._oldTranslate = new IgePoint(0, 0, 0),
			this._translate = new IgePoint(0, 0, 0),
			this._rotate = new IgePoint(0, 0, 0),
			this._scale = new IgePoint(1, 1, 1),
			this._origin = new IgePoint(.5, .5, .5),
			this._geometry = new IgePoint(40, 40, 40),
			this._highlight = !1,
			this._mouseEventsActive = !1,
			this._localMatrix = new IgeMatrix2d(this),
			this._worldMatrix = new IgeMatrix2d(this),
			this._inView = !0,
			this._hidden = !1,
			this.streamSections(["transform"])
		},
		show : function () {
			return this._hidden = !1,
			this
		},
		hide : function () {
			return this._hidden = !0,
			this
		},
		cache : function (t) {
			return t !== void 0 ? (this._cache = t, t ? (this._cacheCanvas = document.createElement("canvas"), this._cacheCtx = this._cacheCanvas.getContext("2d"), this._cacheDirty = !0) : delete this._cacheCanvas, this) : this._cache
		},
		cacheDirty : function (t) {
			return t !== void 0 ? (this._cacheDirty = t, this) : this._cacheDirty
		},
		mousePos : function (t) {
			if (t = t || ige._currentViewport) {
				var e = t._mousePos.clone();
				return this._ignoreCamera && e.thisAddPoint(ige._currentCamera._translate),
				e.x += t._translate.x,
				e.y += t._translate.y,
				this._transformPoint(e),
				e
			}
			return new IgePoint(0, 0, 0)
		},
		mousePosAbsolute : function (t) {
			if (t = t || ige._currentViewport) {
				var e = t._mousePos.clone();
				return this._transformPoint(e),
				e
			}
			return new IgePoint(0, 0, 0)
		},
		mousePosWorld : function (t) {
			t = t || ige._currentViewport;
			var e = this.mousePos(t);
			return this.localToWorldPoint(e, t),
			this._ignoreCamera && t.camera._worldMatrix.transform([e]),
			e
		},
		rotateToPoint : function (t) {
			return this.rotateTo(this._rotate.x, this._rotate.y, Math.atan2(this._translate.y - t.y, this._translate.x - t.x) - this._parent._rotate.z + Math.radians(270)),
			this
		},
		translateToTile : function (t, e, i) {
			if (this._parent && this._parent._tileWidth !== void 0 && this._parent._tileHeight !== void 0) {
				var o;
				o = i !== void 0 ? i * this._parent._tileWidth : this._translate.z,
				this.translateTo(t * this._parent._tileWidth, e * this._parent._tileHeight, o)
			} else
				this.log("Cannot translate to tile because the entity is not currently mounted to a tile map or the tile map has no tileWidth or tileHeight values.", "warning");
			return this
		},
		backgroundPattern : function (t, e, i, o) {
			return t !== void 0 ? (this._backgroundPattern = t, this._backgroundPatternRepeat = e || "repeat", this._backgroundPatternTrackCamera = i, this._backgroundPatternIsoTile = o, this) : this._backgroundPattern
		},
		widthByTile : function (t, e) {
			if (this._parent && this._parent._tileWidth !== void 0 && this._parent._tileHeight !== void 0) {
				var i,
				o = this._mode === 0 ? this._parent._tileWidth : this._parent._tileWidth * 2;
				this.width(t * o),
				e && (this._texture ? (i = this._texture._sizeX / this._geometry.x, this.height(this._texture._sizeY / i)) : this.log("Cannot set height based on texture aspect ratio and new width because no texture is currently assigned to the entity!", "error"))
			} else
				this.log("Cannot set width by tile because the entity is not currently mounted to a tile map or the tile map has no tileWidth or tileHeight values.", "warning");
			return this
		},
		heightByTile : function (t, e) {
			if (this._parent && this._parent._tileWidth !== void 0 && this._parent._tileHeight !== void 0) {
				var i,
				o = this._mode === 0 ? this._parent._tileHeight : this._parent._tileHeight * 2;
				this.height(t * o),
				e && (this._texture ? (i = this._texture._sizeY / this._geometry.y, this.width(this._texture._sizeX / i)) : this.log("Cannot set width based on texture aspect ratio and new height because no texture is currently assigned to the entity!", "error"))
			} else
				this.log("Cannot set height by tile because the entity is not currently mounted to a tile map or the tile map has no tileWidth or tileHeight values.", "warning");
			return this
		},
		occupyTile : function () {
			this.log("Cannot occupy a tile because the entity is not currently mounted to a tile map.", "warning")
		},
		overTiles : function () {
			this.log("Cannot determine which tiles this entity lies over because the entity is not currently mounted to a tile map.", "warning")
		},
		anchor : function (t, e) {
			return t !== void 0 && e !== void 0 ? (this._anchor = new IgePoint(t, e, 0), this) : this._anchor
		},
		width : function (t, e) {
			if (t !== void 0) {
				if (e) {
					var i = t / this._geometry.x;
					this.height(this._geometry.y * i)
				}
				return this._width = t,
				this._geometry.x = t,
				this._geometry.x2 = t / 2,
				this
			}
			return this._width
		},
		height : function (t, e) {
			if (t !== void 0) {
				if (e) {
					var i = t / this._geometry.y;
					this.width(this._geometry.x * i)
				}
				return this._height = t,
				this._geometry.y = t,
				this._geometry.y2 = t / 2,
				this
			}
			return this._height
		},
		size3d : function (t, e, i) {
			return t !== void 0 && e !== void 0 && i !== void 0 ? (this._geometry = new IgePoint(t, e, i), this) : this._geometry
		},
		lifeSpan : function (t) {
			return t !== void 0 ? (this.deathTime(ige._currentTime + t), this) : this.deathTime() - ige._currentTime
		},
		deathTime : function (t) {
			return t !== void 0 ? (this._deathTime = t, this) : this._deathTime
		},
		opacity : function (t) {
			return t !== void 0 ? (this._opacity = t, this) : this._opacity
		},
		texture : function (t) {
			return t !== void 0 ? (this._texture = t, this) : this._texture
		},
		cell : function (t) {
			return t > 0 || t === null ? (this._cell = t, this) : this._cell
		},
		cellById : function (t) {
			if (t !== void 0)
				if (this._texture) {
					var e,
					i = this._texture,
					o = i._cells;
					for (e = 1; o.length > e; e++)
						if (o[e][4] === t)
							return this.cell(e), this;
					this.log('Could not find the cell id "' + t + '" in the assigned entity texture ' + i.id() + ', please check your sprite sheet (texture) cell definition to ensure the cell id "' + t + '" has been assigned to a cell!', "error")
				} else
					this.log("Cannot assign cell index from cell ID until an IgeSpriteSheet has been set as the texture for this entity. Please set the texture before calling cellById().", "error");
			return this._cell
		},
		dimensionsFromTexture : function (t) {
			return this._texture && (t === void 0 ? (this.width(this._texture._sizeX), this.height(this._texture._sizeY)) : (this.width(Math.floor(this._texture._sizeX / 100 * t)), this.height(Math.floor(this._texture._sizeY / 100 * t))), this.localAabb(!0)),
			this
		},
		dimensionsFromCell : function () {
			return this._texture && (this.width(this._texture._cells[this._cell][2]), this.height(this._texture._cells[this._cell][3]), this.localAabb(!0)),
			this
		},
		highlight : function (t) {
			return t !== void 0 ? (this._highlight = t, this) : this._highlight
		},
		worldPosition : function () {
			return new IgePoint(this._worldMatrix.matrix[2], this._worldMatrix.matrix[5], 0)
		},
		worldRotationZ : function () {
			return this._worldMatrix.rotationRadians()
		},
		localToWorld : function (t, e) {
			e = e || ige._currentViewport,
			this._worldMatrix.transform(t),
			this._ignoreCamera
		},
		localToWorldPoint : function (t, e) {
			e = e || ige._currentViewport,
			this._worldMatrix.transform([t])
		},
		aabb : function (t) {
			if (!this._aabb || t) {
				var e,
				i,
				o,
				s,
				n,
				r,
				a,
				h,
				l,
				c,
				m = new IgePoly2d,
				_ = this._anchor,
				u = this._geometry,
				p = u.x,
				y = u.y,
				d = u.z,
				x = u.x2,
				f = u.y2,
				g = (u.z2, this._origin),
				v = g.x - .5,
				b = g.y - .5,
				w = g.z - .5;
				this._mode === 0 && (r = x + _.x, a = f + _.y, h = p * v, l = y * b, m.addPoint(-r + h, -a + l), m.addPoint(r + h, -a + l), m.addPoint(r + h, a + l), m.addPoint(-r + h, a + l), this._renderPos = {
						x : -r + h,
						y : -a + l
					}, this.localToWorld(m._poly), e = Math.min(m._poly[0].x, m._poly[1].x, m._poly[2].x, m._poly[3].x), i = Math.min(m._poly[0].y, m._poly[1].y, m._poly[2].y, m._poly[3].y), o = Math.max(m._poly[0].x, m._poly[1].x, m._poly[2].x, m._poly[3].x), s = Math.max(m._poly[0].y, m._poly[1].y, m._poly[2].y, m._poly[3].y), n = new IgeRect(e, i, o - e, s - i)),
				this._mode === 1 && (c = new IgePoint( - (u.x / 2),  - (u.y / 2), u.z / 2).toIso(), r = c.x + u.x + _.x, a = c.y + _.y, h = p * v, l = d * w, m.addPoint(-r + h, -a + l), m.addPoint(r + h, -a + l), m.addPoint(r + h, a + l), m.addPoint(-r + h, a + l), this._renderPos = {
						x : -r + h,
						y : -a + l
					}, this.localToWorld(m._poly), e = Math.min(m._poly[0].x, m._poly[1].x, m._poly[2].x, m._poly[3].x), i = Math.min(m._poly[0].y, m._poly[1].y, m._poly[2].y, m._poly[3].y), o = Math.max(m._poly[0].x, m._poly[1].x, m._poly[2].x, m._poly[3].x), s = Math.max(m._poly[0].y, m._poly[1].y, m._poly[2].y, m._poly[3].y), n = new IgeRect(Math.floor(e), Math.floor(i), Math.floor(o - e), Math.floor(s - i))),
				this._aabb = n
			}
			return this._aabb
		},
		localAabb : function (t) {
			if (!this._localAabb || t) {
				var e = this.aabb();
				this._localAabb = new IgeRect(-Math.floor(e.width / 2), -Math.floor(e.height / 2), Math.floor(e.width), Math.floor(e.height))
			}
			return this._localAabb
		},
		_swapVars : function (t, e) {
			return [e, t]
		},
		_internalsOverlap : function (t, e, i, o) {
			var s;
			return t > e && (s = this._swapVars(t, e), t = s[0], e = s[1]),
			i > o && (s = this._swapVars(i, o), i = s[0], o = s[1]),
			t > i && (s = this._swapVars(t, i), t = s[0], i = s[1], s = this._swapVars(e, o), e = s[0], o = s[1]),
			e > i
		},
		_projectionOverlap : function (t) {
			var e = this._geometry,
			i = new IgePoint(this._translate.x - e.x / 2, this._translate.y - e.y / 2, this._translate.z - e.z),
			o = new IgePoint(this._translate.x + e.x / 2, this._translate.y + e.y / 2, this._translate.z + e.z),
			s = t._geometry,
			n = new IgePoint(t._translate.x - s.x / 2, t._translate.y - s.y / 2, t._translate.z - s.z),
			r = new IgePoint(t._translate.x + s.x / 2, t._translate.y + s.y / 2, t._translate.z + s.z);
			return this._internalsOverlap(i.x - o.y, o.x - i.y, n.x - r.y, r.x - n.y) && this._internalsOverlap(i.x - o.z, o.x - i.z, n.x - r.z, r.x - n.z) && this._internalsOverlap(i.z - o.y, o.z - i.y, n.z - r.y, r.z - n.y)
		},
		isBehind : function (t) {
			var e = this._geometry,
			i = new IgePoint(this._translate.x - e.x / 2, this._translate.y - e.y / 2, this._translate.z),
			o = new IgePoint(this._translate.x + e.x / 2, this._translate.y + e.y / 2, this._translate.z + e.z),
			s = t._geometry,
			n = new IgePoint(t._translate.x - s.x / 2, t._translate.y - s.y / 2, t._translate.z),
			r = new IgePoint(t._translate.x + s.x / 2, t._translate.y + s.y / 2, t._translate.z + s.z);
			return o.x > n.x ? r.x > i.x ? o.y > n.y ? r.y > i.y ? o.z > n.z ? r.z > i.z ? this._translate.x + this._translate.y + this._translate.z > t._translate.x + t._translate.y + t._translate.z : !0 : !1 : !0 : !1 : !0 : !1
		},
		mouseEventsActive : function (t) {
			return t !== void 0 ? (this._mouseEventsActive = t, this) : this._mouseEventsActive
		},
		newFrame : function () {
			return ige._frameAlternator !== this._frameAlternatorCurrent
		},
		_transformContext : function (t) {
			t.globalAlpha = this._parent ? this._parent._opacity * this._opacity : this._opacity,
			this._localMatrix.transformRenderingContext(t)
		},
		update : function (t) {
			this._deathTime === void 0 || this._deathTime > ige._tickStart ? (delete this._streamDataCache, this._processUpdateBehaviours(t), this._timeStream.length && this._processInterpolate(ige._tickStart - ige.network.stream._renderLatency), this.updateTransform(), this.aabb(!0), this._oldTranslate = this._translate.clone(), this._frameAlternatorCurrent = ige._frameAlternator) : this.destroy(),
			this._super(t)
		},
		tick : function (t, e) {
			if (!this._hidden && this._inView && (!this._parent || this._parent._inView) && !this._streamJustCreated) {
				this._processTickBehaviours(t);
				var i,
				o,
				s,
				n,
				r = this;
				if (this._mouseEventsActive && ige._currentViewport && (i = this.mousePosWorld(), i && (o = this.aabb(), s = i.x, n = i.y, o.xyInside(s, n) || this._mouseAlwaysInside ? ige.input.queueEvent(this, this._mouseInAabb) : ige.input.mouseMove && r._handleMouseOut(ige.input.mouseMove))), e || this._transformContext(t), !this._dontRender)
					if (this._cache)
						if (this._cacheDirty) {
							var a = this._cacheCanvas,
							h = this._cacheCtx;
							this._geometry.x > 0 && this._geometry.y > 0 ? (a.width = this._geometry.x, a.height = this._geometry.y) : (a.width = 1, a.height = 1),
							h.translate(this._geometry.x2, this._geometry.y2),
							this._renderEntity(h, e),
							this._renderCache(t),
							this._cacheDirty = !1
						} else
							this._renderCache(t);
					else
						this._renderEntity(t, e);
				this._streamMode === 1 && this.streamSync(),
				this._super(t)
			}
		},
		_renderEntity : function (t) {
			if (this._opacity > 0) {
				this._backgroundPattern && (this._backgroundPatternFill || t && (this._backgroundPatternFill = t.createPattern(this._backgroundPattern.image, this._backgroundPatternRepeat)), this._backgroundPatternFill && (t.save(), t.fillStyle = this._backgroundPatternFill, t.translate(-this._geometry.x2, -this._geometry.y2), t.rect(0, 0, this._geometry.x, this._geometry.y), this._backgroundPatternTrackCamera && (t.translate(-ige._currentCamera._translate.x, -ige._currentCamera._translate.y), t.scale(ige._currentCamera._scale.x, ige._currentCamera._scale.y)), t.fill(), ige._drawCount++, this._backgroundPatternIsoTile && (t.translate(-Math.floor(this._backgroundPattern.image.width) / 2, -Math.floor(this._backgroundPattern.image.height / 2)), t.fill(), ige._drawCount++), t.restore()));
				var e = this._texture;
				e && e._loaded && (e.render(t, this, ige._tickDelta), this._highlight && (t.globalCompositeOperation = "lighter", e.render(t, this)))
			}
		},
		_renderCache : function (t) {
			t.drawImage(this._cacheCanvas, -this._geometry.x2, -this._geometry.y2),
			ige._drawCount++,
			this._highlight && (t.globalCompositeOperation = "lighter", t.drawImage(this._cacheCanvas, -this._geometry.x2, -this._geometry.y2), ige._drawCount++)
		},
		_transformPoint : function (t) {
			if (this._parent) {
				var e = new IgeMatrix2d;
				e.copy(this._parent._worldMatrix),
				e.multiply(this._localMatrix),
				e.getInverse().transformCoord(t)
			} else
				this._localMatrix.transformCoord(t);
			return t
		},
		_mouseInAabb : function (t, e) {
			ige.input.mouseMove && this._handleMouseIn(ige.input.mouseMove, t, e),
			ige.input.mouseDown && this._handleMouseDown(ige.input.mouseDown, t, e),
			ige.input.mouseUp && this._handleMouseUp(ige.input.mouseUp, t, e)
		},
		_stringify : function () {
			var t,
			e = this._super();
			for (t in this)
				if (this.hasOwnProperty(t) && this[t] !== void 0)
					switch (t) {
					case "_opacity":
						e += ".opacity(" + this.opacity() + ")";
						break;
					case "_texture":
						e += ".texture(ige.$('" + this.texture().id() + "'))";
						break;
					case "_cell":
						e += ".cell(" + this.cell() + ")";
						break;
					case "_translate":
						e += ".translateTo(" + this._translate.x + ", " + this._translate.y + ", " + this._translate.z + ")";
						break;
					case "_rotate":
						e += ".rotateTo(" + this._rotate.x + ", " + this._rotate.y + ", " + this._rotate.z + ")";
						break;
					case "_scale":
						e += ".scaleTo(" + this._scale.x + ", " + this._scale.y + ", " + this._scale.z + ")";
						break;
					case "_origin":
						e += ".originTo(" + this._origin.x + ", " + this._origin.y + ", " + this._origin.z + ")";
						break;
					case "_anchor":
						e += ".anchor(" + this._anchor.x + ", " + this._anchor.y + ")";
						break;
					case "_width":
						e += typeof this.width() == "string" ? ".width('" + this.width() + "')" : ".width(" + this.width() + ")";
						break;
					case "_height":
						e += typeof this.height() == "string" ? ".height('" + this.height() + "')" : ".height(" + this.height() + ")";
						break;
					case "_geometry":
						e += ".size3d(" + this._geometry.x + ", " + this._geometry.y + ", " + this._geometry.z + ")";
						break;
					case "_deathTime":
						e += ".deathTime(" + this.deathTime() + ")";
						break;
					case "_highlight":
						e += ".highlight(" + this.highlight() + ")"
					}
			return e
		},
		destroy : function () {
			this._alive = !1,
			this.emit("destroyed", this),
			this._super()
		},
		mouseMove : function (t) {
			return t ? (this._mouseMove = t, this._mouseEventsActive = !0, this) : this._mouseMove
		},
		mouseMoveOff : function () {
			return delete this._mouseMove,
			this
		},
		mouseOver : function (t) {
			return t ? (this._mouseOver = t, this._mouseEventsActive = !0, this) : this._mouseOver
		},
		mouseOverOff : function () {
			return delete this._mouseOver,
			this
		},
		mouseOut : function (t) {
			return t ? (this._mouseOut = t, this._mouseEventsActive = !0, this) : this._mouseOut
		},
		mouseOutOff : function () {
			return delete this._mouseOut,
			this
		},
		mouseUp : function (t) {
			return t ? (this._mouseUp = t, this._mouseEventsActive = !0, this) : this._mouseUp
		},
		mouseUpOff : function () {
			return delete this._mouseUp,
			this
		},
		mouseDown : function (t) {
			return t ? (this._mouseDown = t, this._mouseEventsActive = !0, this) : this._mouseDown
		},
		mouseDownOff : function () {
			return delete this._mouseDown,
			this
		},
		_handleMouseIn : function (t, e, i) {
			this._mouseStateOver || (this._mouseStateOver = !0, this._mouseOver && this._mouseOver(t, e, i), this.emit("mouseMove", [t, e, i])),
			this._mouseMove && this._mouseMove(t, e, i)
		},
		_handleMouseOut : function (t, e, i) {
			this._mouseStateDown = !1,
			this._mouseStateOver && (this._mouseStateOver = !1, this._mouseOut && this._mouseOut(t, e, i), this.emit("mouseOut", [t, e, i]))
		},
		_handleMouseUp : function (t, e, i) {
			this._mouseStateDown = !1,
			this._mouseUp && this._mouseUp(t, e, i),
			this.emit("mouseUp", [t, e, i])
		},
		_handleMouseDown : function (t, e, i) {
			this._mouseStateDown || (this._mouseStateDown = !0, this._mouseDown && this._mouseDown(t, e, i), this.emit("mouseDown", [t, e, i]))
		},
		translateBy : function (t, e, i) {
			return t !== void 0 && e !== void 0 && i !== void 0 ? (this._translate.x += t, this._translate.y += e, this._translate.z += i) : this.log("translateBy() called with a missing or undefined x, y or z parameter!", "error"),
			this._entity || this
		},
		translateTo : function (t, e, i) {
			return t !== void 0 && e !== void 0 && i !== void 0 ? (this._translate.x = t, this._translate.y = e, this._translate.z = i) : this.log("translateTo() called with a missing or undefined x, y or z parameter!", "error"),
			this._entity || this
		},
		translateToPoint : function (t) {
			return t !== void 0 ? (this._translate.x = t.x, this._translate.y = t.y, this._translate.z = t.z) : this.log("translateToPoint() called with a missing or undefined point parameter!", "error"),
			this._entity || this
		},
		translate : function () {
			return arguments.length && this.log("You called translate with arguments, did you mean translateTo or translateBy instead of translate?", "warning"),
			this.x = this._translateAccessorX,
			this.y = this._translateAccessorY,
			this.z = this._translateAccessorZ,
			this._entity || this
		},
		_translateAccessorX : function (t) {
			return t !== void 0 ? (this._translate.x = t, this._entity || this) : this._translate.x
		},
		_translateAccessorY : function (t) {
			return t !== void 0 ? (this._translate.y = t, this._entity || this) : this._translate.y
		},
		_translateAccessorZ : function (t) {
			return t !== void 0 ? (this._translate.z = t, this._entity || this) : this._translate.z
		},
		rotateBy : function (t, e, i) {
			return t !== void 0 && e !== void 0 && i !== void 0 ? (this._rotate.x += t, this._rotate.y += e, this._rotate.z += i) : this.log("rotateBy() called with a missing or undefined x, y or z parameter!", "error"),
			this._entity || this
		},
		rotateTo : function (t, e, i) {
			return t !== void 0 && e !== void 0 && i !== void 0 ? (this._rotate.x = t, this._rotate.y = e, this._rotate.z = i) : this.log("rotateTo() called with a missing or undefined x, y or z parameter!", "error"),
			this._entity || this
		},
		rotate : function () {
			return arguments.length && this.log("You called rotate with arguments, did you mean rotateTo or rotateBy instead of rotate?", "warning"),
			this.x = this._rotateAccessorX,
			this.y = this._rotateAccessorY,
			this.z = this._rotateAccessorZ,
			this._entity || this
		},
		_rotateAccessorX : function (t) {
			return t !== void 0 ? (this._rotate.x = t, this._entity || this) : this._rotate.x
		},
		_rotateAccessorY : function (t) {
			return t !== void 0 ? (this._rotate.y = t, this._entity || this) : this._rotate.y
		},
		_rotateAccessorZ : function (t) {
			return t !== void 0 ? (this._rotate.z = t, this._entity || this) : this._rotate.z
		},
		scaleBy : function (t, e, i) {
			return t !== void 0 && e !== void 0 && i !== void 0 ? (this._scale.x += t, this._scale.y += e, this._scale.z += i) : this.log("scaleBy() called with a missing or undefined x, y or z parameter!", "error"),
			this._entity || this
		},
		scaleTo : function (t, e, i) {
			return t !== void 0 && e !== void 0 && i !== void 0 ? (this._scale.x = t, this._scale.y = e, this._scale.z = i) : this.log("scaleTo() called with a missing or undefined x, y or z parameter!", "error"),
			this._entity || this
		},
		scale : function () {
			return arguments.length && this.log("You called scale with arguments, did you mean scaleTo or scaleBy instead of scale?", "warning"),
			this.x = this._scaleAccessorX,
			this.y = this._scaleAccessorY,
			this.z = this._scaleAccessorZ,
			this._entity || this
		},
		_scaleAccessorX : function (t) {
			return t !== void 0 ? (this._scale.x = t, this._entity || this) : this._scale.x
		},
		_scaleAccessorY : function (t) {
			return t !== void 0 ? (this._scale.y = t, this._entity || this) : this._scale.y
		},
		_scaleAccessorZ : function (t) {
			return t !== void 0 ? (this._scale.z = t, this._entity || this) : this._scale.z
		},
		originBy : function (t, e, i) {
			return t !== void 0 && e !== void 0 && i !== void 0 ? (this._origin.x += t, this._origin.y += e, this._origin.z += i) : this.log("originBy() called with a missing or undefined x, y or z parameter!", "error"),
			this._entity || this
		},
		originTo : function (t, e, i) {
			return t !== void 0 && e !== void 0 && i !== void 0 ? (this._origin.x = t, this._origin.y = e, this._origin.z = i) : this.log("originTo() called with a missing or undefined x, y or z parameter!", "error"),
			this._entity || this
		},
		origin : function () {
			return this.x = this._originAccessorX,
			this.y = this._originAccessorY,
			this.z = this._originAccessorZ,
			this._entity || this
		},
		_originAccessorX : function (t) {
			return t !== void 0 ? (this._origin.x = t, this._entity || this) : this._origin.x
		},
		_originAccessorY : function (t) {
			return t !== void 0 ? (this._origin.y = t, this._entity || this) : this._origin.y
		},
		_originAccessorZ : function (t) {
			return t !== void 0 ? (this._origin.z = t, this._entity || this) : this._origin.z
		},
		_rotatePoint : function (t, e, i) {
			var o = Math.cos(e),
			s = Math.sin(e);
			return {
				x : i.x + (t.x - i.x) * o + (t.y - i.y) * s,
				y : i.y - (t.x - i.x) * s + (t.y - i.y) * o
			}
		},
		updateTransform : function () {
			if (this._localMatrix.identity(), this._mode === 0 && this._localMatrix.multiply(this._localMatrix._newTranslate(this._translate.x, this._translate.y)), this._mode === 1) {
				var t = this._translateIso = new IgePoint(this._translate.x, this._translate.y, this._translate.z + this._geometry.z / 2).toIso();
				this._parent && this._parent._geometry.z && (t.y += this._parent._geometry.z / 1.6),
				this._localMatrix.multiply(this._localMatrix._newTranslate(t.x, t.y))
			}
			this._localMatrix.multiply(this._localMatrix._newRotate(this._rotate.z)),
			this._localMatrix.multiply(this._localMatrix._newScale(this._scale.x, this._scale.y)),
			this._parent ? (this._worldMatrix.copy(this._parent._worldMatrix), this._worldMatrix.multiply(this._localMatrix)) : this._worldMatrix.copy(this._localMatrix)
		},
		streamSections : function (t) {
			return t !== void 0 ? (this._streamSections = t, this) : this._streamSections
		},
		streamSectionData : function (t, e, i) {
			if (t === "transform") {
				if (!e)
					return this._translate.toString(this._streamFloatPrecision) + "," + this._scale.toString(this._streamFloatPrecision) + "," + this._rotate.toString(this._streamFloatPrecision) + ",";
				var o = e.split(",");
				i || this._streamJustCreated ? (o[0] && (this._translate.x = parseFloat(o[0])), o[1] && (this._translate.y = parseFloat(o[1])), o[2] && (this._translate.z = parseFloat(o[2])), o[3] && (this._scale.x = parseFloat(o[3])), o[4] && (this._scale.y = parseFloat(o[4])), o[5] && (this._scale.z = parseFloat(o[5])), o[6] && (this._rotate.x = parseFloat(o[6])), o[7] && (this._rotate.y = parseFloat(o[7])), o[8] && (this._rotate.z = parseFloat(o[8]))) : (o[0] && (o[0] = parseFloat(o[0])), o[1] && (o[1] = parseFloat(o[1])), o[2] && (o[2] = parseFloat(o[2])), o[3] && (o[3] = parseFloat(o[3])), o[4] && (o[4] = parseFloat(o[4])), o[5] && (o[5] = parseFloat(o[5])), o[6] && (o[6] = parseFloat(o[6])), o[7] && (o[7] = parseFloat(o[7])), o[8] && (o[8] = parseFloat(o[8])), this._timeStream.push([ige.network.stream._streamDataTime + ige.network._latency, o]), this._timeStream.length > 10 && this._timeStream.shift())
			}
		},
		interpolateValue : function (t, e, i, o, s) {
			var n = e - t,
			r = s - i,
			a = o - i,
			h = a / r;
			return 0 > h ? h = 0 : h > 1 && (h = 1),
			n * h + t
		},
		_processInterpolate : function (t, e) {
			e || (e = 200);
			var i,
			o,
			s,
			n,
			r,
			a,
			h,
			l = this._timeStream,
			c = [],
			m = 1;
			while (l[m]) {
				if (l[m][0] > t) {
					i = l[m - 1],
					o = l[m];
					break
				}
				m++
			}
			o || i ? l.splice(0, m - 1) : l.length > 2 && t > l[l.length - 1][0] && (i = l[l.length - 2], o = l[l.length - 1], l.shift(), this.emit("interpolationLag")),
			o && i && (this._timeStreamPreviousData = i, this._timeStreamNextData = o, s = o[0] - i[0], n = t - i[0], this._timeStreamDataDelta = Math.floor(s), this._timeStreamOffsetDelta = Math.floor(n), r = n / s, this._timeStreamCurrentInterpolateTime = r, a = i[1], h = o[1], c[0] = this.interpolateValue(a[0], h[0], i[0], t, o[0]), c[1] = this.interpolateValue(a[1], h[1], i[0], t, o[0]), c[2] = this.interpolateValue(a[2], h[2], i[0], t, o[0]), c[3] = this.interpolateValue(a[3], h[3], i[0], t, o[0]), c[4] = this.interpolateValue(a[4], h[4], i[0], t, o[0]), c[5] = this.interpolateValue(a[5], h[5], i[0], t, o[0]), c[6] = this.interpolateValue(a[6], h[6], i[0], t, o[0]), c[7] = this.interpolateValue(a[7], h[7], i[0], t, o[0]), c[8] = this.interpolateValue(a[8], h[8], i[0], t, o[0]), this.translateTo(parseFloat(c[0]), parseFloat(c[1]), parseFloat(c[2])), this.scaleTo(parseFloat(c[3]), parseFloat(c[4]), parseFloat(c[5])), this.rotateTo(parseFloat(c[6]), parseFloat(c[7]), parseFloat(c[8])), this._lastUpdate = (new Date).getTime())
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeEntity);
var IgeUiEntity = IgeEntity.extend([{
				extension : IgeUiStyleExtension,
				overwrite : !0
			}, {
				extension : IgeUiPositionExtension,
				overwrite : !0
			}
		], {
		classId : "IgeUiEntity",
		init : function () {
			this._super(),
			this._uiX = 0,
			this._uiY = 0,
			this._width = 0,
			this._height = 0,
			this._borderLeftWidth = 0,
			this._borderTopWidth = 0,
			this._borderRightWidth = 0,
			this._borderBottomWidth = 0,
			this._borderTopLeftRadius = 0,
			this._borderTopRightRadius = 0,
			this._borderBottomRightRadius = 0,
			this._borderBottomLeftRadius = 0,
			this._backgroundPosition = {
				x : 0,
				y : 0
			},
			this._paddingLeft = 0,
			this._paddingTop = 0,
			this._paddingRight = 0,
			this._paddingBottom = 0
		},
		overflow : function (t) {
			return t !== void 0 ? (this._overflow = t, this) : this._overflow
		},
		_renderBackground : function (t) {
			var e,
			i,
			o,
			s,
			n = this._geometry;
			(this._backgroundColor || this._patternFill) && (e =  - (n.x / 2) | 0, i =  - (n.y / 2) | 0, o = n.x, s = n.y, t.save(), t.beginPath(), this._borderTopRightRadius || !this._borderBottomRightRadius || this._borderBottomLeftRadius || this._borderTopLeftRadius ? (t.moveTo(e + this._borderTopLeftRadius, i), t.lineTo(e + o - this._borderTopRightRadius, i), this._borderTopRightRadius > 0 && t.arcTo(e + o, i, e + o, i + this._borderTopRightRadius, this._borderTopRightRadius), t.lineTo(e + o, i + s - this._borderBottomRightRadius), this._borderBottomRightRadius > 0 && t.arcTo(e + o, i + s, e + o - this._borderBottomRightRadius, i + s, this._borderBottomRightRadius), t.lineTo(e + this._borderBottomLeftRadius, i + s), this._borderBottomLeftRadius > 0 && t.arcTo(e, i + s, e, i + s - this._borderBottomLeftRadius, this._borderBottomLeftRadius), t.lineTo(e, i + this._borderTopLeftRadius), this._borderTopLeftRadius > 0 && t.arcTo(e, i, e + this._borderTopLeftRadius, i, this._borderTopLeftRadius), t.clip()) : t.rect(e, i, o, s), this._backgroundColor && (t.fillStyle = this._backgroundColor, t.fill()), this._patternFill && (t.translate( - (o / 2 | 0) + this._backgroundPosition.x,  - (s / 2 | 0) + this._backgroundPosition.y), t.fillStyle = this._patternFill, t.fill()), t.restore())
		},
		_renderBorder : function (t) {
			var e,
			i = this._geometry,
			o = -i.x2 | 0,
			s = -i.y2 | 0,
			n = i.x,
			r = i.y;
			this._borderTopRightRadius || this._borderBottomRightRadius || this._borderBottomLeftRadius || this._borderTopLeftRadius || this._borderLeftWidth !== this._borderWidth || this._borderTopWidth !== this._borderWidth || this._borderRightWidth !== this._borderWidth || this._borderBottomWidth !== this._borderWidth ? (e = Math.PI / 180, this._borderTopWidth && (t.strokeStyle = this._borderTopColor, t.lineWidth = this._borderTopWidth, this._borderTopLeftRadius > 0 && (t.beginPath(), t.arc(o + this._borderTopLeftRadius, s + this._borderTopLeftRadius, this._borderTopLeftRadius, 225 * e, 270 * e), t.stroke()), t.beginPath(), t.moveTo(o + this._borderTopLeftRadius, s), t.lineTo(o + n - this._borderTopRightRadius, s), t.stroke(), this._borderTopRightRadius > 0 && (t.beginPath(), t.arc(o + n - this._borderTopRightRadius, s + this._borderTopRightRadius, this._borderTopRightRadius, -90 * e, -45 * e), t.stroke())), this._borderRightWidth && (t.strokeStyle = this._borderRightColor, t.lineWidth = this._borderRightWidth, this._borderTopRightRadius > 0 && (t.beginPath(), t.arc(o + n - this._borderTopRightRadius, s + this._borderTopRightRadius, this._borderTopRightRadius, -45 * e, 0), t.stroke()), t.beginPath(), t.moveTo(o + n, s + this._borderTopRightRadius), t.lineTo(o + n, s + r - this._borderBottomRightRadius), t.stroke(), this._borderBottomRightRadius > 0 && (t.beginPath(), t.arc(o + n - this._borderBottomRightRadius, s + r - this._borderBottomRightRadius, this._borderTopRightRadius, 0, 45 * e), t.stroke())), this._borderBottomWidth && (t.strokeStyle = this._borderBottomColor, t.lineWidth = this._borderBottomWidth, this._borderBottomRightRadius > 0 && (t.beginPath(), t.arc(o + n - this._borderBottomRightRadius, s + r - this._borderBottomRightRadius, this._borderBottomRightRadius, 45 * e, 90 * e), t.stroke()), t.beginPath(), t.moveTo(o + n - this._borderBottomRightRadius, s + r), t.lineTo(o + this._borderBottomLeftRadius, s + r), t.stroke(), this._borderBottomLeftRadius > 0 && (t.beginPath(), t.arc(o + this._borderBottomLeftRadius, s + r - this._borderBottomLeftRadius, this._borderBottomLeftRadius, 90 * e, 135 * e), t.stroke())), this._borderLeftWidth && (t.strokeStyle = this._borderLeftColor, t.lineWidth = this._borderLeftWidth, this._borderBottomLeftRadius > 0 && (t.beginPath(), t.arc(o + this._borderBottomLeftRadius, s + r - this._borderBottomLeftRadius, this._borderBottomLeftRadius, 135 * e, 180 * e), t.stroke()), t.beginPath(), t.moveTo(o, s + r - this._borderBottomLeftRadius), t.lineTo(o, s + this._borderTopLeftRadius), t.stroke(), this._borderTopLeftRadius > 0 && (t.beginPath(), t.arc(o + this._borderTopLeftRadius, s + this._borderTopLeftRadius, this._borderTopLeftRadius, 180 * e, 225 * e), t.stroke()))) : (t.strokeStyle = this._borderColor, t.lineWidth = this._borderWidth, t.strokeRect(o, s, n, r))
		},
		cell : function (t) {
			var e = this._super(t);
			return e === this && this._patternTexture && this.backgroundImage(this._patternTexture, this._patternRepeat),
			e
		},
		mount : function (t) {
			var e = this._super(t);
			return this._parent && this._updateUiPosition(),
			e
		},
		tick : function (t, e) {
			if (e || this._transformContext(t), this._renderBackground(t), this._renderBorder(t), this._overflow === "hidden") {
				var i = this._geometry,
				o =  - (i.x / 2) + this._paddingLeft | 0,
				s =  - (i.y / 2) + this._paddingTop | 0,
				n = i.x + this._paddingRight,
				r = i.y + this._paddingBottom;
				t.rect(o, s, n, r),
				t.clip()
			}
			t.translate(this._paddingLeft, this._paddingTop),
			this._super(t, !0)
		},
		_resizeEvent : function (t) {
			this._updateUiPosition(),
			this._super(t)
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeUiEntity);
var IgeFontEntity = IgeUiEntity.extend({
		classId : "IgeFontEntity",
		init : function () {
			this._super(),
			this._text = void 0,
			this._textAlignX = 1,
			this._textAlignY = 1,
			this._textLineSpacing = 0,
			this.cache(!0)
		},
		width : function (t, e, i, o) {
			return t !== void 0 && this._geometry.x !== t && this.clearCache(),
			this._super(t, e, i, o)
		},
		height : function (t, e, i, o) {
			return t !== void 0 && this._geometry.y !== t && this.clearCache(),
			this._super(t, e, i, o)
		},
		text : function (t) {
			return t !== void 0 ? (this._text !== t && this.clearCache(), this._text = t, this) : this._text
		},
		bindData : function (t, e, i, o) {
			return t !== void 0 && e !== void 0 && (this._bindDataObject = t, this._bindDataProperty = e, this._bindDataPreText = i || "", this._bindDataPostText = o || ""),
			this
		},
		textAlignX : function (t) {
			return t !== void 0 ? (this._textAlignX !== t && this.clearCache(), this._textAlignX = t, this) : this._textAlignX
		},
		textAlignY : function (t) {
			return t !== void 0 ? (this._textAlignY !== t && this.clearCache(), this._textAlignY = t, this) : this._textAlignY
		},
		textLineSpacing : function (t) {
			return t !== void 0 ? (this._textLineSpacing !== t && this.clearCache(), this._textLineSpacing = t, this) : this._textLineSpacing
		},
		colorOverlay : function (t) {
			return t !== void 0 ? (this._colorOverlay !== t && this.clearCache(), this._colorOverlay = t, this) : this._colorOverlay
		},
		clearCache : function () {
			this._cache && (this._cacheDirty = !0),
			this._texture && this._texture._caching && this._texture._cacheText[this._text] && delete this._texture._cacheText[this._text]
		},
		nativeFont : function (t) {
			if (t !== void 0) {
				this._nativeFont !== t && this.clearCache(),
				this._nativeFont = t;
				var e = new IgeTexture(IgeFontSmartTexture);
				return this.texture(e),
				this
			}
			return this._nativeFont
		},
		nativeStroke : function (t) {
			return t !== void 0 ? (this._nativeStroke !== t && this.clearCache(), this._nativeStroke = t, this) : this._nativeStroke
		},
		nativeStrokeColor : function (t) {
			return t !== void 0 ? (this._nativeStrokeColor !== t && this.clearCache(), this._nativeStrokeColor = t, this) : this._nativeStrokeColor
		},
		tick : function (t) {
			this._bindDataObject && this._bindDataProperty && (this._bindDataObject._alive === !1 ? delete this._bindDataObject : this.text(this._bindDataPreText + this._bindDataObject[this._bindDataProperty] + this._bindDataPostText)),
			this._super(t)
		},
		_stringify : function () {
			var t,
			e = this._super();
			for (t in this)
				if (this.hasOwnProperty(t) && this[t] !== void 0)
					switch (t) {
					case "_text":
						e += ".text(" + this.text() + ")";
						break;
					case "_textAlignX":
						e += ".textAlignX(" + this.textAlignX() + ")";
						break;
					case "_textAlignY":
						e += ".textAlignY(" + this.textAlignY() + ")";
						break;
					case "_textLineSpacing":
						e += ".textLineSpacing(" + this.textLineSpacing() + ")"
					}
			return e
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeFontEntity);
var IgeParticleEmitter = IgeEntity.extend({
		classId : "IgeParticleEmitter",
		IgeParticleEmitter : !0,
		init : function () {
			this._super(),
			this._currentDelta = 0,
			this._started = !1,
			this._particles = [],
			this.quantityTimespan(1e3),
			this.quantityBase(10),
			this.applyDepthToParticles(!0),
			this.applyLayerToParticles(!0),
			this.quantityVariance(0, 0),
			this.translateBaseX(0),
			this.translateBaseY(0),
			this.translateBaseZ(0),
			this.translateVarianceX(0, 0),
			this.translateVarianceY(0, 0),
			this.translateVarianceZ(0, 0),
			this.rotateBase(0),
			this.rotateVariance(0, 0),
			this.deathRotateBase(0),
			this.deathRotateVariance(0, 0),
			this.scaleBaseX(1),
			this.scaleBaseY(1),
			this.scaleBaseZ(1),
			this.scaleVarianceX(0, 0),
			this.scaleVarianceY(0, 0),
			this.scaleVarianceZ(0, 0),
			this.scaleLockAspect(!1),
			this.deathScaleBaseX(0),
			this.deathScaleBaseY(0),
			this.deathScaleBaseZ(0),
			this.deathScaleVarianceX(0, 0),
			this.deathScaleVarianceY(0, 0),
			this.deathScaleVarianceZ(0, 0),
			this.deathScaleLockAspect(!1),
			this.opacityBase(1),
			this.opacityVariance(0, 0),
			this.deathOpacityBase(1),
			this.deathOpacityVariance(0, 0),
			this.lifeBase(1e3),
			this.lifeVariance(0, 0)
		},
		particle : function (t) {
			return this._particle = t,
			this
		},
		particleMountTarget : function (t) {
			return this._particleMountTarget = t,
			this
		},
		applyDepthToParticles : function (t) {
			return this._applyDepthToParticles = t,
			this
		},
		applyLayerToParticles : function (t) {
			return this._applyLayerToParticles = t,
			this
		},
		quantityTimespan : function (t) {
			return this._quantityTimespan = t,
			this
		},
		quantityBase : function (t) {
			return this._quantityBase = t,
			this
		},
		quantityVariance : function (t, e) {
			return this._quantityVariance = [t, e],
			this
		},
		quantityMax : function (t) {
			return this._quantityMax = t,
			this._quantityProduced = 0,
			this
		},
		translateBaseX : function (t) {
			return this._translateBaseX = t,
			this
		},
		translateBaseY : function (t) {
			return this._translateBaseY = t,
			this
		},
		translateBaseZ : function (t) {
			return this._translateBaseZ = t,
			this
		},
		translateVarianceX : function (t, e) {
			return this._translateVarianceX = [t, e],
			this
		},
		translateVarianceY : function (t, e) {
			return this._translateVarianceY = [t, e],
			this
		},
		translateVarianceZ : function (t, e) {
			return this._translateVarianceZ = [t, e],
			this
		},
		rotateBase : function (t) {
			return this._rotateBase = t,
			this
		},
		rotateVariance : function (t, e) {
			return this._rotateVariance = [t, e],
			this
		},
		deathRotateBase : function (t) {
			return this._deathRotateBase = t,
			this
		},
		deathRotateVariance : function (t, e) {
			return this._deathRotateVariance = [t, e],
			this
		},
		scaleBaseX : function (t) {
			return this._scaleBaseX = t,
			this
		},
		scaleBaseY : function (t) {
			return this._scaleBaseY = t,
			this
		},
		scaleBaseZ : function (t) {
			return this._scaleBaseZ = t,
			this
		},
		scaleVarianceX : function (t, e) {
			return this._scaleVarianceX = [t, e],
			this
		},
		scaleVarianceY : function (t, e) {
			return this._scaleVarianceY = [t, e],
			this
		},
		scaleVarianceZ : function (t, e) {
			return this._scaleVarianceZ = [t, e],
			this
		},
		scaleLockAspect : function (t) {
			return this._scaleLockAspect = t,
			this
		},
		deathScaleBaseX : function (t) {
			return this._deathScaleBaseX = t,
			this
		},
		deathScaleBaseY : function (t) {
			return this._deathScaleBaseY = t,
			this
		},
		deathScaleBaseZ : function (t) {
			return this._deathScaleBaseZ = t,
			this
		},
		deathScaleVarianceX : function (t, e) {
			return this._deathScaleVarianceX = [t, e],
			this
		},
		deathScaleVarianceY : function (t, e) {
			return this._deathScaleVarianceY = [t, e],
			this
		},
		deathScaleVarianceZ : function (t, e) {
			return this._deathScaleVarianceZ = [t, e],
			this
		},
		deathScaleLockAspect : function (t) {
			return this._deathScaleLockAspect = t,
			this
		},
		opacityBase : function (t) {
			return this._opacityBase = t,
			this
		},
		opacityVariance : function (t, e) {
			return this._opacityVariance = [t, e],
			this
		},
		deathOpacityBase : function (t) {
			return this._deathOpacityBase = t,
			this
		},
		deathOpacityVariance : function (t, e) {
			return this._deathOpacityVariance = [t, e],
			this
		},
		lifeBase : function (t) {
			return this._lifeBase = t,
			this
		},
		lifeVariance : function (t, e) {
			return this._lifeVariance = [t, e],
			this
		},
		velocityVector : function (t, e, i) {
			return this._velocityVector = {
				base : t,
				min : e,
				max : i
			},
			this
		},
		linearForceVector : function (t, e, i) {
			return this._linearForceVector = {
				base : t,
				min : e,
				max : i
			},
			this
		},
		start : function () {
			return this._particle ? (this.updateTransform(), this._quantityTimespan = this._quantityTimespan || 1e3, this._maxParticles = this.baseAndVarianceValue(this._quantityBase, this._quantityVariance, !0), this._particlesPerTimeVector = this._quantityTimespan / this._maxParticles, this._currentDelta = 0, this._quantityProduced = 0, this._started = !0) : this.log("Cannot start particle emitter because no particle class was specified with a call to particle()", "error"),
			this
		},
		stop : function () {
			return this._started = !1,
			this
		},
		stopAndKill : function () {
			this._started = !1;
			var t = this._particles,
			e = t.length;
			while (e--)
				t[e].destroy();
			return this._particles = [],
			this
		},
		baseAndVarianceValue : function (t, e, i) {
			t = t || 0,
			e = e || [0, 0];
			var o = 0;
			return o = i ? Math.floor(e[0] + Math.random() * (e[1] - e[0])) : e[0] + Math.random() * (e[1] - e[0]),
			t + o
		},
		vectorFromBaseMinMax : function (t) {
			if (t.min && t.max) {
				var e = t.base,
				i = t.min,
				o = t.max,
				s = {};
				return s.x = e.x + (i.x + Math.random() * (o.x - i.x)),
				s.y = e.y + (i.y + Math.random() * (o.y - i.y)),
				s.z = e.z + (i.z + Math.random() * (o.z - i.z)),
				s
			}
			return t.base
		},
		tick : function (t) {
			if (this._currentDelta += ige._tickDelta, this._parent && this._started && (!this._quantityMax || this._quantityMax > this._quantityProduced)) {
				var e,
				i,
				o,
				s,
				n,
				r,
				a,
				h,
				l,
				c,
				m,
				_,
				u,
				p,
				y,
				d,
				x,
				f,
				g,
				v,
				b,
				w,
				C,
				D,
				B,
				S,
				I;
				if (this._currentDelta > this._quantityTimespan && (this._currentDelta = this._quantityTimespan), this._currentDelta >= this._particlesPerTimeVector && (e = this._currentDelta / this._particlesPerTimeVector | 0, this._currentDelta -= this._particlesPerTimeVector * e, e))
					while (e--) {
						if (this._quantityMax && (this._quantityProduced++, this._quantityProduced >= this._quantityMax)) {
							this.stop();
							break
						}
						for (i = this.baseAndVarianceValue(this._translateBaseX, this._translateVarianceX, !0), o = this.baseAndVarianceValue(this._translateBaseY, this._translateVarianceY, !0), s = this.baseAndVarianceValue(this._translateBaseZ, this._translateVarianceZ, !0), this._velocityVector && (n = this.vectorFromBaseMinMax(this._velocityVector), h = n.x, l = n.y, c = this._worldMatrix.matrix[0], m = this._worldMatrix.matrix[3], r = h * c - l * m, a = l * c + h * m, n.x = r, n.y = a), _ = this.baseAndVarianceValue(this._scaleBaseX, this._scaleVarianceX, !1), p = u = _, this._scaleLockAspect || (u = this.baseAndVarianceValue(this._scaleBaseY, this._scaleVarianceY, !1), p = this.baseAndVarianceValue(this._scaleBaseZ, this._scaleVarianceZ, !1)), y = this.baseAndVarianceValue(this._rotateBase, this._rotateVariance, !0), d = this.baseAndVarianceValue(this._opacityBase, this._opacityVariance, !1), x = this.baseAndVarianceValue(this._lifeBase, this._lifeVariance, !0), this._linearForceVector && (f = this.vectorFromBaseMinMax(this._linearForceVector), h = f.x, l = f.y, c = this._worldMatrix.matrix[0], m = this._worldMatrix.matrix[3], r = h * c - l * m, a = l * c + h * m, f.x = r, f.y = a), this._deathScaleBaseX !== void 0 && (g = this.baseAndVarianceValue(this._deathScaleBaseX, this._deathScaleVarianceX, !1)), this._deathScaleBaseY === void 0 || this._deathScaleLockAspect || (v = this.baseAndVarianceValue(this._deathScaleBaseY, this._deathScaleVarianceY, !1)), this._deathScaleBaseZ === void 0 || this._deathScaleLockAspect || (b = this.baseAndVarianceValue(this._deathScaleBaseZ, this._deathScaleVarianceZ, !1)), this._deathScaleLockAspect && (b = v = g), this._deathRotateBase !== void 0 && (w = this.baseAndVarianceValue(this._deathRotateBase, this._deathRotateVariance, !0)), this._deathOpacityBase !== void 0 && (C = this.baseAndVarianceValue(this._deathOpacityBase, this._deathOpacityVariance, !1)), D = new this._particle(this), this._ignoreCamera ? (i += this._translate.x, o += this._translate.y) : (i += this._worldMatrix.matrix[2], o += this._worldMatrix.matrix[5]), s += this._translate.z, _ *= this._scale.x, u *= this._scale.y, p *= this._scale.z, g *= this._scale.x, v *= this._scale.y, b *= this._scale.z, D.translateTo(i, o, s), D.rotateTo(0, 0, y * Math.PI / 180), D.scaleTo(_, u, p), D.opacity(d), this._applyDepthToParticles && D.depth(this._depth), this._applyLayerToParticles && D.layer(this._layer), typeof n == "object" && D.velocity.vector3(n, !1), typeof f == "object" && D.velocity.linearForceVector3(f, !1), B = [], w !== void 0 && B.push((new IgeTween).targetObj(D._rotate).properties({
									z : w * Math.PI / 180
								}).duration(x)), C !== void 0 && B.push((new IgeTween).targetObj(D).properties({
									_opacity : C
								}).duration(x)), S = {}, g !== void 0 && (S.x = g), v !== void 0 && (S.y = v), b !== void 0 && (S.z = b), (S.x || S.y || S.z) && B.push((new IgeTween).targetObj(D._scale).properties(S).duration(x)), typeof x == "number" && D.lifeSpan(x), this._particles.push(D), D.mount(this._particleMountTarget || this._parent), I = 0; B.length > I; I++)
							B[I].start()
					}
			}
			this._super(t)
		},
		particles : function () {
			return this._particles
		},
		_stringify : function () {
			var t = this._super();
			return t
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeParticleEmitter);
var IgeMap2d = IgeClass.extend({
		classId : "IgeMap2d",
		init : function (t) {
			this._mapData = t || []
		},
		tileData : function (t, e, i) {
			if (t !== void 0 && e !== void 0) {
				if (i !== void 0)
					return this._mapData[e] = this._mapData[e] || [], this._mapData[e][t] = i, this;
				if (this._mapData[e])
					return this._mapData[e][t]
			}
			return void 0
		},
		clearData : function (t, e) {
			return t !== void 0 && e !== void 0 && this._mapData[e] !== void 0 ? (delete this._mapData[e][t], !0) : !1
		},
		collision : function (t, e, i, o) {
			var s,
			n;
			if (i === void 0 && (i = 1), o === void 0 && (o = 1), t !== void 0 && e !== void 0)
				for (n = 0; o > n; n++)
					for (s = 0; i > s; s++)
						if (this.tileData(t + s, e + n))
							return !0;
			return !1
		},
		mapData : function (t) {
			return t !== void 0 ? (this._mapData = t, this) : this._mapData
		},
		mapDataString : function () {
			return JSON.stringify(this.mapData())
		},
		insertMapData : function () {},
		rotateData : function (t, e) {
			switch (e) {
			case  - 90:
				break;
			case 180:
				break;
			case 90:
			default:
			}
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeMap2d);
var IgeMapStack2d = IgeClass.extend({
		classId : "IgeMapStack2d",
		init : function (t) {
			this._mapData = t || []
		},
		tileData : function (t, e, i) {
			if (t !== void 0 && e !== void 0) {
				if (i !== void 0)
					return this._mapData[e] = this._mapData[e] || [], this._mapData[e][t] = [], this._mapData[e][t].push(i), this;
				if (this._mapData[e] !== void 0)
					return this._mapData[e][t]
			}
			return void 0
		},
		tileDataAtIndex : function (t, e, i) {
			return this._mapData[e] && this._mapData[e][t] ? this._mapData[e][t][i] : void 0
		},
		push : function (t, e, i) {
			return i !== void 0 ? (this._mapData[e] = this._mapData[e] || [], this._mapData[e][t] = this._mapData[e][t] || [], this._mapData[e][t].push(i), this) : !1
		},
		pull : function (t, e, i) {
			return this._mapData[e] && this._mapData[e][t] ? (this._mapData[e][t].pull(i), this) : !1
		},
		collision : function (t, e, i, o) {
			var s,
			n;
			if (i === void 0 && (i = 1), o === void 0 && (o = 1), t !== void 0 && e !== void 0)
				for (n = 0; o > n; n++)
					for (s = 0; i > s; s++)
						if (this._mapData[e + n] && this._mapData[e + n][t + s] && this._mapData[e + n][t + s].length)
							return !0;
			return !1
		},
		clearData : function (t, e) {
			return t !== void 0 && e !== void 0 && this._mapData[e] !== void 0 ? (delete this._mapData[e][t], !0) : !1
		},
		mapData : function (t) {
			return t !== void 0 ? (this._mapData = t, this) : this._mapData
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeMapStack2d);
var IgeTileMap2d = IgeEntity.extend({
		classId : "IgeTileMap2d",
		init : function (t, e) {
			this._alwaysInView = !0,
			this._super(),
			this.map = new IgeMap2d,
			this._tileWidth = t !== void 0 ? t : 40,
			this._tileHeight = e !== void 0 ? e : 40,
			this._drawGrid = 0,
			this._gridColor = "#ffffff"
		},
		drawGrid : function (t) {
			return t !== void 0 ? (this._drawGrid = t, this) : this._drawGrid
		},
		gridColor : function (t) {
			return t !== void 0 ? (this._gridColor = t, this) : this._gridColor
		},
		highlightOccupied : function (t) {
			return t !== void 0 ? (this._highlightOccupied = t, this) : this._highlightOccupied
		},
		highlightTileRect : function (t) {
			return t !== void 0 ? (this._highlightTileRect = t, this) : this._highlightTileRect
		},
		tileWidth : function (t) {
			return t !== void 0 ? (this._tileWidth = t, this) : this._tileWidth
		},
		tileHeight : function (t) {
			return t !== void 0 ? (this._tileHeight = t, this) : this._tileHeight
		},
		_childMounted : function (t) {
			t.occupyTile = this._objectOccupyTile,
			t.unOccupyTile = this._objectUnOccupyTile,
			t.overTiles = this._objectOverTiles,
			t.tileWidth = this.tileWidth,
			t.tileHeight = this.tileHeight,
			t._tileWidth = t._tileWidth || 1,
			t._tileHeight = t._tileHeight || 1,
			this._super(t)
		},
		_objectOccupyTile : function (t, e, i, o) {
			if (t !== void 0 && e !== void 0)
				this._parent.occupyTile(t, e, i, o, this);
			else {
				var s = new IgePoint(this._translate.x - (this._tileWidth / 2 - .5) * this._parent._tileWidth, this._translate.y - (this._tileHeight / 2 - .5) * this._parent._tileHeight, 0),
				n = this._parent.pointToTile(s);
				this._parent._mountMode === 1 && n.thisToIso(),
				this._parent.occupyTile(n.x, n.y, this._tileWidth, this._tileHeight, this)
			}
			return this
		},
		_objectUnOccupyTile : function (t, e, i, o) {
			if (t !== void 0 && e !== void 0)
				this._parent.unOccupyTile(t, e, i, o);
			else {
				var s = new IgePoint(this._translate.x - (this._tileWidth / 2 - .5) * this._parent._tileWidth, this._translate.y - (this._tileHeight / 2 - .5) * this._parent._tileHeight, 0),
				n = this._parent.pointToTile(s);
				this._parent._mountMode === 1 && n.thisToIso(),
				this._parent.unOccupyTile(n.x, n.y, this._tileWidth, this._tileHeight)
			}
			return this
		},
		_objectOverTiles : function () {
			var t,
			e,
			i = this._tileWidth || 1,
			o = this._tileHeight || 1,
			s = this._parent.pointToTile(this._translate),
			n = [];
			for (t = 0; i > t; t++)
				for (e = 0; o > e; e++)
					n.push(new IgePoint(s.x + t, s.y + e, 0));
			return n
		},
		_resizeEvent : function (t) {
			this._parent && (this._geometry = this._parent._geometry.clone()),
			this._super(t)
		},
		occupyTile : function (t, e, i, o, s) {
			var n,
			r;
			if (i === void 0 && (i = 1), o === void 0 && (o = 1), t = Math.floor(t), e = Math.floor(e), i = Math.floor(i), o = Math.floor(o), t !== void 0 && e !== void 0) {
				for (n = 0; i > n; n++)
					for (r = 0; o > r; r++)
						this.map.tileData(t + n, e + r, s);
				s._classId && (s._occupiedRect = new IgeRect(t, e, i, o))
			}
			return this
		},
		unOccupyTile : function (t, e, i, o) {
			var s,
			n,
			r;
			if (i === void 0 && (i = 1), o === void 0 && (o = 1), t = Math.floor(t), e = Math.floor(e), i = Math.floor(i), o = Math.floor(o), t !== void 0 && e !== void 0)
				for (s = 0; i > s; s++)
					for (n = 0; o > n; n++)
						r = this.map.tileData(t + s, e + n), r && r._occupiedRect && delete r._occupiedRect, this.map.clearData(t + s, e + n);
			return this
		},
		isTileOccupied : function (t, e, i, o) {
			return i === void 0 && (i = 1),
			o === void 0 && (o = 1),
			this.map.collision(t, e, i, o)
		},
		tileOccupiedBy : function (t, e) {
			return this.map.tileData(t, e)
		},
		mouseDown : function (t) {
			return t !== void 0 ? (this._tileMapMouseDown = t, this) : this._tileMapMouseDown
		},
		mouseUp : function (t) {
			return t !== void 0 ? (this._tileMapMouseUp = t, this) : this._tileMapMouseUp
		},
		mouseOver : function (t) {
			return t !== void 0 ? (this._tileMapMouseOver = t, this) : this._tileMapMouseOver
		},
		pointToTile : function (t) {
			var e,
			i,
			o,
			s = t.x,
			n = t.y;
			return this._mountMode === 0 && (e = s + this._tileWidth / 2, i = n + this._tileHeight / 2, o = new IgePoint(Math.floor(e / this._tileWidth), Math.floor(i / this._tileWidth))),
			this._mountMode === 1 && (e = s, i = n - this._tileHeight / 2, o = new IgePoint(e, i, 0).to2d(), o = new IgePoint(Math.floor(o.x / this._tileWidth) + 1, Math.floor(o.y / this._tileHeight) + 1)),
			o
		},
		mouseTileWorldXY : function () {
			return this._mountMode === 0 ? this._mouseTilePos.clone().thisMultiply(this._tileWidth, this._tileHeight, 0) : this._mountMode === 1 ? this._mouseTilePos.clone().thisMultiply(this._tileWidth, this._tileHeight, 0).thisToIso() : void 0
		},
		mouseToTile : function () {
			return this.pointToTile(this.mousePos())
		},
		scanRects : function (t) {
			var e,
			i,
			o = [],
			s = this.map._mapData.clone();
			for (i in s)
				if (s.hasOwnProperty(i))
					for (e in s[i])
						s[i].hasOwnProperty(e) && s[i][e] && (!t || t && t(s[i][e], e, i)) && o.push(this._scanRects(s, parseInt(e, 10), parseInt(i, 10), t));
			return o
		},
		_scanRects : function (t, e, i, o) {
			var s = {
				x : e,
				y : i,
				width : 1,
				height : 1
			},
			n = e + 1,
			r = i + 1;
			t[i][e] = 0;
			while (t[i][n] && (!o || o && o(t[i][n], n, i)))
				s.width++, t[i][n] = 0, n++;
			while (t[r] && t[r][e] && (!o || o && o(t[r][e], e, r))) {
				if (t[r][e - 1] && (!o || o && o(t[r][e - 1], e - 1, r)) || t[r][e + s.width] && (!o || o && o(t[r][e + s.width], e + s.width, r)))
					return s;
				for (n = e; e + s.width > n; n++)
					if (!t[r][n] || o && !o(t[r][n], n, r))
						return s;
				for (n = e; e + s.width > n; n++)
					t[r][n] = 0;
				s.height++,
				r++
			}
			return s
		},
		_calculateMousePosition : function () {
			this._mouseTilePos = this.pointToTile(this.mousePos())
		},
		tick : function (t) {
			var e,
			i,
			o,
			s,
			n,
			r,
			a,
			h,
			l,
			c = this._tileWidth,
			m = this._tileHeight;
			if (this._calculateMousePosition(), ige.input.mouseMove && this._tileMapMouseOver && this._tileMapMouseOver(this._mouseTilePos.x, this._mouseTilePos.y, ige.input.mouseMove), ige.input.mouseDown && this._tileMapMouseDown && this._tileMapMouseDown(this._mouseTilePos.x, this._mouseTilePos.y, ige.input.mouseDown), ige.input.mouseUp && this._tileMapMouseUp && this._tileMapMouseUp(this._mouseTilePos.x, this._mouseTilePos.y, ige.input.mouseUp), this._transformContext(t), this._drawGrid > 0) {
				for (t.strokeStyle = this._gridColor, l = this._drawGrid, i =  - (c / 2), o =  - (m / 2), s = i + c * l, n = o + m * l, e = 0; l >= e; e++)
					r = new IgePoint(i, o + m * e, 0), a = new IgePoint(s, o + m * e, 0), this._mountMode === 1 && (r = r.toIso(), a = a.toIso()), t.beginPath(), t.moveTo(r.x, r.y), t.lineTo(a.x, a.y), t.stroke();
				for (e = 0; l >= e; e++)
					r = new IgePoint(i + c * e, o, 0), a = new IgePoint(i + c * e, n, 0), this._mountMode === 1 && (r = r.toIso(), a = a.toIso()), t.beginPath(), t.moveTo(r.x, r.y), t.lineTo(a.x, a.y), t.stroke()
			}
			if (this._highlightOccupied) {
				t.fillStyle = "#ff0000";
				for (o in this.map._mapData)
					if (this.map._mapData[o])
						for (i in this.map._mapData[o])
							this.map._mapData[o][i] && (h = new IgePoint(c * i, m * o, 0), this._mountMode === 0 && t.fillRect(h.x - c / 2, h.y - m / 2, c, m), this._mountMode === 1 && (h.thisToIso(), t.beginPath(), t.moveTo(h.x, h.y - m / 2), t.lineTo(h.x + c, h.y), t.lineTo(h.x, h.y + m / 2), t.lineTo(h.x - c, h.y), t.lineTo(h.x, h.y - m / 2), t.fill()))
			}
			if (this._highlightTileRect)
				for (t.fillStyle = "#e4ff00", o = this._highlightTileRect.y; this._highlightTileRect.y + this._highlightTileRect.height > o; o++)
					for (i = this._highlightTileRect.x; this._highlightTileRect.x + this._highlightTileRect.width > i; i++)
						h = new IgePoint(c * i, m * o, 0), this._mountMode === 0 && t.fillRect(h.x - c / 2, h.y - m / 2, c, m), this._mountMode === 1 && (h.thisToIso(), t.beginPath(), t.moveTo(h.x, h.y - m / 2), t.lineTo(h.x + c, h.y), t.lineTo(h.x, h.y + m / 2), t.lineTo(h.x - c, h.y), t.lineTo(h.x, h.y - m / 2), t.fill());
			this._drawMouse && (t.fillStyle = "#6000ff", this._mountMode === 0 && t.fillRect(this._mouseTilePos.x * c - c / 2, this._mouseTilePos.y * m - m / 2, c, m), this._mountMode === 1 && (h = this._mouseTilePos.clone().thisMultiply(c, m, 0).thisToIso(), t.beginPath(), t.moveTo(h.x, h.y - m / 2), t.lineTo(h.x + c, h.y), t.lineTo(h.x, h.y + m / 2), t.lineTo(h.x - c, h.y), t.lineTo(h.x, h.y - m / 2), t.fill())),
			this._super(t, !0)
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeTileMap2d);
var IgeTextureMap = IgeTileMap2d.extend({
		classId : "IgeTextureMap",
		init : function (t, e) {
			this._super(t, e),
			this.map = new IgeMap2d,
			this._textureList = [],
			this._renderCenter = new IgePoint(0, 0, 0),
			this._cacheDirty = !0
		},
		autoSection : function (t) {
			return t !== void 0 ? (this._autoSection = t, this) : this._autoSection
		},
		drawSectionBounds : function (t) {
			return t !== void 0 ? (this._drawSectionBounds = t, this) : this._drawSectionBounds
		},
		cacheForceFrame : function () {
			this._cacheDirty = !0
		},
		negate : function (t) {
			if (t !== void 0) {
				var e,
				i,
				o = t.map._mapData,
				s = this.map._mapData;
				for (i in o)
					if (o.hasOwnProperty(i))
						for (e in o[i])
							o[i].hasOwnProperty(e) && s[i] && s[i][e] && delete s[i][e]
			}
			return this
		},
		addTexture : function (t) {
			return this._textureList.push(t),
			t._loaded || (this._allTexturesLoaded = !1),
			this._textureList.length - 1
		},
		allTexturesLoaded : function () {
			if (!this._allTexturesLoaded) {
				var t = this._textureList,
				e = t.length;
				while (e--)
					if (!t[e]._loaded)
						return !1
			}
			return this._allTexturesLoaded = !0,
			!0
		},
		paintTile : function (t, e, i, o) {
			t !== void 0 && e !== void 0 && i !== void 0 && ((o === void 0 || 1 > o) && (o = 1), this.map.tileData(t, e, [i, o]))
		},
		clearTile : function (t, e) {
			this.map.clearData(t, e)
		},
		loadMap : function (map) {
			if (map.textures) {
				this._textureList = [];
				var tex = [],
				i,
				self = this;
				for (i = 0; map.textures.length > i; i++)
					eval("tex[" + i + "] = " + map.textures[0]), self.addTexture(tex[i]);
				self.map.mapData(map.data)
			} else
				this.map.mapData(map.data);
			return this
		},
		saveMap : function () {
			var t,
			e,
			i,
			o = [],
			s = 0,
			n = 0,
			r = this.map._mapData;
			for (t = 0; this._textureList.length > t; t++)
				o.push(this._textureList[t].stringify());
			for (i in r)
				if (r.hasOwnProperty(i))
					for (e in r[i])
						r[i].hasOwnProperty(e) && (s > e && (s = e), n > i && (n = i));
			return JSON.stringify({
				textures : o,
				data : this.map.mapDataString(),
				dataXY : [s, n]
			})
		},
		tileTextureIndex : function (t, e, i) {
			if (t !== void 0 && e !== void 0) {
				var o = this.map.tileData(t, e);
				if (i === void 0)
					return o[0];
				o[0] = i
			}
		},
		tileTextureCell : function (t, e, i) {
			if (t !== void 0 && e !== void 0) {
				var o = this.map.tileData(t, e);
				if (i === void 0)
					return o[1];
				o[1] = i
			}
		},
		convertOldData : function (t) {
			var e,
			i,
			o = [];
			for (e in t)
				if (t.hasOwnProperty(e))
					for (i in t[e])
						t[e].hasOwnProperty(i) && (o[i] = o[i] || [], o[i][e] = t[e][i]);
			console.log(JSON.stringify(o))
		},
		tick : function (t) {
			this._super(t);
			var e,
			i,
			o,
			s,
			n,
			r,
			a,
			h,
			l,
			c,
			m,
			_,
			u,
			p,
			y,
			d,
			x,
			f,
			g = this.map._mapData,
			v = this._newTileEntity();
			if (this._autoSection > 0) {
				if (this._cacheDirty && this.allTexturesLoaded()) {
					this._sections = [],
					this._sectionCtx = [];
					for (i in g)
						if (g.hasOwnProperty(i))
							for (e in g[i])
								if (g[i].hasOwnProperty(e) && (n = parseInt(e), r = parseInt(i), this._mountMode === 0 && (a = n, h = r), this._mountMode === 1 && (o = n * this._tileWidth, s = r * this._tileHeight, a = (o - s) / this._tileWidth, h = (o + s) * .5 / this._tileHeight, l = new IgePoint(a, h, 0), a = l.x, h = l.y), c = g[i][e], m = Math.floor(a / this._autoSection), _ = Math.floor(h / this._autoSection), this._ensureSectionExists(m, _), y = this._sectionCtx[m][_], c && (d = this._renderTile(y, n, r, c, v, null, m, _))))
									for (f = 0; d.length > f; f++)
										x = d[f], u = m, p = _, x.x && (u += x.x), x.y && (p += x.y), this._ensureSectionExists(u, p), y = this._sectionCtx[u][p], this._sectionTileRegion = this._sectionTileRegion || [], this._sectionTileRegion[u] = this._sectionTileRegion[u] || [], this._sectionTileRegion[u][p] = this._sectionTileRegion[u][p] || [], this._sectionTileRegion[u][p][n] = this._sectionTileRegion[u][p][n] || [], this._sectionTileRegion[u][p][n][r] || (this._sectionTileRegion[u][p][n][r] = !0, this._renderTile(y, n, r, c, v, null, u, p));
					this._cacheDirty = !1,
					delete this._sectionTileRegion
				}
				this._drawSectionsToCtx(t)
			} else
				for (i in g)
					if (g.hasOwnProperty(i))
						for (e in g[i])
							g[i].hasOwnProperty(e) && (c = g[i][e], c && this._renderTile(t, e, i, c, v))
		},
		_ensureSectionExists : function (t, e) {
			var i;
			this._sections[t] = this._sections[t] || [],
			this._sectionCtx[t] = this._sectionCtx[t] || [],
			this._sections[t][e] || (this._sections[t][e] = document.createElement("canvas"), this._sections[t][e].width = this._tileWidth * this._autoSection, this._sections[t][e].height = this._tileHeight * this._autoSection, i = this._sectionCtx[t][e] = this._sections[t][e].getContext("2d"), ige._globalSmoothing ? (i.imageSmoothingEnabled = !0, i.webkitImageSmoothingEnabled = !0, i.mozImageSmoothingEnabled = !0) : (i.imageSmoothingEnabled = !1, i.webkitImageSmoothingEnabled = !1, i.mozImageSmoothingEnabled = !1), i.translate(this._tileWidth / 2, this._tileHeight / 2))
		},
		_drawSectionsToCtx : function (t) {
			var e,
			i,
			o,
			s,
			n,
			r,
			a,
			h,
			l;
			this._mountMode === 1 && t.translate( - (this._tileWidth / 2),  - (this._tileHeight / 2)),
			h = this._tileWidth * this._autoSection,
			l = this._tileHeight * this._autoSection;
			for (e in this._sections)
				if (this._sections.hasOwnProperty(e))
					for (i in this._sections[e])
						this._sections[e].hasOwnProperty(i) && (s = e * this._tileWidth * this._autoSection, n = i * this._tileHeight * this._autoSection, r = this._translate.x + s - ige._currentCamera._translate.x, a = this._translate.y + n - ige._currentCamera._translate.y, this._mountMode === 1 && (r -= this._tileWidth / 2, a -= this._tileHeight / 2), -this._geometry.x2 > r + h + this._tileHeight / 2 || r - this._tileWidth / 2 > this._geometry.x2 || -this._geometry.y2 > a + l + this._tileHeight / 2 || a > this._geometry.y2 || (o = this._sections[e][i], t.drawImage(o, 0, 0, h, l, s, n, h, l), ige._drawCount++, this._drawSectionBounds && (t.strokeStyle = "#ff00f6", t.strokeRect(e * this._tileWidth * this._autoSection, i * this._tileHeight * this._autoSection, this._tileWidth * this._autoSection, this._tileHeight * this._autoSection))))
		},
		_renderTile : function (t, e, i, o, s, n, r, a) {
			var h,
			l,
			c,
			m,
			_,
			u,
			p,
			y,
			d,
			x,
			f,
			g,
			v,
			b = this._mountMode === 1 ? this._tileWidth / 2 : 0;
			return this._mountMode === 1 ? this._tileHeight / 2 : 0,
			this._mountMode === 0 && (h = e * this._tileWidth, l = i * this._tileHeight),
			this._mountMode === 1 && (d = e * this._tileWidth, x = i * this._tileHeight, f = d - x, g = (d + x) * .5, h = f, l = g),
			r !== void 0 && (h -= r * this._autoSection * this._tileWidth),
			a !== void 0 && (l -= a * this._autoSection * this._tileHeight),
			!n || n.xyInside(h, l) ? (0 > h - b && (c = c || [], c.push({
						x : -1
					}), m = !0, y = y || {}, y.x = -1), h + b > t.canvas.width - this._tileWidth && (c = c || [], c.push({
						x : 1
					}), _ = !0, y = y || {}, y.x = 1), 0 > l - 0 && (c = c || [], c.push({
						y : -1
					}), u = !0, y = y || {}, y.y = -1), l + 0 > t.canvas.height - this._tileHeight && (c = c || [], c.push({
						y : 1
					}), p = !0, y = y || {}, y.y = 1), (m || u || _ || p) && c.push(y), t.save(), t.translate(h, l), v = this._textureList[o[0]], s._cell = o[1], v.render(t, s, ige._tickDelta), t.restore(), c) : void 0
		},
		_newTileEntity : function () {
			return this._mountMode === 0 ? {
				_cell : 1,
				_geometry : {
					x : this._tileWidth,
					y : this._tileHeight
				},
				_renderPos : {
					x : -this._tileWidth / 2,
					y : -this._tileHeight / 2
				}
			}
			 : this._mountMode === 1 ? {
				_cell : 1,
				_geometry : {
					x : this._tileWidth * 2,
					y : this._tileHeight
				},
				_renderPos : {
					x : -this._tileWidth,
					y : -this._tileHeight / 2
				}
			}
			 : void 0
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeTextureMap);
var IgeCollisionMap2d = IgeEntity.extend({
		classId : "IgeCollisionMap2d",
		init : function () {
			this._super(),
			this.map = new IgeMap2d
		},
		mapData : function (t) {
			return t !== void 0 ? (this.map.mapData(t), this) : this.map.mapData()
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeCollisionMap2d);
var IgeCamera = IgeEntity.extend({
		classId : "IgeCamera",
		init : function (t) {
			this._super(),
			this._trackRotateTarget = void 0,
			this._trackTranslateTarget = void 0,
			this._trackRotateSmoothing = void 0,
			this._trackTranslateSmoothing = void 0,
			this._entity = t
		},
		limit : function (t) {
			return t !== void 0 ? (this._limit = t, this._entity) : this._limit
		},
		panTo : function (t, e, i) {
			return t !== void 0 && this._translate.tween().properties({
				x : t.x,
				y : t.y,
				z : t.z
			}).duration(e).easing(i).start(),
			this._entity
		},
		panBy : function (t, e, i) {
			return t !== void 0 && this._translate.tween().properties({
				x : t.x + this._translate.x,
				y : t.y + this._translate.y,
				z : t.z + this._translate.z
			}).duration(e).easing(i).start(),
			this._entity
		},
		trackTranslate : function (t, e, i) {
			return t !== void 0 ? (this.log("Camera on viewport " + this._entity.id() + " is now tracking translation target " + t.id()), this._trackTranslateRounding = i, this._trackTranslateSmoothing = 1 > e ? 0 : e, this._trackTranslateTarget = t, this._entity) : this._trackTranslateTarget
		},
		trackTranslateSmoothing : function (t) {
			return t !== void 0 ? (this._trackTranslateSmoothing = t, this) : this._trackTranslateSmoothing
		},
		trackTranslateRounding : function (t) {
			return t !== void 0 ? (this._trackTranslateRounding = t, this) : this._trackTranslateRounding
		},
		unTrackTranslate : function () {
			delete this._trackTranslateTarget
		},
		trackRotate : function (t, e) {
			return t !== void 0 ? (this.log("Camera on viewport " + this._entity.id() + " is now tracking rotation of target " + t.id()), this._trackRotateSmoothing = 1 > e ? 0 : e, this._trackRotateTarget = t, this._entity) : this._trackRotateTarget
		},
		trackRotateSmoothing : function (t) {
			return t !== void 0 ? (this._trackRotateSmoothing = t, this) : this._trackRotateSmoothing
		},
		unTrackRotate : function () {
			delete this._trackRotateTarget
		},
		lookAt : function (t, e, i) {
			return t !== void 0 && (t.updateTransform(), e ? this._translate.tween().properties({
					x : Math.floor(t._worldMatrix.matrix[2]),
					y : Math.floor(t._worldMatrix.matrix[5]),
					z : 0
				}).duration(e).easing(i).start() : (this._translate.x = Math.floor(t._worldMatrix.matrix[2]), this._translate.y = Math.floor(t._worldMatrix.matrix[5])), this.updateTransform()),
			this
		},
		update : function () {
			if (this._trackTranslateTarget) {
				var t,
				e,
				i,
				o,
				s = this._trackTranslateTarget,
				n = s._worldMatrix.matrix,
				r = n[2],
				a = n[5];
				this._trackTranslateSmoothing ? (t = this._translate.x, e = this._translate.y, i = Math.round(r - t), o = Math.round(a - e), this._trackTranslateRounding ? (this._translate.x += Math.round(i / this._trackTranslateSmoothing), this._translate.y += Math.round(o / this._trackTranslateSmoothing)) : (this._translate.x += i / this._trackTranslateSmoothing, this._translate.y += o / this._trackTranslateSmoothing)) : this.lookAt(this._trackTranslateTarget)
			}
			if (this._trackRotateTarget) {
				var h,
				l,
				c = this._trackRotateTarget._parent !== void 0 ? this._trackRotateTarget._parent._rotate.z : 0,
				m =  - (c + this._trackRotateTarget._rotate.z);
				this._trackRotateSmoothing ? (h = this._rotate.z, l = m - h, this._rotate.z += l / this._trackRotateSmoothing) : this._rotate.z = m
			}
			this.updateTransform()
		},
		tick : function (t) {
			this._localMatrix.transformRenderingContext(t)
		},
		updateTransform : function () {
			if (this._localMatrix.identity(), this._localMatrix.multiply(this._localMatrix._newRotate(this._rotate.z)), this._localMatrix.multiply(this._localMatrix._newScale(this._scale.x, this._scale.y)), this._mode === 0 && this._localMatrix.multiply(this._localMatrix._newTranslate(-this._translate.x, -this._translate.y)), this._mode === 1) {
				var t = this._translateIso = new IgePoint(this._translate.x, this._translate.y, this._translate.z + this._geometry.z / 2).toIso();
				this._parent && this._parent._geometry.z && (t.y += this._parent._geometry.z / 1.6),
				this._localMatrix.multiply(this._localMatrix._newTranslate(t.x, t.y))
			}
			this._parent ? (this._worldMatrix.copy(this._parent._worldMatrix), this._worldMatrix.multiply(this._localMatrix)) : this._worldMatrix.copy(this._localMatrix)
		},
		_stringify : function () {
			var t,
			e = this._super();
			for (t in this)
				if (this.hasOwnProperty(t) && this[t] !== void 0)
					switch (t) {
					case "_trackTranslateTarget":
						e += ".trackTranslate(ige.$('" + this._trackTranslateTarget.id() + "'), " + this.trackTranslateSmoothing() + ")";
						break;
					case "_trackRotateTarget":
						e += ".trackRotate(ige.$('" + this._trackRotateTarget.id() + "'), " + this.trackRotateSmoothing() + ")"
					}
			return e
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeCamera);
var IgeViewport = IgeEntity.extend([{
				extension : IgeUiStyleExtension,
				overwrite : !0
			}, {
				extension : IgeUiPositionExtension,
				overwrite : !0
			}
		], {
		classId : "IgeViewport",
		IgeViewport : !0,
		init : function (t) {
			this._alwaysInView = !0,
			this._super(),
			this._mouseAlwaysInside = !0,
			this._mousePos = new IgePoint(0, 0, 0),
			this._overflow = "",
			this._uiX = 0,
			this._uiY = 0,
			t === void 0 && (t = {
					left : 0,
					top : 0,
					width : ige._geometry.x,
					height : ige._geometry.y,
					autoSize : !0
				}),
			this._geometry = new IgePoint(t.width || 250, t.height || 150, 0),
			this.camera = new IgeCamera(this),
			this.camera._entity = this
		},
		autoSize : function (t) {
			return t !== void 0 ? (this._autoSize = t, this) : this._autoSize
		},
		scene : function (t) {
			return t !== void 0 ? (this._scene = t, this) : this._scene
		},
		mousePos : function () {
			return this._mousePos.clone()
		},
		mousePosWorld : function () {
			return this._transformPoint(this._mousePos.clone())
		},
		viewArea : function () {
			var t = this.aabb(),
			e = this.camera._translate;
			return new IgeRect(t.x + e.x, t.y + e.y, t.width, t.height)
		},
		update : function (t) {
			this._scene && (ige._currentCamera = this.camera, ige._currentViewport = this, this._scene._parent = this, this.camera.update(t), this._super(t), this._scene.newFrame() && this._scene.update(t))
		},
		tick : function (t) {
			if (this._scene && (ige._currentCamera = this.camera, ige._currentViewport = this, this._scene._parent = this, this._super(t), t.translate( - (this._geometry.x * this._origin.x) | 0,  - (this._geometry.y * this._origin.y) | 0), t.clearRect(0, 0, this._geometry.x, this._geometry.y), t.beginPath(), t.rect(0, 0, this._geometry.x, this._geometry.y), this._borderColor && (t.strokeStyle = this._borderColor, t.stroke()), t.clip(), t.translate(this._geometry.x / 2 | 0, this._geometry.y / 2 | 0), this.camera.tick(t), t.save(), this._scene.tick(t), t.restore(), this._drawBounds && t === ige._ctx && (t.save(), t.translate(-this._translate.x, -this._translate.y), this.drawAABBs(t, this._scene, 0), t.restore()), this._drawMouse && t === ige._ctx)) {
				t.save();
				var e = this.mousePos();
				t.scale(1 / this.camera._scale.x, 1 / this.camera._scale.y);
				var i,
				o = Math.floor(e.x * this.camera._scale.x),
				s = Math.floor(e.y * this.camera._scale.y);
				t.fillStyle = "#fc00ff",
				t.fillRect(o - 5, s - 5, 10, 10),
				i = t.measureText("Viewport " + this.id() + " :: " + o + ", " + s),
				t.fillText("Viewport " + this.id() + " :: " + o + ", " + s, o - i.width / 2, s - 15),
				t.restore()
			}
		},
		drawBoundsLimitId : function (t) {
			return t !== void 0 ? (this._drawBoundsLimitId = t, this) : this._drawBoundsLimitId
		},
		drawBoundsLimitCategory : function (t) {
			return t !== void 0 ? (this._drawBoundsLimitCategory = t, this) : this._drawBoundsLimitCategory
		},
		drawAABBs : function (t, e, i) {
			var o,
			s,
			n,
			r,
			a,
			h,
			l,
			c,
			m,
			_,
			u,
			p,
			y,
			d,
			x,
			f,
			g,
			v,
			b,
			w = e._children;
			if (w) {
				o = w.length;
				while (o--)
					s = w[o], i++, s._shouldRender !== !1 && ((!this._drawBoundsLimitId && !this._drawBoundsLimitCategory || this._drawBoundsLimitId && this._drawBoundsLimitId === s.id() || this._drawBoundsLimitCategory && this._drawBoundsLimitCategory === s.category()) && typeof s.aabb == "function" && (n = s.aabb(), n && ((s._drawBounds || s._drawBounds === void 0) && (t.strokeStyle = "#00deff", t.strokeRect(n.x, n.y, n.width, n.height), s._parent && s._parent._mountMode === 1 && (t.save(), t.translate(n.x + n.width / 2, n.y + n.height / 2), a = s._geometry, h = new IgePoint( - (a.x / 2), 0, 0).toIso(), l = new IgePoint( + (a.x / 2), 0, 0).toIso(), c = new IgePoint(0,  - (a.y / 2), 0).toIso(), m = new IgePoint(0,  + (a.y / 2), 0).toIso(), _ = new IgePoint(0, 0,  - (a.z / 2)).toIso(), u = new IgePoint(0, 0,  + (a.z / 2)).toIso(), p = new IgePoint( - (a.x / 2),  - (a.y / 2),  - (a.z / 2)).toIso(), y = new IgePoint( + (a.x / 2),  - (a.y / 2),  - (a.z / 2)).toIso(), d = new IgePoint( + (a.x / 2),  + (a.y / 2),  - (a.z / 2)).toIso(), x = new IgePoint( - (a.x / 2),  + (a.y / 2),  - (a.z / 2)).toIso(), f = new IgePoint( - (a.x / 2),  - (a.y / 2), a.z / 2).toIso(), g = new IgePoint( + (a.x / 2),  - (a.y / 2), a.z / 2).toIso(), v = new IgePoint( + (a.x / 2),  + (a.y / 2), a.z / 2).toIso(), b = new IgePoint( - (a.x / 2),  + (a.y / 2), a.z / 2).toIso(), r = t.globalAlpha, t.globalAlpha = 1, t.strokeStyle = "#ff0000", t.beginPath(), t.moveTo(h.x, h.y), t.lineTo(l.x, l.y), t.stroke(), t.strokeStyle = "#00ff00", t.beginPath(), t.moveTo(c.x, c.y), t.lineTo(m.x, m.y), t.stroke(), t.strokeStyle = "#fffc00", t.beginPath(), t.moveTo(_.x, _.y), t.lineTo(u.x, u.y), t.stroke(), t.strokeStyle = "#a200ff", t.globalAlpha = .6, t.fillStyle = "#545454", t.beginPath(), t.moveTo(d.x, d.y), t.lineTo(x.x, x.y), t.lineTo(b.x, b.y), t.lineTo(v.x, v.y), t.lineTo(d.x, d.y), t.fill(), t.stroke(), t.fillStyle = "#282828", t.beginPath(), t.moveTo(d.x, d.y), t.lineTo(y.x, y.y), t.lineTo(g.x, g.y), t.lineTo(v.x, v.y), t.lineTo(d.x, d.y), t.fill(), t.stroke(), t.fillStyle = "#676767", t.beginPath(), t.moveTo(f.x, f.y), t.lineTo(g.x, g.y), t.lineTo(v.x, v.y), t.lineTo(b.x, b.y), t.lineTo(f.x, f.y), t.fill(), t.stroke(), t.globalAlpha = r, t.restore())), this._drawBoundsData && (s._drawBounds || s._drawBoundsData === void 0) && (t.globalAlpha = 1, t.fillStyle = "#f6ff00", t.fillText("ID: " + s.id() + " " + "(" + s.classId() + ") " + s.layer() + ":" + s.depth().toFixed(0), n.x + n.width + 3, n.y + 10), t.fillText("X: " + s._translate.x.toFixed(2) + ", " + "Y: " + s._translate.y.toFixed(2) + ", " + "Z: " + s._translate.z.toFixed(2), n.x + n.width + 3, n.y + 20)))), this.drawAABBs(t, s, i))
			}
		},
		_resizeEvent : function (t) {
			this._autoSize && this._parent && (this._geometry = this._parent._geometry.clone()),
			this._updateUiPosition(),
			this._scene && this._scene._resizeEvent(t)
		},
		_stringify : function () {
			var t,
			e = this._super();
			for (t in this)
				if (this.hasOwnProperty(t) && this[t] !== void 0)
					switch (t) {
					case "_autoSize":
						e += ".autoSize(" + this._autoSize + ")";
						break;
					case "_scene":
						e += ".scene(ige.$('" + this.scene().id() + "'))"
					}
			return e
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeViewport);
var IgeScene2d = IgeEntity.extend({
		classId : "IgeScene2d",
		init : function () {
			this._mouseAlwaysInside = !0,
			this._alwaysInView = !0,
			this._super(),
			this._shouldRender = !0,
			this._autoSize = !0,
			this._geometry.x = ige._geometry.x,
			this._geometry.y = ige._geometry.y
		},
		autoSize : function (t) {
			return t !== void 0 ? (this._autoSize = t, this) : this._autoSize
		},
		shouldRender : function (t) {
			return t !== void 0 ? (this._shouldRender = t, this) : this._shouldRender
		},
		ignoreCamera : function (t) {
			return t !== void 0 ? (this._ignoreCamera = t, this) : this._ignoreCamera
		},
		update : function (t) {
			if (this._ignoreCamera) {
				var e = ige._currentCamera;
				this.translateTo(e._translate.x, e._translate.y, e._translate.z),
				this.scaleTo(1 / e._scale.x, 1 / e._scale.y, 1 / e._scale.z),
				this.rotateTo(-e._rotate.x, -e._rotate.y, -e._rotate.z)
			}
			this._super(t)
		},
		tick : function (t) {
			this._shouldRender && this._super(t)
		},
		_resizeEvent : function (t) {
			this._autoSize && (this._geometry = ige._geometry.clone());
			var e = this._children,
			i = e.length;
			while (i--)
				e[i]._resizeEvent(t)
		},
		_stringify : function () {
			var t,
			e = this._super();
			for (t in this)
				if (this.hasOwnProperty(t) && this[t] !== void 0)
					switch (t) {
					case "_shouldRender":
						e += ".shouldRender(" + this.shouldRender() + ")";
						break;
					case "_autoSize":
						e += ".autoSize(" + this.autoSize() + ")"
					}
			return e
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeScene2d);
var IgeQuest = IgeEventingClass.extend({
		classId : "IgeQuest",
		init : function (t, e) {
			this._linear = !1,
			this._items = [],
			this._itemCount = 0,
			this._eventCount = 0,
			this._itemCompleteCount = 0,
			this._eventCompleteCount = 0,
			this._started = !1,
			this._isComplete = !1,
			t !== void 0 && this.items(t),
			e !== void 0 && (this._completeCallback = e)
		},
		complete : function (t) {
			return t !== void 0 ? (this._completeCallback = t, this) : this._completeCallback
		},
		isComplete : function (t) {
			return t !== void 0 ? (this._isComplete = t, this) : this._isComplete
		},
		linear : function (t) {
			return t !== void 0 ? (this._linear = t, this) : this._linear
		},
		items : function (t) {
			if (t !== void 0) {
				this._items = t;
				var e,
				i = this._items,
				o = i.length,
				s = 0;
				for (e = 0; o > e; e++)
					s += i[e].count;
				return this._eventCount = s,
				this._itemCount = o,
				this
			}
			return this._items
		},
		itemCount : function () {
			return this._itemCount
		},
		eventCount : function () {
			return this._eventCount
		},
		eventCompleteCount : function () {
			return this._eventCompleteCount
		},
		itemCompleteCount : function () {
			return this._itemCompleteCount
		},
		percentComplete : function () {
			return Math.floor(100 / this._eventCount * this._eventCompleteCount)
		},
		start : function () {
			if (this._started)
				this.log("Cannot start quest because it has already been started!", "warning"), this.emit("alreadyStarted");
			else {
				var t,
				e = this._items,
				i = e.length;
				if (this._started = !0, this._linear)
					this._setupItemListener(e[0]);
				else
					for (t = 0; i > t; t++)
						this._setupItemListener(e[t]);
				this.emit("started")
			}
			return this
		},
		stop : function () {
			return this._started ? (this._started = !1, this.emit("stopped")) : (this.log("Cannot stop quest because it has not been started yet!", "warning"), this.emit("notStarted")),
			this
		},
		reset : function () {
			var t,
			e,
			i = this._items,
			o = i.length;
			for (t = 0; o > t; t++)
				e = i[t], e._complete = !1, e._eventCount = 0, e._listener && e.emitter.off(e.eventName, e._listener), delete e._listener;
			return this._eventCompleteCount = 0,
			this._itemCompleteCount = 0,
			this._isComplete = !1,
			this.emit("reset"),
			this
		},
		_setupItemListener : function (t) {
			var e = this;
			t._listener || (t._eventCount = 0, t._complete = !1, t._listener = t.emitter.on(t.eventName, function () {
						e._started && (t.eventEvaluate ? t.eventEvaluate.apply(e, arguments) && e._eventComplete(t) : e._eventComplete(t))
					}))
		},
		_eventComplete : function (t) {
			t._eventCount++,
			this._eventCompleteCount++,
			t.eventCallback && t.eventCallback.apply(this, t),
			this.emit("eventComplete", t),
			t._eventCount === t.count && this._itemComplete(t)
		},
		_itemComplete : function (t) {
			var e,
			i = this._items;
			t._complete = !0,
			t.emitter.off(t.eventName, t._listener),
			delete t._listener,
			this._itemCompleteCount++,
			t.itemCallback && t.itemCallback.apply(this, t),
			this.emit("itemComplete", t),
			this._update(),
			this._started && this._linear && this.itemCount() > this._itemCompleteCount && (e = i.indexOf(t), this._setupItemListener(i[e + 1]), this.emit("nextItem", i[e + 1]))
		},
		_update : function () {
			this._itemCompleteCount === this.itemCount() && (this._isComplete = !0, this._completeCallback.apply(this), this.emit("complete"), this.stop(), this.reset())
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeQuest);
var IgeBox2dComponent = IgeEventingClass.extend({
		classId : "IgeBox2dComponent",
		componentId : "box2d",
		init : function (t, e) {
			ige._state !== 0 && this.log("Cannot add box2d component to the ige instance once the engine has started!", "error"),
			this._entity = t,
			this._options = e,
			this._mode = 0,
			this.b2Color = Box2D.Common.b2Color,
			this.b2Vec2 = Box2D.Common.Math.b2Vec2,
			this.b2Math = Box2D.Common.Math.b2Math,
			this.b2Shape = Box2D.Collision.Shapes.b2Shape,
			this.b2BodyDef = Box2D.Dynamics.b2BodyDef,
			this.b2Body = Box2D.Dynamics.b2Body,
			this.b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
			this.b2Fixture = Box2D.Dynamics.b2Fixture,
			this.b2World = Box2D.Dynamics.b2World,
			this.b2MassData = Box2D.Collision.Shapes.b2MassData,
			this.b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
			this.b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
			this.b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
			this.b2ContactListener = Box2D.Dynamics.b2ContactListener,
			this.b2Distance = Box2D.Collision.b2Distance,
			this.b2Contact = Box2D.Dynamics.Contacts.b2Contact,
			this.b2FilterData = Box2D.Dynamics.b2FilterData,
			this.b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef,
			this.b2Contact.prototype.igeEntityA = function () {
				var t = this.m_fixtureA.m_body._entity;
				return t._box2dOurContactFixture = this.m_fixtureA,
				t._box2dTheirContactFixture = this.m_fixtureB,
				t
			},
			this.b2Contact.prototype.igeEntityB = function () {
				var t = this.m_fixtureB.m_body._entity;
				return t._box2dOurContactFixture = this.m_fixtureB,
				t._box2dTheirContactFixture = this.m_fixtureA,
				t
			},
			this.b2Contact.prototype.igeEitherId = function (t, e) {
				return e ? !(this.m_fixtureA.m_body._entity._id !== t && this.m_fixtureB.m_body._entity._id !== t || this.m_fixtureA.m_body._entity._id !== e && this.m_fixtureB.m_body._entity._id !== e) : this.m_fixtureA.m_body._entity._id === t || this.m_fixtureB.m_body._entity._id === t
			},
			this.b2Contact.prototype.igeEitherCategory = function (t, e) {
				return e ? !(this.m_fixtureA.m_body._entity._category !== t && this.m_fixtureB.m_body._entity._category !== t || this.m_fixtureA.m_body._entity._category !== e && this.m_fixtureB.m_body._entity._category !== e) : this.m_fixtureA.m_body._entity._category === t || this.m_fixtureB.m_body._entity._category === t
			},
			this.b2Contact.prototype.igeBothCategories = function (t) {
				return this.m_fixtureA.m_body._entity._category === t && this.m_fixtureB.m_body._entity._category === t
			},
			this.b2Contact.prototype.igeEntityByCategory = function (t) {
				return this.m_fixtureA.m_body._entity._category === t ? this.igeEntityA() : this.m_fixtureB.m_body._entity._category === t ? this.igeEntityB() : void 0
			},
			this.b2Contact.prototype.igeEntityById = function (t) {
				return this.m_fixtureA.m_body._entity._id === t ? this.igeEntityA() : this.m_fixtureB.m_body._entity._id === t ? this.igeEntityB() : void 0
			},
			this.b2Contact.prototype.igeEntityByFixtureId = function (t) {
				return this.m_fixtureA.igeId === t ? this.igeEntityA() : this.m_fixtureB.igeId === t ? this.igeEntityB() : void 0
			},
			this.b2Contact.prototype.igeOtherEntity = function (t) {
				return this.m_fixtureA.m_body._entity === t ? this.igeEntityB() : this.igeEntityA()
			},
			this._sleep = !0,
			this._scaleRatio = 30,
			this._gravity = new this.b2Vec2(0, 0),
			this._removeWhenReady = [],
			this.log("Physics component initiated!")
		},
		useWorker : function (t) {
			return typeof Worker != "undefined" ? t !== void 0 ? (this._useWorker = t, this._entity) : this._useWorker : (this.log("Web workers were not detected on this browser. Cannot access useWorker() method.", "warning"), void 0)
		},
		mode : function (t) {
			return t !== void 0 ? (this._mode = t, this._entity) : this._mode
		},
		sleep : function (t) {
			return t !== void 0 ? (this._sleep = t, this._entity) : this._sleep
		},
		scaleRatio : function (t) {
			return t !== void 0 ? (this._scaleRatio = t, this._entity) : this._scaleRatio
		},
		gravity : function (t, e) {
			return t !== void 0 && e !== void 0 ? (this._gravity = new this.b2Vec2(t, e), this._entity) : this._gravity
		},
		world : function () {
			return this._world
		},
		createWorld : function () {
			return this._world = new this.b2World(this._gravity, this._sleep),
			this.log("World created"),
			this._entity
		},
		createFixture : function (t) {
			var e,
			i = new this.b2FixtureDef;
			for (e in t)
				t.hasOwnProperty(e) && e !== "shape" && e !== "filter" && (i[e] = t[e]);
			return i
		},
		createBody : function (t, e) {
			var i,
			o,
			s,
			n,
			r,
			a,
			h,
			l,
			c,
			m,
			_,
			u,
			p = new this.b2BodyDef;
			switch (e.type) {
			case "static":
				p.type = this.b2Body.b2_staticBody;
				break;
			case "dynamic":
				p.type = this.b2Body.b2_dynamicBody
			}
			for (i in e)
				if (e.hasOwnProperty(i))
					switch (i) {
					case "type":
					case "gravitic":
					case "fixedRotation":
					case "fixtures":
						break;
					default:
						p[i] = e[i]
					}
			p.position = new this.b2Vec2(t._translate.x / this._scaleRatio, t._translate.y / this._scaleRatio),
			o = this._world.CreateBody(p);
			for (i in e)
				if (e.hasOwnProperty(i))
					switch (i) {
					case "gravitic":
						e.gravitic || (o.m_nonGravitic = !0);
						break;
					case "fixedRotation":
						e.fixedRotation && o.SetFixedRotation(!0);
						break;
					case "fixtures":
						for (l = 0; e.fixtures.length > l; l++) {
							if (s = e.fixtures[l], n = this.createFixture(s), n.igeId = s.igeId, s.shape) {
								switch (s.shape.type) {
								case "circle":
									a = new this.b2CircleShape,
									s.shape.data ? a.SetRadius(s.shape.data.radius / this._scaleRatio) : a.SetRadius(t._geometry.x / this._scaleRatio / 2);
									break;
								case "polygon":
									a = new this.b2PolygonShape,
									a.SetAsArray(s.shape.data._poly, s.shape.data.length());
									break;
								case "rectangle":
									a = new this.b2PolygonShape,
									s.shape.data ? (c = s.shape.data.x !== void 0 ? s.shape.data.x : 0, m = s.shape.data.y !== void 0 ? s.shape.data.y : 0, _ = s.shape.data.width !== void 0 ? s.shape.data.width : t._geometry.x / 2, u = s.shape.data.height !== void 0 ? s.shape.data.height : t._geometry.y / 2) : (c = 0, m = 0, _ = t._geometry.x / 2, u = t._geometry.y / 2),
									a.SetAsOrientedBox(_ / this._scaleRatio, u / this._scaleRatio, new this.b2Vec2(c / this._scaleRatio, m / this._scaleRatio), 0)
								}
								a && (n.shape = a, r = o.CreateFixture(n), r.igeId = n.igeId)
							}
							s.filter && r && (h = new ige.box2d.b2FilterData, s.filter.categoryBits !== void 0 && (h.categoryBits = s.filter.categoryBits), s.filter.maskBits !== void 0 && (h.maskBits = s.filter.maskBits), s.filter.categoryIndex !== void 0 && (h.categoryIndex = s.filter.categoryIndex), r.SetFilterData(h)),
							s.density !== void 0 && r && r.SetDensity(s.density)
						}
					}
			return o._entity = t,
			o
		},
		staticsFromMap : function (t, e) {
			if (t.map) {
				var i,
				o,
				s,
				n,
				r,
				a = t.tileWidth(),
				h = t.tileHeight();
				s = t.scanRects(e),
				n = s.length;
				while (n--)
					r = s[n], i = a * (r.width / 2) - a / 2, o = h * (r.height / 2) - h / 2, (new IgeEntityBox2d).translateTo(r.x * a + i, r.y * h + o, 0).width(r.width * a).height(r.height * h).drawBounds(!0).drawBoundsData(!1).box2dBody({
						type : "static",
						allowSleep : !0,
						fixtures : [{
								shape : {
									type : "rectangle"
								}
							}
						]
					})
			} else
				this.log("Cannot extract box2d static bodies from map data because passed map does not have a .map property!", "error")
		},
		contactListener : function (t, e, i, o) {
			var s = new this.b2ContactListener;
			t !== void 0 && (s.BeginContact = t),
			e !== void 0 && (s.EndContact = e),
			i !== void 0 && (s.PreSolve = i),
			o !== void 0 && (s.PostSolve = o),
			this._world.SetContactListener(s)
		},
		enableDebug : function (t) {
			if (t) {
				var e = new this.b2DebugDraw;
				this._box2dDebug = !0,
				e.SetSprite(ige._ctx),
				e.SetDrawScale(this._scaleRatio),
				e.SetFillAlpha(.3),
				e.SetLineThickness(1),
				e.SetFlags(this.b2DebugDraw.e_controllerBit | this.b2DebugDraw.e_jointBit | this.b2DebugDraw.e_pairBit | this.b2DebugDraw.e_shapeBit),
				this._world.SetDebugDraw(e),
				(new igeClassStore.Box2dDebugPainter).depth(4e4).drawBounds(!1).mount(t)
			} else
				this.log("Cannot enable box2d debug drawing because the passed argument is not an object on the scenegraph.", "error")
		},
		destroyBody : function (t) {
			this._removeWhenReady.push(t)
		},
		updateCallback : function (t) {
			return t !== void 0 ? (this._updateCallback = t, this._entity) : this._updateCallback
		},
		start : function () {
			this._active || (this._active = !0, this._mode === 0 ? ige.addBehaviour("box2dStep", this._behaviour) : this._intervalTimer = setInterval(this._behaviour, 1e3 / 60))
		},
		stop : function () {
			this._active && (this._active = !1, this._mode === 0 ? ige.removeBehaviour("box2dStep") : clearInterval(this._intervalTimer))
		},
		_behaviour : function () {
			var t,
			e,
			i,
			o,
			s,
			n,
			r = ige.box2d;
			if (r._active && r._world) {
				if (!r._world.IsLocked() && (o = r._removeWhenReady, s = o.length)) {
					n = r._world.DestroyBody;
					while (s--)
						n.apply(r._world, [o[s]]);
					r._removeWhenReady = [],
					o = null
				}
				r._mode === 0 ? r._world.Step(ige._tickDelta / 1e3, 8, 3) : r._world.Step(1 / 60, 8, 3),
				t = r._world.GetBodyList();
				while (t)
					t._entity && (e = t._entity, i = e._box2dBody, t.IsAwake() && t.m_type !== 0 ? (i.updating = !0, e.translateTo(t.m_xf.position.x * r._scaleRatio, t.m_xf.position.y * r._scaleRatio, e._translate.z), e.rotateTo(e._rotate.x, e._rotate.y, t.GetAngle()), i.updating = !1, i.asleep && (i.asleep = !1, r.emit("afterAwake", e))) : i.asleep || (i.asleep = !0, r.emit("afterAsleep", e))), t = t.GetNext();
				r._world.ClearForces(),
				t = null,
				e = null,
				typeof r._updateCallback == "function" && r._updateCallback()
			}
		},
		destroy : function () {
			ige.removeBehaviour("box2dStep")
		}
	}), Box2dDebugPainter = IgeObject.extend({
		classId : "Box2dDebugPainter",
		tick : function (t) {
			this._parent && this._parent.isometricMounts() === !0 && (t.scale(1.414, .707), t.rotate(45 * Math.PI / 180)),
			ige.box2d._world.DrawDebugData(),
			this._super(t)
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeBox2dComponent);
var IgeEntityBox2d = IgeEntity.extend({
		classId : "IgeEntityBox2d",
		init : function () {
			this._super(),
			this._translateToProto = this.translateTo,
			this._translateByProto = this.translateBy,
			this._rotateToProto = this.rotateTo,
			this._rotateByProto = this.rotateBy,
			this.translateTo = this._translateTo,
			this.translateBy = this._translateBy,
			this.rotateTo = this._rotateTo,
			this.rotateBy = this._rotateBy
		},
		box2dActive : function (t) {
			return this._box2dBody ? t !== void 0 ? (this._box2dBody.SetActive(t), this) : this._box2dBody.IsActive() : this
		},
		box2dBody : function (t) {
			return t !== void 0 ? (this._box2dBodyDef = t, ige.box2d ? this._box2dBody = ige.box2d.createBody(this, t) : this.log("You are trying to create a box2d entity but you have not added the box2d component to the ige instance!", "error"), this) : this._box2dBodyDef
		},
		_translateTo : function (t, e, i) {
			var o = this._box2dBody;
			return this._translateToProto(t, e, i),
			o && !o.updating && (o.SetPosition({
					x : t / ige.box2d._scaleRatio,
					y : e / ige.box2d._scaleRatio
				}), o.SetAwake(!0)),
			this
		},
		_translateBy : function (t, e, i) {
			this._translateTo(this._translate.x + t, this._translate.y + e, this._translate.z + i)
		},
		_rotateTo : function (t, e, i) {
			var o = this._box2dBody;
			return this._rotateToProto(t, e, i),
			o && !o.updating && (o.SetAngle(i), o.SetAwake(!0)),
			this
		},
		_rotateBy : function (t, e, i) {
			this._rotateTo(this._rotate.x + t, this._rotate.y + e, this._rotate.z + i)
		},
		destroy : function () {
			this._box2dBody && ige.box2d.destroyBody(this._box2dBody),
			this._super()
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeEntityBox2d);
var IgeUiButton = IgeUiEntity.extend({
		classId : "IgeUiButton",
		click : function () {
			return this._mouseDown && this._mouseDown(),
			this._mouseUp && this._mouseUp(),
			this
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeUiButton);
var IgeUiRadioButton = IgeUiButton.extend({
		classId : "IgeUiRadioButton",
		radioGroup : function (t) {
			return t !== void 0 ? (this._uiRadioGroup = t, this) : this._uiRadioGroup
		},
		select : function (t) {
			if (t !== void 0)
				return this._uiOnSelect = t, this;
			if (this._parent) {
				var e,
				i = this._parent._children,
				o = i.length;
				while (o--)
					e = i[o], e !== this && e._uiRadioGroup === this._uiRadioGroup && e._uiSelected && (e._uiSelected = !1, e._uiOnDeSelect && e._uiOnDeSelect())
			}
			return this._uiSelected = !0,
			this._uiOnSelect && this._uiOnSelect(),
			this
		},
		deSelect : function (t) {
			return t !== void 0 ? (this._uiOnDeSelect = t, this) : (this._uiSelected = !1, this._uiOnDeSelect && this._uiOnDeSelect(), this)
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeUiRadioButton);
var IgeUiProgressBar = IgeUiEntity.extend({
		classId : "IgeUiProgressBar",
		init : function () {
			this._super(),
			this._min = 0,
			this._max = 100,
			this._progress = 0,
			this._barBackColor = "#000000",
			this._barColor = "#fff600",
			this._barBorderColor = "#ffffff",
			this._barText = {
				pre : "",
				post : "",
				color : ""
			}
		},
		barBackColor : function (t) {
			return t !== void 0 ? (this._barBackColor = t, this) : this._barBackColor
		},
		barColor : function (t) {
			return t !== void 0 ? (this._barColor = t, this) : this._barColor
		},
		barBorderColor : function (t) {
			return t !== void 0 ? (this._barBorderColor = t, this) : this._barBorderColor
		},
		barText : function (t, e, i) {
			return t !== void 0 && e !== void 0 && i !== void 0 ? (this._barText = {
					pre : t,
					post : e,
					color : i
				}, this) : this._barText
		},
		max : function (t) {
			return t !== void 0 ? (this._max = t, this) : this._max
		},
		min : function (t) {
			return t !== void 0 ? (this._min = t, this) : this._min
		},
		progress : function (t) {
			return t !== void 0 ? (this._min > t && (t = this._min), t > this._max && (t = this._max), this._progress = t, this) : this._progress
		},
		bindData : function (t, e) {
			return t !== void 0 && e !== void 0 && (this._bindDataObject = t, this._bindDataProperty = e),
			this
		},
		render : function (t) {
			this._bindDataObject && this._bindDataProperty && (this._bindDataObject._alive === !1 ? delete this._bindDataObject : this.progress(parseInt(this._bindDataObject[this._bindDataProperty])));
			var e = this._min,
			i = this._max,
			o = this._progress,
			s = this._geometry.x / (i - e),
			n = (o - e) * s;
			o > i && (o = i),
			e > o && (o = e),
			this._barBackColor && (t.fillStyle = this._barBackColor, t.fillRect(-this._geometry.x2, -this._geometry.y2, this._geometry.x, this._geometry.y)),
			this._barColor && (t.fillStyle = this._barColor, t.fillRect(-this._geometry.x2, -this._geometry.y2, n, this._geometry.y)),
			this._barBorderColor && (t.strokeStyle = this._barBorderColor, t.strokeRect(-this._geometry.x2, -this._geometry.y2, this._geometry.x, this._geometry.y)),
			this._barText && (this._barText.pre || this._barText.post) && (t.textAlign = "center", t.textBaseline = "middle", t.fillStyle = this._barText.color, t.fillText(this._barText.pre + (Math.floor(o) + "") + this._barText.post, 0, 0))
		},
		tick : function (t) {
			this._transformContext(t),
			this.render(t),
			this._super(t, !0)
		}
	}), IgeUiTextBox = IgeUiEntity.extend({
		classId : "IgeUiTextBox",
		init : function () {
			this._super();
			var t = this;
			this._hasFocus = !1,
			this._value = "",
			this._fontEntity = (new IgeFontEntity).left(5).middle(0).textAlignX(0).textAlignY(0).mount(this),
			ige.input.on("keyDown", function (e) {
				t._keyDown(e)
			})
		},
		width : function (t, e, i, o) {
			var s;
			return s = this._super(t, e, i, o),
			this._fontEntity.width(t, e, i, o),
			s
		},
		height : function (t, e, i, o) {
			var s;
			return s = this._super(t, e, i, o),
			this._fontEntity.height(t, e, i, o),
			s
		},
		value : function (t) {
			return t !== void 0 ? (this._value = t, this._fontEntity.text(this._value), this) : this._value
		},
		focus : function (t) {
			return t !== void 0 ? (this._hasFocus = t, this) : this._hasFocus
		},
		fontSheet : function (t) {
			return t !== void 0 ? (this._fontSheet = t, this._fontEntity.texture(this._fontSheet), this) : this._fontSheet
		},
		_keyDown : function (t) {
			if (this._hasFocus)
				switch (t.preventDefault(), t.stopPropagation(), t.returnValue = !1, t.keyCode) {
				case 8:
					this._value.length > 0 && this.value(this._value.substr(0, this._value.length - 1));
					break;
				case 13:
					break;
				default:
					this.value(this._value + String.fromCharCode(t.keyCode))
				}
		}
	}), IgeUiMenu = IgeUiEntity.extend({
		classId : "IgeUiMenu",
		menuData : function (t) {
			return t !== void 0 ? (this._menuData = t, this.destroyChildren(), this._buildMenu(this._menuData, this), this) : this._menuData
		},
		menuMode : function (t) {
			return t !== void 0 ? (this._menuMode = t, this) : this._menuMode
		},
		fontSheet : function (t) {
			return t !== void 0 ? (this._fontSheet = t, this) : this._fontSheet
		},
		addItem : function (t) {},
		_buildMenu : function (t, e) {
			var i,
			o,
			s,
			n = t.length,
			r = 0,
			a = 0;
			for (i = 0; n > i; i++)
				o = t[i], this._menuMode && (a += this.height()), s = (new IgeUiMenuItem).backgroundColor("#666666").left(r).middle(a).height(this.height()).fontSheet(this._fontSheet).menuData(o).mount(e), this._menuMode || (r += o.width)
		}
	}), IgeUiMenuItem = IgeUiEntity.extend({
		classId : "IgeUiMenuItem",
		menuData : function (t) {
			return t !== void 0 ? (this._menuData = t, t.width && this.width(t.width), t.id && this.id(t.id), t.mouseUp && this.mouseUp(t.mouseUp), t.mouseOver && this.mouseOver(t.mouseOver), t.mouseOut && this.mouseOut(t.mouseOut), this._labelEntity = (new IgeFontEntity).id(this.id() + "_label").texture(this._fontSheet).left(5).middle(0).width(t.width).height(this.height()).textAlignX(0).textAlignY(1).text(t.text).mount(this), this) : this._menuData
		},
		fontSheet : function (t) {
			return t !== void 0 ? (this._fontSheet = t, this) : this._fontSheet
		},
		open : function () {
			this._menuData.items && (this._childMenu = (new IgeUiMenu).id(this.id() + "_childMenu").depth(this.depth() + 1).fontSheet(this._fontSheet).left(0).top(this.height()).width(100).height(30).menuMode(1).menuData(this._menuData.items).mount(this))
		},
		close : function () {
			this._childMenu && this._childMenu.destroy()
		}
	}), IgeUiTimeStream = IgeUiEntity.extend({
		classId : "IgeUiTimeStream",
		monitor : function (t) {
			this._entity = t
		},
		tick : function (t) {
			var e,
			i,
			o,
			s,
			n,
			r,
			a,
			h = ige._tickStart - ige.network.stream._renderLatency;
			for (this._super(t), t.strokeStyle = "#fffc00", t.beginPath(), t.moveTo(-200, -25.5), t.lineTo(200, -25.5), t.stroke(), t.font = "normal 10px Verdana", e = 0; 9 > e; e++)
				t.beginPath(), t.strokeStyle = (e - 2) * 10 === 0 ? "#ff6600" : "#ffffff", t.moveTo(-200.5 + e * 50, -30), t.lineTo(-200.5 + e * 50, 30), t.stroke(), i = -ige.network.stream._renderLatency + (e - 2) * 10 + "ms", o = t.measureText(i), t.strokeText(i, -200 + e * 50 - o.width / 2, -38), (e - 2) * 10 === 0 && (i = "Render Point", o = t.measureText(i), t.strokeText(i, -200 + e * 50 - o.width / 2, -52));
			if (this._entity) {
				if (s = this._entity._timeStream, s && s.length)
					for (n = s.length, e = 0; n > e; e++)
						r = s[e], a = r[0] - h, t.strokeRect(-105 + a / 10 * 50, -5, 10, 10);
				ige.client.custom2.value = this._entity._timeStreamDataDelta,
				ige.client.custom3.value = this._entity._timeStreamOffsetDelta,
				ige.client.custom4.value = this._entity._timeStreamCurrentInterpolateTime,
				t.strokeRect()
			}
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeUiTimeStream);
var IgeFilters = {};
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeFilters), IgeFilters.tmpCanvas = document.createElement("canvas"), IgeFilters.tmpCtx = IgeFilters.tmpCanvas.getContext("2d"), IgeFilters.createImageData = function (t, e) {
	return IgeFilters.tmpCtx.createImageData(t, e)
}, IgeFilters._convolute = function (t, e, i) {
	for (var o = Math.round(Math.sqrt(e.length)), s = Math.floor(o / 2), n = t.data, r = t.width, a = t.height, h = r, l = a, c = IgeFilters.createImageData(h, l), m = c.data, _ = i ? 1 : 0, u = 0; l > u; u++)
		for (var p = 0; h > p; p++) {
			for (var y = u, d = p, x = (u * h + p) * 4, f = 0, g = 0, v = 0, b = 0, w = 0; o > w; w++)
				for (var C = 0; o > C; C++) {
					var D = y + w - s,
					B = d + C - s;
					if (D >= 0 && a > D && B >= 0 && r > B) {
						var S = (D * r + B) * 4,
						I = e[w * o + C];
						f += n[S] * I,
						g += n[S + 1] * I,
						v += n[S + 2] * I,
						b += n[S + 3] * I
					}
				}
			m[x] = f,
			m[x + 1] = g,
			m[x + 2] = v,
			m[x + 3] = b + _ * (255 - b)
		}
	return c
}, IgeFilters.greyScale = function (t, e, i) {
	e.clearRect(0, 0, t.width, t.height),
	e.drawImage(i, 0, 0),
	e.putImageData(IgeFilters._greyScale(e.getImageData(0, 0, t.width, t.height)), 0, 0)
}, IgeFilters._greyScale = function (t) {
	var e,
	i,
	o,
	s,
	n,
	r,
	a;
	for (e = t.data, i = e.length, o = 0; i > o; o += 4)
		s = e[o], n = e[o + 1], r = e[o + 2], a = .2126 * s + .7152 * n + .0722 * r, e[o] = e[o + 1] = e[o + 2] = a;
	return t
}, IgeFilters.brighten = function (t, e, i, o, s) {
	e.clearRect(0, 0, t.width, t.height),
	e.drawImage(i, 0, 0),
	e.putImageData(IgeFilters._brighten(e.getImageData(0, 0, t.width, t.height), o, s), 0, 0)
}, IgeFilters._brighten = function (t, e, i) {
	var o,
	s,
	n,
	r = e.data("IgeFilters.brighten.value") || i.value;
	for (o = t.data, s = o.length, n = 0; s > n; n += 4)
		o[n] += r, o[n + 1] += r, o[n + 2] += r;
	return t
}, IgeFilters.threshold = function (t, e, i, o, s) {
	e.clearRect(0, 0, t.width, t.height),
	e.drawImage(i, 0, 0),
	e.putImageData(IgeFilters._threshold(e.getImageData(0, 0, t.width, t.height), o, s), 0, 0)
}, IgeFilters._threshold = function (t, e, i) {
	var o,
	s,
	n,
	r,
	a,
	h,
	l,
	c = e.data("IgeFilters.threshold.value") || i.value;
	for (o = t.data, s = o.length, n = 0; s > n; n += 4)
		r = o[n], a = o[n + 1], h = o[n + 2], l = c > .2126 * r + .7152 * a + .0722 * h ? 0 : 255, o[n] = o[n + 1] = o[n + 2] = l;
	return t
}, IgeFilters.sharpen = function (t, e, i, o, s) {
	e.clearRect(0, 0, t.width, t.height),
	e.drawImage(i, 0, 0);
	var n,
	r = 1;
	for (s && s.value && (r = s.value), n = 0; r > n; n++)
		e.putImageData(IgeFilters._convolute(e.getImageData(0, 0, t.width, t.height), [0, -1, 0, -1, 5, -1, 0, -1, 0]), 0, 0)
}, IgeFilters.blur = function (t, e, i, o, s) {
	e.clearRect(0, 0, t.width, t.height),
	e.drawImage(i, 0, 0);
	var n,
	r,
	a = 1,
	h = 1 / 9;
	for (r = e.getImageData(0, 0, t.width, t.height), s && s.value && (a = s.value), n = 0; a > n; n++)
		r = IgeFilters._convolute(r, [h, h, h, h, h, h, h, h, h]);
	e.putImageData(r, 0, 0)
}, IgeFilters.emboss = function (t, e, i) {
	e.clearRect(0, 0, t.width, t.height),
	e.drawImage(i, 0, 0),
	e.putImageData(IgeFilters._convolute(e.getImageData(0, 0, t.width, t.height), [-2, -1, 0, -1, 1, 1, 0, 1, 2]), 0, 0)
}, IgeFilters.edgeDetect = function (t, e, i, o, s) {
	e.clearRect(0, 0, t.width, t.height),
	e.drawImage(i, 0, 0);
	var n,
	r,
	a,
	h,
	l,
	c = IgeFilters._convolute(e.getImageData(0, 0, t.width, t.height), [-1, -1, -1, -1, -1, -1, 2, 2, 2, -1, -1, 2, 0, 2, -1, -1, 2, 2, 2, -1, -1, -1, -1, -1, -1], !0),
	m = c.data,
	_ = m.length;
	for (n = 0; _ > n; n += 4)
		r = m[n], a = m[n + 1], h = m[n + 2], l = (r + a + h) / 3, l *= 1.1, l = s.value > l ? 0 : 255, m[n] = m[n + 1] = m[n + 2] = l;
	e.putImageData(c, 0, 0)
}, IgeFilters.edgeEnhance = function (t, e, i) {
	e.clearRect(0, 0, t.width, t.height),
	e.drawImage(i, 0, 0),
	e.putImageData(IgeFilters._convolute(e.getImageData(0, 0, t.width, t.height), [0, 0, 0, -1, 1, 0, 0, 0, 0], !0), 0, 0)
}, IgeFilters.outlineDetect = function (t, e, i) {
	e.clearRect(0, 0, t.width, t.height),
	e.drawImage(i, 0, 0),
	e.putImageData(IgeFilters._convolute(e.getImageData(0, 0, t.width, t.height), [0, 1, 0, 1, -4, 1, 0, 1, 0]), 0, 0)
}, IgeFilters.colorOverlay = function (t, e, i, o, s) {
	e.clearRect(0, 0, t.width, t.height),
	e.drawImage(i, 0, 0),
	e.globalCompositeOperation = "source-atop",
	e.fillStyle = s.color,
	e.fillRect(0, 0, t.width, t.height)
}, IgeFilters.sobel = function (t, e, i, o, s) {
	e.clearRect(0, 0, t.width, t.height),
	e.drawImage(i, 0, 0);
	var n,
	r = 1;
	for (s && s.value && (r = s.value), n = 0; r > n; n++)
		e.putImageData(IgeFilters._convolute(e.getImageData(0, 0, t.width, t.height), [-1, -1, 1, -2, 0, 2, -1, 1, 1], !0), 0, 0)
}, IgeFilters._invert = function (t, e) {
	var i,
	o,
	s,
	n;
	for (i = t.width, o = t.height, s = e.getImageData(0, 0, i, o), n = 0; i * o * 4 > n; n += 4)
		s.data[n] = 255 - s.data[n], s.data[n + 1] = 255 - s.data[n + 1], s.data[n + 2] = 255 - s.data[n + 2];
	e.putImageData(s, 0, 0)
}, IgeFilters.invert = function (t, e, i) {
	e.clearRect(0, 0, t.width, t.height),
	e.drawImage(i, 0, 0);
	var o,
	s,
	n,
	r;
	for (o = t.width, s = t.height, n = e.getImageData(0, 0, o, s), r = 0; o * s * 4 > r; r += 4)
		n.data[r] = 255 - n.data[r], n.data[r + 1] = 255 - n.data[r + 1], n.data[r + 2] = 255 - n.data[r + 2];
	e.putImageData(n, 0, 0)
}, IgeFilters.glowMask = function (t, e, i, o, s) {
	var n,
	r,
	a,
	h,
	l = 1 / 9;
	if (e.clearRect(0, 0, t.width, t.height), s.blurPasses) {
		for (e.drawImage(s.glowMask.image, 0, 0), n = e.getImageData(0, 0, t.width, t.height), e.clearRect(0, 0, t.width, t.height), h = 0; s.blurPasses > h; h++)
			n = IgeFilters._convolute(n, [l, l, l, l, l, l, l, l, l], !1);
		r = document.createElement("canvas"),
		a = r.getContext("2d"),
		r.width = t.width,
		r.height = t.height,
		a.putImageData(n, 0, 0)
	} else
		r = s.glowMask.image;
	for (e.drawImage(i, 0, 0), e.globalCompositeOperation = "lighter", h = 0; s.glowPasses > h; h++)
		e.drawImage(r, 0, 0)
};
var IgeEngine = IgeEntity.extend({
		classId : "IgeEngine",
		init : function () {
			igeDebug && (igeDebug._enabled || (igeDebug._timing = !1)),
			this._alwaysInView = !0,
			this._super(),
			this._id = "ige",
			this.basePath = "",
			this.isServer = typeof module != "undefined" && module.exports !== void 0,
			ige = this,
			console.log("------------------------------------------------------------------------------"),
			console.log("* Powered by the Isogenic Game Engine " + igeVersion + "                                  *"),
			console.log("* (C)opyright 2012 Irrelon Software Limited                                  *"),
			console.log("* http://www.isogenicengine.com                                              *"),
			console.log("------------------------------------------------------------------------------"),
			this._super(),
			this.isServer || this.addComponent(IgeCocoonJsComponent),
			this._textureStore = [],
			this._idCounter = (new Date).getTime(),
			this.addComponent(IgeInputComponent),
			this.addComponent(IgeTweenComponent),
			this._renderModes = ["2d", "three"],
			this._requireScriptTotal = 0,
			this._requireScriptLoading = 0,
			this._loadingPreText = void 0,
			this._enableUpdates = !0,
			this._enableRenders = !0,
			this._showSgTree = !1,
			this._debugEvents = {},
			this._renderContext = "2d",
			this._renderMode = this._renderModes[this._renderContext],
			this._tickTime = "NA",
			this._updateTime = "NA",
			this._renderTime = "NA",
			this._tickDelta = 0,
			this._fpsRate = 60,
			this._state = 0,
			this._textureImageStore = {},
			this._texturesLoading = 0,
			this._texturesTotal = 0,
			this._dependencyQueue = [],
			this._drawCount = 0,
			this._dps = 0,
			this._dpt = 0,
			this._frames = 0,
			this._fps = 0,
			this._clientNetDiff = 0,
			this._frameAlternator = !1,
			this._viewportDepth = !1,
			this._mousePos = new IgePoint(0, 0, 0),
			this._currentViewport = null,
			this._currentCamera = null,
			this._currentTime = 0,
			this._globalSmoothing = !1,
			this._register = {
				ige : this
			},
			this._categoryRegister = {},
			this._groupRegister = {},
			this._postTick = [],
			this._timeSpentInUpdate = {},
			this._timeSpentLastUpdate = {},
			this._timeSpentInTick = {},
			this._timeSpentLastTick = {},
			this._timeScale = 1,
			this._ctx = IgeDummyContext,
			this._headless = !0,
			this.dependencyTimeout(3e4),
			this._dependencyQueue.push(this.texturesLoaded),
			this._secondTimer = setInterval(this._secondTick, 1e3)
		},
		$ : function (t) {
			return typeof t == "string" ? this._register[t] : typeof t == "object" ? t : this
		},
		$$ : function (t) {
			return this._categoryRegister[t] || []
		},
		$$$ : function (t) {
			return this._groupRegister[t] || []
		},
		register : function (t) {
			return t !== void 0 ? this._register[t.id()] ? (t._registered = !1, this.log('Cannot add object id "' + t.id() + '" to scenegraph because there is already another object in the graph with the same ID!', "error"), !1) : (this._register[t.id()] = t, t._registered = !0, this) : this._register
		},
		unRegister : function (t) {
			return t !== void 0 && this._register[t.id()] && (delete this._register[t.id()], t._registered = !1),
			this
		},
		categoryRegister : function (t) {
			return t !== void 0 && (this._categoryRegister[t._category] = this._categoryRegister[t._category] || [], this._categoryRegister[t._category].push(t), t._categoryRegistered = !0),
			this._register
		},
		categoryUnRegister : function (t) {
			return t !== void 0 && this._categoryRegister[t._category] && (this._categoryRegister[t._category].pull(t), t._categoryRegistered = !1),
			this
		},
		groupRegister : function (t, e) {
			return t !== void 0 && (this._groupRegister[e] = this._groupRegister[e] || [], this._groupRegister[e].push(t), t._groupRegistered = !0),
			this._register
		},
		groupUnRegister : function (t, e) {
			return t !== void 0 && (e !== void 0 ? this._groupRegister[e] && (this._groupRegister[e].pull(t), t.groupCount() || (t._groupRegister = !1)) : t.removeAllGroups()),
			this
		},
		requireScript : function (t) {
			if (t !== void 0) {
				var e = this;
				e._requireScriptTotal++,
				e._requireScriptLoading++;
				var i = document.createElement("script");
				i.addEventListener("load", function () {
					e._requireScriptLoaded(this)
				}),
				document.body.appendChild(i),
				i.src = t,
				this.emit("requireScriptLoading", t)
			}
		},
		_requireScriptLoaded : function (t) {
			this._requireScriptLoading--,
			this.emit("requireScriptLoaded", t.src),
			this._requireScriptLoading === 0 && this.emit("allRequireScriptsLoaded")
		},
		enableUpdates : function (t) {
			return t !== void 0 ? (this._enableUpdates = t, this) : this._enableUpdates
		},
		enableRenders : function (t) {
			return t !== void 0 ? (this._enableRenders = t, this) : this._enableRenders
		},
		debugEnabled : function (t) {
			return t !== void 0 ? (igeDebug && (igeDebug._enabled = t), this) : igeDebug._enabled
		},
		debugTiming : function (t) {
			return t !== void 0 ? (igeDebug && (igeDebug._timing = t), this) : igeDebug._timing
		},
		debug : function (t) {
			this._debugEvents[t] === !0 || this._debugEvents[t] === ige._frames
		},
		debugEventOn : function (t) {
			this._debugEvents[t] = !0
		},
		debugEventOff : function (t) {
			this._debugEvents[t] = !1
		},
		triggerDebugEventFrame : function (t) {
			this._debugEvents[t] = ige._frames
		},
		hideAllExcept : function (t) {
			var e,
			i = this._register;
			for (e in i)
				e !== t && i[e].opacity(0)
		},
		showAll : function () {
			var t,
			e = this._register;
			for (t in e)
				e[t].show()
		},
		setFps : function (t) {
			t !== void 0 && (this.isServer ? requestAnimFrame = function (e) {
				setTimeout(function () {
					e((new Date).getTime())
				}, 1e3 / t)
			}
				 : window.requestAnimFrame = function (e) {
				setTimeout(function () {
					e((new Date).getTime())
				}, 1e3 / t)
			})
		},
		showStats : function (t, e) {
			if (!(t === void 0 || ige.cocoonJs && ige.cocoonJs.detected)) {
				switch (t) {
				case 0:
					clearInterval(this._statsTimer),
					this._removeStatsDiv();
					break;
				case 1:
					this._createStatsDiv(),
					e !== void 0 ? this._statsInterval = e : this._statsInterval === void 0 && (this._statsInterval = 16),
					this._statsTimer = setInterval(this._statsTick, this._statsInterval)
				}
				return this._showStats = t,
				this
			}
			return this._showStats
		},
		_createStatsDiv : function () {
			if (!ige.isServer && !document.getElementById("igeStats")) {
				var t = document.createElement("div");
				t.id = "igeStatsFloater",
				t.className = "igeStatsFloater",
				t.style.fontFamily = "Verdana, Tahoma",
				t.style.fontSize = "12px",
				t.style.position = "absolute",
				t.style.color = "#ffffff",
				t.style.textShadow = "1px 1px 3px #000000",
				t.style.bottom = "4px",
				t.style.left = "4px",
				t.style.userSelect = "none",
				t.style.webkitUserSelect = "none",
				t.style.MozUserSelect = "none",
				t.style.zIndex = 1e5,
				t.innerHTML = "Please wait...",
				document && document.readyState === "complete" ? document.body.appendChild(t) : window.addEventListener("load", function () {
					document.body.appendChild(t)
				}),
				window.addEventListener("unload", function () {}),
				this._statsDiv = t
			}
		},
		_removeStatsDiv : function () {
			document.body.removeChild(this._statsDiv),
			delete this._statsDiv
		},
		defineClass : function (t, e) {
			igeClassStore[t] = e
		},
		getClass : function (t) {
			return igeClassStore[t]
		},
		newClassInstance : function (t, e) {
			return new igeClassStore[t](e)
		},
		dependencyCheck : function () {
			var t = this._dependencyQueue,
			e = t.length;
			while (e--)
				if (!this._dependencyQueue[e]())
					return !1;
			return !0
		},
		viewportDepth : function (t) {
			return t !== void 0 ? (this._viewportDepth = t, this) : this._viewportDepth
		},
		dependencyTimeout : function (t) {
			this._dependencyCheckTimeout = t
		},
		updateProgress : function () {
			if (typeof document != "undefined" && document.getElementById) {
				var t = document.getElementById("loadingProgressBar"),
				e = document.getElementById("loadingText");
				if (t) {
					var i = parseInt(t.parentNode.offsetWidth),
					o = Math.floor(i / this._texturesTotal * (this._texturesTotal - this._texturesLoading));
					t.style.width = o + "px",
					e && (this._loadingPreText === void 0 && (this._loadingPreText = e.innerHTML), e.innerHTML = this._loadingPreText + " " + Math.floor(100 / this._texturesTotal * (this._texturesTotal - this._texturesLoading)) + "%")
				}
			}
		},
		textureLoadStart : function (t, e) {
			this._texturesLoading++,
			this._texturesTotal++,
			this.updateProgress(),
			this.emit("textureLoadStart", e)
		},
		textureLoadEnd : function (t, e) {
			var i = this;
			e._destroyed || this._textureStore.push(e),
			this._texturesLoading--,
			this.updateProgress(),
			this.emit("textureLoadEnd", e),
			this._texturesLoading === 0 && (this.updateProgress(), setTimeout(function () {
					i._allTexturesLoaded()
				}, 100))
		},
		textureFromUrl : function (t) {
			var e,
			i = this._textureStore,
			o = i.length;
			while (o--)
				if (e = i[o], e._url === t)
					return e
		},
		texturesLoaded : function () {
			return ige._texturesLoading === 0
		},
		_allTexturesLoaded : function () {
			this._loggedATL || (this._loggedATL = !0, this.log("All textures have loaded")),
			this.emit("texturesLoaded")
		},
		globalSmoothing : function (t) {
			return t !== void 0 ? (this._globalSmoothing = t, this) : this._globalSmoothing
		},
		canvasReady : function () {
			return ige._canvas !== void 0 || ige.isServer
		},
		newId : function () {
			return this._idCounter++,
			this._idCounter + (Math.random() * Math.pow(10, 17) + Math.random() * Math.pow(10, 17) + Math.random() * Math.pow(10, 17) + Math.random() * Math.pow(10, 17)) + ""
		},
		newIdHex : function () {
			return this._idCounter++,
			(this._idCounter + (Math.random() * Math.pow(10, 17) + Math.random() * Math.pow(10, 17) + Math.random() * Math.pow(10, 17) + Math.random() * Math.pow(10, 17))).toString(16)
		},
		newIdFromString : function (t) {
			if (t !== void 0) {
				var e,
				i,
				o = 0,
				s = t.length;
				for (i = 0; s > i; i++)
					o += t.charCodeAt(i) * Math.pow(10, 17);
				e = o.toString(16);
				while (ige.$(e))
					o += Math.pow(10, 17), e = o.toString(16);
				return e
			}
		},
		start : function (t) {
			if (!ige._state)
				if (ige.dependencyCheck()) {
					if (ige.log("Starting engine..."), ige._state = 1, !this.isServer && document.getElementsByClassName && document.getElementsByClassName("igeLoading")) {
						var e = document.getElementsByClassName("igeLoading"),
						i = e.length;
						while (i--)
							e[i].parentNode.removeChild(e[i])
					}
					requestAnimFrame(ige.tick),
					ige.log("Engine started"),
					typeof t == "function" && t(!0)
				} else {
					var o = (new Date).getTime();
					ige._dependencyCheckStart || (ige._dependencyCheckStart = o),
					o - ige._dependencyCheckStart > this._dependencyCheckTimeout ? (this.log("Engine start failed because the dependency check timed out after " + this._dependencyCheckTimeout / 1e3 + " seconds", "error"), typeof t == "function" && t(!1)) : setTimeout(function () {
						ige.start(t)
					}, 200)
				}
		},
		stop : function () {
			return this._state ? (this.log("Stopping engine..."), this._state = 0, !0) : !1
		},
		autoSize : function (t) {
			return t !== void 0 ? (this._autoSize = t, this) : this._autoSize
		},
		pixelRatioScaling : function (t) {
			return t !== void 0 ? (this._pixelRatioScaling = t, this) : this._pixelRatioScaling
		},
		renderContext : function (t) {
			return t !== void 0 ? (this._renderContext = t, this._renderMode = this._renderModes[t], this.log("Rendering mode set to: " + t), this) : this._renderContext
		},
		createFrontBuffer : function (t, e) {
			this.isServer || this._canvas || (this._createdFrontBuffer = !0, this._pixelRatioScaling = !e, this._frontBufferSetup(t, e))
		},
		_frontBufferSetup : function (t) {
			var e = document.createElement("canvas");
			e.id = "igeFrontBuffer",
			this.canvas(e, t),
			document.body.appendChild(e)
		},
		canvas : function (t, e) {
			return t !== void 0 && (this._canvas || (this._canvas = t, this._ctx = this._canvas.getContext(this._renderContext), this._pixelRatioScaling ? (this._devicePixelRatio = window.devicePixelRatio || 1, this._backingStoreRatio = this._ctx.webkitBackingStorePixelRatio || this._ctx.mozBackingStorePixelRatio || this._ctx.msBackingStorePixelRatio || this._ctx.oBackingStorePixelRatio || this._ctx.backingStorePixelRatio || 1, this._deviceFinalDrawRatio = this._devicePixelRatio / this._backingStoreRatio) : (this._devicePixelRatio = 1, this._backingStoreRatio = 1, this._deviceFinalDrawRatio = 1), e && (this._autoSize = e, window.addEventListener("resize", this._resizeEvent)), this._resizeEvent(), this._ctx = this._canvas.getContext(this._renderContext), this._headless = !1, this.input.setupListeners(this._canvas))),
			this._canvas
		},
		clearCanvas : function () {
			this._ctx && this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)
		},
		removeCanvas : function () {
			this.input && this.input.destroyListeners(),
			this._autoSize && window.removeEventListener("resize", this._resizeEvent),
			this._createdFrontBuffer && document.body.removeChild(this._canvas),
			delete this._canvas,
			delete this._ctx,
			this._ctx = IgeDummyContext,
			this._headless = !0
		},
		openUrl : function (t) {
			t !== void 0 && (ige.cocoonJs && ige.cocoonJs.detected ? ige.cocoonJs.openUrl(t) : window.open(t))
		},
		showWebView : function (t) {
			if (ige.cocoonJs && ige.cocoonJs.detected)
				ige.cocoonJs.showWebView(t);
			else {
				var e = document.getElementById("igeOverlay");
				e || (e = document.createElement("iframe"), e.id = "igeOverlay", e.style.position = "absolute", e.style.border = "none", e.style.left = "0px", e.style.top = "0px", e.style.width = "100%", e.style.height = "100%", document.body.appendChild(e)),
				t !== void 0 && (e.src = t),
				e.style.display = "block"
			}
			return this
		},
		hideWebView : function () {
			if (ige.cocoonJs && ige.cocoonJs.detected)
				ige.cocoonJs.hideWebView();
			else {
				var t = document.getElementById("igeOverlay");
				t && (t.style.display = "none")
			}
			return this
		},
		layerCall : function (js) {
			js !== void 0 && eval(js)
		},
		mousePos : function () {
			return this._mousePos
		},
		_resizeEvent : function (t) {
			if (ige._autoSize) {
				var e = window.innerWidth,
				i = window.innerHeight,
				o = ige._children,
				s = o.length;
				ige._canvas && (e % 2 && e--, i % 2 && i--, ige._canvas.width = e * ige._deviceFinalDrawRatio, ige._canvas.height = i * ige._deviceFinalDrawRatio, ige._deviceFinalDrawRatio !== 1 && (ige._canvas.style.width = e + "px", ige._canvas.style.height = i + "px", ige._ctx.scale(ige._deviceFinalDrawRatio, ige._deviceFinalDrawRatio))),
				ige._geometry = new IgePoint(e, i, 0);
				while (s--)
					o[s]._resizeEvent(t)
			} else
				ige._canvas && (ige._geometry = new IgePoint(ige._canvas.width, ige._canvas.height, 0));
			ige._showSgTree && (document.getElementById("igeSgTree").style.height = ige._geometry.y - 30 + "px"),
			ige._resized = !0
		},
		watchStart : function (t) {
			return this._watch = this._watch || [],
			this._watch.push(t),
			this._watch.length - 1
		},
		watchStop : function (t) {
			this._watch = this._watch || [],
			this._watch.splice(t, 1)
		},
		traceSet : function (t, e, i) {
			t.___igeTraceCurrentVal = t[e],
			t.___igeTraceMax = i || 1,
			t.___igeTraceCount = 0,
			Object.defineProperty(t, e, {
				get : function () {
					return this.___igeTraceCurrentVal
				},
				set : function (i) {
					this.___igeTraceCurrentVal = i,
					this.___igeTraceCount++,
					this.___igeTraceCount === this.___igeTraceMax && ige.traceSetOff(t, e)
				}
			})
		},
		traceSetOff : function (t, e) {
			Object.defineProperty(t, e, {
				set : function (t) {
					this.___igeTraceCurrentVal = t
				}
			})
		},
		findBaseClass : function (t) {
			return t._classId.substr(0, 3) === "Ige" ? t._classId : t.__proto__._classId ? this.findBaseClass(t.__proto__) : ""
		},
		getClassDerivedList : function (t, e) {
			return e ? t._classId && e.push(t._classId) : e = [],
			t.__proto__._classId && this.getClassDerivedList(t.__proto__, e),
			e
		},
		_secondTick : function () {
			var t = ige;
			t._fps = t._frames,
			t._dps = t._dpt * t._fps,
			t._frames = 0,
			t._drawCount = 0
		},
		addToSgTree : function (t) {
			var e,
			i,
			o,
			s,
			n,
			r,
			a = document.createElement("li");
			if (s = function (t) {
				t.stopPropagation();
				var e = document.getElementsByClassName("sgItem selected");
				for (o = 0; e.length > o; o++)
					e[o].className = "sgItem";
				this.className += " selected",
				ige._sgTreeSelected = this.id,
				ige._currentViewport.drawBounds(!0),
				this.id !== "ige" ? ige._currentViewport.drawBoundsLimitId(this.id) : ige._currentViewport.drawBoundsLimitId("")
			}, n = function (t) {
				t.stopPropagation();
				var e,
				i,
				o = document.getElementById("igeSgConsole"),
				s = ige.$(this.id),
				n = ige.findBaseClass(s),
				r = "";
				if (o.value += "ige.$('" + this.id + "')", n) {
					document.getElementById("igeSgDocPage").style.display = "block",
					document.getElementById("igeSgDocPage").src = "http://www.isogenicengine.com/engine/documentation/root/" + n + ".html",
					e = ige.getClassDerivedList(s),
					e.reverse();
					for (i in e)
						e.hasOwnProperty(i)
							 && (r && (r += " &gt "), r += e[i].substr(0, 3) === "Ige" ? '<a href="http://www.isogenicengine.com/engine/documentation/root/' + e[i] + '.html" target="igeSgDocPage">' + e[i] + "</a>" : e[i]);
						document.getElementById("igeSgItemClassChain").innerHTML = "<B>Inheritance</B>: " + r,
						document.getElementById("igeSgItemClassChain").style.display = "block"
					} else
						document.getElementById("igeSgItemClassChain").style.display = "none", document.getElementById("igeSgDocPage").style.display = "none"
				}, a.addEventListener("mouseup", s, !1), a.addEventListener("dblclick", n, !1), a.id = t.id, a.innerHTML = t.text, a.className = "sgItem", ige._sgTreeSelected === t.id && (a.className += " selected"), igeDebug._timing && ige._timeSpentInTick[t.id] && (r = "<span>" + ige._timeSpentInTick[t.id] + "ms</span>", a.innerHTML += " " + r), document.getElementById(t.parentId + "_items").appendChild(a), t.items)for (a = document.createElement("ul"), a.id = t.id + "_items", document.getElementById(t.id).appendChild(a), e = t.items, i = e.length, o = 0; i > o; o++)
					ige.addToSgTree(e[o])
		},
		_statsTick : function () {
			var self = ige,
			i,
			watchCount,
			watchItem,
			itemName,
			res,
			html = "";
			if (self._showStats && !self._statsPauseUpdate)
				switch (self._showStats) {
				case 1:
					if (self._watch && self._watch.length) {
						for (watchCount = self._watch.length, i = 0; watchCount > i; i++) {
							if (watchItem = self._watch[i], typeof watchItem == "string") {
								itemName = watchItem;
								try {
									eval("res = " + watchItem)
								} catch (err) {
									res = '<span style="color:#ff0000;">' + err + "</span>"
								}
							} else
								itemName = watchItem.name, res = watchItem.value;
							html += i + ' (<a href="javascript:ige.watchStop(' + i + '); ige._statsPauseUpdate = false;" style="color:#cccccc;" onmouseover="ige._statsPauseUpdate = true;" onmouseout="ige._statsPauseUpdate = false;">Remove</a>): <span style="color:#7aff80">' + itemName + '</span>: <span style="color:#00c6ff">' + res + "</span><br />"
						}
						html += "<br />"
					}
					html += '<div class="sgButton" title="Show / Hide SceneGraph Tree" onmouseup="ige.toggleShowSceneGraph();">Scene</div> <span class="met" title="Frames Per Second">' + self._fps + ' fps</span> <span class="met" title="Draws Per Second">' + self._dps + ' dps</span> <span class="met" title="Draws Per Tick">' + self._dpt + ' dpt</span> <span class="met" title="Tick Delta (How Long the Last Tick Took)">' + self._tickTime + ' ms/pt</span> <span class="met" title="Update Delta (How Long the Last Update Took)">' + self._updateTime + ' ms/ud</span> <span class="met" title="Render Delta (How Long the Last Render Took)">' + self._renderTime + " ms/rd</span>",
					self.network && (html += ' <span class="met" title="Network Latency (Time From Server to This Client)">' + self.network._latency + " ms/net</span>"),
					self._statsDiv.innerHTML = html
				}
		},
		toggleShowSceneGraph : function () {
			if (this._showSgTree = !this._showSgTree, this._showSgTree) {
				var t,
				e = this,
				i = document.createElement("div");
				i.id = "igeSgTree",
				i.style.height = ige._geometry.y - 30 + "px",
				i.style.overflow = "auto",
				i.addEventListener("mousemove", function (t) {
					t.stopPropagation()
				}),
				i.addEventListener("mouseup", function (t) {
					t.stopPropagation()
				}),
				i.addEventListener("mousedown", function (t) {
					t.stopPropagation()
				}),
				t = document.createElement("ul"),
				t.id = "sceneGraph_items",
				i.appendChild(t),
				document.body.appendChild(i);
				var o = document.createElement("div"),
				s = document.createElement("input"),
				n = document.createElement("div"),
				r = document.createElement("iframe");
				o.id = "igeSgConsoleHolder",
				o.innerHTML = "<div><b>Console</b>: Double-Click a SceneGraph Object to Script it Here</div>",
				s.type = "text",
				s.id = "igeSgConsole",
				n.id = "igeSgItemClassChain",
				r.id = "igeSgDocPage",
				r.name = "igeSgDocPage",
				o.appendChild(s),
				o.appendChild(n),
				o.appendChild(r),
				document.body.appendChild(o),
				this.sgTreeUpdate();
				var a = document.createElement("input");
				a.type = "button",
				a.id = "igeSgRefreshTree",
				a.style.position = "absolute",
				a.style.top = "0px",
				a.style.right = "0px",
				a.value = "Refresh",
				a.addEventListener("click", function () {
					e.sgTreeUpdate()
				}, !1),
				document.getElementById("igeSgTree").appendChild(a)
			} else {
				var h = document.getElementById("igeSgTree");
				h.parentNode.removeChild(h),
				h = document.getElementById("igeSgConsoleHolder"),
				h.parentNode.removeChild(h)
			}
		},
		sgTreeUpdate : function () {
			document.getElementById("sceneGraph_items").innerHTML = "",
			this.addToSgTree(this.getSceneGraphData(this, !0))
		},
		timeScale : function (t) {
			return t !== void 0 ? (this._timeScale = t, this) : this._timeScale
		},
		incrementTime : function (t, e) {
			return e || (e = t),
			this._currentTime += (t - e) * this._timeScale,
			this._currentTime
		},
		currentTime : function () {
			return this._currentTime
		},
		useManualTicks : function (t) {
			return t !== void 0 ? (this._useManualTicks = t, this) : this._useManualTicks
		},
		manualTick : function () {
			this._manualFrameAlternator !== this._frameAlternator && (this._manualFrameAlternator = this._frameAlternator, requestAnimFrame(this.tick))
		},
		useManualRender : function (t) {
			return t !== void 0 ? (this._useManualRender = t, this) : this._useManualRender
		},
		manualRender : function () {
			this._manualRender = !0
		},
		tick : function (t, e) {
			var i,
			o,
			s,
			n,
			r,
			a = ige,
			h = a._postTick,
			l = h.length;
			if (a.incrementTime(t, a._timeScaleLastTimestamp), a._timeScaleLastTimestamp = t, t = Math.floor(a._currentTime), igeDebug._timing && (i = (new Date).getTime()), a._state) {
				for (e === void 0 && (e = a._ctx), a._frameAlternator = !a._frameAlternator, ige._useManualTicks ? a._manualFrameAlternator = !a._frameAlternator : requestAnimFrame(a.tick), a._tickStart = t, a._tickStart -= a._clientNetDiff, a.lastTick ? a._tickDelta = a._tickStart - a.lastTick : (a.lastTick = 0, a._tickDelta = 0), a._enableUpdates && (igeDebug._timing ? (s = (new Date).getTime(), a.update(e), ige._updateTime = (new Date).getTime() - s) : a.update(e)), a._enableRenders && (a._useManualRender ? a._manualRender && (igeDebug._timing ? (n = (new Date).getTime(), a.render(e), ige._renderTime = (new Date).getTime() - n) : a.render(e), a._manualRender = !1) : igeDebug._timing ? (n = (new Date).getTime(), a.render(e), ige._renderTime = (new Date).getTime() - n) : a.render(e)), r = 0; l > r; r++)
					h[r]();
				a.lastTick = a._tickStart,
				a._frames++,
				a._dpt = a._drawCount,
				a._drawCount = 0,
				a.input.tick()
			}
			a._resized = !1,
			igeDebug._timing && (o = (new Date).getTime(), ige._tickTime = o - i)
		},
		update : function (t) {
			var e,
			i,
			o,
			s = this._children;
			if (this._processUpdateBehaviours(t), s)
				if (e = s.length, igeDebug._timing)
					while (e--)
						i = (new Date).getTime(), s[e].update(t), o = (new Date).getTime() - i, s[e] && (ige._timeSpentInUpdate[s[e].id()] || (ige._timeSpentInUpdate[s[e].id()] = 0), ige._timeSpentLastUpdate[s[e].id()] || (ige._timeSpentLastUpdate[s[e].id()] = {}), ige._timeSpentInUpdate[s[e].id()] += o, ige._timeSpentLastUpdate[s[e].id()].ms = o);
				else
					while (e--)
						s[e].update(t)
		},
		render : function (t) {
			var e,
			i;
			this._processTickBehaviours(t),
			this._viewportDepth && (igeDebug._timing ? (e = (new Date).getTime(), this.depthSortChildren(), i = (new Date).getTime() - e, ige._timeSpentLastTick[this.id()] || (ige._timeSpentLastTick[this.id()] = {}), ige._timeSpentLastTick[this.id()].depthSortChildren = i) : this.depthSortChildren()),
			t.save(),
			t.translate(this._geometry.x2, this._geometry.y2);
			var o,
			s = this._children;
			if (s)
				if (o = s.length, igeDebug._timing)
					while (o--)
						t.save(), e = (new Date).getTime(), s[o].tick(t), i = (new Date).getTime() - e, s[o] && (ige._timeSpentInTick[s[o].id()] || (ige._timeSpentInTick[s[o].id()] = 0), ige._timeSpentLastTick[s[o].id()] || (ige._timeSpentLastTick[s[o].id()] = {}), ige._timeSpentInTick[s[o].id()] += i, ige._timeSpentLastTick[s[o].id()].ms = i), t.restore();
				else
					while (o--)
						t.save(), s[o].tick(t), t.restore();
			t.restore()
		},
		fps : function () {
			return this._fps
		},
		dpt : function () {
			return this._dpt
		},
		dps : function () {
			return this._dps
		},
		analyseTiming : function () {
			igeDebug._timing || this.log("Cannot analyse timing because the igeDebug._timing flag is not enabled so no timing data has been recorded!", "warning")
		},
		saveSceneGraph : function (t) {
			var e,
			i,
			o;
			if (t || (t = this.getSceneGraphData()), t.obj.stringify ? t.str = t.obj.stringify() : console.log("Class " + t.classId + " has no stringify() method! For object: " + t.id, t.obj), e = t.items)
				for (i = e.length, o = 0; i > o; o++)
					this.saveSceneGraph(e[o]);
			return t
		},
		sceneGraph : function (t, e) {
			var i,
			o,
			s,
			n,
			r = "";
			for (e === void 0 && (e = 0), t || (t = ige), i = 0; e > i; i++)
				r += "----";
			if (igeDebug._timing ? (o = "", o += "T: " + ige._timeSpentInTick[t.id()], ige._timeSpentLastTick[t.id()] && (typeof ige._timeSpentLastTick[t.id()].ms == "number" && (o += " | LastTick: " + ige._timeSpentLastTick[t.id()].ms), typeof ige._timeSpentLastTick[t.id()].depthSortChildren == "number" && (o += " | ChildDepthSort: " + ige._timeSpentLastTick[t.id()].depthSortChildren)), console.log(r + t.id() + " (" + t._classId + ") : " + t._inView + " Timing(" + o + ")")) : console.log(r + t.id() + " (" + t._classId + ") : " + t._inView), e++, t === ige) {
				if (s = t._children) {
					n = s.length;
					while (n--)
						s[n]._scene._shouldRender && (igeDebug._timing ? (o = "", o += "T: " + ige._timeSpentInTick[s[n].id()], ige._timeSpentLastTick[s[n].id()] && (typeof ige._timeSpentLastTick[s[n].id()].ms == "number" && (o += " | LastTick: " + ige._timeSpentLastTick[s[n].id()].ms), typeof ige._timeSpentLastTick[s[n].id()].depthSortChildren == "number" && (o += " | ChildDepthSort: " + ige._timeSpentLastTick[s[n].id()].depthSortChildren)), console.log(r + "----" + s[n].id() + " (" + s[n]._classId + ") : " + s[n]._inView + " Timing(" + o + ")")) : console.log(r + "----" + s[n].id() + " (" + s[n]._classId + ") : " + s[n]._inView), this.sceneGraph(s[n]._scene, e + 1))
				}
			} else if (s = t._children) {
				n = s.length;
				while (n--)
					this.sceneGraph(s[n], e)
			}
		},
		getSceneGraphData : function (t, e) {
			var i,
			o,
			s,
			n,
			r,
			a = [];
			if (t || (t = ige), i = {
					text : t.id() + " (" + t._classId + ")",
					id : t.id(),
					classId : t.classId()
				}, e ? i.parentId = t._parent ? t._parent.id() : "sceneGraph" : (i.parent = t._parent, i.obj = t), t === ige) {
				if (n = t._children) {
					r = n.length;
					while (r--)
						o = {
							text : n[r].id() + " (" + n[r]._classId + ")",
							id : n[r].id(),
							classId : n[r].classId()
						},
					e ? n[r]._parent && (o.parentId = n[r]._parent.id()) : (o.parent = n[r]._parent, o.obj = n[r]),
					n[r]._scene && (s = this.getSceneGraphData(n[r]._scene, e), o.items = [s]),
					a.push(o)
				}
			} else if (n = t._children) {
				r = n.length;
				while (r--)
					o = this.getSceneGraphData(n[r], e), a.push(o)
			}
			return a.length > 0 && (i.items = a),
			i
		},
		destroy : function () {
			this.stop(),
			this.isServer || this.removeCanvas(),
			this._super(),
			this.log("Engine destroy complete.")
		}
	});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = IgeEngine)