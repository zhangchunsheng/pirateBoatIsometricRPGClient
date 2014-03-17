/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-01-23
 * Description: 資源加載
 */
var g_resources = [
//创建和选择角色
{
	name: "cc_bg",
	type: "image",
	src: "res/ui/layout/cc/bg.png"
}, {
	name: "play",
	type: "image",
	src: "res/ui/layout/cc/play.png"
}, {
	name: "play_h",
	type: "image",
	src: "res/ui/layout/cc/play_h.png"
}, {
	name: "boy",
	type: "image",
	src: "res/ui/layout/cc/boy.png"
}, {
	name: "girl",
	type: "image",
	src: "res/ui/layout/cc/girl.png"
}, {
	name: "clouds1",
	type: "image",
	src: "res/ui/layout/cc/clouds1.png"
}, {
	name: "clouds2",
	type: "image",
	src: "res/ui/layout/cc/clouds2.png"
}, {
	name: "stage",
	type: "image",
	src: "res/ui/layout/cc/stage.png"
}, {
	name: "chooseCharacter",
	type: "image",
	src: "res/e/special_003.png"
},
//地图
{
	name: "map0",
	type: "tmx",
	src: "res/w/c/0/map.json"
}, {
	name: "map1",
	type: "tmx",
	src: "res/w/c/1/map.tmx"
}, {
    name: 'map_blank',
    type: "image",
    src: "res/w/c/1/1.png"
},
//副本
{
	name: "id0",
	type: "tmx",
	src: "res/w/id/0/id0.tmx"
},
{
	name: "id_bg0",
	type: "image",
	src: "res/w/id/0/id_bg0.png"
},

//地砖
{
	name: "water",
	type: "image",
	src: "res/w/t/water.png",
    save : 1
}, {
	name: "land",
	type: "image",
	src: "res/w/t/land.png",
    save : 1
}, {
	name: "land2",
	type: "image",
	src: "res/w/t/land2.png",
    save : 1
}, {
	name: "tiled_collision",
	type: "image",
	src: "res/w/t/tiled_collision.png",
    save : 1
},

//商店、树、房子等
{
	name: "dbwj1",
	type: "image",
	src: "res/w/o/dbwj1.png",
    save : 1
}, {
	name: "dbwj2",
	type: "image",
	src: "res/w/o/dbwj2.png",
    save : 1
}, {
	name: "dbwj3",
	type: "image",
	src: "res/w/o/dbwj3.png"
}, {
	name: "dbwj4",
	type: "image",
	src: "res/w/o/dbwj4.png"
}, {
	name: "house1",
	type: "image",
	src: "res/w/o/house1.png"
}, {
	name: "house2",
	type: "image",
	src: "res/w/o/house2.png"
}, {
	name: "house3",
	type: "image",
	src: "res/w/o/house3.png"
}, {
	name: "house4",
	type: "image",
	src: "res/w/o/house4.png"
}, {
	name: "house5",
	type: "image",
	src: "res/w/o/house5.png"
}, {
	name: "mountain1",
	type: "image",
	src: "res/w/o/mountain1.png"
}, {
	name: "mountain2",
	type: "image",
	src: "res/w/o/mountain2.png"
}, {
	name: "mountain3",
	type: "image",
	src: "res/w/o/mountain3.png"
}, {
	name: "mountain",
	type: "image",
	src: "res/w/o/mountain.png",
    save : 1

}, {
	name: "shu1",
	type: "image",
	src: "res/w/o/shu1.png"
}, {
	name: "smithy",
	type: "image",
	src: "res/w/o/smithy.png"
}, {
	name: "teahouse",
	type: "image",
	src: "res/w/o/teahouse.png"
}, {
	name: "shop",
	type: "image",
	src: "res/w/o/shop.png"
}, {
	name: "house6",
	type: "image",
	src: "res/w/o/house6.png"
}, {
	name: "house7",
	type: "image",
	src: "res/w/o/house7.png"
}, {
	name: "house8",
	type: "image",
	src: "res/w/o/house8.png"
}, {
	name: "louti2",
	type: "image",
	src: "res/w/o/louti2.png"
}, {
	name: "louti3",
	type: "image",
	src: "res/w/o/louti3.png"
}, {
	name: "bridge",
	type: "image",
	src: "res/w/o/bridge.png"
}, {
	name: "bridge1",
	type: "image",
	src: "res/w/o/bridge1.png"
}, {
	name: "boat1",
	type: "image",
	src: "res/w/o/boat1.png"
}, {
	name: "id_items1",
	type: "image",
	src: "res/w/o/id_items1.png"
},

//角色
{
	name: "character0",
	type: "image",
	src: "res/c/0/0.png"
}, {
	name: "character1",
	type: "image",
	src: "res/c/1/1.png"
}, {
	name: "character20",
	type: "image",
	src: "res/c/20/20.png"
}, {
	name: "character21",
	type: "image",
	src: "res/c/21/21.png"
}, {
	name: "character22",
	type: "image",
	src: "res/c/22/22.png"
}, {
	name: "symbol",
	type: "image",
	src: "res/c/symbol.png"
},

//海盗船
{
	name: "pirateBoat0",
	type: "image",
	src: "res/p/0/0.png"
}, {
	name: "pirateBoat1",
	type: "image",
	src: "res/p/1/1.png"
}, {
	name: "pirateBoat2",
	type: "image",
	src: "res/p/2/2.png"
}, {
	name: "pirateBoat3",
	type: "image",
	src: "res/p/3/3.png"
}, {
	name: "pirateBoat4",
	type: "image",
	src: "res/p/4/4.png"
}, {
	name: "pirateBoat5",
	type: "image",
	src: "res/p/5/5.png"
}, {
	name: "pirateBoat6",
	type: "image",
	src: "res/p/6/6.png"
}, {
	name: "pirateBoat300",
	type: "image",
	src: "res/p/300/300.png"
},

//logo
{
	name: "logo",
	type: "image",
	src: "res/ui/ci/0/0_bust.png"
},
 
//城市传送
{
	name: "seaport_000",
	type: "image",
	src: "res/e/seaport_000.png"
}, {
	name: "seaport_001",
	type: "image",
	src: "res/e/seaport_001.png"
},

//特效
{
	name: "fire_001",
	type: "image",
	src: "res/e/fire_001.png"
}, {
	name: "click_000",
	type: "image",
	src: "res/e/click_000.png"
}, {
	name: "click_001",
	type: "image",
	src: "res/e/click_001.png"
},

//UI
{
	name: "0_buff",
	type: "image",
	src: "res/ui/ci/0/0_buff.png"
}, {
	name: "fi_anger_center",
	type: "image",
	src: "res/ui/layout/f/fi_anger_center.png"
}, {
	name: "fi_anger_left",
	type: "image",
	src: "res/ui/layout/f/fi_anger_left.png"
}, {
	name: "fi_anger_right",
	type: "image",
	src: "res/ui/layout/f/fi_anger_right.png"
}, {
	name: "fi_life_bg",
	type: "image",
	src: "res/ui/layout/f/fi_life_bg.png"
}, {
	name: "fi_life_center",
	type: "image",
	src: "res/ui/layout/f/fi_life_center.png"
}, {
	name: "fi_life_left",
	type: "image",
	src: "res/ui/layout/f/fi_life_left.png"
}, {
	name: "fi_life_right",
	type: "image",
	src: "res/ui/layout/f/fi_life_right.png"
}, {
	name: "fi_magic_bg",
	type: "image",
	src: "res/ui/layout/f/fi_magic_bg.png"
}];// 地图资源
/*
(function() {
	var count = 1;
	for(var i = 0 ; i < g_config.map.level.length ; i++) {
		count = 1;
		if(g_config.map.level[i].mapData) {
			for(var j = 0 ; j < g_config.map.level[i].mapData.length ; j++) {
				for(var k = 0 ; k < g_config.map.level[i].mapData[j].length ; k++) {
					if(g_config.map.level[i].mapData[j][k] != 0) {
						g_resources.push({
							name: "map" + i + "_" + count,
							type: "image",
							src: "res/w/c/" + i + "/" + count + ".png"
						});
					}
					count++;
				}
			}
		}
	}
})();
    */