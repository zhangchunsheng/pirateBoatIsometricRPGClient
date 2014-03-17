/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-02-19
 * Description: UI配置文件
 */
var ui_config = {};

var mainScene = [{
	id: 0,
	name: 'leftTop',
	style: {
		position: "absolute",
		left: 0,
		top: 0
	},
	items: [{
		name: 'mainPlayer_photo',
		style: {
			left: 10,
			top: 10,
			height: 74,
			width: 74
		},
		items: [{
			tag: "img"
		}]
	}, {
		name: 'mainPlayer',
		style: {
			height: 107,
			width: 260,
			left: 0,
			top: 0
		},
		items: [{
			name: 'nickname',
			className: "nickname",
			innerText: "nickname",
			style: {
				height: 33,
				width: 165,
				top: 6,
				right: 5
			}
		}, {
			name: 'experience_progress',
			style: {
				height: 19,
				width: 164
			}
		}, {
			name: 'exp',
			className: "number exp",
			innerHTML: '<span id="currentExp"></span>/<span id="needExp"></span>',
			style: {

			}
		}, {
			name: 'level',
			innerText: "level",
			style: {
				
			}
		}, {
			name: 'money',
			className: "number money",
			innerText: "money",
			style: {
				
			}
		}, {
			name: 'gameCurrency',
			className: "number gameCurrency",
			innerText: "gameCurrency",
			style: {
				
			}
		}]
	}, {
		name: 'recharge',
		bgName: "recharge",
		style: {
			top: 30,
			left: 270
		},
		items: []
	}]
}, {
	id: 1,
	name: 'rightTop',
	style: {
		position: "absolute",
		left: 796,
		top: 0
	},
	items: [{
		name: 'rightTopBG',
		style: {
			height: 154,
			width: 163,
			left: 0,
			top: 0
		},
		items: [{
			name: 'map',
			style: {
				height: 75,
				width: 75,
				top: 14,
				right: 15
			}
		}, {
			name: 'postMessage',
			style: {
				height: 64,
				width: 54,
				bottom: 0,
				right: 11
			}
		}, {
			name: 'assistant',
			style: {
				height: 67,
				width: 62,
				top: 7,
				right: 93
			}
		}]
	}]
}, {
	id: 2,
	name: 'leftBottom',
	style: {
		position: "absolute",
		left: 5,
		top: 528
	},
	items: [{
		name: "chatBtnDiv",
		style: {
		},
		items: [{
			name: "chatBtn",
			style: {
				left: "-10px",
				top: "30px",
				width: "90px",
				height: "88px"
			}
		}]
	}, {
		name: "chatMessageDiv",
		style: {
			display: "none"
		},
		items: [{
			name: "chatMessage",
			style: {
				height: "0px",
				width: "0px",
				top: "100px",
				left: "0px",
				radius: 5,
				border: "2px solid black",
				background: "-webkit-linear-gradient(top, #333333, #181818)",
				position: "absolute",
				overflow: "hidden"
			}
		}, {
			name: 'chatMessageRight',
			style: {
				background: "url(./res/ui/btn/chat_arrow.png)",
				top: "2px",
				left: "270px",
				height: "104px",
				width: "21px",
				position: "absolute",
				"z-index": 258,
			}
		}]
	}, {
		name: "chatRoomDiv",
		style: {
		},
		items: [{
			name: 'chatRoom',
			innerHTML: '<div id="chatContent" style="width: 100%"></div>',
			style: {
				height: "104px",
				width: "280px",
				top: "0px",
				left: "0px",
				display: "none"
			}
		}, {
			name: 'chat-input-div',
			innerHTML: '<input id="chatInputMessage" style="height: 53px;width: 692px"/>\
						<div id="chat-submit" class="btn" style="height: 80px;width: 128px">发&nbsp;送</div>',
			style: {
				height: "53px",
				width: "801px",
				top: "-98px",
				left: "72px",
				display: "none"
			}
		}, {
			name: 'chatWindow-close-btn',
			style: {
				top: "-444px",
				left: "887px",
				display: "none"
			}
		}]
	}]
}, {
	id: 3,
	name: 'rightCenter',
	style: {
		position: "absolute",
		left: 880,
		top: 224
	},
	items: [{
		name: 'task',
		style: {
			height: 116,
			width: 80,
			left: 0,
			top: 0
		}
	}, {
		name: 'nearby',
		style: {
			height: 116,
			width: 80,
			left: 0,
			top: 116
		}
	}]
}, {
	id: 4,
	name: "rightBottom",
	style: {
		position: "absolute",
		width: 79,
		height: 79,
		top: 561,
		left: 880,
		
	},
	items: [{
		name: "menu",
		style: {
			
		}
	}]
}, {
	id: 5,
	name: "marquee",
	style: {
		position: "absolute",
		left: "227px",
		top: "115px",
		width: "519px",
		height: "23px",
		"z-index": 101,
		overflow: "hidden"
	},
	className: "marquee",
	items: [{
		name: "marquee_message",
		style: {
			position: "absolute",
			left: "519px",
			top: "0px",
			"font-weight": "normal",
			"letter-spacing": "4px",
			"text-align": "left",
			"font-size": "14px",
			"word-break": "break-all",
			float: "left",
			color: "yellow",
			"z-index": 100,
			overflow: "hidden"
		}
	}]
}];

var fightScene = [{
	id: 0,
	name: "top",
	style: {
		position: "absolute",
		left: "0px",
		top: "0px"
	},
	items: [{
		name: "topBG",
		style: {
			position: "absolute",
			left: "0px",
			top: "0px",
			height: "62px",
			width: "960px",
			background: "url(./res/ui/layout/f/fi_top_bg.png)"
		}
	}, {
		name: "titile",
		style: {
			position: "absolute",
			top: "12px",
			left: "450px",
			height: "27px",
			width: "75px",
			background: "url(./res/ui/font/zh_CN/rounds.png) no-repeat"
		}
	}, {
		name: "round_left",
		className: "fight-round-num",
		innerText: "0",
		style: {
			top: "15px",
			left: "385px"
		}
	}, {
		name: "round_right",
		className: "fight-round-num",
		innerText: "0",
		style: {
			top: "15px",
			left: "565px"
		}
	}]
}, {
	id: 1,
	name: "leftCharacter",
	style: {
		position: "absolute",
		top: "60px",
		left: "10px",
		width: "50px"
	},
	items: [{
		name: "l_cr1",
		className: "fight-character-bg",
		style: {
			width: 50,
			height: 50,
			top: 0,
			left: 0,
			"margin-bottom": 10
		}
	}]
}, {
	id: 2,
	name: "rightCharacter",
	style: {
		position: "absolute",
		top: "60px",
		left: "900px",
		width: "50px"
	},
	items: [{
		name: "r_cr1",
		className: "fight-character-bg",
		style: {
			width: 50,
			height: 50,
			top: 0,
			left: 0,
			"margin-bottom": 10
		}
	}]
}, {
	id: 3,
	name: "rightBottom",
	style: {
		position: "absolute",
		left: "832px",
		top: "560px"
	},
	items: [{
		name: "skipBattle",
		className: "skipBattle",
		style: {
			left: "0px",
			top: "0px"
		}
	}]
}];

var casinoScene = [{
	name: 'leftTop',
	style: {
		position: "absolute",
		top: "5px",
		left: "5px"
	},
	items: [{
		name: 'player-bg',
		style: {
			position: 'absolute',
			width: '226px',
			height: '83px',
			top: '0px',
			left: '0px',
			background: 'url(./res/ui/layout/g/casino_photoleft_bg.png)'
		}
	}, {
		name: 'player-photo',
		style: {
			position: 'absolute',
			width: '74px',
			height: '74px',
			'border-radius': '37px',
			overflow: 'hidden',
			top: '4px',
			left: '4px'
		}
	}, {
		name: 'player-money',
		style: {
			position: 'absolute',
			top: '9px',
			left: '100px',
			width: "128px",
			color: '#FFFFFF',
			'font-size': '14px',
			'text-shadow': '0 0 3px #000000'
		}
	}, {
		name: 'player-stake',
		style: {
			position: 'absolute',
			top: '48px',
			left: '90px',
			width: "128px",
			color: '#febb11',
			'font-size': '14px',
			'text-shadow': '0 0 3px #000000'
		}
	}]
}, {
	name: 'rightTop',
	style: {
		position: "absolute",
		top: "5px",
		left: "730px"
	},
	items: [{
		name: 'boss-bg',
		style: {
			position: 'absolute',
			width: '226px',
			height: '83px',
			top: '0px',
			left: '0px',
			background: 'url(./res/ui/layout/g/casino_photoright_bg.png)'
		}
	}, {
		name: 'boss-photo',
		style: {
			position: 'absolute',
			width: '74px',
			height: '74px',
			'border-radius': '37px',
			overflow: 'hidden',
			top: '4px',
			left: '149px',
			background: 'url(./res/ui/ci/0/0_photo.png)'
		}
	}, {
		name: 'boss-name',
		innerHTML: "赌场老板",
		style: {
			position: 'absolute',
			top: '9px',
			left: '50px',
			width: "128px",
			color: '#FFFFFF',
			'font-size': '14px',
			'text-shadow': '0 0 3px #000000'
		}
	}, {
		name: 'boss-stake',
		innerHTML: "赌注物品：1",
		style: {
			position: 'absolute',
			top: '48px',
			left: '40px',
			width: "128px",
			color: '#febb11',
			'font-size': '14px',
			'text-shadow': '0 0 3px #000000'
		}
	}]
}, {
	name: 'topCenter',
	style: {
		position: "absolute",
		left: "440px",
		top: "40px"
	},
	items: [{
		name: 'casino-stake',
		style: {
			width: '70px',
			height: '70px',
			top: '0px',
			left: '0px'
		}
	}, {
		name: 'casino-stake-picture',
		style: {
			width: '68px',
			height: '68px',
			top: '2px',
			left: '2px'
		}
	}, {
		name: 'rb',
		style: {
			width: '20px',
			height: '20px',
			top: '56px',
			left: '56px'
		}
	}, {
		name: 'casino-stake-name',
		style: {
			height: '21px',
			width: '144px',
			top: '80px',
			left: '-32px'
		}
	}]
}, {
	name: 'bottom',
	style: {
		position: "absolute",
		left: "238px",
		top: "563px"
	},
	items: [{
		name: 'add-stake',
		className: 'casino-btn',
		innerHTML: '增加1000赌金',
		style: {
			left: '0px',
			top: '0px',
			height: '77px',
			width: '218px'
		}
	}, {
		name: 'casino-btn',
		className: 'casino-btn',
		innerHTML: '小试一把',
		style: {
			left: '280px',
			top: '0px',
			height: '77px',
			width: '218px'
		}
	}]
}, {
	name: "table",
	style: {
		position: "absolute",
		background: "green",
		left: "280px",
		top: "200px",
		width: "400px",
		height: "300px"
	},
	items: []
}];

var taskWindow = [{
	name: 'taskWindow',
	style: {
		display: 'none',
		width: '363px',
		height: '467px',
		top: '50px',
		right: '288px'
	},
	items: [{
		name: 'task-content-holder',
		style: {
			height: '90px',
			width: '300px',
			left: '30px',
			position: 'absolute'
		}
	}, {
		name: 'submit-btn',
		style: {
			height: '60px',
			width: '108px',
			top: '38px',
			right: '5px',
			position: 'absolute',
			'line-height': '60px',
			'text-align': 'center',
			color: 'black'
		}
	}, {
		name: 'task-type',
		style: {
			height: '17px',
			width: '70px',
			top: '7px',
			left: '5px',
			position: 'absolute'
		}
	}, {
		name: 'task-name',
		style: {
			top: '3px',
			left: '85px',
			position: 'absolute'
		}
	}, {
		name: 'task-description',
		style: {
			top: '25px',
			left: '7px',
			position: 'absolute'
		}
	}, {
		name: 'task-reward',
		innerHTML: '<span class="task-reward-title">奖励</span>',
		style: {
			top: '47px',
			left: '7px',
			position: 'absolute'
		}
	}]
}];

var tab = {
	beginTop: 37,
	height: 77
};

var grid = {
	width: 60,
	height: 60
};

var menu = {
	width: 70
};

var gridPopup = [{
	name: 'gridPopup',
	items: {
		wraperStyle : {
			position: 'absolute',
			display: 'none',
			width: '188px',
			height: '352px',
			color: '#00deff',
			'font-size': '12px',
			background:'-webkit-repeating-linear-gradient(45deg,#0d263c, #0d263c 6px, #0c2338 6px, #0c2338 12px)',
			'border-radius': '5px',
			border: '1px solid #00eaff',
			'box-shadow': '0 0 10px #28d7ff inset',
			'z-index': 2048
		},
		textStyle : {
			margin: '25px'
		},
		btnStyle : {
			position: 'absolute',
			height: '50px',
			width: '83px',
			bottom: '16px',
			left: '50px',
			'line-height': '50px',
			'text-align': 'center',
			'font-size': '18px',
			color: '#292c2d',
			background: 'url(./res/ui/btn/popupbox_btn.png) no-repeat'
		}
	}
}];

var characterWindow = {
	name: "character",
	style: {
		width: "363px",
		height: "467px",
		top: "50px"
	},
	equipmentGrid: {
		beginTop: 53,
		beginLeft: 50,
		marginTop: 20,
		marginLeft: 152
	},
	buffGrid: {
		beginTop: 15,
		beginLeft: 12,
		marginTop: 0,
		marginLeft: 12
	},
	items: [{
		name: "tab_left_bg",
		style: {
			position: "absolute",
			height: "84px",
			width: "50px",
			left: "-44px"
		}
	}, {
		name: "equipmentGrid",
		style: {

		}
	}, {
		name: "nickname",
		style: {
			left: "110px",
			top: "53px",
			width: "135px",
			height: "21px"
		}
	}, {
		name: "level",
		style: {

		}
	}, {
		name: "bust",
		style: {
			left: "133px",
			top: "76px",
			width: "90px",
			height: "125px",
			position: "absolute"
		}
	}, {
		name: "hr",
		style: {
			width: "300px",
			height: "1px",
			border: "none",
			position: "absolute",
			top: "194px",
			left: "33px",
			background: "-webkit-radial-gradient(circle,rgb(4, 27, 40) 80%,transparent 100%)"
		}
	}, {
		name: "middleBG",
		style: {
			width: "293px",
			radius: 5,
			background: "rgb(16, 44, 74)",
			border: "2px solid rgb(14, 37, 60)",
			"box-shadow": "0 0 1px rgb(0, 234, 255)",
			position: "absolute",
			left: "35px",
			height: "74px",
			top: "210px",
			"background-image": "url(./res/ui/layout/c/cr_exp.png)"
		}
	}, {
		name: "experienceBG",
		style: {
			background: "-webkit-linear-gradient(top, #e86bfe, #a406bf)",
			top: "229px"
		}
	}, {
		name: "experience",
		style: {
			top: "229px"
		}
	}, {
		name: "energyBG",
		style: {
			background: "-webkit-linear-gradient(top, #48b5fa, #0d6ce2)",
			top: "260px"
		}
	}, {
		name: "energy",
		style: {
			top: "260px"
		}
	}, {
		name: "addEnergy",
		style: {

		}
	}, {
		name: "buffBG",
		style: {
			left: "35px",
			top: "312px",
			width: "293px",
			height: "85px"
		},
		items: [{
			name: "buffTitle",
			style: {
				position: "absolute",
				left: "94px",
				top: "-20px",
				background: "url(./res/ui/font/zh_CN/cr_buff_font.png)",
				width: "107px",
				height: "27px"
			}
		}, {
			name: "buffGrid",
			style: {
				"z-index": 10
			}
		}]
	}, {
		name: "showOnMSBtn",
		style: {
			position: "absolute",
			left: "77px",
			top: "392px",
			width: "213px",
			height: "70px",
			background: "url(./res/ui/btn/btn_bg_disable.png)",
			"text-align": "center",
			"line-height": "70px"
		}
	}]
};

var characterAttrWindow = {
	name: "charactorAttr",
	style: {

	},
	items: [{

	}]
};

var dialogueScene = [{
	name: 'dialogueScene',
	style: {
		position: "absolute",
		top: "518px",
		left: "0px"
	},
	items: [{
		name: 'dialogue-background',
		style: {
			height: '120px',
			width: '960px',
			left: 0,
			top: '0px',
			position: 'absolute',
			'z-index': 258,
			'border-top': '2px solid white'
		}
	}, {
		name: 'dialogue-name',
		style: {
			width: "300px",
			height: '30px',
			left: '288px',
			top: '26px',
			color: '#3B9BCC',
			'z-index': 259,
			position: 'absolute'
		}
	}, {
		name: 'dialogue-hr',
		tag: 'hr',
		style: {
			height: '1px',
			width: '420px',
			top: '48px',
			left: '288px',
			position: 'absolute',
			border: 'none',
			'z-index': 259,
			background: "-webkit-radial-gradient(circle,rgb(17, 66, 155) 80%,transparent 100%)"
		}
	}, {
		name: 'dialogue-content',
		style: {
			width: "300px",
			height: '30px',
			top: '68px',
			left: '288px',
			'z-index': 259,
			position: 'absolute',
			color: 'white'
		}
	}, {
		name: 'dialogue-next',
		style: {
			width: '68px',
			height: '19px',
			top: '86px',
			left: '874px',
			position: 'absolute',
			'z-index': 259
		}
	}, {
		name: 'dialogue-bust',
		style: {
			height: '367px',
			width: '250px',
			top: '-245px',
			left: 0,
			position: 'absolute',
			'z-index': 259
		}
	}]
}];

(function(ui_config) {
	ui_config.mainScene = mainScene;
	ui_config.fightScene = fightScene;
	ui_config.casinoScene = casinoScene;
	ui_config.dialogueScene = dialogueScene;
	ui_config.waterDrop = {
		width: 27,
		height: 85,
		className: "water-drop",
		l_cr_begin: {
			top: 20,
			left: 0
		},
		l_cr_end: {
			top: 20,
			left: 298
		},
		r_cr_begin: {
			top: 20,
			left: 932
		},
		r_cr_end: {
			top: 20,
			left: 648
		}
	};
	ui_config.characterWindow = characterWindow;
	ui_config.characterAttrWindow = characterAttrWindow;
	ui_config.window = {
		left: 298,
		top: 90
	};
	ui_config.attrWindow = {

	};
})(ui_config);

var packageWindow = [{
	name: 'packageWindow',
	style: {
		display: 'none',
		width: '363px',
		height: '467px',
		top: '50px'
	},
	items: [{
		name: 'tab_right_bg',
		style: {
			height: '77px',
			width: '70px',
			left: '359px'
		}
	}, {
		name: 'cell',
		style: {
			height: '60px',
			width: '60px'
		},
		items: [{
			name: 'click',
			className: 'click',
			style: {
				
			}
		}]
	}]
}];

var skillWindow = [{
	name: 'skillWindow',
	items: [{
		name: 'tab_right_bg',
		style: {
			height: '77px',
			width: '70px',
			left: '357px'
		}
	}, {
		name: 'frame-btn-alone',
		innerHTML: '强化战舰',
		style: {

		}
	}],
	grid9Items: [{
		name: 'cell-skill',
		style: {
			height: '60px',
			width: '60px',
			'border-radius': '6px',
			'box-shadow': '0 0 10px #00ebff',
			border: '2px solid #9f9f9f',
			position: 'absolute',
			'z-index': 612,
			'background-repeat': 'no-repeat',
			'background-color': '#0e345a',
			"background-size": "120%",
			"background-position": "-5px"
		}
	}, {
		name: 'pipeline-vertical',
		innerHTML: '<div class="pipeline-filler" style="top:-3px;width:100%;"></div>',
		style: {
			height: '35px',
			width: '10px',
			position: 'absolute',
			'z-index': 602,
			border: '2px solid #9f9f9f',
			'box-shadow': '0 0 10px #00ebff'
		}
	}, {
		name: 'pipeline-horizontal',
		innerHTML: '<div class="pipeline-filler" style="left:-3px;height:100%;"></div>',
		style: {
			height: '10px',
			width: '35px',
			position: 'absolute',
			'z-index': 602,
			border: '2px solid #9f9f9f',
			'box-shadow': '0 0 10px #00ebff'
		}
	}, {
		name: 'skills-content-holder',
		style: {
			height: '345px',
			width: '305px',
			'border-radius': '5px',
			background: '#102c4a',
			border: '2px solid #0e253c',
			'box-shadow': '0 0 1px #00eaff',
			position: 'absolute',
			left: '27px',
			top: '52px',
			'z-index': 513
		}
	}, {
		name: 'skills-content-hr',
		style: {
			position: 'absolute',
			left: '26px',
			top: '100px',
			height: '21px',
			width: '311px',
			background: 'url(./res/ui/layout/c/skill_ph_bg.png)',
			'z-index': 514
		}
	}, {
		name: 'position',
		'0-1': 'top:162px;left:114px;',
		'1-2': 'top:162px;left:210px;',
		'3-4': 'top:254px;left:114px;',
		'4-5': 'top:254px;left:210px;',
		'6-7': 'top:350px;left:114px;',
		'7-8': 'top:350px;left:210px;',
		'0-3': 'top:195px;left:79px;',
		'1-4': 'top:195px;left:175px;',
		'2-5': 'top:195px;left:268px;',
		'3-6': 'top:288px;left:79px;',
		'4-7': 'top:288px;left:175px;',
		'5-8': 'top:288px;left:268px;'
	}]
}];

var pirateBoatWindow = [{
	name: 'pirateBoatWindow',
	items: [{
		name: 'pirate-boat-nickname',
		style: {
			width: '135px',
			height: '21px',
			position: 'absolute',
			top: '53px',
			left: '110px',
			'text-align': 'center',
			color: '#00eaff',
			'font-size': '14px'
		}
	}, {
		name: 'pirate-boat-bust',
		style: {
			height: '125px',
			width: '90px',
			position: 'absolute',
			top: '76px',
			left: '133px'
		}
	}, {
		name: 'pirate-boat-level',
		style: {
			height: '17px',
			width: '28px',
			display: 'inline-block',
			'font-style': 'italic',
			'font-size': '12px',
			color: 'red',
			position: 'absolute',
			left: '215px',
			top: '55px',
			'line-height': '17px',
			background: 'url(./res/ui/layout/c/cr_level_bg.png)'
		}
	}, {
		name: 'frame-hr',
		tag: 'hr',
		style: {
			width: '300px',
			height: '1px',
			border: 'none',
			position: 'absolute',
			top: '194px',
			left: '33px',
			background: '-webkit-radial-gradient(circle,#041b28 80%,transparent 100%)'
		}
	}, {
		name: 'pirate-boat-content-holder',
		innerHTML: '<div id="content-left" style="position:absolute;left:10px;top:10px;width:128px;"></div>'
				 + '<div id="content-right" style="position:absolute;left:164px;top:10px;width:128px;"></div>'
				 + '<div id="active-skill-content" style="position:absolute;top:136px;left:10px;color:#0292c7;"></div>',
		style: {
			height: '188px',
			width: '293px',
			'border-radius': '5px',
			background: '#102c4a',
			border: '2px solid #0e253c',
			'box-shadow': '0 0 1px #00eaff',
			position: 'absolute',
			top: '210px',
			left: '35px',
			'font-size': '12px',
			color: '#00d3ff',
			'text-shadow': '0 0 1px #000817'
		}
	}, {
		name: 'active-skill-label',
		style: {
			position: 'absolute',
			left: '43px',
			top: '329px',
			height: '16px',
			width: '58px',
			'z-index': 522
		}
	}, {
		name: 'active-skill-content',
		style: {
			position: 'absolute',
			left: '10px',
			top: '136px',
			color: '#0292c7',
			'z-index': 512
		}
	}, {
		name: 'frame-btn-alone',
		innerHTML: '强化战舰',
		className: 'frame-btn-alone',
		style: {}
	}, {
		name: 'pirate-boat-tab',
		style: {
			position: 'absolute',
			left: '-65px',
			height: '77px',
			width: '70px'
		}
	}]
}];

var strengthenWindow = [{
	name: 'strengthenWindow',
	style: {
		display: 'none',
		width: '363px',
		height: '467px',
		top: '50px'
	},
	items: [{
		name: 'tab_right_bg',
		style: {
			height: '77px',
			width: '42px',
			left: '359px'
		}
	}]
}, {
	name: 'transform',
	items: [{
		name: 'transform-bg',
		style: {
			position: 'absolute',
			'z-index': 513,
			top: '75px',
			left: '19px',
			width: '325px',
			height: '318px',
			background: 'url(./res/ui/layout/c/st_tfm_boat_bg.png) no-repeat'
		}
	}, {
		name: 'pic0',
		style: {
			position: 'absolute',
			'z-index': 514,
			top: '118px',
			left: '96px',
			width: '60px',
			height: '60px'
		}
	}, {
		name: 'pic1',
		style: {
			position: 'absolute',
			'z-index': 514,
			top: '98px',
			left: '252px',
			width: '60px',
			height: '60px'
		}
	}, {
		name: 'pic2',
		style: {
			position: 'absolute',
			'z-index': 514,
			top: '252px',
			left: '195px',
			width: '60px',
			height: '60px'
		}
	}, {
		name: 'pic3',
		style: {
			position: 'absolute',
			'z-index': 514,
			top: '310px',
			left: '84px',
			width: '60px',
			height: '60px'
		}
	}, {
		name: 'pic4',
		style: {
			position: 'absolute',
			'z-index': 514,
			top: '316px',
			left: '262px',
			width: '60px',
			height: '60px'
		}
	}, {
		name: 'frame-btn-tween',
		className: 'frame-btn-tween',
		innerHTML: '重新改造',
		style: {
			top: '391px',
			left: '30px'
		}
	}, {
		name: 'frame-btn-tween',
		className: 'frame-btn-tween',
		innerHTML: '改造战舰',
		style: {
			top: '391px',
			left: '185px'
		}
	}]
}, {
	name: 'research',
	items: [{
		name: 'frame-btn-alone',
		innerHTML: '学习/升级',
		style: {

		}
	}]
}, {
	name: 'recast',
	items: [{
		name: 'recast-holder',
		style: {
			width: '293px',
			height: '268px',
			'border-radius': '5px',
			background: '#102c4a',
			border: '2px solid #0e253c',
			'box-shadow': '0 0 1px #00eaff',
			position: 'absolute',
			left: '33px',
			top: '130px'

		}
	}, {
		name: 'recast-left-text',
		style: {
			position: 'absolute',
			top: '140px',
			left: '88px',
			width: '186px',
			height: '22px',
			background: 'url(./res/ui/font/zh_CN/st_rst_surplus.png) no-repeat',
			'z-index': 513
		}
	}, {
		name: 'recast-left-num',
		style: {
			position: 'absolute',
			top: '134px',
			left: '218px',
			color: '#ff6000',
			'font-size': '24px',
			'z-index': 513
		}
	}, {
		name: 'circle-progress-holder',
		style: {
			position: 'absolute',
			height: '202px',
			width: '202px',
			top: '168px',
			left: '82px',
			overflow: 'hidden',
			'border-radius': '101px'
		}
	}, {
		name: 'circle-progress-left',
		style: {
			position: 'absolute',
			width: '101px',
			height: '202px'
		}
	}, {
		name: 'circle-progress-right',
		style: {
			left: '101px',
			position: 'absolute',
			width: '101px',
			height: '202px'
		}
	}, {
		name: 'circle-progress-rotate',
		style: {
			position: 'absolute',
			width: '101px',
			height: '202px',
			background: '#102c4a',
			'z-index': 565
		}
	}, {
		name: 'circle-progress-cover',
		style: {
			position: 'absolute',
			top: '168px',
			left: '82px',
			'z-index': 567,
			height: '203px',
			width: '203px',
			background: 'url(../res/ui/layout/c/rst_bg_icon.png) no-repeat'
		}
	}, {
		name: 'circle-progress-cover-type',
		style: {
			position: 'absolute',
			top: '211px',
			left: '125px',
			'z-index': 568,
			height: '117px',
			width: '117px',
			background: 'url(../res/ui/layout/c/rst_1_icon.png) no-repeat'
		}
	}, {
		name: 'recast-description',
		style: {
			position: 'absolute',
			'font-size': '12px',
			top: '380px',
			'font-size': '12px',
			color: '#00d3ff',
			'text-shadow': '0 0 1px #000817',
			'z-index': 513,
			width: '363px',
			'text-align': 'center'
		}
	}, {
		name: 'recast-percent',
		style: {
			position: 'absolute',
			top: '296px',
			left: '159px',
			'font-size': '14px',
			'font-style': 'italic',
			color: '#00a8ff',
			'text-shadow': '0 0 1px #000817',
			'z-index': 569
		}
	}, {
		name: 'cell',
		style: {
			width: '60px',
			height: '60px',
			top: '56px'
		}
	}, {
		name: 'frame-btn-alone',
		innerHTML: '重铸装备',
		style: {	}
	}]
}, {
	name: 'made',
	items: [{
		name: 'made-holder',
		style: {
			position: 'absolute',
			width: '298px',
			height: '76px',
			left: '32px'
		},
		items: [{
			name: 'made-type',
			style: {
				position: 'absolute',
				left: '4px',
				top: '5px'
			}
		}, {
			name: 'made-cover',
			style: {
				position: 'absolute',
				'z-index': 512,
				width: '300px',
				height: '78px',
				background: 'url(./res/ui/layout/c/sy_abd_alone_bg.png) no-repeat'
			}
		}, {
			name: 'made-upgrade-btn',
			style: {
				position: 'absolute',
				left: '4px',
				top: '5px'
			}
		}, {
			name: 'made-point',
			style: {
				position: 'absolute',
				height: '29px',
				width: '28px',
				background: 'url(./res/ui/layout/c/st_adb_leve_bg.png) no-repeat',
				'line-height': '29px',
				'text-align': 'center',
				color: 'white',
				'font-size': '14px',
				'font-style': 'italic',
				left: '50px',
				top: '16px',
				'z-index': 513
			}
		}, {
			name: 'made-upgrade-btn',
			style: {
				position: 'absolute',
				right: '5px',
				top: '18px',
				height: '25px',
				width: '25px',
				background: 'url(./res/ui/btn/pb_up.png) no-repeat'
			}
		}, {
			name: 'made-description',
			style: {
				position: 'absolute',
				width: '298px',
				'font-size': '12px',
				'text-align': 'center',
				color: '#00d3ff',
				'text-shadow': '0 0 1px #000817',
				bottom: '3px',
				left: '1px'
			}
		}, {
			name: 'made-progress-filler',
			style: {
				position: 'absolute',
				'z-index': 511,
				height: '22px',
				top: '20px',
				left: '77px',
				// 'border-radius': '0 12px 12px 0',
				background: '-webkit-linear-gradient(right, #ff8d28, #990d00)'
			}
		}, {
			name: 'made-next-point',
			src: './res/ui/layout/c/st_sbd_chose.png',
			style: {
				position: 'absolute',
				'z-index': 567,
				top: '17px',
				height: '28px',
				width: '29px',
				background: 'url(./res/ui/layout/c/st_sbd_chose.png) no-repeat'
			}
		}]
	}, {
		name: 'made-holder-branch',
		style: {
			position: 'absolute',
			width: '300px',
			height: '109px',
			left: '32px'
		},
		items: [{
			name: 'made-type',
			style: {
				position: 'absolute',
				left: '4px',
				top: '5px',
				height: '40px',
				width: '40px'
			}
		}, {
			name: 'made-cover-branch',
			style: {
				position: 'absolute',
				'z-index': 512,
				width: '300px',
				height: '109px',
				background: 'url(./res/ui/layout/c/sy_abd_double_bg.png) no-repeat'
			}
		}, {
			name: 'made-upgrade-btn',
			style: {
				position: 'absolute',
				left: '4px',
				top: '5px'
			}
		}, {
			name: 'made-point',
			style: {
				position: 'absolute',
				height: '29px',
				width: '28px',
				background: 'url(./res/ui/layout/c/st_adb_leve_bg.png) no-repeat',
				'line-height': '29px',
				'text-align': 'center',
				color: 'white',
				'font-size': '14px',
				'font-style': 'italic',
				left: '50px',
				top: '31px',
				'z-index': 513
			}
		}, {
			name: 'made-upgrade-btn',
			style: {
				position: 'absolute',
				right: '5px',
				top: '18px',
				height: '25px',
				width: '25px',
				background: 'url(./res/ui/btn/pb_up.png) no-repeat'
			}
		}, {
			name: 'made-description',
			style: {
				position: 'absolute',
				width: '298px',
				'font-size': '12px',
				'text-align': 'center',
				color: '#00d3ff',
				'text-shadow': '0 0 1px #000817',
				bottom: '3px',
				left: '1px'
			}
		}, {
			name: 'made-progress-filler',
			style: {
				position: 'absolute',
				'z-index': 511,
				height: '36px',
				top: '16px',
				left: '77px',
				// 'border-radius': '0 12px 12px 0',
				background: '-webkit-linear-gradient(right, #ff8d28, #990d00)'
			}
		}, {
			name: 'made-next-point',
			style: {
				position: 'absolute',
				'z-index': 567,
				top: '17px',
				height: '28px',
				width: '29px',
				background: 'url(./res/ui/layout/c/st_sbd_chose.png) no-repeat'
			}
		}]
	}]
}];

var formation = [{
	name: 'formationWindow',
	items: [{
		name: 'tab_right_bg',
		style: {
			height: '77px',
			width: '42px',
			right: '-38px'
		}
	}]
}, {
	name: 'formation',
	cssText: 'position:absolute;top:90px;width:534px;height:466px;color:#000000;background:url(./res/ui/layout/c/ft_windowright_bg.png) no-repeat;z-index:513;',
	items: [{
		name: 'AP-tag',
		style: {
			position: 'absolute',
			top: '65px',
			height: '25px',
			width: '68px',
			background: 'url(./res/ui/font/zh_CN/fightingpower.png) no-repeat',
			left: '90px'
		}
	}, {
		name: 'HP_tag',
		style: {
			position: 'absolute',
			top: '65px',
			height: '25px',
			width: '68px',
			background: 'url(./res/ui/font/zh_CN/vitality.png) no-repeat',
			left: '275px'
		}
	}, {
		name: 'AP', // 战斗力
		className: 'formation-data-value',
		style: {
			top: '63px',
			left: '166px'
		}
	}, {
		name: 'HP', // 生命力
		className: 'formation-data-value',
		style: {
			top: '63px',
			left: '351px'
		}
	}, {
		name: 'AP-arrow-up',
		className: 'arrow-up',
		style: {
			height: '26px',
			width: '12px',
			top: '65px',
			left: '215px'
		}
	}, {
		name: 'AP-arrow-down',
		className: 'arrow-down',
		style: {
			height: '26px',
			width: '12px',
			top: '65px',
			left: '243px'
		}
	}, {
		name: 'HP-arrow-up',
		className: 'arrow-up',
		style: {
			height: '26px',
			width: '12px',
			top: '65px',
			left: '404px'
		}
	}, {
		name: 'HP-arrow-down',
		className: 'arrow-down',
		style: {
			height: '26px',
			width: '12px',
			top: '65px',
			left: '433px'
		}
	}, {
		name: 'description',
		style: {
			width: '372px',
			height: '44px',
			top: '120px',
			left: '60px',
			position: 'absolute'
		}
	}, {
		name: 'cr',
		className: 'cell-cr',
		position: [
			'top:274px;left:440px;',
			'top:334px;left:380px;',
			'top:334px;left:440px;'
		],
		style: {
			height: '50px',
			width: '50px',
			top: '65px',
			left: '433px'
		}
	}, {
		name: 'frameS',
		className: 'frameS',
		style: {
			position: 'absolute',
			width: '198px',
			height: '468px',
			left: '-200px',
			background: 'url(./res/ui/layout/c/ft_windowleft_bg.png) no-repeat'
		},
		items: {
			title: {
				position: 'absolute',
				width: '198px',
				height: '40px',
				'line-height': '40px',
				'font-size': '18px',
				'text-align': 'center'	
			}, 
			rb: {
				position: 'absolute',
				left: '38px',
				top: '38px',
				'z-index': 612,
				height: '27px',
				width: '27px',
				background: 'url(../res/ui/layout/c/ft_use.png) no-repeat'
			},
			wraper: {
				position: 'absolute',
				left: '16px',
				top: '60px',
				height: '389px',
				width: '164px',
				overflow: 'hidden'
			}
		}
	}, {
		name: 'blueCircle',
		position: [
			'top:239px;left:176px',
			'top:273px;left:272px',
			'top:332px;left:258px',
			'top:358px;left:130px',
			'top:320px;left:27px;',
			'top:261px;left:56px;'
		]
	}, {
		name: 'redCircle',
		position: [
			'top:150px;left:395px;',
			'top:170px;left:458px;',
			'top:210px;left:450px;',
			'top:226px;left:365px;',
			'top:201px;left:297px;',
			'top:163px;left:317px;'
		]
	}]
}, {
	name: 'battleformation',
	cssText: 'position:absolute;top:90px;width:363px;height:467px;color:#000000;background:url(./res/ui/layout/c/window_bg.png) no-repeat;z-index:513;',
	items: [{
		name: 'bg',
		tag: 'img',
		src: './res/ui/layout/c/bft_magic.png',
		style: {			
			position: 'absolute',
			top: '48px',
			left: '40px'
		}
	}, {
		name: 'wrap',
		id: 'battleformation-wrap',
		innerHTML: '<div style="margin:10px;position:absolute;width:287px;"></div>',
		style: {	
			top: '246px',
			left: '32px',
			width: '298px',
			height: '150px'
		}
	}]
}, {
	name: 'governing',
	cssText: 'position:absolute;top:90px;width:363px;height:467px;color:#000000;background:url(./res/ui/layout/c/window_bg.png) no-repeat;z-index:513;',
	items: [{
		name: 'frame-btn-alone',
		innerHTML: '学习/升级',
		style: { }
	}]
}];

var shopWindow = [{
	name: 'shopWindow',
	items: [{
		name: 'tab',
		className: 'tab_left_bg',
		style: {
			'line-height': '77px',
			'padding-left': '12px',
			width: '70px',
			height: '77px',
			color: '#292c2d',
			position: 'absolute',
			'text-align': 'center',
			left: '-66px'
		}
	},{
		name: 'dividingLeft',
		className: 'dividing',
		style: {
			'left': '24px'
		}
	},{
		name: 'dividingRight',
		className: 'dividing',
		style: {
			'left': '186px'
		}
	},{
		name: 'item',
		className: 'item',
		style: {
			width: '157px',
			height: '73px'
		},
		items: [{
			name: 'click',
			className: 'click',
			style: {

			}
		}, {
			name: 'img',
			className: 'item-img',
			style: {
				width: '55px',
				height: '55px',
				top: '8px',
				left: '20px'
			}
		}, {
			name: 'bg',
			className: 'item-bg',
			style: {
				width: '55px',
				height: '55px',
				top: '8px',
				left: '20px'
			}			
		}, {
			name: 'name',
			className: 'item-name',
			style: {
				top: '18px',
				left: '82px'
			}			
		}, {
			name: 'price',
			className: 'item-price',
			style: {
				top: '38px',
				left: '82px'
			}			
		}]
	}]
}];

var messageBox = [{
	name: 'messageBox',
	style: {
		position: 'absolute',
		height: '188px',
		width: '352px',
		background: '-webkit-repeating-linear-gradient(45deg, #0d263c, #0d263c 6px, #0c2338 6px, #0c2338 12px)',
		'border-radius': '5px',
		border: '1px solid #00eaff',
		'box-shadow': '0 0 10px #28d7ff inset',
		color: 'white',
		'z-index': 5120
	},
	items: [{
		name: 'content',
		style: {
			position: 'absolute',
			'line-height': '200px',
			'text-align': 'center',
			height: '188px',
			width: '352px'
		}
	}, {
		name: 'btnA',
		innerHTML: '确认',
		style: {
			position: 'absolute',
			bottom: '25px',
			left: '60px',
			width: '83px',
			height: '50px',
			'line-height': '50px',
			background: 'url(./res/ui/btn/popupbox_btn.png) no-repeat',
			'text-align': 'center',
			display: 'none'
		}
	}, {
		name: 'btnB',
		innerHTML: '取消',
		style: {
			position: 'absolute',
			bottom: '25px',
			right: '60px',
			width: '83px',
			height: '50px',
			'line-height': '50px',
			background: 'url(./res/ui/btn/popupbox_btn.png) no-repeat',
			'text-align': 'center',
			display: 'none'
		}
	}]
}];

var fightSettleWindow = [{
	name: 'fightSettleWindow',
	style: {
		background: 'url(./res/ui/layout/f/res_bg.png) no-repeat',
		width: 593,
		height: 428,
		top: 110,
		left: 190,
		titleHeight: 40,
		titleFontSize: 24
	},
	items: [{
		name: 'fight-tag',
		quantity: 2,
		differ: [{
			top: '53px'
		}, {
			top: '203px'
		}],
		style: {
			width: '89px',
			height: '30px',
			left: '31px'
		}
	}, {
		name: 'fight-purple-txt',
		quantity: 2,
		differ: [{
			top: '154px'
		}, {
			top: '237px'
		}],
		style: {
			left: '170px'
		}
	}, {
		name: 'fight-golden-txt',
		quantity: 2,
		differ: [{
			top: '154px'
		}, {
			top: '237px'
		}],
		style: {
			left: '310px'
		}
	}, {
		name: 'fight-star',
		quantity: 3,
		differ: [{
			left: '195px'
		}, {
			left: '265px'
		}, {
			left: '335px'
		}],
		style: {
			top: '85px',
			width: '59px',
			height: '61px'
		}
	}, {
		name: 'fight-cell',
		quantity: 4,
		differ: [{
			left: '160px'
		}, {
			left: '232px'
		}, {
			left: '304px'
		}, {
			left: '376px'
		}],
		style: {
			top: '272px',
			width: '60px',
			height: '60px'
		}
	}, {
		name: 'frame-btn-alone',
		quantity: 2,
		differ: [{
			left: '57px'
		}, {
			left: '322px'
		}],
		style: {
			top: '347px'
		}
	}]
}]