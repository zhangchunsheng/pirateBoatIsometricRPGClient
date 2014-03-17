/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-19
 * Description: 物品详情弹出框
 */
/**
 * 在方格旁边显示另一个div
 * @param  {Object} cell          被点击的元素
 * @param  {String} content       返回被显示内容的函数
 * @param  {String} buttonA       按键A 
 *                                -- button = {text:'', onClick: callback};
 * @param  {String} buttonB       按键B 
 *                                -- button = {text:'', onClick: callback};
 * @param  {Boolean}block        是否显示遮罩
 */
UI.cellPopup = function (cell, content, buttonA, buttonB, block) {
	var parent = (cell.parentNode || cell.parentElement);
	if (!UI[parent.id].cellPopup) {
		UI[parent.id].cellPopup =  UI._ui.makeDom(
			'div',
			{ },
			gridPopup.wraperStyle,
			null
		);

		// 定位在被点击的单元格右侧
		UI[parent.id].cellPopup.style.top = parseInt(cell.style.top) - 17 + 'px';
		UI[parent.id].cellPopup.style.left = parseInt(cell.style.left) + parseInt(cell.style.width) + 'px';

		// 插入内容
		UI[parent.id].cellPopup.text = UI._ui.makeDom(
			'div',
			{
				innerHTML: (content && content()) || ''
			},
			gridPopup.textStyle,
			null
		);
		UI[parent.id].cellPopup.appendChild(UI[parent.id].cellPopup.text);
		// 生成按键
		if (buttonA) {
			//按钮A
			UI[parent.id].cellPopup.btnA = UI._ui.makeDom(
				'div',
				{
					innerHTML: buttonA.text || '按键文本'
				},
				gridPopup.btnStyle,
				{
					mousedown: function(e) {
						UI.stopPropagation(e);
						this.style.background = 'url(./res/ui/btn/popupbox_btn.png) no-repeat';
					},
					mouseup: function(e) {
						UI.stopPropagation(e);
						this.style.background = 'url(./res/ui/btn/popupbox_btn.png) no-repeat';
						if (typeof buttonA.onClick === 'function') {
							buttonA.onClick.call(UI[parent.id].cellPopup.btn);
						};
					}
				}
			);
			UI[parent.id].cellPopup.appendChild(UI[parent.id].cellPopup.btnA);
		};
		if (buttonB) {
			//按钮B
			UI[parent.id].cellPopup.btnB = UI._ui.makeDom(
				'div',
				{
					innerHTML: buttonB.text || '按键文本'
				},
				gridPopup.btnStyle,
				{
					mousedown: function(e) {
						UI.stopPropagation(e);
						this.style.background = 'url(./res/ui/btn/popupbox_btn.png) no-repeat';
					},
					mouseup: function(e) {
						UI.stopPropagation(e);
						this.style.background = 'url(./res/ui/btn/popupbox_btn.png) no-repeat';
						if (typeof buttonB.onClick === 'function') {
							buttonB.onClick.call(UI[parent.id].cellPopup.btn);
						};
					}
				}
			);
			// 当有按键B的时候，修改亮按键的位置
			UI[parent.id].cellPopup.btnA.style.left = '25px';
			UI[parent.id].cellPopup.btnB.style.left = '116px';
			UI[parent.id].cellPopup.appendChild(UI[parent.id].cellPopup.btnB);
		};
		(cell.parentNode || cell.parentElement).appendChild(UI[parent.id].cellPopup);
	} else {
		var _top = parseInt(cell.style.top) - 17 + 'px';
			_left = parseInt(cell.style.left) + parseInt(cell.style.width) + 'px';
		if (UI[parent.id].cellPopup.style.top === _top && UI[parent.id].cellPopup.style.left === _left ) {
			UI[parent.id].cellPopup.style.display = UI[parent.id].cellPopup.style.display === 'none' ? 'block' : 'none';
		} else {
			UI.animate(UI[parent.id].cellPopup, {
				'top': _top,
				'left': _left
			}, 0, function() {
				if (this.style.display != 'block') {
					this.style.display = 'block';
				}
				this.text.innerHTML = (content && content()) || '';
			});
		}
	} 
}