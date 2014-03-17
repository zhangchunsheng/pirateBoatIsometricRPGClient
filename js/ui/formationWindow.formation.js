/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-16
 * Description: 阵形窗体 阵形页
 */
(function(UI, lib) {
	UI.formationWindow.formation = {};

	/**
	 * 初始化阵形窗体 阵形页
	 */
	UI.formationWindow.formation.init = function (dom){
		dom.innerHTML = '';
		var docfrag = document.createDocumentFragment(),
			items,
			blueCircle,
			redCircle;

		// 获得创建阵形页所需的style对象，同时设置阵形窗体style
		for (var i = formation.length - 1; i >= 0; i--) {
			if (formation[i].name === 'formation'){
				items = formation[i].items;
				UI.formationWindow.w.dom.style.cssText = formation[i].cssText;
				// 设置title的宽度以居中（可以考虑将baseWindow中的width设为100%）
				UI.formationWindow.w.dom.childNodes[0].style.width = '534px';
				UI.formationWindow.w.dom.style.left = 310 + UI.offset.left + 'px',
				UI.formationWindow.w.dom.style.top = UI.offset.top + ui_config.window.top + 'px'
				break;
			}			
		}
		for (var i = items.length - 1; i >= 0; i--) {
			if (items[i].name === 'blueCircle') {
				blueCircle = items[i];
				continue;
			};
			if (items[i].name === 'redCircle') {
				redCircle = items[i];
				continue;
			};
			// 创建右下角人物框
			if (items[i].name === 'cr') {
				for (var j = 0, _name; j < 3; j++){
					_name = items[i].name + j;
					UI.formationWindow.formation[_name] = UI._ui.makeDom(
						'div',
						{
							className: items[i].className
						},
						items[i].style
					);
					UI.formationWindow.formation[_name].style.cssText += items[i].position[j];
					docfrag.appendChild(UI.formationWindow.formation[_name]);
				}
				continue;
			};
			if (items[i].name === 'frameS') {
				UI.formationWindow.formation.initFrameS(docfrag, items[i]);
				continue;
			};
			UI.formationWindow.formation[items[i].name] = UI._ui.makeDom(
				'div',
				{
					className: items[i].className || ''
				},
				items[i].style
			);
			docfrag.appendChild(UI.formationWindow.formation[items[i].name]);
		};	

		UI.formationWindow.formation.fillData();
		UI.formationWindow.formation['description'].style.background = 'url(./res/ui/font/' + UI.lang + '/enemyfleet.png) no-repeat';

		dom.appendChild(docfrag);
		docfrag = items = null;

	}

	// 创建左侧小窗体
	UI.formationWindow.formation.initFrameS = function (dom, frame){
		UI.formationWindow.formation['frameS'] = document.createElement('div');
		var tmp = UI.formationWindow.formation['frameS'];
		tmp.activeTab = 'player';

		UI.animate(
			tmp,
			frame.style,
			0
		);
		// 创建左侧标签
		var tabName = ['player', 'defense', 'export', 'supply'],
			tabText = ['角色', '防御', '输出', '支援'];
		for (var i = 0; i < 4; i++){
			tmp[tabName[i]] = UI._ui.makeDom(
				'div',
				{
					id: tabName[i],
					className: tabName[i] === tmp.activeTab ? 'tab_left_bg_h' : 'tab_left_bg',
					innerHTML: '<span class="tab_text">' + tabText[i] + '</span>'
				},
				{
					position: 'absolute',
					height: '77px',
					width: '70px',
					left: '-66px',
					top: 38 + 77 * i + 'px'
				},
				{
					click: function (e){
						UI.stopPropagation(e);
						if (this.id === UI.formationWindow.formation['frameS'].activeTab){
							return true;
						}
						UI.formationWindow.formation['frameS'][UI.formationWindow.formation['frameS'].activeTab].className = 'tab_left_bg';
						UI.formationWindow.formation['frameS'].activeTab = this.id;
						this.className = 'tab_left_bg_h';
						fillData(this.id);
						UI.formationWindow.formation['frameS'].scroll.scrollTo(0,0,0);
					}
				}
			);
			tmp.appendChild(tmp[tabName[i]]);
		}
		// 创建包裹单元格
		tmp['wraper'] = UI._ui.makeDom(
			'div',
			{
				id: 'wraper'
			},
			frame.items.wraper,
			null
		);
		tmp['wraper'].innerHTML = '<div style="width:164px;height:590px;"></div>';
		tmp.appendChild(tmp['wraper']);

		fillData(tmp.activeTab, tmp['wraper'].childNodes[0]);
		dom.appendChild(tmp);
		tmp = null;

		// 增加滚动效果
		setTimeout(function () {
			UI.formationWindow.formation['frameS'].scroll = new iScroll('wraper',{scrollbarClass: 'scrollbar'});
		}, 100);

		// 填充左侧方格数据
		function fillData (tabName, data){
			UI.formationWindow.formation['frameS']['wraper'].childNodes[0].innerHTML = '';
			// 要生成的方格的总数
			var len = tabName === 'player' ? 4 : 16;
			for (var i = 0; i < len; i++){
				UI.formationWindow.formation['frameS']['wraper'].childNodes[0].appendChild(UI._ui.makeDom(
					'div',
					{
						className: 'cell'
					},
					{
						top: parseInt(i / 2) * 75 + 'px',
						left: i % 2 ? '85px' : '10px',
						height: '60px',
						width: '60px'
					},
					{
						click: function (e){
							UI.stopPropagation(e);
						}
					}
				));
			}
		}
	}

	// 填充数据
	UI.formationWindow.formation.fillData = function (){		

		UI.formationWindow.formation['AP'].innerHTML = 12345;
		UI.formationWindow.formation['HP'].innerHTML = 12345;

		UI.formationWindow.formation['AP-arrow-up'].className += ' g';
		UI.formationWindow.formation['HP-arrow-down'].className += ' r';

		UI.formationWindow.formation['cr0'].innerHTML = '<div style="background-image:url(./res/ui/ci/1/1_photo.png)"></div>';
		UI.formationWindow.formation['cr0'].className += ' cell-cr-active';
		UI.formationWindow.formation['cr1'].innerHTML = '<div style="background-image:url(./res/ui/ci/0/0_photo.png)"></div>';
		UI.formationWindow.formation['cr1'].className += ' cell-cr-active';
	}
})(window.UI, smartlib);