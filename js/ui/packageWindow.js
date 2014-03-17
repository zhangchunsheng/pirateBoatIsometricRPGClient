/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-02-28
 * Description: 物品弹出框
 */
(function(UI, lib) {
	UI.packageWindow = {};
	UI.packageWindow.w = {};

	/**
	 * 初始化物品弹出框
	 */
	UI.packageWindow.initPackageWindow = function () {
		UI.packageWindow.w = new lib.ui.baseWindow({
			title: '物&nbsp;品',
			id: 'packageWindow',
			type: "packageWindow",
			closed: function(_this){
				UI.windowManager.pop(UI.packageWindow);
				UI.packageWindow.w = {};
				UI.cellPopup.call(_this, 'destory');
			}
		});

		UI.packageWindow.items = [];
		UI.packageWindow.tabs = {};
		UI.packageWindow.activeTab = 'equipment';

		var tabName = ['equipment', 'consume', 'primordialSprite', 'spritePearl', 'material'],
			tagContent = ['装备', '消耗', '元神', '灵珠', '材料'];
		var suffix = "";
		for (var i = packageWindow[0].items.length - 1; i >= 0; i--) {
			//生成标签
			if (packageWindow[0].items[i].name === 'tab_right_bg') {
				for (var j = tabName.length - 1; j >= 0; j--) {
					if(tabName[j] == UI.packageWindow.activeTab) {
						suffix = "_h";
					}
					UI.packageWindow.tabs[tabName[j]] = UI._ui.makeDom(
						'div',
						{
							className: packageWindow[0].items[i].name + suffix,
							id: tabName[j]
						},
						packageWindow[0].items[i].style,
						{
							click: function(e){
								UI.stopPropagation(e);
								if (this.id === UI.packageWindow.activeTab) {
									return true;
								};
								UI.packageWindow.tabs[UI.packageWindow.activeTab].className = 'tab_right_bg';
								UI.packageWindow.activeTab = this.id;
								this.className = 'tab_right_bg_h';
								UI.cellPopup.call(this.parentNode || this.parentElement,'hide');
								UI.packageWindow.fillData(this.id);
							}
						}
					);
					suffix = "";
					UI.packageWindow.tabs[tabName[j]].innerHTML = '<span class="tab_text">' + tagContent[j] + '</span>';
					UI.packageWindow.tabs[tabName[j]].style.top = 37 + 77 * j + 'px';
					UI.packageWindow.w.dom.appendChild(UI.packageWindow.tabs[tabName[j]]);
				};
			};
			//生成物品栏
			if (packageWindow[0].items[i].name === 'cell') {
				for (var j = 0; j < 20; j++) {
					UI.packageWindow.items[j] = {};
					UI.packageWindow.items[j].dom = UI._ui.makeDom(
						'div',
						{
							className: 'cell',
							id: 'c' + j
						},
						packageWindow[0].items[i].style
					);
					UI.packageWindow.items[j].dom.style.top = 67 + parseInt(j / 4) * 78 + 'px';
					UI.packageWindow.items[j].dom.style.left = 34 + parseInt(j % 4) * 77 + 'px';
					for (var k = packageWindow[0].items[i].items.length - 1; k >= 0; k--) {
						UI.packageWindow.items[j].dom.appendChild(UI._ui.makeDom(
							'div',
							{
								className: packageWindow[0].items[i].items[k].className
							},
							packageWindow[0].items[i].items[k].style
						));
					};

					UI.packageWindow.w.dom.appendChild(UI.packageWindow.items[j].dom);
				};

			};	
		};

		UI.windowManager.push(UI.packageWindow);
		UI.cellPopup(
			UI.packageWindow.items, 
			function(){
				return '测试文本测试文本测试文本测试文本';
			},
			{
				text: '购买',
				onClick: function(e){
					UI.stopPropagation(e);
					console.log('购买按钮点击');
				}
			},
			null
		);

		UI.packageWindow.w.dom.style.opacity = 0;
		UI.mainDiv.appendChild(UI.packageWindow.w.dom);		
	}

	/**
	 * 填充物品栏
	 */
	UI.packageWindow.fillData = function (tabName) {

	}

	/**
	 * 显示物品弹出框
	 */
	UI.packageWindow.showPackageWindow = function() {
		if (!UI.packageWindow.w.dom) {
			UI.packageWindow.initPackageWindow();
		}
		UI.display(UI.packageWindow.w.dom, true);
		UI.packageWindow.w.dom.style.opacity = 1;
	}

	/**
	 * 綁定事件
	 */
	UI.packageWindow.bindEvent = function() {
	}
})(window.UI, smartlib);