/**
 * UI核心库
 */
(function($) {
	//基类构造函数
	$.ui.core = function(id, x, y, width, height, hided) { 
		this.id = id;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.hided = hided;
	};
	$.ui.core.prototype = {
		/**
		 * 创建dom通用方法
		 * @param {string} tag
		 * @param {array} attributes
		 * @param {array} styles
		 * @param {Function} events
		 */
		makeDom: function(tag, attributes, styles, events) {
			var _attributes = attributes || {},
			_styles = styles || {},
			_events = events || {},
			_dom = document.createElement(tag), _a;
			//处理宽高百分比
			if (_styles.width && _styles.width.indexOf('%') >= 0)
				_styles.width = _styles.width.replace('px', '');
			if (_styles.height && _styles.height.indexOf('auto') >= 0)
				_styles.height = _styles.height.replace('px', '');
			for (_a in _attributes)
				_dom[_a] = _attributes[_a];
			for (_a in  _styles) 
				_dom.style[_a] = _styles[_a];
			for (_a in _events)
				_dom['on' + _a] = _events[_a];
			_a = null;
			if (_dom.style['float']) {
				_dom.style['cssFloat'] = _dom.style['float'];
				_dom.style['styleFloat'] = _dom.style['float'];
			}
			if (_styles.radius) {
				var _radius = _styles.radius + 'px';
				_dom.style.WebkitBorderRadius = _radius;
				_dom.style.MozBorderRadius = _radius;
				_dom.style.MsBorderRadius = _radius;
				_dom.style.OBorderRadius = _radius;
				_dom.style.BorderRadius = _radius;
				_dom.style.borderRadius = _radius;
				_radius = null;
			}
            _events = _styles = _attributes = null;
			return _dom;
		},
		/**
		 * 创建框架
		 * @param {Object} param
		 */
		makeFrame: function(param) {
			var _props = $.interFace({
				id: '',
				width: 600,
				height: 400,
				x: 0,
				y: 0,
				bgColor: '#F9ECC2',
				bgStyle: 'frameStyle', //优化dataURL创建机制
				hided: false,
				clips: [],
                background: '',
				backgroundSize: '',
				zIndex: 0
			}, param), _frame, _a, _len = _props.clips.length, _tile, _sonStyles;
			//创建父节点
			_frame = this.makeDom('div', { attr: 'id', value: _props.id }, {
				position: 'absolute',
				left: _props.x + 'px',
				top: _props.y + 'px',
				width: _props.width + 'px',
				height: _props.height + 'px',
                background: _props.background,
				backgroundSize: _props.backgroundSize,
				backgroundColor: _props.bgColor,
				display: _props.hided ? 'none' : 'block',
				zIndex: _props.zIndex
			}, null);
			this.setFrameBG(_frame, _props.clips, _props.width, _props.height);
			_son$tyles = _tile = _len = _a = _props = null;
			return _frame;
		},
		/**
		 * 设置九宫格背景
		 * @param {dom} frame
		 * @param {array} clips
		 * @param {number} width
		 * @param {number} height
		 */
		setFrameBG: function(frame, clips, width, height) {
			if (frame && clips && clips.length >= 9) {
				//校对子节点样式
				clips[1].w = parseInt(width - clips[0].w - clips[2].w);
				if (clips[1].w < 1)
					clips[1].w = 1;
				clips[7].w = clips[1].w;
				clips[3].h = parseInt(height - clips[0].h - clips[6].h);
				if (clips[3].h < 1)
					clips[3].h = 1;
				clips[5].h = clips[3].h;
				clips[4].w = clips[1].w;
				clips[4].h = clips[3].h;
				var _bgis = [], _bgps = [
					'0 0', 
					clips[0].w + 'px 0', 
					(clips[0].w + clips[1].w) + 'px 0', 
					'0 ' + clips[0].h + 'px', 
					clips[0].w + 'px ' + clips[0].h + 'px', //不错位
					(clips[0].w + clips[1].w) + 'px ' + clips[2].h + 'px', 
					'0 ' + (clips[0].h + clips[3].h) + 'px', 
					clips[0].w + 'px ' + (clips[0].h + clips[3].h) + 'px', 
					(clips[0].w + clips[1].w) + 'px ' + (clips[0].h + clips[3].h) + 'px'
				], _bgss = [], _bgrs = [];
				for (var ti = 0, t; t = clips[ti]; ti++) {
					_bgis.push('url(' + t.bg + ')');
					_bgss.push(t.w + 'px ' + t.h + 'px');
					_bgrs.push('no-repeat');
				}
				frame.style.backgroundImage = _bgis.join(',');
				frame.style.backgroundPosition = _bgps.join(',');
				frame.style.backgroundSize = _bgss.join(',');
				frame.style.backgroundRepeat = _bgrs.join(',');
			}
		},
		/**
		 * 添加一个dom节点
		 * @param {object} dom
		 */
		append: function(dom) {
			if (!dom)
				return this;
			var _parent;
			_parent = this.dom;
			_parent.appendChild(dom);
			_parent = null;
			return this;
		},
		/**
		 * 添加一个dom到节点
		 * @param {string} domid
		 */
		appendTo: function(domid) {
			var _dom = domid == 'body' ? document.body : $.getDom(domid);
			_dom.appendChild(this.dom);
			_dom = null;
			return this;
		},
	};
})(smartlib);
