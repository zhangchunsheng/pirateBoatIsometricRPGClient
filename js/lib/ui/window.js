/**
 * @author Administrator
 */
(function($) {
	$.ui.window = function(param) {
		var _args = $.interFace({
			id: '',
			width: 400,
			height: 400,
			context: null,
			fontSize: '14px',
			color: '#FFF',
	        textShadow: '',
			titleHeight: 30,
			title: '窗体',
			x: -1,
			y: -1,
			items: [],
			hided: false,
	        showTool: true, //是否显示关闭按钮
			padding: 20,
			bgColor: '',
			block: false,
	        blockClick: false, //点击遮罩面板后关闭窗口，只有block为true生效
			blockColor: 'rgba(0, 0, 0, 0.2)',
			clips: [], //背景拼图
			background: '',
			backgroundSize: '',
			closeBtnUi: { bg: '', width: 20, height: 20, value: '', sx: 0, sy: 0, hx: 20, hy: 0, dx: 0, dy: 0 }, //关闭按钮视图对象
			closed: function(target) { }, //关闭回调函数
			data: null,
			zIndex: 1000,
			html: '', //窗体内容
			scroll: 'auto', //滚动条 auto、scroll、hidden
			parentNode: null
		}, param || {});
		//继承基类构造函数
		$.ui.core.call(this, _args.id, _args.x, _args.y, _args.width, _args.height, _args.hided);
		this.block = _args.block;
		this.blockContext = null;
		this.data = _args.data;
		this.parentNode = _args.parentNode;
		var _that = this; //事件中需要用到的上下文闭包变量
		if (this.block) {
			this.blockContext = document.createElement('div');
			this.blockContext.style.position = 'absolute';
			this.blockContext.style.left = '0px';
			this.blockContext.style.top = '0px';
			this.blockContext.style.width = window.sceneSize.width + 'px'
			this.blockContext.style.height = window.sceneSize.height + 'px'
			this.blockContext.style.backgroundColor = _args.blockColor;
			this.blockContext.style.zIndex = _args.zIndex;
			//添加模态遮罩
			this.blockContext.style.display = this.hided ? 'none' : 'block';
			if (_args.blockClick) {
                this.blockContext.closeBtn = this.closeBtn; //关联关闭按钮
                this.blockContext.onmouseup = function(e) {
                    _that.destroy();
                };
                this.blockContext.ontouchend = this.blockContext.onmouseup;
            }
			if(_args.parentNode != null) {
				_args.parentNode.appendChild(this.blockContext);
			} else {
				document.body.appendChild(this.blockContext);
			}
		}
		this.closed = _args.closed;
		this.html = _args.html;
		this.type = 'window';
		//如果窗体的坐标小于0则居中处理
		if (this.x < 0) {
			this.x = parseInt((parseInt(window.sceneSize.width) - this.width) >> 1);
			if (this.x < 0) {
				this.x = 0;
			}
		}
		if (this.y < 0) {
			this.y = parseInt((parseInt(window.sceneSize.height) - this.height) >> 1);
			if (this.y < 0) {
				this.y = 0;
			}
		}
		//背景框架
		this.dom = this.makeFrame({ width: this.width, height: this.height, x: this.x, y: this.y, bgColor: _args.bgColor, bgStyle: _args.bgStyle, clips: _args.clips, background: _args.background, backgroundSize: _args.backgroundSize, hided: false, color: _args.color, zIndex: _args.zIndex });
		//添加窗口容器[整体布局+拖条处理]
		this.dom.appendChild(this.makeDom(
			'div',
			{ innerHTML: this.html },
			{ 
				position: 'absolute', 
				left: _args.padding + 'px', 
				top: (_args.padding + _args.titleHeight) + 'px', 
				width: (this.width - _args.padding * 2) + 'px',  
				height: (this.height - _args.titleHeight - _args.padding * 2) + 'px', 
				padding: '0px',
				color: _args.color,
				overflowY: _args.scroll,
				overflowX: 'hidden',
				WebkitOverflowScrolling: _args.scroll == 'hidden' ? 'hidden' : 'touch'
			},
			null
		));
		//添加标题
		this.dom.appendChild(this.makeDom(
			'div',
			{ innerHTML: _args.title },
			{ 
				position: 'absolute', 
				left: '0px', 
				top: '0px', 
				width: (this.width - _args.padding * 2) + 'px', 
				height: _args.titleHeight + 'px',
				lineHeight: _args.titleHeight + 'px', 
				padding: _args.padding + 'px',
				color: _args.color,
				zIndex: _args.zIndex
			},
			null
		));
		//添加关闭按钮
		var _closeBtnBg = '';
		if (_args.closeBtnUi.bg != '') {
			_closeBtnBg = 'url(' + _args.closeBtnUi.bg + ') -' + _args.closeBtnUi.sx + 'px -' + _args.closeBtnUi.sy + 'px';
		}
		this.dom.appendChild(this.makeDom(
			//标签类型
			'input', 
			//属性
			{ 
				type: 'button', 
				value: _args.closeBtnUi.value || '' 
			}, 
			//样式
			{ 
				position: 'absolute', 
				left: ((this.width - _args.closeBtnUi.width + _args.closeBtnUi.dx) + 'px'), 
				top: _args.closeBtnUi.dy + 'px',
				background: _closeBtnBg, 
				border: '0px', 
				width: _args.closeBtnUi.width + 'px', 
				height: _args.closeBtnUi.height + 'px',
				zIndex: _args.zIndex,
				display: _args.showTool ? 'block' : 'none'
			}, 
			//事件
			{ 
				click: function(e) {
					_that.destroy();
				} 
			}
		));
		_closeBtnBg = null;
		if(_args.parentNode != null) {
			_args.parentNode.appendChild(this.dom);
		} else {
			document.body.appendChild(this.dom);
		}
		_args = null;
	};
	//继承基类原型链
	$.extend($.ui.window, $.ui.core, {
		destroy: function() {
			if (this.dom) {
				if ($.ui.window.beforeClosed) { //窗口关闭前公共事件
					$.ui.window.beforeClosed();
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
				this.dom = null;
				if (this.closed) { //执行关闭回调
					this.closed();
				}
				if ($.ui.window.afterClosed) { //窗口关闭后公共事件
					$.ui.window.afterClosed();
				}
			}
			return this;
		}
	});
	$.ui.window.beforeClosed = null; //关闭窗口前通用事件回调
	$.ui.window.afterClosed = null; //关闭窗口后通用事件回调
})(smartlib);
