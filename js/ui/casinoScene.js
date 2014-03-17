/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Modify: Peter Zhang
 * Date: 2013-03-18
 * Description: 赌场
 */
(function(UI, lib) {
	UI.casinoScene = function() {
		
	};
	UI.casinoScene.suffix = "casinoScene_";
	UI.casinoScene.w = {};
	
	/**
	 * 初始化赌场界面
	 */
	UI.casinoScene.init = function () {
		UI.casinoScene.w.dom = document.createElement('div');
		// 用在窗体定位时
		UI.casinoScene.w.dom.id = "casinoScene";

		var docfrag = document.createDocumentFragment();

		for(var i = 0 ; i < ui_config.casinoScene.length ; i++) {
			switch (ui_config.casinoScene[i].name) {
				case 'leftTop':
					UI.casinoScene.createLeftTop(ui_config.casinoScene[i].style, ui_config.casinoScene[i].items, docfrag);
					break;
				case 'rightTop':
					UI.casinoScene.createRightTop(ui_config.casinoScene[i].style, ui_config.casinoScene[i].items, docfrag);
					break;
				case 'topCenter':
					UI.casinoScene.createTopCenter(ui_config.casinoScene[i].style, ui_config.casinoScene[i].items, docfrag);
					break;
				case 'bottom':
					UI.casinoScene.createBottom(ui_config.casinoScene[i].style, ui_config.casinoScene[i].items, docfrag);
					break;
				default:
					UI.casinoScene.createElement(ui_config.casinoScene[i].name, ui_config.casinoScene[i].style, ui_config.casinoScene[i].items, docfrag);
					break;
			}
		};		

		UI.casinoScene.w.dom.appendChild(docfrag);
		UI.windowManager.push(UI.casinoScene);
		UI.mainDiv.appendChild(UI.casinoScene.w.dom);
		docfrag = null;
	};
	
	/**
	 * 创建元素
	 */
	UI.casinoScene.createElement = function(name, style, items, docfrag) {
		var id = UI.casinoScene.suffix + name;
		UI.casinoScene[name] = UI._ui.makeDom(
			'div',
			{
				id: id,
			},
			style,
			null
		);
		for(var i = 0 ; i < items.length ; i++) {
			UI.casinoScene[name].appendChild(UI._ui.makeDom(
				'div',
				{
					id: items[i].name,
					className: items[i].className || "",
					innerHTML: items[i].innerHTML || ""
				},
				items[i].style,
				items[i].events || null
			));
		};
		docfrag.appendChild(UI.casinoScene[name]);
	};
	
	/**
	 * 创建左上角玩家
	 */
	UI.casinoScene.createLeftTop = function(style, items, docfrag) {
		for(var i = 0 ; i < items.length ; i++) {
			if(items[i].name == "player-photo") {
				items[i].style.background = "url(./res/ui/ci/" + btg.mainPlayer.cId + "/" + btg.mainPlayer.cId + "_photo.png)";
			}
			if(items[i].name == "player-money") {
				items[i].innerHTML = "玩家金币：" + btg.mainPlayer.money;
			}
			if(items[i].name == "player-stake") {
				items[i].innerHTML = "赌注金额：" + btg.mainPlayer.money;
			}
		}
		UI.casinoScene.createElement("leftTop", style, items, docfrag);
	};

	/**
	 *  创建右上角赌场老板
	 */
	UI.casinoScene.createRightTop = function(style, items, docfrag) {
		UI.casinoScene.createElement("rightTop", style, items, docfrag);
	};

	/**
	 * 创建赌资元素
	 */
	UI.casinoScene.createTopCenter = function(style, items, docfrag) {
		UI.casinoScene.createElement("topCenter", style, items, docfrag);
	};
	

	/**
	 * 创建底部按钮
	 */
	UI.casinoScene.createBottom = function(style, items, docfrag) {
		for(var i = 0 ; i < items.length ; i++) {
			if(items[i].name == "add-stake") {
				items[i].events = {
					click: function(e) {
						
					}
				};
			}
			if(items[i].name == "casino-btn") {
				items[i].events = {
					click: function(e) {
						var dice = new lib.ui.dice({
							id: 'dice1',
							value: '骰子',
							width: 256,
							height: 512,
							spritewidth: 128,
							spriteheight: 128,
							animationspeed: 100,
							x: 0,
							y: 0,
							maxX: 400,
							maxY: 300,
							color: '#333333',
							position: 'absolute',
							appendTo: 'casinoScene_table',
							hided: false,
							disabled: false,
							ui: { id: 'dice', sx: 0, sy: 0, hx: 0, hy: 0, w: 128, h: 128 }
						});
					}
				};
			}
		}
		UI.casinoScene.createElement("bottom", style, items, docfrag);
	};

	/**
	 * 定位窗体
	 */
	UI.casinoScene.reflowPosition = function() {
		for(var i = 0 ; i < ui_config.casinoScene.length ; i++) {
			if(ui_config.casinoScene[i].style.hasOwnProperty('top')) {
				UI.casinoScene[ui_config.casinoScene[i].name].style.top = (parseInt(ui_config.casinoScene[i].style.top) + UI.offset.top) + 'px';
			}
			if(ui_config.casinoScene[i].style.hasOwnProperty('left')) {
				UI.casinoScene[ui_config.casinoScene[i].name].style.left = (parseInt(ui_config.casinoScene[i].style.left) + UI.offset.left) + 'px';
			}
		};		
	}
})(window.UI, smartlib);