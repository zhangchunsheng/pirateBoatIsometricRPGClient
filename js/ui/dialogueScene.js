/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Modify: Peter Zhang
 * Date: 2013-02-28
 * Description: NPC对话框
 */
(function(UI, lib) {
	UI.DialogueScene = function(data) {
		this.w = {};
		this.dom = {};
		this.currentTalk = 0;
		this.data = JSON.parse(data).talks;//stringify
		console.log(this.data);
		this.element = {};
		this.who = "npc";//npc player
	};
	
	UI.DialogueScene.prototype = {
		/**
		 * 初始化NPC对话框
		 */
		init: function() {
			that = this;
			this.dom = UI._ui.makeDom(
				'div',
				{
					id:"dialogueScene"
				},
				UI.addPx(ui_config.dialogueScene[0].style),
				null
			);
			var docfrag = document.createDocumentFragment();

			var _id = "";
			//插入节点元素
			for(var i = 0 ; i < ui_config.dialogueScene.length ; i++) {
				for(var j = 0 ; j < ui_config.dialogueScene[i].items.length ; j++) {
					_id = ui_config.dialogueScene[i].items[j].name;
					this.element[_id] = UI._ui.makeDom(
						'div',
						{
							id: _id
						},
						ui_config.dialogueScene[i].items[j].style,
						null
					);
					docfrag.appendChild(this.element[_id]);
				};
			};

			this.dom.appendChild(docfrag);
			this.w.dom = this.dom;

			this.element['dialogue-next'].style.backgroundImage = 'url(./res/ui/font/'+ UI.lang +'/next.png)'

			UI.mainDiv.appendChild(this.dom);

			UI.windowManager.push(this);
			
			this.say();

			UI.bind('#dialogue-next', 'click', function(e){
				UI.stopPropagation(e);
				that.say();
			});
		},
		
		setData: function(data) {
			this.data = data;
		},
		
		say: function() {
			if(this.who == "npc") {
				this.npcTalk();
				this.who = "player";
			} else {
				this.playerTalk();
				this.who = "npc";
			}
		},
		
		/**
		 * npc说话
		 */
		npcTalk: function() {
			if(this.currentTalk < this.data.length) {
				this.element['dialogue-name'].innerHTML = this.data[this.currentTalk].npcId;
				this.element['dialogue-content'].innerHTML = this.data[this.currentTalk].npc;
				this.element['dialogue-bust'].style.backgroundImage = 'url(./res/ui/ci/0/0_bust.png)';
			} else {
				btg.mainPlayer.goToInstanceDungeon();
				this.destroy();
			}
		},
		
		/**
		 * player说话
		 */
		playerTalk: function() {
			if(this.currentTalk < this.data.length) {
				this.element['dialogue-name'].innerHTML = btg.mainPlayer.nickname;
				this.element['dialogue-content'].innerHTML = this.data[this.currentTalk].player;
				this.element['dialogue-bust'].style.backgroundImage = 'url(./res/ui/ci/' + btg.mainPlayer.cId + '/' + btg.mainPlayer.cId + '_bust.png)';
				this.currentTalk++;
			} else {
				btg.mainPlayer.goToInstanceDungeon();
				this.destroy();
			}
		},
		
		/**
		 * 删除对话框
		 */
		destroy: function() {
			UI.mainDiv.removeChild(this.dom);
		},
		
		/**
		 * 定位dialogueScene(居中)
		 */
		reflowPosition: function () {	
			if(ui_config.dialogueScene[0].style.hasOwnProperty('top')) {
				this.dom.style.top = (parseInt(ui_config.dialogueScene[0].style.top) + UI.offset.top) + 'px';
			}
			if(ui_config.dialogueScene[0].style.hasOwnProperty('left')) {
				this.dom.style.left = (parseInt(ui_config.dialogueScene[0].style.left) + UI.offset.left) + 'px';
			}
		}
	};

	/**
	 * 綁定事件
	 */
	UI.DialogueScene.bindEvent = function() {
		UI.bind('#nearby', 'click', function(e){
			UI.stopPropagation(e);
			var dialogueScene = new UI.DialogueScene(btg.mainPlayer.currentMainTask.taskTalk);
			dialogueScene.init();
		});
	}
})(window.UI, smartlib);