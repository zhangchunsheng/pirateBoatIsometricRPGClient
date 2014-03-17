/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-09
 * Description: 提示框
 */
(function(UI, lib) {
	UI.messageBox = {};
	UI.messageBox.w = {};

	/**
	 * 显示提示框
	 * @param  {String} message 	要显示的信息
	 * @param  {Boolean}block 		是否显示遮罩层，默认为false
	 * @param  {Float}	last  		提示框持续时间，默认为3000ms
	 * @param  {Object} buttonA		按键A 
	 *                              -- button = {text:'', onClick: callback};
	 * @param  {Object} buttonB		按键B 
	 *                              -- button = {text:'', onClick: callback};
	 */
	UI.messageBox.show = function (message, last, block, buttonA, buttonB) {
		var _msg = message || '正文',
			_last = last || 3000,
			_opacity = block ? 0.5 : 0;

		UI.messageBox.w.dom = UI._ui.makeDom(
			'div',
			{
				id: 'messageBox'
			},
			messageBox[0].style,
			null
		);	

		for (var i = messageBox[0].items.length - 1, _name; i >= 0; i--) {
			UI.messageBox[messageBox[0].items[i].name] = UI._ui.makeDom(
				'div',
				{
					innerHTML: messageBox[0].items[i].innerHTML || ''
				},
				messageBox[0].items[i].style,
				null
			);
			UI.messageBox.w.dom.appendChild(UI.messageBox[messageBox[0].items[i].name]);
		};

		UI.messageBox['content'].innerHTML = _msg;
		UI.mainDiv.appendChild(UI.messageBox.w.dom);

		// 创建遮罩层
		UI.messageBox['block'] = UI._ui.makeDom(
			'div',
			{	},
			{
				position: 'absolute',
				width: '960px',
				height: '640px',
				background: '#000000',
				'z-index': 5119,
				opacity: _opacity,
				top: UI.offset.top + 'px',
				left: UI.offset.left + 'px'
			},
			{
				click: function (e){
					UI.stopPropagation(e);
					UI.messageBox.close();
				}
			}
		);
	
		if (buttonA) {
			if(buttonA.text) {
				UI.messageBox['btnA'].innerHTML = buttonA.text;
			}
			UI.show(UI.messageBox['btnA']);
			UI.bind(UI.messageBox['btnA'], 'click', function(){
				buttonA.onClick && buttonA.onClick.apply(UI.messageBox);
			});
		};

		if (buttonB) {
			if(buttonB.text) {
				UI.messageBox['btnB'].innerHTML = buttonB.text;
			}
			UI.show(UI.messageBox['btnB']);
			UI.bind(UI.messageBox['btnB'], 'click', function(){
				buttonB.onClick && buttonB.onClick.apply(UI.messageBox);
			});
		};

		UI.windowManager.push(UI.messageBox, 310);

		UI.mainDiv.appendChild(UI.messageBox['block']);

		this.timer = setTimeout(function(){
			UI.messageBox.close();
		}, _last);
	}

	UI.messageBox.close = function() {
		clearTimeout(this.timer);
		UI.mainDiv.removeChild(UI.messageBox['block']);
		UI.mainDiv.removeChild(UI.messageBox.w.dom);
		UI.windowManager.pop(UI.messageBox);
		UI.messageBox.w.dom = null;
	}

	UI.messageBox.reflowPosition = function() {
		UI.messageBox.w.dom.style.top = UI.offset.top + 90 + 'px';
		UI.messageBox.w.dom.style.left = UI.offset.left + ~~((960 - parseInt(UI.messageBox.w.dom.style.width)) / 2) + 'px';
	}

})(window.UI, smartlib);