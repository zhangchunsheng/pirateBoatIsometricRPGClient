/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-02-26
 * Description: 角色窗口
 */
(function(UI, $) {
	UI.characterWindow = function() {
		this.cId = btg.mainPlayer.cId;
	};
	UI.characterWindow.equipmentGrid = [0, 0, 0, 0];//speed luck maxEnergy getEnergy
	UI.characterWindow.buffGrid = [0, 0, 0, 0];
	UI.characterWindow.attrWindow = {
		showAttrs: [{
			id: "energy",
			name: "精力"
		}, {
			id: "getEnergySpeed",
			name: "恢复速度"
		}, {
			id: "br"
		}, {
			id: "speed",
			name: "移动速度"
		}, {
			id: "br"
		}, {
			id: "lucky",
			name: "幸运"
		}, {
			id: "hr"
		}, {
			id: "life",
			name: "耐久"
		}, {
			id: "attack",
			name: "普通攻击"
		}, {
			id: "skillHurt",
			name: "技能攻击"
		}, {
			id: "weaponDef",
			name: "物理防御"
		}, {
			id: "fireDef",
			name: "火焰防御"
		}, {
			id: "powerful",
			name: "动力"
		}, {
			id: "hr"
		}, {
			id: "crit",
			name: "暴击"
		}, {
			id: "parry",
			name: "格挡"
		}, {
			id: "hit",
			name: "命中"
		}, {
			id: "dodge",
			name: "闪避"
		}]
	};
	UI.characterWindow.attrWindow.w = {};
	UI.characterWindow.prototype.createWindow = function(data) {
		data = [{
			cId: 0,
			name: "亲，你懂得",
			equipment: [],
			experience: 10,
			level: 1,
			energy: 10,
			buff: []
		}, {
			cId: 0,
			name: "亲，你懂得",
			equipment: [],
			experience: 10,
			level: 1,
			energy: 10,
			buff: []
		}, {
			cId: -1,
			name: "亲，你懂得",
			equipment: [],
			experience: 10,
			level: 1,
			energy: 10,
			buff: []
		}];
		UI.characterWindow.w = new $.ui.baseWindow({
			id: "characterWindow" + this.cId,
			type: "characterWindow",
			title: '角&nbsp;色',
			block: false,
			activeTab: 0,
			closed: function(dom) {
				UI.windowManager.pop(UI.characterWindow);
				UI.characterWindow.w = {};
				if(UI.characterWindow.attrWindow.w.dom) {
					for (var i = 0, len = UI.characterWindow.attrWindow.w.dom.childNodes.length; i < len; i++) {
						if (UI.characterWindow.attrWindow.w.dom.childNodes[i].id === 'closeBtn') {
							UI.fire(UI.characterWindow.attrWindow.w.dom.childNodes[i], 'click');
							break;
						}
					};
				}
				if (UI.packageWindow.w.dom) {
					for (var i = 0, len = UI.packageWindow.w.dom.childNodes.length; i < len; i++) {
						if (UI.packageWindow.w.dom.childNodes[i].id === 'closeBtn') {
							UI.fire(UI.packageWindow.w.dom.childNodes[i], 'click');
							break;
						}
					};
				};
			}
		});
		$.ui.baseWindow.beforeClosed = function() {
			
		};
		UI.windowManager.push(UI.characterWindow);
		UI.characterWindow.w.dom.appendChild(UI.characterWindow.makeDom(data, UI.characterWindow.w));
		UI.mainDiv.appendChild(UI.characterWindow.w.dom);
		
		UI.bind(window, 'resize', function() {
			UI.characterWindow.reflowPosition();
		});
	};
	
	UI.characterWindow.makeDom = function(data, _window) {
		var rootElement = document.createElement("div");
		var characters = data;
		var suffix = "";
		var element = {};
		var cr_photo = "";
		for(var i = 0 ; i < characterWindow.items.length ; i++) {
			switch(characterWindow.items[i].name) {
			case "tab_left_bg":
				UI.characterWindow.createTabLeftBg(rootElement, _window, characters, suffix, element, cr_photo, characterWindow.items[i]);
				break;
			case "equipmentGrid":
				UI.characterWindow.createEquipmentGrid(rootElement, _window, characters, suffix, element, cr_photo, characterWindow.items[i]);
				break;
			case "buffBG":
				UI.characterWindow.createBuffBG(rootElement, _window, characters, suffix, element, cr_photo, characterWindow.items[i]);
				break;
			case "nickname":
				UI.characterWindow.createNickname(rootElement, _window, characters, suffix, element, cr_photo, characterWindow.items[i]);
				break;
			case "bust":
				UI.characterWindow.createBust(rootElement, _window, characters, suffix, element, cr_photo, characterWindow.items[i]);
				break;
			case "hr":
				UI.characterWindow.createHr(rootElement, _window, characters, suffix, element, cr_photo, characterWindow.items[i]);
				break;
			case "middleBG":
				UI.characterWindow.createMiddleBG(rootElement, _window, characters, suffix, element, cr_photo, characterWindow.items[i]);
				break;
			case "experienceBG":
				UI.characterWindow.createExperienceBG(rootElement, _window, characters, suffix, element, cr_photo, characterWindow.items[i]);
				break;
			case "experience":
				UI.characterWindow.createExperience(rootElement, _window, characters, suffix, element, cr_photo, characterWindow.items[i]);
				break;
			case "energyBG":
				UI.characterWindow.createEnergyBG(rootElement, _window, characters, suffix, element, cr_photo, characterWindow.items[i]);
				break;
			case "energy":
				UI.characterWindow.createEnergy(rootElement, _window, characters, suffix, element, cr_photo, characterWindow.items[i]);
				break;
			case "addEnergy":
				UI.characterWindow.createAddEnergy(rootElement, _window, characters, suffix, element, cr_photo, characterWindow.items[i]);
				break;
			case "showOnMSBtn":
				UI.characterWindow.showOnMSBtn(rootElement, _window, characters, suffix, element, cr_photo, characterWindow.items[i]);
				break;
			}
		};
		return rootElement;
	};
	
	/**
	 * create tab_left_bg
	 */
	UI.characterWindow.createTabLeftBg = function(rootElement, _window, characters, suffix, element, cr_photo, item) {
		for (var j = 0 ; j < characters.length ; j++) {
			if(j == _window.activeTab) {
				suffix = "_h";
			}
			if(characters[j].cId == -1) {
				cr_photo = 'res/ui/ci/d.png';
			} else {
				cr_photo = 'res/ui/ci/' + characters[j].cId + '/' + characters[j].cId + '_tab' + suffix + '.png';
			}
			item.style.background = 'url(' + cr_photo + ')';
			element = UI._ui.makeDom(
				'div',
				{
					id: "characterTab" + j
				},
				item.style,
				{
					click: UI.characterWindow.changeTab
				}
			);
			element.setAttribute("data-cId", characters[j].cId);
			suffix = "";
			element.style.top = tab.beginTop + tab.height * j + 'px';
			rootElement.appendChild(element);
		};
	};
	
	/**
	 * create equipmentGrid
	 */
	UI.characterWindow.createEquipmentGrid = function(rootElement, _window, characters, suffix, element, cr_photo, item) {
		for (var j = 0 ; j < UI.characterWindow.equipmentGrid.length ; j++) {
			element = UI._ui.makeDom(
				'div',
				{
					className: "cell"
				},
				item.style,
				null
			);
			element.style.top = characterWindow.equipmentGrid.beginTop + (grid.width + characterWindow.equipmentGrid.marginTop) * Math.floor(j / 2) + 'px';
			element.style.left = characterWindow.equipmentGrid.beginLeft + (grid.width + characterWindow.equipmentGrid.marginLeft) * Math.floor(j % 2) + 'px';
			rootElement.appendChild(element);
		};
	};
	
	/**
	 * create buffGrid
	 */
	UI.characterWindow.createBuffGrid = function(rootElement, _window, characters, suffix, element, cr_photo, item) {
		for (var j = 0 ; j < UI.characterWindow.equipmentGrid.length ; j++) {
			element = UI._ui.makeDom(
				'div',
				{
					className: "cell"
				},
				item.style,
				null
			);
			element.style.top = ui_config.characterWindow.buffGrid.beginTop + 'px';
			element.style.left = ui_config.characterWindow.buffGrid.beginLeft + (grid.width + characterWindow.buffGrid.marginLeft) * j + 'px';
			rootElement.appendChild(element);
		};
	};
	
	/**
	 * create buffGrid
	 */
	UI.characterWindow.createBuffTitle = function(rootElement, _window, characters, suffix, element, cr_photo, item) {
		element = UI._ui.makeDom(
			'div',
			{
				
			},
			item.style,
			null
		);
		rootElement.appendChild(element);
	};
	
	/**
	 * create buffGridBG
	 */
	UI.characterWindow.createBuffBG = function(rootElement, _window, characters, suffix, element, cr_photo, item) {
		element = UI._ui.makeDom(
			'div',
			{
				className: "cr-buffBG"
			},
			item.style,
			null
		);
		var buffGrid = {};
		for(var i = 0 ; i < item.items.length ; i++) {
			switch(item.items[i].name) {
			case "buffTitle":
				UI.characterWindow.createBuffTitle(element, _window, characters, suffix, buffGrid, cr_photo, item.items[i]);
				break;
			case "buffGrid":
				UI.characterWindow.createBuffGrid(element, _window, characters, suffix, buffGrid, cr_photo, item.items[i]);
				break;
			}
		};
		rootElement.appendChild(element);
	};
	
	/**
	 * create nickname
	 */
	UI.characterWindow.createNickname = function(rootElement, _window, characters, suffix, element, cr_photo, item) {
		element = UI._ui.makeDom(
			'div',
			{
				id: "cr_nickname",
				innerHTML: characters[_window.activeTab].name + '<div id="cr_level">' + characters[_window.activeTab].level + '</div>'
			},
			item.style,
			null
		);
		rootElement.appendChild(element);
	};

	/**
	 * create bust
	 */
	UI.characterWindow.createBust = function(rootElement, _window, characters, suffix, element, cr_photo, item) {
		element = UI._ui.makeDom(
			'img',
			{
				id: "character" + characters[_window.activeTab].cId,
				src: "res/ui/ci/" + characters[_window.activeTab].cId + "/" + characters[_window.activeTab].cId + "_bust.png"
			},
			item.style,
			{
				click: function() {
					var cId = this.id.replace("character", "");
					var left = parseInt(UI.characterWindow.w.dom.style.left) + parseInt(UI.characterWindow.w.dom.style.width) + 5;
					var top = parseInt(UI.characterWindow.w.dom.style.top);
					if(UI.characterWindow.attrWindow.w.dom) {
						UI.characterWindow.attrWindow.w.show();
					} else {
						UI.characterWindow.attrWindow.w = new $.ui.baseWindow({
							id: "attrWindow" + cId,
							width: 142,
							height: 467,
							left: left,
							top: top,
							background: 'url(./res/ui/layout/c/cr_attribute_bg.png) no-repeat',
							title: '属&nbsp;性',
							titleHeight: 46,
							titleFontSize: 20,
							block: false,
							className: "attrWindow",
							closed: function(dom) {
								UI.characterWindow.attrWindow.w = {};
							}
						});
						var container = UI._ui.makeDom(
							'div',
							{
								
							},
							{
								position: "absolute",
								left: "20px",
								top: "70px"
							},
							null
						);
						var tag = "div";
						var html = "";
						var style = {};
						for(var i = 0 ; i < UI.characterWindow.attrWindow.showAttrs.length ; i++) {
							if(UI.characterWindow.attrWindow.showAttrs[i].id == "br") {
								tag = "br";
								html = "";
							} else if(UI.characterWindow.attrWindow.showAttrs[i].id == "hr") {
								tag = "hr";
								html = "";
								style = {
									width: "100px"
								}
							} else {
								tag = "div";
								html = UI.characterWindow.attrWindow.showAttrs[i].name + "：" + btg.mainPlayer[UI.characterWindow.attrWindow.showAttrs[i].id];
							}
							container.appendChild(UI._ui.makeDom(
								tag,
								{
									innerHTML: html
								},
								style,
								null
							));
						}
						UI.characterWindow.attrWindow.w.dom.appendChild(container);
						UI.mainDiv.appendChild(UI.characterWindow.attrWindow.w.dom);
					}
				}
			}
		);
		rootElement.appendChild(element);
	};

	/**
	 * create hr
	 */
	UI.characterWindow.createHr = function(rootElement, _window, characters, suffix, element, cr_photo, item) {
		element = UI._ui.makeDom(
			'hr',
			{
				
			},
			item.style,
			null
		);
		rootElement.appendChild(element);
	};

	/**
	 * create middleBG
	 */
	UI.characterWindow.createMiddleBG = function(rootElement, _window, characters, suffix, element, cr_photo, item) {
		element = UI._ui.makeDom(
			'div',
			{
				
			},
			item.style,
			null
		);
		rootElement.appendChild(element);
	};

	/**
	 * create experienceBG
	 */
	UI.characterWindow.createExperienceBG = function(rootElement, _window, characters, suffix, element, cr_photo, item) {
		element = UI._ui.makeDom(
			'div',
			{
				className: "experienceBG"
			},
			item.style,
			null
		);
		rootElement.appendChild(element);
	};

	/**
	 * create experience
	 */
	UI.characterWindow.createExperience = function(rootElement, _window, characters, suffix, element, cr_photo, item) {
		element = UI._ui.makeDom(
			'div',
			{
				className: "experience",
				innerText: "1/1"
			},
			item.style,
			null
		);
		rootElement.appendChild(element);
	};

	/**
	 * create energyBG
	 */
	UI.characterWindow.createEnergyBG = function(rootElement, _window, characters, suffix, element, cr_photo, item) {
		element = UI._ui.makeDom(
			'div',
			{
				className: "experienceBG"
			},
			item.style,
			null
		);
		rootElement.appendChild(element);
	};

	/**
	 * create energy
	 */
	UI.characterWindow.createEnergy = function(rootElement, _window, characters, suffix, element, cr_photo, item) {
		element = UI._ui.makeDom(
			'div',
			{
				className: "experience",
				innerText: "1/1"
			},
			item.style,
			null
		);
		rootElement.appendChild(element);
	};

	/**
	 * create addEnergy
	 */
	UI.characterWindow.createAddEnergy = function(rootElement, _window, characters, suffix, element, cr_photo, item) {
		element = UI._ui.makeDom(
			'div',
			{
				id: "cr-addEnergy"
			},
			item.style,
			null
		);
		rootElement.appendChild(element);
	};
	
	/**
	 * showOnMSBtn
	 */
	UI.characterWindow.showOnMSBtn = function(rootElement, _window, characters, suffix, element, cr_photo, item) {
		element = UI._ui.makeDom(
			'div',
			{
				innerHTML: "显示到场景"
			},
			item.style,
			null
		);
		rootElement.appendChild(element);
	};
	
	/**
	 * 切换标签页
	 */
	UI.characterWindow.changeTab = function(e) {
		var cId = this.getAttribute("data-cId");
		var activeTab = UI.characterWindow.w.activeTab;
		var activeTabDom = UI.getDom("#characterTab" + activeTab);
		if(cId == -1)
			return;
		if("characterTab" + activeTab == this.id) {
			return;
		}
		
		var cr_photo = 'res/ui/ci/' + activeTabDom.getAttribute("data-cId") + '/' + activeTabDom.getAttribute("data-cId") + '_tab.png';
		activeTabDom.style.background = 'url(' + cr_photo + ')';
		
		cr_photo = 'res/ui/ci/' + cId + '/' + cId + '_tab_h.png';
		this.style.background = 'url(' + cr_photo + ')';
		UI.characterWindow.w.activeTab = this.id.replace("characterTab", "");
	};
	
	/**
	 * reflowPosition
	 */
	UI.characterWindow.reflowPosition = function() {
		var _window = UI.characterWindow.w.dom;
		if(_window) {
			_window.style.top = (ui_config.window.top + UI.offset.top) + 'px';
			_window.style.left = (ui_config.window.left + UI.offset.left) + 'px';
			if(UI.characterWindow.attrWindow.w.dom) {
				UI.characterWindow.attrWindow.w.dom.style.left = parseInt(_window.style.left) + parseInt(_window.style.width) + 5 + "px";
			}
		}
	};
	
	/**
	 * 綁定事件
	 */
	UI.characterWindow.bindEvent = function() {
		UI.bind('#mainPlayer', 'click', function(e){
			UI.stopPropagation(e);
			UI.mainPlayerWindow = new UI.characterWindow();
			UI.loading(UI.mainPlayerWindow.createWindow, ui_resources.characterWindow, UI.mainPlayerWindow);
		});
	};
})(window.UI, smartlib);