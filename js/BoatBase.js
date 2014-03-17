/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-02-05
 * Description: 海盜船基礎類
 */
(function(btg) {
	btg.BoatBase = me.ObjectEntity.extend({
		cId: 0,
		boatId: 0,
		isFight: false,
		visible: true,
		alive: true,
		formationPosition: 0,
		font: null,
		lifeProgress: null,
		angerProgress: null,
		layer: 0,
		boatImg: null,
		context: null,
		effect: null,
		x: 0,
		y: 0,
		shakeCount: 0,
		shakeTween: [],
		fontName: "微软雅黑 bold",
		fontSize: 14,
		fontColor: "white",
		effectName: "",
		_scale: 0.5,//缩放
		marginTop: 0,//缩放后调整位置
		
		/**
		 * 战舰属性
		 */
		boatName: "隐形战舰",	//战舰名称 字符串，最多5个汉字（10个英文字母，即10个字符）
		boatLevel: 0, 			//战舰等级 Int型，最多2位数字。
		currentLife: 100,		//耐久	Int型，最多6位数字。生命值
		life: 100,				//耐久上限	Int型，最多6位数字。生命值
		maxAnger: 150,			//填充时间	Int型，最多3位数字。怒气上限
		fullAnger: 100,			//怒气满
		currentAnger: 0,		//已填充	Int型，最多3位数字。当前怒气值。
		attack: 100, 			//普通攻击	Int型，最多5位数字。普通攻击伤害。
		attackType: 1,			//普通攻击类型	1 - 物理伤害 2 - 火焰伤害
		skillHurt: 100,			//技能攻击	Int型，最多5位数字。技能攻击伤害。
		skillHurtType: 1,		//技能攻击类型	1 - 物理伤害 2 - 火焰伤害
		weaponDef: 1,			//物理防御	Int型，最多5位数字。对物理类型攻击的减免
		fireDef: 1,				//火焰防御	Int型，最多5位数字。对火焰类型攻击的减免
		actionSpeed:1,			//动力	Int型，最多6位数字。影响攻击出手先后
		crit: 1,				//暴击	Int型，最多5位数字。暴击几率和暴击之后造成的额外伤害
		parray: 1,				//格挡	Int型，最多5位数字。格挡几率和格挡之后减免的额外伤害
		hit: 1,					//命中	Int型，最多5位数字。命中和暴击的几率
		dodge: 1,				//闪避	Int型，最多5位数字。闪避和格挡的几率
		
		buff: null,
		
		fightData: null,

		init: function(x, y, settings) {
			if(typeof this.boatId == "undefined") {
				this.boatId = 0;
			}
			settings.image = "pirateBoat" + this.boatId;
			this.boatImg = me.loader.getImage(settings.image);
			settings.spritewidth = this.boatImg.width;
			settings.spriteheight = this.boatImg.height;
			// call the parent constructor
			x = x - this.boatImg.width / 4;
			
			this.parent(x, y, settings);
			
			this.renderable.resize(this._scale);
			this.marginTop = this.hHeight / 4;
			
			// set the walking speed
			this.setVelocity(0, 0);
			
			this.x = x;
			this.y = y;

			//摩擦力
			this.setFriction(0.1, 0.1);
			
			this.initAnimation(x, y, settings);
			
			if(!this.isFight) {
				this.addLifeProgress(100);
				this.visible = true,
				this.alive = true,
				this.setVelocity(6, 6);
				// make it collidable
				this.collidable = true;
				this.startX = x;
				this.endX = x + 200;
				this.pos.x = x + settings.width - settings.spritewidth;
				this.walkLeft = true;
			} else {
				this.addLifeProgress();
				this.addAngerProgress();
			}
			//this.addEffect("fire_001");
			//this.shakeBoat();
			//this.addEffectName(20, "green", "回复");
			//this.addBuff();
		},
		
		initAnimation: function (x, y, settings) {
			this.renderable.animationspeed = me.sys.fps / 10;
			this.renderable.addAnimation("standDown", g_config.pirateBoat[this.boatId].standDown);
		},
		
		update: function (boat) {
			if(!this.isFight) {
				if(!this.visible)
					return false;
				
				if(this.alive) {
					if(this.walkLeft && this.pos.x <= this.startX) {
						this.walkLeft = false;
					} else if(!this.walkLeft && this.pos.x >= this.endX) {
						this.walkLeft = true;
					}
					// make it walk
					this.flipX(this.walkLeft);
					this.vel.x += (this.walkLeft) ? -this.accel.x * me.timer.tick : this.accel.x * me.timer.tick;
				} else {
					this.vel.x = 0;
				}
				
				// check and update movement
				this.updateMovement();
				
				// update animation if necessary
				if(this.vel.x != 0 || this.vel.y != 0) {
					// update object animation
					this.parent(this);
					return true;
				}
			} else {
				//this.updateShake();
				/*if(this.fightData.addAngerNum > 0) {
					this.addAnger(this.fightData.addAngerNum);
				}*/
				updated = this.updateMovement();
				if (updated || boat) {
					this.parent(this);
				}
				return updated;
			}
		},
		
		onCollision: function(res, obj) {
			
		},
		
		gotoPlace: function() {
			
		},
		
		updateShake: function() {
			if(this.shakeCount >= 6) {
				this.pos.x = this.x;
				this.pos.y = this.y;
				this.shakeCount = 0;
			} else {
				x = Number.prototype.random(this.pos.x - 10, this.pos.x + 10);
				y = Number.prototype.random(this.pos.y - 10, this.pos.y + 10);
				this.pos.x = x;
				this.pos.y = y;
				this.shakeCount++;
			}
		},
		
		/**
		 * 文字描述
		 */
		addBoatName: function(context, text) {
			var font = btg.game.font.defaultFont.measureText(context, text);
			var pos = btg.getScreenXY(new me.Vector2d(
				this.pos.x + this.hWidth - font.width / 2, this.pos.y + this.marginTop - font.height
			));
			btg.game.font.defaultFont.draw(context, text, pos.x, pos.y);
			font = null;
			pos = null;
		},
		
		/**
		 * 特效文字描述
		 */
		addEffectName: function(size, color, effectName, fontName) {
			if(fontName) {
				this.fontName = fontName;
			}
			this.fontSize = size;
			this.fontColor = color;
			this.effectName = effectName;
		},
		
		/**
		 * 生命條
		 */
		addLifeProgress: function() {
			this.lifeProgress = new btg.ProgressEntity(this, me.ObjectSettings, "life");
			me.game.add(this.lifeProgress, this.layer + 10);
		},
		
		/**
		 * 增加生命数值
		 */
		addLife: function(value) {
			this.currentLife += value;
			if(this.currentLife >= this.life) {
				this.currentLife = this.life;
			}
		},
		
		/**
		 * 减少生命数值
		 */
		subLife: function(value) {
			this.currentLife -= value;
			if(this.currentLife <= 0) {
				this.currentLife = 0;
			}
		},
		
		/**
		 * 怒氣條
		 */
		addAngerProgress: function() {
			this.angerProgress = new btg.ProgressEntity(this, me.ObjectSettings, "anger");
			me.game.add(this.angerProgress, this.layer + 10);
		},
		
		/**
		 * 增加怒气数值
		 */
		addAnger: function(value) {
			this.currentAnger += value;
			if(this.currentAnger >= this.maxAnger) {
				this.currentAnger = this.maxAnger;
			}
		},
		
		/**
		 * 减少怒气数值
		 */
		subAnger: function(value) {
			this.currentAnger -= value;
			if(this.currentAnger <= 0) {
				this.currentAnger = 0;
			}
		},
		
		/**
		 * 更新进度条
		 */
		updateProgress: function(type, value) {
			if(type == "life") {
				this.currentLife += value;
			} else {
				this.currentAnger += value;
			}
		},
		
		/**
		 * 加特效
		 */
		addEffect: function(effectName) {
			this.effect = new btg.Effect(this, effectName, me.ObjectSettings);
			me.game.add(this.effect, this.layer + 20);
		},
		
		/**
		 * add buff
		 */
		addBuff: function() {
			this.buff = new btg.Buff(this, me.ObjectSettings);
			me.game.add(this.buff, this.layer);
			this.buff.alpha = 1;
			var tween = new me.Tween(this.buff).to({alpha: 0}, 1000).onComplete(function() {
				
			});
			tween.chain(new me.Tween(this.buff).to({alpha: 1}, 1000).onComplete(function() {
				
			}).chain(tween));
			tween.start();
			me.game.sort();
		},
		
		/**
		 * 震动船只
		 */
		shakeBoat: function() {
			var x = this.pos.x;
			var y = this.pos.y;
			for(var i = 0 ; i < 10 ; i++) {
				if(i == 9) {
					x = this.x;
					y = this.y;
				} else {
					x = Number.prototype.random(this.pos.x - 10, this.pos.x + 10);
					y = Number.prototype.random(this.pos.y - 10, this.pos.y + 10);
				}
				this.shakeTween[i] = new me.Tween(this.pos).to({x: x, y: y}, 100);
				if(i > 0) {
					this.shakeTween[i - 1].chain(this.shakeTween[i]);
				}
			}
			this.shakeTween[0].start();
		},
		
		/**
		 * 战斗逻辑
		 */
		fight: function() {
			
		},
		
		/**
		 * 绘制逻辑
		 */
		draw: function(context) {
			this.addBoatName(context, this.boatName);
			if(this.effectName != "") {
				if(!this.font) {
					this.font = new btg.Font(context, this);
				}
				this.font.drawFont(context);
			}
			this.parent(context);
		}
	})
})(btg);