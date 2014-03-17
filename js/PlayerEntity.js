/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-01-28
 * Description: 玩家實體類
 */
(function(btg) {
	btg.PlayerEntity = btg.CharacterBase.extend({
		init: function (x, y, settings, cId, boatMode, pId) {
			this.isMe = true;
			this.cId = cId;
			if(boatMode) {
				this.boatMode = boatMode;
				this.mainBoatId = pId;
				settings.image = "pirateBoat" + this.mainBoatId;
				this.boatImg = me.loader.getImage(settings.image);
				settings.spritewidth = this.boatImg.width;
				settings.spriteheight = this.boatImg.height;
			} else {
				this.boatMode = false;
				settings.image = "character" + this.cId;
				settings.spritewidth = g_config.character[btg.character.cId].width;
				settings.spriteheight = g_config.character[btg.character.cId].height;
			}
			
			// call the parent constructor
			this.parent(x, y - settings.spriteheight / 2, settings);

			// set the display to follow our position on both axis
			// me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
			this.follow();
			
			if(boatMode) {
				
			} else {
				btg.createMainPlayer(this);
			}
		},
		
		update: function(character) {
			if(this.boatMode && btg.map.style == "orthogonal") {
				// check for collision
				var res = me.game.collide(this);
				
				if(res) {
					// if we collide with an enemy
					if(res.obj.type == me.game.ENEMY_OBJECT) {
						this.goToFight();
					}
				}
			}
			this.parent(this);
			if(this.pos.x > btg.game.currentMap.seaport.pos.x - btg.game.currentMap.seaport.width && this.pos.x < btg.game.currentMap.seaport.pos.x + btg.game.currentMap.seaport.width
				&& this.pos.y > btg.game.currentMap.seaport.pos.y - btg.game.currentMap.seaport.width && this.pos.y < btg.game.currentMap.seaport.pos.y + btg.game.currentMap.seaport.width) {
				this.goToCity();
			}
		},
		
		/**
		 * 去其它城市
		 */
		goToCity: function() {
			seaking.unregisterEvent(btg.getScreenRect());
			btg.mainPlayer.pirateBoat = new btg.PirateBoat(btg.mainPlayer.pos.x, btg.mainPlayer.pos.y, me.ObjectSettings, true, btg.character.cId, btg.mainPlayer.mainBoatId);
			btg.mainPlayer.pirateBoat.z = btg.map.playerLayerZ;
			btg.mainPlayer.pirateBoat.renderable.setCurrentAnimation("standDown");
			btg.mainPlayer.pirateBoat.gravity = 0.98;
			btg.mainPlayer.pirateBoat.setVelocity(6, 6);
			btg.mainPlayer.boatMode = true;
			me.game.add(btg.mainPlayer.pirateBoat, btg.map.playerLayerZ);
			//this.visible = false;
			me.game.remove(this);
			me.game.sort();
		},
		
		/**
		 * 进入副本
		 */
		goToInstanceDungeon: function() {
			seaking.unregisterEvent(btg.getScreenRect());
			me.game.viewport.fadeIn("#000000", 1000, function(e) {
				seaking.gotoIdLevel(0);
			});
		},
		
		/**
		 * 進入戰鬥場景
		 */
		goToFight: function() {
			var _self = this;
			_self.visible = false;
			seaking.unregisterEvent(btg.getScreenRect());
			if(!btg.game.isFight) {
				UI.mainScene.hide();
				btg.game.boatMode = true;
				btg.game.isFight = true;
				me.game.viewport.fadeIn("#000000", 1000, function(e) {
					if(!btg.mainPlayer.fight) {
						me.game.viewport.reset(g_config.map.level[btg.game.currentLevel].fightSceneX, g_config.map.level[btg.game.currentLevel].fightSceneY);
						btg.enemy = new btg.EnemyEntity(_self.pos.x, _self.pos.y, me.ObjectSettings, 0);
						//me.game.remove(_self);
						UI.loading(_self.createFight, ui_resources.fightScene);
						//btg.mainPlayer.fight = new btg.Fight(btg.mainPlayer, btg.enemy);
					}
				});	
			}
		},
		
		createFight: function() {
			UI.fightScene.createScene();
			btg.mainPlayer.fight = new btg.Fight(btg.mainPlayer, btg.enemy);
		},
		
		/**
		 * 离开战斗场景
		 */
		quitFight: function() {
			var _self = this;
			_self.visible = true;
			seaking.registerEvent(btg.getScreenRect());
			if(btg.game.isFight) {
				UI.fightScene.hide();
				btg.game.boatMode = false;
				btg.game.isFight = false;
				me.game.viewport.fadeIn("#000000", 1000, function(e) {
					if(btg.mainPlayer.fight) {
						_self.follow();
						UI.mainScene.show();
						btg.mainPlayer.fight.removeAll();
						btg.mainPlayer.fight = null;
					}
				});
			}
		}
	});
})(btg);