/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-16
 * Description: 阵形窗体 统御页（！注： 技能，研究（强化）加上这里共三处，用了相同的代码）
 */
(function(UI, lib) {
	UI.formationWindow.governing = {};

	/**
	 * 初始化阵形窗体 统御页
	 */
	UI.formationWindow.governing.init = function (dom) {
		var docfrag = document.createDocumentFragment();
		dom.innerHTML = '';

		for (var i = formation.length - 1; i >= 0; i--) {
			if (formation[i].name === 'governing'){
				UI.formationWindow.w.dom.style.cssText = formation[i].cssText;
				// 设置title的宽度以居中（可以考虑将baseWindow中的width设为100%）
				UI.formationWindow.w.dom.childNodes[0].style.width = '363px';
				UI.formationWindow.w.dom.style.left = 481 + UI.offset.left + 'px',
				UI.formationWindow.w.dom.style.top = UI.offset.top + ui_config.window.top + 'px'
				for (var j = formation[i].items.length - 1; j >= 0; j--) {
					UI.formationWindow.governing[formation[i].items[j].name] = UI._ui.makeDom(
						'div',
						{
							className: formation[i].items[j].name,
							innerHTML: formation[i].items[j].innerHTML
						},
						null,
						{
							click: function (e){
								UI.stopPropagation(e);
								console.log('学习升级');
							}
						});
					docfrag.appendChild(UI.formationWindow.governing[formation[i].items[j].name]);
				};
				break;
			}
		};

		// 创建九宫格样式
		UI.skillWindow.Grid9.create(docfrag);

		UI.formationWindow.governing.fillData(data, docfrag);
		dom.appendChild(docfrag);
		docfrag = null;
	}
	/**
	 * 填充数据
	 */
	UI.formationWindow.governing.fillData = function (data, dom) {
		UI.skillWindow.Grid9.fill(data, dom);
	}
	
	var data = [{
		id: 0,
		name: '',
		level: 8,
		next: 3
	}, {
		id: 1,
		name: '',
		level: 8,
		next: 4
	}, {
		id: 2,
		name: '',
		level: 8,
		next: 5
	}, {
		id: 3,
		name: '',
		level: 3,
		next: 4
	}, {
		id: 4,
		name: '',
		level: 2,
		next: 7
	}, {
		id: 5,
		name: '',
		level: 1,
		next: 8
	}, {
		id: 6,
		name: '',
	}, {
		id: 7,
		name: '',
	}, {
		id: 8,
		name: '',
	}];
})(window.UI, smartlib);