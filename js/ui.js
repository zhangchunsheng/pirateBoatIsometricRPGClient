/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-02-23
 * Description: 游戏UI
 */
var UI = (function() {
	var UI = {
		isDebug: false,
		gameCanvas: null,
		scale: 0.9,
		mainDiv: null,
		lang: null,
		canUseLang: {
			'en' : 'en_US',
			'zh' : 'zh_TW',
			'de' : 'de_DE',
			'es' : 'es_ES',
			'fr' : 'fr_FR',
			'it' : 'it_IT',
			'ja' : 'ja_JP',
			'ko' : 'ko_KR',
			'pt' : 'pt_BR',
			'ru' : 'ru_RU',
			'zh-cn':'zh_CN'
		},
		offset: {
			left: 0,
			top: 0,
			right: 0,
			bottom: 0
		},
		sceneSize: {
			width: window.innerWidth,
			height: window.innerHeight
		},
		deviceType: "pc",
		enums: {
			deviceType: {
				touch: 1,
				pc: 2
			}
		},
		sys: {
			fps: 200,
			enable_shadow: true
		}
	};
	return UI;
})();

window.UI = UI;

(function(UI, lib) {
	/**
	 * 初始化
	 */
	UI.init = function(isDebug) {
		UI.mainDiv = UI.getDom("body")[0];
		UI.deviceType = btg.os;
		UI.gameCanvas = btg.canvas || UI.getDom("#canvas");
		window.sceneSize = UI.sceneSize = {
			width: window.innerWidth,
			height: window.innerHeight
		};

		var _lang = (navigator.language || navigator.browserLanguage).toLowerCase();
		_lang = (_lang === 'zh-cn') ? 'zh-cn' : _lang.slice(0, _lang.indexOf("_"));
		UI.lang =  UI.canUseLang[_lang] || 'en_US';
		_lang = null;

		UI.offset.left = UI.gameCanvas.offsetLeft;
		UI.offset.top = UI.gameCanvas.offsetTop;
		UI.offset.right = UI.gameCanvas.offsetLeft;
		UI.offset.bottom = UI.gameCanvas.offsetTop;
		
		if(typeof document.querySelector != "function") {
			document.querySelector = function(id) {
				return document.getElementById(id.replace("#", ""));
			}
		}
		
		UI._ui = new lib.ui.core();

		if(isDebug)
			UI.isDebug = isDebug;
		UI.debug("width:" + UI.sceneSize.width + " height:" + UI.sceneSize.height);
		UI.debug("offset left:" + UI.offset.left);
	};

	/**
	 * 绑定元素的事件处理，冒泡阶段
	 * @param  {string}   selector    元素选择器,或元素对象本身
	 * @param  {string}   event       事件类型
	 * @param  {Function} callback    回调函数
	 * @param  {boolean}  useCapture  是否捕获，默认为false
	 */
	UI.bind = function (selector, event, callback, useCapture) {
		if(typeof selector === 'string') {
			selector = UI.getDom(selector);
			if(selector.hasOwnProperty("length")) {
				selector = selector[arguments[3]];
			}
		}
		//绑定事件
		if(selector.addEventListener) {
			selector.addEventListener(event, callback, !!useCapture || false);
		} else {
			selector.attachEvent('on' + event, callback);
		}
	};

	/**
	 * 绑定元素的事件处理，捕获阶段
	 * @param  {string}   selector    元素选择器,或元素对象本身
	 * @param  {string}   event       事件类型
	 * @param  {Function} callback    回调函数
	 * @param  {object}   parent       父节点，默认为document
	 */
	UI.live = function (selector, event, callback, parent) {
		var _p = parent || document;
		//绑定事件
		if(_p.addEventListener) {
			_p.addEventListener(event, function(e) {
				isTheTarget(e.srcElement || e.target) && callback.call(e.srcElement || e.target, e);
			}, true);
		} else {
			_p.attachEvent(event, function(e) {
				isTheTarget(e.srcElement || e.target) && callback.call(e.srcElement || e.target, e);
			});
		}
		_p = null;

		function isTheTarget(currentTarget) {
			var tag;
			if(typeof selector === 'string') {
				tag = (selector[0] === '.') ? 'className' : 'id';
			}
			if(tag) {
				return selector.slice(1) == currentTarget[tag];
			} else {
				return selector == currentTarget;
			}

		}
	};

	/**
	 * 解除事件绑定
	 * @param  {string}   selector    元素选择器,或元素对象本身
	 * @param  {string}   event       事件类型
	 * @param  {Function} callback    回调函数
	 */
	UI.unbind = function (selector, event, callback) {
		if(typeof selector === 'string'){
			//如果之前查找过该元素，并将其保存在UI的属性中，则直接使用
			if(typeof UI[selector] != 'undefined'){
				selector = UI[selector];
			} else {
				selector = UI.getDom(selector);
				if(selector.hasOwnProperty("length")) {
					selector = selector[arguments[3]];
				}
			}
		}
		//解绑
		if(selector.removeEventListener){
			selector.removeEventListener(event, callback, false);
		} else {
			selector.detachEvent('on' + event, callback);
		}
	}

	/**
	 * 模拟事件触发
	 * @param  {string}   selector    元素选择器,或元素对象本身
	 * @param  {string}   event       事件类型
	 */
	UI.fire = function (selector, event) {
		if(typeof selector === 'string') {
			selector = UI.getDom(selector);
			if(selector.hasOwnProperty("length")) {
				selector = selector[arguments[3]];
			}
		}
		if(selector.addEventListener) {
		    selector.click();
		} else {
		    var evt = document.createEvent("MouseEvents");
		    evt.initEvent("click", true, true);
		    selector.dispatchEvent(evt);
		    evt = null;
		}
	}

	/**
	 * 阻止事件冒泡
	 * @param  {Object} event 事件对象
	 */
	UI.stopPropagation = function (event) {
		event = event || window.event;
		event.cancelBubble = true;
        event.stopPropagation && event.stopPropagation();
	};

	/**
	 * 获得当前浏览器厂商提供的属性字符串
	 * @param  {string} styleName 要查询的属性
	 * @return {string} 加上前缀的属性
	 */
	UI.vendor = function(styleName) {
		if(document.body.style[styleName] != undefined){
			return styleName;
		} else {
			var prefix = ['webkit', 'Moz', 'O', 'ms'];
			for(var i = 0, l = prefix.length; i < l; ++i) {
				styleName = prefix[i] + styleName[0].toUpperCase() + styleName.slice(1);
				if(UI.mainDiv.style[styleName] != undefined) {
					return styleName;
				}
			}
		}
	};

	/**
	 * 获得dom节点
	 */
	UI.getDom = function(id) {
		if(id.indexOf("#") === 0) {
			return document.querySelector(id);
		} else {
			return document.querySelectorAll(id);
		}
	};

	/**
	 * 顯示dom節點
	 */
	UI.show = function(element) {
		element.style.display = "block";
	};

	/**
	 * 隱藏dom節點
	 */
	UI.hide = function(element) {
		element.style.display = "none";
	};
	
	/**
	 * 显示隐藏元素
	 */
	UI.toggle = function(element) {
		if(element.style.display == "block") {
			UI.hide(element);
		} else {
			UI.show(element);
			return true;
		}
		return false;
	}

	/**
	 * initSceneItems
	 */
	UI.initSceneItems = function(sceneObject, configScene) {
		if(sceneObject.items == null) {
			sceneObject.items = {};
			var name = "";
			for (var i = 0 ; i < configScene.length ; i++) {
				sceneObject.items[configScene[i].name] = {};
				if(configScene[i].hasOwnProperty("style")) {
					sceneObject.items[configScene[i].name].style = configScene[i].style;
				}
				sceneObject.items[configScene[i].name].className = configScene[i].className || "";
				for (var j = 0 ; j < configScene[i].items.length; j++) {
					name = configScene[i].items[j].name.replace("#", "").replace(".", "");
					sceneObject.items[configScene[i].name][name] = {};
					sceneObject.items[configScene[i].name][name].style = configScene[i].items[j].style;
					if(configScene[i].items[j].hasOwnProperty("className")) {
						sceneObject.items[configScene[i].name][name].className = configScene[i].items[j].className;
					}
				};
			};
		}
	};
	
	/**
	 * 增加px后缀
	 */
	UI.addPx = function(style) {
		var _style = {};
		for(var o in style) {
			if(typeof style[o] == "number") {
				_style[o] = style[o] + "px";
			} else {
				_style[o] = style[o];
			}
		}
		return _style;
	}

	/**
	 * 獲得樣式
	 */
	UI.getStyle = function(sceneObject, container, elementId) {
		return sceneObject.items[container][elementId].style;
	}

	/**
	 * 格式化單個element
	 */
	UI.formatSingleNode = function(sceneObject, container, elementId, html) {
		var style = UI.getStyle(sceneObject, container, elementId);
		var reg = new RegExp("{" + elementId + "}", "g");
		var _s = '';
		for(var o in style) {
			if(typeof style[o] == "number") {
				_s += o + ':' + style[o] + 'px;';
			} else {
				_s += o + ':' + style[o] + ';';
			}
		}
		html = html.replace(reg, _s);
		return html;
	}

	UI.debug = function(info) {
		if(UI.isDebug) {
			console.log(info);
		}
	};

	/**
	 * 显示、隐藏元素
	 * @param  {Object/Array} elets       要显示或隐藏的元素或元素数组
	 * @param  {Boolean}      showORhide true，显示；false，隐藏
	 */
	UI.display = function (elets, showORhide) {
		showORhide = showORhide === true ? 'block' : 'none';
		for (var i = 0, len = elets.length || 1; i < len; i++) {
			if (len === 1) {
				_setDisplay(elets, showORhide);
				break;
			}
			_setDisplay(elets[i], showORhide);
		};

		function _setDisplay (elet, str) {
			elet.style.display = str;
		}
	};
	
	/**
	 * 资源加载
	 */
	UI.onProgress = function() {
		
	};
	
	/**
	 * 资源加载完成
	 */
	UI.loaded = function(callback) {
		loading.hide();
		callback.call(this);
	};
	
	UI.loading = function(callback, resources) {
		loading.show();
		object = this;
		if(arguments.length == 3) {
			object = arguments[2];
		}
		me.loader.onload = UI.loaded.bind(object, callback);
		me.loader.preload(resources);
	};
	
	/**
	 * 获得高度和宽度
	 */
	UI.getRect = function(style, name) {
		var image = me.loader.getImage(name);
		style.width = image.width + "px";
		style.height = image.height + "px";
	};
	
	UI.Tween = {
		Bounce: {
			/*
			 * t: current time 当前时间
			 * b: beginning value 初始值
			 * c: change in value 变化量
			 * d: duration 持续时间
			 */
			easeIn: function(t, b, c, d) {
				return c - Tween.Bounce.easeOut(d - t, 0, c, d) + b;
			},
			easeOut: function(t, b, c, d) {
				if ((t /= d) < (1 / 2.75)) {
					return c * (7.5625 * t * t) + b;
				} else if (t < (2 / 2.75)) {
					return c * (7.5625 * (t -=( 1.5 / 2.75)) * t + .75) + b;
				} else if (t < (2.5 / 2.75)) {
					return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
				} else {
					return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
				}
			},
			easeInOut: function(t, b, c, d) {
				if (t < d / 2)
					return Tween.Bounce.easeIn(t * 2, 0, c, d) * .5 + b;
				else
					return Tween.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
			}
		}
	}

	/**
	 * 动画函数
	 * @param  {object}		elet		被操作的元素对象
	 * @param  {object}		style		目标style对象
	 * @param  {int}		speed		动画持续时间；为0时直接设置属性，即取消动画效果
	 * @param  {Function}	callback	动画结束后的回调函数
	 * @param  {string}		easingType	动画类型
	 */
	UI.animate = function (elet, style, speed, callback, easingType) {
		if (!speed) {
	     	for (var o in style) {
	     		elet.style[UI.vendor(o)] = style[o];
	  		}
	     	callback && callback.apply(elet);
	     	return true;
		} else {
	     	var totalFrame = finishedFrame = 0,
	     		easing = _easing()[easingType || 'def'];
	     	for (var o in style) {
	     	    ++totalFrame;
	     	    doAnimation(UI.vendor(o));
	     	}
	    }

		function doAnimation (attr) {
			var startTime = (new Date()).getTime(),
				totalTime = speed,
				begVal    = parseInt(elet.style[attr]) || elet.offsetTop,
				desVal    = parseInt(style[attr]);
			(function() {
				var passTime = (new Date()).getTime() - startTime;
				if (passTime > totalTime) {
					passTime = totalTime;
					elet.style[attr] = easing(begVal, desVal, passTime, totalTime) + 'px';
					if (++finishedFrame === totalFrame && callback) {
							callback.apply(elet);
					}
					return true;
				} else {
					elet.style[attr] = easing(begVal, desVal, passTime, totalTime) + 'px';
					setTimeout(arguments.callee, 13);
				}
			})();
		}

		function _easing () {
			this.def = function (begVal, desVal, passTime, totalTime) {
				return -(desVal - begVal) * (passTime /= totalTime) * (passTime - 2) + begVal;
			}
			this.easeOutBack = function (begVal, desVal, passTime, totalTime) {
				if ((passTime /= totalTime) < (1/2.75)) {
					return (desVal - begVal) * (7.5625 * passTime * passTime) + begVal;
				} else if (passTime < (2/2.75)) {
					return (desVal - begVal) * (7.5625*(passTime -= (1.5/2.75)) * passTime + .75) + begVal;
				} else if (passTime < (2.5/2.75)) {
					return (desVal - begVal) * (7.5625 * (passTime -= (2.25/2.75)) * passTime + .9375) + begVal;
				} else {
					return (desVal - begVal) * (7.5625 * (passTime -= (2.625/2.75)) * passTime + .984375) + begVal;
				}
			}
			return this;
		}
    };
})(window.UI, smartlib);