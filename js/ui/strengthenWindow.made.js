/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-12
 * Description: 强化窗体 组装页
 */
(function(UI, lib) {
	UI.strengthenWindow.made = {};
	UI.strengthenWindow.made.items = [];
	/**
	 * 初始化组装页
	 */
	UI.strengthenWindow.made.init = function (dom, styles) {
		dom.innerHTML = '';
		var docfrag = document.createDocumentFragment();

		//获得创建组装页所需元素style
		var madeStyle = {};
		for (var i = styles.length - 1; i >= 0; i--) {
			if (styles[i].name === 'made-holder-branch') {
				madeStyle['branch'] = styles[i];
				continue;
			} else if (styles[i].name === 'made-holder') {
				madeStyle['alone'] = styles[i];
				continue;
			}
		};

		UI.strengthenWindow.made.fillData(data, docfrag, madeStyle);
		madeStyle = null;

		dom.appendChild(docfrag);	
	}

	/**
	 * 填充内容
	 */
	UI.strengthenWindow.made.fillData = function(data, dom, styles) {
		var _items,
			topDistance = 58;
		for (var i = 0 ; i < data.length ; i++) {
			_items = data[i].branch ? styles['branch'] : styles['alone'];
			// 创建单项包裹元素
			UI.strengthenWindow.made.items[i] = UI._ui.makeDom(
				'div',
				{
					
				},
				_items.style,
				null
			);
			UI.strengthenWindow.made.items[i].style.top = topDistance + 'px';
			topDistance += parseInt(UI.strengthenWindow.made.items[i].style.height) + 15;

			_items = _items.items;
			// 创建包裹项的内部节点
			for (var j = _items.length - 1; j >= 0; j--) {
				UI.strengthenWindow.made.items[i][_items[j].name] = UI._ui.makeDom(
					'div',
					{

					},
					_items[j].style,
					null
				);
				UI.strengthenWindow.made.items[i].appendChild(UI.strengthenWindow.made.items[i][_items[j].name]);
			};
			if (typeof data[i].level === 'number' && data[i].level < 10) {
				data[i].level = '0' + data[i].level;
			};

			var _next = data[i].next;
			// 如果是分叉型
			if (_next.hasOwnProperty('length')) {
				if (_next[1]) {
					UI.strengthenWindow.made.items[i]['made-progress-filler'].style.top = '42px';
					UI.strengthenWindow.made.items[i]['made-next-point'].style.top = '53px';
					_next = _next[1];
				} else {
					_next = _next[0];
				}
			};

			UI.strengthenWindow.made.items[i]['made-point'].innerHTML = data[i].level;
			UI.strengthenWindow.made.items[i]['made-description'].innerHTML = data[i].description;

			UI.strengthenWindow.made.items[i]['made-progress-filler'].style.width = (_next - 1) * 45 + 'px';
			UI.strengthenWindow.made.items[i]['made-next-point'].style.left = (_next - 1) * 46 + 103 + 'px';

			dom.appendChild(UI.strengthenWindow.made.items[i]);
		}
		_items = topDistance = null;
	}

	/**
	 * 移除窗体内容
	 */
	UI.strengthenWindow.made.close = function() {
	}

	/**
	 * 綁定事件
	 */
	UI.strengthenWindow.made.bindEvent = function() {
	}

	// 命名待规范
	var data = [{
		id: 0,
		name: "",
		branch: false,
		level: 8,
		next: 3,
		description: '下一等级：物理攻击 <span style="color:#36ff00">+5</span></div>'
	}, {
		id: 31,
		name: "",
		branch: true,
		level: 12,
		next: [0, 3],
		description: '下一等级：物理攻击 <span style="color:#36ff00">+4</span></div>'
	},  {
		id: 34,
		name: "",
		branch: false,
		level: 82,
		next: 1,
		description: '下一等级：物理攻击 <span style="color:#36ff00">+6</span></div>'
	}, {
		id: 88,
		name: "",
		branch: false,
		level: 5,
		next: 2,
		description: '下一等级：物理攻击 <span style="color:#36ff00">+5</span></div>'
	}];
})(window.UI, smartlib);