/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-16
 * Description: 阵形窗体
 */
(function(UI, lib) {
	UI.formationWindow = {};
	UI.formationWindow.w = {};

	/**
	 * 初始化阵形窗体
	 */
	UI.formationWindow.initFormationWindow = function () {
		var docfrag = document.createDocumentFragment();
	
		UI.formationWindow.w = new lib.ui.baseWindow({
			title: '阵&nbsp;形',
			closed: function(){
				UI.windowManager.pop(UI.formationWindow);
				UI.formationWindow.w = {};
			},
			id: 'formationWindow'
		});

		UI.formationWindow.tabs = {};
		UI.formationWindow.activeTab = 'formation';
		UI.formationWindow.changeableDom = document.createElement('div');
		UI.formationWindow.w.dom.appendChild(UI.formationWindow.changeableDom);

		var tabName = ['formation', 'battleformation', 'governing'],
			tagContent = ['阵形', '阵法', '统御'];
		var suffix = '';
		for (var i = formation[0].items.length - 1; i >= 0; i--) {
			//生成标签
			if (formation[0].items[i].name === 'tab_right_bg') {
				for (var j = tabName.length - 1; j >= 0; j--) {
					if(tabName[j] == UI.formationWindow.activeTab) {
						suffix = '_h';
					}
					UI.formationWindow.tabs[tabName[j]] = UI._ui.makeDom(
						'div',
						{
							className: formation[0].items[i].name + suffix,
							id: tabName[j]
						},
						formation[0].items[i].style,
						{
							click: function(e){
								UI.stopPropagation(e);
								if (this.id === UI.formationWindow.activeTab) {
									return true;
								};
								UI.formationWindow.tabs[UI.formationWindow.activeTab].className = 'tab_right_bg';
								// UI.formationWindow[UI.formationWindow.activeTab].close();
								UI.formationWindow.activeTab = this.id;
								this.className = 'tab_right_bg_h';
								UI.formationWindow[this.id].init(UI.formationWindow.changeableDom);
							}
						}
					);
					suffix = '';
					UI.formationWindow.tabs[tabName[j]].innerHTML = '<span class="tab_text">' + tagContent[j] + '</span>';
					UI.formationWindow.tabs[tabName[j]].style.top = 37 + 77 * j + 'px';
					docfrag.appendChild(UI.formationWindow.tabs[tabName[j]]);
				};
				break;
			};
		};

		UI.formationWindow.w.dom.appendChild(docfrag);
		//初始化活动标签页
		UI.formationWindow[UI.formationWindow.activeTab].init(UI.formationWindow.changeableDom);
		
		docfrag = null;

		UI.formationWindow.w.dom.style.opacity = 0;
		UI.windowManager.push(UI.formationWindow, 310);

		UI.mainDiv.appendChild(UI.formationWindow.w.dom);
	}

	/**
	 * 显示阵形窗体
	 */
	UI.formationWindow.showFormationWindow = function() {
		if (!UI.formationWindow.w.dom) {
			UI.formationWindow.initFormationWindow();
		}
		UI.show(UI.formationWindow.w.dom);
		UI.formationWindow.w.dom.style.opacity = 1;
	}

	/**
	 * 綁定事件
	 */
	UI.formationWindow.bindEvent = function() {
	}
})(window.UI, smartlib);