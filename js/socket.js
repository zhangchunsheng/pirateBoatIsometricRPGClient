/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-02-22
 * Description: 服務器數據處理
 */
(function(btg) {
	btg.game_socket = {
		host: "222.126.242.105",
		port: 7002,
		connect: null
	};
	btg.talk_socket = {
		host: "222.126.242.105",
		port: 7002,
		connect: null
	};
	btg.uc_socket = {
		host: "222.126.242.105",
		port: 7002,
		connect: null
	};
	btg.socket = {
		host: "222.126.242.105",
		port: 7002,
		timer: null,
		loaded: false,
		status: {
			OK: 200
		}
	};
	btg.position_timer = null;
	
	btg.initSocket = function() {
		try {
            btg.eventManager.fireEvent('socket.loading');
			var head = document.getElementsByTagName("head");
			var script = document.createElement("script");
			script.id = "socket";
			script.type = "text/javascript";
			script.src = "http://" + btg.socket.host + ":" + btg.socket.port + "/socket.io/socket.io.js";
			if(head[0].children[head[0].children.length - 1].id == "socket") {
				head[0].removeChild(head[0].lastChild);
			}
			head[0].appendChild(script);
			btg.socket.timer = setTimeout(btg.socket.load, 3000);
			script.onload = function() {
                console.log("load");
				me.loader.preload(g_resources);
				btg.socket.loaded = true;
				clearTimeout(btg.socket.timer);
                btg.eventManager.fireEvent('socket.connecting');
				btg.game_socket.connect = io.connect("http://" + btg.game_socket.host + ":" + btg.game_socket.port + "");
				btg.talk_socket.connect = io.connect("http://" + btg.talk_socket.host + ":" + btg.talk_socket.port + "");
				btg.game_socket.bind();
				btg.talk_socket.bind();
				btg.game_socket.getCharacterInfo();
				btg.eventManager.fireEvent('socket.connected');
			}
		} catch(e) {
            console.log(e, e.stack);
            btg.eventManager.fireEvent('socket.disconnect');
		}
	};
	
	btg.socket.load = function() {
        btg.eventManager.fireEvent('socket.reconnecting');
	};
	
	btg.createMainPlayer = function(mainPlayer) {
		//btg.game_socket.connect.emit('logon', mainPlayer.pos);
	};
	
	btg.socket.bind = function() {
		btg.socket.connect.on("connect", function() {
			console.log("socket connect");
		});
		btg.socket.connect.on("serverList", function(serverList) {
			console.log(serverList);
		});
	};
	
	btg.uc_socket.bind = function() {
		btg.uc_socket.connect.on("connect", function() {
			console.log("uc_socket connect");
		});
		btg.uc_socket.connect.on("1002", function(result) {
			console.log(result);
			if(result.status == "200") {
				localStorage.setItem("registerType", result.registerType);
				localStorage.setItem("loginName", result.loginName);
				localStorage.setItem("userId", result.userId);
				localStorage.setItem("sessionId", result.sessionId);
			}
		});
		btg.uc_socket.connect.on("1004", function(result) {
			console.log(result);
			if(result.status == "200") {
				localStorage.setItem("registerType", result.registerType);
				localStorage.setItem("loginName", result.loginName);
				localStorage.setItem("userId", result.userId);
				localStorage.setItem("sessionId", result.sessionId);
			}
		});
		btg.uc_socket.connect.on("1006", function(result) {
			console.log(result);
			if(result.status == "200") {
				localStorage.setItem("registerType", result.registerType);
				localStorage.setItem("loginName", result.loginName);
				localStorage.setItem("userId", result.userId);
				localStorage.setItem("sessionId", result.sessionId);
			}
		});
		btg.uc_socket.connect.on("1602", function(result) {
			console.log(result);
		});
	};
	
	btg.game_socket.bind = function() {
		btg.game_socket.connect.on('connect', function () {
			console.log("connect");
		});
		btg.game_socket.connect.on('players', function (players) {
			console.log("players: " + players);

			players.forEach(addPlayer);

			function sendPosition() {
				btg.game_socket.connect.emit('move', btg.mainPlayer.pos);
				btg.position_timer = setTimeout(sendPosition, 200);
			}

			// We're connected and have sent out initial position, start sending out updates
			btg.position_timer = setTimeout(sendPosition, 200);
		});

		btg.game_socket.connect.on('moved', function (mainPlayer) {
			// console.log("moved: " + mainPlayer.id + " " + mainPlayer.x + "," + mainPlayer.y);
			var character = btg.otherPlayers[mainPlayer.id]
			if (character) {
				character.destinationX = mainPlayer.x;
				character.destinationY = mainPlayer.y;
			}
		});

		btg.game_socket.connect.on('connected', function (mainPlayer) {
			console.log("connected: " + mainPlayer);
			addPlayer(mainPlayer);
		});

		btg.game_socket.connect.on('disconnected', function (mainPlayer) {
			console.log("disconnected: " + mainPlayer);
			// TODO: Figure out how to remove characters from the map
			var character = btg.otherPlayers[mainPlayer.id];
			me.game.remove(character);
			delete btg.otherPlayers[mainPlayer.id];
		});
		
		/**
		 * 创建角色
		 */
		btg.game_socket.connect.on("1008", function(result) {
			console.log(result);
		});
		
		/**
		 * 获得角色信息
		 */
		btg.game_socket.connect.on("1010", function(result) {
			console.log(result);
			btg.character = {
				/**
				 * 角色屬性
				 */
				id: 0,							//角色Id
				cId: 0,							//所选角色
				level: 1,						//角色等级
				nickname: "水神",				//角色名称
				maxEnergy: 0,					//精力上限
				energy: 0,						//当前精力值
				getEnergySpeed: 0,				//精力回复速度,表示每小时回复的精力数目
				speed: 0,						//移动速度
				lucky: 0,						//幸运
				life: 100,						//耐久,生命值
				powerful: 0,					//影响攻击出手先后
				attack: 0,						//普通攻击伤害
				skillHurt: 0,					//技能攻击伤害
				weaponDef: 0,					//物理防御,对物理类型攻击的减免
				fireDef: 0,						//火焰防御,对火焰类型攻击的减免
				crit: 0,						//暴击,暴击几率和暴击之后造成的额外伤害
				parry: 0,						//格挡,格挡几率和格挡之后减免的额外伤害
				hit: 0,							//命中,命中和暴击的几率
				dodge: 0,						//闪避,闪避和格挡的几率
				currentExp: 100,				//玩家在当前等级获取的经验值
				needExp: 100,					//玩家升到下一级所需要的经验值
				photo: './res/ui/ci/0/0_photo.png',
				money: 0,
				gameCurrency: 0
			};
			if(result.status == btg.socket.status.OK) {
				for(var i in result) {
					if(i == "status")
						continue;
					btg.character[i] = result[i];
				}
				//UI.initMainScene();
			}
			//btg.mainPlayer = btg.character;
			console.log(btg.character);
		});
		
		/**
		 * 任务系统
		 */
		btg.game_socket.connect.on("1302", function(result) {
			console.log(result);
			if(result.status == btg.socket.status.OK) {
				UI.taskWindow.fillData(result.taskInfo);
			}
		});
	};
	
	btg.talk_socket.bind = function() {
		/**
		 * 在世界聊天
		 */
		btg.talk_socket.connect.on("1602", function(result) {
			if(result.status == 200) {
				var message = [[
					"test",
					result.message
				]];
				UI.chat.addMsg(message);
			}
		});
	};
	

	btg.talkToWorld = function() {
		var registerType = 1;
		var loginName = "test";
		var userId = 100006;
		var sessionId = "1D74C6CE3A8DB50E6B4A2410E6E37D19";
		var serverId = 1;
		var message = "hello world!";
		var lang = "zh_CN";
		var data = {
			registerType: registerType,
			loginName: loginName,
			userId: userId,
			sessionId: sessionId,
			serverId: serverId,
			message: message,
			lang: lang
		};
		UI.chat.addMsg([[loginName, message]]);
		btg.talk_socket.connect.emit("1601", data);
	};
	
	/**
	 * 获得服务器列表
	 */
	btg.socket.getServerList = function() {
		socket.emit("getServerList");
	}
	
	/**
	 * 注册
	 */
	btg.uc_socket.register = function(loginName, password) {
		var registerType = 1;
		var data = {
			registerType: registerType,
			loginName: loginName,
			password: hex_md5(password)
		};
		console.log(data);
		btg.uc_socket.emit("1001", data);
	};
	
	/**
	 * 登录
	 */
	btg.uc_socket.login = function(loginName, password) {
		var registerType = 1;
		var data = {
			registerType: registerType,
			loginName: loginName,
			password: hex_md5(password)
		};
		console.log(data);
		btg.uc_socket.emit("1003", data);
	};
	
	/**
	 * 保持登录
	 */
	btg.uc_socket.loginBySessionId = function() {
		var registerType = 1;
		var loginName = "wozlla";
		var userId = 100001;
		var sessionId = "29197A14BA49DDFCDA3C48559E413ADF";
		var data = {
			registerType: registerType,
			loginName: loginName,
			userId: userId,
			sessionId: sessionId
		};
		console.log(data);
		uc_socket.emit("1005", data);
	};
	
	/**
	 * 获得用户信息
	 */
	btg.uc_socket.getUserInfo = function() {
		var userInfo = {
			registerType: 1,
			loginName: "wozlla",
			userId: 100001,
			sessionId: "29197A14BA49DDFCDA3C48559E413ADF",
			serverId: 1,
			lang: "zh_CN"
		}
		return userInfo;
	};
	
	/**
	 * 创建角色
	 */
	btg.game_socket.createCharacter = function() {
		var userInfo = btg.uc_socket.getUserInfo();
		var data = userInfo;
		data.characterId = 1;
		data.sex = 1;
		data.nickName = "";
		console.log(data);
		btg.game_socket.connect.emit("1007", data);
	};
	
	/**
	 * 获得角色信息
	 */
	btg.game_socket.getCharacterInfo = function() {
		var userInfo = btg.uc_socket.getUserInfo();
		var data = userInfo;
		console.log(data);
		btg.game_socket.connect.emit("1009", data);
	};
	
	/**
	 * 获得当前任务信息
	 */
	btg.game_socket.getCurrentTaskInfo = function() {
		var userInfo = btg.uc_socket.getUserInfo();
		var data = userInfo;
		data.type = 2;
		console.log(data);
		btg.game_socket.connect.emit("1301", data);
	};
	
	/**
	 * 获得任务信息
	 */
	btg.game_socket.getTaskInfo = function(taskId) {
		var userInfo = btg.uc_socket.getUserInfo();
		var data = userInfo;
		data.type = 1;
		data.taskId = taskId;
		btg.game_socket.connect.emit("1301", data);
	};
})(btg);