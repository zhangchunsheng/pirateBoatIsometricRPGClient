/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-05
 * Description: 技能弹出框
 */
(function(UI, lib) {
	UI.skillWindow = {};
	UI.skillWindow.w = {};

	// 保存九宫格元素的创建和填充
	UI.skillWindow.Grid9 = {};

	/**
	 * 初始化强化弹出框
	 * @param  {Object} data 技能数据对象
	 */
	UI.skillWindow.initSkillWindow = function (data) {
		var docfrag = document.createDocumentFragment();

		UI.skillWindow.w = new lib.ui.baseWindow({
			title: '技&nbsp;能',
			closed: function(_this){
				UI.windowManager.pop(UI.skillWindow);
				UI.skillWindow.w = {};
			},
			id: 'skillWindow'
		});

		//保存通路元素
		UI.skillWindow.changeableDom = document.createElement('div');
		UI.skillWindow.w.dom.appendChild(UI.skillWindow.changeableDom);
		UI.skillWindow.tabs = {};
		UI.skillWindow.activeTab = 'energy';//energy - 精力

		//创建不做改变的子元素
		for (var i = skillWindow[0].items.length - 1, _tmp; i >= 0; i--) {
			if (skillWindow[0].items[i].name === 'tab_right_bg') {
				//创建右侧标签栏
				var tabName = ['energy', 'combatPower', 'momentum'],
					tagContent = ['精力', '战力', '气势'];
				var suffix = '';
				for (var j = tabName.length - 1; j >= 0; j--) {
					if(tabName[j] == UI.skillWindow.activeTab) {
						suffix = '_h';
					}
					UI.skillWindow.tabs[tabName[j]] = UI._ui.makeDom(
						'div',
						{
							className: skillWindow[0].items[i].name + suffix,
							id: tabName[j]
						},
						skillWindow[0].items[i].style,
						{
							click: function(e){
								UI.stopPropagation(e);
								if (this.id === UI.skillWindow.activeTab) {
									return true;
								};
								UI.skillWindow.tabs[UI.skillWindow.activeTab].className = 'tab_right_bg';
								UI.skillWindow.activeTab = this.id;
								this.className = 'tab_right_bg_h';
								UI.skillWindow.fillData(this.id, UI.skillWindow.changeableDom);
							}
						}
					);
					suffix = '';
					UI.skillWindow.tabs[tabName[j]].innerHTML = '<span class="tab_text">' + tagContent[j] + '</span>';
					UI.skillWindow.tabs[tabName[j]].style.top = 37 + 77 * j + 'px';
					docfrag.appendChild(UI.skillWindow.tabs[tabName[j]]);
				};
				continue;
			};
			_tmp = UI._ui.makeDom(
				'div',
				{
					className: skillWindow[0].items[i].name,
					innerHTML: skillWindow[0].items[i].innerHTML || ''
				},
				skillWindow[0].items[i].style,
				null
			);
			docfrag.appendChild(_tmp);
			UI.skillWindow[_tmp.className] = _tmp;
			_tmp = null;
		};

		// 创建九宫格样式
		UI.skillWindow.Grid9.create(docfrag);

		UI.skillWindow.w.dom.appendChild(docfrag);
		docfrag = null;

		UI.skillWindow.fillData('energy', UI.skillWindow.changeableDom);
		 
		UI.windowManager.push(UI.skillWindow);

		UI.skillWindow.w.dom.style.opacity = 0;
		UI.mainDiv.appendChild(UI.skillWindow.w.dom);		
	}

	//填充当前tab下的数据
	UI.skillWindow.fillData = function (tabName, dom) {
		UI.skillWindow.Grid9.fill(data[tabName], dom, 'skillId');
	}

	/**
	 * 创建九宫格样式
	 */
	UI.skillWindow.Grid9.create = function (docfrag) {
		this.cells = [];

		//记录联通数据样式
		this.pipStyle = {};
		this.pipStyle.pipV = {};
		this.pipStyle.pipH = {};
		this.pipStyle.pos = {};

		//创建不做改变的子元素
		for (var i = skillWindow[0].grid9Items.length - 1, _tmp; i >= 0; i--) {
			if (skillWindow[0].grid9Items[i].name === 'position') {
				this.pipStyle.pos = skillWindow[0].grid9Items[i];
				continue;
			} else if (skillWindow[0].grid9Items[i].name === 'pipeline-vertical') {
				this.pipStyle.pipV = skillWindow[0].grid9Items[i];
				continue;
			} else if (skillWindow[0].grid9Items[i].name === 'pipeline-horizontal') {
				this.pipStyle.pipH = skillWindow[0].grid9Items[i];
				continue;
			} else if (skillWindow[0].grid9Items[i].name === 'cell-skill') {
				//创建技能格子
				for (var j = 0; j < 9; j++) {
					this.cells[j] = UI._ui.makeDom(
						'div',
						{
							className: 'cell-skill'
						},
						skillWindow[0].grid9Items[i].style,
						null
					);
					this.cells[j].style.top = 134 + parseInt(j / 3) * 95 + 'px';
					this.cells[j].style.left = 54 + parseInt(j % 3) * 95 + 'px';
					docfrag.appendChild(this.cells[j]);
				};
				continue;
			}
			_tmp = UI._ui.makeDom(
				skillWindow[0].grid9Items[i].tag || 'div',
				{
					className: skillWindow[0].grid9Items[i].name,
					innerHTML: skillWindow[0].grid9Items[i].innerHTML || '',
					src : skillWindow[0].grid9Items[i].src || '',
				},
				skillWindow[0].grid9Items[i].style,
				null
			);
			docfrag.appendChild(_tmp);
			_tmp = null;
		};
	}


	/**
	 * 填充九宫格数据
	 */
	UI.skillWindow.Grid9.fill = function (data, dom, id) {
		//清空子元素
		dom.innerHTML = '';

		// 填充元素在游戏中的参考id
		var _id = id || 'id';

		var _pip = {};
		for (var i = this.cells.length - 1; i >= 0; i--) {
			//设置技能图片
			this.cells[i].style.backgroundImage = 'url(./res/ui/icon/' + data[i][_id] + '.png)';
			//设置等级
			if (data[i].level > 0) {
				if(typeof data[i].level == "number" && data[i].level < 10) {
					data[i].level = "0" + data[i].level
				}
				var _rt = document.createElement('div');
				_rt.innerHTML = data[i].level;
				_rt.className = 'rt';
				this.cells[i].innerHTML = '';
				this.cells[i].appendChild(_rt);
				_rt = null;
			};
			if(data[i].next) {
				if (data[i].next - data[i][_id] == 1) {
					_pip = UI._ui.makeDom(
						'div',
						{
							innerHTML: this.pipStyle.pipH.innerHTML,
						},
						this.pipStyle.pipH.style,
						null
					);					
				} else {
					_pip = UI._ui.makeDom(
						'div',
						{
							innerHTML: this.pipStyle.pipV.innerHTML,
						},
						this.pipStyle.pipV.style,
						null
					);
				}
				_pip.style.cssText += this.pipStyle.pos[i + '-'+ (data[i].next - 1001)];
				if (data[i].level > 0 && data[data[i].next - 1001].level > 0) {
					//填充进度条
					fillUp(_pip);							
				};
				dom.appendChild(_pip);
			};
		}		

		//填充
		function fillUp(pipeline) {
			if (pipeline.childNodes[0].style.width === '100%') {
				pipeline.childNodes[0].style.height = '39px';
			} else {
				pipeline.childNodes[0].style.width = '39px';
			}
		}
	}

	/**
	 * 显示任务弹出框
	 */
	UI.skillWindow.showSkillWindow = function() {
		if (!UI.skillWindow.w.dom) {
			UI.skillWindow.initSkillWindow();				
		}
		UI.display(UI.skillWindow.w.dom, true);
		UI.skillWindow.w.dom.style.opacity = 1;
	}

	/**
	 * 綁定事件
	 */
	UI.skillWindow.bindEvent = function() {
		
	}

	// 此处需注意next值，代指九宫格中位置
	var data = {
		'energy': [{
			skillId: 1001,
			name: '',
			level: 8,
			next: 1004
		}, {
			skillId: 1002,
			name: '',
			level: 8,
			next: 1005
		}, {
			skillId: 1003,
			name: '',
			level: 8,
			next: 1006
		}, {
			skillId: 1004,
			name: '',
			level: 3,
			next: 1005
		}, {
			skillId: 1005,
			name: '',
			level: 2,
			next: 1008
		}, {
			skillId: 1006,
			name: '',
			level: 1,
			next: 1009
		}, {
			skillId: 1007,
			name: '',
			level: 10
		}, {
			skillId: 1008,
			name: '',
			level: 10
		}, {
			skillId: 1009,
			name: '',
			level: 10
		}],
		'combatPower': [{
			skillId: 1001,
			name: '',
			level: '05',
			next: 1004
		}, {
			skillId: 1002,
			name: '',
			level: '08',
			next: 1005
		}, {
			skillId: 1003,
			name: '',
			level: '11',
			next: 1006
		}, {
			skillId: 1004,
			name: '',
			level: '15',
			next: 1007
		}, {
			skillId: 1005,
			name: '',
			level: '65',
			next: 1008
		}, {
			skillId: 1006,
			name: '',
			level: 10,
			next: 1009
		}, {
			skillId: 1007,
			name: '',
			level: 10
		}, {
			skillId: 1008,
			name: '',
			level: 10
		}, {
			skillId: 1009,
			name: '',
			level: 10
		}],
		'momentum': [{
			skillId: 1001,
			name: '',
			level: '99',
			next: 1004
		}, {
			skillId: 1002,
			name: '',
			level: '9',
			next: 1005
		}, {
			skillId: 1003,
			name: '',
			level: '07',
			next: 1006
		}, {
			skillId: 1004,
			name: '',
			level: '02',
			next: 1007
		}, {
			skillId: 1005,
			name: '',
			level: '06',
			next: 1008
		}, {
			skillId: 1006,
			name: '',
			level: 10,
			next: 1009
		}, {
			skillId: 1007,
			name: '',
			level: 10,
			next: 1008
		}, {
			skillId: 1008,
			name: '',
			level: '01'
		}, {
			skillId: 1009,
			name: '',
			level: 10
		}]
	}
})(window.UI, smartlib);