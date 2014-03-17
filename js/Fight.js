/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-03-03
 * Description: 战斗
 */
(function(btg) {
	btg.Fight = me.ObjectEntity.extend({
		player: null,
		enemy: null,
		fightSceneX: 0,
		fightSceneY: 0,
		player_formation: null,
		enemy_formation: null,
		init: function(player, enemy) {
			this.player = player;
			this.enemy = enemy;
			this.fightSceneX = g_config.map.level[btg.game.currentLevel].fightSceneX;
			this.fightSceneY = g_config.map.level[btg.game.currentLevel].fightSceneY;
			
			this.fpscount = 0;
			this.animationspeed = 6;
			this.animationpause = false;
			this.currentFight = {};
			this.attackSide = "left";
			this.defenseSide = "right";
			
			this.leftRound = 0;
			this.rightRound = 0;
			
			this.fightData = [{
				attackSide: "left",
				attackData: {
					fId: 0
				},
				defenseData: {
					fId: 0
				}
			}, {
				attackSide: "right",
				attackData: {
					fId: 1
				},
				defenseData: {
					fId: 1
				}
			}, {
				attackSide: "left",
				attackData: {
					fId: 2
				},
				defenseData: {
					fId: 2
				}
			}, {
				attackSide: "right",
				attackData: {
					fId: 0
				},
				defenseData: {
					fId: 0
				}
			}, {
				attackSide: "left",
				attackData: {
					fId: 1
				},
				defenseData: {
					fId: 1
				}
			}, {
				attackSide: "right",
				attackData: {
					fId: 2
				},
				defenseData: {
					fId: 2
				}
			}, {
				attackSide: "left",
				attackData: {
					fId: 0
				},
				defenseData: {
					fId: 0
				}
			}, {
				attackSide: "right",
				attackData: {
					fId: 1
				},
				defenseData: {
					fId: 1
				}
			}, {
				attackSide: "left",
				attackData: {
					fId: 2
				},
				defenseData: {
					fId: 2
				}
			}];
			
			this.createFormation(false);
			
			me.game.add(this, 999);
		},
		
		createFormation: function(isCanvasPosition) {
			var x, y;
			if(isCanvasPosition) {
				x = 0;
				y = 0;
			} else {
				x = me.game.viewport.pos.x;
				y = me.game.viewport.pos.y;
			}
			this.player_formation = new btg.Formation(
				"left",
				x,
				y
			);
			this.player_formation.createFormation(this.player.formation);
			
			this.enemy_formation = new btg.Formation(
				"right",
				x,
				y
			);
			this.enemy_formation.createFormation(this.enemy);
			
			me.game.sort();
			me.game.viewport.reset(this.fightSceneX, this.fightSceneY);
		},
		
		update: function() {
			if(!btg.game.isFight || this.fightData == null || this.fightData.length == 0)
				return false;
			if(this.visible && !this.animationpause && (this.fpscount++ > this.animationspeed)) {
				this.fpscount = 0;
				this.currentFight = this.fightData.shift();
				if(this.currentFight.attackSide == "left") {
					this.attackSide = this.player_formation;
					this.defenseSide = this.enemy_formation;
					this.leftRound++;
					UI.fightScene.updateLeftRound(this.leftRound);
				} else {
					this.attackSide = this.enemy_formation;
					this.defenseSide = this.player_formation;
					this.rightRound++;
					UI.fightScene.updateRightRound(this.rightRound);
				}
				//进攻方
				this.attackSide.boats["p" + this.currentFight.attackData.fId].addEffectName(20, "blue", "攻击+20");
				this.attackSide.boats["p" + this.currentFight.attackData.fId].addBuff();
				
				//防守方
				this.defenseSide.boats["p" + this.currentFight.defenseData.fId].subLife(20);
				this.defenseSide.boats["p" + this.currentFight.defenseData.fId].addEffectName(20, "red", "命中-10");
				this.defenseSide.boats["p" + this.currentFight.defenseData.fId].addAnger(10);
				this.defenseSide.boats["p" + this.currentFight.defenseData.fId].shakeBoat();
				this.defenseSide.boats["p" + this.currentFight.defenseData.fId].addEffect("fire_001");
				
				return true;
			}
		},
		
		/**
		 * 删除战斗场景
		 */
		removeAll: function() {
			
		},
		
		draw: function(context) {
			
		},
		
		fight: function() {
			
		}
	});
})(btg);