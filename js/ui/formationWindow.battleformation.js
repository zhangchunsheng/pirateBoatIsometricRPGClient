/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-16
 * Description: 阵形窗体 阵法页
 */
(function(UI, lib) {
	UI.formationWindow.battleformation = {};

	/**
	 * 初始化阵形窗体 阵法页
	 */
	UI.formationWindow.battleformation.init = function (dom) {
		dom.innerHTML = '';
		var docfrag = document.createDocumentFragment();

		// 暂存config中的style对象，同时设置阵形窗体style
		var styles;
		for (var i = formation.length - 1; i >= 0; i--) {
			if (formation[i].name === 'battleformation'){
				styles = formation[i].items;
				UI.formationWindow.w.dom.style.cssText = formation[i].cssText;
				// 设置title的宽度以居中（可以考虑将baseWindow中的width设为100%）
				UI.formationWindow.w.dom.childNodes[0].style.width = '363px';
				UI.formationWindow.w.dom.style.left = 481 + UI.offset.left + 'px',
				UI.formationWindow.w.dom.style.top = UI.offset.top + ui_config.window.top + 'px'
				break;
			}
		};

		for (var i = styles.length - 1; i >= 0; i--) {
			UI.formationWindow.battleformation[styles[i].name] = UI._ui.makeDom(
				styles[i].tag || 'div',
				{
					id: styles[i].id || '',
					src: styles[i].src || '',
					innerHTML: styles[i].innerHTML || ''
				},
				styles[i].style,
				null
			);
			docfrag.appendChild(UI.formationWindow.battleformation[styles[i].name]);
		};

		UI.formationWindow.battleformation.fillData(data[0]);

		// 增加滚动效果
		setTimeout(function () {
			UI.formationWindow.battleformation.scroll = new iScroll('battleformation-wrap',{scrollbarClass: 'scrollbar'});
		}, 100);

		dom.appendChild(docfrag);
		styles = docfrag = null;
	}


	/**
	 * 填充数据
	 */
	UI.formationWindow.battleformation.fillData = function (data){
		UI.formationWindow.battleformation['wrap'].childNodes[0].innerHTML = data;
	}

	data = [
		'测试的文字够多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗'
		+'多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗多吗'
	]
})(window.UI, smartlib);