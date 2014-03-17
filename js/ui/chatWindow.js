/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-02-26
 * Description: 聊天窗口
 */
(function(UI, lib) {
	UI.chat = {};
	UI.chatWindow = {};
	UI.chatWindow.currentState = 1;//1 - btn 2 - chatMessage 3 - chatRoom
	UI.chatWindow.state = {
		BTN: 1,
		CHATMESSAGE: 2,
		CHATROOM: 3
	};
	/**
	 * 显示聊天页面
	 */
	UI.showChatWindow = function(state) {
		if(state == UI.chatWindow.state.CHATROOM) {
			var chatRoom = UI.getDom('#chatRoom');
			var chatMessageDiv = UI.getDom('#chatMessageDiv');
			var chatInputDiv = UI.getDom('#chat-input-div');
			var chatWindowCloseBtn = UI.getDom('#chatWindow-close-btn');
			UI.show(chatRoom);
			UI.hide(chatMessageDiv);
			UI.display(chatInputDiv, true);
			UI.display(
				[
					UI.mainScene.leftTop,
					UI.mainScene.rightTop,
					UI.mainScene.rightCenter,
					UI.mainScene.rightBottom
				],
				false);
			chatRoom.className = 'blackbg';
			UI.animate(chatRoom, {
				'height': '403px',
				'width': '881px',
				'top': '-419px',
				'left': "32px"
			}, UI.sys.fps, function() {
				UI.display(chatWindowCloseBtn, true);
			});
			UI.animate(chatInputDiv, {
				'width': '801px'
			}, UI.sys.fps);
		} else {
			var chatBtnDiv = UI.getDom('#chatBtnDiv');
			var chatMessageDiv = UI.getDom('#chatMessageDiv');
			var chatMessage = UI.getDom('#chatMessage');
			UI.show(chatMessageDiv);
			UI.hide(chatBtnDiv);
			UI.animate(chatMessage, {
				'height': '104px',
				'width': '290px',
				'top': '0px'
			}, UI.sys.fps, function() {
				
			});
		}
	};

	/**
	 * 关闭聊天窗口
	 */
	UI.closeChatWindow = function(state) {
		if(state == UI.chatWindow.state.CHATMESSAGE) {
			var chatRoom = UI.getDom('#chatRoom');
			var chatMessageDiv = UI.getDom('#chatMessageDiv');
			var chatInputDiv = UI.getDom('#chat-input-div');
			var chatWindowCloseBtn = UI.getDom('#chatWindow-close-btn');
			UI.display(
				[
					chatInputDiv,
					chatWindowCloseBtn
				],
				false);
			UI.display(
				[
					UI.mainScene.leftTop,
					UI.mainScene.rightTop,
					UI.mainScene.rightCenter,
					UI.mainScene.rightBottom
				],
				true);
			UI.animate(chatRoom, {
				'height': UI.getDom("#chatMessage").style.height,
				'width': UI.getDom("#chatMessage").style.width,
				'top': UI.getDom("#chatMessage").style.top
			}, UI.sys.fps, function() {
				UI.hide(chatRoom);
				UI.show(chatMessageDiv);
			});
		} else {
			var chatBtnDiv = UI.getDom('#chatBtnDiv');
			var chatMessageDiv = UI.getDom('#chatMessageDiv');
			var chatMessage = UI.getDom('#chatMessage');
			UI.animate(chatMessage, {
				'height': '0px',
				'width': '0px',
				'top': '100px'
			}, UI.sys.fps, function() {
				UI.hide(chatMessageDiv);
				UI.show(chatBtnDiv);
			});
		}
	};

	/**
	 * 添加聊天信息
	 * @param {array} obj 信息详情
	 */
	UI.chat.addMsg = function(obj){
		var array = [];
		for(var i = 0; i < obj.length; i++){
			array.push('<p><span class="nickname">'+ obj[i][0] +':</span><span class="chatMessage">'+ obj[i][1] +'</span></p>');
		}
		UI.getDom('#chatContent').innerHTML += array.join('');
		array = null;
	};

	/**
	 * 綁定事件
	 */
	UI.chatWindow.bindEvent = function() {
		UI.bind('#chatMessageRight', 'click', function(e) {
			UI.stopPropagation(e);
			UI.closeChatWindow(UI.chatWindow.state.BTN);
		}, 0);
		
		UI.bind('#chatMessage', 'click', function(e) {
			UI.stopPropagation(e);
			UI.showChatWindow(UI.chatWindow.state.CHATROOM);
		});
		
		UI.bind('#chatBtn', 'click', function(e) {
			UI.stopPropagation(e);
			UI.showChatWindow(UI.chatWindow.state.CHATMESSAGE);
		});

		UI.bind('#chatWindow-close-btn', 'click', function(e) {
			UI.stopPropagation(e);
			UI.closeChatWindow(UI.chatWindow.state.CHATMESSAGE);
		});

		UI.bind("#chat-submit", "click", function(e) {
			btg.talkToWorld();
		});
	}
})(window.UI, smartlib);