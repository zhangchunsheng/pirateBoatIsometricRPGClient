/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-02-19
 * Description: 主界面
 */
(function(UI, lib) {
	UI.mainScene = {};//保存主界面UI对象
	UI.menus = ["character", "package", "skill", "formation", "pirateBoat"];

	/**
	 * 重新佈局
	 */
	UI.mainScene.reflowPosition = function () {
		for(var i = 0 ; i < ui_config.mainScene.length ; i++) {
			UI.mainScene[ui_config.mainScene[i].name].style.top = (parseInt(ui_config.mainScene[i].style.top) + UI.offset.top) + 'px';
			UI.mainScene[ui_config.mainScene[i].name].style.left = (parseInt(ui_config.mainScene[i].style.left) + UI.offset.left) + 'px';
		};
	};

	/**
	 * 初始化主界面
	 */
	UI.initMainScene = function() {
		UI.initSceneItems(UI.mainScene, ui_config.mainScene);

		UI.bind(window, 'resize', function() {
			UI.sceneSize = {
				width: window.innerWidth,
				height: window.innerHeight
			};
			UI.offset.left = UI.gameCanvas.offsetLeft;
			UI.offset.top = UI.gameCanvas.offsetTop;
			UI.mainScene.reflowPosition();
		});
		UI.mainScene.createMainScene();
		UI.mainScene.reflowPosition();
		UI.mainScene.setExp();

		var myScroll = new iScroll('chatRoom', { hScrollbar: true, vScrollbar: true });
	};

	UI.mainScene.createMainScene = function () {
		var docfrag = document.createDocumentFragment();

		var html = "";
		
		for(var i = 0 ; i < ui_config.mainScene.length ; i++) {
			switch(ui_config.mainScene[i].name) {
			case "leftTop"://左上角
				UI.mainScene.createLeftTop(docfrag, html);
				break;
			case "rightTop"://右上角
				UI.mainScene.createRightTop(docfrag, html);
				break;
			case "leftBottom"://左下角
				UI.mainScene.createLeftBottom(docfrag, html);
				break;
			case "rightCenter"://右侧标签
				UI.mainScene.createRightCenter(docfrag, html);
				break;
			case "rightBottom"://右下角
				UI.mainScene.createRightBottom(docfrag, html);
				break;
			case "marquee"://通知栏
				UI.mainScene.createMarquee(docfrag, html);
				break;
			}
		};

		UI.mainDiv.appendChild(docfrag);
		
		UI.mainScene.doMarquee();

		docfrag = html = null;
		
		UI.chatWindow.bindEvent();
		UI.characterWindow.bindEvent();
		UI.taskWindow.bindEvent();
		UI.DialogueScene.bindEvent();
	};

	/**
	 * 左上角
	 */
	UI.mainScene.createLeftTop = function(docfrag, html) {
		UI.mainScene.leftTop = UI._ui.makeDom(
			'div',
			{
				id:"leftTop"
			},
			UI.addPx(UI.mainScene.items.leftTop.style),
			null
		);
		var items = ui_config.mainScene[0].items;
		var element = null;
		var tag = "div";
		var className = "";
		var innerText = "";
		var innerHTML = "";
		var attributes = {};
		var style = {};
		for(var i = 0 ; i < items.length ; i++) {
			style = UI.addPx(items[i].style);
			if(items[i].bgName) {
				UI.getRect(style, items[i].bgName);
			}
			element = UI._ui.makeDom(
				"div",
				{
					id: items[i].name.replace("#", "")
				},
				style,
				null
			);
			for(var j = 0 ; j < items[i].items.length ; j++) {
				if(items[i].items[j].hasOwnProperty("tag"))
					tag = items[i].items[j].tag;
				className = items[i].items[j].className || "";
				innerText = items[i].items[j].innerText || "";
				innerHTML = items[i].items[j].innerHTML || "";
				if(tag == "img") {
					attributes = {
						src: btg.mainPlayer.photo,
						alt: btg.mainPlayer.nickname
					};
				} else {
					attributes = {
						id: items[i].items[j].name.replace("#", "")
					};
				}
				attributes.className = className;
				if(innerText != "")
					attributes.innerText = btg.mainPlayer[innerText];
				if(innerHTML != "")
					attributes.innerHTML = innerHTML;
				element.appendChild(UI._ui.makeDom(
					tag,
					attributes,
					UI.addPx(items[i].items[j].style),
					null
				));
				tag = "div";
			}
			UI.mainScene.leftTop.appendChild(element);
		}
		docfrag.appendChild(UI.mainScene.leftTop);
	};

	/**
	 * 右上角
	 */
	UI.mainScene.createRightTop = function(docfrag, html) {
		UI.mainScene.rightTop = UI._ui.makeDom(
			'div',
			{
				id:"rightTop"
			},
			UI.addPx(UI.mainScene.items.rightTop.style),
			null
		);
		var items = ui_config.mainScene[1].items;
		var element = null;
		for(var i = 0 ; i < items.length ; i++) {
			element = UI._ui.makeDom(
				"div",
				{
					id: items[i].name.replace("#", "")
				},
				UI.addPx(items[i].style),
				null
			);
			for(var j = 0 ; j < items[i].items.length ; j++) {
				element.appendChild(UI._ui.makeDom(
					"div",
					{
						id: items[i].items[j].name.replace("#", "")
					},
					UI.addPx(items[i].items[j].style),
					{
						click: function() {
							//UI.mainScene.hide();
							//UI.fightScene.createScene();
							btg.mainPlayer.goToFight();
						}
					}
				));
			}
			UI.mainScene.rightTop.appendChild(element);
		}
		docfrag.appendChild(UI.mainScene.rightTop);
	};

	/**
	 * 左下角
	 */
	UI.mainScene.createLeftBottom = function(docfrag, html) {
		UI.mainScene.leftBottom = UI._ui.makeDom(
			'div',
			{
				id:"leftBottom"
			},
			UI.addPx(UI.mainScene.items.leftBottom.style),
			null
		);
		var items = ui_config.mainScene[2].items;
		var element = null;
		var innerHTML = "";
		for(var i = 0 ; i < items.length ; i++) {
			element = UI._ui.makeDom(
				"div",
				{
					id: items[i].name.replace("#", "")
				},
				UI.addPx(items[i].style),
				null
			);
			for(var j = 0 ; j < items[i].items.length ; j++) {
				if(items[i].items[j].hasOwnProperty("innerHTML"))
					innerHTML = items[i].items[j].innerHTML;
				element.appendChild(UI._ui.makeDom(
					"div",
					{
						id: items[i].items[j].name.replace("#", ""),
						innerHTML: innerHTML
					},
					items[i].items[j].style,
					null
				));
				innerHTML = "";
			}
			UI.mainScene.leftBottom.appendChild(element);
		}
		docfrag.appendChild(UI.mainScene.leftBottom);
	};

	/**
	 * 右测中间位置
	 */
	UI.mainScene.createRightCenter = function(docfrag, html) {
		UI.mainScene.rightCenter = UI._ui.makeDom(
			'div',
			{
				id: "rightCenter"
			},
			UI.addPx(UI.mainScene.items.rightCenter.style),
			null
		);
		var items = ui_config.mainScene[3].items;
		for(var i = 0 ; i < items.length ; i++) {
			UI.mainScene.rightCenter.appendChild(UI._ui.makeDom(
				"div",
				{
					id: items[i].name.replace("#", ""),
					className: "rightCenter"
				},
				UI.addPx(items[i].style),
				null
			));
		}
		items = null;
		docfrag.appendChild(UI.mainScene.rightCenter);
	};

	/**
	 * 右下角
	 */
	UI.mainScene.createRightBottom = function(docfrag, html) {
		UI.mainScene.rightBottom = UI._ui.makeDom(
			'div',
			{
				id:"rightBottom"
			},
			UI.addPx(UI.mainScene.items.rightBottom.style),
			null
		);
		UI.mainScene.rightBottom.appendChild(UI._ui.makeDom(
			'div',
			{
				id:"menu"
			},
			{
				position: "absolute",
				background: "url(./res/ui/btn/menu.png)",
				width: "79px",
				height: "79px",
				top: "0px",
				left: "0px",
				"z-index": 100
			},
			{
				click: function(e) {
					var menu = "";
					for(var i = 0 ; i < UI.menus.length ; i++) {
						menu = UI.getDom("#menu_" + (i + 1));
						if(menu.className == "" || menu.className == "hide") {
							this.style.background = "url(./res/ui/btn/menu_h.png)";
							menu.className = "show";
						} else {
							this.style.background = "url(./res/ui/btn/menu.png)";
							menu.className = "hide";
						};
					}
				},
			}
		));
		var menuName = "";
		var ul = UI._ui.makeDom(
			'ul',
			{
				className: "items"
			},
			{
				
			},
			null
		);
		var dom = null;
		for(var i = 0 ; i < UI.menus.length ; i++) {
			menuName = UI.menus[i];
			dom = UI._ui.makeDom(
				'li',
				{
					id: "menu_" + (i + 1)
				},
				{
					position: "absolute",
					//left: -menu.width * i - 60 + "px",
					left: "0px",
					top: "0px",
					width: menu.width + "px",
					height: menu.width + "px",
					"background-image": "url(res/ui/btn/menuicon.png)",
					"background-position": "0px -" + menu.width * i + "px",
					"background-repeat": "no-repeat",
					//display: "none"
				},
				{
					click: function(e) {
						if(this.getAttribute("data-name") == "character") {
							UI.stopPropagation(e);
							UI.mainPlayerWindow = new UI.characterWindow();
							UI.loading(UI.mainPlayerWindow.createWindow, ui_resources.characterWindow, UI.mainPlayerWindow);
						}
						if(this.getAttribute("data-name") == "task") {
							UI.showTaskWindow();
						}
						if(this.getAttribute("data-name") == "package") {
							UI.packageWindow.showPackageWindow();
						}
						if(this.getAttribute("data-name") == "skill") {
							UI.skillWindow.showSkillWindow();
						}
						if(this.getAttribute("data-name") == "formation") {
							// UI.mainScene.hide();
							// UI.fightScene.createScene();
							UI.formationWindow.showFormationWindow();
						}
						if(this.getAttribute("data-name") == "pirateBoat") {
							UI.pirateBoatWindow.showPirateBoatWindow();
						}
					},
					mousedown: function(e) {
						var position = this.style.backgroundPosition.split(" ");
						this.style.backgroundPosition = position[0].replace("0", "-" + menu.width) + " " + position[1];
					},
					mouseup: function(e) {
						var position = this.style.backgroundPosition.split(" ");
						this.style.backgroundPosition = position[0].replace("-" + menu.width, "0") + " " + position[1];
					}
				}
			);
			dom.setAttribute("data-name", menuName);
			ul.appendChild(dom);
		}
		UI.mainScene.rightBottom.appendChild(ul);
		docfrag.appendChild(UI.mainScene.rightBottom);
	};
	
	/**
	 * 通知栏
	 */
	UI.mainScene.createMarquee = function(docfrag, html) {
		UI.mainScene.marquee = UI._ui.makeDom(
			'div',
			{
				id: "marquee",
				className: UI.mainScene.items.marquee.className || ""
			},
			UI.mainScene.items.marquee.style,
			{
				click: function(e) {
					UI.mainScene.hide();
					UI.loading(UI.casinoScene.init, ui_resources.casinoScene);
				}
			}
		);
		var items = ui_config.mainScene[5].items;
		var text = "你知道的我知道你知道的我都知道";
		var style = {};
		for(var i = 0 ; i < items.length ; i++) {
			style = items[i].style;
			style.width = text.length * 14 + text.length * 4 + "px";
			UI.mainScene.marquee.appendChild(UI._ui.makeDom(
				"div",
				{
					id: items[i].name.replace("#", ""),
					innerHTML: text
				},
				style,
				null
			));
		}
		UI.mainScene.count = 0;
		items = null;
		docfrag.appendChild(UI.mainScene.marquee);
	};
	
	/**
	 * marquee
	 */
	UI.mainScene.doMarquee = function() {
		var dom = UI.getDom("#marquee_message");
		if(UI.mainScene.count <= -519 - dom.clientWidth) {
			clearTimeout(UI.mainScene.timer);
			return;
		}
		UI.mainScene.count -= 3;
		var left = UI.mainScene.count + "px";
		var top = dom.style.top;
		dom.style.webkitTransform = "translate3d(" + left + "," + top + ",0px)";
		UI.mainScene.timer = setTimeout(UI.mainScene.doMarquee, 100);
	}

	/**
	 * 显示主場景UI
	 */
	UI.mainScene.show = function() {
		for(var i = 0 ; i < ui_config.mainScene.length ; i++) {
			UI.show(UI.getDom("#" + ui_config.mainScene[i].name));
		}
	};

	/**
	 * 隱藏主場景UI
	 */
	UI.mainScene.hide = function() {
		for(var i = 0 ; i < ui_config.mainScene.length ; i++) {
			UI.hide(UI.getDom("#" + ui_config.mainScene[i].name));
		}
	};
	
	/**
	 * 设置当前玩家的经验值，并调整精灵条的显示
	 */
	UI.mainScene.setExp = function(){
		UI.getDom('#currentExp').innerHTML = btg.mainPlayer.currentExp;
		UI.getDom('#needExp').innerHTML = btg.mainPlayer.needExp;
		UI.getDom('#experience_progress').style.width = (btg.mainPlayer.currentExp / btg.mainPlayer.needExp * 164) + 'px';
	};
})(window.UI, smartlib);