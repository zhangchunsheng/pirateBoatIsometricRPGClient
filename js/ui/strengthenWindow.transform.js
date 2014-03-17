/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-12
 * Description: 强化窗体 改造页
 */
(function(UI, lib) {
	UI.strengthenWindow.transform = {};
	/**
	 * 初始化改造页
	 */
	UI.strengthenWindow.transform.init = function (dom, styles) {
		dom.innerHTML = '';

		var docfrag = document.createDocumentFragment();
		for (var i = styles.length - 1; i >= 0; i--) {
			UI.strengthenWindow.transform[styles[i].name] = UI._ui.makeDom(
				'div',
				{
					className: styles[i].className,
					innerHTML: styles[i].innerHTML || ''
				},
				styles[i].style,
				null
			);
			docfrag.appendChild(UI.strengthenWindow.transform[styles[i].name]);
		};
		UI.strengthenWindow.transform.fillData(data);
		dom.appendChild(docfrag);		
	}

	/**
	 * 填充数据
	 */
	UI.strengthenWindow.transform.fillData = function (data) {
		UI.strengthenWindow.transform['transform-bg'].src = './res/ui/layout/c/st_tfm_boat_bg.png';
		for (var o in data) {
			UI.strengthenWindow.transform[o].style.backgroundImage = 'url(' + data[o].img + ')';
		}
	}

	/**
	 * 移除窗体内容
	 */
	UI.strengthenWindow.transform.close = function() {
	}

	var data = {
		pic0: {
			img: './res/ui/icon/Ability_Racial_Avatar.png'
		},
		pic1: {
			img: './res/ui/icon/Ability_Racial_Avatar.png'
		},
		pic2: {
			img: './res/ui/icon/Ability_Racial_Avatar.png'
		},
		pic3: {
			img: './res/ui/icon/Ability_Racial_Avatar.png'
		},
		pic4: {
			img: './res/ui/icon/Ability_Racial_Avatar.png'
		}
	}

})(window.UI, smartlib);