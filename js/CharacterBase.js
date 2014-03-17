/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-01-23
 * Description: CharacterBase
 */
(function(btg) {
	btg.CharacterBase = me.ObjectEntity.extend({
		isMe: false,
		pirateBoatId: 0,
		boatMode: false,
		isTalkToNpc: false,
		isTalking: false,
		visible: true,
		alive: true,
		currentScene: "city",	//city id-副本
		pirateBoat: null,
		pirateBoats: [],		//玩家拥有海盗船
		mainBoatId: 0,
		fight: null,
		formation: null,
		
		_scale: 0.5,
		
		gotoEffect: null,
		
		/**
		 * 角色屬性
		 */
		id: 0,					//角色Id
		cId: 0,					//所选角色
		level: 1,				//角色等级
		nickname: "水神",		//角色名称
		maxEnergy: 0,			//精力上限
		energy: 0,				//当前精力值
		getEnergySpeed: 0,		//精力回复速度,表示每小时回复的精力数目
		speed: 0,				//移动速度
		lucky: 0,				//幸运
		life: 100,				//耐久,生命值
		powerful: 0,			//影响攻击出手先后
		attack: 0,				//普通攻击伤害
		skillHurt: 0,			//技能攻击伤害
		weaponDef: 0,			//物理防御,对物理类型攻击的减免
		fireDef: 0,				//火焰防御,对火焰类型攻击的减免
		crit: 0,				//暴击,暴击几率和暴击之后造成的额外伤害
		parry: 0,				//格挡,格挡几率和格挡之后减免的额外伤害
		hit: 0,					//命中,命中和暴击的几率
		dodge: 0,				//闪避,闪避和格挡的几率
		currentExp: 100,		//玩家在当前等级获取的经验值
		needExp: 100,			//玩家升到下一级所需要的经验值
		
		money: 100,				//游戏币
		gameCurrency: 100,		//元宝
		
		buff: [],				//增益效果
		
		_self: null,
		shadowImg: null,
		
		path: null,
		linePoint: [],
		currentPos: null,
		nextPos: null,
		_updated: false,
		x: 0,
		y: 0,
		direction: "down",
		animation: "down",
		init: function(x, y, settings) {
			// call the parent constructor
			this.shadowImg = me.loader.getImage("shadow");
			this.parent(x, y, settings);

			// set the walking speed
			this.setVelocity(10, 10);

			//摩擦力
			this.setFriction(0.1, 0.1);

			// adjust the bounding box
			this.updateColRect(18, 46, -1, 0);
			this.photo = "./res/ui/ci/" + this.cId + "/" + this.cId + "_photo.png",
			
			this.waitTime = 55000;
			this.timer = 0;

			// disable gravity
			this.gravity = 0;

			this.firstUpdates = 2;
			this.direction = "down";
			this.animation = "down";
			this.destinationX = x;
			this.destinationY = y;

            this.cos225 = Math.cos(22.5 * Math.PI * 2 / 360);
            this.animationspeed = 3;
            this.motionState = 'stop';
            this.moveSpeed = 6;
            this.pathChanged = false;
            this.allDirVec = {
                'up'		: { x : 0, y : -1},
                'down'		: { x : 0, y : 1},
                'right'		: { x : 1, y : 0},
                'left'		: { x : -1,y : 0},
                'rightdown'	: { x : 1, y : 1},
                'leftup'	: { x : -1, y : -1},
                'rightup'	: { x : 1, y : -1},
                'leftdown'	: { x : -1, y : 1}
            };
			
			this.__defineGetter__("curX", function() {
				return this.pos.x + this.width / 2;
			});
			this.__defineGetter__("curY", function() {
				return this.pos.y + this.height;
			});
			
			if(this.boatMode) {
				this.renderable.resize(this._scale);
				this.initBoatAnimation(x, y, settings);
			} else {
				this.initAnimation(x, y, settings);
			}
		},
		
		initAnimation: function (x, y, settings) {
			var characterId = settings.image.replace("character", "");

            this.animationspeed = 3;
			//this.renderable = this;
			this.renderable.addAnimation("stand-down", g_config.character[characterId].standDown);
			this.renderable.addAnimation("stand-left", g_config.character[characterId].standLeft);
			this.renderable.addAnimation("stand-up", g_config.character[characterId].standUp);
			this.renderable.addAnimation("stand-right", g_config.character[characterId].standRight);
			this.renderable.addAnimation("stand-leftdown", g_config.character[characterId].standLeftDown);
			this.renderable.addAnimation("stand-leftup", g_config.character[characterId].standLeftUp);
			this.renderable.addAnimation("stand-rightup", g_config.character[characterId].standRightUp);
			this.renderable.addAnimation("stand-rightdown", g_config.character[characterId].standRightDown);
			this.renderable.addAnimation("down", g_config.character[characterId].down);
			this.renderable.addAnimation("left", g_config.character[characterId].left);
			this.renderable.addAnimation("up", g_config.character[characterId].up);
			this.renderable.addAnimation("right", g_config.character[characterId].right);
			this.renderable.addAnimation("leftdown", g_config.character[characterId].leftDown);
			this.renderable.addAnimation("leftup", g_config.character[characterId].leftUp);
			this.renderable.addAnimation("rightup", g_config.character[characterId].rightUp);
			this.renderable.addAnimation("rightdown", g_config.character[characterId].rightDown);
		},
		
		initBoatAnimation: function (x, y, settings) {
			var boadId = this.mainBoatId;

            this.animationspeed = 3;
			//this.renderable = this;
			this.renderable.addAnimation("stand-down", g_config.pirateBoat[boadId].standDown);
			this.renderable.addAnimation("stand-left", g_config.pirateBoat[boadId].standLeft);
			this.renderable.addAnimation("stand-up", g_config.pirateBoat[boadId].standUp);
			this.renderable.addAnimation("stand-right", g_config.pirateBoat[boadId].standRight);
			this.renderable.addAnimation("stand-leftdown", g_config.pirateBoat[boadId].standLeftDown);
			this.renderable.addAnimation("stand-leftup", g_config.pirateBoat[boadId].standLeftUp);
			this.renderable.addAnimation("stand-rightup", g_config.pirateBoat[boadId].standRightUp);
			this.renderable.addAnimation("stand-rightdown", g_config.pirateBoat[boadId].standRightDown);
			this.renderable.addAnimation("down", g_config.pirateBoat[boadId].down);
			this.renderable.addAnimation("left", g_config.pirateBoat[boadId].left);
			this.renderable.addAnimation("up", g_config.pirateBoat[boadId].up);
			this.renderable.addAnimation("right", g_config.pirateBoat[boadId].right);
			this.renderable.addAnimation("leftdown", g_config.pirateBoat[boadId].leftDown);
			this.renderable.addAnimation("leftup", g_config.pirateBoat[boadId].leftUp);
			this.renderable.addAnimation("rightup", g_config.pirateBoat[boadId].rightUp);
			this.renderable.addAnimation("rightdown", g_config.pirateBoat[boadId].rightDown);
		},

        moveByPath : function(path) {
            this.path = path || [];
            this.pathChanged = true;
        },
		
		update: function(character) {
            if(this.pathChanged) {
                this.pathChanged = false;
                // 计算移动的角度(360度范围)
                var lastPos = this.nextPos;
                this.nextPos = this.path.shift();
                if(this.nextPos) {
                    this.nextPos.x -= this.width / 2;
                    this.nextPos.y -= 100;
                    //this.accel.set(this.nextPos.x - this.pos.x, this.nextPos.y - this.pos.y);
                    this.accel.normalize(); // 方向单位化
                    this.motionState = 'run';

                    // 计算 animate direction
                    for(var dir in this.allDirVec) {
                        var a = this.accel.x;
                        var b = this.accel.y;
                        var c = this.allDirVec[dir].x;
                        var d = this.allDirVec[dir].y;
                        var angle = (a * c + b * d) / (Math.sqrt(a * a + b * b) * Math.sqrt(c * c + d * d));
                        if(angle <= 1 && angle >= this.cos225) {
                            this.direction = dir;
                            break;
                        }
                    }
                } else {
                    this.motionState = 'stop';
                }
            }

            if(this.motionState === 'run') {
                // set move vel
                this.vel.set(this.moveSpeed * this.accel.x * me.sys.fps/me.timer.fps, this.moveSpeed * this.accel.y * me.sys.fps/me.timer.fps);
                this.follow();

                // 设置动作
                this.renderable.setCurrentAnimation(this.direction);
            } else {
				if(this.isTalkToNpc) {
					if(!this.isTalking) {
						var dialogueScene = new UI.DialogueScene(btg.mainPlayer.currentMainTask.taskTalk);
						dialogueScene.init();
						this.isTalking = true;
					}
				}
                this.vel.set(0, 0);
                this.renderable.setCurrentAnimation('stand-' + this.direction);
                this._updated = true;
            }

            if(this.motionState === 'run') {
                // 检查目的是否到达nextPos
                // try move
                var lastFramePos = { x : this.pos.x, y : this.pos.y };
                this.pos.add(this.vel);
                var nowAccel = new me.Vector2d(this.nextPos.x-this.pos.x, this.nextPos.y-this.pos.y);
                if(nowAccel.dotProduct(this.accel) <= 0) {

                    // 控制进入下一段
                    this.pathChanged = true;
                    //this.pos.set(this.nextPos.x, this.nextPos.y);
                }
            }

            if (this._updated || character) {
                this.parent(this);
            }
            return this._updated;
		},
		
		/**
		 * 移动摄像头
		 */
		follow: function() {
			//錨點左上角
			me.game.viewport.reset(
				this.pos.x - me.video.getWidth() / 2 + this.width / 2,
				this.pos.y - me.video.getHeight() / 2 + this.height / 2
			);
		},
		
		setBoat: function() {
			var boatId = 0;
			this.renderable.image = me.loader.getImage("pirateBoat" + boatId);
			this.renderable.spritewidth = g_config.pirateBoat[boatId].width;
			this.renderable.spriteheight = g_config.pirateBoat[boatId].height;
			this.renderable.resize(0.5);
			this.boatMode = true;
		},

		draw: function(context) {
			this.drawCharactorName(context, "水神");
			this.parent(context);
		},
		
		drawCharactorName: function(context, name) {
			var pos = btg.getScreenXY(this.pos);
			btg.drawFont(context, name, pos.x, pos.y, this, "center");
			/*context.shadowColor = "black";
			context.shadowBlur = 20;
			context.shadowOffsetX = 10;
			context.shadowOffsetY = 10;*/
			pos = null;
		},

		
		_draw: function(context) {
			// do nothing if we are flickering
			if (this.flickering) {
				this.flickerState = !this.flickerState;
				if (!this.flickerState)
					return;
			}

			var xpos = ~~(this.pos.x - this.vp.pos.x), ypos = ~~(this.pos.y - this.vp.pos.y);

			if ((this.scaleFlag) || (this.angle!==0)) {
				// restore the context
				context.save();
				// calculate pixel pos of the anchor point
				var ax = this.width * this.anchorPoint.x, ay = this.height * this.anchorPoint.y;
				// translate to the defined anchor point
				context.translate(xpos + ax, ypos + ay);
				// scale
				if (this.scaleFlag)
					context.scale(this.scale.x, this.scale.y);
				if (this.angle!==0)
					context.rotate(this.angle);
				// reset coordinates back to upper left coordinates
				xpos = -ax;
				ypos = -ay;
			}

			context.drawImage(this.image,
							this.offset.x, this.offset.y,
							this.width, this.height,
							xpos, ypos,
							this.width, this.height);
			context.drawImage(this.shadowImg,
							this.offset.x, this.offset.y,
							this.width, this.height,
							xpos, ypos,
							this.width, this.height);

			if ((this.scaleFlag) || (this.angle!==0)) {
				// restore the context
				context.restore();
			}

			if (me.debug.renderHitBox) {
				// draw the sprite rectangle
				this.parent(context, "blue");
				// draw the collisionBox
				this.collisionBox.draw(context, "red");
			}
		}
	});
})(btg);