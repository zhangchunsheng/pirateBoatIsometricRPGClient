/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-19
 * Description: 物品详情弹出框
 * 				----会在被点击的元素上的第一个类名后拼接上'_active'字串
 * 				----要求被点击的元素被子节点某些元素完全遮罩
 */
/**
 * 在方格旁边显示另一个div
 * 			----若第一个参数是'destory'，则移除弹出框
 * 			----若第一个参数是'hide'，则隐藏弹出框
 * @param  {Object}		cells			被点击的元素数组
 * @param  {String}		content			返回被显示内容的函数
 * @param  {Object}		buttonA			按键A 
 *                         	       			-- button = {text:'', onClick: callback};
 * @param  {Object}		buttonB			按键B 
 *                         	       			-- button = {text:'', onClick: callback};
 * @param  {Boolean}		block			是否显示遮罩
 */
UI.cellPopup = function (cells, content, buttonA, buttonB, block) {

	if (typeof cells === 'string'){
		if (cells === 'destory'){
			return destory(this);
		} else if (cells === 'hide'){
			return hide(this);
		};
	} else if (cells.hasOwnProperty('length')){

		var parent = (cells[0].dom.parentNode || cells[0].dom.parentElement),	// 被点击元素的父节点，seaking中多为window
			keyWord = cells[0].dom.className.split(' ')[0];						// 子节点共有的类名

		// 只绑定父节点的click事件，减少内存消耗
		UI.bind(parent, 'click', function(e) {
			var elet = e.srcElement || e.target;
			elet = elet.parentNode || elet.parentElement;
			if (elet.className.split(' ')[0] === keyWord){
				show(UI[parent.id], elet);
				elet.className = elet.className.replace(RegExp(keyWord), keyWord + '_active');
				if (UI[parent.id].cellPopup.activeElet && UI[parent.id].cellPopup.activeElet.hasOwnProperty('className')) {
					UI[parent.id].cellPopup.activeElet.className = UI[parent.id].cellPopup.activeElet.className.replace(new RegExp(keyWord + '_active'), keyWord);
				}
				UI[parent.id].cellPopup.activeElet = elet;
			} else {
				hide(parent);
			};
			return true;
		});
	} else {
		return false;
	}

	// 显示弹出框
	function show (parent, elet){
		if (!parent.cellPopup) {
			create(parent, elet);
			parent.cellPopup.activeElet = {}; // 当前被标记为活动的节点
		}
		setPosition(elet);
		if (parent.cellPopup.style.display === 'none'){
			parent.cellPopup.style.display = 'block';
		}
		parent.cellPopup.setAttribute('data-cellId', elet.id);
		parent.cellPopup.text.innerHTML = (content && content()) || '';
	}

	// 隐藏弹出框
	function hide (parent){
		if (UI[parent.id].cellPopup){
			UI[parent.id].cellPopup.style.display = 'none';
			if (UI[parent.id].cellPopup.activeElet.hasOwnProperty('className')) {
				UI[parent.id].cellPopup.activeElet.className = UI[parent.id].cellPopup.activeElet.className.replace(/_active/, '');
			}
			UI[parent.id].cellPopup.activeElet = {};
			return true;
		} else {
			return false;
		}
	}

	// 移除弹出框
	function destory (parent){
		UI[parent.id].cellPopup.btnA && UI.unbind(UI[parent.id].cellPopup.btnA, 'click');
		UI[parent.id].cellPopup.btnB && UI.unbind(UI[parent.id].cellPopup.btnB, 'click');
		if (UI[parent.id].cellPopup.activeElet && UI[parent.id].cellPopup.activeElet.hasOwnProperty('className')) {
			UI[parent.id].cellPopup.activeElet.className = UI[parent.id].cellPopup.activeElet.className.replace('_active', '');
		}
		UI.unbind(parent, 'click');
		UI[parent.id].cellPopup && parent.removeChild(UI[parent.id].cellPopup);
		UI[parent.id].cellPopup = UI[parent.id].cellPopup.activeElet = null;		
	}

	// 创建弹出框DOM
	function create (parent, elet){
		parent.cellPopup =  UI._ui.makeDom(
			'div',
			{ },
			gridPopup[0].items.wraperStyle,
			null
		);
		parent.cellPopup.setAttribute('data-cellId', elet.id);
		setPosition(elet);

		// 插入内容
		parent.cellPopup.text = UI._ui.makeDom(
			'div',
			{
				innerHTML: (content && content()) || ''
			},
			gridPopup[0].items.textStyle,
			null
		);
		parent.cellPopup.appendChild(parent.cellPopup.text);
		// 生成按键
		if (buttonA) {
			//按钮A
			parent.cellPopup.btnA = UI._ui.makeDom(
				'div',
				{
					innerHTML: buttonA.text || '按键文本'
				},
				gridPopup[0].items.btnStyle,
				{
					mousedown: function(e) {
						UI.stopPropagation(e);
						this.style.background = 'url(./res/ui/btn/popupbox_btn.png) no-repeat';
					},
					mouseup: function(e) {
						UI.stopPropagation(e);
						this.style.background = 'url(./res/ui/btn/popupbox_btn.png) no-repeat';
						if (typeof buttonA.onClick === 'function') {
							buttonA.onClick.call(parent.cellPopup.btn);
						};
					}
				}
			);
			parent.cellPopup.appendChild(parent.cellPopup.btnA);
		};
		if (buttonB) {
			//按钮B
			parent.cellPopup.btnB = UI._ui.makeDom(
				'div',
				{
					innerHTML: buttonB.text || '按键文本'
				},
				gridPopup[0].items.btnStyle,
				{
					mousedown: function(e) {
						UI.stopPropagation(e);
						this.style.background = 'url(./res/ui/btn/popupbox_btn.png) no-repeat';
					},
					mouseup: function(e) {
						UI.stopPropagation(e);
						this.style.background = 'url(./res/ui/btn/popupbox_btn.png) no-repeat';
						if (typeof buttonB.onClick === 'function') {
							buttonB.onClick.call(parent.cellPopup.btn);
						};
					}
				}
			);
			// 当有按键B的时候，修改两按键的位置
			parent.cellPopup.btnA.style.left = '8px';
			parent.cellPopup.btnB.style.left = '98px';
			parent.cellPopup.appendChild(parent.cellPopup.btnB);
		};
		parent.w.dom.appendChild(parent.cellPopup);
	}
		
	// 定位在被点击的单元格右侧
	function setPosition (elet){
		var _pTop = parseInt(parent.style.top),
			_cTop = parseInt(elet.style.top),
			_wHeight = parseInt(gridPopup[0].items.wraperStyle.height)
			_val =_wHeight + _pTop;
		if (_val + _cTop <= 640) { // 当单元格的下部空间能容纳得下弹出框时
			_val = _cTop + 'px';
		} else { // 根据单元格相对容器底部的位置，设定弹出框的顶部偏移值
			var _index = ~~( (parseInt(parent.style.height) - _cTop) / (parseInt(elet.style.height) + 10)); // 自下而上算起的大致位置
			_val = 650 - _val - 12 * _index + 'px';
			_index = null;
		}
		UI[parent.id].cellPopup.style.top = _val;
		UI[parent.id].cellPopup.style.left = parseInt(elet.style.left) + parseInt(elet.style.width) + 8 + 'px';
		_pTop = _cTop = _wHeight = _val = null;
	}
}