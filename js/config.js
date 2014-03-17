/**
 * config file
 * author: peter
 * date: 2013-01-28
 */
var g_config = {
	//map
	map: {
		level: [{
			id: 0,
			npcs: [20, 21],
			fightSceneX: 2700,
			fightSceneY: 2000,
			pos: {
				x: 3000,
				y: 1600
			},
			/*mapData: [
				[0,2,3,4,5,0],
				[7,8,9,10,11,0],
				[0,0,15,0,0,0]
			],*/
            polygonData : [
                // 地图外围包含
                [[3018,1914], [2759,2045], [2673,2001], [2717, 1848],
                 [2504,1740], [2547,1717], [2458,1673], [2500, 1650],
                 [2412,1476], [2470,1462], [2499,1475], [2555, 1463],
                 [2800,1451], [2930,1560], [2974,1586], [3232, 1454],
                 [3318,1496], [3100,1607], [3187,1653], [3446, 1522],
                 [3618,1736], [3530,1783], [3660,1848], [3445, 1956],
                 [3360,1911], [3314,1936], [3275,1914], [3144, 1977]],

                // 中部障碍物
                [[2846, 1786], [3061, 1672], [2844, 1563], [2630, 1674]],

                [[3404, 1893], [3320, 1850], [3447, 1784], [3535, 1826]]
            ]
		}, {
			id: 1,
			npcs: [],
			fightSceneX: 2000,
			fightSceneY: 2000,
			pos: {
				x: 3000,
				y: 2000
			},
			/*mapData: [
				[0,2,3,4,5,6,0,0],
				[9,10,11,12,13,14,15,16],
				[17,18,19,20,21,22,23,0],
				[0,0,27,28,29,0,0,0]
			]*/
		}],
		idLevel: [{
			id: 0,
			pos: {
				x: 500,
				y: 1000
			}
		}]
	},

	//character
	character: [{
		id: 0,
		name: "女主角",
		width: 80,
		height: 114,
		"standDown": [0,1,2,3,4,5],
		"standLeft": [72,73,74,75,76,77],
		"standUp": [6,7,8,9,10,11],
		"standRight": [78,79,80,81,82,83],
		"standLeftDown": [30,31,32,33,34,35],
		"standLeftUp": [24,25,26,27,28,29],
		"standRightUp": [12,13,14,15,16,17],
		"standRightDown": [18,19,20,21,22,23],
		"down": [42,43,44,45,46,47],
		"left": [90,91,92,93,94,95],
		"up": [36,37,38,39,40,41],
		"right": [84,85,86,87,88,89],
		"leftDown": [66,67,68,69,70,71],
		"leftUp": [60,61,62,63,64,65],
		"rightUp": [48,49,50,51,52,53],
		"rightDown": [54,55,56,57,58,59]
	},{
		id: 1,
		name: "男主角",
		width: 80,
		height: 114,
        "standDown": [0,1,2,3,4,5],
        "standLeft": [72,73,74,75,76,77],
        "standUp": [6,7,8,9,10,11],
        "standRight": [78,79,80,81,82,83],
        "standLeftDown": [30,31,32,33,34,35],
        "standLeftUp": [24,25,26,27,28,29],
        "standRightUp": [12,13,14,15,16,17],
        "standRightDown": [18,19,20,21,22,23],
        "down": [42,43,44,45,46,47],
        "left": [90,91,92,93,94,95],
        "up": [36,37,38,39,40,41],
        "right": [84,85,86,87,88,89],
        "leftDown": [66,67,68,69,70,71],
        "leftUp": [60,61,62,63,64,65],
        "rightUp": [48,49,50,51,52,53],
        "rightDown": [54,55,56,57,58,59]
	},{
		id: 2
	},{
		id: 3
	},{
		id: 4
	},{
		id: 5
	},{
		id: 6
	},{
		id: 7
	},{
		id: 8
	},{
		id: 9
	},{
		id: 10
	},{
		id: 11
	},{
		id: 12
	},{
		id: 13
	},{
		id: 14
	},{
		id: 15
	},{
		id: 16
	},{
		id: 17
	},{
		id: 18
	},{
		id: 19
	},{
		id: 20,
		name: "npc20",
		width: 110,
		height: 125,
		standLeftDown: [0,1,2,3,4,5],
		shakeLeftDown: [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
		standRightDown: [21,22,23,24,25,26],
		shakeRightDown: [27,28,29,30,31,32,33,34,35,36,37,38,39,40,41]
	},{
		id: 21,
		name: "npc21",
		width: 102,
		height: 136,
		standLeftDown: [0,1,2,3,4,5],
		shakeLeftDown: [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
		standRightDown: [21,22,23,24,25,26],
		shakeRightDown: [27,28,29,30,31,32,33,34,35,36,37,38,39,40,41]
	},{
		id: 22,
		name: "npc21",
		width: 80,
		height: 117,
		standLeftDown: [0,1,2,3,4,5],
		shakeLeftDown: [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
		standRightDown: [21,22,23,24,25,26],
		shakeRightDown: [27,28,29,30,31,32,33,34,35,36,37,38,39,40,41]
	}],

	//pirate boat
	pirateBoat: [{
		id: 0,
		name: "boat1",
		width: 150,
		height: 150,
		"standDown": [0],
		"standLeft": [0],
		"standUp": [0],
		"standRight": [0],
		"standLeftDown": [0],
		"standLeftUp": [0],
		"standRightUp": [0],
		"standRightDown": [0],
		"down": [0],
		"left": [0],
		"up": [0],
		"right": [0],
		"leftDown": [0],
		"leftUp": [0],
		"rightUp": [0],
		"rightDown": [0]
	},{
		id: 1,
		name: "boat2",
		width: 150,
		height: 150,
		"standDown": [0]
	},{
		id: 2,
		name: "boat2",
		width: 150,
		height: 150,
		"standDown": [0]
	},{
		id: 3,
		name: "boat2",
		width: 150,
		height: 150,
		"standDown": [0]
	},{
		id: 4,
		name: "boat2",
		width: 150,
		height: 150,
		"standDown": [0]
	},{
		id: 5,
		name: "boat2",
		width: 150,
		height: 150,
		"standDown": [0]
	},{
		id: 6,
		name: "boat2",
		width: 150,
		height: 150,
		"standDown": [0]
	},{
		id: 7
	},{
		id: 8
	},{
		id: 9
	},{
		id: 10
	},{
		id: 11
	},{
		id: 12
	},{
		id: 13
	},{
		id: 14
	},{
		id: 15
	},{
		id: 16
	},{
		id: 17
	},{
		id: 18
	},{
		id: 19
	},{
		id: 20,
		name: "boat20",
		width: 150,
		height: 150,
		standDown: [0]
	},{
		id: 21
	},{
		id: 22
	}],

	//npc
	npc: {
		"20": {
			id: 20,
			name: "test",
			width: 102,
			height: 136,
			standDown: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]
		}
	},
	
	taskType: ["currentMainTask", "currentBranchTask", "currentDayTask", "currentExerciseTask"],
	symbolType: {
		QGOLD: "questionMark-gold",
		QGRAY: "questionMark-gray",
		EGOLD: "exclamationMark-gold",
		EGRAY: "exclamationMark-gray"
	},

	//main task
	mainTask: [{
		id: 0,
		name: "",
		getItems: [{
			id: 0,
			num: 10
		}]
	}],

	//day task
	dayTask: [{
		id: 0,
		name: "",
		getItems: [{
			id: 0,
			num: 10
		}]
	}],

	//items
	items: [{
		id: 0,
		name: "",
		type: 1
	}],
	
	//skills
	skills: [{
		id: 0,
		name: ""
	}],

	//formation
	formation: {
		bg: {
			left: 0,
			top: 219,
			width: 476,
			height: 350,
			marginLeft: 8,
			positionWidth: 90,
			positionHeight: 60
		},
		positions: {
			mainPlayer: [{
				x: 234,
				y: 167
			}, {
				x: 266,
				y: 39
			}, {
				x: 408,
				y: 114
			}, {
				x: 387,
				y: 246
			}, {
				x: 200,
				y: 304
			}, {
				x: 48,
				y: 218
			}, {
				x: 90,
				y: 87
			}],
			enemy: [{
				x: 243,
				y: 167
			}, {
				x: 210,
				y: 39
			}, {
				x: 68,
				y: 114
			}, {
				x: 89,
				y: 246
			}, {
				x: 277,
				y: 304
			}, {
				x: 428,
				y: 218
			}, {
				x: 386,
				y: 87
			}]
		}
	}
};
g_config.pirateBoat[300] = {
	id: 300,
	name: "boat1",
	width: 150,
	height: 150,
	"standDown": [0],
	"standLeft": [0],
	"standUp": [0],
	"standRight": [0],
	"standLeftDown": [0],
	"standLeftUp": [0],
	"standRightUp": [0],
	"standRightDown": [0],
	"down": [0],
	"left": [0],
	"up": [0],
	"right": [0],
	"leftDown": [0],
	"leftUp": [0],
	"rightUp": [0],
	"rightDown": [0]
};