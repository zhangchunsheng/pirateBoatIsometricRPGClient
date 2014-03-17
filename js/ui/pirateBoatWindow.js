/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-07
 * Description: 战舰窗口
 */
(function(UI, lib) {
	UI.pirateBoatWindow = {};
	UI.pirateBoatWindow.w = {};
	/**
	 * 初始化战舰窗口
	 * @param  {Object} data 数据对象
	 */
	UI.pirateBoatWindow.initPirateBoatWindow = function (data) {
		var docfrag = document.createDocumentFragment();

		UI.pirateBoatWindow.w = new lib.ui.baseWindow({
			id: 'pirateBoatWindow',
			type: "pirateBoatWindow",
			title: '战&nbsp;舰',
			closed: function(_this){
				UI.windowManager.pop(UI.pirateBoatWindow);
				UI.pirateBoatWindow.w = {};
				//如果强化窗体打开着，则关闭
				if (UI.strengthenWindow.w.dom) {
					for (var i = 0, len = UI.strengthenWindow.w.dom.childNodes.length; i < len; i++) {
						if (UI.strengthenWindow.w.dom.childNodes[i].id === 'closeBtn') {
							UI.fire(UI.strengthenWindow.w.dom.childNodes[i], 'click');
							break;
						}
					};
				};
			}
		});

		UI.pirateBoatWindow.leftTabs = [];
		UI.pirateBoatWindow.activeTab = 0;

		for (var i = pirateBoatWindow[0].items.length - 1; i >= 0; i--) {
			//创建左侧标签
			if (pirateBoatWindow[0].items[i].name === 'pirate-boat-tab') {
				for (var j = 0, len = data.length; j < len; j++) {
					UI.pirateBoatWindow.leftTabs.push(UI._ui.makeDom(
						'div',
						{
						},
						pirateBoatWindow[0].items[i].style,
						{
							click: function () {
								if (UI.pirateBoatWindow.activeTab == this.index) {
									return;
								};
								// 设定原活动标签背景图位置
								var pos = UI.pirateBoatWindow.leftTabs[UI.pirateBoatWindow.activeTab].style.backgroundPosition.split(' ');
								pos[0] = parseInt(pos[0]) + 70 + 'px';
								UI.pirateBoatWindow.leftTabs[UI.pirateBoatWindow.activeTab].style.backgroundPosition = pos.join(' ');

								// 设定新活动标签背景图位置
								pos = this.style.backgroundPosition.split(' ');
								pos[0] = parseInt(pos[0]) - 70 + 'px';
								this.style.backgroundPosition = pos.join(' ');
								pos = null;

								UI.pirateBoatWindow.activeTab = this.index;
								UI.pirateBoatWindow.fillData(data[this.index]);
							}
						})
					);
					UI.pirateBoatWindow.leftTabs[j].index = j;
					UI.animate(
						UI.pirateBoatWindow.leftTabs[j],
						{
							top: 37 + j * 77 + 'px',
							backgroundImage: 'url(./res/ui/pb/tab_boat_' + data[j].type + '.png)',
							backgroundPosition: j == UI.pirateBoatWindow.activeTab ? 
												-(data[j].pId % 6 * 2 + 1) * 70 + 'px -' + parseInt(data[j].pId / 6) * 77 + 'px'
												: -data[j].pId % 6 * 140 + 'px -' + parseInt(data[j].pId / 6) * 77 + 'px'
						},0
					);
					docfrag.appendChild(UI.pirateBoatWindow.leftTabs[j]);
				};
				continue;
			} else {//创建其他固定元素
				UI.pirateBoatWindow[pirateBoatWindow[0].items[i].name] = UI._ui.makeDom(
					'div',
					{
						innerHTML: pirateBoatWindow[0].items[i].innerHTML || '',
						className: pirateBoatWindow[0].items[i].className || ''
					},
					pirateBoatWindow[0].items[i].style,
					null
				);
				docfrag.appendChild(UI.pirateBoatWindow[pirateBoatWindow[0].items[i].name]);
			}
		};
		UI.pirateBoatWindow['active-skill-label'].style.background = 'url(./res/ui/font/' + UI.lang + '/activeskills.png) no-repeat';

		UI.pirateBoatWindow.equipmentGrid = {};
		for (var types = ['speed', 'luck', 'maxEnergy', 'getEnergy'], i = types.length - 1; i >= 0; i--) {
			UI.pirateBoatWindow.equipmentGrid[types[i]] = UI._ui.makeDom(
				'div',
				{
					className: 'cell'
				},
				{
					top: 53 + 80 * Math.floor(i / 2) + 'px',
					left: 50 + 202 * Math.floor(i % 2) + 'px'
				},
				{
					click: function (e) {
						UI.stopPropagation(e);
						UI.strengthenWindow.showStrengthenWindow('transform');
					}
				}
			);
			docfrag.appendChild(UI.pirateBoatWindow.equipmentGrid[types[i]]);
		};

		UI.pirateBoatWindow.w.dom.appendChild(docfrag);
		docfrag = null;

		UI.pirateBoatWindow.fillData(data[UI.pirateBoatWindow.activeTab]);

		UI.windowManager.push(UI.pirateBoatWindow);

		UI.pirateBoatWindow.w.dom.style.opacity = 0;
		UI.mainDiv.appendChild(UI.pirateBoatWindow.w.dom);
		UI.pirateBoatWindow.bindEvent();
	}

	/**
	 * 填充数据
	 * @param  {Object} data 数据对象
	 */
	UI.pirateBoatWindow.fillData = function (data) {
		UI.pirateBoatWindow['pirate-boat-nickname'].innerHTML = data.name;
		UI.pirateBoatWindow['pirate-boat-bust'].style.backgroundImage = 'url(' + data.bustImg + ')';
		UI.pirateBoatWindow['pirate-boat-level'].innerHTML = data.level;
		var _tmp = UI.pirateBoatWindow['pirate-boat-content-holder'].childNodes;
		_tmp[2].innerHTML = data.activeSkillDescription;
		_tmp[1].innerHTML = _tmp[0].innerHTML = '';
		for (var i = data.boatAttr.length - 1,_half = Math.floor(data.boatAttr.length / 2); i >= 0; i--) {
			if (i >= _half) {
				_tmp[1].innerHTML += data.boatAttr[i] + '<br>';
			} else {
				_tmp[0].innerHTML += data.boatAttr[i] + '<br>';
			}
		};
		_tmp = null;
		for (var i = data.equipment.length - 1; i >= 0; i--) {
			UI.pirateBoatWindow.equipmentGrid[data.equipment[i].type].innerHTML = '';
			if (data.equipment[i].levelUp) {
				UI.pirateBoatWindow.equipmentGrid[data.equipment[i].type].appendChild(UI._ui.makeDom(
					'div',
					{
						className: 'upgrade'
					},
					null,
					{
						click: function(e) {
							UI.stopPropagation(e);
						},
						mousedown: function(e) {
							UI.stopPropagation(e);
							this.style.background = 'url(./res/ui/btn/pb_up_h.png) no-repeat';
						},
						mouseup: function(e) {
							UI.stopPropagation(e);
							this.style.background = 'url(./res/ui/btn/pb_up.png) no-repeat';
						}
					}
				));
			};
		};
	}

	/**
	 * 显示任务弹出框
	 */
	UI.pirateBoatWindow.showPirateBoatWindow = function () {
		if (!UI.pirateBoatWindow.w.dom) {
			UI.pirateBoatWindow.initPirateBoatWindow(data);
		}
		UI.display(UI.pirateBoatWindow.w.dom, true);
		UI.pirateBoatWindow.w.dom.style.opacity = 1;
	}

	/**
	 * 綁定事件
	 */
	UI.pirateBoatWindow.bindEvent = function() {
		UI.bind(UI.pirateBoatWindow['frame-btn-alone'], 'click', function(e){
			UI.strengthenWindow.showStrengthenWindow('made');
		});
	}

	// 新增 pId - 船编号，type - 船类型属性
	// 通过上述两值决定background-image，background-position
	// 替换之前的id，tabImg
	var	data = [{
		pId: 10,
		type: 'defense',
		name: "小气球",
		level: 99,
		equipment: [{
			name: '',
			type: 'speed',
			levelUp: true,
			img: ''
		}, {
			name: '',
			type: 'luck',
			levelUp: true,
			img: ''
		}, {
			name: '',
			type: 'maxEnergy',
			img: ''
		}, {
			name: '',
			type: 'getEnergy',
			img: ''
		}],
		bustImg: './res/ui/ci/0/0_bust.png',
		boatAttr: [
			'耐　　久：5000<span data-for="naijiu" class="extra-num">+5</span>',
			'普通攻击：5000<span data-for="" class="extra-num">+500</span>',
			'物理防御：5000<span data-for="" class="extra-num"></span>',
			'',
			'暴　　击：5000<span data-for="" class="extra-num"></span>',
			'命　　中：5000<span data-for="" class="extra-num"></span>',
			'动　　力：5000<span data-for="dongli" class="extra-num">+5</span>',
			'技能攻击：5000<span data-for="" class="extra-num">+500</span>',
			'火焰防御：5000<span data-for="" class="extra-num"></span>',
			'',
			'格　　挡：5000<span data-for="" class="extra-num"></span>',
			'闪　　避：5000<span data-for="" class="extra-num"></span>'
		],
		activeSkillDescription : '开天辟地：策划君说这里放五十五十五十五十五十五十五十五十五十五十五十五十五十五十五十五十五十五十个字'
	}, {
		pId: 7,
		type: 'export',
		name: "黑珍珠",
		equipment: [],
		level: 33,
		tabImg: 'url(./res/ui/pb/tab_boat_defense.png) 140px 0',
		bustImg: './res/ui/ci/0/0_bust.png',
		boatAttr: [
			'耐　　久：4590<span data-for="naijiu" class="extra-num">+5</span>',
			'普通攻击：4590<span data-for="" class="extra-num">+500</span>',
			'物理防御：4590<span data-for="" class="extra-num"></span>',
			'',
			'暴　　击：4590<span data-for="" class="extra-num"></span>',
			'命　　中：4590<span data-for="" class="extra-num"></span>',
			'动　　力：4590<span data-for="dongli" class="extra-num">+5</span>',
			'技能攻击：4590<span data-for="" class="extra-num">+500</span>',
			'火焰防御：4590<span data-for="" class="extra-num"></span>',
			'',
			'格　　挡：4590<span data-for="" class="extra-num"></span>',
			'闪　　避：4590<span data-for="" class="extra-num"></span>'
		],
		activeSkillDescription : '开天辟地：策划君说这里放五十五十五十五十五十五十五十五十五十五十五十五十五十五十五十五十五十五十个字'
	}, {
		pId: 3,
		type: 'supply',
		name: "飞翔荷兰人",
		equipment: [],
		level: 66,
		tabImg: 'url(./res/ui/pb/tab_boat_defense.png) 280px 0',
		bustImg: './res/ui/ci/1/1_bust.png',
		boatAttr: [
			'耐　　久：7000<span data-for="naijiu" class="extra-num">+5</span>',
			'普通攻击：7000<span data-for="" class="extra-num">+500</span>',
			'物理防御：7000<span data-for="" class="extra-num"></span>',
			'',
			'暴　　击：7000<span data-for="" class="extra-num"></span>',
			'命　　中：7000<span data-for="" class="extra-num"></span>',
			'动　　力：7000<span data-for="dongli" class="extra-num">+5</span>',
			'技能攻击：7000<span data-for="" class="extra-num">+500</span>',
			'火焰防御：7000<span data-for="" class="extra-num"></span>',
			'',
			'格　　挡：7000<span data-for="" class="extra-num"></span>',
			'闪　　避：7000<span data-for="" class="extra-num"></span>'
		],
		activeSkillDescription : '开天辟地：策划君说这里放五十五十五十五十五十五十五十五十五十五十五十五十五十五十五十五十五十五十个字'
	}];
})(window.UI, smartlib);