/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-12
 * Description: 强化窗体 研究页
 */
(function(UI, lib) {
	UI.strengthenWindow.research = {};
	/**
	 * 初始化研究页
	 */
	UI.strengthenWindow.research.init = function (dom, styles) {
		dom.innerHTML = '';
		var docfrag = document.createDocumentFragment();

		for (var i = styles.length - 1; i >= 0; i--) {
			UI.strengthenWindow.research[styles[i].name] = UI._ui.makeDom(
				'div',
				{
					className: styles[i].name,
					innerHTML: styles[i].innerHTML
				},
				null,
				{
					click: function (e){
						UI.stopPropagation(e);
						console.log('学习升级');
					}
				});
				docfrag.appendChild(UI.strengthenWindow.research[styles[i].name]);
		};

		// 创建九宫格样式
		UI.skillWindow.Grid9.create(docfrag);

		UI.strengthenWindow.research.fillData(data, docfrag);
		dom.appendChild(docfrag);
	}

	/**
	 * 填充数据
	 */
	UI.strengthenWindow.research.fillData = function (data, dom) {
		UI.skillWindow.Grid9.fill(data, dom);
	}

	/**
	 * 移除窗体内容
	 */
	UI.strengthenWindow.research.close = function() {
	}

	/**
	 * 綁定事件
	 */
	UI.strengthenWindow.research.bindEvent = function() {
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