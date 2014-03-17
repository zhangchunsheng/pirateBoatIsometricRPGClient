/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-12
 * Description: 强化窗体 重铸页
 */
(function(UI, lib) {
	UI.strengthenWindow.recast = {};

	// 当前显示的强化信息所属
	UI.strengthenWindow.recast.active = 'magicDamage';

	// 当前激活的待重铸的装备数据信息
	UI.strengthenWindow.recast.activeItem = {};

	/**
	 * 初始化重铸页
	 */
	UI.strengthenWindow.recast.init = function (dom, styles) {
		dom.innerHTML = '';
		var docfrag = document.createDocumentFragment();

		//如果是环形进度表的内部元素，先保存
		var _tmp = [];

		for (var i = styles.length - 1; i >= 0; i--) {			
			if (styles[i].name === 'circle-progress-left' || styles[i].name === 'circle-progress-right' || styles[i].name === 'circle-progress-rotate') {
				_tmp.push(styles[i]);
				continue;
			};
			if (styles[i].name === 'cell') {
				for (var j = 0, types = ['magicDamage','damage','magicDefense','defense']; j < 4; j++) {
					UI.strengthenWindow.recast[types[j]] = UI._ui.makeDom(
						'div',
						{
							className: 'cell',
							id: types[j]
						},
						styles[i].style,
						{
							click: function (e) {
								UI.stopPropagation(e);
								if (this.id != UI.strengthenWindow.recast.active) {
									UI.strengthenWindow.recast.fillData(data[this.id]);
									UI.strengthenWindow.recast.active = this.id;
								};
							}
						}
					);
					UI.strengthenWindow.recast[types[j]].style.left = 34 + 77 * j + 'px';
					docfrag.appendChild(UI.strengthenWindow.recast[types[j]]);
				}
				continue;
			};
			if (styles[i].name === 'frame-btn-alone') {
				docfrag.appendChild(UI._ui.makeDom(
						'div',
						{
							className: 'frame-btn-alone',
							innerHTML: styles[i].innerHTML
						},
						null,
						{
							click: function (e) {
								UI.stopPropagation(e);
								UI.strengthenWindow.recast.updateData(UI.strengthenWindow.recast.activeItem);
								UI.strengthenWindow.recast.recastEquipment(UI.strengthenWindow.recast.activeItem);
							}
						}
					)
				);
			};
			UI.strengthenWindow.recast[styles[i].name] = UI._ui.makeDom(
				'div',
				null,
				styles[i].style,
				null
			);
			docfrag.appendChild(UI.strengthenWindow.recast[styles[i].name]);
		};

		UI.strengthenWindow.recast['recast-left-text'].style.background = 'url(./res/ui/font/' + UI.lang + '/st_rst_surplus.png) no-repeat';
		UI.strengthenWindow.recast['circle-progress-cover'].style.background = 'url(./res/ui/layout/c/rst_bg_icon.png) no-repeat';
		//添加环形进度条内容
		for (var i = _tmp.length - 1; i >= 0; i--) {
			UI.strengthenWindow.recast[_tmp[i].name] = UI._ui.makeDom(
				'div',
				null,
				_tmp[i].style,
				null
			);
			UI.strengthenWindow.recast['circle-progress-holder'].appendChild(UI.strengthenWindow.recast[_tmp[i].name]);
		};

		UI.strengthenWindow.recast.fillData(data[UI.strengthenWindow.recast.active]);
		dom.appendChild(docfrag);
		docfrag = null;
	}

	/**
	 * 填充数据
	 */
	UI.strengthenWindow.recast.fillData = function (data) {
		UI.strengthenWindow.recast.activeItem = data;
		UI.strengthenWindow.recast['circle-progress-cover-type'].style.background = 'url(./res/ui/layout/c/' + data.itemType + '.png) no-repeat';
		UI.strengthenWindow.recast.recastEquipment(data);
	}

	/**
	 * 更新数据
	 */
	UI.strengthenWindow.recast.updateData = function (data) {
		if (data.left == 0) {
			return false;
		};
		data.left--;
		data.level++;
		// 将信息推送到服务器
		// 代码....
		
		// 从服务器端获得下一等级的介绍信息
		data.description.attr = '魔法攻击力';
		data.description.value = 9;
	}

	/**
	 * 重铸装备
	 */
	UI.strengthenWindow.recast.recastEquipment = function(data) {
		if(typeof data.left == 'number' && data.left < 10) {
			data.left = '0' + data.left;
		}
		UI.strengthenWindow.recast['recast-left-num'].innerHTML = data.left;
		UI.strengthenWindow.recast['recast-description'].innerHTML = data.description.attr + '<span style="color:#36ff00;">+' + data.description.value +'</span>';
		var _persent = ~~(data.level / data.maxLevel * 100);
		UI.strengthenWindow.recast['recast-percent'].innerHTML = _persent + '/100';
		if (_persent <= 50) {
			UI.animate(
				UI.strengthenWindow.recast['circle-progress-left'],
				{
					background: '#ff6000',
					zIndex: 564
				}
			);
			UI.animate(
				UI.strengthenWindow.recast['circle-progress-right'],
				{
					background: '#102c4a',
					zIndex: 566
				}
			);
			UI.animate(
				UI.strengthenWindow.recast['circle-progress-rotate'],
				{
					transformOrigin: 'right center',
					transform : 'rotate(' + (_persent / 100 * 360) + 'deg)',
					background: '#102c4a'
				}
			);
		} else {
			UI.animate(
				UI.strengthenWindow.recast['circle-progress-left'],
				{
					background: '#ff6000',
					zIndex: 566
				}
			);
			UI.animate(
				UI.strengthenWindow.recast['circle-progress-right'],
				{
					background: '#102c4a',
					zIndex: 564
				}
			);
			UI.animate(
				UI.strengthenWindow.recast['circle-progress-rotate'],
				{
					transformOrigin: 'right center',
					transform: 'rotate(' + ((_persent - 50) / 100 * 360) + 'deg)',
					background: '#ff6000'
				}
			);
		}
		_persent = null;
	}

	/**
	 * 移除窗体内容
	 */
	UI.strengthenWindow.recast.close = function() {
	}

	/**
	 * 綁定事件
	 */
	UI.strengthenWindow.recast.bindEvent = function() {
	}

	// 百分比 = level / maxLevel
	// 建议调整图片文件的命名，舍去itemType属性
	// 剩余重铸次数 <= 等级最大值 - 当前等级
	var data = {
		magicDamage: {
			itemID: 1001,
			itemType: 'rst_1_icon',
			left: 1,
			description: {
				attr: '基础攻击力',
				value: 2
			},
			level: 9,
			maxLevel: 10
		},
		damage: {
			itemID: 1123,
			itemType: 'rst_1_icon',
			left: 6,
			description: {
				attr: '基础攻击力',
				value: 6
			},
			level: 7,
			maxLevel: 15
		},
		magicDefense: {
			itemID: 1024,
			itemType: 'rst_1_icon',
			left: 3,
			description: {
				attr: '基础攻击力',
				value: 7
			},
			level: 4,
			maxLevel: 20
		},
		defense: {
			itemID: 1221,
			itemType: 'rst_1_icon',
			left: 0,
			description: {
				attr: '基础攻击力',
				value: 9
			},
			level: 12,
			maxLevel: 18
		},
	}
})(window.UI, smartlib);