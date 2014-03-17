/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-03-05
 * Description: 戰鬥場景
 */
(function(UI, lib) {
	UI.fightScene = {};
	UI.fightScene.suffix = "fightScene_";
	UI.fightScene.items = null;
	var mainPlayer = [{
		cId: 0
	}, {
		cId: 0
	}, {
		cId: 0
	}];
	var enemy = [{
		cId: 0
	}];
	
	/**
	 * 重新佈局
	 */
	UI.fightScene.reflowPosition = function () {
		for(var i = 0 ; i < ui_config.fightScene.length ; i++) {
			UI.fightScene[ui_config.fightScene[i].name].style.top = (parseInt(ui_config.fightScene[i].style.top.replace("px", "")) + UI.offset.top) + 'px';
			UI.fightScene[ui_config.fightScene[i].name].style.left = (parseInt(ui_config.fightScene[i].style.left.replace("px", "")) + UI.offset.left) + 'px';
		};
	};
	
	/**
	 * 創建戰鬥場景
	 */
	UI.fightScene.createScene = function () {
		if(UI.fightScene.items == null) {
			UI.initSceneItems(UI.fightScene, ui_config.fightScene);
			UI.fightScene._ui = new lib.ui.core();
			
			UI.bind(window, 'resize', function() {
				UI.fightScene.reflowPosition();
			});
			UI.fightScene.createDom();

			UI.fightScene.reflowPosition();
		} else {
			UI.fightScene.show();
		}
	};
	
	/**
	 * 創建dom
	 */
	UI.fightScene.createDom = function() {
		var docfrag = document.createDocumentFragment();

		var html = "";
		//top
		UI.fightScene.createTop(docfrag, html);

		//leftCharacter
		UI.fightScene.createLeftCharactor(docfrag, html);

		//rightCharacter
		UI.fightScene.createRightCharactor(docfrag, html);
		
		//右下角
		UI.fightScene.createRightBottom(docfrag, html);

		UI.mainDiv.appendChild(docfrag);

		docfrag = html = null;
	};
	
	/**
	 * top
	 */
	UI.fightScene.createTop = function(docfrag, html) {
		var id = UI.fightScene.suffix + "top";
		var items = ui_config.fightScene[0].items;
		var className = "";
		var innerText = "";
		UI.fightScene.top = UI._ui.makeDom(
			'div',
			{
				id: id,
			},
			UI.fightScene.items["top"].style,
			null
		);
		for(var i = 0 ; i < items.length ; i++) {
			if(items[i].hasOwnProperty("className")) {
				className = items[i].className;
			}
			if(items[i].hasOwnProperty("className")) {
				innerText = items[i].innerText;
			}
			UI.fightScene.top.appendChild(UI._ui.makeDom(
				'div',
				{
					id: id + "_" + items[i].name,
					className: className,
					innerText: innerText
				},
				items[i].style,
				null
			));
			className = "";
		}
		for(var i = 0 ; i < mainPlayer.length ; i++) {
			UI.fightScene.top.appendChild(UI._ui.makeDom(
				'div',
				{
					id: id + "_l_cr" + i,
					className: ui_config.waterDrop.className,
					innerText: i
				},
				{
					left: ui_config.waterDrop.l_cr_begin.left + "px",
					top: ui_config.waterDrop.l_cr_begin.top + "px"
				},
				null
			));
		}
		for(var i = 0 ; i < enemy.length ; i++) {
			UI.fightScene.top.appendChild(UI._ui.makeDom(
				'div',
				{
					id: id + "_r_cr" + i,
					className: ui_config.waterDrop.className,
					innerText: i
				},
				{
					left: ui_config.waterDrop.r_cr_begin.left + "px",
					top: ui_config.waterDrop.r_cr_begin.top + "px"
				},
				null
			));
		}
		id = null;
		items = null;
		className = null;
		innerText = null;
		docfrag.appendChild(UI.fightScene.top);
	};

	/**
	 * leftCharacter
	 */
	UI.fightScene.createLeftCharactor = function(docfrag, html) {
		UI.fightScene.createCharactor(docfrag, html, "left", mainPlayer)
	};

	/**
	 * rightCharacter
	 */
	UI.fightScene.createRightCharactor = function(docfrag, html) {
		UI.fightScene.createCharactor(docfrag, html, "right", enemy)
	};
	
	/**
	 * character
	 */
	UI.fightScene.createCharactor = function(docfrag, html, type, fightCharactor) {
		var id = UI.fightScene.suffix + type + "Character";
		var styleName = "";
		if(type == "left") {
			styleName = "l_cr1";
		} else {
			styleName = "r_cr1";
		}
		var style = UI.fightScene.items[type + "Character"][styleName].style;
		UI.fightScene[type + "Character"] = UI._ui.makeDom(
			'div',
			{
				id: id,
			},
			UI.fightScene.items[type + "Character"].style,
			null
		);
		for(var i = 0 ; i < fightCharactor.length ; i++) {
			UI.fightScene[type + "Character"].appendChild(UI._ui.makeDom(
				'div',
				{
					id: id + "_cr_" + i,
					className: UI.fightScene.items[type + "Character"][styleName].className,
					innerHTML: '<img src="res/ui/ci/' + fightCharactor[i].cId + '/' + fightCharactor[i].cId + '_photo.png" class="fight-character" style="max-width:' + style.width + 'px"></img>'
				},
				{
					left: style.left + "px",
					top: (style.top + i * style.height + i * style["margin-bottom"]) + "px",
					width: style.width + "px",
					height: style.height + "px"
				},
				null
			));
		}
		id = null;
		styleName = null;
		style = null;
		docfrag.appendChild(UI.fightScene[type + "Character"]);
	};
	
	/**
	 * 右下角
	 */
	UI.fightScene.createRightBottom = function(docfrag, html) {
		var id = UI.fightScene.suffix + "rightBottom";
		var items = ui_config.fightScene[3].items;
		var className = "";
		UI.fightScene.rightBottom = UI._ui.makeDom(
			'div',
			{
				id: id,
			},
			UI.fightScene.items["rightBottom"].style,
			null
		);
		for(var i = 0 ; i < items.length ; i++) {
			if(items[i].hasOwnProperty("className")) {
				className = items[i].className;
			}
			UI.fightScene.rightBottom.appendChild(UI._ui.makeDom(
				'div',
				{
					id: id + "_" + items[i].name,
					className: className,
					innerText: "跳过战斗"
				},
				items[i].style,
				{
					click: function(e) {
						btg.mainPlayer.quitFight();
					}
				}
			));
			className = "";
		}
		id = null;
		items = null;
		className = null;
		docfrag.appendChild(UI.fightScene.rightBottom);
	};
	
	/**
	 * 更新左侧回合数
	 */
	UI.fightScene.updateLeftRound = function(num) {
		UI.getDom("#fightScene_top_round_left").innerHTML = num;
	};
	
	/**
	 * 更新右侧回合数
	 */
	UI.fightScene.updateRightRound = function(num) {
		UI.getDom("#fightScene_top_round_right").innerHTML = num;
	};
	
	/**
	 * 显示战斗UI
	 */
	UI.fightScene.show = function() {
		for(var i = 0 ; i < ui_config.fightScene.length ; i++) {
			UI.show(UI.getDom("#" + UI.fightScene.suffix + ui_config.fightScene[i].name));
		};
	};
	
	/**
	 * 隐藏战斗UI
	 */
	UI.fightScene.hide = function() {
		for(var i = 0 ; i < ui_config.fightScene.length ; i++) {
			UI.hide(UI.getDom("#" + UI.fightScene.suffix + ui_config.fightScene[i].name));
		};
	};
})(window.UI, smartlib);