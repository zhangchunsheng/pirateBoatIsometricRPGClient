/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-02-28
 * Description: NPC对话框
 */
(function(UI, lib) {

	UI.dialogueWindow = {};

	//记录当前的对话进行到第几组
	UI.dialogueWindow.currentDialogueFrame = -1;

	var dialogueData = [{
		speakerName: '约翰尼德普',
		speakerImg: './res/ui/ci/1/1_bust.png',
		scripts : '到这里真不容易啊'
	}, {
		speakerName: '神秘小女孩',
		speakerImg: './res/ui/ci/0/0_bust.png',
		scripts : '是啊，一路辛苦'
	}, {
		scripts : '我再说一句'
	}, {
		scripts : '再点就结束了！'
	}];

	/**
	 * 初始化NPC对话框
	 */
	UI.dialogueWindow.initDialogueWindow = function () {

		UI.dialogueWindow.currentDialogueFrame = -1;

		var docfrag = document.createDocumentFragment();

		UI.dialogueWindow.dom = document.createElement('div');
		UI.dialogueWindow.dom.className = 'scene';

		//插入节点元素
		for (var j = dialogueWindow.length - 1; j >= 0; j--) {
			for (var i = dialogueWindow[j].items.length - 1, _name; i >= 0; i--) {
				_name = dialogueWindow[j].items[i].name;
				UI.dialogueWindow[_name] = UI._ui.makeDom(
					'div',
					{
						id: _name
					},
					dialogueWindow[j].items[i].style,
					null
				);
				docfrag.appendChild(UI.dialogueWindow[_name]);
			};
		};

		UI.dialogueWindow.changeDialogue(dialogueData);

		UI.dialogueWindow.dom.appendChild(docfrag);
		docfrag = null;

		UI.dialogueWindow['next'].style.backgroundImage = 'url(./res/ui/font/'+ UI.lang +'/next.png)'

		UI.mainDiv.appendChild(UI.dialogueWindow.dom);

		UI.windowManager.push(UI.dialogueWindow);

		UI.bind('#next', 'click', function(e){
			UI.stopPropagation(e);
			UI.dialogueWindow.changeDialogue(dialogueData);
		});
	}

	/**
	 * 更新对话框内容
	 * @param  {Object} dialogueData 剧本
	 */
	UI.dialogueWindow.changeDialogue = function (dialogueData) {
		var i = ++UI.dialogueWindow.currentDialogueFrame;
		if (i < dialogueData.length) {
			dialogueData[i].speakerName && (UI.dialogueWindow['speaker-name'].innerHTML = dialogueData[i].speakerName);
			dialogueData[i].scripts && (UI.dialogueWindow['scripts'].innerHTML = dialogueData[i].scripts);
			dialogueData[i].speakerImg && (UI.dialogueWindow['bust'].style.backgroundImage = 'url('+ dialogueData[i].speakerImg + ')');
		} else {
			UI.dialogueWindow.hideDialogueWindow();
		}
		i = null;
	}

	/**
	 * 定位dialogueWindow(居中)
	 */
	UI.dialogueWindow.reflowPosition = function () {	
		for (var i = dialogueWindow.length - 1, elet; i >= 0; i--) {
			for (var j = dialogueWindow[i].items.length - 1; j >= 0; j--) {

				elet = UI.dialogueWindow[dialogueWindow[i].items[j].name];

				if(dialogueWindow[i].items[j].style.hasOwnProperty('top')) {
					elet.style.top = (parseInt(dialogueWindow[i].items[j].style.top) + UI.offset.top) + 'px';
				}
				if(dialogueWindow[i].items[j].style.hasOwnProperty('left')) {
					elet.style.left = (parseInt(dialogueWindow[i].items[j].style.left) + UI.offset.left) + 'px';
				}
			};
		};
	}


	/**
	 * 显示NPC对话框
	 */
	UI.dialogueWindow.showDialogueWindow = function() {
		if (!UI.dialogueWindow.dom) {
			UI.dialogueWindow.initDialogueWindow();
		}
		UI.dialogueWindow.currentDialogueFrame = -1;
		UI.dialogueWindow.changeDialogue(dialogueData);
		UI.display(UI.dialogueWindow.dom, true);
	}

	/**
	 * 隐藏NPC对话框
	 */
	UI.dialogueWindow.hideDialogueWindow = function() {
		UI.display(UI.dialogueWindow.dom, false);
	}

	/**
	 * 綁定事件
	 */
	UI.dialogueWindow.bindEvent = function() {
		UI.bind('#nearby', 'click', function(e){
			UI.stopPropagation(e);
			UI.dialogueWindow.showDialogueWindow();
		});
	}
})(window.UI, smartlib);