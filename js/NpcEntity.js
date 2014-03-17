/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-01-28
 * Description: NPC實體類
 */
(function(btg) {
	btg.NpcEntity = me.ObjectEntity.extend({
		init: function (x, y, settings) {
			this.isNpc = true,
			this.type = "task";//任务Npc
			this.symbol = null;
			this.symbolName = "questionMark-gold";
			this.isHidden = true;	//是否隐藏
			this.count = 0;
			this.direction = "leftdown";
			this.npcId = settings.imageId;
			console.log(this.npcId);
			settings.image = "character" + this.npcId;
			settings.spritewidth = g_config.character[this.npcId].width;
			settings.spriteheight = g_config.character[this.npcId].height;
			var tiled = btg.map.getIsometricTileId(x, y);
			var pos = btg.map.getOrthogonalPosition(tiled.row, tiled.col);
			pos.x -= settings.spritewidth / 2;
			pos.y -= settings.spriteheight / 2;
			
			//任务类型
			for(var i = 0 ; i < g_config.taskType.length ; i++) {
				if(btg.character[g_config.taskType[i]].questNpcId == this.npcId) {
					this.isHidden = false;
					if(btg.character[g_config.taskType[i]].questNpcId.status == 0) {
						this.symbolName = g_config.symbolType.EGOLD;
					} else if(btg.character[g_config.taskType[i]].questNpcId.status == 1) {
						this.symbolName = g_config.symbolType.EGOLD;
					} else if(btg.character[g_config.taskType[i]].questNpcId.status > 1) {
						this.symbolName = g_config.symbolType.QGOLD;
					}
				}
			}
			this.symbolName = g_config.symbolType.EGOLD;
			this.isHidden = false;
			
			// call the parent constructor
			this.parent(pos.x, pos.y, settings);
			
			this.initAnimation();
			if(this.symbolName != "") {
				this.addSymbol(settings);
			}
			if(this.npcId == 20) {
				this.direction = "rightdown";
			}
			this.renderable.setCurrentAnimation("stand-" + this.direction);
		},
		
		initAnimation: function() {
			this.renderable.addAnimation("stand-leftdown", g_config.character[this.npcId].standLeftDown);
			this.renderable.addAnimation("shake-leftdown", g_config.character[this.npcId].shakeLeftDown);
			this.renderable.addAnimation("stand-rightdown", g_config.character[this.npcId].standRightDown);
			this.renderable.addAnimation("shake-rightdown", g_config.character[this.npcId].shakeRightDown);
		},
		
		update: function() {
			if(this.renderable.isCurrentAnimation("stand-" + this.direction)) {
				if (this.visible && !this.animationpause && (this.renderable.fpscount > this.renderable.current.animationspeed)) {
					if(this.renderable.current.idx == this.renderable.current.length - 1) {
						if(this.count == 6) {
							this.renderable.setCurrentAnimation("shake-" + this.direction);
							this.renderable.current.idx = 0;
							this.count = 0;
						}
						this.count++;
					}
				}
			} else {
				if(this.renderable.current.idx == this.renderable.current.length - 1) {
					this.renderable.setCurrentAnimation("stand-" + this.direction);
					this.renderable.current.idx = 0;
				}
			}
			this.parent(this);
		},
		
		draw: function(context) {
			if(this.isHidden)
				return;
			this.parent(context);
		},
		
		addSymbol: function(settings) {
			this.symbol = new btg.NpcSymbolEntity(this);
			me.game.add(this.symbol, settings.z);
			me.game.sort();
		},
		
		drawSymbol: function(context) {
			context.drawImage(this.symbolImg, this.pos.x, this.pos.y);
		}
	});
	
	btg.NpcSymbolEntity = me.ObjectEntity.extend({
		init: function (npcEntity) {
			this.symbol = npcEntity.symbolName;
			this.isHidden = npcEntity.isHidden;	//是否隐藏
			this.tweenDown = null;
			this.tweenUp = null;
			this.num = -4;
			settings = {};
			settings.image = "symbol";
			settings.spritewidth = 36;
			settings.spriteheight = 69;
			this.x = npcEntity.pos.x + npcEntity.width / 2 - settings.spritewidth / 2 - 9;
			this.y = npcEntity.pos.y - settings.spriteheight;
			
			// call the parent constructor
			this.parent(this.x, this.y, settings);
			
			this.initAnimation();
			this.renderable.setCurrentAnimation(this.symbol);
			//this.move();
		},
		
		initAnimation: function() {
			this.renderable.addAnimation("exclamationMark-gold", [0]);
			this.renderable.addAnimation("exclamationMark-gray", [1]);
			this.renderable.addAnimation("questionMark-gold", [2]);
			this.renderable.addAnimation("questionMark-gray", [3]);
		},
		
		changeAnimation: function(animationName) {
			this.renderable.setCurrentAnimation(animationName);
		},
		
		move: function() {
			this.tweenDown = new me.Tween(this.pos).to({y: this.pos.y - 10}, 1000).onComplete(function() {
				
			});
			this.tweenUp = new me.Tween(this.pos).to({y: this.pos.y + 10}, 1000).onComplete(function() {
				
			});
			this.tweenDown.chain(this.tweenUp.chain(this.tweenDown));
			this.tweenDown.start();
		},
		
		update: function() {
			if (this.visible && !this.animationpause && (this.renderable.fpscount > this.renderable.current.animationspeed)) {
				this.pos.y += this.num;
				if(this.pos.y <= this.y - 10 || this.pos.y >= this.y + 10)
					this.num = -this.num;
			}
			this.parent(this);
		},
		
		draw: function(context) {
			if(this.isHidden) {
				return;
			}
			this.parent(context);
		}
	});
})(btg);