/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-02-27
 * Description: 按钮
 */
(function($) {
	$.ui.button = function(param) {
		var _props = $.objExtend({
			id: '',
			value: '按钮',
			width: null,
			height: null,
			x: 0,
			y: 0,
			color: '#333333',
			bgColor: '',
			fontSize: '12px',
			fontWeight: 'normal',
			position: '',
			appendTo: '',
			hided: false,
			disabled: false,
			ui: { id: '', sx: 0, sy: 0, hx: 0, hy: 0, w: 50, h: 26 },
			click: function(e) { } //点击后执行的逻辑[非事件回调]
		}, param || {});
		$.ui.core.call(this, _props.id, _props.x, _props.y, _props.width, _props.height, _props.hided);
		this.disabled = _props.disabled;
		this.ui = _props.ui;
		this.bgUrl = '';
		this.type = 'button';
		
		//判断UI资源图是否存在
		if (this.ui.id != '') {
			var _bgImage = $.getImage(this.ui.id);
			if (_bgImage)
				this.bgUrl = _bgImage.url;
			_bgImage = null;
		}
		var _cssStyle = { width: this.width + 'px', height: this.height + 'px', fontSize: _props.fontSize, fontWeight: _props.fontWeight, display: this.hided ? 'none' : 'block' }, 
		_events = { click: _props.click };
		if (_props.position == 'absolute') {
			_cssStyle.position = 'absolute';
			_cssStyle.left = this.x + 'px';
			_cssStyle.top = this.y + 'px';
		}
		else {
			_cssStyle.marginLeft = this.x + 'px';
			_cssStyle.marginTop = this.y + 'px';
		}
		if (_props.bgColor != '')
			_cssStyle.backgroundColor = _props.bgColor;
		_cssStyle.color = _props.color;
		if (this.bgUrl != '') {
			_cssStyle.background = 'url(' + this.bgUrl + ') -' + this.ui.sx + 'px -' + this.ui.sy + 'px'; //背景图
			_cssStyle.border = '0px';
		}
			
		//PC上的默认事件绑定
		if (UI.deviceType == UI.enums.deviceType.pc) {
			_events.mouseover = function(e) {
				if (e.target.that.bgUrl != '')
					e.target.style.background = 'url(' + e.target.that.bgUrl + ') -' + e.target.that.ui.hx + 'px -' + e.target.that.ui.hy + 'px'; //修改背景图
			};
			_events.mouseout = function(e) {
				if (e.target.that.bgUrl != '')
					e.target.style.background = 'url(' + e.target.that.bgUrl + ') -' + e.target.that.ui.sx + 'px -' + e.target.that.ui.sy + 'px'; //修改背景图
			};
		}
		else if (UI.deviceType == UI.enums.deviceType.touch) {
			_events.touchstart = function(e) {
				if (e.target.that.bgUrl != '')
					e.target.style.background = 'url(' + e.target.that.bgUrl + ') -' + (e.target.that.ui.sx + e.target.that.ui.w) + 'px -' + e.target.that.ui.sy + 'px'; //修改背景图
			};
			_events.touchend = function(e) {
				e.preventDefault();
				if (e.target.that.bgUrl != '')
					e.target.style.background = 'url(' + e.target.that.bgUrl + ') -' + e.target.that.ui.sx + 'px -' + e.target.that.ui.sy + 'px'; //修改背景图
			};
			//禁用系统事件
			_events.touchmove = function(e) {
				e.preventDefault();
			};
		}
		this.dom = this.makeDom('input', { id: this.id, type: 'button', value: _props.value, disabled: this.disabled }, 
		_cssStyle, _events);
		
		this.dom.that = this;
		if (_props.appendTo != '')
			this.appendTo(_props.appendTo); //如果指定父节点则直接添加
		_events = null;
		_cssStyle = null;
		_props = null;
	};
	$.extend($.ui.button, $.ui.core);
	/**
	 * 点击按钮
	 * @param {event} e
	 */
	$.ui.button.prototype.click = function(e) {
		if (!this.dom)
			return false;
		var _e = e ? e : { target: this.dom };
		this.dom.onclick(_e);
		_e = null;
		return this;
	};
})(smartlib);