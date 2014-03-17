/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-07
 * Description: 强化窗体
 */
(function(UI, lib) {
	UI.strengthenWindow = {};
	UI.strengthenWindow.w = {};
	/**
	 * 初始化强化窗体
	 */
	UI.strengthenWindow.initStrengthenWindow = function (tabName) {
		var docfrag = document.createDocumentFragment();

		UI.strengthenWindow.w = new lib.ui.baseWindow({
			id: 'strengthenWindow',
			type: "strengthenWindow",
			title: '强&nbsp;化',
			closed: function(_this){
				UI.windowManager.pop(UI.strengthenWindow);
				UI.strengthenWindow.w = {};
			}
		});

		UI.strengthenWindow.tabs = {};
		UI.strengthenWindow.activeTab = tabName || 'recast';
		UI.strengthenWindow.changeableDom = document.createElement('div');

		//记录下当前窗体生成所需style的对象，防止标签页生成时对该数组遍历
		UI.strengthenWindow.styles = {};
		for (var i = strengthenWindow.length - 1; i >= 0; i--) {
			UI.strengthenWindow.styles[strengthenWindow[i].name] = strengthenWindow[i].items;
		};

		for (var i = UI.strengthenWindow.styles['strengthenWindow'].length - 1, _tmp; i >= 0; i--) {
			if (strengthenWindow[0].items[i].name != 'tab_right_bg') {
				continue;
			};
			//创建右侧标签栏
			var tabName = ['recast', 'made', 'transform', 'research'],
				tagContent = ['重铸','组装', '改造', '研究'];
			var suffix = '';
			for (var j = tabName.length - 1; j >= 0; j--) {
				if(tabName[j] == UI.strengthenWindow.activeTab) {
					suffix = '_h';
				}
				UI.strengthenWindow.tabs[tabName[j]] = UI._ui.makeDom(
					'div',
					{
						className: strengthenWindow[0].items[i].name + suffix,
						id: tabName[j]
					},
					strengthenWindow[0].items[i].style,
					{
						click: function(e){
							UI.stopPropagation(e);
							if (this.id === UI.strengthenWindow.activeTab) {
								return true;
							};
							UI.strengthenWindow.tabs[UI.strengthenWindow.activeTab].className = 'tab_right_bg';
							UI.strengthenWindow[UI.strengthenWindow.activeTab].close();
							UI.strengthenWindow.activeTab = this.id;
							this.className = 'tab_right_bg_h';
							UI.strengthenWindow[this.id].init(UI.strengthenWindow.changeableDom, UI.strengthenWindow.styles[this.id]);
						}
					}
				);
				suffix = '';
				UI.strengthenWindow.tabs[tabName[j]].innerHTML = '<span class="tab_text">' + tagContent[j] + '</span>';
				UI.strengthenWindow.tabs[tabName[j]].style.top = 37 + 77 * j + 'px';
				docfrag.appendChild(UI.strengthenWindow.tabs[tabName[j]]);
			};
		}

		UI.strengthenWindow.w.dom.appendChild(docfrag);
		docfrag = null;
		//初始化活动标签页
		UI.strengthenWindow[UI.strengthenWindow.activeTab].init(UI.strengthenWindow.changeableDom, UI.strengthenWindow.styles[UI.strengthenWindow.activeTab]);
		UI.strengthenWindow.w.dom.appendChild(UI.strengthenWindow.changeableDom);

		UI.windowManager.push(UI.strengthenWindow);

		UI.strengthenWindow.w.dom.style.opacity = 0;
		UI.mainDiv.appendChild(UI.strengthenWindow.w.dom);
	}

	/**
	 * 显示任务弹出框
	 */
	UI.strengthenWindow.showStrengthenWindow = function(tabName) {
		if (!UI.strengthenWindow.w.dom) {
			UI.strengthenWindow.initStrengthenWindow(tabName);
		}
		if (tabName) {
			UI.fire(UI.strengthenWindow.tabs[tabName], 'click');
		};
		UI.show(UI.strengthenWindow.w.dom);
		UI.strengthenWindow.w.dom.style.opacity = 1;
	}
	/**
	 * 綁定事件
	 */
	UI.strengthenWindow.bindEvent = function() {
	}
})(window.UI, smartlib);