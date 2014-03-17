/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-01-23
 * Description: common functions
 */
function addPlayer(player) {
	console.log("addPlayer");
	player.characterId = 1;
	me.ObjectSettings.spritewidth = g_config.character[player.characterId].width;
	me.ObjectSettings.spriteheight = g_config.character[player.characterId].height;
	me.ObjectSettings.image = "character" + g_config.character[player.characterId].id;

	btg.otherPlayers[player.id] = new btg.CharacterBase(player.x, player.y, me.ObjectSettings);
	btg.otherPlayers[player.id].z = btg.map.playerLayerZ;
	btg.otherPlayers[player.id].renderable.setCurrentAnimation("stand-down");
	me.game.add(btg.otherPlayers[player.id], btg.map.playerLayerZ);
	me.game.sort();
}

function mouseDown() {
	
}
function mouseMove() {
    return;
    if(!btg.debug) return;
	if(btg.map.findPathMethod == 1) {
		drawPath();
	} else {
		drawPathByIsometric();
	}
}
function mouseUp() {
	var x = me.game.viewport.pos.x + me.input.mouse.pos.x;
	var y = me.game.viewport.pos.y + me.input.mouse.pos.y;
	var endPixel = {x: parseInt(x), y: parseInt(y)};

	findPath(endPixel);
	return true;
}

function findPath(pixel) {
	var startPixel = {
		x: parseInt(btg.mainPlayer.pos.x + btg.mainPlayer.width / 2),
		y: parseInt(btg.mainPlayer.pos.y + 100)
	};

	var path = btg.pathSearcher.searchPixelCoordsPath(startPixel, pixel);
	//var polyData = g_config.map.level[btg.game.currentLevel].polygonData;
	//var path;
	//if(polyData) {
	//    path = btg.navMeshPathSearcher.searchPath(polyData, startPixel, pixel);
	//} else {
	//    path = [{ x: x, y: y}];
	//}
	btg.mainPlayer.moveByPath(path);
	return true;
}

/**
 * 獲得orthogonal起點和終點
 */
function getOrthogonalPosition() {
	var scale = 1;
	var x = me.game.viewport.pos.x + me.input.mouse.pos.x;
	var y = me.game.viewport.pos.y + me.input.mouse.pos.y - btg.mainPlayer.height;
	if(x < 0) {
		x = 0;
	}
	if(x > me.game.currentLevel.realwidth) {
		x = me.game.currentLevel.realwidth;
	}
	if(y < -btg.mainPlayer.height) {
		y = -btg.mainPlayer.height;
	}
	if(y > me.game.currentLevel.realheight - btg.mainPlayer.height) {
		y = me.game.currentLevel.realheight - btg.mainPlayer.height;
	}
	var currentPosition = convertToOrthogonalCase(btg.mainPlayer.pos.x, btg.mainPlayer.pos.y, scale);
	var gotoPosition = convertToOrthogonalCase(x, y, scale);
	debug({
		currentPosition: {
			x: btg.mainPlayer.pos.x,
			y: btg.mainPlayer.pos.y
		},
		gotoPosition: {
			x: me.game.viewport.pos.x + me.input.mouse.pos.x,
			y: me.game.viewport.pos.y + me.input.mouse.pos.y - btg.mainPlayer.height
		}
	});
	return {
		currentPosition: currentPosition,
		gotoPosition: gotoPosition
	};
}

/**
 * 獲得isometric起點和終點
 */
function getIsometricPosition() {
	var tilewidth = btg.map.diamondwidth;
	var tileheight = btg.map.diamondheight;
	var currentPosition = {
		x: me.game.currentLevel.realwidth / 2 - btg.mainPlayer.pos.x,
		y: btg.mainPlayer.pos.y - tileheight / 2
	}
	var gotoPosition = {
		x: me.game.currentLevel.realwidth / 2 - (me.game.viewport.pos.x + me.input.mouse.pos.x),
		y: me.game.viewport.pos.y + me.input.mouse.pos.y - tileheight / 2 - btg.mainPlayer.height
	};
	/*
	orthogonal matrix
	var currentPosition = {
		x: me.game.currentLevel.realwidth / 2 - (tilewidth / 2) * Math.floor(btg.mainPlayer.pos.x / (me.game.currentLevel.width * 2)),
		y: (tileheight / 2) * Math.floor(btg.mainPlayer.pos.y / (me.game.currentLevel.height * 2)) - tileheight / 2
	}
	var gotoPosition = {
		x: me.game.currentLevel.realwidth / 2 - (tilewidth / 2) * Math.floor((me.game.viewport.pos.x + me.input.mouse.pos.x) / (me.game.currentLevel.width * 2)),
		y: (tileheight / 2) * Math.floor((me.game.viewport.pos.y + me.input.mouse.pos.y - btg.mainPlayer.height) / (me.game.currentLevel.height * 2)) - tileheight / 2
	}*/
	var topDiamond = [//left top right bottom
		[-tilewidth / 2, -tileheight / 2],
		[tilewidth / 2, tileheight / 2]
	];
	var test = testPoint(topDiamond, [currentPosition.x, currentPosition.y]);
	currentPosition = {
		x: Math.floor(test[0]),
		y: Math.floor(test[1])
	};
	test = testPoint(topDiamond, [gotoPosition.x, gotoPosition.y]);
	gotoPosition = {
		x: Math.floor(test[0]),
		y: Math.floor(test[1])
	};
	return {
		currentPosition: currentPosition,
		gotoPosition: gotoPosition
	};
}

/**
 * 绘制路径，orthogonal
 */
function drawPath() {
	if(btg.debug) {
        var position = getOrthogonalPosition();
        currentPosition = btg.map.graph.nodes[position.currentPosition.x][position.currentPosition.y];
        gotoPosition = btg.map.graph.nodes[position.gotoPosition.x][position.gotoPosition.y];
        var path = astar.search(btg.map.graph.nodes, currentPosition, gotoPosition, true);
        me.game.HUD.removeItem("rect");
        me.game.HUD.addItem("rect", new btg.ui.rect(me.input.mouse.pos.x, me.input.mouse.pos.y, 94, 91, path, 1));
        //me.game.add(new btg.ui.rect(me.input.mouse.pos.x, me.input.mouse.pos.y, me.game.currentLevel.tilewidth, me.game.currentLevel.tileheight), 100);
        //me.game.sort();
    }

}

/**
 * 绘制路径，isometric
 */
function drawPathByIsometric() {
	if(btg.debug) {
        var endPixel = {
            x: me.game.viewport.pos.x + me.input.mouse.pos.x,
            y: me.game.viewport.pos.y + me.input.mouse.pos.y
        };
        var startPixel = {
            x : btg.mainPlayer.pos.x + btg.mainPlayer.width / 2,
            y : btg.mainPlayer.pos.y + 100
        };

        var polyData = g_config.map.level[btg.game.currentLevel].polygonData;
        var path;
        if(polyData) {
            path = btg.navMeshPathSearcher.searchPath(polyData, startPixel, endPixel);
        } else {
            path = [{ x: x, y: y}];
        }
        if(path) {
            path.unshift(startPixel);
            me.game.HUD.removeItem('path');
            me.game.HUD.addItem('path', new btg.ui.path(0, 0, path));
        }
	}
}

/**
 * 获得路径
 */
function getPath() {
	var position = getOrthogonalPosition();
	btg.mainPlayer.gotoPosition(position.currentPosition, position.gotoPosition);
	return true;
}

/**
 * 判断点在棱形内
 */
function testPoint(topDiamond, coords) {//[0][0]left [0][1]top [1][0]right [1][1]bottom
	function add(vector1, vector2) {
		return [vector1[0] + vector2[0], vector1[1] + vector2[1]];
	}
	
	function multiply(matrix, vector) {
		return [matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
			matrix[1][0] * vector[0] + matrix[1][1] * vector[1]];
	}
	
	// Translation vector
	var translationVector = [ - (topDiamond[0][0] + topDiamond[1][0]) / 2,
		-topDiamond[0][1]];
	
	topDiamond = [add(topDiamond[0], translationVector),
		add(topDiamond[1], translationVector)];
	
	// Rotation matrix
	var angle = -Math.atan2(topDiamond[1][1] - topDiamond[0][1],
			topDiamond[1][0] - topDiamond[0][0]);
	var rotMatrix = [[Math.cos(angle), -Math.sin(angle)],
		[Math.sin(angle), Math.cos(angle)]];
	
	// Shear matrix
	var point = [topDiamond[0][0], (topDiamond[0][1] + topDiamond[1][1]) / 2];
	point = multiply(rotMatrix, point);
	var shearMatrix = [[1, -point[0] / point[1]], [0, 1]];
	
	// Scale matrix
	point = multiply(shearMatrix, point);
	var point2 = [topDiamond[1][0], (topDiamond[0][1] + topDiamond[1][1]) / 2];
	point2 = multiply(rotMatrix, point2);
	point2 = multiply(shearMatrix, point2);
	var scaleMatrix = [[1 / point2[0], 0], [0, 1 / point[1]]];
	
	// All done, get the result
	return (
		multiply(scaleMatrix,
			multiply(shearMatrix,
				multiply(rotMatrix,
					add(translationVector, coords)))));
}

/**
 * 转矩阵
 */
function convertToOrthogonalCase(x, y) {//获得orthogonal row col
	var scale = btg.map.scale;
	if(arguments.length == 3) {
		scale = arguments[2];
	}
	var col = Math.floor(x / (btg.map.collision_tilewidth / scale));
	var row = Math.floor(y / (btg.map.collision_tileheight / scale));
	return {
		x: row,
		y: col
	}
}

/**
 * 转像素点
 */
function convertToOrthogonalPixel(row, col) {//获得orthogonal x y
	var scale = btg.map.scale;
	if(arguments.length == 3) {
		scale = arguments[2];
	}
	var x = Math.floor(col * btg.map.collision_tilewidth / scale);
	var y = Math.floor(row * btg.map.collision_tileheight / scale);
	return {
		x: x,
		y: y
	}
}

function debug(info) {
	if(btg.debug) {
		console.log(info);
	}
}