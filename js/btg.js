/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-01-28
 * Description: package
 */
var btg = (function() {
	var btg = {
		map: {
			tileWidth: 45,
			tileHeight: 44,
			collision_tilewidth: 40,//me.game.currentLevel.tilewidth
			collision_tileheight: 40,//me.game.currentLevel.tileheight
			tiled: {
				row: 0,
				col: 0
			},
			scale: 2,
			isometricToOrthogonalGrid: [],
			orthogonalToIsometricGrid: {},
			orthogonalGrid: [],
			isometricGridXY: [],
			orthogonalGridXY: [],
			isometricGridMatrix: {},
			orthogonalGridMatrix: {},
			isometric_tilewidth: 48,//Math.sqrt(Math.pow(me.game.currentLevel.tilewidth, 2) + Math.pow(me.game.currentLevel.tileheight, 2)),
			isometric_tileheight: 48,
			tileset_width: 94,//构建矩阵并转为45度，旋转、缩放放入另一个90度矩阵，diamond
			tileset_height: 91,
			tileset_sidelength: Math.round(Math.sqrt(Math.pow(94, 2) + Math.pow(91, 2))),
			diamondwidth: 0,
			diamondheight: 0,
			playerLayerZ: 0,
			fightLayerZ: 100,
			graph: null,
			isometricGraph: null,
			findPathMethod: 2,//1 - orthogonal 2 - isometric 3 - mouse bind map
			bg_layer: null,
			style: "isometric"
		},
		character: {
			cId: 0
		},
		mainPlayer: {},
		otherPlayers: {},
		screen: {
			width: 960,
			height: 640,
			maxWindowWidthSize: 960,
			scale: 1,
			double_buffer: false
		},
		canvas: {
			width: 960,
			height: 640
		},
		game: {
			currentLevel: 0,
			currentIdLevel: null,
			currentScene: "city",
			currentMap: {
				seaport: {
					x: 0,
					y: 0
				}
			},
			isFight: false,
			font: {
				fontName: "微软雅黑 bold",
				fontSize: "14",
				fontColor: "white",
				defaultFont: new me.Font("微软雅黑 bold", 14, "white")
			}
		},
		debug: false,
		debugGrid: false,
		os: "iPhone",
		canTouch: true
	}
	return btg;
})();

window.btg = btg || {};

/**
 * map utils
 */
(function(btg) {
	/**
	 * 根据isometric坐标获得其所在矩阵位置
	 */
	btg.map.getIsometricTileId = function(x, y) {//isometric x y
		var width = me.game.currentLevel.width;
		var height = me.game.currentLevel.height;
		var realWidth = btg.map.tileWidth * width;
		var realHeight = btg.map.tileHeight * height;
		var row = 0;
		var col = 0;
		if(y <= 0) {
			row = 0;
		} else if(y >= realHeight - btg.map.tileHeight) {
			row = height;
		} else {
			row = Math.floor(y / btg.map.tileHeight);
		}
		if(x <= 0) {
			col = 0;
		} else if(x >= realWidth - btg.map.tileWidth) {
			col = width;
		} else {
			col = Math.floor(x / btg.map.tileWidth);
		}
		return {
			row: row,
			col: col
		};
	};
	/**
	 * 根据orthogonal坐标获得其矩阵位置
	 */
	btg.map.getOrthogonalTileId = function(x, y, scale) {//orthogonal x y
		if(scale == null)
			scale = btg.map.scale;
		var width = me.game.currentLevel.width * scale;
		var height = me.game.currentLevel.height * scale;
		var realWidth = me.game.currentLevel.realwidth;
		var realHeight = me.game.currentLevel.realHeight;
		var row = 0;
		var col = 0;
		if(y <= 0) {
			row = 0;
		} else if(y >= realHeight - me.game.currentLevel.tileheight / scale) {
			row = height;
		} else {
			row = Math.floor(y / (me.game.currentLevel.tileheight / scale));
		}
		if(x <= 0) {
			col = 0;
		} else if(x >= realWidth - me.game.currentLevel.tilewidth / scale) {
			col = width;
		} else {
			col = Math.floor(x / (me.game.currentLevel.tilewidth / scale));
		}
		var array = [];
		if(scale == 1) {
			array.push({row: row, col: col});
		} else if(scale == 2) {
			array.push({row: row, col: col});
			array.push({row: row - 1, col: col});
			array.push({row: row - 1, col: col + 1});
			array.push({row: row, col: col + 1});
		}
		return array;
	};
	/**
	 * 根据orthogonal坐标获得其矩阵位置，两倍网格
	 */
	btg.map.getOrthogonalTileId2Time = function(x, y) {
		btg.map.getOrthogonalTileId(x, y, 2);
	};
	/**
	 * 根据矩阵位置获得其像素位置
	 */
	btg.map.getIsometricPosition = function(row, col) {//isometric row col
		var x = 0;
		var y = 0;
		x = btg.map.tileWidth * col;
		y = btg.map.tileHeight * row;
		return {
			x: x,
			y: y
		};
	};
	/**
	 * 根据isometric矩阵获得orthogonal坐标
	 */
	btg.map.getOrthogonalPosition = function(row, col) {//两倍网格 isometric row col
		var tiled = {
			row: row,
			col: col
		};
		var x = 0;
		var y = 0;
		var width = me.game.currentLevel.width * 2;
		var height = me.game.currentLevel.height * 2;
		var realWidth = me.game.currentLevel.realwidth;
		var realHeight = me.game.currentLevel.realheight;
		var num = 0;
		if(tiled.col >= tiled.row) {//右侧
			num = tiled.col - tiled.row;
			x = realWidth / 2 + num * Math.round(realWidth / width);
		} else {
			num = tiled.row - tiled.col;
			x = realWidth / 2 - num * Math.round(realWidth / width);
		}
		if(tiled.col <= height / 2 - tiled.row) {//上
			num = (height / 2 - tiled.row) - tiled.col;
			y = realHeight / 2 - num * Math.round(realHeight / height);
		} else {
			num = tiled.col - (height / 2 - tiled.row);
			y = realHeight / 2 + num * Math.round(realHeight / height);
		}
		return {
			x: x - me.game.currentLevel.tilewidth / 2,
			y: y + me.game.currentLevel.tileheight / 2
		};
	};
	/**
	 * 根据isometric坐标获得orthogonal坐标
	 */
	btg.map.getOrthogonalPos = function(x, y) {
		var width = me.game.currentLevel.width;
		var height = me.game.currentLevel.height;
		var tilewidth = me.game.currentLevel.tilewidth;
		var tileheight = me.game.currentLevel.tileheight;
		var _pos = {
			x: tilewidth / 2 * (width + x - y - 1),
			y: tileheight / 2 * ((height * 2 - x - y) - 2)
		};
		return _pos;
	};
	/**
	 * 45度行列在90度地图中位置 2倍网格
	 */
	btg.map.initIsometricGrid = function() {
		scale = 1;
		var height = me.game.currentLevel.height;
		var width = me.game.currentLevel.width;
		var pos = {};
		var tiled = {};
		for (var i = 0; i < height; i += 1) {
			btg.map.isometricToOrthogonalGrid[i] = [];
			for (var j = 0; j < width; j += 1) {
				pos = btg.map.getOrthogonalPosition(i, j);
				tiled = btg.map.getOrthogonalTileId(pos.x, pos.y, scale);
				tiled = tiled[0];
				btg.map.isometricToOrthogonalGrid[i][j] = tiled;
				if(btg.map.orthogonalToIsometricGrid[tiled.row] == null)
					btg.map.orthogonalToIsometricGrid[tiled.row] = {};
				btg.map.orthogonalToIsometricGrid[tiled.row][tiled.col] = {
					row: i,
					col: j
				};
			}
		}
	};
	/**
	 * 45度角转坐标，以(realwidth / 2, tileheight / 2)为原点建立直角坐标系
	 */
	btg.map.initIsometricGridXY = function() {
		var height = me.game.currentLevel.height;
		var width = me.game.currentLevel.width;
		btg.map.diamondwidth = me.game.currentLevel.tilewidth;
		//btg.map.diamondheight = me.game.currentLevel.tileheight;
		//btg.map.diamondwidth = btg.map.tileset_width;
		btg.map.diamondheight = me.game.currentLevel.tileheight - 4;//btg.map.tileset_sidelength / 4 + 7;
		var tilewidth = btg.map.diamondwidth;
		var tileheight = btg.map.diamondheight;
		var realwidth = me.game.currentLevel.realwidth;
		var realheight = me.game.currentLevel.realheight;
		var x = 0;
		var y = 0;
		var _x = 0;
		var _y = 0;
		for (var i = 0; i < height; i += 1) {
			btg.map.isometricGridXY[i] = [];
			for (var j = 0; j < width; j += 1) {
				x = (j - i) * tilewidth / 2;
				y = (i + j) * tileheight / 2;
				_x = realwidth / 2 + (j - i) * tilewidth / 2;
				_y = (i + j) * tileheight / 2 + tileheight / 2;
				btg.map.isometricGridXY[i][j] = {
					isometric: {
						x: x,
						y: y
					},
					orthogonal: {
						x: _x,
						y: _y
					},
					orthogonalMatrix: {
						x: _x / (tilewidth / 2),
						y: _y / (tileheight / 2)
					}
				};
				if(btg.map.isometricGridMatrix[x] == null)
					btg.map.isometricGridMatrix[x] = {};
				btg.map.isometricGridMatrix[x][y] = {
					isometric: {
						x: i,
						y: j
					},
					orthogonal: {
						x: _x / (tilewidth / 2),
						y: _y / (tileheight / 2)
					}
				};
				if(btg.map.orthogonalGridMatrix[_x] == null)
					btg.map.orthogonalGridMatrix[_x] = {};
				btg.map.orthogonalGridMatrix[_x][_y] = {
					isometric: {
						x: i,
						y: j
					},
					orthogonal: {
						x: _x / (tilewidth / 2),
						y: _y / (tileheight / 2)
					}
				};
			}
		}
		debug(btg.map.isometricGridXY);
		debug(btg.map.isometricGridMatrix);
		debug(btg.map.orthogonalGridMatrix);
	};
	/**
	 * 45度角坐标在90度地图中位置
	 */
	btg.map.initOrthogonalGridXY = function() {
		var height = me.game.currentLevel.height;
		var width = me.game.currentLevel.width;
		var tilewidth = me.game.currentLevel.tilewidth;
		var tileheight = me.game.currentLevel.tileheight;
		var realwidth = me.game.currentLevel.realwidth;
		var realheight = me.game.currentLevel.realheight;
		var x = 0;
		var y = 0;
		var _x = 0;
		var _y = 0;
		for (var i = 0; i < height; i += 1) {
			btg.map.orthogonalGridXY[i] = [];
			for (var j = 0; j < width; j += 1) {
				x = (j - i) * tilewidth / 2;
				y = (i + j) * tileheight / 2;
				_x = realwidth / 2 + (j - i) * tilewidth / 2;
				_y = (i + j) * tileheight / 2 + tileheight / 2;
				btg.map.orthogonalGridXY[i][j] = {
					isometric: {
						x: x,
						y: y
					},
					orthogonal: {
						x: _x,
						y: _y
					}
				};
			}
		}
	};
	/**
	 * 初始化astar网格
	 */
	btg.map.initOrthogonalGrid = function() {
		var height = me.game.currentLevel.height * btg.map.scale;
		var width = me.game.currentLevel.width * btg.map.scale;
		var pos = {};
		var tiled = {};
		for (var i = 0; i < height; i += 1) {
			btg.map.orthogonalGrid[i] = [];
			for (var j = 0; j < width; j += 1) {
				btg.map.orthogonalGrid[i][j] = 1;
			}
		}
	};
	btg.map.orthogonalXYToIsometricXY = function() {//90度转45度
		
	};
	btg.map.isometricXYToOrthogonalXY = function() {//45度转90度
		
	};
	btg.map.pixelToTileCoords = function(x, y) {//90度转45度
		var width = me.game.currentLevel.width;
		var height = me.game.currentLevel.height;
		var tilewidth = me.game.currentLevel.tilewidth;
		var tileheight = me.game.currentLevel.tileheight;
		var hTilewidth = tilewidth / 2;
		var hTileheight = tileheight / 2;
		var ratio = me.game.currentLevel.tilewidth / me.game.currentLevel.tileheight;
		var originX = me.game.currentLevel.height * hTilewidth;
		x -=  originX;
		return new me.Vector2d((y + (x / ratio)) / tileheight,
							   (y - (x / ratio)) / tileheight);
	};
	btg.map.tileToPixelCoords = function(x, y) {//45度转90度
		var width = me.game.currentLevel.width;
		var height = me.game.currentLevel.height;
		var tilewidth = me.game.currentLevel.tilewidth;
		var tileheight = me.game.currentLevel.tileheight;
		var hTilewidth = tilewidth / 2;
		var hTileheight = tileheight / 2;
		var ratio = me.game.currentLevel.tilewidth / me.game.currentLevel.tileheight;
		var originX = me.game.currentLevel.height * hTilewidth;
		return new me.Vector2d((x - y) * hTilewidth + originX,
								   (x + y) * hTileheight);
	};
	/**
	 * 获得astar矩阵，isometri轉orthogonal
	 */
	btg.map.getGraph = function() {
		var collision_layer = me.game.currentLevel.getLayerByName("collision");
		debug(collision_layer);
		if (!collision_layer.layerData) {
			alert("no LAYER COL");
			return;
		}
		btg.map.initIsometricGrid();
		btg.map.initOrthogonalGrid();
		var height = collision_layer.height;
		var width = collision_layer.width;
		var tiled = {};
		var pos = {};
		for (var i = 0; i < height; i += 1) {
			for (var j = 0; j < width; j += 1) {
				var position = btg.map.convertToPixel(j, i);
				if (collision_layer.getTile(position.x, position.y) != null) {//orthogonal x y
					pos = btg.map.getOrthogonalPosition(i, j);
					tiled = btg.map.getOrthogonalTileId(pos.x, pos.y);
					tiled = tiled[0];
					btg.map.orthogonalGrid[tiled.row][tiled.col] = 0;
				}
			}
		}
		debug(btg.map.orthogonalGrid);
		var graph = new Graph(btg.map.orthogonalGrid);
		return graph;
	};
	/**
	 * 获得astar矩阵，isometric
	 */
	btg.map.getGraphInfo = function() {
		var collision_layer = me.game.currentLevel.getLayerByName("collision");
		debug(collision_layer);
		if (!collision_layer.layerData) {
			alert("no LAYER COL");
			return;
		}
		btg.map.initIsometricGridXY();
		btg.map.initOrthogonalGrid();
		var height = collision_layer.height;
		var width = collision_layer.width;
		var tilesets = me.game.currentLevel.tilesets;
		var tileset = null;
		var tiled = null;
		var pos = {};
		for (var i = 0; i < height; i += 1) {
			for (var j = 0; j < width; j += 1) {
				var position = btg.map.convertToPixel(j, i);
				tiled = collision_layer.getTile(position.x, position.y);
				if (tiled != null) {
					debug("i:" + i + " j:" + j);
					tileset = tilesets.getTilesetByGid(tiled.tileId);
					if(tileset.TileProperties[tiled.tileId].canwalk == "no") {
						btg.map.orthogonalGrid[i][j] = 0;
					}
				}
			}
		}
		debug(btg.map.orthogonalGrid);
		var graph = new Graph(btg.map.orthogonalGrid);
		return graph;
	};
	/**
	 * 初始化寻路矩阵
	 */
	btg.map.getCurrentGraphInfo = function() {
		var layerData = me.game.collisionMap.layerData,
			rowCount = layerData.length,
			colCount = layerData[0].length;
		var matrix = [];

		for (var row = 0; row < rowCount; row++) {
			matrix[row] = [];
			for (var col = 0; col < colCount; col++) {
				matrix[row][col] = layerData[row][col] ? 0 : 1;
				layerData[row][col] = null;
			}
		}
		var graph = new Graph(matrix);
		return graph;
	};
	/**
	 * 获得astar矩阵，orthogonal
	 */
	btg.map.getGraphInOrthogonal = function() {
		var tile_collision = tile_collisions["map" + btg.game.currentLevel];
		btg.map.orthogonalGrid = tile_collision;
		debug(btg.map.orthogonalGrid);
		var graph = new Graph(btg.map.orthogonalGrid);
		return graph;
	};
	btg.map.convertToPixel = function(x, y) {
		var x = Math.floor(x * me.game.currentLevel.tilewidth);
		var y = Math.floor(y * me.game.currentLevel.tileheight);
		return {
			x: x,
			y: y
		}
	};
	/**
	 * 转换为画布像素坐标
	 */
	btg.map.getTilePixel = function(x, y) {
		return btg.map.bg_layer.renderer.tileToPixelCoords(x, y).floorSelf();
	};
	/**
	 * 转换为砖块坐标
	 */
	btg.map.getTileCoords = function(x, y) {
		return btg.map.bg_layer.renderer.pixelToTileCoords(x, y).floorSelf();
	};
	btg.map.getPlayerLayerZ = function() {
		var playerLayerZ = 0;
		var objectGroups = me.game.currentLevel.objectGroups;
		for(var i = 0 ; i <= objectGroups.length ; i++) {
			if(objectGroups[i].name == "player") {
				playerLayerZ = objectGroups[i].z;
				break;
			}
		}
		return playerLayerZ;
	};
})(btg);

/**
 * screen utils
 */
(function(btg) {
	/**
	 * 计算屏幕大小
	 */
	btg.calculateScreen = function() {
		if(btg.os == "pc") {
			btg.canvas.width = btg.screen.maxWindowWidthSize;
			btg.canvas.height = btg.screen.height;
			return;
		}
		btg.screen.maxWindowWidthSize = btg.screen.width;
		var innerWidth = window.innerWidth;
		var innerHeight = window.innerHeight;
		
		btg.canvas.width = innerWidth - 20 ;
		btg.canvas.height = innerHeight;

		if(innerHeight < 400) {
			btg.canvas.height = 400;
		}
		if(innerHeight > btg.screen.height) {
			btg.canvas.height = btg.screen.height;
		}

		if(btg.canvas.width > btg.screen.maxWindowWidthSize) {
			btg.canvas.width = btg.screen.maxWindowWidthSize;
		}

		btg.screen.scale = btg.canvas.height / btg.screen.height;
		if(btg.screen.scale < 1) {
			btg.screen.double_buffer = true;
		}
	};
})(btg);

/**
 * game utils
 */
(function(btg) {
	/**
	 * 获得物体在屏幕中水平居中位置
	 */
	btg.getCenterX = function(obj) {
		return (me.game.viewport.getWidth() - obj.width) / 2;
	}
	
	/**
	 * 获得物体在屏幕中垂直居中位置
	 */
	btg.getCenterY = function(obj) {
		return (me.game.viewport.getHeight() - obj.height) / 2;
	};
	
	/**
	 * 將世界坐標轉為屏幕坐標
	 */
	btg.getScreenXY = function(pos) {
		return {
			x: pos.x - me.game.viewport.pos.x,
			y: pos.y - me.game.viewport.pos.y
		};
	}
	
	btg.getScreenRect = function() {
		return new me.Rect(new me.Vector2d(0, 0), me.video.getWidth(), me.video.getHeight());//null me.video.getSystemCanvas()
	}
})(btg);

/**
 * font utils
 */
(function(btg) {
	btg.drawStokeFont = function(context, text, pos, align) {
		//context.beginPath();
		context.font = "bold 14px Arial";
		context.textAlign = align;//文字位置，默认为居左,right为对右下点坐标定位，center为中心底点(同ps里文字对齐)
		context.lineWidth = 2;//描边宽度，居中描边
		context.strokeStyle = "#000000";//描边颜色，文字为空心，只有边线有颜色
		context.strokeText(text, pos.x, pos.y - 20);
		context.fillStyle = btg.font.fontColor;
		context.fillText(text, pos.x, pos.y - 20);//文字左下点坐标
	};
	btg.drawFont = function(context, text, x, y, obj, align) {
		var font = btg.game.font.defaultFont.measureText(context, text);
		var width = 0;
		if(typeof align == "undefined" || align == "left") {
			width = 0;
		} else if(align == "center") {
			width = obj.width / 2 - font.width / 2;
		} else {
			width = obj.width - font.width;
		}
		btg.game.font.defaultFont.draw(context, text, x + width, y - 10);
	}
})(btg);

/**
 * player utils
 */
(function(btg) {
	/**
	 * 创建角色
	 */
	btg.createCharacter = function(character) {
		for(var o in character) {
			btg.character[o] = character[o];
		}
	};
})(btg);

/**
 * level utils
 */
(function(btg) {
	/**
	 * 加载关卡
	 */
	btg.game.loadLevel = function(levelId) {
		btg.map.style = "isometric";
		// stuff to reset on state change
		me.levelDirector.loadLevel("map" + levelId);
		//loading.info.style.display = "none";

        // 加载 multiple image layer
		var landLayers = [];
		var mapLayers = me.game.currentLevel.mapLayers;
		for(var x = 0 ; x < mapLayers.length ; x++) {
			if(mapLayers[x].land) {
				landLayers.push(mapLayers[x]);
			}
		}
        var mapData = g_config.map.level[levelId].mapData;
        if(mapData) {
            for(var i = 0 ; i < mapData.length ; i++) {
				var transY = i * 1024;
                for(var j = 0; j < mapData[i].length ; j++) {
					var transX = j * 1024;
                    if(mapData[i][j]) {
                        var canvas = document.createElement('canvas');
						canvas.width = 1024;
						canvas.height = 1024;
						var context = canvas.getContext('2d');
						context.save();
						canvas.width = 0;
						canvas.width = 1024;
						context.translate(-transX, -transY);
						//context.translate(transX, transY);
						for(var k = 0 ; k < landLayers.length ; k++) {
							var landLayer = landLayers[k];
							// set the layer alpha value
							var _alpha = context.globalAlpha;
							context.globalAlpha = landLayer.opacity;
							// draw the layer
							landLayer.renderer.drawTileLayer(context, landLayer, {x:transX, y:transY}, {
								pos : {
									x: 0,
									y: 0
								},
								width: 1024,
								height: 1024
							});
							// restore context to initial state
							context.globalAlpha = _alpha;
						}
						mapData[i][j] = canvas;//'map' + levelId + '_' + mapData[i][j];
						document.body.appendChild(canvas);
						context.restore();
                    } else {
                        mapData[i][j] = 'map_blank';
                    }
                }
            }
            var currentLevelLayers = me.game.currentLevel.mapLayers;
            var bgLayer = new btg.MultipleImageLayer('bg', me.game.currentLevel.realwidth,
                    me.game.currentLevel.realheight, 1024, 1024, mapData, 2);
            me.game.add(bgLayer, bgLayer.z);
        }

        var polygonData = g_config.map.level[levelId].polygonData;
        if(polygonData && btg.debug) {
            me.game.add(new btg.ui.polygonShape(0, 0, null, polygonData), 300);
        }

		// enable mouseEvent
		var rect = btg.getScreenRect();
		seaking.registerEvent(rect);
		
		//初始化玩家数据
		btg.mainPlayer = new btg.PlayerEntity(g_config.map.level[btg.game.currentLevel].pos.x, g_config.map.level[btg.game.currentLevel].pos.y, me.ObjectSettings, btg.character.cId);
		for(var o in btg.character) {
			btg.mainPlayer[o] = btg.character[o];
		}
		/*if(!UI.getDom("#leftTop")) {
			seaking.showMainSceneUI();
		}*/
		btg.eventManager.fireEvent('level.load', {level:levelId});
		me.game.add(btg.mainPlayer, btg.map.playerLayerZ);
		
		me.game.sort();
		btg.map.bg_layer = me.game.currentLevel.getLayerByName("bg");
		if(btg.map.findPathMethod == 1) {
			btg.map.graph = btg.map.getGraphInOrthogonal();//getGraphInfo getGraphInOrthogonal
		} else if(btg.map.findPathMethod == 2) {
			btg.map.graph = btg.map.getGraphInfo();
		} else {
			btg.map.graph = btg.map.getCurrentGraphInfo();
		}
	};
	
	/**
	 * 加载副本
	 */
	btg.game.loadIdLevel = function(levelId) {
		btg.map.style = "orthogonal";
		// stuff to reset on state change
		me.levelDirector.loadLevel("id" + levelId);
		//loading.info.style.display = "none";

		// enable mouseEvent
		var rect = btg.getScreenRect();
		seaking.registerEvent(rect);
		
		//初始化玩家数据
		btg.mainPlayer = new btg.PlayerEntity(g_config.map.idLevel[btg.game.currentIdLevel].pos.x, g_config.map.idLevel[btg.game.currentIdLevel].pos.y, me.ObjectSettings, btg.character.cId, true, 0);
		for(var o in btg.character) {
			btg.mainPlayer[o] = btg.character[o];
		}
		me.game.add(btg.mainPlayer, btg.map.playerLayerZ);
		btg.mainPlayer.pirateBoat = new btg.PirateBoat(g_config.map.idLevel[btg.game.currentIdLevel].pos.x, g_config.map.idLevel[btg.game.currentIdLevel].pos.y, me.ObjectSettings, false, btg.character.cId, btg.mainPlayer.mainBoatId);
		btg.mainPlayer.pirateBoat.z = btg.map.playerLayerZ;
		btg.mainPlayer.pirateBoat.renderable.setCurrentAnimation("standDown");
		btg.mainPlayer.boatMode = true;
		//me.game.add(btg.mainPlayer.pirateBoat, btg.map.playerLayerZ);
		
		me.game.sort();
		btg.map.bg_layer = me.game.currentLevel.getLayerByName("bg");
		if(btg.map.findPathMethod == 1) {
			btg.map.graph = btg.map.getGraphInOrthogonal();//getGraphInfo getGraphInOrthogonal
		} else if(btg.map.findPathMethod == 2) {
			btg.map.graph = btg.map.getGraphInfo();
		} else {
			btg.map.graph = btg.map.getCurrentGraphInfo();
		}
	};
})(btg);

/**
 * platform utils
 */
(function(btg) {
	(function(n) {
		var OS_PC = "pc",
			OS_IPHONE = "iPhone",
			OS_IPOD = "iPod",
			OS_IPAD = "iPad",
			OS_ANDROID = "Android";
		btg.os = OS_PC;
		btg.canTouch = false;
		if(n.indexOf(OS_IPHONE) > 0) {
			btg.os = OS_IPHONE;
			btg.canTouch = true;
		} else if (n.indexOf(OS_IPOD) > 0) {
			btg.os = OS_IPOD;
			btg.canTouch = true;
		} else if (n.indexOf(OS_IPAD) > 0) {
			btg.os = OS_IPAD;
			btg.canTouch = true;
		} else if (n.indexOf(OS_ANDROID) > 0) {
			btg.os = OS_ANDROID;
			btg.canTouch = true;
		}
	})(navigator.userAgent);
})(btg);

/**
 * character utils
 */
(function(btg) {
	btg.addNpc = function(npc) {
		
	};
	
	btg.findNpc = function(npcId) {
		var npcs = me.game.getEntityByName("NpcEntity");
		var pixel = null;
		for(var i = 0 ; i < npcs.length ; i++) {
			pixel = new me.Vector2d(npcs[i].pos.x + npcs[i].width / 2, npcs[i].pos.y + npcs[i].height);
			break;
		}
		findPath(pixel);
	}
})(btg);

/**
 * math utils
 */
(function(btg) {
	btg.point = function() {
		if(arguments.length == 2) {
			this.x = arguments[0];
			this.y = arguments[1];
		} else {
			this.x = 0;
			this.y = 0;
		}
	};
	btg.getLineFunc = function(x1, y1, x2, y2, num) {
		var a = 0;
		var b = 0;
		var y = y2 - y1;
		var x = x2 - x1;
		if(x == 0) {
			a = 0;
		} else {
			a = y / x;
		}
		b = y1 - a * x1;
		var step = Math.round((x2 - x1) / num);
		if(a == 0 && x == 0) {
			step = Math.round((y2 - y1) / num);
		}
		return {
			a: a,
			b: b,
			step: step
		}
	};
	btg.getLinePoint = function(x1, y1, x2, y2, num) {
		var func = btg.getLineFunc(x1, y1, x2, y2, num);
		var points = [];
		var point = null;
		debug("num:" + num);
		for(var i = 0 ; i < num ; i++) {
			point = new btg.point();
			if(func.a == 0 && (x2 - x1) == 0) {
				point.x = x1;
				point.y = y1 + func.step * (i + 1);
			} else {
				point.x = x1 + func.step * (i + 1);
				point.y = func.a * point.x + func.b;
			}
			points.push(point);
		}
		debug(points);
		return points;
	};
	btg.random = function(lower, higher) {
		return Math.floor(Math.random() * (higher + 1 - lower)) + lower;
	};
})(btg);

/**
 * test utils
 */
(function(btg) {
	btg.getLinePoint(2924, 1012, 2924, 1056, 20);
})(btg);