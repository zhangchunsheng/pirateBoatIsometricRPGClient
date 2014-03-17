/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-03-27
 * Description: 骰子
 */
(function(UI, $) {
	$.ui.dice = function(param) {
		var _props = $.interFace({
			id: '',
			value: '骰子',
			width: null,
			height: null,
			spritewidth: 128,
			spriteheight: 128,
			animationspeed: 1000,
			spritecount: {x: 4, y: 2},
			x: 0,
			y: 0,
			maxX: 400,
			maxY: 300,
			path: [{x: 300, y: 0}],
			color: '#333333',
			bgColor: '',
			fontSize: '12px',
			fontWeight: 'normal',
			position: '',
			appendTo: '',
			hided: false,
			disabled: false,
			ui: { id: '', sx: 0, sy: 0, hx: 0, hy: 0, w: 128, h: 128 },
			click: function(e) { } //点击后执行的逻辑[非事件回调]
		}, param || {});
		$.ui.core.call(this, _props.id, _props.x, _props.y, _props.width, _props.height, _props.hided);
		this.disabled = _props.disabled;
		this.ui = _props.ui;
		this.bgUrl = '';
		this.type = 'dice';
		this.spritewidth = _props.spritewidth;
		this.spriteheight = _props.spriteheight;
		this.animationspeed = _props.animationspeed;
		this.spritecount = {
			x: ~~(_props.height / _props.spriteheight),
			y: ~~(_props.width / _props.spritewidth)
		};
		this.animations = [];
		this.currentIndex = 0;
		this.degree = 0;
		this.nextPos = 1;
		this.scale = 0.3;
		this.path = _props.path;
		this.minX = 0;
		this.minY = 0;
		this.maxX = _props.maxX - this.spritewidth;
		this.maxY = _props.maxY - this.spriteheight;
		for(var i = 0 ; i < this.spritecount.x * this.spritecount.y ; i++) {
			this.animations.push({
				x: ~~(-i % this.spritecount.y) * this.spritewidth + "px",
				y: ~~(-i / this.spritecount.y) * this.spriteheight + "px"
			});
		}
		
		//判断UI资源图是否存在
		if (this.ui.id != '') {
			var _bgImage = me.loader.getImage(this.ui.id);
			console.dir(_bgImage);
			if (_bgImage)
				this.bgUrl = _bgImage.src;
			_bgImage = null;
		}
		var _cssStyle = { width: this.spritewidth + 'px', height: this.spriteheight + 'px', display: this.hided ? 'none' : 'block' }, 
		_events = { click: _props.click };
		if (_props.position == 'absolute') {
			_cssStyle.position = 'absolute';
			_cssStyle.left = this.x + 'px';
			_cssStyle.top = this.y + 'px';
		} else {
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
			
		this.dom = this.makeDom('div', {
			id: this.id,
			type: 'dice',
			value: _props.value,
			disabled: this.disabled
		}, _cssStyle, _events);
		
		this.dom.that = this;
		if (_props.appendTo != '')
			this.appendTo(_props.appendTo); //如果指定父节点则直接添加
		_events = null;
		_cssStyle = null;
		_props = null;
		
		this.animation();
		
		return this;
	};
	$.extend($.ui.dice, $.ui.core, {
		animation: function() {
			var that = this;
			if(this.currentIndex > 7)
				this.currentIndex = 0;
			if(this.degree == 360)
				this.degree = 0;
			//this.x = btg.random(this.minX, this.maxX);
			//this.y = btg.random(this.minY, this.maxY);
			if(this.x > this.path[0].x || this.y > 100) {
				this.x = this.minX;
				this.scale = 0.3;
			}
			this.y = UI.Tween.Bounce.easeOut(this.x, 0, 100, 100);
			this.dom.style.webkitTransform = "translate(" + this.x + "px," + this.y + "px) scale(" + this.scale + ", " + this.scale + ") rotate(" + this.degree + "deg)";
			this.dom.style.backgroundPosition = this.animations[this.currentIndex].x + " " + this.animations[this.currentIndex].y;
			this.currentIndex++;
			this.degree += 30;
			this.x += 10;
			this.scale += 0.02;
			this.timerId = setTimeout(function() {
				that.animation();
			}, this.animationspeed);
		}
	});
})(UI, smartlib);