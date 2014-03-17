/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-03-04
 * Description: 阵型
 */
(function(btg) {
	btg.Formation = Object.extend({
		cId: 0,
		formation_bg: null,
		type: {
			left: "mainPlayer",
			right: "enemy"
		},//mainPlayer enemy
		x: 0,
		y: 0,
		position: "left",//left right
		formationBG: null,
		boats: {},
		buff: null,
		fightSceneX: 0,
		fightSceneY: 0,
		init: function(position, x, y, type) {
			if(type) {
				this.type = type;
			}
			this.formation_bg = me.loader.getImage("fi_magic_bg");
			this.position = position;
			if(position == "left") {
				this.x = x;
			} else {
				this.x = x + this.formation_bg.width + g_config.formation.bg.marginLeft;
			}
			this.boats = {};
			this.y = y + g_config.formation.bg.top;
			this.fightSceneX = g_config.map.level[btg.game.currentLevel].fightSceneX;
			this.fightSceneY = g_config.map.level[btg.game.currentLevel].fightSceneY;
			
			me.game.add(this, 999);
		},
		
		/**
		 * 創建陣型
		 */
		createFormation: function(formationBoat, flipX) {
			this.createBackground(flipX);
			//阵型
			if(this.position == "left") {
				this.addPirateBoat(formationBoat);
			} else {
				this.addEnemyBoat(formationBoat);
			}
		},
		
		/**
		 * 創建背景
		 */
		createBackground: function(flipX) {
			this.formationBG = new me.SpriteObject(
				this.x,
				this.y,
				this.formation_bg,
				this.formation_bg.width,
				this.formation_bg.height
			);
			if(this.position == "left") {
				this.formationBG.flipX(true);
			}
			me.game.add(this.formationBG, btg.map.fightLayerZ);
		},
		
		/**
		 * 添加船隻
		 */
		addPirateBoat: function(formationBoat) {
			var pirateBoat = null;
			var pId = 0;
			for(var i = 0 ; i < g_config.formation.positions.mainPlayer.length ; i++) {
				if(typeof formationBoat[i] == "object") {
					pId = formationBoat[i].pId;
					pirateBoat = new btg.PirateBoat(
						this.getBoatX("mainPlayer", i, pId),
						this.getBoatY("mainPlayer", i, pId),
						me.ObjectSettings,
						true,
						mainPlayer.cId,
						pId,
						i,
						btg.map.fightLayerZ
					);
					pirateBoat.flipX(true);
					this.boats["p" + i] = pirateBoat;
					me.game.add(pirateBoat, btg.map.fightLayerZ + 10);
				}
			}
		},
		
		/**
		 * 添加敵船
		 */
		addEnemyBoat: function(formationBoat) {
			var enemyBoat = null;
			var isFight = true;
			for(var i = 0 ; i < 3 ; i++) {
				cId = 0;
				pId = i;
				enemyBoat = new btg.EnemyBoat(
					this.getBoatX("enemy", i, pId),
					this.getBoatY("enemy", i, pId),
					me.ObjectSettings,
					isFight,
					cId,
					pId,
					i,
					btg.map.fightLayerZ
				);
				this.boats["p" + i] = enemyBoat;
				me.game.add(enemyBoat, btg.map.fightLayerZ + 10);
			}
		},
		
		getBoatX: function(type, index, pId) {
			return this.formationBG.pos.x + g_config.formation.positions[type][index].x - g_config.pirateBoat[pId].width / 2;
		},
		
		getBoatY: function(type, index, pId) {
			//return this.formationBG.pos.y + g_config.formation.positions[type][index].y - g_config.pirateBoat[pId].height / 2 - g_config.formation.bg.positionHeight / 2;
			return this.formationBG.pos.y + g_config.formation.positions[type][index].y - g_config.pirateBoat[pId].height;
		},
		
		/**
		 * registerEvent
		 */
		registerEvent: function() {
			
		},
		
		update: function (formation) {
			
		},
		
		draw: function(ctx) {
			
		}
	})
})(btg);