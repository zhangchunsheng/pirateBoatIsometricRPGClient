/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-02-27
 * Description: 弹出框
 */
(function($) {
	$.ui.baseWindow = function(param) {
		var _args = $.interFace({
			id: 'window',
			type: "window",
			className: "",
			width: 363,
			height: 467,
			left: ui_config.window.left + UI.offset.left,
			top: ui_config.window.top,
			fontSize: '14px',
			color: '#000000',
	        textShadow: '',
			titleHeight: 40,
			titleFontSize: 24,
			titleTextAlign: 'center',
			title: '弹出框',
			x: -1,
			y: -1,
			block: false,
			items: [],
			hided: false,
			bgColor: '',
			blockColor: 'rgba(0, 0, 0, 0.5)',
			background: 'url(./res/ui/layout/c/window_bg.png) no-repeat',
			closeBtnUi: { bg: 'url(./res/ui/btn/close.png) no-repeat', bg_h: 'url(./res/ui/btn/close_h.png) no-repeat', width: 60, height: 60, top: -20, right: -20}, //关闭按钮
			closed: function(target) { }, //关闭回调函数
			zIndex: 513,
			html: '', //窗体内容
			parentNode: null
		}, param || {});
		//继承基类构造函数
		$.ui.core.call(this, _args.id, _args.x, _args.y, _args.width, _args.height, _args.hided);
		this.block = _args.block;
		this.activeTab = _args.activeTab;
		this.data = _args.data;
		this.parentNode = _args.parentNode;
		var _that = this; //事件中需要用到的上下文闭包变量

		this.blockContext = null;
		this.closed = _args.closed;
		this.html = _args.html;
		this.type = _args.type;
		this._closeBtn = { bg :_args.closeBtnUi.bg, bg_h: _args.closeBtnUi.bg_h};
		//遮罩
		if(this.block) {
			this.blockContext = document.createElement('div');
			this.blockContext.style.position = 'absolute';
			this.blockContext.style.left = '0px';
			this.blockContext.style.top = '0px';
			this.blockContext.style.width = window.innerWidth + 'px'
			this.blockContext.style.height = window.innerHeight + 'px'
			this.blockContext.style.backgroundColor = _args.blockColor;
			this.blockContext.style.zIndex = _args.zIndex;
			this.blockContext.style.display = this.hided ? 'none' : 'block';
			UI.mainDiv.appendChild(this.blockContext);
		}
		//创建主框架
		this.dom = this.makeDom(
			'div',
			{
				id: _args.id,
				innerHTML: this.html,
				className: _args.className
			},
			{
				position: 'absolute',
				left: _args.left + 'px',
				top: _args.top + 'px',
				width: this.width + 'px',
				height: this.height + 'px',
				color: _args.color,
				background: _args.background,
				zIndex: _args.zIndex
			},
			null
		);
		//添加标题
		this.dom.appendChild(this.makeDom(
			'div',
			{ innerHTML: _args.title },
			{
				position: 'absolute',
				left: '0',
				top: '0',
				width: this.width + 'px',
				height: _args.titleHeight + 'px',
				lineHeight: _args.titleHeight + 'px',
				fontSize: _args.titleFontSize + 'px',
				color: _args.color,
				textAlign: _args.titleTextAlign
			},
			null
		));
		//添加关闭按钮
		this.dom.appendChild(this.makeDom(
			//标签类型
			'div',
			{
				id: 'closeBtn'
			},
			//样式
			{
				position: 'absolute',
				right: _args.closeBtnUi.right + 'px',
				top: _args.closeBtnUi.top + 'px',
				background: _args.closeBtnUi.bg,
				width: _args.closeBtnUi.width + 'px',
				height: _args.closeBtnUi.height + 'px'
			},
			//事件
			{
				click: function(e) {
					_that.destroy();
                    e.preventDefault();
                    e.stopPropagation();
				},
				mousedown: function(e) {
					this.style.background = _that._closeBtn.bg_h;
				},
				mouseup: function(e) {
					this.style.background = _that._closeBtn.bg;
				},
				mouseover: function(e) {
					this.style.background = _that._closeBtn.bg_h;
				},
				mouseout: function(e) {
					this.style.background = _that._closeBtn.bg;
				}

			}
		));
		_args = null;

		return this;
	};

	//继承基类原型链
	$.extend($.ui.baseWindow, $.ui.core, {
		show: function() {
			this.dom.style.display = "block";
		},
		hide: function() {
			this.dom.style.display = "none";
		},
		destroy: function() {
			if (this.dom) {
				if ($.ui.baseWindow.beforeClosed) { //窗口关闭前公共事件
					$.ui.baseWindow.beforeClosed();
				}
				//移除模态控制面板
				if (this.blockContext) {
					if(this.parentNode != null) {
						this.parentNode.removeChild(this.blockContext);
					} else {
						document.body.removeChild(this.blockContext);
					}
				}
				//通过当前dom节点的父节点移除对应的dom
				if (this.dom.parentNode)
					this.dom.parentNode.removeChild(this.dom);
				if (this.closed) { //执行关闭回调
					this.closed(this.dom);
				}
				this.dom = null;
				if ($.ui.baseWindow.afterClosed) { //窗口关闭后公共事件
					$.ui.baseWindow.afterClosed();
				}
			}
			return this;
		}
	});
	$.ui.baseWindow.beforeClosed = null; //关闭窗口前通用事件回调
	$.ui.baseWindow.afterClosed = null; //关闭窗口后通用事件回调
})(smartlib);