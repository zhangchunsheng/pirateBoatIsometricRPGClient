/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-26
 * Description: 商店窗体
 */
(function(UI, lib) {
	UI.shopWindow = {};
	UI.shopWindow.w = {};

	/**
	 * 初始化商店窗体
	 */
	UI.shopWindow.initShopWindow = function (){
		UI.shopWindow.w = new lib.ui.baseWindow({
			title: '装备商店',
			id: 'shopWindow',
			closed: function(_this){
				UI.windowManager.pop(UI.shopWindow);
				UI.shopWindow.w = {};
				UI.cellPopup.call(_this, 'destory');
			}
		});

		UI.shopWindow.activeTab = '1';
		UI.shopWindow['tab'] = {};
		UI.shopWindow.items = [];

		for (var i = shopWindow[0].items.length - 1; i >= 0; i--) {
			// 创建左侧标签页
			if (shopWindow[0].items[i].name === 'tab') {
				var tabText = ['1', '2', '3', '4', '5'];	
				// 创建左侧标签
				for (var j = 0; j < 5; j++){
					UI.shopWindow['tab'][tabText[j]] = UI._ui.makeDom(
						'div',
						{
							id: tabText[j],
							className: tabText[j] === UI.shopWindow.activeTab ? 'tab_left_bg_h' : 'tab_left_bg',
							innerHTML: tabText[j]
						},
						shopWindow[0].items[i].style,
						{
							click: function (e){
								UI.stopPropagation(e);
								if (this.id === UI.shopWindow.activeTab){
									return true;
								}
								UI.cellPopup.call(this.parentNode || this.parentElement,'hide');
								UI.shopWindow['tab'][UI.shopWindow.activeTab].className = 'tab_left_bg';
								UI.shopWindow.activeTab = this.id;
								this.className = 'tab_left_bg_h';
							}
						}
					);
					UI.shopWindow['tab'][tabText[j]].style.top = 38 + 77 * j + 'px';
					UI.shopWindow.w.dom.appendChild(UI.shopWindow['tab'][tabText[j]]);
				}
				continue;
			}
			// 添加物品格子
			if (shopWindow[0].items[i].name === 'item') {
				var _tmp = null,
					_item = shopWindow[0].items[i];
				for (var j = 0; j < 10; j++) {
					_tmp = {};
					_tmp.dom = UI._ui.makeDom(
						'div',
						{
							className: 'item',
							id: 'i' + j
						},
						_item.style,
						{ }
					);
					// 商店菜单中的内层节点
					for (var k = _item.items.length - 1; k >= 0; k--) {
						_tmp[_item.items[k].name] = UI._ui.makeDom(
							'div',
							{
								className: _item.items[k].className
							},
							_item.items[k].style
						);
						_tmp.dom.appendChild(_tmp[_item.items[k].name]);
					};
					_tmp.dom.style.top = 57 + parseInt(j / 2) * 77 + 'px';
					_tmp.dom.style.left = j % 2 ? '184px' : '22px';
					UI.shopWindow.items.push(_tmp);
					UI.shopWindow.w.dom.appendChild(_tmp.dom);
				};
				_tmp = null;

				UI.cellPopup(UI.shopWindow.items, function(){
					return '测试文本测试文本测试文本测试文本';
				},
				{
					text: '装备',
					onClick: function(e){
						UI.stopPropagation(e);
						console.log('装备按钮点击');
					}
				},								
				{
					text: '卖出',
					onClick: function(e){
						UI.stopPropagation(e);
						console.log('卖出按钮点击');
					}
				});
				continue;
			}
			UI.shopWindow[shopWindow[0].items[i].name] = UI._ui.makeDom(
				'div',
				{
					className: shopWindow[0].items[i].className || ''
				},
				shopWindow[0].items[i].style
			);
			UI.shopWindow.w.dom.appendChild(UI.shopWindow[shopWindow[0].items[i].name]);
		};

		UI.windowManager.push(UI.shopWindow);

		UI.shopWindow.fillData(data);

		UI.shopWindow.w.dom.style.opacity = 0;
		UI.mainDiv.appendChild(UI.shopWindow.w.dom);
	}

	// 填充数据
	UI.shopWindow.fillData = function (data){
		for (var i = UI.shopWindow.items.length - 1; i >= 0; i--) {
			UI.shopWindow.items[i].dom.className += ' ' + data[i].class;
			UI.shopWindow.items[i].name.innerHTML = data[i].name;
			UI.shopWindow.items[i].price.innerHTML = '$:' + data[i].price;
		};
	}

	/**
	 * 显示任务弹出框
	 */
	UI.shopWindow.showShopWindow = function() {
		if (!UI.shopWindow.w.dom) {
			UI.shopWindow.initShopWindow();
		}
		// UI.show(UI.shopWindow.w.dom);
		UI.shopWindow.w.dom.style.opacity = 1;
	}
	UI.live('#recharge','click',function(){
		UI.shopWindow.showShopWindow();
	})

	var data = [{
		class: 'red',
		name: '名字',
		price: 999.99
	}, {
		class: 'blue',
		name: '神马',
		price: 999.99
	}, {
		class: 'white',
		name: '嘎的',
		price: 999.99
	}, {
		class: 'purple',
		name: '颠倒是非',
		price: 999.99
	}, {
		class: 'green',
		name: '沃尔沃额',
		price: 999.99
	}, {
		class: 'white',
		name: '阿萨德',
		price: 999.99
	}, {
		class: 'green',
		name: '瑞特饿',
		price: 999.99
	}, {
		class: 'purple',
		name: '阿道夫',
		price: 999.99
	}, {
		class: 'red',
		name: '怀仁堂',
		price: 999.99
	}, {
		class: 'green',
		name: '特认为',
		price: 999.99
	}]
})(window.UI, smartlib);