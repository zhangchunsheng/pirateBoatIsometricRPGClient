/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Modify: Peter Zhang
 * Date: 2013-03-06
 * Description: 窗体管理类
 * 				加入对场景、提示框的定位支持，以窗体dom的id属性来做区分
 */
(function(UI, lib) {
	UI.windowManager = {};

	// 当前显示的窗体，最大长度 2
	UI.windowManager.windows = [];

	// 当前场景
	UI.windowManager.scene = {};

	// 提示框
	UI.windowManager.messageBox = {};

	// 消除resize事件重复触发带来的影响
	var timer;
	UI.bind(window, 'resize', function(){
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(function (){
			UI.windowManager.reflowPosition();
		}, 100);
	});

	UI.windowManager.coexistMatch = {
		'strengthenWindow': 'pirateBoatWindow',
		'packageWindow': 'characterWindow',
		'characterWindow': 'packageWindow'
	}

	/**
	 * 添加窗口对象
	 * 除共存情况外，关闭掉先打开的窗体，只显示后打开的
	 * @param  {Object}	windows 窗口对象
	 * @param  {Number} offsetLeft	强制该窗体相对视窗左边框的距离
	 */
	UI.windowManager.push = function (window, offsetLeft) {
		var _name = window.w.dom.id.match(/Window|Scene|messageBox/)[0];
		console.log(_name);
		if (_name === 'Scene') {
			UI.windowManager.scene.close && UI.windowManager.scene.close();
			UI.windowManager.scene = window;
			UI.windowManager.reflowPositionScene();
		} else if (_name === 'messageBox') {
			UI.windowManager.messageBox.close && UI.windowManager.messageBox.close();
			UI.windowManager.messageBox = window;
			UI.windowManager.reflowPositionMessageBox();
		} else {
			//如果窗体不能共存，则关闭前前一个窗体
			if (!!this.windows.length && this.windows[0].w.type !== this.coexistMatch[window.w.type]) {
				for (var i = 0, len = this.windows[0].w.dom.childNodes.length; i < len; i++) {
					if (this.windows[0].w.dom.childNodes[i].id === 'closeBtn') {
						UI.fire(this.windows[0].w.dom.childNodes[i], 'click');
						break;
					}
				};
				this.windows.pop();
			};
			//如果有右侧标签，则位置上相对既定，向左移动
			this.windows.push({
				w: window.w,
				l: window.tabs ? 55 : 115,
				offsetLeft: offsetLeft || 0
			});
			UI.windowManager.reflowPositionWindow();
		}
		_name = null;
	}


	/**
	 * 将窗口对象移出数组
	 * @param  {Object} window 		窗口对象
	 */
	UI.windowManager.pop = function (window) {
		var _name = window.w.dom.id.match(/Window|Scene|messageBox/)[0];
		if (_name === 'Scene') {
			UI.windowManager.scene = {};
		} else if (_name === 'messageBox'){
			UI.windowManager.messageBox = {};
		} else {
			var i = this.windows.length - 1;
			for (; i >= 0; i--) {
				if (this.windows[i].w.dom.id == window.w.dom.id) {
					this.windows.splice(i, 1);
					return;
				}
			};
		}
		_name = null;
	}

	UI.windowManager.reflowPosition = function () {
		// 定位当前场景窗体
		UI.windowManager.reflowPositionScene();
		UI.windowManager.reflowPositionWindow();
		UI.windowManager.reflowPositionMessageBox();
	}

	/**
	 * 重新定位窗体
	 * 单独存在的窗体，以除去左右侧标签后的宽度和高度进行居中定位
	 * 打开两个以上的窗体，先打开的窗体居左
	 */
	UI.windowManager.reflowPositionWindow = function () {
		if (UI.windowManager.windows.length == 0) {
			return;
		}
		if (UI.windowManager.windows.length == 1) {
			UI.animate(
				UI.windowManager.windows[0].w.dom,
				{
					left: UI.offset.left + (this.windows[0].offsetLeft || ~~((960 - parseInt(this.windows[0].w.dom.style.width)) / 2)) + 'px',
					top: UI.offset.top + ui_config.window.top + 'px'
				}
			);
		} else if (UI.windowManager.windows.length == 2 && parseInt(UI.windowManager.windows[0].w.dom.style.left) == 485 + UI.offset.left) {
			//如果当前在显示的窗体在右侧，则居左
			UI.animate(
				UI.windowManager.windows[1].w.dom,
				{
					left: UI.windowManager.windows[1].l + UI.offset.left + 'px',
					top: UI.offset.top + ui_config.window.top + 'px'
				},
				UI.sys.fps
			);
		} else {
			//第一个窗体居左
			UI.animate(
				UI.windowManager.windows[0].w.dom,
				{
					left: UI.windowManager.windows[0].l + UI.offset.left + 'px',
					top: UI.offset.top + ui_config.window.top + 'px'
				},
				UI.sys.fps
			);
			//第二个窗体居右
			UI.animate(
				UI.windowManager.windows[1].w.dom,
				{
					left: 485 + UI.offset.left + 'px',
					top: UI.offset.top + ui_config.window.top + 'px'
				},
				UI.sys.fps
			);
		}
		if(UI.characterWindow.attrWindow.w.dom) {
			UI.animate(
				UI.characterWindow.attrWindow.w.dom,
				{
					left: UI.windowManager.windows[0].l + UI.offset.left + parseInt(UI.characterWindow.w.dom.style.width) + 5 + "px",
					top: UI.offset.top + ui_config.window.top + 'px'
				},
				UI.sys.fps
			);
		}
	}

	// 定位场景
	UI.windowManager.reflowPositionScene = function () {
		if(UI.windowManager.scene.reflowPosition) {
			UI.windowManager.scene.reflowPosition();
		}
	}

	// 定位提示框
	UI.windowManager.reflowPositionMessageBox = function () {
		if(UI.messageBox.w.dom && UI.messageBox.reflowPosition) {
			UI.messageBox.reflowPosition();
		}
	}
})(window.UI, smartlib);